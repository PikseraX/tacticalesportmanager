const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
new Function('require','__dirname',harness+String.raw`
element('takimAdi').value='Rehber Testi';run('kariyerBaslat();rehberAtla();kariyerEkrani()');
let html=element('uygulama').innerHTML;assert.ok(html.indexOf('>Rehber</button>')>html.indexOf('>Ana Menü</button>'));
run('kadroEkrani()');assert.ok(!element('uygulama').innerHTML.includes('stratejiRehberi()'));assert.ok(!element('uygulama').innerHTML.includes('rolRehberi()'));
run('kulupMenu()');assert.ok(!element('uygulama').innerHTML.includes('rehberBaslat()'));
const before=run('JSON.stringify(kariyer)');run('rehberMenu()');html=element('uygulama').innerHTML;assert.ok(html.includes('rehberBaslat()')&&html.includes('rolRehberi()')&&html.includes('stratejiRehberi()'));
const ids=JSON.parse(run('JSON.stringify(oyunRehberKonulari().map(x=>x.id))'));assert.equal(ids.length,7);assert.equal(new Set(ids).size,7);
for(const id of ids){run('rehberKonuAc('+JSON.stringify(id)+')');assert.ok(element('uygulama').innerHTML.includes('onclick="rehberMenu()"'));assert.ok(!element('uygulama').innerHTML.includes('undefined'));}
run('rolRehberi()');assert.ok(element('uygulama').innerHTML.includes('rehberMenu()'));run('stratejiRehberi()');assert.ok(element('uygulama').innerHTML.includes('rehberMenu()'));
assert.equal(run('JSON.stringify(kariyer)'),before,'Rehber okumak kariyeri değiştirmez');
run('rehberKonuAc("mac")');assert.ok(element('uygulama').innerHTML.includes('yazılı spiker'));assert.ok(element('uygulama').innerHTML.includes('görüş/konum şartı olmadan'));
run('rehberKonuAc("scout")');assert.ok(element('uygulama').innerHTML.includes('%5/%10/%15'));assert.ok(element('uygulama').innerHTML.includes('2/4/6'));
run('rehberBaslat();rehberAtla()');assert.equal(run('kariyer.rehber.durum'),'atlandi');
console.log('Rehber merkezi: düğme sırası, eski menülerin temizliği, 10 içerik, geri dönüş, güncel spiker/scout kuralları, salt okunurluk ve isteğe bağlı tur geçti.');
`)(require,__dirname);
