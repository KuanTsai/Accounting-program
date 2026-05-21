// Diary screen — daily journal entries with mood, photo placeholder, fox

function DiaryScreen() {
  const entries = [
    {
      date: '5/21', day: '五', mood: 'happy', tape: 'var(--accent-soft)', rotate: -1,
      title: '又是個下午茶日 ♥',
      body: '今天和小芸去了車站旁的新開咖啡廳，櫻花拿鐵真的好可愛。雖然花了 280 元有點心疼，但拍照很好看～值得啦！',
      tags: ['咖啡廳', '小芸', '好天氣'],
      relatedAmt: -280, relatedCat: 'drink',
    },
    {
      date: '5/20', day: '四', mood: 'tired', tape: 'var(--lavender)', rotate: 2,
      title: '加班的晚餐',
      body: '又是便利商店的微波便當。明天一定要好好吃一頓！',
      tags: ['加班', '便當'],
      relatedAmt: -110, relatedCat: 'food',
    },
    {
      date: '5/19', day: '三', mood: 'love', tape: 'var(--secondary-soft)', rotate: -3,
      title: '收到媽媽寄來的水果',
      body: '今年第一顆芒果！甜到不行，已經切好放冰箱準備明天吃 ✿',
      tags: ['家人', '芒果', '夏天到了'],
    },
  ];

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
          {['一', '二', '三', '四', '五', '六', '日'].map((d, i) => {
            const dates = [15, 16, 17, 18, 19, 20, 21];
            const isToday = i === 6;
            const hasEntry = [15, 17, 19, 20, 21].includes(dates[i]);
            return (
              <div key={i} className="tap" style={{
                width: 36, padding: '4px 0', borderRadius: 14, textAlign: 'center',
                background: isToday ? 'var(--accent)' : 'transparent',
                color: isToday ? '#fff' : 'var(--ink)',
              }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{d}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 1 }}>{dates[i]}</div>
                <div style={{
                  width: 5, height: 5, borderRadius: 3, margin: '3px auto 0',
                  background: hasEntry ? (isToday ? '#fff' : 'var(--accent)') : 'transparent',
                }}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* entries */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {entries.map((e, i) => (
          <DiaryCard key={i} entry={e}/>
        ))}
      </div>
    </div>
  );
}

function DiaryCard({ entry }) {
  const moodMap = {
    happy: { char: '◡', color: '#FFD66B' },
    tired: { char: '~', color: '#C9B8F0' },
    love: { char: '♥', color: '#FF8FAB' },
    neutral: { char: '−', color: '#A8D8F0' },
  };
  const m = moodMap[entry.mood];

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 22, padding: '20px 18px 16px',
      boxShadow: 'var(--shadow-card)', position: 'relative',
    }}>
      {/* tape */}
      <Tape color={entry.tape} rotate={entry.rotate * 2} style={{
        top: -10, left: '50%', marginLeft: -35,
      }}/>

      {/* date column + mood */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          background: 'var(--bg)', borderRadius: 14, padding: '6px 10px',
          textAlign: 'center', minWidth: 50,
        }}>
          <div className="hand" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>
            {entry.date}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 2 }}>週{entry.day}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 17, color: 'var(--ink)', fontWeight: 700, lineHeight: 1.3,
          }}>{entry.title}</div>
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

      {/* body — handwritten for that diary feel */}
      <div style={{
        fontSize: 17, color: 'var(--ink)', lineHeight: 1.65,
        padding: '4px 0',
        fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif",
        letterSpacing: '0.02em',
        backgroundImage: 'linear-gradient(transparent calc(1.65em - 1px), #F5E5DC 1px)',
        backgroundSize: '100% 1.65em',
        backgroundPosition: '0 2px',
      }}>{entry.body}</div>

      {/* related expense */}
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

      {/* tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {entry.tags.map((t, i) => (
          <span key={i} style={{
            fontSize: 11, color: 'var(--accent)',
            background: 'var(--accent-faint)',
            padding: '3px 9px', borderRadius: 999,
          }}>#{t}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DiaryScreen, DiaryCard });
