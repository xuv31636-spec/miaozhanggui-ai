import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, systemInstruction } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' }, { status: 500 });
    }

    const promptText = `${systemInstruction || '你是一個專業的門市店長助手。'}\n\n使用者詢問：${message}`;

    // 正確的 Gemini API 模型路徑 (帶有 models/ 前綴)
    const models = [
      'models/gemini-1.5-flash',
      'models/gemini-1.5-flash-latest',
      'models/gemini-1.5-pro'
    ];

    let reply = null;
    let lastError = null;

    for (const modelPath of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`,
          {
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
          }
        );

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
          break; // 成功回覆，停止嘗試
        } else if (data.error) {
          lastError = data.error.message;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!reply) {
      throw new Error(lastError || '無法取得 AI 回覆');
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
