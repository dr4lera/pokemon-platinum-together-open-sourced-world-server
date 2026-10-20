import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const backend=resolve(process.env.PT_BACKEND_DIR??resolve(root,'../pokemon-platinum-together-open-sourced-server'));
const start=resolve(root,'start.mjs'),main=resolve(backend,'main.mjs');
const run=args=>spawnSync(process.execPath,args,{encoding:'utf8',timeout:15000,windowsHide:true});
const invoke=args=>run([start,...args]);

test('deployment arguments fail before writing and --check is read-only',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pt-deploy-check-')),missing=join(dir,'missing.json');
 try{
  assert.equal(invoke(['--help']).status,0);
  for(const flags of [['--config',missing,'--unknown'],['--backend'],['--check','--check'],['--config',missing,'--backend',backend,'--check'],['--config',missing,'--backend',backend]]){
   assert.notEqual(invoke(flags).status,0);assert.equal(existsSync(missing),false);
  }
  const file=join(dir,'server.json'),config=JSON.parse(readFileSync(resolve(root,'server.example.json'),'utf8'));
  config.data=join(dir,'data');config.plugins.directory=join(dir,'plugins');writeFileSync(file,JSON.stringify(config));
  assert.equal(invoke(['--config',file,'--backend',backend,'--check']).status,0);
  assert.equal(existsSync(config.data),false,'configuration check created private server data');
  config.role=config.role==='world'?'inverna':'world';writeFileSync(file,JSON.stringify(config));
  assert.notEqual(invoke(['--config',file,'--backend',backend,'--check']).status,0);
  assert.equal(existsSync(config.data),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('real deployment starts with the correct role and exits after owner-signed shutdown',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'pt-deploy-live-'));let child;let exited=false;
 try{
  const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  const origin='http://127.0.0.1:'+port,profile=join(dir,'owner.json'),file=join(dir,'server.json');
  const config=JSON.parse(readFileSync(resolve(root,'server.example.json'),'utf8'));
  config.data=join(dir,'data');config.network={...config.network,bind:'127.0.0.1',port,publicUrl:null};config.plugins={enabled:false,directory:join(dir,'plugins')};config.logging.enabled=false;
  writeFileSync(file,JSON.stringify(config));
  const enrolled=run([main,'enroll','--data',config.data,'--name','SmokeHost','--url',origin,'--out',profile]);
  assert.equal(enrolled.status,0,'local owner enrollment failed');
  child=spawn(process.execPath,[start,'--config',file,'--backend',backend],{stdio:['ignore','pipe','pipe'],windowsHide:true});
  let error='';child.stdout.on('data',()=>{});child.stderr.on('data',part=>{error+=part.toString();});
  const ended=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>{exited=true;resolve(code);});});
  let info;const deadline=Date.now()+10000;
  while(Date.now()<deadline){
   if(exited)throw new Error('Deployment exited before listening: '+error);
   try{const response=await fetch(origin+'/private/server-info',{signal:AbortSignal.timeout(500)});info=await response.json();break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}
  }
  assert.equal(info?.role,config.role);
  assert.equal(info?.backend_revision,6);
  const health=await fetch(origin+'/health').then(r=>r.json());assert.equal(health.dedicated_simulation,false);
  const stopped=run([main,'stop-local','--profile',profile]);assert.equal(stopped.status,0,'owner-signed shutdown failed');
  assert.equal(await Promise.race([ended,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Wrapper did not exit after shutdown')),5000).unref())]),0);
 }finally{
  if(child&&!exited){run([main,'stop-local','--profile',join(dir,'owner.json')]);child.kill();}
  if(!child||exited)rmSync(dir,{recursive:true,force:true});
 }
});
