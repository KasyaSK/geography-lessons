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
  return json({ready:true,code:'OK'});
 }catch(e:any){
  console.error('D1 health check',e?.message);
  return json({ready:false,code:'DATABASE_ERROR'},503);
 }
};