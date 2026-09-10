import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

function errorPage(message: string, url: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:#160f24;color:#eee;
      display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
    .box{max-width:520px;padding:32px}
    h1{font-size:20px;margin:0 0 8px;background:linear-gradient(100deg,#f97316,#ec4899,#a855f7,#3b82f6);
      -webkit-background-clip:text;background-clip:text;color:transparent}
    p{color:#aaa;line-height:1.5;font-size:14px}
    code{color:#c4b5fd;word-break:break-all}
  </style></head><body><div class="box">
    <h1>Couldn't load this page</h1>
    <p>${message}</p>
    <p><code>${url.replace(/</g, '&lt;')}</code></p>
    <p style="margin-top:16px;font-size:12px">Some sites actively block all web proxies. Try another
    site, or configure a self-hosted Scramjet / Ultraviolet / Rammerhead server in Settings for full compatibility.</p>
  </div></body></html>`
}

function injectionScript(finalUrl: string, engine: string) {
  return `<script>(function(){
    var REAL=${JSON.stringify(finalUrl)};var ENGINE=${JSON.stringify(engine)};
    function post(t){try{parent.postMessage({__qs:true,type:t,url:REAL,title:document.title},'*')}catch(e){}}
    function proxify(u){try{var abs=new URL(u,REAL).href;return '/api/proxy?engine='+encodeURIComponent(ENGINE)+'&url='+encodeURIComponent(abs)}catch(e){return u}}
    if(document.readyState!=='loading')post('location');
    document.addEventListener('DOMContentLoaded',function(){post('location')});
    window.addEventListener('load',function(){post('location')});
    document.addEventListener('click',function(e){
      var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href');
      if(!href||href[0]==='#'||/^(javascript|mailto|tel):/i.test(href))return;
      e.preventDefault();window.location.href=proxify(a.href);
    },true);
    document.addEventListener('submit',function(e){
      var f=e.target;if(!f||f.method&&f.method.toLowerCase()==='post')return;
      try{var u=new URL(f.action||REAL,REAL);var fd=new FormData(f);
        fd.forEach(function(v,k){u.searchParams.set(k,v)});
        e.preventDefault();window.location.href=proxify(u.href);}catch(err){}
    },true);
  })();</script>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const target = searchParams.get('url')
  const engine = searchParams.get('engine') ?? 'scramjet'

  if (!target) {
    return new Response('Missing url parameter', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('bad protocol')
  } catch {
    return new Response(errorPage('That address is not a valid URL.', target), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)

  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': UA,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    const contentType = upstream.headers.get('content-type') ?? ''
    const finalUrl = upstream.url || parsed.toString()

    // Non-HTML resources: pass through untouched.
    if (!contentType.includes('text/html')) {
      const buf = await upstream.arrayBuffer()
      return new Response(buf, {
        status: upstream.status,
        headers: {
          'content-type': contentType || 'application/octet-stream',
          'cache-control': 'public, max-age=3600',
        },
      })
    }

    let html = await upstream.text()

    // Neutralize meta-based CSP that would block our injected script or subresources.
    html = html.replace(
      /<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi,
      '',
    )

    const baseTag = `<base href="${finalUrl.replace(/"/g, '&quot;')}">`
    const inject = baseTag + injectionScript(finalUrl, engine)

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => m + inject)
    } else if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html[^>]*>/i, (m) => m + '<head>' + inject + '</head>')
    } else {
      html = inject + html
    }

    return new Response(html, {
      status: upstream.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Deliberately omit X-Frame-Options / CSP so the page renders in-frame.
        'cache-control': 'no-store',
      },
    })
  } catch (err) {
    clearTimeout(timeout)
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'The site took too long to respond.'
        : 'The site could not be reached through the proxy.'
    return new Response(errorPage(message, target), {
      status: 502,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }
}
