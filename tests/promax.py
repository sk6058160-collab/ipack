import sys
from playwright.sync_api import sync_playwright
base,out=sys.argv[1],sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch()
    def ctx(w,h,dpr,scheme='dark'):
        return b.new_context(viewport={'width':w,'height':h},screen={'width':w,'height':h},device_scale_factor=dpr,is_mobile=True,has_touch=True,color_scheme=scheme,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1')
    c=ctx(440,956,3); pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    for name,path in [('explore','#explore'),('create-auto-island','?cat=Island&variant=0#create'),('create-18preset-sheet','?cat=Island&variant=2&dev=1&sheet=1#create'),('create-cars','?cat=Cars#create'),('icons','?istyle=Neon#icons'),('iconpack-lucide-glass','?pack=Lucide&istyle=Glass#icons'),('iconpack-tabler-neon','?pack=Tabler&istyle=Neon#icons'),('iconpack-phosphor-gradient','?pack=Phosphor&istyle=Gradient#icons'),('photos','?photos=1#explore'),('create-gradients','?cat=Gradients#create'),('create-abstract-blackhole','?cat=Abstract&variant=3#create'),('create-space','?cat=3D#create')]:
        pg.goto(base+path); pg.wait_for_timeout(1500); pg.screenshot(path=f'{out}/18promax-{name}.png')
        if name.startswith('create'): print(name, pg.inner_text('#res'), pg.evaluate("[cv.width,cv.height]"))
    pg.goto(base+'?photos=1#explore'); pg.wait_for_timeout(1500); pg.click('#photoGrid img'); pg.wait_for_timeout(1500); pg.screenshot(path=f'{out}/18promax-photo-viewer.png')
    pg.goto(base+'#icons'); pg.wait_for_timeout(500); pg.click('#creditsBtn'); pg.wait_for_timeout(300); pg.screenshot(path=f'{out}/18promax-credits.png')
    pg.goto(base+'?cat=Gradients#create'); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{out}/18promax-tabbar-zoom.png',clip={'x':0,'y':956-200,'width':440,'height':200})
    boxes=pg.evaluate("[...document.querySelectorAll('#tabbar button')].map(b=>{const r=b.getBoundingClientRect(),s=b.querySelector('svg').getBoundingClientRect(),t=b.querySelector('span').getBoundingClientRect();return [Math.round(r.width),Math.round(s.width),Math.round(s.top),Math.round(t.top),Math.round(t.left+t.width/2-r.left-r.width/2)]})")
    print('tabbar 18PM [btnW,iconW,iconTop,labelTop,labelCenterOffset]',boxes, errs); c.close()
    c=ctx(375,667,2,'light'); pg=c.new_page(); pg.goto(base+'?cat=Heroes#create'); pg.wait_for_timeout(600)
    pg.screenshot(path=f'{out}/se-tabbar-zoom.png',clip={'x':0,'y':667-200,'width':375,'height':200})
    pg.screenshot(path=f'{out}/se-create.png'); print('SE',pg.inner_text('#res')); c.close(); b.close()
