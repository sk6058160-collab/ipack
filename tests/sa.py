import sys
from playwright.sync_api import sync_playwright
base,out=sys.argv[1],sys.argv[2]
INIT="""Object.defineProperty(navigator,'standalone',{get:()=>true});
const s=document.createElement('style');s.textContent=':root{}';
"""
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':440,'height':956},screen={'width':440,'height':956},device_scale_factor=3,is_mobile=True,has_touch=True)
    pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    # emulate safe-area insets by overriding env() via CSS injection
    for n,u in [('explore','#explore'),('icons','#icons'),('favs','#favs')]:
        pg.goto(base+u); pg.wait_for_timeout(1500)
        css=open('src/theme.css').read()
        pg.evaluate("""()=>{for(const sh of document.styleSheets){try{for(const r of sh.cssRules){}}catch(e){}}}""")
        pg.add_style_tag(content=":root{--sat:59px;--sab:34px}")
        # rewrite env() uses
        pg.evaluate("""()=>{const fix=t=>t.replace(/env\\(safe-area-inset-top\\)/g,'59px').replace(/env\\(safe-area-inset-bottom\\)/g,'34px');
          for(const sh of [...document.styleSheets]){let t='';try{t=[...sh.cssRules].map(r=>r.cssText).join('\\n')}catch(e){continue}
          if(t.includes('safe-area')){const st=document.createElement('style');st.textContent=fix(t);document.head.appendChild(st)}}}""")
        pg.wait_for_timeout(400)
        r=pg.evaluate("()=>{const t=document.querySelector('#tabbar').getBoundingClientRect();return [t.top,t.bottom,t.height,innerHeight,getComputedStyle(document.documentElement).getPropertyValue('--app-h')]}")
        print(n,r); pg.screenshot(path=f'{out}/18promax-standalone-{n}.png')
    print(errs); b.close()
