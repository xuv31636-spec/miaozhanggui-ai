import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, systemInstruction } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' }, { status: 500 });
    }

    const promptText = `${systemInstruction || '你是一個專業的門市店長助手。'}\n\n使用者詢問：${message}`;

    // 嘗試呼叫 Gemini 1.5 Flash
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    let data = await response.json();

    // 如果 1.5-flash 找不到，自動嘗試 2.0-flash 或 gemini-pro
    if (data.error && data.error.code === 404) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
      data = await response.json();
    }

    if (data.error) {
      throw new Error(data.error.message || 'Gemini API 發生錯誤');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '無法取得 AI 回覆';

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
