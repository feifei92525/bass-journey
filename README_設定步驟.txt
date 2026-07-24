Bass Journey｜Google 登入最終版
================================

你的 Supabase 專案已經寫入網頁：
Project URL:
https://hnalykfgfsewigjngeij.supabase.co

這個版本：
- 使用 Google 登入，不再寄 Magic Link
- 手機與電腦登入同一個 Google 帳號即可同步
- 左側日期從 2026/7/12 開始，沒有結束日期
- 未登入時仍保存在該裝置瀏覽器
- 保留原本的粉白介面、每日任務、心得、聆聽紀錄與 XP

請照以下順序完成，只做一次：

一、建立資料表
1. Supabase → SQL Editor → New query
2. 貼上 setup.sql 全部內容
3. 按 Run

二、在 Google Cloud 建立 OAuth
1. 開啟 Google Cloud Console
2. 建立或選擇一個專案
3. Google Auth Platform / OAuth consent screen：
   - App name：Bass Journey
   - User support email：填你的信箱
   - Audience：External
   - Contact email：填你的信箱
   - 測試階段時，把你自己的 Google 信箱加入 Test users
4. Credentials → Create credentials → OAuth client ID
5. Application type：Web application
6. Authorized JavaScript origins 加入：
   https://feifei92525.github.io
7. Authorized redirect URIs 加入（必須完全一致）：
   https://hnalykfgfsewigjngeij.supabase.co/auth/v1/callback
8. 建立後複製 Client ID 與 Client secret

三、開啟 Supabase Google Provider
1. Supabase → Authentication → Providers → Google
2. Enable Google provider
3. 貼上 Google Client ID
4. 貼上 Google Client secret
5. Save

四、設定 Supabase 回站網址
1. Supabase → Authentication → URL Configuration
2. Site URL 填你的實際 GitHub Pages 首頁網址，例如：
   https://feifei92525.github.io/
3. Redirect URLs 加入：
   https://feifei92525.github.io/**
4. Save

若你的網站不是放在首頁，而是放在 repo 路徑，例如：
https://feifei92525.github.io/bass-journey/
那麼 Site URL 請填該完整網址，Redirect URLs 可維持：
https://feifei92525.github.io/**

五、更新 GitHub Pages
1. 把這個資料夾裡的 index.html 上傳，覆蓋 GitHub Pages 目前的 index.html
2. 等待 GitHub Pages 更新約 1–3 分鐘
3. 用 https://feifei92525.github.io 開啟
4. 按「使用 Google 登入」
5. 手機與電腦登入同一個 Google 帳號

常見錯誤：
- redirect_uri_mismatch：
  Google Cloud 的 Authorized redirect URI 不正確。必須是：
  https://hnalykfgfsewigjngeij.supabase.co/auth/v1/callback

- 登入後回到 localhost：
  Supabase Authentication → URL Configuration 的 Site URL 尚未改好。

- Google 顯示「應用程式尚未驗證」：
  若仍在 Testing，請把自己的信箱加入 OAuth consent screen 的 Test users。

- 點登入完全沒反應：
  請確認是從 https://feifei92525.github.io 開啟，不是直接雙擊 index.html。
