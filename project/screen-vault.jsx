// Vault / Savings pots screen — auto pots (from budget) + goal pots

const { useState: useStateVault } = React;

function VaultScreen({ onClose, onAddGoal, onWithdraw, onDeposit, onEditGoal, onOpenClose, goalPots = [], autoPots = [], foxFur = 'orange', foxAccessory = 'none' }) {
  const [tab, setTab] = useStateVault('all'); // all | auto | goal

  const totalAuto = autoPots.reduce((s, p) => s + (p.total || 0), 0);
  const totalGoal = goalPots.reduce((s, p) => s + (p.saved || 0), 0);
  const totalAll = totalAuto + totalGoal;
  const thisMonth = autoPots.reduce((s, p) => s + (p.monthly || 0), 0);

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
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)' }}>我的金庫</div>
        <div className="tap" onClick={onAddGoal} style={{
          width: 36, height: 36, borderRadius: 12, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {/* hero — total savings */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFF1E8 0%, var(--accent-faint) 50%, #F0E8FF 100%)',
            borderRadius: 30, padding: '22px 22px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <Tape color="var(--accent-soft)" rotate={-6} style={{ top: -10, left: 30 }}/>
            <Tape color="var(--secondary-soft)" rotate={8} style={{ top: -10, right: 32 }}/>

            {/* sparkles */}
            <div className="sparkle" style={{ position: 'absolute', top: 20, right: 30, fontSize: 14, color: 'var(--secondary)' }}>✦</div>
            <div className="sparkle" style={{ position: 'absolute', bottom: 30, right: 78, fontSize: 10, color: 'var(--lavender)', animationDelay: '0.6s' }}>★</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 40,
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(255,143,171,0.2)',
                position: 'relative',
              }}>
                {/* fox holding coin */}
                <Fox mood="excited" size={66} fur={foxFur} accessory={foxAccessory}/>
                <div style={{
                  position: 'absolute', bottom: -4, right: -6,
                  width: 28, height: 28, borderRadius: 14,
                  background: 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#A85F00',
                  boxShadow: '0 3px 6px rgba(168,95,0,0.25)',
                  border: '2px solid #fff',
                }}>$</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500 }}>累積省下</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>NT$</span>
                  <span style={{ fontSize: 32, color: 'var(--ink)', fontWeight: 700, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
                    {totalAll.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.7)', padding: '2px 10px', borderRadius: 999,
                  fontSize: 11, color: '#3B8A5C', fontWeight: 600,
                }}>
                  +${thisMonth.toLocaleString()} 本月入帳
                </div>
              </div>
            </div>

            <div className="hand" style={{
              marginTop: 14, padding: '8px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.7)',
              fontSize: 15, color: 'var(--ink)', textAlign: 'center',
              fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif",
            }}>
              一個月省下一杯小確幸的錢，小桃替你開心 🦊
            </div>
          </div>
        </div>

        {/* tabs + test button */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', background: '#fff', borderRadius: 999,
            padding: 4, boxShadow: 'var(--shadow-sm)',
          }}>
            {[
              { id: 'all', label: '全部', count: autoPots.length + goalPots.length },
              { id: 'auto', label: '預算金庫', count: autoPots.length },
              { id: 'goal', label: '存錢目標', count: goalPots.length },
            ].map(t => (
              <div key={t.id} onClick={() => setTab(t.id)} className="tap" style={{
                padding: '6px 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 600,
                background: tab === t.id ? 'var(--accent)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--ink-soft)',
                transition: 'all 0.15s',
              }}>{t.label} <span style={{ opacity: 0.7, fontSize: 11 }}>({t.count})</span></div>
            ))}
          </div>
          {onOpenClose && (
            <div className="tap" onClick={onOpenClose} style={{
              padding: '6px 14px', borderRadius: 999,
              background: '#FFF4D1', color: '#A0700A',
              fontSize: 12, fontWeight: 700,
              border: '1.5px dashed #FFD66B',
            }}>🧪 立即結算</div>
          )}
        </div>

        {/* auto pots */}
        {(tab === 'all' || tab === 'auto') && (
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>預算金庫</div>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                {autoPots.length} 個 · 共 ${totalAuto.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {autoPots.map(p => <AutoPotCard key={p.id} pot={p} onWithdraw={() => onWithdraw && onWithdraw(p)}/>)}
            </div>
          </div>
        )}

        {/* goal pots */}
        {(tab === 'all' || tab === 'goal') && (
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>存錢目標</div>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                {goalPots.length} 個目標
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {goalPots.map(p => <GoalPotCard key={p.id} pot={p} onDeposit={() => onDeposit && onDeposit(p)} onEdit={() => onEditGoal && onEditGoal(p)}/>)}
              <div className="tap dashed-border" onClick={onAddGoal} style={{
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
                  新增存錢目標
                </span>
              </div>
            </div>
          </div>
        )}

        {/* info card */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: 18, marginTop: -2 }}>💡</span>
            <div style={{ flex: 1, fontSize: 12, color: 'var(--ink)', lineHeight: 1.55 }}>
              <b>預算金庫</b>會在每月結算時自動把該分類沒花完的錢存進來。<br/>
              <b>存錢目標</b>需要你主動撥款，可以從其他金庫轉入或一次性存入。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoPotCard({ pot, onWithdraw }) {
  const color = pot.color || '#FFB97A';
  const bg = pot.bg || '#FFE9D6';
  const emoji = pot.emoji || '💰';
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13, background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>{emoji}</div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 18, height: 18, borderRadius: 9,
            background: '#FFE08A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#A85F00',
            border: '2px solid var(--card)',
          }}>$</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{pot.label}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
            本月 +${(pot.monthly || 0).toLocaleString()} · 累積 {(pot.history || []).length} 個月
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
            ${pot.total.toLocaleString()}
          </div>
          <span className="tap" onClick={onWithdraw} style={{
            display: 'inline-block', marginTop: 2,
            fontSize: 11, color: 'var(--accent)', fontWeight: 600,
          }}>提領 ↓</span>
        </div>
      </div>
      {/* mini history bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 10, height: 22 }}>
        {(pot.history || []).slice().reverse().map((h, i) => {
          const max = Math.max(...(pot.history || []).map(x => x[1]), 1);
          const h2 = Math.max(4, (h[1] / max) * 22);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: h2, background: color, opacity: 0.4, borderRadius: 3 }}/>
              <span style={{ fontSize: 8, color: 'var(--ink-faint)' }}>{h[0]}</span>
            </div>
          );
        })}
        <div style={{ flex: 4 }}/>
      </div>
    </div>
  );
}

function GoalPotCard({ pot, onDeposit, onEdit }) {
  const pct = (pot.saved / pot.target) * 100;
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 22, padding: '16px 18px',
      boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden',
    }}>
      {/* bg accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: 40,
        background: pot.bg, opacity: 0.5,
      }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: pot.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CatIcon id={pot.icon} size={24} color={pot.color}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 700 }}>{pot.label}</div>
          {pot.deadline && (
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
              目標：{pot.deadline}前完成
            </div>
          )}
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 999,
          background: pct >= 100 ? '#E2F4E8' : pot.bg,
          color: pct >= 100 ? '#3B8A5C' : pot.color,
          fontSize: 12, fontWeight: 700,
        }}>
          {Math.round(pct)}%
        </div>
      </div>

      {/* progress */}
      <div style={{ marginTop: 12, position: 'relative' }}>
        <div style={{ background: '#F5EBE4', height: 12, borderRadius: 6, padding: 2 }}>
          <div style={{
            height: '100%', width: `${Math.min(pct, 100)}%`, borderRadius: 4,
            background: `linear-gradient(90deg, ${pot.color} 0%, ${pot.color}cc 100%)`,
            transition: 'width 0.3s',
          }}/>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          <b style={{ color: pot.color }}>${pot.saved.toLocaleString()}</b>
          <span style={{ color: 'var(--ink-faint)' }}> / ${pot.target.toLocaleString()}</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
          還差 ${(pot.target - pot.saved).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div className="tap" onClick={onDeposit} style={{
          flex: 1, padding: '8px 0', borderRadius: 12,
          background: pot.color, color: '#fff',
          fontSize: 12, fontWeight: 600, textAlign: 'center',
        }}>＋ 撥款</div>
        <div className="tap" onClick={onEdit} style={{
          flex: 1, padding: '8px 0', borderRadius: 12,
          background: pot.bg, color: pot.color,
          fontSize: 12, fontWeight: 600, textAlign: 'center',
        }}>編輯目標</div>
      </div>
    </div>
  );
}

Object.assign(window, { VaultScreen, AutoPotCard, GoalPotCard });
