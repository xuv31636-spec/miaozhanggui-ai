import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = {
  type: "object",
  properties: {
    roast: { type: "string" },
    analysis: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    actions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    seven_day_plan: { type: "string" },
    kpis: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
    cautions: { type: "string" }
  },
  required: ["roast", "analysis", "actions", "seven_day_plan", "kpis", "cautions"],
  additionalProperties: false
};

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "尚未設定 OPENAI_API_KEY。請在本機 .env.local 或部署平台的環境變數中設定，再重新啟動／部署。" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "收到的資料格式不正確。" }, { status: 400 });
  }

  const problem = typeof body.problem === "string" ? body.problem.trim() : "";
  const personality = ["毒舌幽默", "專業冷靜", "創意反轉"].includes(body.personality) ? body.personality : "毒舌幽默";
  const mode = ["門市營運診斷", "低成本改善實驗", "創意經營提案"].includes(body.mode) ? body.mode : "門市營運診斷";

  if (!problem) return NextResponse.json({ error: "請先輸入門市問題。" }, { status: 400 });
  if (problem.length > 1200) return NextResponse.json({ error: "問題太長，請縮短到 1200 字以內。" }, { status: 400 });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      instructions: `你是「喵掌櫃 AI 貓咪店長」，為寵物用品門市提供繁體中文營運建議。
個性：${personality}。分析模式：${mode}。
請以有趣但專業的語氣回答，避免羞辱特定員工或顧客。
使用者的問題可能缺乏數據；不可捏造銷售數字、門市現況、商品功效或顧客行為。
analysis 必須列出恰好三個可能原因，每一項都以「待驗證假設：」開頭。
actions 必須是三個可執行、具體且符合一般寵物用品門市情境的方案。
seven_day_plan 要提供低成本、七天內可啟動的測試步驟。
kpis 必須有恰好兩個可觀察或可計算的指標；沒有基準數據時，說明先建立基準，不可虛構目標成效。
cautions 要說明資料不足、可能的混淆因素或執行注意事項。
若問題涉及動物健康、飼料安全或醫療，提醒使用者核對產品標示並諮詢合格獸醫，不要作診斷。`,
      input: problem,
      text: {
        format: {
          type: "json_schema",
          name: "cat_manager_report",
          strict: true,
          schema
        }
      },
      max_output_tokens: 1200
    });

    const result = JSON.parse(response.output_text);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Cat manager API error:", error?.message || error);
    if (error?.status === 401) {
      return NextResponse.json({ error: "API 金鑰無效，請檢查伺服器端的 OPENAI_API_KEY。" }, { status: 502 });
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: "API 額度不足或請求太頻繁，請檢查 API 計費／使用限制後再試。" }, { status: 429 });
    }
    return NextResponse.json({ error: "AI 暫時無法完成回覆。請檢查模型名稱、API 權限與部署日誌後重試。" }, { status: 502 });
  }
}
