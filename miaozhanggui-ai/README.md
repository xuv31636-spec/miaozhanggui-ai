# 喵掌櫃 AI 貓咪店長（簡單部署版）

這是一個 Next.js 網頁，包含：
- 貓咪店長視覺
- 常見門市問題按鈕
- 自由輸入框
- 三種角色個性與三種分析模式
- AI 即時生成：毒舌吐槽、專業分析、改善方案、七天計畫、KPI
- 後端呼叫 OpenAI Responses API；API 金鑰不會送到瀏覽器

## 一、先在自己的電腦測試

需要安裝 Node.js（建議 20 或更新的 LTS 版本）。

1. 解壓縮專案。
2. 在專案資料夾開啟終端機。
3. 安裝套件：

   ```bash
   npm install
   ```

4. 複製 `.env.example` 並命名為 `.env.local`。
5. 編輯 `.env.local`，填入自己的 API 金鑰：

   ```env
   OPENAI_API_KEY=你的真實API金鑰
   OPENAI_MODEL=gpt-6-astra
   ```

   如果你的 API 專案不能使用 `gpt-6-astra`，請把 `OPENAI_MODEL` 改成你在 API 帳戶中可用的模型名稱。

6. 啟動：

   ```bash
   npm run dev
   ```

7. 在瀏覽器開啟 `http://localhost:3000`。
8. 選「商品很多，顧客卻不太買」，按「召喚喵掌櫃」，確認結果出現在網頁的分區。

## 二、部署到 Vercel（免自行管理伺服器）

1. 將解壓縮後的專案上傳到你自己的 GitHub repository。不要上傳 `.env.local` 或任何 API 金鑰。
2. 登入 Vercel，選 **Add New → Project**，匯入該 repository。
3. 在專案的 **Settings → Environment Variables** 新增：
   - Name：`OPENAI_API_KEY`
   - Value：你的 OpenAI API 金鑰
   - Environment：至少選 Preview；正式展示再選 Production
   - 可選：`OPENAI_MODEL`，Value 設為你帳號可用的模型名稱
4. 按 Deploy。新增或修改環境變數後，要重新部署才會生效。
5. 打開 Vercel 提供的網址，測試預設問題和自訂問題。

## 三、API 金鑰安全（很重要）

- 金鑰只放在 `.env.local` 或部署平台的伺服器環境變數中。
- 不要使用 `NEXT_PUBLIC_OPENAI_API_KEY`，也不要把金鑰寫進 `app/page.jsx`。
- 不要把含金鑰的截圖、日誌或程式碼貼到公開網路。
- 若金鑰曾經上傳到 GitHub 或被公開，立刻在 API 平台撤銷並建立新金鑰。
- 這個範例未包含完整的登入、使用者驗證、速率限制或多租戶控管。公開網址可能被其他人使用並消耗 API 額度。報告展示建議只分享給必要人員；若要公開長期使用，請再加上登入／存取控制、速率限制與用量警示。
- API 使用可能產生費用；ChatGPT 訂閱與 API 計費是分開的。

## 四、測試清單

- [ ] 點選四個預設問題，每個都能取得回答。
- [ ] 自由輸入「顧客只問價格，最後沒有購買」，能回覆相對應內容。
- [ ] 切換三種個性，語氣有差異。
- [ ] 確認結果有吐槽、三個假設、三個行動、七天計畫、兩個 KPI。
- [ ] 停止或移除 `OPENAI_API_KEY` 後，頁面顯示清楚的設定錯誤，不會洩漏金鑰。
- [ ] 手機瀏覽器版面可用。
- [ ] 確認 API 平台有用量／預算監控。

## 五、常見問題

### 顯示「尚未設定 OPENAI_API_KEY」
本機確認 `.env.local` 檔案在專案根目錄；部署後確認 Vercel 環境變數已加入並重新部署。

### 顯示 API 金鑰無效
檢查金鑰是否貼完整、是否被撤銷、API 專案是否有權使用 API。

### 顯示額度不足或請求太頻繁
檢查 API 計費、用量限制與請求頻率。

### 模型名稱錯誤或沒有權限
在 API 帳戶確認可用模型，再調整 `OPENAI_MODEL`。模型可用性依帳戶和平台狀態而異。

### AI 回答不是實際門市數據
本工具是營運腦力激盪與決策輔助，不會自動讀取 POS。若要做數據分析，需要另外設計安全的資料匯入與權限控管流程。

## 技術參考

- OpenAI API Quickstart: https://developers.openai.com/api/docs/quickstart
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Deploy from CLI: https://vercel.com/docs/projects/deploy-from-cli
