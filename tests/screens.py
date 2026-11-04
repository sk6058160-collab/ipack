import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1]; out=sys.argv[2] if len(sys.argv)>2 else 'screenshots'
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':393,'height':852},device_scale_factor=3,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
    pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    for i,cat in enumerate(sys.argv[3].split(',') if len(sys.argv)>3 else ['Gradients','Cars','3D','Heroes','Text']):
        pg.goto(f'{base}?cat={cat}'); pg.wait_for_timeout(800)
        pg.screenshot(path=f'{out}/{i+1:02d}-{cat.lower()}.png')
    print('res',pg.inner_text('#res'),'title',pg.title(),'errors',errs)
    b.close()
