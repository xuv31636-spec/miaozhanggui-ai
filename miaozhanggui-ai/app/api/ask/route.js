import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, systemInstruction } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' }, { status: 500 });
    }

    // 組合系統提示詞與使用者訊息
    const promptText = `${systemInstruction || '你是一個專業的店長助手。'}\n\n使用者詢問：${message}`;

    // 呼叫 Google Gemini 1.5 Flash 免費 API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Gemini API 發生錯誤');
    }

    // 取得 Gemini 回傳的文字內容
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '無法取得 AI 回覆';

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
