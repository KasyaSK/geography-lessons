import type { APIRoute } from 'astro';
import { dbFrom,json,sameOrigin,hashToken } from '../../lib/core';
export const prerender = false;
const SALT='UntCHUTQ59Ir9XFNRgip0g==';
const HASH='r7M/EmUBYUlftuZgZMSm+7C7Cc871L8cuL2WvzJ7YVs=';
function b64(s:string){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function validPassword(password:string):Promise<boolean>{
 const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64(SALT),iterations:250000,hash:'SHA-256'},k,256);
 const actual=new Uint8Array(bits),expected=b64(HASH);
 let diff=0;for(let i=0;i<actual.length;i++)diff|=(actual[i]^expected[i]);
 return diff===0;
}
export const POST: APIRoute=async ({request,locals})=>{
 if(!sameOrigin(request))return json({error:'Невірне походження'},403);
 let pw='';
 try{pw=String((await request.json()).password||'')}catch{return json({error:'Некоректний запит'},400)}
 if(pw.length>128||pw.length<1)return json({error:'Не вдалося увійти'},401);
 try{
  const ok=await validPassword(pw);
  if(!ok)return json({error:'Неправильний код доступу'},401);
  const db=dbFrom(locals),bytes=crypto.getRandomValues(new Uint8Array(32));
  const token=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');
  const tokenHash=await hashToken(token);
  await db.prepare("INSERT INTO teacher_sessions(token_hash,expires_at) VALUES(?,datetime('now','+8 hours'))").bind(tokenHash).run();
  const response=json({authenticated:true});
  response.headers.set('Set-Cookie','nk_teacher='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800');
  return response;
 }catch(e){ console.error('teacher-login-runtime-error',e); return json({error:'Помилка сервера автентифікації'},503) }
};