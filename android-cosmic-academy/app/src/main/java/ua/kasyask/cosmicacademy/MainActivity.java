package ua.kasyask.cosmicacademy;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.*;
import android.view.*;
import android.widget.*;
import android.text.*;
import android.text.style.*;
import org.json.*;
import java.util.*;
import java.io.*;
import java.text.*;

/** Native Android learning experience. Deliberately no WebView or third-party runtime. */
public final class MainActivity extends Activity {
  static final int BG=0xff080F20, SURFACE=0xff131D34, SURFACE2=0xff1B2943,
      TEXT=0xffF7F2E9, MUTED=0xffB6C4D6, GOLD=0xffFFCB8A, AQUA=0xff96E8D9,
      BLUE=0xffABC4FF, RED=0xffFFB5B5, LINE=0xff344461;
  JSONObject corpus, stats, cardStats; JSONArray modules, questions, cards, timelines, particles, cases;
  android.content.SharedPreferences prefs; LinearLayout shell, content, nav; ScrollView scroll;
  String screen="home", currentModule="evidence", practiceKind="quiz", lastTab="home";
  int xp, attempts, correct, examBest, dailyStreak, quizPos=0, correctSession=0, orderPos=0, particlePos=0, casePos=0, cardPos=0, labIndex=0;
  long lastStudyDay; boolean revealed=false, cardRevealed=false, checked=false, isExam=false, isMistakes=false;
  ArrayList<JSONObject> testPool=new ArrayList<>(), cardPool=new ArrayList<>(), particlePool=new ArrayList<>(), casePool=new ArrayList<>();
  ArrayList<Integer> timelineOrder=new ArrayList<>(); HashSet<Integer> selections=new HashSet<>();
  HashSet<String> studied=new HashSet<>(); Random random=new Random();
  final String[] GROUPS={"Кварк","Лептон","Калібрувальний бозон","Скалярний бозон"};
  final String[] LABS={"Реліктове світло","Червоне зміщення","Енергія частинок","Ізотопний годинник","Розширення Всесвіту"};
  static final String ATLAS="https://kasyask.github.io/geography-lessons/11/dodatkovi-materialy/istoriia-vsesvitu/";
  DecimalFormat nf;
  
  @Override public void onCreate(Bundle b){super.onCreate(b);
    getWindow().setStatusBarColor(BG);getWindow().setNavigationBarColor(BG);
    nf=new DecimalFormat("#,##0.###",new DecimalFormatSymbols(new Locale("uk","UA")));
    try(InputStream in=getAssets().open("course.json")){ByteArrayOutputStream o=new ByteArrayOutputStream();byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1)o.write(buf,0,n);
      corpus=new JSONObject(o.toString("UTF-8"));modules=corpus.getJSONArray("modules");questions=corpus.getJSONArray("questions");cards=corpus.getJSONArray("cards");timelines=corpus.getJSONArray("timelines");particles=corpus.getJSONArray("classify");cases=corpus.getJSONArray("cases");
    }catch(Exception e){new AlertDialog.Builder(this).setTitle("Помилка навчальних матеріалів").setMessage(e.toString()).setPositiveButton("Закрити",(d,w)->finish()).show();return;}
    prefs=getSharedPreferences("academy_progress_v1",MODE_PRIVATE);xp=prefs.getInt("xp",0);attempts=prefs.getInt("attempts",0);correct=prefs.getInt("correct",0);examBest=prefs.getInt("exam",0);dailyStreak=prefs.getInt("streak",0);lastStudyDay=prefs.getLong("lastDay",-1);
    try{stats=new JSONObject(prefs.getString("stats","{}"));cardStats=new JSONObject(prefs.getString("cards","{}"));JSONArray a=new JSONArray(prefs.getString("studied","[]"));for(int i=0;i<a.length();i++)studied.add(a.getString(i));}catch(Exception e){stats=new JSONObject();cardStats=new JSONObject();}
    shell=new LinearLayout(this);shell.setOrientation(LinearLayout.VERTICAL);shell.setBackgroundColor(BG);setContentView(shell);
    scroll=new ScrollView(this);scroll.setFillViewport(false);scroll.setVerticalScrollBarEnabled(false);
    content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(dp(19),dp(10),dp(19),dp(28));scroll.addView(content);
    shell.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));nav=new LinearLayout(this);nav.setOrientation(LinearLayout.HORIZONTAL);
    nav.setPadding(dp(9),dp(7),dp(9),dp(8));nav.setBackground(rounded(SURFACE,0,0));shell.addView(nav);
    show("home");
  }
  int dp(float v){return (int)(v*getResources().getDisplayMetrics().density+.5f);} 
  GradientDrawable rounded(int color,float radius,int stroke){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));if(stroke!=0)d.setStroke(dp(1),stroke);return d;}
  GradientDrawable gradient(int a,int b,float r){GradientDrawable d=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{a,b});d.setCornerRadius(dp(r));return d;}
  LinearLayout column(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);return l;}
  LinearLayout row(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setGravity(Gravity.CENTER_VERTICAL);return l;}
  TextView text(String s,int size,int color,boolean bold){TextView v=new TextView(this);v.setText(s);v.setTextColor(color);v.setTextSize(size);v.setLineSpacing(dp(3),1.04f);v.setFontFeatureSettings("kern");v.setTypeface(android.graphics.Typeface.create(bold?"sans-serif-medium":"sans-serif",bold?android.graphics.Typeface.BOLD:android.graphics.Typeface.NORMAL));return v;}
  LinearLayout.LayoutParams lp(int w,int h,int top,int bottom){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(w<0?w:dp(w),h<0?h:dp(h));p.topMargin=dp(top);p.bottomMargin=dp(bottom);return p;}
  void heading(LinearLayout parent,String eyebrow,String title,String desc){parent.addView(text(eyebrow.toUpperCase(Locale.ROOT),11,AQUA,true),lp(-1,-2,24,9));parent.addView(text(title,31,TEXT,true),lp(-1,-2,0,10));if(desc!=null&&!desc.isEmpty())parent.addView(text(desc,15,MUTED,false),lp(-1,-2,0,17));}
  LinearLayout panel(LinearLayout parent,int fill){LinearLayout p=column();p.setPadding(dp(17),dp(16),dp(17),dp(18));p.setBackground(rounded(fill,21,LINE));parent.addView(p,lp(-1,-2,10,6));return p;}
  void line(LinearLayout parent){View v=new View(this);v.setBackgroundColor(LINE);parent.addView(v,lp(-1,1,10,10));}
  TextView button(String t,boolean primary,Runnable act){TextView v=text(t,15,primary?BG:TEXT,true);v.setGravity(Gravity.CENTER);v.setPadding(dp(16),dp(12),dp(16),dp(12));v.setMinHeight(dp(49));v.setBackground(primary?rounded(GOLD,15,0):rounded(SURFACE2,15,LINE));v.setOnClickListener(x->act.run());return v;}
  void button(LinearLayout parent,String t,boolean primary,Runnable act){parent.addView(button(t,primary,act),lp(-1,-2,12,3));}
  void info(LinearLayout parent,String label,String body,int color){LinearLayout p=panel(parent,SURFACE);p.addView(text(label.toUpperCase(Locale.ROOT),11,color,true));p.addView(text(body,15,TEXT,false),lp(-1,-2,7,0));}
  JSONObject mod(int i){return modules.optJSONObject(i);} JSONObject module(String id){for(int i=0;i<modules.length();i++){JSONObject m=mod(i);if(id.equals(m.optString("id")))return m;}return mod(0);}
  void save(){prefs.edit().putInt("xp",xp).putInt("attempts",attempts).putInt("correct",correct).putInt("exam",examBest).putInt("streak",dailyStreak).putLong("lastDay",lastStudyDay).putString("stats",stats.toString()).putString("cards",cardStats.toString()).putString("studied",new JSONArray(studied).toString()).apply();}
  void award(int points){long day=System.currentTimeMillis()/86400000L;if(day!=lastStudyDay){dailyStreak=day==lastStudyDay+1?dailyStreak+1:1;lastStudyDay=day;}xp+=points;save();}
  void record(JSONObject q,boolean right){attempts++;if(right){correct++;award(10);}else award(2);String id=q.optString("id");JSONObject st=stats.optJSONObject(id);if(st==null)st=new JSONObject();try{st.put(right?"right":"wrong",st.optInt(right?"right":"wrong")+1);stats.put(id,st);}catch(Exception ignored){}save();}
  void toast(String s){Toast.makeText(this,s,Toast.LENGTH_SHORT).show();}
  void top(String title){LinearLayout bar=row();TextView mark=text("✦",24,GOLD,true);bar.addView(mark,lp(30,-2,0,0));TextView t=text(title,16,TEXT,true);bar.addView(t,new LinearLayout.LayoutParams(0,-2,1));TextView badge=text((xp)+" XP",12,GOLD,true);badge.setPadding(dp(12),dp(7),dp(12),dp(7));badge.setBackground(rounded(SURFACE2,30,LINE));bar.addView(badge);content.addView(bar,lp(-1,-2,4,6));line(content);}
  void show(String next){screen=next;content.removeAllViews();switch(next){case "home":home();break;case "modules":modules();break;case "practice":practice();break;case "revision":revision();break;case "profile":profile();break;case "lesson":lesson();break;case "quiz":quizScreen();break;case "cards":cardScreen();break;case "timeline":timelineScreen();break;case "particles":particleScreen();break;case "cases":caseScreen();break;case "labs":labScreen();break;default:home();}
    drawNav();scroll.post(()->scroll.scrollTo(0,0));}
  void drawNav(){nav.removeAllViews();String[] icons={"⌂","✦","↺","▤"};String[] labels={"Головна","Навчання","Повторення","Профіль"};String[] pages={"home","modules","revision","profile"};
    String active=screen.equals("home")?"home":screen.equals("lesson")||screen.equals("modules")?"modules":screen.equals("revision")||screen.equals("cards")?"revision":screen.equals("profile")?"profile":"modules";
    for(int i=0;i<pages.length;i++){String dest=pages[i];LinearLayout cell=column();cell.setGravity(Gravity.CENTER);cell.setPadding(dp(5),dp(4),dp(5),dp(3));cell.addView(text(icons[i],23,active.equals(dest)?GOLD:MUTED,true));TextView label=text(labels[i],10,active.equals(dest)?GOLD:MUTED,active.equals(dest));label.setGravity(Gravity.CENTER);cell.addView(label);LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(55),1);nav.addView(cell,p);cell.setOnClickListener(v->show(dest));}}
  void heroArt(LinearLayout parent,int type,int height){SpaceArt art=new SpaceArt(this,type);parent.addView(art,lp(-1,height,10,7));}
  void barProgress(LinearLayout parent,int progress){FrameLayout track=new FrameLayout(this);track.setBackground(rounded(SURFACE2,20,0));View fill=new View(this);fill.setBackground(rounded(AQUA,20,0));track.addView(fill,new FrameLayout.LayoutParams(-1,-1));parent.addView(track,lp(-1,8,9,7));track.post(()->{FrameLayout.LayoutParams p=new FrameLayout.LayoutParams(Math.max(dp(4),track.getWidth()*Math.min(100,Math.max(0,progress))/100),-1);fill.setLayoutParams(p);});}
  int mastery(String id){int done=0,correct=0;for(int i=0;i<questions.length();i++){JSONObject q=questions.optJSONObject(i);if(!id.equals(q.optString("mod")))continue;JSONObject st=stats.optJSONObject(q.optString("id"));if(st!=null&&st.optInt("right")>0){done++;correct++;}}
    int total=0;for(int i=0;i<questions.length();i++)if(id.equals(questions.optJSONObject(i).optString("mod")))total++;return total==0?0:(int)Math.round(100.0*correct/total);}
  int averageMastery(){int sum=0;for(int i=0;i<modules.length();i++)sum+=mastery(mod(i).optString("id"));return sum/modules.length();}
  void openUrl(String u){try{startActivity(new Intent(Intent.ACTION_VIEW,android.net.Uri.parse(u)));}catch(Exception e){toast("Не вдалося відкрити посилання");}}
  void home(){top("КОСМІЧНА АКАДЕМІЯ");heroArt(content,0,205);content.addView(text("Від планківського часу до Землі",30,TEXT,true),lp(-1,-2,13,9));content.addView(text("Сім експедицій крізь 13,8 млрд років. Менше зубріння — більше розуміння, доказів і фізики.",15,MUTED,false),lp(-1,-2,0,12));
    LinearLayout big=panel(content,SURFACE);big.addView(text("ВАШ ПРОГРЕС",12,AQUA,true));LinearLayout r=row();TextView n=text(averageMastery()+"%",38,GOLD,true);r.addView(n,lp(110,-2,3,0));r.addView(text("освоєних понять за тематичними запитаннями",14,MUTED,false),new LinearLayout.LayoutParams(0,-2,1));big.addView(r);barProgress(big,averageMastery());
    LinearLayout meta=row();String[] xs={"✦  "+xp+" XP","◎  "+dailyStreak+" дн. серія","✓  "+correct+" / "+attempts};for(String x:xs){TextView v=text(x,11,MUTED,true);meta.addView(v,new LinearLayout.LayoutParams(0,-2,1));}big.addView(meta,lp(-1,-2,10,0));
    button(content,"Розпочати або продовжити →",true,()->{for(int i=0;i<modules.length();i++){JSONObject m=mod(i);if(!studied.contains(m.optString("id"))){currentModule=m.optString("id");show("lesson");return;}}show("modules");});
    heading(content,"Навчальний маршрут","7 експедицій","Усе складне розкладено на логічні етапи — без магічного мислення й удаваної певності.");
    for(int i=0;i<modules.length();i++)moduleItem(content,mod(i),i);
    heading(content,"Тренування","Наука потребує практики","Найкращий спосіб перевірити розуміння — спробувати помилитися, побачити чому й виправити.");
    button(content,"Тести та наукові розслідування →",false,()->show("practice"));button(content,"Повторити складне →",false,()->show("revision"));
    info(content,"Авторка матеріалів","Каріна Скринченко. На основі авторського інтерактивного атласу історії Всесвіту.",GOLD);
  }
  void moduleItem(LinearLayout parent,JSONObject m,int idx){LinearLayout box=panel(parent,SURFACE);LinearLayout title=row();TextView number=text(m.optString("number"),29,GOLD,true);title.addView(number,lp(50,-2,0,0));LinearLayout texts=column();texts.addView(text(m.optString("tag").toUpperCase(Locale.ROOT),10,AQUA,true));texts.addView(text(m.optString("title"),19,TEXT,true),lp(-1,-2,4,0));title.addView(texts,new LinearLayout.LayoutParams(0,-2,1));box.addView(title);box.addView(text(m.optString("period"),12,MUTED,false),lp(-1,-2,8,0));barProgress(box,mastery(m.optString("id")));
    box.setOnClickListener(v->{currentModule=m.optString("id");show("lesson");});}
  void modules(){top("НАВЧАЛЬНИЙ МАРШРУТ");heading(content,"Сім великих питань","Оберіть експедицію","Спочатку — розібратися в фізиці та доказах. Потім — пройти завдання. Якщо захочете, можна спробувати зворотний порядок. Всесвіт пережив і гірші експерименти.");for(int i=0;i<modules.length();i++)moduleItem(content,mod(i),i);button(content,"Відкрити повний атлас у браузері ↗",false,()->openUrl(ATLAS));}
  void lesson(){JSONObject m=module(currentModule);top("ЕКСПЕДИЦІЯ  "+m.optString("number"));
    content.addView(text(m.optString("title"),32,TEXT,true),lp(-1,-2,13,6));content.addView(text(m.optString("lead"),16,MUTED,false),lp(-1,-2,0,12));
    offlinePhoto(content,m.optString("id"));info(content,"Масштаб",m.optString("period"),AQUA);
    JSONArray theory=m.optJSONArray("theory");if(theory!=null)for(int i=0;i<theory.length();i++){JSONArray t=theory.optJSONArray(i);LinearLayout p=panel(content,SURFACE);p.addView(text("0"+(i+1)+"   "+t.optString(0),21,GOLD,true));p.addView(text(t.optString(1),15,TEXT,false),lp(-1,-2,10,0));}
    info(content,"Звідки ми знаємо",m.optString("evidence"),AQUA);info(content,"Де фізика ще не впевнена",m.optString("caution"),RED);info(content,"Несподіваний факт",m.optString("fact"),GOLD);
    button(content,studied.contains(currentModule)?"Пройти тематичне тренування →":"Я розібрався/-лась. Перевірити знання →",true,()->{studied.add(currentModule);award(20);save();startQuiz(currentModule,false,false);});
    button(content,"Переглянути першоджерело ↗",false,()->openUrl(m.optString("source",ATLAS)));
    button(content,"Назад до всіх експедицій",false,()->show("modules"));
  }
  void offlinePhoto(LinearLayout parent,String id){try{InputStream stream=getAssets().open("images/"+id+".jpg");Bitmap bmp=BitmapFactory.decodeStream(stream);stream.close();if(bmp==null)throw new Exception("bitmap unavailable");ImageView v=new ImageView(this);v.setImageBitmap(bmp);v.setScaleType(ImageView.ScaleType.CENTER_CROP);v.setBackground(rounded(SURFACE,18,LINE));v.setClipToOutline(true);parent.addView(v,lp(-1,205,5,6));}catch(Exception ex){heroArt(parent,Arrays.asList("evidence","origin","forces","nuclei","light","stars","earth").indexOf(id)+1,195);}}
  void practice(){top("ТРЕНАЖЕРИ");heading(content,"Знання люблять перевірки","Арена практики","Шість режимів. Різні когнітивні навички. Жодного «постав плюсик, якщо Всесвіт існує».");
    String[][] rows={{"◈","Адаптивний тест","Запитання, які змушують думати й пояснюють помилки."},{"◷","Космічна хронологія","Відновіть реальний порядок подій раннього Всесвіту."},{"⬡","Детектор частинок","Кварки, лептони, калібрувальні й скалярні бозони."},{"⌕","Науковий детектив","Оберіть надійний метод дослідження, а не гарне припущення."},{"∑","Фізична лабораторія","П’ять симуляцій із реальними формулами та одиницями."},{"★","Фінальний космічний залік","20 завдань, охоплення всіх семи експедицій."}};
    for(int i=0;i<rows.length;i++){final int n=i;LinearLayout box=panel(content,SURFACE);box.addView(text(rows[i][0]+"   "+rows[i][1],20,i%2==0?GOLD:AQUA,true));box.addView(text(rows[i][2],14,MUTED,false),lp(-1,-2,8,0));box.setOnClickListener(v->{switch(n){case 0:startQuiz(null,false,false);break;case 1:startTimeline();break;case 2:startParticles();break;case 3:startCases();break;case 4:show("labs");break;default:startQuiz(null,true,false);}});}
    button(content,"Повторення за картками →",false,()->startCards());
  }
  void startQuiz(String mod,boolean exam,boolean mistakes){testPool.clear();isExam=exam;isMistakes=mistakes;quizPos=0;correctSession=0;selections.clear();revealed=false;
    if(mistakes){for(int i=0;i<questions.length();i++){JSONObject q=questions.optJSONObject(i);JSONObject st=stats.optJSONObject(q.optString("id"));if(st!=null&&st.optInt("wrong",0)>0)testPool.add(q);}}
    else if(exam){for(int i=0;i<modules.length();i++){String id=mod(i).optString("id");ArrayList<JSONObject> section=new ArrayList<>();for(int j=0;j<questions.length();j++){JSONObject q=questions.optJSONObject(j);if(q.optString("mod").equals(id))section.add(q);}Collections.shuffle(section);for(int j=0;j<Math.min(i==6?2:3,section.size());j++)testPool.add(section.get(j));}}
    else for(int j=0;j<questions.length();j++){JSONObject q=questions.optJSONObject(j);if(mod==null||mod.equals(q.optString("mod")))testPool.add(q);}
    Collections.shuffle(testPool);if(!exam&&!mistakes&&testPool.size()>10)testPool=new ArrayList<>(testPool.subList(0,10));
    if(testPool.isEmpty()){toast("Помилок для повторення ще немає. Можна зробити кілька тренувань.");show("revision");return;}
    show("quiz");
  }
  void quizScreen(){top(isExam?"КОСМІЧНИЙ ЗАЛІК":isMistakes?"РОБОТА НАД ПОМИЛКАМИ":"ТЕСТОВИЙ ПОЛІГОН");
    if(quizPos>=testPool.size()){quizDone();return;}
    JSONObject q=testPool.get(quizPos);boolean multi="multi".equals(q.optString("type"));
    content.addView(text((quizPos+1)+" / "+testPool.size()+"   •   "+(multi?"КІЛЬКА ВІДПОВІДЕЙ":"ОДНА ВІДПОВІДЬ"),12,AQUA,true),lp(-1,-2,15,10));barProgress(content,100*quizPos/testPool.size());
    content.addView(text(q.optString("question"),23,TEXT,true),lp(-1,-2,18,19));
    JSONArray choices=q.optJSONArray("options");for(int i=0;i<choices.length();i++){final int idx=i;boolean selected=selections.contains(i);boolean right=isCorrectOption(q,i);
      TextView item=text((i+1)+".   "+choices.optString(i),16,TEXT,selected);item.setPadding(dp(16),dp(17),dp(14),dp(17));
      item.setBackground(rounded(revealed&&right?0xff245348:revealed&&selected&&!right?0xff693948:selected?0xff29486B:SURFACE,16,selected?AQUA:LINE));
      content.addView(item,lp(-1,-2,5,5));item.setOnClickListener(v->{if(revealed)return;if(!multi)selections.clear();if(multi&&selections.contains(idx))selections.remove(idx);else selections.add(idx);show("quiz");});
    }
    if(!revealed){button(content,"Перевірити відповідь",true,()->{if(selections.isEmpty()){toast("Спочатку оберіть відповідь");return;}boolean correct=answerEquals(q);record(q,correct);if(correct)correctSession++;revealed=true;show("quiz");});
      button(content,"Підказка",false,()->new AlertDialog.Builder(this).setTitle("Підказка").setMessage(q.optString("hint")).setPositiveButton("Ясно",null).show());
    }else{info(content,answerEquals(q)?"Влучно!":"Розбір помилки",q.optString("explanation"),answerEquals(q)?AQUA:RED);button(content,quizPos+1<testPool.size()?"Наступне завдання →":"Мій результат →",true,()->{quizPos++;selections.clear();revealed=false;show("quiz");});}
    button(content,"Завершити тренування",false,()->show("practice"));
  }
  boolean isCorrectOption(JSONObject q,int idx){Object value=q.opt("answer");if(value instanceof JSONArray){JSONArray a=(JSONArray)value;for(int i=0;i<a.length();i++)if(a.optInt(i)==idx)return true;return false;}return q.optInt("answer")==idx;}
  boolean answerEquals(JSONObject q){JSONArray opts=q.optJSONArray("options");int count=0;for(int i=0;i<opts.length();i++)if(isCorrectOption(q,i)){count++;if(!selections.contains(i))return false;}return selections.size()==count;}
  void quizDone(){int pct=(int)Math.round(100.0*correctSession/Math.max(1,testPool.size()));
    if(isExam){examBest=Math.max(pct,examBest);award(pct>=80?120:35);save();}
    heroArt(content,7,175);heading(content,"Місію завершено",correctSession+" із "+testPool.size(),"Результат: "+pct+"%. Помилка — це не вирок. Це безкоштовні дані про те, що повторити.");
    if(pct>=80)info(content,"Відмінний політ","Рівень засвоєння високий. Перевірте себе ще раз через день — саме так знання переходять у довготривалу пам’ять.",AQUA);
    else info(content,"Маршрут відновлення","Поверніться до карток і помилок, а потім повторіть спробу. Космологія складна навіть для космологів.",GOLD);
    button(content,"Повторити тест",true,()->startQuiz(null,isExam,isMistakes));button(content,"Попрацювати над помилками →",false,()->startQuiz(null,false,true));button(content,"Повернутися до маршрутів",false,()->show("modules"));
  }
  void revision(){top("ПОВТОРЕННЯ");heading(content,"Не забудьте. Це дорого обійдеться.","Пам’ять теж тренується","Розподілене повторення ефективніше за кількагодинну зустріч із підручником напередодні перевірки.");
    int due=0,wrong=0;long now=System.currentTimeMillis();for(int i=0;i<cards.length();i++){JSONObject c=cards.optJSONObject(i),st=cardStats.optJSONObject(c.optString("id"));if(st==null||st.optLong("due",0)<=now)due++;}
    for(int i=0;i<questions.length();i++){JSONObject st=stats.optJSONObject(questions.optJSONObject(i).optString("id"));if(st!=null&&st.optInt("wrong")>0)wrong++;}
    LinearLayout p=panel(content,SURFACE);p.addView(text(due+" карток готові до повторення",23,GOLD,true));p.addView(text("Перевірка без підказок, а потім — чесна оцінка, наскільки легко згадалося.",14,MUTED,false),lp(-1,-2,8,0));button(p,"Відкрити картки →",true,()->startCards());
    LinearLayout p2=panel(content,SURFACE);p2.addView(text(wrong+" питань, у яких були помилки",22,TEXT,true));p2.addView(text("Окремий тренажер саме за вашою історією відповідей.",14,MUTED,false),lp(-1,-2,8,0));button(p2,"Повторити слабкі місця",false,()->startQuiz(null,false,true));
    heading(content,"Просте правило","Як повторювати","Сьогодні → завтра → через кілька днів. Чесне «не пам’ятаю» кращe за випадкову правильну відповідь.");
    for(int i=0;i<modules.length();i++){JSONObject m=mod(i);LinearLayout item=panel(content,SURFACE);item.addView(text(m.optString("title"),18,TEXT,true));item.addView(text(mastery(m.optString("id"))+"% опрацьованих питань",13,AQUA,false),lp(-1,-2,8,0));item.setOnClickListener(v->{currentModule=m.optString("id");show("lesson");});}
  }
  void startCards(){cardPool.clear();for(int i=0;i<cards.length();i++){JSONObject c=cards.optJSONObject(i),st=cardStats.optJSONObject(c.optString("id"));if(st==null||st.optLong("due",0)<=System.currentTimeMillis())cardPool.add(c);}
    if(cardPool.isEmpty())for(int i=0;i<cards.length();i++)cardPool.add(cards.optJSONObject(i));Collections.shuffle(cardPool);cardPos=0;cardRevealed=false;show("cards");}
  void cardScreen(){top("КАРТКИ ПАМ’ЯТІ");if(cardPos>=cardPool.size()){heading(content,"Повторення завершене","Картки опрацьовано","Відкладене повторення допоможе втримати знання — навіть коли гравітація зайнята своїми справами.");button(content,"До повторення",true,()->show("revision"));return;}
    JSONObject c=cardPool.get(cardPos);content.addView(text((cardPos+1)+" / "+cardPool.size()+"   •   "+module(c.optString("mod")).optString("tag"),12,AQUA,true),lp(-1,-2,20,12));
    heroArt(content,2,135);LinearLayout face=panel(content,0xff1F3151);face.setMinimumHeight(dp(230));face.setGravity(Gravity.CENTER);
    face.addView(text(cardRevealed?"ВІДПОВІДЬ":"ЗГАДАЙТЕ БЕЗ ПІДКАЗКИ",11,cardRevealed?AQUA:GOLD,true));TextView main=text(c.optString(cardRevealed?"back":"front"),cardRevealed?19:24,TEXT,true);main.setGravity(Gravity.CENTER);face.addView(main,lp(-1,-2,22,22));
    if(!cardRevealed){face.setOnClickListener(v->{cardRevealed=true;show("cards");});button(content,"Показати відповідь",true,()->{cardRevealed=true;show("cards");});}
    else{content.addView(text("Як легко було згадати?",16,MUTED,true),lp(-1,-2,15,6));button(content,"Не пам’ятаю ↺",false,()->gradeCard(c,0));button(content,"Із зусиллям ◷",false,()->gradeCard(c,1));button(content,"Легко ✓",true,()->gradeCard(c,2));}
    button(content,"Завершити сеанс",false,()->show("revision"));
  }
  void gradeCard(JSONObject card,int grade){String id=card.optString("id");JSONObject st=cardStats.optJSONObject(id);if(st==null)st=new JSONObject();int streak=grade==0?0:st.optInt("streak",0)+1;
    long delay=grade==0?60000L:grade==1?86400000L*Math.min(5,streak):86400000L*Math.min(45,(int)Math.pow(2,Math.min(5,streak)));
    try{st.put("streak",streak);st.put("due",System.currentTimeMillis()+delay);cardStats.put(id,st);}catch(Exception ignored){}award(grade==0?1:grade==1?4:6);save();cardPos++;cardRevealed=false;show("cards");}
  void startTimeline(){orderPos=random.nextInt(timelines.length());newTimeline();}
  void newTimeline(){timelineOrder.clear();JSONArray e=timelines.optJSONObject(orderPos).optJSONArray("events");for(int i=0;i<e.length();i++)timelineOrder.add(i);Collections.shuffle(timelineOrder);checked=false;show("timeline");}
  void timelineScreen(){top("ХРОНОЛОГІЧНИЙ КОНСТРУКТОР");JSONObject t=timelines.optJSONObject(orderPos);heading(content,"Нам потрібен порядок",""+t.optString("title"),t.optString("intro"));
    JSONArray items=t.optJSONArray("events");for(int i=0;i<timelineOrder.size();i++){int at=timelineOrder.get(i);JSONArray e=items.optJSONArray(at);LinearLayout row=row();row.setPadding(dp(12),dp(11),dp(12),dp(11));row.setBackground(rounded(checked&&at==i?0xff20463E:SURFACE,15,LINE));
      TextView number=text(String.valueOf(i+1),19,GOLD,true);row.addView(number,lp(28,-2,0,0));TextView name=text(e.optString(0)+(checked?"\n"+e.optString(1):""),14,TEXT,checked&&at==i);row.addView(name,new LinearLayout.LayoutParams(0,-2,1));
      if(!checked){final int pos=i;TextView up=button("↑",false,()->swap(pos,-1));up.setMinWidth(dp(43));row.addView(up,lp(43,-2,0,0));TextView down=button("↓",false,()->swap(pos,1));down.setMinWidth(dp(43));row.addView(down,lp(43,-2,0,0));}content.addView(row,lp(-1,-2,5,5));}
    if(!checked)button(content,"Перевірити послідовність",true,()->{boolean ok=true;for(int i=0;i<timelineOrder.size();i++)if(timelineOrder.get(i)!=i)ok=false;checked=true;award(ok?30:5);toast(ok?"Ідеальна хронологія!":"Підсвічено правильні позиції. Розгляньте дати.");show("timeline");});
    else{info(content,"Що запам’ятати","Правильно підсвічені позиції. Періоди переходів у ранньому Всесвіті часто мають модельні оцінки — дивіться підписи.",AQUA);button(content,"Наступна хронологія →",true,()->{orderPos=(orderPos+1)%timelines.length();newTimeline();});button(content,"Спробувати цю ще раз",false,()->newTimeline());}
    button(content,"Інші тренажери",false,()->show("practice"));}
  void swap(int pos,int dir){int next=pos+dir;if(next<0||next>=timelineOrder.size())return;Collections.swap(timelineOrder,pos,next);show("timeline");}
  void startParticles(){particlePool.clear();for(int i=0;i<particles.length();i++)particlePool.add(particles.optJSONObject(i));Collections.shuffle(particlePool);particlePos=0;revealed=false;show("particles");}
  void particleScreen(){top("КЛАСИФІКАТОР ЧАСТИНОК");if(particlePos>=particlePool.size()){heading(content,"Класифікація завершена","Детектор упорався","Кварк — не лептон. Бозон Гіггса — не переносник електромагнетизму. Кілька дрібниць, на яких тримається фізика.");button(content,"Нова спроба",true,()->startParticles());return;}
    JSONObject p=particlePool.get(particlePos);content.addView(text((particlePos+1)+" / "+particlePool.size()+"   •   РОЗПІЗНАЙТЕ ТИП",12,AQUA,true),lp(-1,-2,17,9));heroArt(content,3,190);content.addView(text(p.optString("name"),36,GOLD,true),lp(-1,-2,10,5));content.addView(text("До якої групи належить ця частинка?",17,MUTED,false),lp(-1,-2,0,18));
    for(String g:GROUPS){button(content,g,false,()->{boolean ok=g.equals(p.optString("group"));if(!revealed){award(ok?10:2);revealed=true;new AlertDialog.Builder(this).setTitle(ok?"Правильно!":"Це інша група").setMessage(p.optString("name")+" — "+p.optString("group")+".").setPositiveButton("Наступна частинка",(d,w)->{particlePos++;revealed=false;show("particles");}).setCancelable(false).show();}});}
    button(content,"Закінчити",false,()->show("practice"));}
  void startCases(){casePool.clear();for(int i=0;i<cases.length();i++)casePool.add(cases.optJSONObject(i));Collections.shuffle(casePool);casePos=0;revealed=false;show("cases");}
  void caseScreen(){top("НАУКОВІ РОЗСЛІДУВАННЯ");if(casePos>=casePool.size()){heading(content,"Справу закрито","Ви зібрали докази","Наука — це не віра в гарні зображення. Це запитання, які витримують перевірку.");button(content,"Нові справи",true,()->startCases());return;}
    JSONObject c=casePool.get(casePos);heading(content,"Справа "+(casePos+1)+" із "+casePool.size(),"Що доводять спостереження?",c.optString("question"));
    JSONArray a=c.optJSONArray("answers");for(int i=0;i<a.length();i++){final int idx=i;button(content,(i+1)+".  "+a.optString(i),false,()->{if(revealed)return;revealed=true;boolean ok=idx==c.optInt("correct");award(ok?15:3);new AlertDialog.Builder(this).setTitle(ok?"Є доказ!":"Метод треба переглянути").setMessage(c.optString("why")).setPositiveButton("Наступна справа",(d,w)->{casePos++;revealed=false;show("cases");}).setCancelable(false).show();});}
    button(content,"Інші режими",false,()->show("practice"));}
  void labScreen(){top("ФІЗИЧНА ЛАБОРАТОРІЯ");heading(content,"Рівняння замість магії","Космічні обчислення","П’ять тренажерів, де повзунок змінює справжній результат. Моделі мають межі застосовності — фізика образиться, якщо їх ігнорувати.");
    LinearLayout tabs=column();for(int i=0;i<LABS.length;i++){final int k=i;TextView b=button((i+1)+". "+LABS[i],i==labIndex,()->{labIndex=k;show("labs");});tabs.addView(b,lp(-1,-2,3,3));}content.addView(tabs);
    LinearLayout p=panel(content,0xff182846);TextView summary=text("",27,GOLD,true),detail=text("",15,TEXT,false),formula=text("",15,AQUA,true);
    p.addView(text(LABS[labIndex].toUpperCase(Locale.ROOT),11,AQUA,true));p.addView(formula,lp(-1,-2,12,6));p.addView(summary,lp(-1,-2,10,10));p.addView(detail,lp(-1,-2,0,12));
    String[] label={"Червоне зміщення z","Червоне зміщення z","Енергія одного фотона, МеВ","Час від утворення ізотопу, млрд років","Відстань до галактики, Мпк"};
    p.addView(text(label[labIndex],13,MUTED,true));SeekBar seek=new SeekBar(this);seek.setMax(1000);seek.setProgress(400);p.addView(seek,lp(-1,50,10,9));
    final TextView f=formula,sum=summary,d=detail;updateLab(400,f,sum,d);
    seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onProgressChanged(SeekBar b,int v,boolean user){updateLab(v,f,sum,d);}public void onStartTrackingTouch(SeekBar b){}public void onStopTrackingTouch(SeekBar b){}});
    String[] notes={"T(z) = T₀(1+z); T₀ ≈ 2,725 K. Працює для космологічного охолодження фотонного фону.",
      "a = 1/(1+z). Це відношення масштабних факторів, а не відстань до галактики в кілометрах.",
      "E ≥ 2mₑc² = 1,022 МеВ — необхідний енергетичний поріг для створення пари e⁻/e⁺. Не всяка геометрія зіткнення дозволяє процес.",
      "N/N₀ = 2^(−t/T½). Приклад із ураном-238, період напіврозпаду ≈4,468 млрд років. Реальне датування потребує врахування ізотопної системи.",
      "v ≈ H₀d, тут H₀ = 70 км/(с·Мпк). Це наближення для достатньо малих відстаней, а не універсальний закон швидкості для великого z."};
    info(content,"Коли формула працює",notes[labIndex],GOLD);
    button(content,"Перевірити себе у тестах →",true,()->startQuiz(null,false,false));button(content,"Відкрити пояснення в атласі ↗",false,()->openUrl(ATLAS));}
  void updateLab(int tick,TextView formula,TextView value,TextView detail){double p=tick/1000.0;
    switch(labIndex){case 0:{double z=Math.round(1200*p),t=2.725*(1+z);formula.setText("T = 2,725 × (1 + z)");value.setText(nf.format(t)+" K");detail.setText("Для z = "+nf.format(z)+" температура фону була приблизно "+nf.format(t)+" К. Для z≈1100 — майже 3000 K.");break;}
      case 1:{double z=Math.round(1500*p)/100.0,a=1/(1+z);formula.setText("a = 1 / (1 + z)");value.setText(nf.format(a));detail.setText("Червоне зміщення z = "+nf.format(z)+". Всесвіт під час випромінювання мав ≈"+nf.format(a*100)+"% нинішнього масштабного фактора.");break;}
      case 2:{double e=Math.round(5000*p)/1000.0;formula.setText("Eₘᵢₙ = 2mₑc² ≈ 1,022 МеВ");value.setText(nf.format(e)+" МеВ");detail.setText(e>=1.022?"Енергії достатньо для порогу створення e⁻e⁺ за відповідних умов процесу.":"Енергія нижча за масовий поріг пари електрон–позитрон.");break;}
      case 3:{double age=Math.round(100*p)/10.0,portion=Math.pow(2,-age/4.468);formula.setText("N/N₀ = 2 ^ (−t / 4,468)");value.setText(nf.format(portion*100)+"%");detail.setText("Через "+nf.format(age)+" млрд років залишиться ≈"+nf.format(portion*100)+"% вихідних атомів ²³⁸U (за ідеальної замкненої системи).");break;}
      default:{double dist=Math.round(120*p),v=70*dist;formula.setText("v ≈ H₀d");value.setText(nf.format(v)+" км/с");detail.setText("За H₀=70 км/(с·Мпк) та d="+nf.format(dist)+" Мпк одержуємо "+nf.format(v)+" км/с. Для великих z потрібна повна космологічна модель.");}}
  }
  void profile(){top("ВАШ КОСМІЧНИЙ ЖУРНАЛ");heroArt(content,6,190);heading(content,"Поступ, а не перегони","Моя академія","Усі дані зберігаються лише на цьому пристрої. Реєстрація, реклама й надокучливий акаунт не потрібні.");
    LinearLayout score=panel(content,SURFACE);score.addView(text(xp+" XP",35,GOLD,true));score.addView(text("Загальний досвід · "+dailyStreak+" днів навчальної серії",14,MUTED,false));
    String[][] rows={{"Опрацьовані модулі",studied.size()+" / 7"},{"Усі відповіді",String.valueOf(attempts)},{"Правильні відповіді",String.valueOf(correct)},{"Середнє засвоєння",averageMastery()+"%"},{"Найкращий результат заліку",examBest+"%"}};
    for(String[] a:rows){LinearLayout r=row();r.addView(text(a[0],14,MUTED,false),new LinearLayout.LayoutParams(0,-2,1));r.addView(text(a[1],15,TEXT,true));score.addView(r,lp(-1,-2,12,3));}
    heading(content,"Карта знань","Опанування тем","Відсоток — це частка питань, на які хоча б раз було дано правильну відповідь.");for(int i=0;i<modules.length();i++){JSONObject m=mod(i);LinearLayout item=panel(content,SURFACE);item.addView(text(m.optString("title"),16,TEXT,true));barProgress(item,mastery(m.optString("id")));item.addView(text(mastery(m.optString("id"))+"%",13,AQUA,true));}
    button(content,"Пройти підсумковий залік →",true,()->startQuiz(null,true,false));button(content,"Відкрити авторський атлас ↗",false,()->openUrl(ATLAS));
    button(content,"Скинути прогрес цього пристрою",false,()->new AlertDialog.Builder(this).setTitle("Скинути прогрес?").setMessage("Усі локальні відповіді, картки, заліки та XP буде видалено. Повернути їх не вийде.").setNegativeButton("Скасувати",null).setPositiveButton("Стерти",(d,w)->{prefs.edit().clear().apply();xp=attempts=correct=examBest=dailyStreak=0;lastStudyDay=-1;stats=new JSONObject();cardStats=new JSONObject();studied.clear();show("profile");}).show());
    info(content,"Важлива примітка","Стандартна модель надійно перевірена в доступних експериментальних режимах; інфляція та велике об’єднання залишаються класами гіпотез. Наукова впевненість — це шкала, а не кнопка «так / ні».",AQUA);
    content.addView(text("© Навчальні матеріали: Каріна Скринченко. Android-версія: Космічна академія.",12,MUTED,false),lp(-1,-2,18,18));
  }
  @Override public void onBackPressed(){switch(screen){case "home":super.onBackPressed();break;case "lesson":case "modules":show("home");break;case "cards":show("revision");break;case "quiz":case "timeline":case "particles":case "cases":case "labs":show("practice");break;default:show("home");}}

  /** A native procedural illustration rendered directly by Android Canvas, no browser. */
  final class SpaceArt extends View {
    final int kind;final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);final Random rand;
    SpaceArt(Context c,int k){super(c);kind=k;rand=new Random(18838+k);setBackground(rounded(SURFACE,23,LINE));setClipToOutline(true);}
    @Override protected void onDraw(Canvas c){super.onDraw(c);int w=getWidth(),h=getHeight();if(w<=0||h<=0)return;
      paint.setShader(new LinearGradient(0,0,w,h,new int[]{0xff11182f,0xff1a2d4d,0xff101524},null,Shader.TileMode.CLAMP));c.drawRect(0,0,w,h,paint);paint.setShader(null);
      rand.setSeed(18838+kind);for(int i=0;i<120;i++){float x=rand.nextFloat()*w,y=rand.nextFloat()*h,r=.3f+rand.nextFloat()*(i%11==0?2.4f:1.1f);paint.setColor((i%7==0?0x99FFE6BE:0x7FC7DBFF));c.drawCircle(x,y,dp(r),paint);}
      float cx=w*(kind==7?.72f:.69f),cy=h*(kind==1?.56f:.51f),radius=Math.min(w,h)*.35f;
      int orbColor=kind==3?0xff9AECD7:kind==7?0xffFFE29D:0xff96B6FF;
      paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(dp(1.4f));paint.setColor(0x77B6D4FF);
      for(int i=0;i<3;i++){float rr=radius*(.68f+i*.19f);c.save();c.rotate(-21,cx,cy);c.drawOval(cx-rr*1.45f,cy-rr*.6f,cx+rr*1.45f,cy+rr*.6f,paint);c.restore();}
      paint.setStyle(Paint.Style.FILL);paint.setShader(new RadialGradient(cx-radius*.23f,cy-radius*.23f,radius*1.15f,
          new int[]{orbColor,0xff304A88,0xff0B1936},new float[]{0,.45f,1},Shader.TileMode.CLAMP));c.drawCircle(cx,cy,radius*.73f,paint);paint.setShader(null);
      if(kind==3){ // Four interacting fields
        for(int k=0;k<4;k++){double a=k*Math.PI/2;float x=cx+(float)Math.cos(a)*radius*1.24f,y=cy+(float)Math.sin(a)*radius*.94f;paint.setColor(new int[]{GOLD,AQUA,BLUE,RED}[k]);c.drawCircle(x,y,dp(8),paint);}}
      if(kind==6||kind==7){paint.setColor(0xffE6C6A4);c.drawCircle(cx+radius*.8f,cy-radius*.55f,dp(7),paint);}
      paint.setColor(0x66E4B77B);paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(dp(3));c.drawArc(cx-radius*.93f,cy-radius*.93f,cx+radius*.93f,cy+radius*.93f,-10,155,false,paint);paint.setStyle(Paint.Style.FILL);
      paint.setColor(0xffFFCC89);paint.setTypeface(Typeface.create("sans-serif-medium",Typeface.BOLD));paint.setTextSize(dp(11));c.drawText("COSMOS  /  13.8 GYR",dp(17),h-dp(19),paint);
      paint.setColor(0xffB5D2EF);paint.setTextSize(dp(11));c.drawText(kind==3?"QUARKS  •  FIELDS":kind==5?"CMB  •  2.725 K":kind==7?"SOLAR SYSTEM":"TIME  •  MATTER",dp(17),dp(27),paint);
    }
  }
}
