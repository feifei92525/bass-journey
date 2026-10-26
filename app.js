'use strict';
const URL_='https://hnalykfgfsewigjngeij.supabase.co';
const KEY='sb_publishable_UzphASuc5NprBV01hBC5Sw_UP82DqN8';
const client=window.supabase?.createClient(URL_,KEY);
const TASKS=['Fingerstyle｜IM 交替','左手基本功｜手型與換把','即興｜Root 與 Chord Tone','Slap｜Thumb / Pop','歌曲研究｜困難小節','回顧｜錄影與聆聽'];
const $=id=>document.getElementById(id);
let user=null,loaded={},accountScope='guest';
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const cacheKey=()=>`xianjian-v1-${accountScope}`;
function cacheRead(){try{return JSON.parse(localStorage.getItem(cacheKey())||'{}')}catch{return {}}}
function cacheWrite(){localStorage.setItem(cacheKey(),JSON.stringify(loaded))}
function message(s){$('status').textContent=s}
function showPage(p){document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id===p));document.querySelectorAll('nav button').forEach(e=>e.classList.toggle('active',e.dataset.page===p));$('pageTitle').textContent={today:'今日練習',history:'練習紀錄',diary:'雙人聯絡簿',stamps:'好寶寶集章冊'}[p];if(p==='history')renderHistory()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$('tasks').innerHTML=TASKS.map((t,i)=>`<label class="task"><input type="checkbox" data-task="${i}"><span>${t}</span></label>`).join('');
function readForm(){return {minutes:Math.max(0,Number($('minutes').value)||0),song:$('song').value,bpm:Number($('bpm').value)||0,notes:$('notes').value,tasks:Object.fromEntries([...document.querySelectorAll('[data-task]')].map(x=>[x.dataset.task,x.checked]))}}
function fillForm(data={}){$('minutes').value=data.minutes||0;$('song').value=data.song||'';$('bpm').value=data.bpm||'';$('notes').value=data.notes||'';document.querySelectorAll('[data-task]').forEach(x=>x.checked=!!data.tasks?.[x.dataset.task])}
async function loadDate(){const date=$('date').value;fillForm(loaded[date]);$('saveStatus').textContent='';if(!user)return;const {data,error}=await client.from('practice_days').select('data').eq('user_id',user.id).eq('practice_date',date).maybeSingle();if(error){$('saveStatus').textContent='雲端讀取失敗：'+error.message;return}if(data){loaded[date]=data.data||{};cacheWrite();fillForm(loaded[date]);$('saveStatus').textContent='已讀取雲端紀錄'}else{$('saveStatus').textContent='雲端尚無此日期的紀錄'}}
$('date').onchange=loadDate;
$('reload').onclick=loadDate;
$('save').onclick=async()=>{const date=$('date').value,entry=readForm();$('save').disabled=true;try{if(user){const {error}=await client.from('practice_days').upsert({user_id:user.id,practice_date:date,data:entry,updated_at:new Date().toISOString()},{onConflict:'user_id,practice_date'});if(error)throw error;loaded[date]=entry;cacheWrite();$('saveStatus').textContent='☁️ 已儲存至 Supabase'}else{loaded[date]=entry;cacheWrite();$('saveStatus').textContent='已儲存在這台裝置（尚未上傳雲端）'}}catch(e){$('saveStatus').textContent='儲存失敗，未覆蓋本機紀錄：'+e.message}finally{$('save').disabled=false}};
function renderHistory(){const box=$('historyList');box.replaceChildren();const keys=Object.keys(loaded).sort().reverse();if(!keys.length){box.textContent='還沒有已載入的練習紀錄';return}keys.forEach(k=>{const div=document.createElement('div');div.className='entry';const b=document.createElement('button');b.textContent='查看';b.onclick=()=>{$('date').value=k;showPage('today');loadDate()};const label=document.createElement('span');label.textContent=`${k}｜${loaded[k].song||'未填歌曲'}｜${loaded[k].minutes||0} 分鐘`;div.append(b,label);box.append(div)})}
async function refreshAccount(){const {data:{session}}=await client.auth.getSession();user=session?.user||null;accountScope=user?.id||'guest';loaded=cacheRead();$('login').hidden=!!user;$('logout').hidden=!user;$('email').hidden=!!user;$('password').hidden=!!user;message(user?`已登入 ${user.email}；請選擇日期讀取雲端紀錄`:'尚未登入；資料暫存在這台裝置');await loadDate()}
$('login').onclick=async()=>{if(!client)return message('Supabase 載入失敗，請檢查網路');const email=$('email').value.trim(),password=$('password').value;if(!email||!password)return message('請輸入 Email 和密碼');const {error}=await client.auth.signInWithPassword({email,password});if(error)return message('登入失敗：'+error.message);$('password').value='';await refreshAccount()};
$('logout').onclick=async()=>{if(!client)return;const {error}=await client.auth.signOut();if(error)return message('登出失敗：'+error.message);await refreshAccount()};
$('date').value=dateKey();if(client){refreshAccount();client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(refreshAccount,0)})}else{loaded=cacheRead();fillForm(loaded[$('date').value]);message('離線模式：無法載入 Supabase')}
