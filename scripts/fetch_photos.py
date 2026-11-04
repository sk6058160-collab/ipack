# Curate free-license (CC0 / public domain) portrait photos from Wikimedia Commons. No API key needed.
import json, re, sys, io, time, urllib.request, urllib.parse
from PIL import Image
UA = {'User-Agent': 'iPack-wallpapers/1.0 (https://github.com/sk6058160-collab/ipack)'}
OK = re.compile(r'^(cc0|public domain|pd\b|pd-|no restrictions)', re.I)
BAD = re.compile(r'logo|painting|drawing|engraving|illustration|soldier|military|war |medical|enema|volkswagen|vw |honda|nissan|chevrolet|chevy|dodge|jeep|hyundai|kia|mazda|subaru|volvo|jaguar|bentley|rolls|aston|mclaren|bugatti|maserati|alfa|fiat|renault|peugeot|citroen|opel|skoda|seat |lexus|cadillac|buick|lincoln|mini |suzuki|mitsubishi|lada|saab|lotus|pagani|koenigsegg|shelby|corvette|mustang|camaro|beetle|plate|license|marvel|disney|dc comics|ferrari|lamborghini|porsche|bmw|mercedes|audi|toyota|ford|tesla|nike|coca|brand|advert|poster|flag|map|diagram|chart|portrait of|person|people|woman|man |girl|boy|selfie|wedding|nude|statue|painting|museum', re.I)
QUERIES = {
 'Cars': ['car night street', 'road highway night long exposure', 'classic car', 'race track', 'car headlights light trails', 'vintage automobile'],
 'Nature': ['waterfall', 'forest fog', 'mountain lake', 'flower macro', 'autumn leaves', 'beach sunset'],
 'Space': ['milky way night sky', 'nebula hubble', 'galaxy', 'aurora', 'moon', 'star trails'],
 'City': ['skyscraper', 'city night', 'new york skyline', 'street neon', 'bridge night', 'architecture building'],
 'Abstract': ['abstract texture', 'macro water drops', 'smoke art', 'bokeh', 'light painting', 'crystal macro'],
 'Dark': ['dark night silhouette', 'lightning storm', 'night forest', 'black background macro', 'moonlight', 'dark clouds'],
}
EXTRA = {'Cars': ['automobile', 'sports car', 'car interior dashboard', 'tunnel road', 'motorsport'], 'Nature': ['tree', 'canyon', 'glacier', 'flowers', 'sand dune', 'cliff'], 'Space': ['night sky', 'stars', 'astrophotography', 'ISS earth'], 'City': ['tower', 'street', 'staircase', 'skyline', 'lighthouse'], 'Abstract': ['spiral staircase', 'pattern', 'reflection', 'ice', 'feather', 'leaf texture'], 'Dark': ['night', 'fog', 'storm', 'silhouette tree', 'candle']}
PER = int(sys.argv[1]) if len(sys.argv) > 1 else 14
def api(params):
    params.update(format='json', formatversion=2)
    return json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params), headers=UA), timeout=60))
credits = []; seen = set()
for cat, qs in QUERIES.items():
    got = 0
    for q in qs + EXTRA.get(cat, []):
        if got >= PER: break
        r = api(dict(action='query', generator='search', gsrsearch=f'{q} filetype:bitmap', gsrnamespace=6, gsrlimit=50, prop='imageinfo', iiprop='url|size|extmetadata|mime', iiurlwidth=1290))
        for p in r.get('query', {}).get('pages', []):
            if got >= PER: break
            ii = (p.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {})
            lic = m.get('LicenseShortName', {}).get('value', ''); w, h = ii.get('width', 0), ii.get('height', 0)
            title = p['title']; desc = re.sub('<[^>]+>', '', m.get('ImageDescription', {}).get('value', ''))[:300]
            if not OK.match(lic) or ii.get('mime') != 'image/jpeg' or h < w * 1.1 or h < 1600 or title in seen: continue
            if BAD.search(title + ' ' + desc + ' ' + m.get('Categories', {}).get('value', '')): continue
            try:
                url = ii['thumburl']; data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
                im = Image.open(io.BytesIO(data)).convert('RGB')
            except Exception as e: print('skip', title, e); continue
            tw, th = 1290, 2796  # crop to iPhone aspect (centered)
            sc = max(tw / im.width, th / im.height); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
            l, t = (im.width - tw) // 2, (im.height - th) // 2; im = im.crop((l, t, l + tw, t + th))
            fn = f'{cat.lower()}-{got + 1:02d}.webp'; im.save(f'public/photos/{fn}', 'WEBP', quality=68, method=6)
            im.resize((180, 390), Image.LANCZOS).save(f'public/photos/thumbs/{fn}', 'WEBP', quality=60)
            artist = re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', 'Unknown')).strip()[:80]
            credits.append(dict(file=fn, category=cat, title=title.replace('File:', ''), author=artist or 'Unknown', license=lic, source=ii['descriptionurl']))
            seen.add(title); got += 1; print(cat, got, lic, title[:60]); time.sleep(.3)
    json.dump(credits, open('public/photos/credits.json', 'w'), indent=1, ensure_ascii=False)
print(len(credits))
