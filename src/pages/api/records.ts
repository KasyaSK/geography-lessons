import type { APIRoute } from 'astro';
import { dbFrom,json,teacherSession,escapeCSV } from '../../lib/core';
export const prerender=false;
export const GET: APIRoute=async ({request,locals})=>{
 try{
  if(!await teacherSession(request,locals))return json({error:'Потрібен вхід учителя'},401);
  const db=dbFrom(locals);
  const {results}=await db.prepare('SELECT id,full_name,student_class,answers_json,score,duration_seconds,submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5000').all();
  const rows=(results||[]).map((r:any)=>({id:r.id,name:r.full_name,studentClass:r.student_class,score:r.score,durationSeconds:r.duration_seconds,submittedAt:r.submitted_at,answers:JSON.parse(r.answers_json)}));
  if(new URL(request.url).searchParams.get('format')==='csv'){
   const h=['ПІБ','Клас','Бал','Максимум','Час завершення UTC','Тривалість, с',...Array.from({length:16},(_,i)=>'Відповідь '+(i+1)),'ID спроби'];
   const lines=[h.map(escapeCSV).join(',')];
   for(const r of rows)lines.push([r.name,r.studentClass,r.score,16,r.submittedAt,r.durationSeconds,...r.answers,r.id].map(escapeCSV).join(','));
   return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="naukovyi-kod-results.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  return json({results:rows,count:rows.length});
 }catch{ return json({error:'Не вдалося завантажити журнал'},503) }
};