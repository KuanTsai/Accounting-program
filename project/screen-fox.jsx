// Fox raising / detail screen — name, stats, feed, customize

const { useState: useStateFox, useEffect: useEffectFox } = React;

const FUR_OPTIONS = [
  { id: 'orange', label: '橘', color: '#F5A968' },
  { id: 'white',  label: '雪', color: '#F0E8DC' },
  { id: 'gray',   label: '灰', color: '#B5B0B8' },
  { id: 'pink',   label: '粉', color: '#FFB4C4' },
  { id: 'black',  label: '夜', color: '#5A4E4A' },
];

const ACCESSORY_OPTIONS = [
  { id: 'none',    label: '無', unlock: 0 },
  { id: 'bow',     label: '蝴蝶結', unlock: 0 },
  { id: 'flower',  label: '小花', unlock: 3 },
  { id: 'scarf',   label: '圍巾', unlock: 5 },
  { id: 'glasses', label: '眼鏡', unlock: 8 },
  { id: 'crown',   label: '皇冠', unlock: 15 },
];

const DAILY_INTERACT_CAP = 15;

function FoxScreen({ foxState, setFoxState, onClose, onExpGain, transactions = [], streak = 0 }) {
  const [editingName, setEditingName] = useStateFox(false);
  const [nameInput, setNameInput] = useStateFox(foxState.name);
  const [tab, setTab] = useStateFox('customize');
  const [floatNote, setFloatNote] = useStateFox(null);

  const saveProfile = (updates) => {
    const u = window.auth.currentUser;
    if (!u) return;
    window.db.collection('users').doc(u.uid).collection('settings').doc('profile')
      .set(updates, { merge: true });
  };

  // Apply stat decay based on time elapsed since last interaction
  useEffectFox(() => {
    const lastUpdated = foxState.lastUpdatedAt;
    if (!lastUpdated) return;
    const lastTime = lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated);
    const elapsedHrs = (new Date() - lastTime) / 3600000;
    if (elapsedHrs < 0.1) return;
    const newSatiety  = Math.max(0, (foxState.satiety  || 80) - Math.round(elapsedHrs * 3));
    const newEnergy   = Math.max(0, (foxState.energy   || 80) - Math.round(elapsedHrs * 2.5));
    const newMood     = Math.max(0, (foxState.moodScore || 90) - Math.round(elapsedHrs * 2));
    const now = new Date().toISOString();
    setFoxState(s => ({ ...s, satiety: newSatiety, energy: newEnergy, moodScore: newMood, lastUpdatedAt: now }));
    saveProfile({ satiety: newSatiety, energy: newEnergy, moodScore: newMood, lastUpdatedAt: now });
  }, []);

  const showNote = (text, color = 'var(--accent)') => {
    setFloatNote({ text, color, key: Date.now() });
    setTimeout(() => setFloatNote(null), 1200);
  };

  const saveStats = (updates) => {
    const now = new Date().toISOString();
    setFoxState(s => ({ ...s, ...updates, lastUpdatedAt: now }));
    saveProfile({ ...updates, lastUpdatedAt: now });
  };

  // Returns how much EXP was actually granted (0 if daily cap reached)
  const tryGainInteractExp = (amount) => {
    const today = new Date().toDateString();
    const usedToday = foxState.interactDate === today ? (foxState.interactExp || 0) : 0;
    const remaining = DAILY_INTERACT_CAP - usedToday;
    if (remaining <= 0) return 0;
    const gain = Math.min(amount, remaining);
    if (onExpGain) onExpGain(gain);
    const newUsed = usedToday + gain;
    setFoxState(s => ({ ...s, interactDate: today, interactExp: newUsed }));
    saveProfile({ interactDate: today, interactExp: newUsed });
    return gain;
  };

  const feed = () => {
    const newSatiety = Math.min(100, (foxState.satiety || 80) + 25);
    const newMood = Math.min(100, (foxState.moodScore || 90) + 5);
    setFoxState(s => ({ ...s, mood: 'eating' }));
    saveStats({ satiety: newSatiety, moodScore: newMood });
    const gained = tryGainInteractExp(3);
    showNote(gained > 0 ? `飽足 +25　+${gained} EXP ♥` : '飽足 +25 ♥', '#C5751F');
    setTimeout(() => setFoxState(s => ({ ...s, mood: 'happy' })), 1500);
  };

  const play = () => {
    const newEnergy = Math.max(0, (foxState.energy || 80) - 12);
    const newMood = Math.min(100, (foxState.moodScore || 90) + 18);
    setFoxState(s => ({ ...s, mood: 'excited' }));
    saveStats({ energy: newEnergy, moodScore: newMood });
    const gained = tryGainInteractExp(5);
    showNote(gained > 0 ? `心情 +18　+${gained} EXP ✿` : '心情 +18 ✿', 'var(--accent)');
    setTimeout(() => setFoxState(s => ({ ...s, mood: 'happy' })), 1500);
  };

  const rest = () => {
    const newEnergy = Math.min(100, (foxState.energy || 80) + 30);
    setFoxState(s => ({ ...s, mood: 'sleepy' }));
    saveStats({ energy: newEnergy });
    const gained = tryGainInteractExp(2);
    showNote(gained > 0 ? `活力 +30　+${gained} EXP zZ` : '活力 +30 zZ', 'var(--lavender)');
    setTimeout(() => setFoxState(s => ({ ...s, mood: 'happy' })), 2000);
  };

  // Build real bond log from transactions
  const bondLog = (() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now - 86400000).toDateString();
    const dayMap = {};
    transactions.forEach(tx => {
      if (!tx.createdAt) return;
      const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
      const key = d.toDateString();
      if (!dayMap[key]) dayMap[key] = { date: d, txs: [] };
      dayMap[key].txs.push(tx);
    });
    const events = [];
    Object.values(dayMap).sort((a, b) => b.date - a.date).slice(0, 3).forEach(({ date, txs }) => {
      const ds = date.toDateString();
      const label = ds === todayStr ? '今天' : ds === yesterdayStr ? '昨天' : `${Math.round((now - date) / 86400000)} 天前`;
      const hasDiary = txs.some(t => t.diary);
      events.push(hasDiary
        ? { date: label, text: `你寫了日記，${foxState.name || '小桃'}替你好好記下來 ✿`, color: '#C9B8F0' }
        : { date: label, text: `${foxState.name || '小桃'}陪你記了 ${txs.length} 筆帳`, color: 'var(--accent)' }
      );
    });
    if (streak >= 7) events.push({ date: `第 ${streak} 天`, text: '連續記帳，繼續保持 ✿', color: '#7DCBA8' });
    if (foxState.joinedAt) {
      const joinDate = new Date(foxState.joinedAt);
      const joinDs = joinDate.toDateString();
      const joinLabel = joinDs === todayStr ? '今天' : joinDs === yesterdayStr ? '昨天' : `${Math.round((now - joinDate) / 86400000)} 天前`;
      events.push({ date: joinLabel, text: `${foxState.name || '小桃'} 和你第一次相遇 🌸`, color: '#FFD66B' });
    }
    return events;
  })();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="tap" onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 12, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>狐狸小屋</div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 30 }}>
        {/* hero — big fox with name + level */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{
            background: 'linear-gradient(180deg, var(--accent-faint) 0%, #FFF6F0 70%, var(--bg) 100%)',
            borderRadius: 30, padding: '24px 20px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* sparkles */}
            <div className="sparkle" style={{ position: 'absolute', top: 30, right: 30, fontSize: 14, color: 'var(--secondary)' }}>✦</div>
            <div className="sparkle" style={{ position: 'absolute', top: 50, left: 28, fontSize: 10, color: 'var(--lavender)', animationDelay: '0.4s' }}>★</div>
            <div className="sparkle" style={{ position: 'absolute', top: 84, right: 60, fontSize: 8, color: 'var(--accent)', animationDelay: '0.8s' }}>✦</div>

            {/* floating note */}
            {floatNote && (
              <div key={floatNote.key} style={{
                position: 'absolute', left: '50%', top: 80,
                transform: 'translateX(-50%)',
                fontSize: 14, color: floatNote.color, fontWeight: 700,
                animation: 'float-up 1.2s ease-out forwards',
                pointerEvents: 'none', zIndex: 5,
              }}>{floatNote.text}</div>
            )}

            {/* the fox */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <div className="wiggle">
                <Fox mood={foxState.mood} size={160} fur={foxState.fur} accessory={foxState.accessory}/>
              </div>
            </div>

            {/* name + level */}
            <div style={{ textAlign: 'center' }}>
              {!editingName ? (
                <div className="tap" onClick={() => { setNameInput(foxState.name); setEditingName(true); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="hand" style={{ fontSize: 26, color: 'var(--ink)' }}>
                    {foxState.name}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                  </svg>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={6}
                    autoFocus
                    style={{
                      fontSize: 22, color: 'var(--ink)',
                      fontFamily: "-apple-system, 'SF Pro Display', 'PingFang TC', sans-serif",
                      fontWeight: 700, textAlign: 'center',
                      border: 'none', outline: 'none',
                      background: '#fff', borderRadius: 10,
                      padding: '4px 12px', width: 120,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <span className="tap" onClick={() => {
                    const trimmed = nameInput.trim();
                    if (trimmed) { setFoxState(s => ({ ...s, name: trimmed })); saveProfile({ name: trimmed }); }
                    setEditingName(false);
                  }} style={{
                    color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                    background: '#fff', padding: '6px 10px', borderRadius: 999,
                  }}>OK</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
                <span style={{
                  background: '#fff', padding: '2px 10px', borderRadius: 999,
                  fontSize: 11, color: 'var(--accent)', fontWeight: 700,
                }}>Lv. {foxState.level}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                  陪伴你 {foxState.days} 天
                </span>
              </div>

              {/* exp bar */}
              <div style={{
                margin: '12px auto 0', width: 240,
                background: 'rgba(255,255,255,0.85)', borderRadius: 999, height: 12, padding: 2,
                position: 'relative',
              }}>
                <div style={{
                  height: '100%', width: `${foxState.exp}%`, borderRadius: 999,
                  background: 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)',
                  transition: 'width 0.3s',
                }}/>
                <span style={{
                  position: 'absolute', right: 8, top: -16, fontSize: 10,
                  color: 'var(--ink-soft)', fontFamily: 'Caveat', fontWeight: 700,
                }}>EXP {foxState.exp}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* stats */}
        <div style={{ padding: '18px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>狀態</div>
          <div style={{
            background: 'var(--card)', borderRadius: 22, padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <StatBar label="心情" value={foxState.moodScore} color="#FF8FAB" icon="◡"/>
            <StatBar label="飽足" value={foxState.satiety}   color="#FFB97A" icon="◉"/>
            <StatBar label="活力" value={foxState.energy}    color="#9DD6B0" icon="✦"/>
          </div>
        </div>

        {/* action buttons */}
        <div style={{ padding: '18px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>陪牠做點什麼</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <ActionButton label="餵食" sub="+飽足 +3EXP" bg="#FFF1E8" color="#C5751F" icon="🍙" onClick={feed}/>
            <ActionButton label="玩耍" sub="+心情 +5EXP" bg="var(--accent-faint)" color="var(--accent)" icon="✿" onClick={play}/>
            <ActionButton label="休息" sub="+活力 +2EXP" bg="#EFE9FF" color="#7E6E94" icon="zZ" onClick={rest}/>
          </div>
        </div>

        {/* customization tabs */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>換造型</div>

          {/* fur */}
          <div style={{
            background: 'var(--card)', borderRadius: 18, padding: 14,
            boxShadow: 'var(--shadow-sm)', marginBottom: 10,
          }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8, fontWeight: 600 }}>毛色</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              {FUR_OPTIONS.map(f => {
                const sel = foxState.fur === f.id;
                return (
                  <div key={f.id} className="tap" onClick={() => { setFoxState(s => ({ ...s, fur: f.id })); saveProfile({ fur: f.id }); }}
                    style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 21, margin: '0 auto',
                      background: f.color,
                      boxShadow: sel
                        ? `0 0 0 2px #fff, 0 0 0 4px var(--accent), 0 2px 6px rgba(0,0,0,0.15)`
                        : '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                      transition: 'all 0.15s',
                    }}>{sel && '✓'}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink)', marginTop: 4, fontWeight: 500 }}>{f.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* accessory */}
          <div style={{
            background: 'var(--card)', borderRadius: 18, padding: 14,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8, fontWeight: 600 }}>配件</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {ACCESSORY_OPTIONS.map(a => {
                const locked = foxState.level < a.unlock;
                const sel = foxState.accessory === a.id;
                return (
                  <div key={a.id} className="tap"
                    onClick={() => { if (!locked) { setFoxState(s => ({ ...s, accessory: a.id })); saveProfile({ accessory: a.id }); } }}
                    style={{
                      textAlign: 'center', cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.45 : 1,
                    }}>
                    <div style={{
                      aspectRatio: '1', borderRadius: 12,
                      background: sel ? 'var(--accent-faint)' : 'var(--bg)',
                      border: sel ? '2px solid var(--accent)' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Fox mood="happy" size={36} fur={foxState.fur} accessory={a.id}/>
                      {locked && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 10,
                          background: 'rgba(74,58,53,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                        }}>Lv.{a.unlock}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--ink)', marginTop: 3, fontWeight: 500 }}>{a.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center' }}>
              升等可以解鎖更多造型 ✿
            </div>
          </div>
        </div>

        {/* bond log */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>羈絆紀錄</div>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 4, boxShadow: 'var(--shadow-sm)' }}>
            {bondLog.length === 0
              ? <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)' }}>
                  還沒有紀錄，開始記帳來建立羈絆吧 ✿
                </div>
              : bondLog.map((it, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px',
                borderBottom: i === arr.length - 1 ? 'none' : '1px dashed #F5E5DC',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4, background: it.color,
                  marginTop: 6, flexShrink: 0,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>{it.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>{it.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color, icon }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 9, background: `${color}22`,
            color: color, fontSize: 11, fontWeight: 700, marginRight: 6,
            verticalAlign: 'middle',
          }}>{icon}</span>
          {label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
          {value} / 100
        </span>
      </div>
      <div style={{ background: '#F5EBE4', height: 8, borderRadius: 4, padding: 1 }}>
        <div style={{
          height: '100%', width: `${value}%`, borderRadius: 3,
          background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          transition: 'width 0.4s',
        }}/>
      </div>
    </div>
  );
}

function ActionButton({ label, sub, bg, color, icon, onClick }) {
  return (
    <div className="tap" onClick={onClick} style={{
      background: bg, borderRadius: 18, padding: '12px 0 10px',
      textAlign: 'center', cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 22, color, fontWeight: 700, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 10, color: color, marginTop: 1, fontWeight: 600 }}>{sub}</div>
    </div>
  );
}

Object.assign(window, { FoxScreen });
