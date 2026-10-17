
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // 與前端 page.jsx 的欄位名稱保持一致
    const { problem, personality, mode } = body;

    if (typeof problem !== "string" || !problem.trim()) {
      return NextResponse.json(
        { error: "請先輸入要分析的門市問題。" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("缺少 GEMINI_API_KEY");
      return NextResponse.json(
        { error: "伺服器尚未設定 Gemini API 金鑰，請檢查 Vercel 環境變數。" },
        { status: 500 }
      );
    }

    const promptText = `
你是「喵掌櫃」，一位熟悉寵物用品門市營運的 AI 顧問。

店長個性：${personality || "毒舌幽默"}
分析模式：${mode || "門市營運診斷"}

請使用繁體中文，根據以下問題提供具體、可執行的建議。
不可捏造實際銷售數據；未知資訊請標示為待確認。
語氣應符合所選的店長個性，建議應符合所選的分析模式。

使用者的門市問題：
${problem.trim()}

請只輸出 JSON，不要加入 Markdown 或程式碼區塊。
JSON 必須符合以下結構：
{
  "roast": "一句幽默且切中問題的吐槽",
  "analysis": ["分析點1", "分析點2", "分析點3"],
  "actions": ["行動方案1", "行動方案2", "行動方案3"],
  "seven_day_plan": "清楚說明第1天至第7天的執行安排",
  "kpis": ["追蹤指標1", "追蹤指標2"],
  "cautions": "注意事項與風險提醒"
}

所有欄位都必須提供內容。analysis、actions、kpis 必須是字串陣列。
`;

    const apiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                roast: { type: "STRING" },
                analysis: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                actions: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                seven_day_plan: { type: "STRING" },
                kpis: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                cautions: { type: "STRING" },
              },
              required: [
                "roast",
                "analysis",
                "actions",
                "seven_day_plan",
                "kpis",
                "cautions",
              ],
            },
          },
        }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API 錯誤：", data.error?.message);

      return NextResponse.json(
        {
          error:
            data.error?.message ||
            `Gemini API 請求失敗（HTTP ${apiResponse.status}）`,
        },
        { status: 502 }
      );
    }

    const rawText =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!rawText) {
      console.error(
        "Gemini 沒有產生文字，finishReason：",
        data.candidates?.[0]?.finishReason
      );

      return NextResponse.json(
        { error: "AI 沒有產生分析內容，請再試一次。" },
        { status: 502 }
      );
    }

    let result;

    try {
      result = JSON.parse(rawText);
    } catch {
      console.error("Gemini 回傳的內容不是有效 JSON：", rawText);

      return NextResponse.json(
        { error: "AI 回覆格式異常，請再分析一次。" },
        { status: 502 }
      );
    }

    // 檢查必要欄位，避免前端因資料格式錯誤而中斷
    const valid =
      typeof result.roast === "string" &&
      Array.isArray(result.analysis) &&
      result.analysis.every((item) => typeof item === "string") &&
      Array.isArray(result.actions) &&
      result.actions.every((item) => typeof item === "string") &&
      typeof result.seven_day_plan === "string" &&
      Array.isArray(result.kpis) &&
      result.kpis.every((item) => typeof item === "string") &&
      typeof result.cautions === "string";

    if (!valid) {
      return NextResponse.json(
        { error: "AI 回傳的報告欄位不完整，請再試一次。" },
        { status: 502 }
      );
    }

    // 直接回傳報告物件，前端要使用 setResult(data)
    return NextResponse.json(result);
  } catch (error) {
    console.error("API 呼叫失敗：", error);

    return NextResponse.json(
      { error: "伺服器處理失敗，請稍後再試。" },
      { status: 500 }
    );
  }
}
