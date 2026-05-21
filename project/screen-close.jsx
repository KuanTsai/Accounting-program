// Monthly close ceremony — Fox guides the user through deciding what to do
// with each category's leftover. Each row defaults per the budget setting but
// can be redirected to any goal pot or rolled over.

const { useState: useStateClose } = React;

function MonthlyCloseScreen({ onClose, onConfirm }) {
  // ── mock 5月 budget result (only show categories with leftover ≥ 0) ──
  const items = [
  { catId: 'food', total: 6000, used: 4200, defaultVault: true, potLabel: '飲食金庫' },
  { catId: 'shop', total: 3500, used: 3100, defaultVault: true, potLabel: '購物金庫' },
  { catId: 'fun', total: 4000, used: 2400, defaultVault: true, potLabel: '玩樂金庫' },
  { catId: 'drink', total: 2000, used: 1850, defaultVault: true, potLabel: '飲料金庫' },
  { catId: 'transport', total: 1500, used: 750, defaultVault: false, potLabel: '交通金庫' },
  { catId: 'beauty', total: 1500, used: 1200, defaultVault: true, potLabel: '美妝金庫' }].
  map((it) => ({ ...it, leftover: it.total - it.used })).
  filter((it) => it.leftover > 0);

  const destinations = [
  { id: 'auto', label: '對應金庫', kind: 'auto' },
  { id: 'rollover', label: '合併到下月預算', kind: 'rollover' },
  { id: 'kyoto', label: '京都旅行 ✈', kind: 'goal' },
  { id: 'ipad', label: '換新 iPad 📱', kind: 'goal' },
  { id: 'emergency', label: '緊急金 🛟', kind: 'goal' }];


  // each row's chosen destination key
  const [picks, setPicks] = useStateClose(() =>
  Object.fromEntries(items.map((it) => [it.catId, it.defaultVault ? 'auto' : 'rollover']))
  );
  const [openPicker, setOpenPicker] = useStateClose(null);
  const [confirmed, setConfirmed] = useStateClose(false);

  const totalSaved = items.reduce((s, it) => {
    const pick = picks[it.catId];
    const dest = destinations.find((d) => d.id === pick);
    return s + (dest.kind !== 'rollover' ? it.leftover : 0);
  }, 0);
  const totalRollover = items.reduce((s, it) => {
    return s + (picks[it.catId] === 'rollover' ? it.leftover : 0);
  }, 0);

  // ── confirm overlay ──
  if (confirmed) {
    return <ConfirmOverlay totalSaved={totalSaved} totalRollover={totalRollover} onClose={onConfirm} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div className="tap" onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 12, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>5月結算</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* fox intro card */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-faint) 0%, #FFF6F0 50%, #FFF1E8 100%)',
            borderRadius: 26, padding: '18px 20px 16px',
            position: 'relative', overflow: 'hidden'
          }}>
            <Tape color="var(--accent-soft)" rotate={-5} style={{ top: -10, left: 40 }} />
            <div className="sparkle" style={{ position: 'absolute', top: 18, right: 26, fontSize: 14, color: 'var(--secondary)' }}>✦</div>
            <div className="sparkle" style={{ position: 'absolute', bottom: 24, right: 90, fontSize: 10, color: 'var(--lavender)', animationDelay: '0.5s' }}>★</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="wiggle"><Fox mood="celebrate" size={76} /></div>
              <div style={{ flex: 1 }}>
                <div className="hand" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.35 }}>
                  5 月過完啦！<br />來看看你存了多少 ✿
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 14, display: 'flex', gap: 10
            }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-soft)', fontWeight: 600 }}>本月結餘</div>
                <div style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ${items.reduce((s, it) => s + it.leftover, 0).toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#C5751F', fontWeight: 600 }}>進金庫</div>
                <div style={{ fontSize: 18, color: '#C5751F', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ${totalSaved.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* per-category breakdown */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>分類處理</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              點箭頭可以改去向 ▾
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it) => {
              const cat = CATEGORIES.find((c) => c.id === it.catId);
              const pick = picks[it.catId];
              const dest = destinations.find((d) => d.id === pick);
              const destLabel = pick === 'auto' ? it.potLabel : dest.label;
              const isRollover = pick === 'rollover';
              return (
                <div key={it.catId} style={{
                  background: 'var(--card)', borderRadius: 18, padding: '12px 14px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CatBubble id={it.catId} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{cat?.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 1 }}>
                        花 ${it.used.toLocaleString()} / 預算 ${it.total.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>結餘</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#3B8A5C', fontVariantNumeric: 'tabular-nums' }}>
                        +${it.leftover.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* destination picker */}
                  <div
                    className="tap"
                    onClick={() => setOpenPicker(openPicker === it.catId ? null : it.catId)}
                    style={{
                      marginTop: 10, padding: '8px 12px', borderRadius: 12,
                      background: isRollover ? 'var(--accent-faint)' : '#FFF1E8',
                      display: 'flex', alignItems: 'center', gap: 8,
                      border: `1px solid ${isRollover ? 'var(--accent-soft)' : '#FFD3B0'}`
                    }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11,
                      background: isRollover ?
                      'var(--accent)' :
                      'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 700
                    }}>{isRollover ? '↻' : '$'}</div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--ink-soft)' }}>去向：</span>
                      <b style={{ color: isRollover ? 'var(--accent)' : '#C5751F' }}>{destLabel}</b>
                    </div>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="var(--ink-soft)" strokeWidth="2"
                    style={{ transition: 'transform 0.15s', transform: openPicker === it.catId ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path d="M1 1l4 4 4-4" />
                    </svg>
                  </div>

                  {/* picker options */}
                  {openPicker === it.catId &&
                  <div style={{
                    marginTop: 6, background: 'var(--bg)', borderRadius: 12, padding: 4,
                    animation: 'pop-in 0.2s ease-out'
                  }}>
                      {destinations.map((d) => {
                      const label = d.id === 'auto' ? it.potLabel : d.label;
                      const isSelected = pick === d.id;
                      return (
                        <div
                          key={d.id}
                          className="tap"
                          onClick={() => {setPicks({ ...picks, [it.catId]: d.id });setOpenPicker(null);}}
                          style={{
                            padding: '8px 10px', borderRadius: 8,
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: isSelected ? 'var(--accent-faint)' : 'transparent',
                            color: isSelected ? 'var(--accent)' : 'var(--ink)',
                            fontSize: 12, fontWeight: isSelected ? 700 : 500
                          }}>
                            <span style={{
                            width: 14, height: 14, borderRadius: 7,
                            border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--ink-faint)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                              {isSelected && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />}
                            </span>
                            <span style={{ flex: 1 }}>{label}</span>
                            {d.id === 'auto' &&
                          <span style={{
                            fontSize: 9, color: 'var(--ink-faint)',
                            background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 999
                          }}>預設</span>
                          }
                          </div>);

                    })}
                    </div>
                  }
                </div>);

            })}
          </div>
        </div>

        {/* summary */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{
            background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="hand" style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>結算總覽</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #F5E5DC', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-soft)' }}>進入小金庫</span>
              <b style={{ color: '#C5751F', fontVariantNumeric: 'tabular-nums' }}>+${totalSaved.toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #F5E5DC', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-soft)' }}>合併至 6 月預算</span>
              <b style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>+${totalRollover.toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-soft)' }}>6 月可用預算</span>
              <b style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>${(20000 + totalRollover).toLocaleString()}</b>
            </div>
          </div>
        </div>
      </div>

      {/* sticky confirm button */}
      <div style={{
        position: 'absolute', bottom: 16, left: 20, right: 20,
        background: 'rgba(255,246,240,0.92)', borderRadius: 18, padding: 6,
        backdropFilter: 'blur(8px)'
      }}>
        <div className="tap" onClick={() => setConfirmed(true)} style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
          borderRadius: 14, padding: '14px 0',
          color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center',
          boxShadow: '0 6px 16px rgba(255,143,171,0.35)'
        }}>
          確認結算 · 入金庫 ${totalSaved.toLocaleString()} ✨
        </div>
      </div>
    </div>);

}

// ── Confirmation overlay (fox ceremony) ───────────────
function ConfirmOverlay({ totalSaved, totalRollover, onClose }) {
  // monthly summary facts — mix of streak, growth, goal progress, mood
  const facts = [
    { icon: '✓', color: '#7DCBA8', label: '連續記帳 28 / 31 天', sub: '只差一點就滿月了' },
    { icon: '↑', color: '#FF8FAB', label: '比 4 月省下 12%', sub: '多存 $2,100' },
    { icon: '✈', color: '#F590BB', label: '京都旅行 +6%', sub: '進度 60% · 剩 $12,000' },
    { icon: '◡', color: '#FFD66B', label: '最常出現「開心」', sub: '14 天都是好心情 ♥' },
  ];

  // rotating tagline based on totalSaved
  const tagline = totalSaved > 4000
    ? '比上個月還會存錢，超棒的 ✿'
    : totalSaved > 1000
    ? '小小的努力會變成大大的存款 ♥'
    : '有開始就是進步，下個月再加油！';

  return (
    <div style={{
      height: '100%', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* confetti dots */}
      {[
      { l: '12%', t: '6%', c: 'var(--accent)' },
      { l: '85%', t: '10%', c: 'var(--secondary)' },
      { l: '22%', t: '18%', c: 'var(--lavender)' },
      { l: '78%', t: '24%', c: 'var(--mint)' },
      { l: '8%', t: '32%', c: 'var(--sky)' },
      { l: '90%', t: '40%', c: 'var(--yellow)' }].
      map((d, i) =>
      <div key={i} className="sparkle" style={{
        position: 'absolute', left: d.l, top: d.t,
        width: 10, height: 10, borderRadius: 5,
        background: d.c, animationDelay: `${i * 0.1}s`
      }} />
      )}

      <div style={{
        flex: 1, width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 26, overflowY: 'auto'
      }}>
        <div className="wiggle">
          <Fox mood="celebrate" size={108} />
        </div>
        <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 10 }}>
          結算完成！
        </div>
        <div className="hand" style={{
          fontSize: 16, color: 'var(--accent)', marginTop: 4, textAlign: 'center',
          fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif", fontWeight: 400,
          letterSpacing: '0.04em',
        }}>
          {tagline}
        </div>

        {/* monthly summary card */}
        <div style={{
          marginTop: 18, padding: '14px 16px',
          background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow-card)',
          width: '100%', boxSizing: 'border-box', position: 'relative',
        }}>
          <Tape color="var(--accent-soft)" rotate={-4} style={{ top: -10, left: 30 }}/>
          <Tape color="var(--secondary-soft)" rotate={6} style={{ top: -10, right: 30 }}/>

          <div className="hand" style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 10 }}>
            5 月小結論 ✿
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {facts.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 0',
                borderBottom: i < facts.length - 1 ? '1px dashed #F5E5DC' : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: `${f.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>{f.icon}</div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* totals card */}
        <div style={{
          marginTop: 14, padding: '14px 18px',
          background: 'linear-gradient(135deg, #FFF1E8 0%, var(--accent-faint) 100%)',
          borderRadius: 20,
          width: '100%', boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>進入小金庫</span>
            <b style={{ fontSize: 22, color: '#C5751F', fontVariantNumeric: 'tabular-nums' }}>
              +${totalSaved.toLocaleString()}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderTop: '1px dashed rgba(74,58,53,0.12)', marginTop: 4, paddingTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>合併到 6 月</span>
            <b style={{ fontSize: 16, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              +${totalRollover.toLocaleString()}
            </b>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
          🦊　＋50 EXP　·　達成成就「準時結算」
        </div>
      </div>

      <div style={{ width: '100%', padding: '12px 0 20px' }}>
        <div className="tap" onClick={onClose} style={{
          background: 'var(--accent)', borderRadius: 16,
          padding: '14px 0', textAlign: 'center',
          color: '#fff', fontSize: 15, fontWeight: 700,
          boxShadow: '0 6px 16px rgba(255,143,171,0.35)'
        }}>
          收下，6 月加油！
        </div>
      </div>
    </div>);

}

Object.assign(window, { MonthlyCloseScreen });