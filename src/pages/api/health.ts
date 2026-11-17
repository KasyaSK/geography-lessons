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
  return json({ready:cryptoCheck==='ok'&&sqlCheck==='ok',code:'CHECKED',cryptoCheck,sqlCheck});
 }catch(e:any){
  console.error('D1 health check',e?.message);
  return json({ready:false,code:'DATABASE_ERROR'},503);
 }
};