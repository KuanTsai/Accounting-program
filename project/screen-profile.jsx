// Profile / Me screen

const PALETTE_LABELS = { sakura: '櫻花', mint: '薄荷', lavender: '薰衣草', peach: '蜜桃', navy: '夜空' };

function ProfileScreen({ onOpenBudget, onOpenVault, onOpenCategories, onOpenFox, onOpenPalette, onOpenSettings, palette = 'sakura', foxState = {}, transactions = [], budgetItems = [], goalPots = [], autoPots = [], liveData = {} }) {
  const now = new Date();

  // ── budget stats ──────────────────────────────────────
  const enabledItems = budgetItems.filter(b => b.on);
  const budgetTotal = enabledItems.reduce((s, b) => s + b.total, 0);
  const catUsed = {};
  transactions.forEach(tx => {
    if (!tx.createdAt || tx.amt >= 0) return;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      catUsed[tx.cat] = (catUsed[tx.cat] || 0) + Math.abs(tx.amt);
    }
  });
  const totalUsed = liveData.expense || 0;
  const budgetPct = budgetTotal > 0 ? (totalUsed / budgetTotal) * 100 : 0;
  const remaining = Math.max(0, budgetTotal - totalUsed);
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const dailyLeft = daysLeft > 0 && remaining > 0 ? Math.round(remaining / daysLeft) : 0;
  const topBudgets = enabledItems.slice(0, 4).map(b => ({ ...b, used: catUsed[b.id] || 0 }));

  // ── vault totals ──────────────────────────────────────
  const vaultTotal = autoPots.reduce((s, p) => s + (p.total || 0), 0)
                   + goalPots.reduce((s, p) => s + (p.saved || 0), 0);
  const vaultCount = autoPots.length + goalPots.length;

  // ── streak / days recording ───────────────────────────
  const streak = liveData.streak || 0;
  const oldestTx = transactions.length > 0 ? transactions[transactions.length - 1] : null;
  const daysRecording = oldestTx && oldestTx.createdAt
    ? Math.max(1, Math.round((now - (oldestTx.createdAt.toDate ? oldestTx.createdAt.toDate() : new Date(oldestTx.createdAt))) / 86400000))
    : 1;

  // ── badges ────────────────────────────────────────────
  const hasDiary = transactions.some(tx => tx.diary);
  const badges = [
    { char: '7',  label: '連續一週', color: '#FFD66B', got: streak >= 7 },
    { char: '30', label: '連續一月', color: '#FFB97A', got: streak >= 30 },
    { char: '$',  label: '存錢開始', color: '#A8D8F0', got: vaultTotal > 0 },
    { char: '✿',  label: '日記達人', color: '#C9B8F0', got: hasDiary },
    { char: '?',  label: '神秘成就', color: '#E0E0E0', got: false },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="我的"
        subtitle="Hello, sweet pea ♥"
        right={
          <div className="tap" onClick={onOpenSettings} style={{
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
            <div className="tap" onClick={onOpenFox} style={{
              width: 72, height: 72, borderRadius: 36,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              <Fox mood="happy" size={66} fur={foxState.fur} accessory={foxState.accessory}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{foxState.name || '小桃'} ✿</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                記帳第 {daysRecording} 天 · 連續 {streak} 天
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span className="cat-chip" style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--accent)' }}>
                  <span style={{ fontSize: 9 }}>♥</span> Lv.{foxState.level || 1}
                </span>
                <span className="cat-chip" style={{ background: 'rgba(255,255,255,0.7)', color: '#7DCBA8' }}>
                  ✦ {streak >= 30 ? '記帳達人' : streak >= 7 ? '省錢小高手' : '新手上路'}
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
            position: 'relative', boxShadow: '0 4px 10px rgba(255,143,171,0.18)',
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
                {vaultTotal.toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, fontWeight: 600 }}>
              {vaultCount > 0 ? `${autoPots.length} 個預算金庫 · ${goalPots.length} 個存錢目標 →` : '點此建立第一個存錢目標 →'}
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

        {budgetTotal === 0 ? (
          <div className="tap" onClick={onOpenBudget} style={{
            background: 'var(--card)', borderRadius: 24, padding: '24px 18px',
            boxShadow: 'var(--shadow-sm)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>還沒設定預算</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 6 }}>點此設定 →</div>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>總預算進度</span>
                <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
                  <b style={{ color: budgetPct > 100 ? '#D86A8A' : 'var(--accent)' }}>${totalUsed.toLocaleString()}</b> / ${budgetTotal.toLocaleString()}
                </span>
              </div>
              <div style={{ background: '#F5EBE4', height: 14, borderRadius: 7, padding: 2, position: 'relative' }}>
                <div style={{
                  width: `${Math.min(budgetPct, 100)}%`, height: '100%', borderRadius: 5,
                  background: budgetPct > 100
                    ? 'linear-gradient(90deg, #FFB97A 0%, #F08A8A 100%)'
                    : 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)',
                  position: 'relative', transition: 'width 0.3s',
                }}>
                  <div style={{ position: 'absolute', right: -10, top: -8, width: 26, height: 26 }}>
                    <FoxMini size={26}/>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, textAlign: 'right', fontWeight: 500 }}>
                {budgetPct > 100
                  ? <span style={{ color: '#D86A8A' }}>超支 ${(totalUsed - budgetTotal).toLocaleString()} ！</span>
                  : <>還剩 <b style={{ color: 'var(--ink)' }}>${remaining.toLocaleString()}</b> · {daysLeft} 天 · 每天約可花 <b style={{ color: 'var(--ink)' }}>${dailyLeft.toLocaleString()}</b></>
                }
              </div>
            </div>

            {topBudgets.map((b, i) => {
              const cat = CATEGORIES.find(c => c.id === b.id);
              if (!cat) return null;
              const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
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
                      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{cat.label}</span>
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
        )}
      </div>

      {/* achievements */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>成就徽章</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: '16px 14px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {badges.map((b, i) => (
              <div key={i} style={{ textAlign: 'center', opacity: b.got ? 1 : 0.35 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24,
                  background: b.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: b.char.length > 1 ? 13 : 18, fontWeight: 700,
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
            { id: 'theme',   label: '主題色',       value: PALETTE_LABELS[palette] || '櫻花',  color: '#EEE8FF', icon: 'beauty', onClick: onOpenPalette },
            { id: 'cat',     label: '分類管理',     value: '管理分類',                         color: '#FFE5EC', icon: 'shop',   onClick: onOpenCategories },
            { id: 'budget',  label: '預算管理',     value: budgetTotal > 0 ? `信封 $${budgetTotal.toLocaleString()}` : '未設定', color: '#E2F4E8', icon: 'salary', onClick: onOpenBudget },
            { id: 'vault',   label: '我的金庫',     value: `NT$${vaultTotal.toLocaleString()}`, color: '#FFF4D1', icon: 'travel', onClick: onOpenVault },
            { id: 'fox',     label: '狐狸狀態',     value: `Lv.${foxState.level || 1} · ${foxState.name || '小桃'}`, color: '#FFE0EE', icon: 'beauty', onClick: onOpenFox },
          ].map((s, i, arr) => (
            <div key={s.id} className="tap" onClick={s.onClick} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : '1px dashed #F5E5DC',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <CatIcon id={s.icon} size={18} color={(CATEGORIES.find(c => c.id === s.icon) || {}).color || '#888'}/>
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
