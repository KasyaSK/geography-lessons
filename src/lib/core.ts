export const allowed: string[][] = [
 ['фагоцитоз'],['заболотний'],['днк'],['хемосинтез'],['вернадський'],
 ['гідросфера'],['океанія'],['рентгенівське','рентгенівські','рентген'],
 ['ракета'],['кремній','силіцій'],['геохімія'],['тіамін','b1','в1'],
 ['атф','atp'],['вакцина'],['пробіотики'],['витривалість']
];
export function normalize(s: unknown): string {
 return String(s ?? '').normalize('NFC').toLocaleLowerCase('uk-UA').trim().replace(/[ʼ'’\x60.,;:!?–—_\s-]/g,'');
}
export function scoreAnswers(answers: string[]) {
 return answers.reduce((n,a,i)=>n+(allowed[i].some(x=>normalize(x)===normalize(a))?1:0),0);
}
export function sameOrigin(req: Request):boolean{
 const origin=req.headers.get('origin');
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(req.url).origin;}catch{return false;}
}
export function dbFrom(locals:any):any {
 const db=locals?.runtime?.env?.DB;
 if(!db) throw new Error('Database unavailable');
 return db;
}
export function json(body:any,status=200):Response {
 return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function hashToken(s:string):Promise<string>{
 const buf=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
 return Array.from(new Uint8Array(buf)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function teacherSession(request:Request,locals:any):Promise<boolean>{
 const raw=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(x=>x.startsWith('nk_teacher='))?.slice(11);
 if(!raw||!(/^[a-f0-9]{64}$/).test(raw))return false;
 const db=dbFrom(locals),hash=await hashToken(raw);
 const row=await db.prepare('SELECT token_hash FROM teacher_sessions WHERE token_hash=? AND expires_at>datetime('now')').bind(hash).first();
 return !!row;
}
export function escapeCSV(value:unknown):string{
 let s=String(value??'');
 if(/^[\s]*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
