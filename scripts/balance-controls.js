const fs=require('node:fs'),path=require('node:path');
const harness=fs.readFileSync(path.join(__dirname,'career-systems-test.js'),'utf8').split("element('takimAdi').value=")[0];
const result=new Function('require','__dirname',harness+'\nvm.runInContext(fs.readFileSync(path.join(__dirname,"balance-policy.js"),"utf8"),ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,"balance-control-policy.js"),"utf8"),ctx);return JSON.parse(JSON.stringify(ctx.studyControlResult));')(require,__dirname);
fs.writeFileSync(process.argv[2]||'balance-controls.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
