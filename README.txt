Bass Journey｜Supabase 同步版

1. 到 Supabase 專案左側 SQL Editor。
2. 新增 Query，貼上 setup.sql 全部內容，按 Run。
3. 到 Authentication → Providers → Email，確認 Email 已啟用。
4. 到 Authentication → URL Configuration：
   - Site URL 填你部署後的網址。
   - Redirect URLs 加入同一網址（可加 /*）。
5. 把整個資料夾部署到 GitHub Pages、Netlify 或 Cloudflare Pages。
6. 手機和電腦都開同一網址，輸入同一 Email，點信箱中的 Magic Link 登入。

注意：
- 直接用 file:// 開啟時，本機儲存可以用，但 Magic Link 重新導向通常不穩定。
- 建議部署到 HTTPS 網址後再正式使用。
- Publishable key 可以放在前端；資料安全依賴 setup.sql 的 RLS。
