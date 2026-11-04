import subprocess,time,sys,json
from playwright.sync_api import sync_playwright
url=sys.argv[1] if len(sys.argv)>1 else None;srv=None
if not url: srv=subprocess.Popen(['npx','vite','preview','--port','4180','--strictPort'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(3); url='http://localhost:4180/ipack/'
CSS=":root{--tb:90px!important}#tabbar{padding:6px 0 34px!important}"
JS="""()=>{const out=[];const els=[...document.querySelectorAll('button,a,input,select,label,.tile,[data-v],#tiles>*,#ctabs>*,#gallery>*')];
for(const e of els){const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(e);if(cs.visibility=='hidden'||cs.display=='none'||e.closest('.hidden'))continue;
const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;
// skip if element inside a scroller and clipped
let p=e.parentElement,clip=false;while(p&&p!=document.body){const pr=p.getBoundingClientRect(),ps=getComputedStyle(p);if(/(auto|scroll|hidden)/.test(ps.overflow+ps.overflowX+ps.overflowY)&&(x<pr.left||x>pr.right||y<pr.top||y>pr.bottom)){clip=true;break}p=p.parentElement}if(clip)continue;
const h=document.elementFromPoint(x,y);if(!h||!(h===e||e.contains(h))){out.push({el:(e.id?'#'+e.id:e.tagName+'.'+e.className)+' '+(e.textContent||'').trim().slice(0,15),at:[Math.round(x),Math.round(y)],hit:h?(h.id?'#'+h.id:h.tagName+'.'+(typeof h.className=='string'?h.className:''))+' '+(h.parentElement&&h.parentElement.id||''):null})}}return out}"""
bad=0
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':440,'height':956},device_scale_factor=2,is_mobile=True,has_touch=True)
  pg.goto(url);pg.add_style_tag(content=CSS);pg.wait_for_timeout(2500)
  for v in ['explore','create','icons','favs']:
    pg.evaluate(f"()=>document.querySelector('#tabbar button[data-v={v}]').click()") if v!='explore' else None
    pg.wait_for_timeout(900);r=pg.evaluate(JS);bad+=len(r);print(v,len(r),json.dumps(r[:15]))
    if v=='explore':
      t=pg.query_selector_all('#tiles > *')
      if len(t)>2:
        for k in [2,3,1,4]:
          t=pg.query_selector_all('#tiles .tile');t[k].tap();pg.wait_for_timeout(1200);f=pg.evaluate("()=>[...document.querySelectorAll('#tiles .tile')].findIndex(x=>x.classList.contains('f'))");ok=f==k;bad+=0 if ok else 1;print('tap tile',k,'-> focused',f,'OK' if ok else 'WRONG')
          r=pg.evaluate(JS);bad+=len(r);print(' hits after',len(r),r[:5])
  b.close()
if srv:srv.terminate()
print('FAIL' if bad else 'PASS',bad)
