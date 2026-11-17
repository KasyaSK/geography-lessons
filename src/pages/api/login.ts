import type { APIRoute } from 'astro';
import { dbFrom,json,sameOrigin,hashToken } from '../../lib/core';
export const prerender = false;
const SALT='527b421d44d0e7d22bf5714d4608a9d2';
const HASH='594759be064f9e4fc53d1b358f52fc81acceb0857b949e780918c400bbe71820';
function bytesFromHex(s:string){return Uint8Array.from(s.match(/.{2}/g)||[],x=>parseInt(x,16))}
async function validPassword(password:string):Promise<boolean>{
 const salt=bytesFromHex(SALT);
 const passwordBytes=new TextEncoder().encode(password);
 const combined=new Uint8Array(salt.length+passwordBytes.length);
 combined.set(salt,0);
 combined.set(passwordBytes,salt.length);
 const digest=await crypto.subtle.digest('SHA-256',combined);
 const actual=new Uint8Array(digest),expected=bytesFromHex(HASH);
 let diff=actual.length^expected.length;
 for(let i=0;i<expected.length;i++)diff|=((actual[i]??0)^expected[i]);
 return diff===0;
}
export const POST: APIRoute=async ({request,locals})=>{
 if(!sameOrigin(request))return json({error:'Невірне походження'},403);
 let pw='';
 try{pw=String((await request.json()).password||'')}catch{return json({error:'Некоректний запит'},400)}
 if(pw.length>128||pw.length<1)return json({error:'Не вдалося увійти'},401);
 let step='verify';
 try{
  const ok=await validPassword(pw);
  if(!ok)return json({error:'Неправильний код доступу'},401);
  step='session';
  const db=dbFrom(locals),bytes=crypto.getRandomValues(new Uint8Array(32));
  const token=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');
  const tokenHash=await hashToken(token);
  step='insert';
  await db.prepare("INSERT INTO teacher_sessions(token_hash,expires_at) VALUES(?,datetime('now','+8 hours'))").bind(tokenHash).run();
  const response=json({authenticated:true});
  response.headers.set('Set-Cookie','nk_teacher='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800');
  return response;
 }catch(e){ console.error('teacher-login-runtime-error',e); return json({error:'Помилка сервера автентифікації',step},503) }
};