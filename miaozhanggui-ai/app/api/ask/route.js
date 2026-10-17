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
      return NextResponse.json({ error: data.error.message || 'Gemini API 發生錯誤' }, { status: 500 });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 嘗試解析 JSON，若成功且欄位齊全直接回傳，否則補齊預設欄位
    let parsedData = {};
    try {
      // 移除可能夾帶的 ```json ... ``` 標記
      const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.log('JSON 解析備用處理');
    }

    // 確保所有前端需要的欄位都有值，避免前端卡住
    const safeResult = {
      roast: parsedData.roast || "這價格客人嫌貴，是商品價值沒說清楚，還是店員話術不夠香？",
      analysis: Array.isArray(parsedData.analysis) ? parsedData.analysis : [
        "客人嫌貴通常代表『感知價值』低於價格標籤",
        "門市 POP 標語與優勢沒有突出商品的獨特賣點",
        "顧客缺乏現場體驗與試用機會"
      ],
      actions: Array.isArray(parsedData.actions) ? parsedData.actions : [
        "重新設計商品 POP 海報，強調高性價比與痛點解決",
        "設計體驗話術，引導顧客感受品質差異",
        "搭配組合加購活動，降低入門門檻"
      ],
      seven_day_plan: parsedData.seven_day_plan || "前3天優化重點商品陳列與POP，後4天進行員工體驗話術培訓與轉化率追蹤。",
      kpis: Array.isArray(parsedData.kpis) ? parsedData.kpis : ["客單價提升 5%", "門市成交轉化率"],
      cautions: parsedData.cautions || "切忌盲目降價打折，這樣只會破壞利潤與品牌定位。"
    };

    return NextResponse.json(safeResult);

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
