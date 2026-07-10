import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './styles.css'

type Entry = {
  date: string
  tasks: Record<string, boolean>
  minutes: Record<string, number>
  mood: string
  listen: string
  breakthrough: string
  stuck: string
  note: string
}

type Feedback = { id: number; date: string; category: string; text: string; action: string }
type Song = { id: number; name: string; status: string; progress: number; bpm: number | ''; note: string }

const TASKS = [
  ['Fingerstyle', ['IM alternation', '八分音', '十六分音', '音量一致', '不同起拍']],
  ['左手', ['拇指位置', '手型', '最小移動', 'Shift', '指板熟悉']],
  ['即興', ['Root', 'Root＋節奏', 'Chord Tone', '音階', '自由嘗試']],
  ['Slap', ['Thumb 力道', 'Pop', 'Ghost Note', 'Slap Groove']],
  ['歌曲', ['本月主修', '老師指定歌曲']],
  ['回顧', ['錄影 30 秒', '回看左右手', '寫今日紀錄']]
] as const

const QUOTES = [
  '今天不用證明自己，只要完成今天的修煉。',
  '每一顆乾淨的音，都在塑造未來的你。',
  '快的人很多，能持續的人很少。',
  '錯音不是失敗，是耳朵開始工作的證據。',
  '今天的基本功，就是未來的自由。',
  'Groove 不靠緊張撐出來，它從放鬆裡長出來。',
  '你不是靠一堂課變強，而是靠下一堂課前的每一天。',
  '未來站在舞台上的你，會記得今天沒有放棄。'
]

const initialSongs: Song[] = [
  { id: 1, name: '城市的浪漫運作', status: '已練過', progress: 65, bpm: '', note: '早期曲目／slap' },
  { id: 2, name: '我沒有用，沒辦法給你想要的生活', status: '已練過', progress: 60, bpm: '', note: '反拍' },
  { id: 3, name: '狂亂 Hey Kids!!', status: '已練過', progress: 85, bpm: 120, note: '高速 fingerstyle' },
  { id: 4, name: 'Power', status: '暫停', progress: 25, bpm: 60, note: '前奏／double thumb' },
  { id: 5, name: '你以為', status: '7 月主修', progress: 90, bpm: '', note: 'Funk groove' },
  { id: 6, name: 'Stone Cold Bush', status: '8 月主修', progress: 30, bpm: '', note: '中段 slap' }
]

const today = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const useStored = <T,>(key: string, fallback: T) => {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  })
  const save = (next: T) => {
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }
  return [value, save] as const
}

function App() {
  const [page, setPage] = useState('home')
  const [date, setDate] = useState(today())
  const [entries, setEntries] = useStored<Record<string, Entry>>('bj.entries', {})
  const [feedback, setFeedback] = useStored<Feedback[]>('bj.feedback', [])
  const [songs, setSongs] = useStored<Song[]>('bj.songs', initialSongs)
  const [weeklySong, setWeeklySong] = useStored('bj.weeklySong', '')
  const [lessonDate, setLessonDate] = useStored('bj.lessonDate', '')
  const [xp, setXp] = useStored('bj.xp', 0)

  const entry = entries[date] ?? {
    date, tasks: {}, minutes: {}, mood: '', listen: '', breakthrough: '', stuck: '', note: ''
  }

  const updateEntry = (patch: Partial<Entry>) => {
    setEntries({ ...entries, [date]: { ...entry, ...patch } })
  }

  const mainSong = new Date(date + 'T12:00:00').getMonth() + 1 === 8 ? 'Stone Cold Bush' : '你以為'
  const quote = QUOTES[new Date(date + 'T12:00:00').getDate() % QUOTES.length]
  const taskCount = TASKS.reduce((n, [, items]) => n + items.length, 0)
  const doneCount = Object.values(entry.tasks).filter(Boolean).length
  const completion = Math.round(doneCount / taskCount * 100)
  const totalMins = Object.values(entry.minutes).reduce((a, b) => a + (Number(b) || 0), 0)

  const chartData = useMemo(() => {
    const data = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const mins = Object.values(entries[k]?.minutes ?? {}).reduce((a,b)=>a+(Number(b)||0),0)
      data.push({ day: `${d.getMonth()+1}/${d.getDate()}`, mins })
    }
    return data
  }, [entries])

  const finishToday = () => {
    const key = `bj.finished.${date}`
    if (!localStorage.getItem(key)) {
      setXp(xp + 50)
      localStorage.setItem(key, '1')
    }
    alert('🎸 今天的你，比昨天更穩一點。')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ entries, feedback, songs, weeklySong, lessonDate, xp }, null, 2)], {type:'application/json'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bass-journey-${today()}.json`
    a.click()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">BASS JOURNEY</div>
          <h1>時澈修煉錄</h1>
          <p>Spotify 的沉浸感 × Apple 的乾淨 × Persona 的成就感</p>
        </div>
        <div className="date-chip">{date}</div>
      </header>

      {page === 'home' && <main className="grid">
        <section className="card hero wide">
          <div className="eyebrow">TODAY'S QUEST</div>
          <h2>{quote}</h2>
          <p>本月主修：<b>{mainSong}</b></p>
          <button className="primary" onClick={()=>setPage('today')}>開始今天的修煉</button>
        </section>
        <section className="card"><span>Level</span><strong>Lv.{Math.floor(xp/500)+1}</strong><div className="meter"><i style={{width:`${(xp%500)/5}%`}}/></div><small>{xp%500} / 500 XP</small></section>
        <section className="card"><span>今日完成度</span><strong>{completion}%</strong><div className="meter"><i style={{width:`${completion}%`}}/></div></section>
        <section className="card"><span>今日練習</span><strong>{totalMins} 分</strong><small>實際投入比完美更重要。</small></section>
        <section className="card wide">
          <h3>本週老師指定</h3>
          <input value={weeklySong} onChange={e=>setWeeklySong(e.target.value)} placeholder="輸入老師指定歌曲" />
          <h3>下次上課日期</h3>
          <input type="date" value={lessonDate} onChange={e=>setLessonDate(e.target.value)} />
        </section>
      </main>}

      {page === 'today' && <main className="grid">
        <section className="card wide">
          <div className="row between"><div><div className="eyebrow">DAILY TRAINING</div><h2>{date}</h2></div><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
        </section>
        <section className="card wide">
          {TASKS.map(([title, items], si) => <details key={title} open>
            <summary>{title}<span>{items.filter((_,ii)=>entry.tasks[`${si}-${ii}`]).length}/{items.length}</span></summary>
            <div className="tasks">
              {items.map((item, ii) => {
                const key = `${si}-${ii}`
                return <label className={entry.tasks[key] ? 'done' : ''} key={item}>
                  <input type="checkbox" checked={!!entry.tasks[key]} onChange={e=>updateEntry({tasks:{...entry.tasks,[key]:e.target.checked}})} />
                  {item}
                </label>
              })}
            </div>
          </details>)}
        </section>
        <section className="card">
          <h3>練習時間</h3>
          {['早上','晚上','零碎'].map(k=><label key={k}>{k}<input type="number" value={entry.minutes[k]||''} onChange={e=>updateEntry({minutes:{...entry.minutes,[k]:Number(e.target.value)}})} /></label>)}
          <strong>{totalMins} 分鐘</strong>
        </section>
        <section className="card">
          <h3>今日心情</h3>
          <div className="moods">{['😀','🙂','😐','😢','😭'].map(m=><button className={entry.mood===m?'selected':''} onClick={()=>updateEntry({mood:m})}>{m}</button>)}</div>
        </section>
        <section className="card wide"><h3>今天聽了什麼？</h3><textarea value={entry.listen} onChange={e=>updateEntry({listen:e.target.value})} placeholder="歌名、時間點、Bass tone、Groove……" /></section>
        <section className="card"><h3>今天最大的突破</h3><textarea value={entry.breakthrough} onChange={e=>updateEntry({breakthrough:e.target.value})}/></section>
        <section className="card"><h3>今天卡住</h3><textarea value={entry.stuck} onChange={e=>updateEntry({stuck:e.target.value})}/></section>
        <section className="card wide"><h3>今日總結</h3><textarea value={entry.note} onChange={e=>updateEntry({note:e.target.value})}/><button className="primary" onClick={finishToday}>完成今日修煉</button></section>
      </main>}

      {page === 'teacher' && <Teacher feedback={feedback} setFeedback={setFeedback} />}
      {page === 'songs' && <Songs songs={songs} setSongs={setSongs} />}
      {page === 'stats' && <main className="grid"><section className="card wide"><h2>近 14 天練習時間</h2><div style={{height:280}}><ResponsiveContainer><LineChart data={chartData}><XAxis dataKey="day"/><YAxis/><Tooltip/><Line type="monotone" dataKey="mins" stroke="#8b5cf6" strokeWidth={3}/></LineChart></ResponsiveContainer></div></section><section className="card wide"><button className="primary" onClick={exportData}>匯出備份</button></section></main>}

      <nav>
        {[
          ['home','首頁'],['today','今日'],['teacher','老師'],['songs','歌曲'],['stats','統計']
        ].map(([id,label])=><button className={page===id?'active':''} onClick={()=>setPage(id)}>{label}</button>)}
      </nav>
    </div>
  )
}

function Teacher({feedback,setFeedback}:{feedback:Feedback[],setFeedback:(x:Feedback[])=>void}) {
  const [text,setText]=useState(''),[action,setAction]=useState(''),[category,setCategory]=useState('左手')
  return <main className="grid">
    <section className="card">
      <h2>新增老師回饋</h2>
      <select value={category} onChange={e=>setCategory(e.target.value)}>{['右手','左手','Slap','Groove','即興','節奏','心態','其他'].map(x=><option>{x}</option>)}</select>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="老師原話"/>
      <textarea value={action} onChange={e=>setAction(e.target.value)} placeholder="下一步"/>
      <button className="primary" onClick={()=>{if(!text)return;setFeedback([{id:Date.now(),date:today(),category,text,action},...feedback]);setText('');setAction('')}}>加入</button>
    </section>
    <section className="card wide">
      <h2>歷史回饋</h2>
      {feedback.map(f=><article className="note" key={f.id}><span>{f.category}</span><b>「{f.text}」</b><small>{f.action}</small></article>)}
    </section>
  </main>
}

function Songs({songs,setSongs}:{songs:Song[],setSongs:(x:Song[])=>void}) {
  const [name,setName]=useState('')
  return <main className="grid">
    <section className="card"><h2>新增歌曲</h2><input value={name} onChange={e=>setName(e.target.value)} placeholder="歌曲名稱"/><button className="primary" onClick={()=>{if(!name)return;setSongs([{id:Date.now(),name,status:'練習中',progress:0,bpm:'',note:''},...songs]);setName('')}}>加入歌曲</button></section>
    <section className="card wide"><h2>Song Journey</h2>{songs.map(s=><article className="song" key={s.id}><div><b>{s.name}</b><small>{s.status}{s.bpm?`｜${s.bpm} BPM`:''}</small><p>{s.note}</p></div><strong>{s.progress}%</strong></article>)}</section>
  </main>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)