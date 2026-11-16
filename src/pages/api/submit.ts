import type { APIRoute } from 'astro';
import { scoreAnswers, dbFrom, json, sameOrigin } from '../../lib/core';
export const prerender = false;
export const POST: APIRoute = async ({request,locals}) => {
 if(!sameOrigin(request))return json({error:'Невірне походження запиту'},403);
 let input:any;
 try{input=await request.json()}catch{return json({error:'Некоректні дані'},400)}
 if(input?.website)return json({error:'Помилка перевірки'},400);
 const id=String(input?.id||''),fullName=String(input?.fullName||'').trim().replace(/\s+/g,' '),studentClass=String(input?.studentClass||'').trim(),answers=input?.answers;
 const duration=Math.round(Number(input?.durationSeconds)||0);
 if(!/^[0-9a-fA-F-]{36}$/.test(id))return json({error:'Некоректний ідентифікатор спроби'},400);
 if(fullName.length<4||fullName.length>90||/[\u0000-\u001f<>]/.test(fullName))return json({error:'Вкажіть коректне ім’я та прізвище'},400);
 if(studentClass.length<1||studentClass.length>32||/[\u0000-\u001f<>]/.test(studentClass))return json({error:'Вкажіть коректний клас'},400);
 if(!Array.isArray(answers)||answers.length!==16||!answers.every(a=>typeof a==='string'&&a.length<=80))return json({error:'Потрібні 16 відповідей'},400);
 if(duration<0||duration>72000)return json({error:'Некоректна тривалість'},400);
 const score=scoreAnswers(answers);
 try{
  const db=dbFrom(locals);
  await db.prepare('INSERT OR IGNORE INTO submissions (id,full_name,student_class,answers_json,score,duration_seconds) VALUES (?,?,?,?,?,?)')
   .bind(id,fullName,studentClass,JSON.stringify(answers),score,duration).run();
  const row:any=await db.prepare('SELECT score,submitted_at FROM submissions WHERE id=?').bind(id).first();
  if(!row)return json({error:'Не вдалося зберегти результат'},503);
  return json({saved:true,score:row.score,maxScore:16,submittedAt:row.submitted_at});
 }catch(e){console.error('submission storage unavailable');return json({error:'Сервер тимчасово не зберіг результат. Спробуйте ще раз.'},503);}
};
