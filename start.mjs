import {existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const role='world';
const options={};
for(let i=0;i<args.length;i++){
 const key=args[i];
 if(!['--config','--backend','--check','--help'].includes(key))throw new Error('Unknown option '+key+'. Use --help.');
 if(Object.hasOwn(options,key))throw new Error('Duplicate option '+key);
 if(key==='--check'||key==='--help'){options[key]=true;continue;}
 if(!args[i+1]||args[i+1].startsWith('--'))throw new Error('Missing path after '+key);
 options[key]=args[++i];
}
if(options['--help']){
 console.log('Usage: node start.mjs [--config PATH] [--backend PATH] [--check]\nRole: '+role+'\n--check validates existing configuration without writing or starting a listener.');
 process.exit(0);
}
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<24||(major===24&&minor<12))throw new Error('Node.js 24.12 or newer is required.');
const backend=resolve(options['--backend']??process.env.PT_BACKEND_DIR??resolve(root,'../pokemon-platinum-together-open-sourced-server'));
for(const file of ['config.mjs','main.mjs'])if(!existsSync(resolve(backend,file)))throw new Error('Install the matching shared backend beside this project; see README.md. Missing '+file);
const config=resolve(options['--config']??resolve(root,'server.json'));
if(!existsSync(config))throw new Error('Configuration not found. Copy server.example.json to your chosen path and enroll the owner locally first.');
const {loadConfig}=await import(pathToFileURL(resolve(backend,'config.mjs')));
const settings=loadConfig(config);
if(settings.role!==role)throw new Error('This deployment requires role '+role+' in its config.');
if(options['--check']){console.log(role+' server configuration is valid');process.exit(0);}
const child=spawn(process.execPath,[resolve(backend,'main.mjs'),'serve','--config',config],{stdio:'inherit',windowsHide:true});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(child.exitCode===null)child.kill(signal);});
child.on('error',()=>{console.error('Backend failed to start');process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
