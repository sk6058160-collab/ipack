import subprocess,time,sys
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else None
srv=None
if not url: srv=subprocess.Popen(['npx','vite','preview','--port','4179','--strictPort'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(3); url='http://localhost:4179/ipack/'
CSS=""":root{--tb:calc(56px + 34px)!important}#tabbar{padding:6px 0 34px!important}body::before{content:'';position:fixed;top:0;left:0;right:0;height:59px;background:#f003;z-index:99999;pointer-events:none}body::after{content:'';position:fixed;bottom:0;left:0;right:0;height:34px;background:#0f03;z-index:99999;pointer-events:none}"""
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':440,'height':956},device_scale_factor=3,is_mobile=True,has_touch=True)
  pg.goto(url); pg.add_style_tag(content=CSS); pg.wait_for_timeout(2500)
  print(pg.evaluate("""()=>{const r=document.querySelector('#tabbar').getBoundingClientRect();const s=[...document.querySelectorAll('#tabbar span')].map(x=>{const q=x.getBoundingClientRect();return [Math.round(q.top),Math.round(q.bottom)]});const e=document.elementFromPoint(220,r.top+30);return {bar:[r.top,r.bottom,r.height],labels:s,hit:e&&e.closest('#tabbar')?'bar':e&&e.tagName,parent:document.querySelector('#tabbar').parentElement.tagName,innerH:innerHeight}}"""))
  pg.screenshot(path='screenshots/standalone-inset34.png')
  b.close()
if srv: srv.terminate()
