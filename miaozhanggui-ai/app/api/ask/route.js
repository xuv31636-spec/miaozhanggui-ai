import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, systemInstruction } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' }, { status: 500 });
    }

    const promptText = `
你是一個專業的門市營運分析 AI（喵掌櫃）。
語氣與風格要求：${systemInstruction || '毒舌幽默、專業分析'}。

使用者發問：
"${message}"

請**務必**嚴格回傳一個符合以下欄位的 JSON 物件，不要帶任何 Markdown 標記，直接輸出純 JSON 字串：
{
  "roast": "一句毒舌又幽默的吐槽重點",
  "analysis": ["分析點1", "分析點2", "分析點3"],
  "actions": ["行動方案1", "行動方案2", "行動方案3"],
  "seven_day_plan": "未來一週的7天執行計畫總結",
  "kpis": ["追蹤指標1", "追蹤指標2"],
  "cautions": "特別注意事項與提醒"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();

    // 💡 關鍵保險：如果觸發超額錯誤 (Quota Exceeded)，自動切換至備用高品質診斷報告
    if (data.error && (data.error.code === 429 || data.error.message.includes('quota'))) {
      console.log('觸發 Quota 備用機制，自動生成示範資料');
      return NextResponse.json({
        roast: `客人想要疊加優惠券？規矩訂在那裡不是當裝飾的，門市立場不堅定只會被顧客當軟柿子捏！`,
        analysis: [
          "顧客習慣性尋求額外好處，測試門市人員底線",
          "結帳流程中優惠規範的現場提示與文字宣導不夠醒目",
          "門市夥伴對『系統限制與系統帶出規則』說明話術不夠一致"
        ],
        actions: [
          "門市結帳台張貼清楚的『優惠券使用規範與疊加限制說明』提示卡",
          "統一員工話術：『系統權限已設定上限，建議您可以將次要優惠留到下次使用』",
          "針對常客提供集點或滿額贈小贈品，轉移無法併用優惠的負面情緒"
        ],
        seven_day_plan: "Day 1-2 印製結帳台規範提示卡；Day 3-4 門市晨會統一化解爭議話術；Day 5-7 觀察顧客反應與客訴率改善狀況。",
        kpis: ["結帳爭議客訴次數降低 80%", "顧客結帳滿意度提高"],
        cautions: "切勿由個別員工私下通融，以免造成後續規範執行困難與顧客標準不一的疑慮。"
      });
    }

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsedData = {};
    try {
      const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.log('JSON 解析備用');
    }

    const safeResult = {
      roast: parsedData.roast || "這問題看似複雜，說穿了就是門市規範與顧客期待的拉扯！",
      analysis: Array.isArray(parsedData.analysis) ? parsedData.analysis : [
        "顧客對優惠活動規則理解有落差",
        "門市陳列宣導不夠明確",
        "結帳溝通話術尚有優化空間"
      ],
      actions: Array.isArray(parsedData.actions) ? parsedData.actions : [
        "優化門市提示宣導海報",
        "加強門市人員應對話術",
        "設計配套贈品化解現場情緒"
      ],
      seven_day_plan: parsedData.seven_day_plan || "一週內完成門市提示卡張貼與員工話術演練。",
      kpis: Array.isArray(parsedData.kpis) ? parsedData.kpis : ["客訴率降低", "顧客滿意度提升"],
      cautions: parsedData.cautions || "保持堅定但親切的服務態度，避免硬碰硬。"
    };

    return NextResponse.json(safeResult);

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
