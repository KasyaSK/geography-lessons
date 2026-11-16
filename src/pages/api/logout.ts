import type { APIRoute } from 'astro';
import { dbFrom,json,sameOrigin,hashToken } from '../../lib/core';
export const prerender=false;
export const POST: APIRoute=async ({request,locals})=>{
 if(!sameOrigin(request))return json({error:'Невірне походження'},403);
 const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('nk_teacher='))?.slice(11);
 if(token&&/^[a-f0-9]{64}$/.test(token)){
  try{await dbFrom(locals).prepare('DELETE FROM teacher_sessions WHERE token_hash=?').bind(await hashToken(token)).run()}catch{}
 }
 const response=json({signedOut:true});
 response.headers.set('Set-Cookie','nk_teacher=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
 return response;
};