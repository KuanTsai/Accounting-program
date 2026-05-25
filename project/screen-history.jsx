// Transaction history — all records grouped by date, editable

function HistoryScreen({ transactions = [], onClose, onEdit, onDelete }) {
  const DAY = ['日', '一', '二', '三', '四', '五', '六'];
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  const sorted = transactions
    .filter(t => t.createdAt)
    .map(t => ({ ...t, _d: t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt) }))
    .sort((a, b) => b._d - a._d);

  // group by day, preserving sort order
  const groups = [];
  const byKey = {};
  sorted.forEach(tx => {
    const key = tx._d.toDateString();
    if (!byKey[key]) {
      byKey[key] = { key, date: tx._d, items: [] };
      groups.push(byKey[key]);
    }
    const hh = tx._d.getHours().toString().padStart(2, '0');
    const mm = tx._d.getMinutes().toString().padStart(2, '0');
    byKey[key].items.push({ ...tx, time: `${hh}:${mm}` });
  });

  const labelFor = (d) => {
    const ds = d.toDateString();
    if (ds === today) return '今天';
    if (ds === yesterday) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日 週${DAY[d.getDay()]}`;
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
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)' }}>全部記錄</div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 30px', color: 'var(--ink-faint)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
            <div className="hand" style={{ fontSize: 18, color: 'var(--ink-soft)', marginBottom: 8 }}>還沒有記錄</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>點下面的 ＋ 開始記帳 ✿</div>
          </div>
        ) : groups.map(g => {
          const dayExpense = g.items.filter(t => t.amt < 0).reduce((s, t) => s + Math.abs(t.amt), 0);
          const dayIncome = g.items.filter(t => t.amt > 0).reduce((s, t) => s + t.amt, 0);
          return (
            <div key={g.key} style={{ padding: '14px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="hand" style={{ fontSize: 18, color: 'var(--ink)' }}>{labelFor(g.date)}</div>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                  {dayIncome > 0 && <span style={{ color: '#3B8A5C', marginRight: 8 }}>+${dayIncome.toLocaleString()}</span>}
                  支出 ${dayExpense.toLocaleString()}
                </span>
              </div>
              <div style={{ background: 'var(--card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {g.items.map((tx, i, arr) => (
                  <TxRow key={tx.id || i} tx={tx} isLast={i === arr.length - 1} onEdit={onEdit} onDelete={onDelete}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HistoryScreen });
