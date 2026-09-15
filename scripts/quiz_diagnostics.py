from pathlib import Path
import base64,gzip,json,re
ROOT=Path(__file__).resolve().parents[1]
out={}

p=ROOT/'profesii-9/02-sylni-storony-kompetentnosti/payload.b64'
raw=p.read_text(encoding='utf-8').strip()
html=gzip.decompress(base64.b64decode(raw)).decode('utf-8')

def snippets(text, pattern, radius=900):
    hits=[]
    for m in re.finditer(pattern,text,re.I):
        hits.append(text[max(0,m.start()-radius):min(len(text),m.end()+radius)])
        if len(hits)>=8: break
    return hits

out['profesii-9/02']={
    'length':len(html),
    'getContext':snippets(html,r'getContext'),
    'quiz_words':snippets(html,r'тест|quiz|startQuiz|startTest|розпочати|почати тест',700),
    'canvas_tags':re.findall(r'<canvas\b[^>]*>',html,re.I),
    'buttons':re.findall(r'<button\b[^>]*>.*?</button>',html,re.I|re.S)[:30],
    'inputs':re.findall(r'<(?:input|select)\b[^>]*>',html,re.I)[:50],
    'ids':re.findall(r'\bid=["\']([^"\']+)',html,re.I),
    'script_tails':[s[-2200:] for s in re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.I|re.S)],
}

p10=ROOT/'10/06-pryrodni-umovy-resursy-yevropy/index.html'
h10=p10.read_text(encoding='utf-8')
out['10/06']={
    'length':len(h10),
    'startQuiz':snippets(h10,r'startQuiz',1200),
    'checkQuiz':snippets(h10,r'checkQuiz',1200),
    'tail':h10[-4500:],
}
Path('quiz-diagnostics.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('wrote quiz-diagnostics.json')
