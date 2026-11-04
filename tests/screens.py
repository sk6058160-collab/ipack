import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1]; out=sys.argv[2]
shots=[('01-explore-dark','dark','#explore',None),('02-explore-light','light','#explore',None),
('03-create-cars-lock','dark','?cat=Cars#create',None),('04-create-3d-sheet-open','dark','?cat=3D&sheet=1#create',None),
('05-create-heroes-home','dark','?cat=Heroes&mode=Home#create',None),('06-heroes-hexgrid','dark','?cat=Heroes&mode=Clean#create','seed'),
('07-island-halo','dark','?cat=Island&variant=0&dev=1#create',None),('08-island-creature-sheet','dark','?cat=Island&variant=2&sheet=1#create',None),
('09-island-blackhole-fullscreen','dark','?cat=Island&variant=3#create','tap'),('10-island-drip-fullscreen','dark','?cat=Island&variant=4&mode=Clean#create','tap'),
('11-icons-glass-light','light','?istyle=Glass#icons',None),('12-icons-neon','dark','?istyle=Neon#icons',None),('13-icons-amoled-guide','dark','?istyle=AMOLED#icons','scroll'),('14-favorites','light','#favs','fav')]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,scheme,path,act in shots:
        c=b.new_context(viewport={'width':393,'height':852},device_scale_factor=3,is_mobile=True,has_touch=True,color_scheme=scheme,accept_downloads=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
        pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(base+path); pg.wait_for_timeout(700)
        if act=='seed':
            for _ in range(8):
                if pg.evaluate("1"): pg.click('#rand'); pg.wait_for_timeout(150)
        if act=='tap': pg.click('#cv',position={'x':200,'y':450}); pg.wait_for_timeout(500)
        if act=='scroll': pg.evaluate("document.querySelector('#v-icons').scrollTo(0,9999)"); pg.wait_for_timeout(300)
        if act=='fav':
            pg.goto(base+'?cat=Island&variant=0#create'); pg.wait_for_timeout(500); pg.click('#fav')
            pg.goto(base+'?cat=Cars#create'); pg.wait_for_timeout(500); pg.click('#fav'); pg.goto(base+'#favs'); pg.wait_for_timeout(500)
        pg.screenshot(path=f'{out}/{name}.png')
        if name=='12-icons-neon':
            with pg.expect_download() as d: pg.click('#zip')
            d.value.save_as('/tmp/icons.zip')
        print(name, pg.title(), errs)
        c.close()
    b.close()
