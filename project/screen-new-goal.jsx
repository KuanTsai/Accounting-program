// New goal pot — bottom-sheet modal for creating a saving goal

const { useState: useStateGoal } = React;

const GOAL_ICONS = [
  { id: 'travel',  label: '旅遊' },
  { id: 'study',   label: '學習' },
  { id: 'shop',    label: '購物' },
  { id: 'gift',    label: '禮物' },
  { id: 'health',  label: '醫療' },
  { id: 'home',    label: '居家' },
  { id: 'beauty',  label: '美妝' },
  { id: 'fun',     label: '玩樂' },
];

const GOAL_COLORS = [
  { color: '#FF8FAB', bg: '#FFE5EC' },
  { color: '#FFB97A', bg: '#FFE9D6' },
  { color: '#FFD66B', bg: '#FFF4D1' },
  { color: '#9DD6B0', bg: '#E2F4E8' },
  { color: '#A8D8F0', bg: '#E0F2FA' },
  { color: '#C9B8F0', bg: '#EFE9FF' },
  { color: '#F590BB', bg: '#FFE0EE' },
  { color: '#7DCBC4', bg: '#D8F0EE' },
];

const AMOUNT_PRESETS = [30000, 50000, 100000, 500000, 1000000];

function NewGoalScreen({ onClose, onSave }) {
  const [name, setName] = useStateGoal('');
  const [amount, setAmount] = useStateGoal(30000);
  const [amtRaw, setAmtRaw] = useStateGoal('');
  const [amtEditing, setAmtEditing] = useStateGoal(false);
  const [icon, setIcon] = useStateGoal('travel');
  const [colorIdx, setColorIdx] = useStateGoal(0);
  const [deadline, setDeadline] = useStateGoal(null);
  const [initial, setInitial] = useStateGoal(0);

  const c = GOAL_COLORS[colorIdx];
  const canSave = name.trim().length > 0 && amount > 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 75,
      background: 'rgba(74,58,53,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'pop-in 0.2s ease-out',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: '28px 28px 0 0',
        maxHeight: '88%', overflowY: 'auto',
        animation: 'slide-up 0.32s cubic-bezier(.3,.7,.4,1)',
        position: 'relative', paddingBottom: 30,
      }}>
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(74,58,53,0.2)' }}/>
        </div>

        {/* header */}
        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="tap" onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '6px 4px' }}>
            取消
          </span>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>新的存錢目標</div>
          <span
            className="tap"
            onClick={() => canSave && onSave({ name, amount, icon, color: c.color, bg: c.bg, deadline, initial })}
            style={{
              fontSize: 14, color: canSave ? 'var(--accent)' : 'var(--ink-faint)',
              fontWeight: 700, padding: '6px 4px',
            }}>建立</span>
        </div>

        {/* preview card */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            background: 'var(--card)', borderRadius: 22, padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80, borderRadius: 40,
              background: c.bg, opacity: 0.5,
            }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: c.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CatIcon id={icon} size={24} color={c.color}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 700 }}>
                  {name.trim() || '幫目標取個名字…'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  ${initial.toLocaleString()} / ${amount.toLocaleString()}{deadline ? `　·　${deadline}前` : ''}
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 999,
                background: c.bg, color: c.color,
                fontSize: 12, fontWeight: 700,
              }}>{amount > 0 ? Math.round((initial / amount) * 100) : 0}%</div>
            </div>
            <div style={{ marginTop: 10, background: '#F5EBE4', height: 8, borderRadius: 4, padding: 1 }}>
              <div style={{
                height: '100%', width: amount > 0 ? `${Math.min(100, (initial / amount) * 100)}%` : 0,
                background: c.color, borderRadius: 3, transition: 'width 0.2s',
              }}/>
            </div>
          </div>
        </div>

        {/* name */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>目標名稱</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：京都旅行、換新手機…"
            maxLength={20}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--card)', borderRadius: 14, border: 'none', outline: 'none',
              padding: '12px 14px', fontSize: 15, color: 'var(--ink)',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {['日本旅遊', '換新手機', '緊急金', '存頭期款', '聖誕禮物'].map(s => (
              <span key={s} className="tap" onClick={() => setName(s)} style={{
                fontSize: 11, color: 'var(--ink-soft)',
                background: 'rgba(255,255,255,0.7)', border: '1px solid #F5E5DC',
                padding: '4px 10px', borderRadius: 999,
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* amount */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 8 }}>目標金額</div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: '16px 14px 12px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600 }}>NT$</span>
              {amtEditing ? (
                <input
                  autoFocus
                  type="number"
                  value={amtRaw}
                  onChange={e => setAmtRaw(e.target.value)}
                  onBlur={() => {
                    const n = parseInt(amtRaw, 10);
                    if (!isNaN(n) && n > 0) setAmount(n);
                    setAmtEditing(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.target.blur();
                    if (e.key === 'Escape') setAmtEditing(false);
                  }}
                  style={{
                    fontSize: 32, fontWeight: 700, letterSpacing: -0.3,
                    border: 'none', outline: 'none', background: 'transparent',
                    color: 'var(--accent)', width: 180,
                    borderBottom: '2px dashed var(--accent)',
                  }}
                />
              ) : (
                <span
                  className="tap"
                  onClick={() => { setAmtRaw(String(amount)); setAmtEditing(true); }}
                  style={{
                    fontSize: 32, color: 'var(--ink)', fontWeight: 700, letterSpacing: -0.3,
                    borderBottom: '2px dashed var(--accent-soft)',
                  }}
                >
                  {amount.toLocaleString()}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {AMOUNT_PRESETS.map(p => (
                <span key={p} className="tap" onClick={() => setAmount(p)} style={{
                  flex: 1, textAlign: 'center',
                  fontSize: 11, fontWeight: 600,
                  padding: '6px 0', borderRadius: 999,
                  background: amount === p ? 'var(--accent)' : 'var(--bg)',
                  color: amount === p ? '#fff' : 'var(--ink-soft)',
                  transition: 'all 0.15s',
                }}>{p >= 10000 ? `${p / 10000}萬` : `${p / 1000}k`}</span>
              ))}
            </div>
          </div>
        </div>

        {/* icon picker */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>挑個小圖示</div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
            boxShadow: 'var(--shadow-sm)',
          }}>
            {GOAL_ICONS.map(g => {
              const sel = icon === g.id;
              return (
                <div key={g.id} className="tap" onClick={() => setIcon(g.id)} style={{
                  aspectRatio: '1', borderRadius: 10,
                  background: sel ? c.bg : 'transparent',
                  border: sel ? `2px solid ${c.color}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  <CatIcon id={g.id} size={22} color={sel ? c.color : 'var(--ink-faint)'}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* color picker */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>挑個顏色</div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 10,
            display: 'flex', gap: 8, justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {GOAL_COLORS.map((co, i) => {
              const sel = colorIdx === i;
              return (
                <div key={i} className="tap" onClick={() => setColorIdx(i)} style={{
                  width: 30, height: 30, borderRadius: 15,
                  background: co.color,
                  boxShadow: sel
                    ? `0 0 0 2px #fff, 0 0 0 4px ${co.color}, 0 2px 6px rgba(0,0,0,0.15)`
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  transition: 'all 0.15s',
                }}>{sel && '✓'}</div>
              );
            })}
          </div>
        </div>

        {/* deadline */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>
            完成期限（選填）
          </div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 8,
            display: 'flex', gap: 6, flexWrap: 'wrap',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {[null, '3 個月後', '半年後', '今年底', '明年底'].map(d => (
              <span key={d || 'none'} className="tap" onClick={() => setDeadline(d)} style={{
                fontSize: 12, fontWeight: 600,
                padding: '6px 12px', borderRadius: 999,
                background: deadline === d ? 'var(--accent)' : 'var(--bg)',
                color: deadline === d ? '#fff' : 'var(--ink-soft)',
                transition: 'all 0.15s',
              }}>{d || '不設定'}</span>
            ))}
          </div>
        </div>

        {/* initial deposit */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>初始撥款（選填）</div>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ${initial.toLocaleString()}
            </span>
          </div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: '12px 14px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <input
              type="range" min={0} max={Math.min(50000, amount)} step={500}
              value={initial} onChange={e => setInitial(Number(e.target.value))}
              style={{ width: '100%', accentColor: c.color }}
            />
            <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 4 }}>
              先放一筆讓目標起步，會從主帳戶扣除。
            </div>
          </div>
        </div>

        {/* fox tip */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{
            background: c.bg, borderRadius: 16, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <FoxMini size={28}/>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
              {amount > 50000
                ? '這是個大目標！每月撥一點點，半年後會驚喜的 ✿'
                : '小目標最容易完成，先從這裡開始吧 ♥'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NewGoalScreen });
