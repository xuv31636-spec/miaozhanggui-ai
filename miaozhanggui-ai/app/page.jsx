"use client";

import { useState } from "react";

const quickQuestions = [
  "商品很多，顧客卻不太買",
  "最近門市業績下滑",
  "有些商品一直賣不掉",
  "員工很忙但效率不高"
];

export default function Home() {
  const [problem, setProblem] = useState(quickQuestions[0]);
  const [customProblem, setCustomProblem] = useState("");
  const [personality, setPersonality] = useState("毒舌幽默");
  const [mode, setMode] = useState("門市營運診斷");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
async function askCat() {
  const question = (customProblem.trim() || problem).trim();

  if (!question) {
    setError("先告訴本喵，你的門市遇到什麼問題。");
    return;
  }

  setLoading(true);
  setError("");
  setResult(null);

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problem: question,
        personality,
        mode,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || `請求失敗，HTTP ${response.status}`
      );
    }

    // 後端直接回傳報告物件，不是 { result: ... }
    if (
      !data ||
      typeof data.roast !== "string" ||
      !Array.isArray(data.analysis) ||
      !Array.isArray(data.actions) ||
      typeof data.seven_day_plan !== "string" ||
      !Array.isArray(data.kpis) ||
      typeof data.cautions !== "string"
    ) {
      throw new Error("收到的分析報告格式不正確，請重新嘗試。");
    }

    setResult(data);

    // 分析完成後，捲動到報告區域
    setTimeout(() => {
      document
        .querySelector(".results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } catch (err) {
    console.error("喵掌櫃分析失敗：", err);
    setError(
      err.message || "連線失敗，請確認網路與 API 設定後再試。"
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero-cat" aria-label="貓咪店長插畫" role="img">
          <div className="cat-ears"><i /><i /></div>
          <div className="cat-face">
            <div className="cat-eyes"><i /><i /></div>
            <div className="cat-nose" />
            <div className="cat-mouth">⌁</div>
            <div className="cat-whiskers left">≋</div>
            <div className="cat-whiskers right">≋</div>
          </div>
          <div className="cat-tie">◆</div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">AI PET STORE MANAGER</p>
          <h1>喵掌櫃 <span>🐾</span></h1>
          <p className="hero-subtitle">專治門市疑難雜症的貓店長</p>
          <p className="hero-quote">「有問題就說，別讓本喵浪費午睡時間。」</p>
          <div className="hero-tags"><span>毒舌吐槽</span><span>營運分析</span><span>實際行動</span></div>
        </div>
      </header>

      <section className="workspace">
        <div className="section-heading">
          <span className="step">01</span>
          <div><h2>今天要解決什麼？</h2><p>點選一個問題，或直接輸入門市現況。</p></div>
        </div>
        <div className="question-grid">
          {quickQuestions.map((q, i) => (
            <button key={q} className={`question-card ${problem === q ? "selected" : ""}`} onClick={() => setProblem(q)} type="button">
              <span className="question-icon">{["🛒", "📉", "📦", "👥"][i]}</span>
              <span>{q}</span><span className="card-arrow">↗</span>
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="customProblem">或輸入自己的問題</label>
        <textarea id="customProblem" value={customProblem} onChange={e => setCustomProblem(e.target.value)} placeholder="例如：顧客常常只問價格，最後卻沒有購買……" rows={3} maxLength={1200} />

        <div className="settings-grid">
          <div>
            <label className="field-label" htmlFor="personality">貓店長個性</label>
            <select id="personality" value={personality} onChange={e => setPersonality(e.target.value)}>
              <option>毒舌幽默</option><option>專業冷靜</option><option>創意反轉</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="mode">分析模式</label>
            <select id="mode" value={mode} onChange={e => setMode(e.target.value)}>
              <option>門市營運診斷</option><option>低成本改善實驗</option><option>創意經營提案</option>
            </select>
          </div>
        </div>

        <button className="ask-button" onClick={askCat} disabled={loading}>
          {loading ? <><span className="spinner" /> 喵掌櫃思考中…</> : <>✨ 召喚喵掌櫃，分析我的問題 <span>→</span></>}
        </button>
        <p className="privacy-note">請勿輸入顧客姓名、電話、會員編號或其他個人資料。</p>

        {error && <div className="error-box" role="alert"><strong>喵！遇到問題了</strong><p>{error}</p><small>請確認後端 API 金鑰與模型設定已完成。</small></div>}

        {result && (
          <section className="results" aria-live="polite">
            <div className="results-header"><div><p className="eyebrow">CAT MANAGER REPORT</p><h2>喵掌櫃的診斷報告</h2></div><span className="live-pill">AI 已回覆</span></div>
            <article className="result-card roast"><div className="result-title"><span>😼</span><h3>01 / 毒舌吐槽</h3></div><p>{result.roast}</p></article>
            <article className="result-card"><div className="result-title"><span>🔎</span><h3>02 / 專業分析</h3></div><ul>{result.analysis.map((item, i) => <li key={i}>{item}</li>)}</ul><p className="caveat">以上原因是待驗證假設，不代表已確認的門市事實。</p></article>
            <article className="result-card"><div className="result-title"><span>🧠</span><h3>03 / 改善方案</h3></div><ul>{result.actions.map((item, i) => <li key={i}>{item}</li>)}</ul></article>
            <article className="result-card action"><div className="result-title"><span>🐾</span><h3>04 / 七天行動計畫</h3></div><p>{result.seven_day_plan}</p></article>
            <article className="result-card"><div className="result-title"><span>📊</span><h3>05 / 成效指標與注意事項</h3></div><ul>{result.kpis.map((item, i) => <li key={i}>{item}</li>)}</ul><p className="caveat">{result.cautions}</p></article>
            <button className="secondary-button" onClick={askCat} disabled={loading}>↻ 再分析一次</button>
          </section>
        )}
      </section>
      <footer><strong>喵掌櫃宣言</strong><p>「先別急著花錢。先找出問題，再用小實驗證明誰才是對的。」</p><small>AI 提供的是決策輔助；實際執行前，請由門市主管核對現況與商品資訊。</small></footer>
    </main>
  );
}
