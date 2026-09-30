# 專案開發規範

## 技術限制

- 這是純前端專案，只使用 HTML、CSS、原生 JavaScript。
- 禁止引入任何框架或套件，不要建立 `package.json`，不要執行 `npm install`。
- 不要引用外部 CDN，所有功能必須能離線運作。
- 檔案結構固定為根目錄的 `index.html`、`styles.css`、`app.js`。

## 程式風格

- 註解一律使用繁體中文。
- 變數與函式命名使用英文 camelCase。
- CSS 顏色一律使用 `:root` 定義的 CSS 變數，不要寫死色碼。
- 使用 `const` / `let`，不要使用 `var`。
- 產生 DOM 內容時使用 `textContent` 或 `createElement`，不要使用 `innerHTML` 組字串。

## 協作方式

- 動手修改之前，先條列說明打算修改哪些檔案，以及各檔案要做的變動，等我確認後才開始。
- 一次只處理一件事，不要順手進行未被要求的重構。
- 修改完成後，說明要如何在瀏覽器中驗證這次的修改。
