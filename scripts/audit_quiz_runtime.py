from __future__ import annotations

import json
import re
import threading
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "quiz-audit.json"
LESSON_RE = re.compile(r"^(?:5|6|7|8|9|10|11|profesii-(?:8|9|10|11))/[^/]+/index\.html$")


def visible(el) -> bool:
    try:
        return el.is_displayed()
    except WebDriverException:
        return False


def grade_from_path(rel: str) -> str:
    top = rel.split("/", 1)[0]
    m = re.search(r"(\d+)", top)
    return (m.group(1) if m else "7") + "-А"


def find_start(driver):
    selectors = [
        "#startQuiz", "#startTest", "#quizStart", "#testStart",
        "[data-start-quiz]", "[data-start-test]",
        "button[id*='start'][id*='quiz' i]", "button[id*='start'][id*='test' i]",
    ]
    for sel in selectors:
        try:
            for el in driver.find_elements(By.CSS_SELECTOR, sel):
                if visible(el):
                    return el
        except Exception:
            pass
    xpath = "//*[self::button or self::a or self::input][contains(translate(normalize-space(string(.)),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'тест')]"
    for el in driver.find_elements(By.XPATH, xpath):
        txt = (el.text or el.get_attribute("value") or "").lower()
        if visible(el) and any(k in txt for k in ("поч", "розпоч", "старт")):
            return el
    return None


def find_identity_field(driver, kind: str):
    if kind == "name":
        keys = ("fullname", "full-name", "studentname", "student-name", "pib", "fio")
        words = ("ім’я", "ім'я", "прізвище", "піб", "пiб")
    else:
        keys = ("studentclass", "student-class", "class", "grade")
        words = ("клас",)
    fields = driver.find_elements(By.CSS_SELECTOR, "input,select")
    for el in fields:
        blob = " ".join(filter(None, [el.get_attribute("id"), el.get_attribute("name"), el.get_attribute("placeholder"), el.get_attribute("aria-label")])).lower()
        if visible(el) and any(k in blob for k in keys + words):
            return el
    for label in driver.find_elements(By.TAG_NAME, "label"):
        text = (label.text or "").lower()
        if any(w in text for w in words):
            target = label.get_attribute("for")
            if target:
                try:
                    el = driver.find_element(By.ID, target)
                    if visible(el):
                        return el
                except Exception:
                    pass
            try:
                el = label.find_element(By.CSS_SELECTOR, "input,select")
                if visible(el):
                    return el
            except Exception:
                pass
    return None


def fill_field(el, value: str):
    tag = el.tag_name.lower()
    if tag == "select":
        sel = Select(el)
        options = [o for o in sel.options if o.is_enabled() and (o.get_attribute("value") or o.text).strip()]
        wanted = value.split("-", 1)[0]
        for o in options:
            if wanted in (o.text or ""):
                sel.select_by_visible_text(o.text)
                return
        if options:
            sel.select_by_visible_text(options[0].text)
            return
        raise RuntimeError("немає доступного значення класу")
    el.clear()
    el.send_keys(value)


def quiz_state(driver):
    return driver.execute_script(r"""
      const vis = e => {
        if (!e) return false;
        const s=getComputedStyle(e), r=e.getBoundingClientRect();
        return !e.hidden && s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;
      };
      const all=[...document.querySelectorAll('*')];
      const candidates=all.filter(e => /(^|\s|[-_])(quiz|test)(\s|[-_]|$)/i.test(`${e.id||''} ${typeof e.className==='string'?e.className:''}`));
      const data=candidates.map(e=>{
        const controls=e.querySelectorAll('input[type=radio],input[type=checkbox],select,textarea').length;
        const q=e.querySelectorAll('.question,.quiz-question,.test-question,[data-question],fieldset').length;
        return {id:e.id||'', cls:typeof e.className==='string'?e.className:'', visible:vis(e), hidden:e.hidden, controls, q, text:(e.innerText||'').slice(0,120)};
      });
      const visibleControls=[...document.querySelectorAll('input[type=radio],input[type=checkbox]')].filter(vis).length;
      const visibleQuestions=[...document.querySelectorAll('.question,.quiz-question,.test-question,[data-question],fieldset')].filter(vis).length;
      return {data, visibleControls, visibleQuestions};
    """)


def opened(before, after) -> bool:
    if after["visibleControls"] > before["visibleControls"] and after["visibleControls"] > 0:
        return True
    if after["visibleQuestions"] > before["visibleQuestions"] and after["visibleQuestions"] > 0:
        return True
    before_map={(x["id"],x["cls"]):(x["visible"],x["controls"],x["q"]) for x in before["data"]}
    for x in after["data"]:
        if not x["visible"]:
            continue
        if x["controls"] >= 1 or x["q"] >= 1:
            old=before_map.get((x["id"],x["cls"]),(False,0,0))
            if not old[0] or x["controls"] > old[1] or x["q"] > old[2]:
                return True
    return False


def severe_js_errors(driver):
    out=[]
    try:
        logs=driver.get_log("browser")
    except Exception:
        return out
    for item in logs:
        msg=item.get("message","")
        if item.get("level") == "SEVERE" and any(k in msg for k in ("Uncaught", "SyntaxError", "ReferenceError", "TypeError")):
            out.append(msg[:500])
    return out


def main():
    lesson_files=sorted(p for p in ROOT.rglob("index.html") if LESSON_RE.match(p.relative_to(ROOT).as_posix()))
    server=ThreadingHTTPServer(("127.0.0.1", 8765), SimpleHTTPRequestHandler)
    server_thread=threading.Thread(target=server.serve_forever, daemon=True)
    import os
    os.chdir(ROOT)
    server_thread.start()

    opts=webdriver.ChromeOptions()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,1600")
    opts.set_capability("goog:loggingPrefs", {"browser":"ALL"})
    driver=webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(25)

    results=[]
    try:
        for path in lesson_files:
            rel=path.relative_to(ROOT).as_posix()
            url="http://127.0.0.1:8765/" + "/".join(quote(x) for x in rel.split("/"))
            rec={"path":rel,"status":"unknown","errors":[]}
            try:
                driver.get(url)
                time.sleep(0.9)
                body=(driver.find_element(By.TAG_NAME,"body").text or "").lower()
                start=find_start(driver)
                if "тест" not in body and start is None:
                    rec["status"]="no-test"
                    results.append(rec)
                    continue
                if start is None:
                    rec["status"]="broken"
                    rec["errors"].append("Є згадка/блок тесту, але не знайдено видимої кнопки запуску тесту.")
                    rec["errors"].extend(severe_js_errors(driver))
                    results.append(rec)
                    continue
                before=quiz_state(driver)
                name=find_identity_field(driver,"name")
                klass=find_identity_field(driver,"class")
                if name is None or klass is None:
                    rec["status"]="broken"
                    rec["errors"].append("Не знайдено видимі поля ПІБ і/або класу біля тестового шлюзу.")
                    rec["errors"].extend(severe_js_errors(driver))
                    results.append(rec)
                    continue
                fill_field(name,"Тест Учень")
                fill_field(klass,grade_from_path(rel))
                driver.execute_script("arguments[0].scrollIntoView({block:'center'});", start)
                time.sleep(0.1)
                try:
                    start.click()
                except Exception:
                    driver.execute_script("arguments[0].click();", start)
                time.sleep(0.7)
                after=quiz_state(driver)
                js=severe_js_errors(driver)
                if opened(before,after):
                    rec["status"]="ok"
                else:
                    rec["status"]="broken"
                    rec["errors"].append("Після валідного ПІБ/класу та натискання старту питання тесту не стали видимими.")
                rec["errors"].extend(js)
            except Exception as e:
                rec["status"]="broken"
                rec["errors"].append(f"Runtime audit exception: {type(e).__name__}: {e}")
            results.append(rec)
            print(f"{rec['status']:7} {rel}" + (" :: " + " | ".join(rec["errors"]) if rec["errors"] else ""), flush=True)
    finally:
        driver.quit()
        server.shutdown()

    summary={
        "lesson_pages":len(results),
        "tests_ok":sum(r["status"]=="ok" for r in results),
        "broken":sum(r["status"]=="broken" for r in results),
        "no_test":sum(r["status"]=="no-test" for r in results),
    }
    REPORT.write_text(json.dumps({"summary":summary,"results":results},ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(summary,ensure_ascii=False), flush=True)
    if summary["broken"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
