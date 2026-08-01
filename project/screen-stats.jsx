// Stats screen — pie chart, category breakdown, monthly trend

const { useState: useStateStats } = React;

function StatsScreen({ data, transactions = [], envelopes = [] }) {
  const now = new Date();
  const [selYear, setSelYear] = useStateStats(now.getFullYear());
  const [selMonth, setSelMonth] = useStateStats(now.getMonth());

  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth();

  const goPrev = () => {
    if (selMonth === 0) { setSelYear(y => y - 1); setSelMonth(11); }
    else setSelMonth(m => m - 1);
  };
  const goNext = () => {
    if (isCurrentMonth) return;
    if (selMonth === 11) { setSelYear(y => y + 1); setSelMonth(0); }
    else setSelMonth(m => m + 1);
  };

  // Filter transactions for the selected month
  const monthlyAll = transactions.filter(tx => {
    if (!tx.createdAt) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === selYear && d.getMonth() === selMonth;
  });
  const monthlyExpense = monthlyAll.filter(tx => tx.amt < 0);
  const monthlyIncome  = monthlyAll.filter(tx => tx.amt > 0);

  const total       = monthlyExpense.reduce((s, tx) => s + Math.abs(tx.amt), 0);
  const totalIncome = monthlyIncome.reduce((s, tx) => s + tx.amt, 0);

  // Envelope usage for the selected month
  const envExplicit = {};
  const catImplicit = {};
  monthlyAll.forEach(tx => {
    const delta = -tx.amt;
    if (tx.envelope) envExplicit[tx.envelope] = (envExplicit[tx.envelope] || 0) + delta;
    else catImplicit[tx.cat] = (catImplicit[tx.cat] || 0) + delta;
  });

  // Category breakdown (expenses only)
  const catTotals = {};
  monthlyExpense.forEach(tx => {
    catTotals[tx.cat] = (catTotals[tx.cat] || 0) + Math.abs(tx.amt);
  });
  const breakdown = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amt]) => ({ id, amt, pct: total > 0 ? Math.round((amt / total) * 100) : 0 }));

  // For past months use full month days; for current month use days elapsed
  const daysInPeriod = isCurrentMonth
    ? now.getDate()
    : new Date(selYear, selMonth + 1, 0).getDate();
  const dailyAvg = total > 0 ? Math.round(total / daysInPeriod) : 0;
  const maxTx = monthlyExpense.reduce((mx, tx) => Math.abs(tx.amt) > mx ? Math.abs(tx.amt) : mx, 0);

  // Monthly trend — last 6 months from today, always (provides context regardless of selected month)
  const mTotals = {}, mIncomes = {};
  transactions.filter(tx => tx.createdAt).forEach(tx => {
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (tx.amt < 0) mTotals[key]  = (mTotals[key]  || 0) + Math.abs(tx.amt);
    else            mIncomes[key] = (mIncomes[key] || 0) + tx.amt;
  });
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return {
      m: d.getMonth() + 1, y: d.getFullYear(),
      exp: mTotals[key]  || 0,
      inc: mIncomes[key] || 0,
      isSel: d.getFullYear() === selYear && d.getMonth() === selMonth,
    };
  });
  const trendMax = Math.max(...trend.map(t => Math.max(t.exp, t.inc)), 1);

  // Compact amount formatter for trend labels
  const fmtTrend = v => {
    if (v === 0) return '';
    if (v >= 10000) return `${Math.round(v / 1000)}k`;
    if (v >= 1000)  return `${(v / 1000).toFixed(1)}k`;
    return `$${v}`;
  };

  // Donut SVG
  const cx = 80, cy = 80, r = 58, sw = 22;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const segColors = ['#FF8FAB', '#FFB97A', '#C9B8F0', '#FFD66B', '#A8D8F0', '#F590BB', '#9DD6B0'];

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title={`${selMonth + 1}月花在哪裡？`}
        subtitle="Where did the money go ✿"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '4px 4px', borderRadius: 999, background: '#fff', boxShadow: 'var(--shadow-sm)' }}>
            <div className="tap" onClick={goPrev} style={{ padding: '2px 8px', fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1, fontWeight: 300 }}>‹</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', minWidth: 30, textAlign: 'center' }}>{selMonth + 1}月</span>
            <div
              className={isCurrentMonth ? '' : 'tap'}
              onClick={goNext}
              style={{ padding: '2px 8px', fontSize: 18, lineHeight: 1, fontWeight: 300, color: isCurrentMonth ? '#DDD' : 'var(--ink-soft)', cursor: isCurrentMonth ? 'default' : 'pointer' }}
            >›</div>
          </div>
        }
      />

      {/* donut card */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ background: 'var(--card)', borderRadius: 28, padding: 22, boxShadow: 'var(--shadow-card)', position: 'relative' }}>
          <Tape color="var(--lavender)" rotate={-4} style={{ top: -10, left: '50%', marginLeft: -35 }}/>

          {total === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-faint)', fontSize: 14 }}>
              {selMonth + 1}月沒有支出記錄 ✿
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F5EBE4" strokeWidth={sw}/>
                {breakdown.slice(0, 7).map((b, i) => {
                  const len = (b.pct / 100) * C;
                  const dasharray = `${len} ${C - len}`;
                  const dashoffset = -offset;
                  offset += len;
                  return (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                      stroke={segColors[i % segColors.length]} strokeWidth={sw}
                      strokeDasharray={dasharray} strokeDashoffset={dashoffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      strokeLinecap="butt"/>
                  );
                })}
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#8C7670" fontFamily="Caveat, cursive" fontWeight="600">支出</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="20" fill="#4A3A35" fontWeight="700">${total.toLocaleString()}</text>
                <text x={cx} y={cy + 30} textAnchor="middle" fontSize="9" fill="#C4ADA5">NT$</text>
              </svg>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-soft)' }}>
                {totalIncome > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                    <span>收入</span><b style={{ color: '#3B8A5C' }}>+${totalIncome.toLocaleString()}</b>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                  <span>日均支出</span><b style={{ color: 'var(--ink)' }}>${dailyAvg.toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                  <span>筆數</span><b style={{ color: 'var(--ink)' }}>{monthlyExpense.length} 筆</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>最大單筆</span><b style={{ color: 'var(--ink)' }}>${maxTx.toLocaleString()}</b>
                </div>
                <div style={{ marginTop: 8, background: 'var(--accent-faint)', borderRadius: 10, padding: '6px 8px', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  <FoxMini size={20}/>
                  <span style={{ marginLeft: 4, verticalAlign: 'middle' }}>
                    {isCurrentMonth ? '記帳好習慣！' : `${selMonth + 1}月存檔 ✿`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* category breakdown */}
      {breakdown.length > 0 && (
        <div style={{ padding: '18px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>分類排行</div>
          <div style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {breakdown.slice(0, 6).map((b, i, arr) => {
              const cat = CATEGORIES.find(c => c.id === b.id);
              return (
                <div key={i} style={{ padding: '12px 16px', borderBottom: i === arr.length - 1 ? 'none' : '1px dashed #F5E5DC', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CatBubble id={b.id} size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{cat?.label || b.id}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>${b.amt.toLocaleString()}</span>
                    </div>
                    <div style={{ background: '#F5EBE4', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${b.pct}%`, borderRadius: 3, background: segColors[i % segColors.length], transition: 'width 0.5s ease' }}/>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, width: 32, textAlign: 'right' }}>{b.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* envelope analysis */}
      {envelopes.length > 0 && (
        <div style={{ padding: '18px 20px 0' }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>信封分析</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {envelopes.map(env => {
              const used = (envExplicit[env.id] || 0) + (env.cats || []).reduce((s, cid) => s + (catImplicit[cid] || 0), 0);
              const pct  = env.total > 0 ? Math.max(0, Math.min(100, Math.round((used / env.total) * 100))) : 0;
              const over = used > env.total;
              return (
                <div key={env.id} style={{ background: 'var(--card)', borderRadius: 18, padding: '12px 14px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: env.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{env.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{env.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>預算 ${env.total.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: over ? '#E05A5A' : '#3B8A5C', fontVariantNumeric: 'tabular-nums' }}>
                        {over ? `超 $${(used - env.total).toLocaleString()}` : `剩 $${(env.total - used).toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: 10, color: over ? '#E05A5A' : 'var(--ink-soft)' }}>
                        {over ? '超支！' : `已用 $${used.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#F5EBE4', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: over ? '#E05A5A' : env.color, transition: 'width 0.5s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* monthly trend */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>近 6 個月</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--ink-soft)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: '#9DD6B0', display: 'inline-block' }}/>收入
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: '#FF8FAB', display: 'inline-block' }}/>支出
            </span>
          </div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: '16px 16px 12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {trend.map((b, i) => {
              const BAR_H = 80;
              const expH = trendMax > 0 ? Math.max((b.exp / trendMax) * BAR_H, b.exp > 0 ? 4 : 0) : 0;
              const incH = trendMax > 0 ? Math.max((b.inc / trendMax) * BAR_H, b.inc > 0 ? 4 : 0) : 0;
              return (
                <div
                  key={i}
                  className="tap"
                  onClick={() => { setSelYear(b.y); setSelMonth(b.m - 1); }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                >
                  {/* expense amount label */}
                  <span style={{
                    fontSize: 9, fontWeight: b.isSel ? 700 : 400,
                    color: b.isSel ? 'var(--accent)' : 'var(--ink-faint)',
                    minHeight: 12, lineHeight: 1.2, textAlign: 'center',
                  }}>
                    {b.exp > 0 ? fmtTrend(b.exp) : ''}
                  </span>
                  {/* bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: BAR_H }}>
                    {/* income bar */}
                    <div style={{
                      width: 7, height: incH,
                      background: b.isSel ? '#5CB87E' : '#C5E8D1',
                      borderRadius: '3px 3px 2px 2px', alignSelf: 'flex-end',
                      transition: 'height 0.4s ease',
                    }}/>
                    {/* expense bar */}
                    <div style={{
                      width: 11, height: expH,
                      background: b.isSel ? 'var(--accent)' : 'var(--accent-soft)',
                      borderRadius: '4px 4px 2px 2px', alignSelf: 'flex-end',
                      position: 'relative', transition: 'height 0.4s ease',
                    }}>
                      {b.isSel && b.exp > 0 && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                          <FoxMini size={12}/>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* month label */}
                  <span style={{
                    fontSize: 10, fontWeight: b.isSel ? 700 : 400,
                    color: b.isSel ? 'var(--accent)' : 'var(--ink-soft)',
                  }}>{b.m}月</span>
                </div>
              );
            })}
          </div>

          {/* selected month summary row */}
          {(() => {
            const sel = trend.find(t => t.isSel);
            if (!sel || (sel.exp === 0 && sel.inc === 0)) return null;
            const net = sel.inc - sel.exp;
            return (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #F5E5DC', display: 'flex', justifyContent: 'space-around', fontSize: 11 }}>
                {sel.inc > 0 && (
                  <span style={{ color: '#3B8A5C' }}>收 <b>+${sel.inc.toLocaleString()}</b></span>
                )}
                {sel.exp > 0 && (
                  <span style={{ color: '#E05A5A' }}>支 <b>-${sel.exp.toLocaleString()}</b></span>
                )}
                {sel.inc > 0 && sel.exp > 0 && (
                  <span style={{ color: net >= 0 ? '#3B8A5C' : '#E05A5A' }}>
                    淨 <b>{net >= 0 ? '+' : ''}{net.toLocaleString()}</b>
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatsScreen });
