import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, systemInstruction } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' }, { status: 500 });
    }

    const promptText = `${systemInstruction || '你是一個專業的門市店長助手。'}\n\n使用者詢問：${message}`;

    // 定義可使用的模型順序清單
    const models = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'
    ];

    let reply = null;
    let lastError = null;

    // 依序嘗試不同模型名稱，直到成功為止
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
          break; // 成功取得回覆，跳出迴圈
        } else if (data.error) {
          lastError = data.error.message;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!reply) {
      throw new Error(lastError || '無法從 Gemini API 取得有效回覆');
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('API 呼叫失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
