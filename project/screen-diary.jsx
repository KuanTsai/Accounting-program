// Diary screen — real diary entries from transactions

const TAPE_COLORS = ['var(--accent-soft)', 'var(--lavender)', 'var(--secondary-soft)', 'var(--accent-faint)'];
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function DiaryScreen({ transactions = [] }) {
  const diaryEntries = transactions
    .filter(tx => tx.diary && tx.diary.trim())
    .map((tx, i) => {
      const d = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
      return {
        id: tx.id,
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        day: DAY_NAMES[d.getDay()],
        mood: tx.mood || 'neutral',
        tape: TAPE_COLORS[i % TAPE_COLORS.length],
        rotate: (i % 3) - 1,
        title: tx.label || '今天的記錄',
        body: tx.diary,
        relatedAmt: tx.amt,
        relatedCat: tx.cat,
        dateObj: d,
      };
    });

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const entryDates = new Set(diaryEntries.map(e => e.dateObj.toDateString()));

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="我的日記"
        subtitle="Dear diary ♡"
        right={
          <div className="tap" style={{
            width: 38, height: 38, borderRadius: 12, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(255,143,171,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        }
      />

      {/* week calendar */}
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 22, padding: '14px 14px',
          boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between',
        }}>
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === now.toDateString();
            const hasEntry = entryDates.has(d.toDateString());
            return (
              <div key={i} className="tap" style={{
                width: 36, padding: '4px 0', borderRadius: 14, textAlign: 'center',
                background: isToday ? 'var(--accent)' : 'transparent',
                color: isToday ? '#fff' : 'var(--ink)',
              }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{WEEK_LABELS[i]}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 1 }}>{d.getDate()}</div>
                <div style={{
                  width: 5, height: 5, borderRadius: 3, margin: '3px auto 0',
                  background: hasEntry ? (isToday ? '#fff' : 'var(--accent)') : 'transparent',
                }}/>
              </div>
            );
          })}
        </div>
      </div>

      {diaryEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 30px', color: 'var(--ink-faint)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
          <div className="hand" style={{ fontSize: 18, color: 'var(--ink-soft)', marginBottom: 8 }}>日記空空的</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            記帳時點「今天想說點什麼？」<br/>寫下心情，就會在這裡出現 ✿
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {diaryEntries.map(e => <DiaryCard key={e.id} entry={e}/>)}
        </div>
      )}
    </div>
  );
}

function DiaryCard({ entry }) {
  const moodMap = {
    happy:   { char: '◡', color: '#FFD66B' },
    tired:   { char: '~', color: '#C9B8F0' },
    love:    { char: '♥', color: '#FF8FAB' },
    neutral: { char: '−', color: '#A8D8F0' },
    guilty:  { char: '·', color: '#FFB97A' },
  };
  const m = moodMap[entry.mood] || moodMap.neutral;

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 22, padding: '20px 18px 16px',
      boxShadow: 'var(--shadow-card)', position: 'relative',
    }}>
      <Tape color={entry.tape} rotate={entry.rotate * 2} style={{ top: -10, left: '50%', marginLeft: -35 }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '6px 10px', textAlign: 'center', minWidth: 50 }}>
          <div className="hand" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>{entry.date}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 2 }}>週{entry.day}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 700, lineHeight: 1.3 }}>{entry.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 10, color: 'var(--ink-soft)' }}>
            <span>心情</span>
            <span style={{
              width: 16, height: 16, borderRadius: 8, background: m.color, color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>{m.char}</span>
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 17, color: 'var(--ink)', lineHeight: 1.65, padding: '4px 0',
        fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif",
        letterSpacing: '0.02em',
        backgroundImage: 'linear-gradient(transparent calc(1.65em - 1px), #F5E5DC 1px)',
        backgroundSize: '100% 1.65em', backgroundPosition: '0 2px',
      }}>{entry.body}</div>

      {entry.relatedAmt && (
        <div style={{
          marginTop: 12, padding: '8px 10px', borderRadius: 14,
          background: 'var(--accent-faint)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CatBubble id={entry.relatedCat} size={28}/>
          <span style={{ fontSize: 12, color: 'var(--ink)', flex: 1 }}>連結支出</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
            −${Math.abs(entry.relatedAmt)}
          </span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DiaryScreen, DiaryCard });
