// Budget management screen — set total + per-category, warnings, reminders

const { useState: useStateBudget, useEffect: useEffectBudget } = React;

const DEFAULT_ITEMS = [
  { id: 'food',      total: 6000, on: true,  vault: true  },
  { id: 'shop',      total: 3500, on: true,  vault: true  },
  { id: 'fun',       total: 4000, on: true,  vault: true  },
  { id: 'drink',     total: 2000, on: true,  vault: true  },
  { id: 'transport', total: 1500, on: true,  vault: false },
  { id: 'beauty',    total: 1500, on: true,  vault: true  },
  { id: 'travel',    total: 3000, on: false, vault: false },
];

function BudgetScreen({ onClose, transactions = [] }) {
  const [total, setTotal] = useStateBudget(20000);
  const [warnAt, setWarnAt] = useStateBudget(80);
  const [remindOn, setRemindOn] = useStateBudget(true);
    const [items, setItems] = useStateBudget(null); // null = loading
  const [saving, setSaving] = useStateBudget(false);
  const [addingCat, setAddingCat] = useStateBudget(false);

  // Load budget settings from Firestore
  useEffectBudget(() => {
    const uid = window.auth.currentUser?.uid;
    if (!uid) { setItems(DEFAULT_ITEMS); return; }
    window.db.collection('users').doc(uid).collection('settings').doc('budget').get()
      .then(doc => {
        if (!doc.exists) { setItems(DEFAULT_ITEMS); return; }
        const d = doc.data();
        if (d.total)   setTotal(d.total);
        if (d.warnAt)  setWarnAt(d.warnAt);
        if (d.remindOn !== undefined) setRemindOn(d.remindOn);
        setItems(d.items && d.items.length > 0 ? d.items : DEFAULT_ITEMS);
      })
      .catch(() => setItems(DEFAULT_ITEMS));
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

  if (!items) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontSize: 30, animation: 'wiggle 1s infinite' }}>✿</div>
    </div>
  );

  const liveItems = items.map(it => ({ ...it, used: catUsed[it.id] || 0 }));

  const allocated = liveItems.filter(i => i.on).reduce((s, i) => s + i.total, 0);
  const used = liveItems.reduce((s, i) => s + i.used, 0);
  const remaining = total - used;
  const pct = (used / total) * 100;
  const overWarn = pct > warnAt;

  const updateItem = (id, key, val) => {
    setItems(items.map(i => i.id === id ? { ...i, [key]: val } : i));
  };

  const handleSave = async () => {
    setSaving(true);
    const uid = window.auth.currentUser?.uid;
    if (uid) {
      await window.db.collection('users').doc(uid).collection('settings').doc('budget').set({
        total, warnAt, remindOn, items,
      });
    }
    setSaving(false);
    onClose();
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
        {/* total budget */}
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
                  信封預算：每個分類都有自己的額度，<br/>月底沒花完的錢自動存進金庫 ✿
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

            {/* progress with fox */}
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
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>分類預算總額</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                ${allocated.toLocaleString()} / ${total.toLocaleString()} 已分配
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: allocated > total ? '#D86A8A' : '#3B8A5C',
            }}>
              {allocated > total ? `超 $${allocated - total}` : `剩 $${total - allocated}`}
            </span>
          </div>
        </div>

        {/* per-category */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>分類預算</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Caveat', fontWeight: 600 }}>
              tap to edit
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveItems.map(it => (
              <BudgetItem key={it.id} item={it} onChange={(k, v) => updateItem(it.id, k, v)}/>
            ))}

            {/* add new */}
            <div className="tap dashed-border" onClick={() => setAddingCat(true)} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.5)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: 'var(--accent-faint)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600,
              }}>＋</div>
              <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
                新增分類預算
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
              月底結算時，開了金庫的分類，沒花完的錢會自動進小金庫；沒開的分類則合併到下月預算。
            </span>
          </div>
        </div>
      </div>

      {addingCat && (
        <CatPickerSheet
          existing={items.map(i => i.id)}
          onPick={(id) => {
            setItems(prev => [...prev, { id, total: 1000, on: true, vault: true }]);
            setAddingCat(false);
          }}
          onClose={() => setAddingCat(false)}
        />
      )}
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
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>選擇分類</div>
          <span className="tap" onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-soft)' }}>取消</span>
        </div>
        {available.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)' }}>
            所有分類都已加入預算了 ✿
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

function BudgetItem({ item, onChange }) {
  const cat = CATEGORIES.find(c => c.id === item.id);
  const pct = (item.used / item.total) * 100;
  const over = pct > 100;
  const warn = pct > 85;

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 18, padding: '12px 14px',
      boxShadow: 'var(--shadow-sm)',
      opacity: item.on ? 1 : 0.55,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CatBubble id={item.id} size={38}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{cat?.label}</div>
          <div style={{ fontSize: 11, color: over ? '#D86A8A' : 'var(--ink-soft)', marginTop: 1 }}>
            已用 ${item.used.toLocaleString()} / 預算 ${item.total.toLocaleString()}
            {over && <span> · 超支 ${item.used - item.total}</span>}
          </div>
        </div>

        {/* +/- amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => onChange('total', Math.max(0, item.total - 500))} className="tap" style={{
            width: 26, height: 26, border: 'none', borderRadius: 8,
            background: 'var(--bg)', color: 'var(--ink)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
          }}>−</button>
          <span style={{
            minWidth: 56, textAlign: 'center', fontSize: 13, fontWeight: 700,
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}>${item.total >= 1000 ? `${(item.total / 1000).toFixed(item.total % 1000 ? 1 : 0)}k` : item.total}</span>
          <button onClick={() => onChange('total', item.total + 500)} className="tap" style={{
            width: 26, height: 26, border: 'none', borderRadius: 8,
            background: 'var(--accent-faint)', color: 'var(--accent)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
          }}>＋</button>
          {/* on/off */}
          <div onClick={() => onChange('on', !item.on)} className="tap" style={{
            marginLeft: 6, width: 32, height: 18, borderRadius: 9,
            background: item.on ? '#7DCBA8' : '#D5CCC4',
            position: 'relative', transition: 'background 0.15s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: item.on ? 16 : 2,
              width: 14, height: 14, borderRadius: 7, background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left 0.15s',
            }}/>
          </div>
        </div>
      </div>

      {/* bar */}
      <div style={{ marginTop: 10, background: '#F5EBE4', height: 6, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(pct, 100)}%`,
          background: over ? '#D86A8A' : warn ? 'var(--secondary)' : cat.color,
          borderRadius: 3, transition: 'width 0.3s',
        }}/>
      </div>

      {/* vault toggle — chip that flips between two modes */}
      {item.on && (
        <div
          className="tap"
          onClick={() => onChange('vault', !item.vault)}
          style={{
            marginTop: 10, padding: '6px 10px', borderRadius: 12,
            background: item.vault ? '#FFF1E8' : 'var(--bg)',
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1px dashed ${item.vault ? '#FFD3B0' : '#E8DCD3'}`,
            transition: 'all 0.15s',
          }}>
          <div style={{
            width: 22, height: 22, borderRadius: 11,
            background: item.vault ? 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)' : '#D5CCC4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: item.vault ? '#A85F00' : '#fff',
            fontSize: 11, fontWeight: 700,
            transition: 'all 0.15s',
          }}>$</div>
          <div style={{ flex: 1, fontSize: 11, color: 'var(--ink)' }}>
            <b style={{ color: item.vault ? '#C5751F' : 'var(--ink-soft)' }}>
              {item.vault ? '結餘進金庫' : '結餘合併下月'}
            </b>
            <span style={{ color: 'var(--ink-soft)' }}>
              {' · 預估月底入 $'}{Math.max(0, item.total - item.used).toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--ink-faint)' }}>切換</span>
        </div>
      )}
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
