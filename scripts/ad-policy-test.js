const assert = require('node:assert/strict');
const { createPolicy, createScheduler } = require('../reklam.js');
const WAIT = 5*60*1000;
function fixture(initial) {
  let time=1000;
  const memory=new Map(initial ? [['tem_reklam_siklik_v1',JSON.stringify(initial)]] : []);
  const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
  return {storage,now:()=>time,advance:n=>{time+=n}, state:()=>JSON.parse(memory.get('tem_reklam_siklik_v1'))};
}
async function run() {
  let f=fixture(), p=createPolicy(f.storage,f.now);
  assert.equal(p.eligible(),false);
  p.completed(); assert.equal(p.eligible(),false,'ilk maçta geçiş reklamı yok');
  p.completed(); assert.equal(p.eligible(),false,'2. maçta geçiş reklamı yok');
  p.completed(); assert.equal(p.eligible(),true,'3. maçta ilk geçiş reklamına hak kazanır');
  p.shown(f.now()); assert.equal(p.eligible(),false);

  p.startSession();
  p.completed(); p.completed(); assert.equal(p.eligible(),false,'yeni oturumda ilk 2 maç korunur');
  p.completed(); assert.equal(p.eligible(),true,'3. maçta tekrar uygun');
  p.shown(f.now());

  for(let i=0;i<3;i++) p.completed();
  f.advance(WAIT-1); assert.equal(p.eligible(),false,'3 maç erken bitince 5 dakika bekler');
  f.advance(1); assert.equal(p.eligible(),true,'5. dakikada uygun olur');
  p=createPolicy(f.storage,f.now); assert.equal(p.eligible(),true,'yeniden açılışta korunur');
  p.shown(f.now()); f.advance(WAIT);
  for(let i=0;i<2;i++) p.completed();
  assert.equal(p.eligible(),false,'sonraki reklamda yalnızca süre yeterli değil');
  p.completed(); assert.equal(p.eligible(),true);

  f=fixture(); f.storage.setItem('tem_reklam_siklik_v1','broken');
  assert.equal(createPolicy(f.storage,f.now).eligible(),false);

  function setup({available=true,fail=false}={}) {
    const f=fixture(), policy=createPolicy(f.storage,f.now);
    policy.completed(); policy.completed(); policy.completed();
    let blocked=false,shown=0,breaks=0,cleanups=0,prepares=0;
    let release;
    const scheduler=createScheduler({policy,now:f.now,blocked:()=>blocked,
      prepare:async()=>{prepares++;return {ready:available}},
      openBreak:()=>{breaks++;return ()=>{cleanups++}},
      wait:ms=>{assert.equal(ms,2000,'mola 2 saniye');return new Promise(resolve=>{release=resolve})},
      show:async()=>{shown++;if(fail)throw Error('network');return {shown:true,shownAt:f.now()}}
    });
    return {f,policy,scheduler,block:v=>{blocked=v},release:()=>release(),stats:()=>({shown,breaks,cleanups,prepares})};
  }
  let x=setup();x.block(true);await x.scheduler.tick();
  assert.deepEqual(x.stats(),{shown:0,breaks:0,cleanups:0,prepares:0},'maç veya arka plan reklamı engeller');
  x.block(false);let tick=x.scheduler.tick();await Promise.resolve();
  assert.equal(x.stats().breaks,1,'reklam öncesinde mola');
  await x.scheduler.tick();assert.equal(x.stats().breaks,1,'çift gösterim engeli');
  x.release();await tick;
  assert.deepEqual(x.stats(),{shown:1,breaks:1,cleanups:1,prepares:1});
  assert.equal(x.f.state().first,false);assert.equal(x.f.state().matches,0);
  x=setup();tick=x.scheduler.tick();await Promise.resolve();
  x.block(true);x.release();await tick;
  assert.equal(x.stats().shown,0,'mola sırasında arka plana geçince açılmaz');
  assert.equal(x.stats().cleanups,1);
  x=setup({available:false});await x.scheduler.tick();
  assert.equal(x.stats().breaks,0,'hazır reklam yoksa mola da yok');
  await x.scheduler.tick();assert.equal(x.stats().prepares,1,'hata sonrası tekrar aralığı');
  x.f.advance(1000);await x.scheduler.tick();assert.equal(x.stats().prepares,2);
  await x.scheduler.tick(true);assert.equal(x.stats().prepares,3,'maç bitişi önceki hazır kontrolü beklemesini aşar');
  x=setup({fail:true});tick=x.scheduler.tick();await Promise.resolve();x.release();await tick;
  assert.equal(x.stats().cleanups,1,'hata molayı kaldırır');assert.equal(x.policy.eligible(),true);
  console.log('İlk 2 maç koruma, sonraki 3 maç + 5 dk, kayıt, otomatik tetikleme, maç/arka plan engeli, mola ve hata testleri geçti.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
