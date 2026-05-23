// Budget management screen — envelope budgeting system (大信封)

const { useState: useStateBudget, useEffect: useEffectBudget } = React;

const DEFAULT_ENVELOPES = [
  { id: 'daily',   label: '日常生活', emoji: '🧺', color: '#FF8FAB', bg: '#FFE5EC', total: 12000, vault: true,  cats: ['food', 'drink', 'home'] },
  { id: 'fun',     label: '玩樂',     emoji: '🎮', color: '#FFD66B', bg: '#FFF4D1', total: 6000,  vault: true,  cats: ['fun', 'shop', 'beauty', 'travel'] },
  { id: 'invest',  label: '投資自己', emoji: '📈', color: '#7DCBA8', bg: '#D8F0E2', total: 3000,  vault: true,  cats: ['study', 'health'] },
  { id: 'fixed',   label: '固定支出', emoji: '🏠', color: '#A8D8F0', bg: '#E0F2FA', total: 8000,  vault: false, cats: ['transport'] },
  { id: 'reserve', label: '備用金',   emoji: '🛡️', color: '#C9B8F0', bg: '#EFE9FF', total: 5000,  vault: true,  cats: ['gift'] },
];
window.DEFAULT_ENVELOPES = DEFAULT_ENVELOPES;

function BudgetScreen({ onClose, transactions = [] }) {
  const [total, setTotal] = useStateBudget(20000);
  const [warnAt, setWarnAt] = useStateBudget(80);
  const [remindOn, setRemindOn] = useStateBudget(true);
  const [envelopes, setEnvelopes] = useStateBudget(null); // null = loading
  const [saving, setSaving] = useStateBudget(false);
  const [addingCatTo, setAddingCatTo] = useStateBudget(null); // envelope id

  // Load budget settings from Firestore
  useEffectBudget(() => {
    const uid = window.auth.currentUser?.uid;
    if (!uid) { setEnvelopes(DEFAULT_ENVELOPES); return; }
    window.db.collection('users').doc(uid).collection('settings').doc('budget').get()
      .then(doc => {
        if (!doc.exists) { setEnvelopes(DEFAULT_ENVELOPES); return; }
        const d = doc.data();
        if (d.total)    setTotal(d.total);
        if (d.warnAt)   setWarnAt(d.warnAt);
        if (d.remindOn !== undefined) setRemindOn(d.remindOn);
        setEnvelopes(d.envelopes && d.envelopes.length > 0 ? d.envelopes : DEFAULT_ENVELOPES);
      })
      .catch(() => setEnvelopes(DEFAULT_ENVELOPES));
  }, []);

  // Calculate real used amounts from this month's transactions
  const now = new Date();
  const catUsed = {};
  transactions.filter(tx => {
    if (!tx.createdAt || tx.amt >= 0) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).forEach(tx => {
    catUsed[tx.cat] = (catUsed[tx.cat] || 0) + Math.abs(tx.amt);
  });

  if (!envelopes) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 30, animation: 'wiggle 1s infinite' }}>✿</div>
    </div>
  );

  const updateEnvelope = (id, patch) => setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));

  const liveEnvelopes = envelopes.map(env => ({
    ...env,
    used: env.cats.reduce((s, catId) => s + (catUsed[catId] || 0), 0),
  }));

  const allocated = liveEnvelopes.reduce((s, e) => s + e.total, 0);
  const used = liveEnvelopes.reduce((s, e) => s + e.used, 0);
  const remaining = total - used;
  const pct = total > 0 ? (used / total) * 100 : 0;
  const overWarn = pct > warnAt;

  // All cat ids already in some envelope
  const allAssignedCats = envelopes.flatMap(e => e.cats);

  const handleSave = async () => {
    setSaving(true);
    const uid = window.auth.currentUser?.uid;
    if (uid) {
      await window.db.collection('users').doc(uid).collection('settings').doc('budget').set({
        total, warnAt, remindOn, envelopes,
      });
    }
    setSaving(false);
    onClose();
  };

  const addNewEnvelope = () => {
    const newId = 'env_' + Date.now();
    setEnvelopes(prev => [...prev, {
      id: newId,
      label: '新信封',
      emoji: '📦',
      color: '#FFB97A',
      bg: '#FFE9D6',
      total: 2000,
      vault: true,
      cats: [],
    }]);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg)',
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
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)' }}>預算管理</div>
        <div className="tap" style={{
          padding: '6px 14px', borderRadius: 999, background: 'var(--accent)',
          color: '#fff', fontSize: 13, fontWeight: 600,
        }} onClick={handleSave}>{saving ? '儲存中…' : '儲存'}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 30 }}>
        {/* total budget card */}
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-faint) 0%, #FFF6F0 100%)',
            borderRadius: 28, padding: '20px 20px 18px', position: 'relative', overflow: 'hidden',
          }}>
            <Tape color="var(--secondary-soft)" rotate={-5} style={{ top: -10, left: 24 }}/>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'Caveat', fontWeight: 600 }}>
                  monthly budget ✿
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>本月總預算</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 3, lineHeight: 1.4 }}>
                  信封預算：每個信封都有自己的額度，<br/>月底沒花完的錢自動存進金庫 ✿
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                  <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>NT$</span>
                  <span style={{ fontSize: 34, color: 'var(--ink)', fontWeight: 700, letterSpacing: -0.3 }}>
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="tap" onClick={() => setTotal(t => t + 1000)} style={{
                  width: 34, height: 34, borderRadius: 10, background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'var(--accent)',
                  boxShadow: 'var(--shadow-sm)',
                }}>＋</div>
                <div className="tap" onClick={() => setTotal(t => Math.max(0, t - 1000))} style={{
                  width: 34, height: 34, borderRadius: 10, background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'var(--accent)',
                  boxShadow: 'var(--shadow-sm)',
                }}>−</div>
              </div>
            </div>

            {/* progress bar with fox */}
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.7)', height: 16, borderRadius: 8, padding: 2, position: 'relative' }}>
              <div style={{
                height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: 6,
                background: overWarn
                  ? 'linear-gradient(90deg, #FFB97A 0%, #F08A8A 100%)'
                  : 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)',
                position: 'relative',
                transition: 'width 0.3s',
              }}>
                <div style={{
                  position: 'absolute', right: -12, top: -10,
                  width: 30, height: 30,
                }}>
                  <FoxMini size={30}/>
                </div>
              </div>
              {/* warning marker */}
              <div style={{
                position: 'absolute', left: `calc(${warnAt}% + 2px)`, top: -3, bottom: -3,
                width: 2, background: '#F08A8A', borderRadius: 1, opacity: 0.6,
              }}/>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12 }}>
              <span style={{ color: 'var(--ink-soft)' }}>
                已花 <b style={{ color: overWarn ? '#D86A8A' : 'var(--accent)' }}>${used.toLocaleString()}</b>
              </span>
              <span style={{ color: 'var(--ink-soft)' }}>
                還剩 <b style={{ color: '#3B8A5C' }}>${remaining.toLocaleString()}</b>
              </span>
            </div>

            {/* fox advice */}
            <div style={{
              marginTop: 12, padding: '8px 12px', borderRadius: 14,
              background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <FoxMini size={28}/>
              <span style={{ fontSize: 12, color: 'var(--ink)', flex: 1, lineHeight: 1.45 }}>
                {overWarn
                  ? '小桃覺得有點緊張…要不要看看哪邊可以省一下？'
                  : '節奏剛剛好！照這個速度月底還能存一些喔 ✿'}
              </span>
            </div>
          </div>
        </div>

        {/* allocation summary */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: 'var(--card)', borderRadius: 20, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'var(--accent-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3v18h18"/>
                <path d="M7 14l4-4 4 4 5-5"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>信封預算總額</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                ${allocated.toLocaleString()} / ${total.toLocaleString()} 已分配
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: allocated > total ? '#D86A8A' : '#3B8A5C',
            }}>
              {allocated > total ? `超 $${(allocated - total).toLocaleString()}` : `剩 $${(total - allocated).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* envelope list */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>我的信封</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Caveat', fontWeight: 600 }}>
              envelope budgeting
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {liveEnvelopes.map(env => (
              <EnvelopeCard
                key={env.id}
                env={env}
                onUpdate={(patch) => updateEnvelope(env.id, patch)}
                onAddCat={() => setAddingCatTo(env.id)}
                onDelete={() => setEnvelopes(prev => prev.filter(e => e.id !== env.id))}
              />
            ))}

            {/* add new envelope */}
            <div className="tap dashed-border" onClick={addNewEnvelope} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.5)',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 19,
                background: 'var(--accent-faint)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600,
              }}>＋</div>
              <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
                新增信封
              </span>
            </div>
          </div>
        </div>

        {/* reminder settings */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>提醒與規則</div>
          <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {/* warning threshold slider */}
            <div style={{ padding: '14px 16px', borderBottom: '1px dashed #F5E5DC' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>警示閾值</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>用到這個比例會收到通知</div>
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 999, background: 'var(--accent-faint)',
                  color: 'var(--accent)', fontWeight: 700, fontSize: 14,
                }}>{warnAt}%</div>
              </div>
              <input
                type="range" min={50} max={100} step={5}
                value={warnAt} onChange={e => setWarnAt(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* daily reminder toggle */}
            <SettingRow
              label="每日記帳提醒"
              hint="每晚 20:00 由小桃提醒你"
              value={remindOn}
              onChange={setRemindOn}
              last
            />
          </div>

          <div style={{
            marginTop: 12, padding: '12px 14px', borderRadius: 16,
            background: 'var(--accent-faint)',
            fontSize: 12, color: 'var(--ink)', lineHeight: 1.5,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 14, marginTop: -1 }}>🦊</span>
            <span style={{ flex: 1 }}>
              月底結算時，開了金庫的信封，沒花完的錢會自動進小金庫；沒開的信封則合併到下月預算。
            </span>
          </div>
        </div>
      </div>

      {addingCatTo !== null && (
        <CatPickerSheet
          existing={allAssignedCats}
          onPick={(catId) => {
            updateEnvelope(addingCatTo, {
              cats: [...(envelopes.find(e => e.id === addingCatTo)?.cats || []), catId],
            });
            setAddingCatTo(null);
          }}
          onClose={() => setAddingCatTo(null)}
        />
      )}
    </div>
  );
}

const ENVELOPE_EMOJIS = ['🧺','🎮','📈','🏠','🛡️','🛒','🍕','✈️','💊','🎓','💼','🎁','🏋️','🎵','🏡','👗','☕','📦','💻','🎨'];
const ENVELOPE_COLORS = [
  { color: '#FF8FAB', bg: '#FFE5EC' },
  { color: '#FFD66B', bg: '#FFF4D1' },
  { color: '#7DCBA8', bg: '#D8F0E2' },
  { color: '#A8D8F0', bg: '#E0F2FA' },
  { color: '#C9B8F0', bg: '#EFE9FF' },
  { color: '#FFB97A', bg: '#FFE9D6' },
  { color: '#F590BB', bg: '#FFE0EE' },
  { color: '#9DD6B0', bg: '#E2F4E8' },
];

function EnvelopeCard({ env, onUpdate, onAddCat, onDelete }) {
  const [editOpen, setEditOpen] = useStateBudget(false);
  const [amtEditing, setAmtEditing] = useStateBudget(false);
  const [amtRaw, setAmtRaw] = useStateBudget('');

  const pct = env.total > 0 ? (env.used / env.total) * 100 : 0;
  const over = pct > 100;

  const startAmtEdit = () => { setAmtRaw(String(env.total)); setAmtEditing(true); };
  const commitAmt = () => {
    const n = parseInt(amtRaw.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n) && n >= 0) onUpdate({ total: n });
    setAmtEditing(false);
  };

  return (
    <div style={{ background: 'var(--card)', borderRadius: 20, padding: '14px 14px 12px', boxShadow: 'var(--shadow-sm)' }}>
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* emoji → tap to open edit panel */}
        <div className="tap" onClick={() => setEditOpen(e => !e)} style={{
          width: 40, height: 40, borderRadius: 14,
          background: env.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          boxShadow: `inset 0 -2px 0 ${env.color}33`,
          position: 'relative',
        }}>
          {env.emoji}
          <div style={{
            position: 'absolute', bottom: -3, right: -3,
            width: 15, height: 15, borderRadius: 8,
            background: editOpen ? 'var(--accent)' : 'rgba(74,58,53,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1l2 2-6 6H1V7z"/>
            </svg>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{env.label}</div>
          <div style={{ fontSize: 11, color: over ? '#D86A8A' : 'var(--ink-soft)', marginTop: 1 }}>
            已用 ${env.used.toLocaleString()} / 預算 ${env.total.toLocaleString()}
            {over && <span> · 超支 ${(env.used - env.total).toLocaleString()}</span>}
          </div>
        </div>

        {/* amount controls: ±500 or tap to type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button onClick={() => onUpdate({ total: Math.max(0, env.total - 500) })} className="tap" style={{
            width: 26, height: 26, border: 'none', borderRadius: 8,
            background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>−</button>
          {amtEditing ? (
            <input
              type="number"
              value={amtRaw}
              onChange={e => setAmtRaw(e.target.value)}
              onBlur={commitAmt}
              onKeyDown={e => e.key === 'Enter' && commitAmt()}
              autoFocus
              style={{
                width: 64, textAlign: 'center', fontSize: 13, fontWeight: 700,
                border: '1.5px solid var(--accent)', borderRadius: 8,
                padding: '3px 4px', outline: 'none', background: '#fff',
                color: 'var(--ink)', fontFamily: 'inherit',
              }}
            />
          ) : (
            <span className="tap" onClick={startAmtEdit} style={{
              minWidth: 52, textAlign: 'center', fontSize: 13, fontWeight: 700,
              color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
              padding: '3px 4px', borderRadius: 6, background: 'var(--bg)',
            }}>
              ${env.total >= 1000 ? `${(env.total / 1000).toFixed(env.total % 1000 ? 1 : 0)}k` : env.total}
            </span>
          )}
          <button onClick={() => onUpdate({ total: env.total + 500 })} className="tap" style={{
            width: 26, height: 26, border: 'none', borderRadius: 8,
            background: 'var(--accent-faint)', color: 'var(--accent)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>＋</button>
        </div>
      </div>

      {/* edit panel */}
      {editOpen && (
        <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg)', borderRadius: 14, animation: 'pop-in 0.2s ease-out' }}>
          {/* name */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 5 }}>信封名稱</div>
            <input
              value={env.label}
              onChange={e => onUpdate({ label: e.target.value })}
              maxLength={8}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 12px', borderRadius: 10,
                border: '1.5px solid var(--accent-soft)',
                fontSize: 14, color: 'var(--ink)', fontWeight: 600,
                outline: 'none', background: '#fff', fontFamily: 'inherit',
              }}
            />
          </div>
          {/* emoji */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>圖示</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ENVELOPE_EMOJIS.map(em => (
                <div key={em} className="tap" onClick={() => onUpdate({ emoji: em })} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: env.emoji === em ? env.bg : 'rgba(0,0,0,0.04)',
                  border: `2px solid ${env.emoji === em ? env.color : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.12s',
                }}>{em}</div>
              ))}
            </div>
          </div>
          {/* color */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>顏色</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ENVELOPE_COLORS.map((c, i) => (
                <div key={i} className="tap" onClick={() => onUpdate({ color: c.color, bg: c.bg })} style={{
                  width: 28, height: 28, borderRadius: 14, background: c.color,
                  boxShadow: env.color === c.color
                    ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${c.color}`
                    : '0 1px 3px rgba(0,0,0,0.12)',
                  transition: 'all 0.12s',
                }}/>
              ))}
            </div>
          </div>
          {/* delete */}
          <div className="tap" onClick={onDelete} style={{
            padding: '9px', borderRadius: 10,
            background: '#FFF0F0', border: '1px solid #FFD5D5',
            color: '#E05A5A', fontSize: 13, fontWeight: 600, textAlign: 'center',
          }}>🗑 刪除這個信封</div>
        </div>
      )}

      {/* category chips — tap × to remove */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {env.cats.map(catId => {
          const cat = CATEGORIES.find(c => c.id === catId);
          if (!cat) return null;
          return (
            <div key={catId} className="tap" onClick={() => onUpdate({ cats: env.cats.filter(c => c !== catId) })} style={{
              padding: '3px 8px', borderRadius: 999,
              background: cat.bg, color: cat.color,
              fontSize: 11, fontWeight: 600,
              border: `1px solid ${cat.color}44`,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              {cat.label}
              <span style={{ fontSize: 10, opacity: 0.55 }}>×</span>
            </div>
          );
        })}
        <div className="tap" onClick={onAddCat} style={{
          padding: '3px 8px', borderRadius: 999,
          background: 'var(--bg)', color: 'var(--ink-soft)',
          fontSize: 11, fontWeight: 600,
          border: '1px dashed #D5CCC4',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 12 }}>＋</span>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ marginTop: 10, background: '#F5EBE4', height: 7, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(pct, 100)}%`,
          background: over ? '#D86A8A' : env.color,
          borderRadius: 4, transition: 'width 0.3s',
        }}/>
      </div>

      {/* vault toggle */}
      <div className="tap" onClick={() => onUpdate({ vault: !env.vault })} style={{
        marginTop: 10, padding: '6px 10px', borderRadius: 12,
        background: env.vault ? '#FFF1E8' : 'var(--bg)',
        display: 'flex', alignItems: 'center', gap: 8,
        border: `1px dashed ${env.vault ? '#FFD3B0' : '#E8DCD3'}`,
        transition: 'all 0.15s',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: env.vault ? 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)' : '#D5CCC4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: env.vault ? '#A85F00' : '#fff',
          fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
        }}>$</div>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--ink)' }}>
          <b style={{ color: env.vault ? '#C5751F' : 'var(--ink-soft)' }}>
            {env.vault ? '結餘進金庫' : '結餘合併下月'}
          </b>
          <span style={{ color: 'var(--ink-soft)' }}>
            {' · 預估月底入 $'}{Math.max(0, env.total - env.used).toLocaleString()}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>切換</span>
      </div>
    </div>
  );
}

function CatPickerSheet({ existing, onPick, onClose }) {
  const available = CATEGORIES.filter(c => !existing.includes(c.id) && c.id !== 'salary');
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 78,
      background: 'rgba(74,58,53,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: '28px 28px 0 0',
        maxHeight: '70%', overflowY: 'auto',
        animation: 'slide-up 0.28s cubic-bezier(.3,.7,.4,1)',
        paddingBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(74,58,53,0.2)' }}/>
        </div>
        <div style={{ padding: '10px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>新增分類到信封</div>
          <span className="tap" onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-soft)' }}>取消</span>
        </div>
        {available.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)' }}>
            所有分類都已加入信封了 ✿
          </div>
        ) : (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {available.map(c => (
              <div key={c.id} className="tap" onClick={() => onPick(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 14,
                background: 'var(--card)',
              }}>
                <CatBubble id={c.id} size={38}/>
                <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 600 }}>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingRow({ label, hint, value, onChange, last }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px dashed #F5E5DC',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{hint}</div>}
      </div>
      <div onClick={() => onChange(!value)} className="tap" style={{
        width: 44, height: 26, borderRadius: 13,
        background: value ? '#7DCBA8' : '#D5CCC4',
        position: 'relative', transition: 'background 0.15s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 21 : 3,
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s',
        }}/>
      </div>
    </div>
  );
}

Object.assign(window, { BudgetScreen });
