// Add Entry screen — numpad, category picker, mood, optional diary

const { useState: useStateAdd } = React;

function AddScreen({ onClose, onSave, envelopes = [], preset = {} }) {
  const [amount, setAmount] = useStateAdd('0');
  const [cat, setCat] = useStateAdd(() => preset.cat || 'food');
  const [type, setType] = useStateAdd(() => preset.type || 'expense'); // expense | income
  const [note, setNote] = useStateAdd('');
  const [mood, setMood] = useStateAdd(null);
  const [diaryOpen, setDiaryOpen] = useStateAdd(false);
  const [diaryText, setDiaryText] = useStateAdd('');
  const [envelopeId, setEnvelopeId] = useStateAdd(null);

  const derivedEnvId = (envelopes.find(env => env.cats && env.cats.includes(cat)) || {}).id || null;
  const activeEnvId = envelopeId !== null ? envelopeId : derivedEnvId;
  const activeEnv = envelopes.find(env => env.id === activeEnvId);

  const push = (key) => {
    if (key === 'del') {
      setAmount(a => a.length <= 1 ? '0' : a.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!amount.includes('.')) setAmount(a => a + '.');
      return;
    }
    setAmount(a => a === '0' ? key : a + key);
  };

  const moodEmojis = [
    { id: 'happy', char: '◡', color: '#FFD66B', label: '開心' },
    { id: 'neutral', char: '−', color: '#A8D8F0', label: '平靜' },
    { id: 'guilty', char: '·', color: '#FFB97A', label: '罪惡' },
    { id: 'love', char: '♥', color: '#FF8FAB', label: '滿足' },
    { id: 'tired', char: '~', color: '#C9B8F0', label: '疲憊' },
  ];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* header */}
      <div style={{
        padding: '14px 20px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="tap" onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 12, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>新的一筆</div>
        <div className="tap" style={{
          padding: '6px 14px', borderRadius: 999, background: 'var(--accent)',
          color: '#fff', fontSize: 13, fontWeight: 600,
        }} onClick={() => onSave({ amount, cat, type, note, mood, diary: diaryOpen ? diaryText.trim() : '', envelope: activeEnvId })}>
          完成
        </div>
      </div>

      {/* type toggle */}
      <div style={{ padding: '6px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', background: '#fff', borderRadius: 999,
          padding: 4, boxShadow: 'var(--shadow-sm)',
        }}>
          {[
            { id: 'expense', label: '支出' },
            { id: 'income', label: '收入' },
          ].map(t => (
            <div key={t.id} onClick={() => setType(t.id)} className="tap" style={{
              padding: '6px 22px', borderRadius: 999,
              fontSize: 14, fontWeight: 600,
              background: type === t.id ? (t.id === 'expense' ? 'var(--accent)' : '#7DCBA8') : 'transparent',
              color: type === t.id ? '#fff' : 'var(--ink-soft)',
              transition: 'all 0.15s',
            }}>{t.label}</div>
          ))}
        </div>
      </div>

      {/* amount display */}
      <div style={{ padding: '20px 24px 8px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 6, marginTop: 8,
          padding: '0 24px 6px', borderBottom: '2.5px dashed var(--accent-soft)',
        }}>
          <span style={{ fontSize: 22, color: type === 'expense' ? 'var(--accent)' : '#3B8A5C', fontWeight: 600 }}>
            {type === 'expense' ? '−' : '+'} NT$
          </span>
          <span style={{
            fontSize: 56, color: 'var(--ink)', fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}>{Number(amount.replace(/[^0-9.]/g, '')).toLocaleString()}{amount.endsWith('.') ? '.' : ''}</span>
        </div>
      </div>

      {/* category picker */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="hand" style={{ fontSize: 17, color: 'var(--ink)' }}>分類</div>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>已選：{CATEGORIES.find(c => c.id === cat)?.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {CATEGORIES.slice(0, 8).map(c => (
            <div key={c.id} onClick={() => setCat(c.id)} className="tap" style={{
              flexShrink: 0, textAlign: 'center',
              padding: 6, borderRadius: 16,
              background: cat === c.id ? c.bg : 'transparent',
              border: cat === c.id ? `2px solid ${c.color}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <CatBubble id={c.id} size={42}/>
              <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 4, fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* envelope picker */}
      {envelopes.length > 0 && (
        <div style={{ padding: '10px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="hand" style={{ fontSize: 17, color: 'var(--ink)' }}>信封預算</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>已選：{activeEnv?.label || '未分配'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {envelopes.map(env => (
              <div key={env.id} onClick={() => setEnvelopeId(activeEnvId === env.id ? null : env.id)} className="tap" style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 999,
                background: activeEnvId === env.id ? env.bg : '#fff',
                border: `1.5px solid ${activeEnvId === env.id ? env.color : 'transparent'}`,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{env.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: activeEnvId === env.id ? env.color : 'var(--ink-soft)' }}>{env.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* mood + note */}
      <div style={{ padding: '12px 20px 0' }}>
        <div className="hand" style={{ fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>當下心情</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {moodEmojis.map(m => (
            <div key={m.id} onClick={() => setMood(m.id)} className="tap" style={{
              flex: 1, textAlign: 'center', padding: '8px 0',
              borderRadius: 14,
              background: mood === m.id ? m.color : '#fff',
              boxShadow: mood === m.id ? `0 3px 0 ${m.color}88` : 'var(--shadow-sm)',
              transition: 'all 0.15s',
            }}>
              <div style={{
                fontSize: 18, color: mood === m.id ? '#fff' : 'var(--ink-soft)',
                fontWeight: 700,
              }}>{m.char}</div>
              <div style={{
                fontSize: 10, marginTop: 1,
                color: mood === m.id ? '#fff' : 'var(--ink-soft)',
              }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* optional: write diary alongside this expense */}
      <div style={{ padding: '12px 20px 0' }}>
        {!diaryOpen ? (
          <div className="tap dashed-border" onClick={() => setDiaryOpen(true)} style={{
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'var(--accent-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>今天想說點什麼？</div>
              <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 1 }}>選填 · 寫了會自動連結到日記</div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>＋</span>
          </div>
        ) : (
          <div style={{
            background: 'var(--card)', borderRadius: 18, padding: '12px 14px 10px',
            boxShadow: 'var(--shadow-sm)', position: 'relative',
          }}>
            <Tape color="var(--accent-soft)" rotate={-4} style={{ top: -8, left: 20 }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="hand" style={{ fontSize: 16, color: 'var(--ink)' }}>今日小日記</span>
              <span className="tap" onClick={() => { setDiaryOpen(false); setDiaryText(''); }}
                style={{ fontSize: 11, color: 'var(--ink-soft)' }}>收起 ⌃</span>
            </div>
            <textarea
              value={diaryText}
              onChange={e => setDiaryText(e.target.value)}
              placeholder="寫下今天的心情、發生什麼事…"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: 'none', outline: 'none', resize: 'none',
                background: 'transparent',
                fontSize: 14, color: 'var(--ink)',
                fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif",
                letterSpacing: '0.02em', lineHeight: 1.65,
                backgroundImage: 'linear-gradient(transparent calc(1.65em - 1px), #F5E5DC 1px)',
                backgroundSize: '100% 1.65em',
                backgroundPosition: '0 4px',
                padding: '0 0 2px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px dashed #F5E5DC' }}>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
                {diaryText.length > 0 ? `${diaryText.length} 字` : '不填也沒關係 ✿'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['#好天氣', '#小確幸', '#加班'].map(t => (
                  <span key={t} className="tap" onClick={() => setDiaryText(d => d + (d ? ' ' : '') + t)}
                    style={{
                      fontSize: 10, color: 'var(--accent)',
                      background: 'var(--accent-faint)',
                      padding: '2px 8px', borderRadius: 999,
                    }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* numpad */}
      <div style={{ flex: 1, padding: '6px 16px 16px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
          height: '100%',
        }}>
          {[
            '7', '8', '9', 'del',
            '4', '5', '6', '+',
            '1', '2', '3', '−',
            '.', '0', '00', '=',
          ].map((k, i) => {
            const isOp = ['+', '−', '=', 'del'].includes(k);
            const isPrimary = k === '=';
            return (
              <div key={i} onClick={() => push(k)} className="tap" style={{
                background: isPrimary ? 'var(--accent)' : isOp ? 'var(--accent-faint)' : '#fff',
                color: isPrimary ? '#fff' : isOp ? 'var(--accent)' : 'var(--ink)',
                borderRadius: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
                minHeight: 48,
              }}>
                {k === 'del' ? (
                  <svg width="22" height="16" viewBox="0 0 24 18" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 4H8L1 9l7 5h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                    <line x1="18" y1="9" x2="12" y2="9"/>
                  </svg>
                ) : k}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddScreen });
