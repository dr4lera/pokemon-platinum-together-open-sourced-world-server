import {existsSync,copyFileSync,constants,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const value=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const config=resolve(value('config',resolve(root,'server.json')));
if(!existsSync(config))copyFileSync(resolve(root,'server.example.json'),config,constants.COPYFILE_EXCL);
const backend=resolve(value('backend',process.env.PT_BACKEND_DIR??resolve(root,'../plat-together-server')));
if(!existsSync(resolve(backend,'config.mjs')))throw new Error('Install the matching shared backend beside this project; see README.md.');
const {loadConfig}=await import(pathToFileURL(resolve(backend,'config.mjs')));
const options=loadConfig(config);
if(options.role!=='world')throw new Error('This deployment requires role world in its config.');
if(args.includes('--check')){console.log('world server configuration is valid');process.exit(0);}
const child=spawn(process.execPath,[resolve(backend,'main.mjs'),'serve','--config',config],{stdio:'inherit',windowsHide:true});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(child.exitCode===null)child.kill(signal);});
child.on('error',()=>{console.error('Backend failed to start');process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
