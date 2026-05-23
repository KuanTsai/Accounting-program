// Category management — list + reorder + per-category edit sheet

const { useState: useStateCat, useEffect: useEffectCat } = React;

const DEFAULT_CATS = () => CATEGORIES.map(c => ({
  ...c,
  on: true,
  type: c.id === 'salary' ? 'income' : 'expense',
}));

function CategoryScreen({ onClose, transactions = [] }) {
  const now = new Date();
  const catCount = {};
  transactions.forEach(tx => {
    if (!tx.createdAt) return;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      catCount[tx.cat] = (catCount[tx.cat] || 0) + 1;
    }
  });

  const [cats, setCats] = useStateCat(DEFAULT_CATS);
  const [editingIdx, setEditingIdx] = useStateCat(null);
  const [saving, setSaving] = useStateCat(false);

  // Load from Firestore on mount
  useEffectCat(() => {
    const uid = window.auth.currentUser?.uid;
    if (!uid) return;
    window.db.collection('users').doc(uid).collection('settings').doc('categories').get()
      .then(doc => {
        if (doc.exists && doc.data().cats && doc.data().cats.length > 0) {
          setCats(doc.data().cats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const uid = window.auth.currentUser?.uid;
    if (uid) {
      try {
        await window.db.collection('users').doc(uid).collection('settings').doc('categories').set({ cats });
      } catch(e) {}
    }
    // Sync global CATEGORIES in-place so every other screen sees the update
    const updated = cats.filter(c => c.on !== false).map(({ id, label, color, bg }) => ({ id, label, color, bg }));
    CATEGORIES.splice(0, CATEGORIES.length, ...updated);
    setSaving(false);
    onClose();
  };

  const expense = cats.filter(c => c.type === 'expense');
  const income  = cats.filter(c => c.type === 'income');

  const updateCat = (idx, patch) => {
    setCats(cs => cs.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const deleteCat = (idx) => {
    setCats(cs => cs.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

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
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)' }}>分類管理</div>
        <div className="tap" onClick={handleSave} style={{
          padding: '6px 14px', borderRadius: 999, background: 'var(--accent)',
          color: '#fff', fontSize: 13, fontWeight: 600,
        }}>{saving ? '儲存中…' : '儲存'}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {/* info hint */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{
            background: 'var(--accent-faint)', borderRadius: 16, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <FoxMini size={26}/>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
              點分類可以改名字、圖示和顏色，或用右上 + 新增自己的分類。
            </span>
          </div>
        </div>

        {/* expense list */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>支出分類</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{expense.length} 個</span>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {expense.map((c) => {
              const realIdx = cats.findIndex(x => x.id === c.id);
              return (
                <CategoryRow key={c.id} cat={c} count={catCount[c.id] || 0}
                  onTap={() => setEditingIdx(realIdx)}
                  onToggle={() => updateCat(realIdx, { on: !c.on })}/>
              );
            })}
            <AddCatRow label="新增支出分類" onClick={() => setEditingIdx('new')}/>
          </div>
        </div>

        {/* income list */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>收入分類</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{income.length} 個</span>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {income.map((c) => {
              const realIdx = cats.findIndex(x => x.id === c.id);
              return (
                <CategoryRow key={c.id} cat={c} count={catCount[c.id] || 0}
                  onTap={() => setEditingIdx(realIdx)}
                  onToggle={() => updateCat(realIdx, { on: !c.on })}/>
              );
            })}
            <AddCatRow label="新增收入分類" onClick={() => setEditingIdx('new-income')}/>
          </div>
        </div>
      </div>

      {/* edit sheet */}
      {editingIdx !== null && (
        <CategoryEditSheet
          cat={typeof editingIdx === 'string' ? null : cats[editingIdx]}
          isNew={typeof editingIdx === 'string'}
          defaultType={editingIdx === 'new-income' ? 'income' : 'expense'}
          onClose={() => setEditingIdx(null)}
          onSave={(patch) => {
            if (typeof editingIdx === 'string') {
              setCats([...cats, { ...patch, id: 'custom-' + Date.now(), on: true, count: 0 }]);
            } else {
              updateCat(editingIdx, patch);
            }
            setEditingIdx(null);
          }}
          onDelete={() => typeof editingIdx === 'number' && deleteCat(editingIdx)}
        />
      )}
    </div>
  );
}

function CategoryRow({ cat, count = 0, onTap, onToggle }) {
  const iconId = cat.icon || cat.id;
  const bg = cat.bg || '#FFE5EC';
  const color = cat.color || '#FF8FAB';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '10px 16px',
      borderBottom: '1px dashed #F5E5DC',
      opacity: cat.on ? 1 : 0.5,
    }}>
      <div className="tap" onClick={onTap} style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CatIcon id={iconId} size={22} color={color}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 600 }}>{cat.label}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>本月 {count} 筆</div>
        </div>
      </div>

      <div onClick={onToggle} className="tap" style={{
        width: 38, height: 22, borderRadius: 11,
        background: cat.on ? '#7DCBA8' : '#D5CCC4',
        position: 'relative', transition: 'background 0.15s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: cat.on ? 18 : 2,
          width: 18, height: 18, borderRadius: 9, background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left 0.15s',
        }}/>
      </div>
    </div>
  );
}

function AddCatRow({ label, onClick }) {
  return (
    <div className="tap" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', padding: '12px 16px',
      borderTop: '1px dashed #F5E5DC',
      color: 'var(--accent)', fontSize: 14, fontWeight: 600,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: 'var(--accent-faint)', marginRight: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700,
      }}>＋</div>
      {label}
    </div>
  );
}

// ── Edit / Create category bottom sheet ─────────────────────────
const CAT_PRESET_ICONS = ['food', 'drink', 'transport', 'shop', 'fun', 'beauty', 'home', 'health', 'study', 'gift', 'travel', 'salary'];
const CAT_PRESET_COLORS = [
  { color: '#FF8FAB', bg: '#FFE5EC' },
  { color: '#FFB97A', bg: '#FFE9D6' },
  { color: '#FFD66B', bg: '#FFF4D1' },
  { color: '#9DD6B0', bg: '#E2F4E8' },
  { color: '#7DCBC4', bg: '#D8F0EE' },
  { color: '#A8D8F0', bg: '#E0F2FA' },
  { color: '#C9B8F0', bg: '#EFE9FF' },
  { color: '#F590BB', bg: '#FFE0EE' },
  { color: '#F08A8A', bg: '#FFE0E0' },
  { color: '#7DCBA8', bg: '#D8F0E2' },
];

function CategoryEditSheet({ cat, isNew, defaultType, onClose, onSave, onDelete }) {
  const [label, setLabel] = useStateCat(cat?.label || '');
  const [icon, setIcon] = useStateCat(cat?.id && CAT_PRESET_ICONS.includes(cat.id) ? cat.id : 'food');
  const [colorIdx, setColorIdx] = useStateCat(() => {
    if (cat) {
      const i = CAT_PRESET_COLORS.findIndex(p => p.color === cat.color);
      return i >= 0 ? i : 0;
    }
    return 0;
  });
  const c = CAT_PRESET_COLORS[colorIdx];
  const canSave = label.trim().length > 0;

  // Temporarily inject this cat into CATEGORIES so CatBubble can render the preview
  // Actually CatBubble looks up by id from CATEGORIES — but we need to render preview
  // with chosen icon/color. Let's render directly.
  const previewIcon = icon;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 78,
      background: 'rgba(74,58,53,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'pop-in 0.2s ease-out',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: '28px 28px 0 0',
        maxHeight: '88%', overflowY: 'auto',
        animation: 'slide-up 0.32s cubic-bezier(.3,.7,.4,1)',
        paddingBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(74,58,53,0.2)' }}/>
        </div>

        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="tap" onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '6px 4px', minWidth: 40 }}>
            取消
          </span>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>
            {isNew ? '新增分類' : '編輯分類'}
          </div>
          <span
            className="tap"
            onClick={() => canSave && onSave({
              label: label.trim(),
              color: c.color, bg: c.bg,
              icon, type: cat?.type || defaultType || 'expense',
            })}
            style={{
              fontSize: 14, color: canSave ? 'var(--accent)' : 'var(--ink-faint)',
              fontWeight: 700, padding: '6px 4px',
            }}>
            {isNew ? '建立' : '儲存'}
          </span>
        </div>

        {/* preview */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{
            background: 'var(--card)', borderRadius: 18, padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26,
              background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 -2px 0 ${c.color}22`,
            }}>
              <CatIcon id={previewIcon} size={28} color={c.color}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 700 }}>
                {label.trim() || '分類名稱'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{
                  fontSize: 10, color: c.color, fontWeight: 600,
                  background: c.bg, padding: '2px 8px', borderRadius: 999,
                }}>
                  {(cat?.type || defaultType) === 'income' ? '收入' : '支出'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* name */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>分類名稱</div>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="例如：寵物、訂閱服務、孝親費…"
            maxLength={10}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--card)', borderRadius: 14, border: 'none', outline: 'none',
              padding: '12px 14px', fontSize: 15, color: 'var(--ink)',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </div>

        {/* icon */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>挑個圖示</div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
            boxShadow: 'var(--shadow-sm)',
          }}>
            {CAT_PRESET_ICONS.map(id => {
              const sel = icon === id;
              return (
                <div key={id} className="tap" onClick={() => setIcon(id)} style={{
                  aspectRatio: '1', borderRadius: 10,
                  background: sel ? c.bg : 'transparent',
                  border: sel ? `2px solid ${c.color}` : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  <CatIcon id={id} size={22} color={sel ? c.color : 'var(--ink-faint)'}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* color */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>挑個顏色</div>
          <div style={{
            background: 'var(--card)', borderRadius: 14, padding: 10,
            display: 'flex', gap: 6, justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {CAT_PRESET_COLORS.map((co, i) => {
              const sel = colorIdx === i;
              return (
                <div key={i} className="tap" onClick={() => setColorIdx(i)} style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: co.color,
                  boxShadow: sel
                    ? `0 0 0 2px #fff, 0 0 0 4px ${co.color}, 0 2px 6px rgba(0,0,0,0.15)`
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  transition: 'all 0.15s',
                }}>{sel && '✓'}</div>
              );
            })}
          </div>
        </div>

        {/* delete (only for existing custom OR all existing) */}
        {!isNew && (
          <div style={{ padding: '18px 20px 0' }}>
            <div className="tap" onClick={onDelete} style={{
              background: '#fff', borderRadius: 14,
              padding: '12px 16px', textAlign: 'center',
              color: '#D86A8A', fontSize: 13, fontWeight: 600,
              border: '1px dashed #FFC2D1',
            }}>
              刪除這個分類
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 6 }}>
              刪除後過去紀錄會保留
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CategoryScreen });
