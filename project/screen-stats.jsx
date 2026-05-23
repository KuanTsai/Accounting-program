// Stats screen — pie chart, category breakdown, monthly trend

function StatsScreen({ data, transactions = [], envelopes = [] }) {
  const now = new Date();

  // Current month expenses
  const monthlyExpense = transactions.filter(tx => {
    if (!tx.createdAt || tx.amt >= 0) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const total = data.expense;

  // Category breakdown
  const catTotals = {};
  monthlyExpense.forEach(tx => {
    catTotals[tx.cat] = (catTotals[tx.cat] || 0) + Math.abs(tx.amt);
  });
  const breakdown = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amt]) => ({ id, amt, pct: total > 0 ? Math.round((amt / total) * 100) : 0 }));

  // Monthly trend (last 6 months)
  const monthlyTotals = {};
  transactions.filter(tx => tx.amt < 0 && tx.createdAt).forEach(tx => {
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(tx.amt);
  });
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { m: d.getMonth() + 1, v: monthlyTotals[key] || 0, isThis: i === 5 };
  });
  const trendMax = Math.max(...trend.map(t => t.v), 1);

  const maxTx = monthlyExpense.reduce((mx, tx) => Math.abs(tx.amt) > mx ? Math.abs(tx.amt) : mx, 0);
  const dailyAvg = total > 0 ? Math.round(total / now.getDate()) : 0;

  // donut SVG
  const cx = 80, cy = 80, r = 58, sw = 22;
  const C = 2 * Math.PI * r;
  let offset = 0;

  const segColors = ['#FF8FAB', '#FFB97A', '#C9B8F0', '#FFD66B', '#A8D8F0', '#F590BB', '#9DD6B0'];

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="本月花在哪裡？"
        subtitle="Where did the money go ✿"
        right={
          <div className="tap" style={{
            padding: '6px 14px', borderRadius: 999, background: '#fff',
            fontSize: 12, color: 'var(--ink)', fontWeight: 600,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            5月
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" stroke="var(--ink-soft)" strokeWidth="1.8">
              <path d="M1 1l3.5 3.5L8 1"/>
            </svg>
          </div>
        }
      />

      {/* donut card */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 28, padding: 22,
          boxShadow: 'var(--shadow-card)', position: 'relative',
        }}>
          <Tape color="var(--lavender)" rotate={-4} style={{ top: -10, left: '50%', marginLeft: -35 }}/>

          {total === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-faint)', fontSize: 14 }}>
              本月還沒有支出記錄 ✿
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
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#8C7670" fontFamily="Caveat, cursive" fontWeight="600">total</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="20" fill="#4A3A35" fontWeight="700">${total.toLocaleString()}</text>
                <text x={cx} y={cy + 30} textAnchor="middle" fontSize="9" fill="#C4ADA5">NT$</text>
              </svg>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                  <span>日均</span><b style={{ color: 'var(--ink)' }}>${dailyAvg.toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                  <span>筆數</span><b style={{ color: 'var(--ink)' }}>{monthlyExpense.length} 筆</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>最大筆</span><b style={{ color: 'var(--ink)' }}>${maxTx.toLocaleString()}</b>
                </div>
                <div style={{
                  marginTop: 8, background: 'var(--accent-faint)',
                  borderRadius: 10, padding: '6px 8px',
                  fontSize: 11, color: 'var(--accent)', fontWeight: 600,
                }}>
                  <FoxMini size={20}/>
                  <span style={{ marginLeft: 4, verticalAlign: 'middle' }}>記帳好習慣！</span>
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
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : '1px dashed #F5E5DC',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
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
              const used = (env.cats || []).reduce((s, cid) => s + (catTotals[cid] || 0), 0);
              const pct = env.total > 0 ? Math.min(100, Math.round((used / env.total) * 100)) : 0;
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
                      <div style={{ fontSize: 15, fontWeight: 700, color: over ? '#E05A5A' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>${used.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: over ? '#E05A5A' : 'var(--ink-soft)' }}>{over ? '超支！' : `${pct}%`}</div>
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
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>近 6 個月</div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {trend.map((b, i) => {
              const h = trendMax > 0 ? Math.max((b.v / trendMax) * 100, b.v > 0 ? 6 : 0) : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                    {b.isThis && b.v > 0 ? `$${(b.v / 1000).toFixed(1)}k` : ''}
                  </span>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: b.v > 0 ? 4 : 0,
                    background: b.isThis ? 'var(--accent)' : 'var(--accent-soft)',
                    borderRadius: 8, position: 'relative',
                  }}>
                    {b.isThis && b.v > 0 && (
                      <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)' }}>
                        <FoxMini size={14}/>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: b.isThis ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: b.isThis ? 700 : 500 }}>
                    {b.m}月
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatsScreen });
