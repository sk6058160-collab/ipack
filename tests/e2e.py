import subprocess,time,sys,io,os
from PIL import Image,ImageStat
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else None;srv=None;tag=sys.argv[2] if len(sys.argv)>2 else 'local'
if not url: srv=subprocess.Popen(['npx','vite','preview','--port','4181','--strictPort'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(3); url='http://localhost:4181/ipack/'
os.makedirs('screenshots/e2e',exist_ok=True)
INSET=":root{--tb:90px!important}#tabbar{padding:6px 0 34px!important}"
fails=[];
def ok(c,m):
  print(('PASS ' if c else 'FAIL ')+m)
  if not c: fails.append(m)
def nonblank(pg,sel,name):
  el=pg.locator(sel).first; png=el.screenshot(); im=Image.open(io.BytesIO(png)).convert('L'); im.save(f'screenshots/e2e/{name}.png')
  sd=ImageStat.Stat(im).stddev[0]; return sd>12, round(sd,1)
def run(vw,vh,inset):
  with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':vw,'height':vh},device_scale_factor=2,is_mobile=True,has_touch=True,service_workers='block')
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.add_init_script("navigator.share=undefined;navigator.canShare=undefined;")
    pg.goto(url); 
    if inset: pg.add_style_tag(content=INSET)
    pg.wait_for_timeout(2500); P=f'{vw}x{vh}'
    s=nonblank(pg,'.hp',f'{P}-explore'); ok(s[0],f'{P} explore preview non-blank sd={s[1]}')
    for t in ['Art','Photos','Gradients','Abstract']:
      pg.locator(f'#ctabs button[data-t="{t}"]').tap(); pg.wait_for_timeout(900)
      for k in range(4):
        tl=pg.locator('#tiles .tile').nth(k); want=tl.locator('b').text_content().strip()
        if k: tl.tap(); pg.wait_for_timeout(1300)
        got=pg.locator('#heroTitle').text_content().strip(); f=pg.evaluate("()=>[...document.querySelectorAll('#tiles .tile')].findIndex(x=>x.classList.contains('f'))")
        vis=pg.evaluate("()=>{const i=document.querySelector('#heroImg'),c=document.querySelector('#heroCv');return getComputedStyle(i).display!='none'?'img:'+i.src.split('/').pop():'cv:'+c.width}")
        s=nonblank(pg,'.hp',f'{P}-{t}-{k}')
        ok(got==want and f==k and s[0],f'{P} {t} tile{k} -> title "{got}" want "{want}" focus={f} {vis} sd={s[1]}')
    # customize -> create
    pg.locator('#ctabs button[data-t="Art"]').tap(); pg.wait_for_timeout(900); pg.locator('#tiles .tile').nth(2).tap(); pg.wait_for_timeout(1300)
    hero=Image.open(io.BytesIO(pg.locator('#heroImg').screenshot())).convert('RGB')
    pg.locator('#heroEdit').tap(); pg.wait_for_timeout(1800)
    ok(pg.evaluate("()=>document.querySelector('#v-create').classList.contains('on')"),f'{P} Customize opens Create')
    s=nonblank(pg,'#stage',f'{P}-create'); ok(s[0],f'{P} Create canvas non-blank sd={s[1]}')
    cv=Image.open(io.BytesIO(pg.locator('#cv').screenshot())).convert('RGB')
    m=lambda im: ImageStat.Stat(im.resize((32,64))).mean
    d=sum(abs(x-y) for x,y in zip(m(hero),m(cv)))/3; ok(d<25,f'{P} Create shows same wallpaper as preview (mean colour diff {d:.1f})')
    # clock sheet
    r=pg.locator('#ovClock').bounding_box(); ok(bool(r and r['width']),f'{P} clock present')
    if r: pg.touchscreen.tap(r['x']+r['width']/2,r['y']+r['height']/2); pg.wait_for_timeout(700)
    ok(pg.evaluate("()=>document.querySelector('#csheet').classList.contains('open')"),f'{P} clock sheet opens')
    pg.locator('#csheet .grab').tap(); pg.wait_for_timeout(700)
    ok(not pg.evaluate("()=>document.querySelector('#csheet').classList.contains('open')"),f'{P} clock sheet closes')
    # swipe
    before=pg.locator('#cv').screenshot(); bx=pg.locator('#stage').bounding_box(); y=bx['y']+bx['height']*0.6
    cdp=ctx.new_cdp_session(pg); x0=vw*0.85
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y}]})
    for k in range(1,9): cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0-k*vw*0.08,'y':y}]}); pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    pg.wait_for_timeout(1200); after=pg.locator('#cv').screenshot()
    ok(before!=after,f'{P} swipe changes style')
    s=nonblank(pg,'#stage',f'{P}-create-swiped'); ok(s[0],f'{P} after swipe non-blank sd={s[1]}')
    pg.locator('#cDone').tap(); pg.wait_for_timeout(500); ok(pg.evaluate("()=>!document.querySelector('#doneM').classList.contains('hidden')"),f'{P} Done opens save menu')
    nf=pg.evaluate("()=>JSON.parse(localStorage.getItem('ipack-favs')||'[]').length")
    with pg.expect_download(timeout=8000) as d: pg.locator('#saveClock').tap()
    ok(d.value.suggested_filename.endswith('.png'),f'{P} save path -> {d.value.suggested_filename}')
    pg.wait_for_timeout(800); ok(pg.evaluate("()=>JSON.parse(localStorage.getItem('ipack-favs')||'[]').length")==nf+1,f'{P} save adds favorite')
    pg.locator('#cCancel').tap(); pg.wait_for_timeout(900); ok(pg.evaluate("()=>document.querySelector('#v-explore').classList.contains('on')"),f'{P} Cancel returns to Explore')
    s=nonblank(pg,'.hp',f'{P}-explore-back'); ok(s[0],f'{P} preview non-blank after return sd={s[1]}')
    # heart fav
    pg.locator('#heroFav').tap(); pg.wait_for_timeout(400)
    for v in ['create','icons','favs','explore']:
      if v=='create': continue
      pg.locator(f'#tabbar button[data-v="{v}"]').tap(); pg.wait_for_timeout(1500)
      ok(pg.evaluate(f"()=>document.querySelector('#v-{v}').classList.contains('on')"),f'{P} tab {v}')
      if v=='icons': s=nonblank(pg,'#iconGrid',f'{P}-icons'); ok(s[0],f'{P} icons non-blank sd={s[1]}')
      if v=='favs':
        n=pg.locator('#gallery img').count(); ok(n>=2,f'{P} favorites shown n={n}')
        if n: pg.locator('#gallery img').first.tap(); pg.wait_for_timeout(1500); ok(pg.evaluate("()=>document.querySelector('#v-create').classList.contains('on')"),f'{P} favorite opens Create'); s=nonblank(pg,'#stage',f'{P}-fav-create'); ok(s[0],f'{P} fav Create non-blank sd={s[1]}'); pg.locator('#cCancel').tap(); pg.wait_for_timeout(800)
    pg.locator('#tabbar button[data-v="create"]').tap(); pg.wait_for_timeout(1200); ok(pg.evaluate("()=>document.querySelector('#v-create').classList.contains('on')"),f'{P} tab create')
    s=nonblank(pg,'#stage',f'{P}-tab-create'); ok(s[0],f'{P} Create tab non-blank sd={s[1]}')
    errs=[e for e in errs if 'favicon' not in e]; ok(not errs,f'{P} no console errors {errs[:3]}')
    b.close()
run(440,956,True); run(393,852,False)
if srv: srv.terminate()
r=subprocess.run(['python3','tests/hit.py']+([url] if len(sys.argv)>1 else []),capture_output=True,text=True); last=r.stdout.strip().splitlines()[-1]; ok(last.startswith('PASS'),'tap-hit test '+last)
print('\nRESULT', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
sys.exit(1 if fails else 0)
