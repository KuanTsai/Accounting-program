// Profile / Me — budget, categories, achievements, settings

function ProfileScreen({ onOpenBudget, onOpenVault, onOpenCategories, onOpenFox, foxState = {} }) {
  const budgets = [
    { id: 'food', used: 4200, total: 6000 },
    { id: 'shop', used: 3100, total: 3500 },
    { id: 'fun', used: 2400, total: 4000 },
    { id: 'drink', used: 1850, total: 2000 },
  ];

  const badges = [
    { char: '7', label: '連續週', color: '#FFD66B', got: true },
    { char: '◇', label: '初次破萬', color: '#A8D8F0', got: true },
    { char: '★', label: '存款達人', color: '#FF8FAB', got: true },
    { char: '✿', label: '日記達人', color: '#C9B8F0', got: true },
    { char: '?', label: '神秘成就', color: '#E0E0E0', got: false },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="我的"
        subtitle="Hello, sweet pea ♥"
        right={
          <div className="tap" style={{
            width: 38, height: 38, borderRadius: 12, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
        }
      />

      {/* profile card */}
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFE5EC 0%, #FFF6F0 60%, #F0E8FF 100%)',
          borderRadius: 28, padding: '20px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              <Fox mood="happy" size={66} fur={foxState.fur} accessory={foxState.accessory}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{foxState.name || '小桃'} ✿</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>記帳第 247 天 · 連續 12 天</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span className="cat-chip" style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--accent)' }}>
                  <span style={{ fontSize: 9 }}>♥</span> Lv.8
                </span>
                <span className="cat-chip" style={{ background: 'rgba(255,255,255,0.7)', color: '#7DCBA8' }}>
                  ✦ 省錢小高手
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* vault entry */}
      <div style={{ padding: '16px 20px 0' }}>
        <div className="tap" onClick={onOpenVault} style={{
          background: 'linear-gradient(135deg, #FFF1E8 0%, var(--accent-faint) 60%, #F0E8FF 100%)',
          borderRadius: 22, padding: '16px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden',
        }}>
          <div className="sparkle" style={{ position: 'absolute', top: 12, right: 18, fontSize: 12, color: 'var(--secondary)' }}>✦</div>
          <div className="sparkle" style={{ position: 'absolute', bottom: 14, right: 60, fontSize: 8, color: 'var(--lavender)', animationDelay: '0.4s' }}>★</div>

          <div style={{
            width: 52, height: 52, borderRadius: 26,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 4px 10px rgba(255,143,171,0.18)',
          }}>
            <FoxMini size={40}/>
            <div style={{
              position: 'absolute', bottom: -3, right: -3,
              width: 20, height: 20, borderRadius: 10,
              background: 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#A85F00',
              border: '2px solid #fff',
            }}>$</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>我的金庫 · 累積省下</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>NT$</span>
              <span style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>
                83,100
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, fontWeight: 600 }}>
              4 個預算金庫 · 3 個存錢目標 →
            </div>
          </div>
        </div>
      </div>

      {/* budget */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>本月預算</div>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }} className="tap" onClick={onOpenBudget}>編輯 →</span>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          {/* total */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>總預算進度</span>
              <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
                <b style={{ color: 'var(--accent)' }}>$14,800</b> / $20,000
              </span>
            </div>
            <div style={{ background: '#F5EBE4', height: 14, borderRadius: 7, padding: 2, position: 'relative' }}>
              <div style={{
                width: '74%', height: '100%', borderRadius: 5,
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', right: -10, top: -8,
                  width: 26, height: 26,
                }}>
                  <FoxMini size={26}/>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, textAlign: 'right', fontWeight: 500 }}>
              還剩 <b style={{ color: 'var(--ink)' }}>$5,200</b> · 10 天 · 每天約可花 <b style={{ color: 'var(--ink)' }}>$520</b>
            </div>
          </div>

          {budgets.map((b, i) => {
            const cat = CATEGORIES.find(c => c.id === b.id);
            const pct = (b.used / b.total) * 100;
            const over = pct > 100;
            const warn = pct > 85;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0', borderTop: '1px dashed #F5E5DC',
              }}>
                <CatBubble id={b.id} size={32}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{cat?.label}</span>
                    <span style={{ fontSize: 12, color: over ? '#D86A8A' : 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
                      ${b.used.toLocaleString()} / ${b.total.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ background: '#F5EBE4', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min(pct, 100)}%`,
                      background: over ? '#D86A8A' : warn ? 'var(--secondary)' : cat.color,
                      borderRadius: 3,
                    }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* achievements */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>成就徽章</div>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }} className="tap">查看全部</span>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: '16px 14px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {badges.map((b, i) => (
              <div key={i} style={{ textAlign: 'center', opacity: b.got ? 1 : 0.4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  background: b.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 700,
                  boxShadow: b.got ? `0 4px 0 ${b.color}88` : 'none',
                }}>{b.char}</div>
                <div style={{ fontSize: 10, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* settings list */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 10 }}>偏好設定</div>
        <div style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {[
            { id: 'cat', label: '分類管理', value: '12 個分類', color: '#FFE5EC', icon: 'shop', onClick: onOpenCategories },
            { id: 'budget', label: '預算提醒', value: '開啟', color: '#E2F4E8', icon: 'salary', onClick: onOpenBudget },
            { id: 'reminder', label: '每日記帳提醒', value: '20:00', color: '#FFF4D1', icon: 'study' },
            { id: 'sync', label: '雲端備份', value: '今天 14:32', color: '#E0F2FA', icon: 'travel' },
            { id: 'fox', label: '狐狸狀態', value: `Lv.${foxState.level || 8} · ${foxState.name || '小桃'}`, color: '#FFE0EE', icon: 'beauty', onClick: onOpenFox, last: true },
          ].map((s, i, arr) => (
            <div key={s.id} className="tap" onClick={s.onClick} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : '1px dashed #F5E5DC',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <CatIcon id={s.icon} size={18} color={(CATEGORIES.find(c=>c.id===s.icon)||{}).color || '#888'}/>
              </div>
              <span style={{ flex: 1, fontSize: 15, color: 'var(--ink)' }}>{s.label}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)', marginRight: 6 }}>{s.value}</span>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="var(--ink-faint)" strokeWidth="1.5">
                <path d="M1 1l3 4-3 4"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
