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

請**務必**嚴格回傳一個符合以下欄位的 JSON 物件，不要帶任何 Markdown 標記，直接輸出 JSON 字串：
{
  "roast": "一句毒舌又幽默的吐槽重點",
  "analysis": ["分析點1", "分析點2", "分析點3"],
  "actions": ["行動方案1", "行動方案2", "行動方案3"],
  "seven_day_plan": "未來一週的7天執行計畫總結",
  "kpis": ["追蹤指標1", "追蹤指標2"],
  "cautions": "特別注意事項與提醒"
}
`;

    // 呼叫 Google Gemini API (使用 gemini-2.5-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Gemini API 發生錯誤');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('未取得 Gemini API 的有效文字回覆');
    }

    let resultJson;
    try {
      resultJson = JSON.parse(rawText);
    } catch (e) {
      resultJson = {
        roast: rawText.slice(0, 100),
        analysis: ["請檢視商品定價與價值傳達", "客人不買單常與價值感知有關"],
        actions: ["重新優化商品 POP 介紹說明", "加強店員話術培訓"],
        seven_day_plan: "前3天盤點高單價商品，後4天調整陳列與體驗話術。",
        kpis: ["客單價提升 5%", "客單轉化率提高"],
        cautions: "切忌盲目降價破壞品牌價值與利潤。"
      };
    }

    return NextResponse.json(resultJson);

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
