import sys
from playwright.sync_api import sync_playwright
base,out=sys.argv[1],sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch()
    def run(w,h,dpr,pre,shots):
        c=b.new_context(viewport={'width':w,'height':h},screen={'width':w,'height':h},device_scale_factor=dpr,is_mobile=True,has_touch=True,color_scheme='dark'); pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
        for n,u,act in shots:
            pg.goto(base+u); pg.wait_for_timeout(1800)
            if act: act(pg); pg.wait_for_timeout(900)
            pg.screenshot(path=f'{out}/{pre}-{n}.png')
        print(pre,errs); c.close()
    S=[('explore-art','#explore',None),('explore-cars','?tab=Cars#explore',None),('explore-photos','?tab=Photos#explore',None),
       ('create-art','?art=0#create',None),('create-clock-sheet','?art=0&sheet=clock#create',None),('create-filter-duotone','?art=7&filter=Duotone&sheet=filter#create',None),
       ('create-depth','?art=7&depth=1#create',None),('create-gen-swipe','?cat=Gradients#create',lambda pg:(pg.mouse.move(300,500),pg.mouse.down(),pg.mouse.move(100,510,steps=5),pg.mouse.up())),
       ('create-pick','?cat=Cars&sheet=pick#create',None),('icons','#icons',None),('favs','#favs',None)]
    run(440,956,3,'18promax',S)
    run(375,667,2,'se',[('explore','#explore',None),('create','?art=3#create',None),('icons','#icons',None)])
    b.close()
