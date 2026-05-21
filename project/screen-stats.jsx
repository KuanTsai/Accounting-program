// Stats screen — pie chart, category breakdown, monthly trend

function StatsScreen({ data }) {
  const total = data.expense;
  const breakdown = [
    { id: 'food', amt: 4200, pct: 28 },
    { id: 'drink', amt: 1850, pct: 12 },
    { id: 'shop', amt: 3100, pct: 21 },
    { id: 'fun', amt: 2400, pct: 16 },
    { id: 'transport', amt: 1500, pct: 10 },
    { id: 'beauty', amt: 1200, pct: 8 },
    { id: 'other', amt: 750, pct: 5 },
  ];

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F5EBE4" strokeWidth={sw}/>
              {breakdown.map((b, i) => {
                const len = (b.pct / 100) * C;
                const dasharray = `${len} ${C - len}`;
                const dashoffset = -offset;
                offset += len;
                return (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={segColors[i]} strokeWidth={sw}
                    strokeDasharray={dasharray} strokeDashoffset={dashoffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    strokeLinecap="butt"/>
                );
              })}
              {/* center label */}
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#8C7670" fontFamily="Caveat, cursive" fontWeight="600">total</text>
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize="20" fill="#4A3A35" fontWeight="700" fontVariantNumeric="tabular-nums">${total.toLocaleString()}</text>
              <text x={cx} y={cy + 30} textAnchor="middle" fontSize="9" fill="#C4ADA5">NT$</text>
            </svg>
            <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                <span>日均</span><b style={{ color: 'var(--ink)' }}>${Math.round(total / 21)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #F5E5DC' }}>
                <span>vs 上月</span>
                <b style={{ color: '#3B8A5C' }}>−12%</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>最大筆</span>
                <b style={{ color: 'var(--ink)' }}>$890</b>
              </div>
              <div style={{
                marginTop: 8, background: 'var(--accent-faint)',
                borderRadius: 10, padding: '6px 8px',
                fontSize: 11, color: 'var(--accent)', fontWeight: 600,
              }}>
                <FoxMini size={20}/>
                <span style={{ marginLeft: 4, verticalAlign: 'middle' }}>比上月省了！</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* category breakdown */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>分類排行</div>
        <div style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {breakdown.slice(0, 6).map((b, i) => {
            const cat = CATEGORIES.find(c => c.id === b.id);
            return (
              <div key={i} style={{
                padding: '12px 16px',
                borderBottom: i === 5 ? 'none' : '1px dashed #F5E5DC',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <CatBubble id={b.id} size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                      {cat?.label || '其他'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                      ${b.amt.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ background: '#F5EBE4', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${b.pct * 2.5}%`, borderRadius: 3,
                      background: segColors[i],
                    }}/>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, width: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {b.pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* monthly trend */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>近 6 個月</div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {[
              { m: '12', v: 60 }, { m: '1', v: 78 }, { m: '2', v: 45 },
              { m: '3', v: 88 }, { m: '4', v: 70 }, { m: '5', v: 55 },
            ].map((b, i) => {
              const isThis = i === 5;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {isThis ? '$15k' : ''}
                  </span>
                  <div style={{
                    width: '100%', height: `${b.v}%`,
                    background: isThis ? 'var(--accent)' : 'var(--accent-soft)',
                    borderRadius: 8, position: 'relative',
                  }}>
                    {isThis && (
                      <div style={{
                        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                        width: 14, height: 14,
                      }}>
                        <FoxMini size={14}/>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: isThis ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: isThis ? 700 : 500 }}>
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
