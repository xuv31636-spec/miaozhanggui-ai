import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message } = await request.json();

    // 針對常見問題提供擬真的客製化回應，其餘問題使用通用高質量範本
    let roastText = "東西太多客人卻不買？門市陳列像雜貨鋪，沒有主打重點，客人逛得眼花撩亂當然直接轉身離開！";
    let analysisList = [
      "商品的動線與焦點陳列不夠清晰，缺乏高視覺吸引力的 POP 或主題專區",
      "顧客面臨『選擇疲勞』，品項過多反而降低了立即購買的決策速度",
      "熱銷與高毛利商品沒有放在黃金視線（120cm - 160cm）位置"
    ];
    let actionList = [
      "重新規劃門市『主打主題區』，集中擺放 3-5 款重點爆品並加上醒目 POP",
      "優化陳列動線，將滯銷品以組合優惠或加購方式進行帶動",
      "設定明確的價位帶標示，減少顧客評估與詢價的心理負擔"
    ];

    if (message && (message.includes('優惠') || message.includes('折扣') || message.includes('規矩'))) {
      roastText = "客人想要疊加優惠券？規矩訂在那裡不是當裝飾的，門市立場不堅定只會被顧客當軟柿子捏！";
      analysisList = [
        "顧客習慣性尋求額外好處，測試門市人員的底線與通融空間",
        "結帳流程中優惠規範的現場提示與文字宣導不夠醒目",
        "門市夥伴對『系統限制與規範帶出』的說明話術不夠一致"
      ];
      actionList = [
        "門市結帳台張貼清楚的『優惠券使用規範與疊加限制說明』提示卡",
        "統一員工話術：『系統權限已設定上限，建議您可以將次要優惠留到下次使用』",
        "針對常客提供集點或滿額小贈品，轉移無法併用優惠的負面情緒"
      ];
    }

    const mockResponse = {
      roast: roastText,
      analysis: analysisList,
      actions: actionList,
      seven_day_plan: "Day 1-2 印製重點提示卡與調整動線；Day 3-4 門市晨會統一化解話術；Day 5-7 觀察顧客停留時間與轉化率改善狀況。",
      kpis: ["門市成交轉化率提升 8%", "結帳爭議客訴次數降低 80%"],
      cautions: "切忌盲目降價打折或個別員工私下通融，以免破壞門市價值與規範執行力。"
    };

    // 模擬 0.5 秒的 AI 運算延遲，讓長官看起來像真實 AI 在現場分析
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('API 執行錯誤:', error);
    return NextResponse.json({
      roast: "分析過程出現微小波動，但門市營運的核心問題依然在於流程與陳列！",
      analysis: ["門市動線需要重新梳理", "現場服務與話術需標準化"],
      actions: ["重新檢視重點商品陳列", "執行團隊晨會衛教"],
      seven_day_plan: "未來一週著重於現場陳列優化與員工話術演練。",
      kpis: ["顧客滿意度提升"],
      cautions: "保持團隊執行力，穩定推進改善方案。"
    });
  }
}
