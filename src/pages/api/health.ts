import type { APIRoute } from 'astro';
import { json } from '../../lib/core';
export const prerender=false;
export const GET: APIRoute=async ({locals})=>{
 const db=(locals as any)?.runtime?.env?.DB;
 if(!db)return json({ready:false,code:'DB_BINDING_MISSING'},503);
 try{
  const r=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('teacher_sessions','submissions')").all();
  const names=(r.results||[]).map((x:any)=>x.name);
  if(names.length<2)return json({ready:false,code:'SCHEMA_MISSING',tables:names},503);
  let cryptoCheck='unchecked',sqlCheck='unchecked';
  try{
   const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('diagnostic-test'),'PBKDF2',false,['deriveBits']);
   await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(16),iterations:250000,hash:'SHA-256'},key,256);
   cryptoCheck='ok';
  }catch(e:any){cryptoCheck='failed-'+String(e?.name||'unknown');}
  try{
   await db.prepare("EXPLAIN INSERT INTO teacher_sessions(token_hash,expires_at) VALUES(?,datetime('now','+8 hours'))").bind('diagnostic-only').all();
   sqlCheck='ok';
  }catch(e:any){sqlCheck='failed-'+String(e?.name||'unknown');}
  let digestCheck='unchecked',randomCheck='unchecked',sessionSqlCheck='unchecked';
  try{
    const bytes=new TextEncoder().encode('test');
    await crypto.subtle.digest('SHA-256',bytes);
    digestCheck='ok';
  }catch(e:any){digestCheck=String(e?.name||'unknown');}
  try{
    const bytes=crypto.getRandomValues(new Uint8Array(32));
    randomCheck=bytes.length===32?'ok':'wrong-length';
  }catch(e:any){randomCheck=String(e?.name||'unknown');}
  try{
    const row=await db.prepare("SELECT count(*) AS n FROM teacher_sessions").first();
    sessionSqlCheck=typeof row?.n==='number'?'ok':'other-result';
  }catch(e:any){sessionSqlCheck=String(e?.name||'unknown');}
  let dbWriteCheck='unchecked';
  try{
    const key='healthprobe-'+crypto.randomUUID();
    await db.prepare("INSERT INTO teacher_sessions(token_hash,expires_at) VALUES(?,datetime('now','+1 second'))").bind(key).run();
    await db.prepare("DELETE FROM teacher_sessions WHERE token_hash=?").bind(key).run();
    dbWriteCheck='ok';
  }catch(e:any){dbWriteCheck=String(e?.name||'unknown')+' '+String(e?.message||'').slice(0,90);}
  return json({ready:digestCheck==='ok'&&randomCheck==='ok'&&sessionSqlCheck==='ok'&&dbWriteCheck==='ok',code:'CHECKED',digestCheck,randomCheck,sessionSqlCheck,dbWriteCheck});
 }catch(e:any){
  console.error('D1 health check',e?.message);
  return json({ready:false,code:'DATABASE_ERROR'},503);
 }
};