# Bass Journey｜時澈修煉錄

這是可直接部署到 GitHub Pages、並安裝到 iPhone 主畫面的 PWA。

## 上傳到 GitHub（手機版）

1. 下載並解壓縮 ZIP。
2. 進入 `bass-journey` repository。
3. 點綠色 **Code** 旁邊的 **…**，選 **Upload files**；若手機版看不到，可在網址後加 `/upload/main`。
4. 上傳解壓縮資料夾內的檔案（不是整個 ZIP）：
   - index.html
   - styles.css
   - app.js
   - manifest.webmanifest
   - sw.js
   - icon-192.png
   - icon-512.png
   - .nojekyll
   - README.md
5. Commit changes。

## 開啟 GitHub Pages

1. Repository → Settings → Pages。
2. Source 選 **Deploy from a branch**。
3. Branch 選 `main`，資料夾選 `/ (root)`。
4. Save。
5. 等候幾分鐘，網址通常是：
   `https://你的帳號.github.io/bass-journey/`

## 安裝到 iPhone

1. 用 Safari 開啟 GitHub Pages 網址。
2. 點「分享」。
3. 點「加入主畫面」。
4. 開啟「作為 Web App 打開」。

## 資料安全

紀錄存在手機瀏覽器的 Local Storage。清除網站資料會刪除紀錄，請在「統計」頁定期匯出 JSON 備份。
