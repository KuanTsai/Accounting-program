// Pot actions — withdraw (AutoPot → main) and deposit (main/pot → Goal)
// Both are bottom-sheet modals with similar pattern but different copy.

const { useState: useStatePot } = React;

// ── Shared bottom-sheet shell ────────────────────────────────────
function Sheet({ onClose, children, title, accent = 'var(--accent)' }) {
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
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>{title}</div>
          <div style={{ minWidth: 40 }}/>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Reusable amount input with slider + presets ─────────────────
function AmountInput({ amount, setAmount, max, accent, presets }) {
  const safeMax = Math.max(0, max);
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 16, padding: '14px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>NT$</span>
        <span style={{
          fontSize: 36, fontWeight: 700, color: accent,
          fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
        }}>{amount.toLocaleString()}</span>
      </div>
      <input
        type="range" min={0} max={safeMax || 1} step={100}
        value={amount} onChange={e => setAmount(Number(e.target.value))}
        style={{ width: '100%', accentColor: accent, marginTop: 8 }}
        disabled={safeMax === 0}
      />
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {presets.map(p => (
          <span key={p.label} className="tap" onClick={() => setAmount(p.value)} style={{
            flex: 1, textAlign: 'center',
            fontSize: 11, fontWeight: 600,
            padding: '6px 0', borderRadius: 999,
            background: amount === p.value ? accent : 'var(--bg)',
            color: amount === p.value ? '#fff' : 'var(--ink-soft)',
            transition: 'all 0.15s',
          }}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Withdraw from AutoPot back to main account ─────────────────
function WithdrawScreen({ pot, onClose, onConfirm }) {
  const cat = CATEGORIES.find(c => c.id === pot.catId) || { color: '#FF8FAB', bg: '#FFE5EC' };
  const max = pot.total;
  const [amount, setAmount] = useStatePot(Math.min(500, max));
  const [reason, setReason] = useStatePot('');
  const remaining = max - amount;

  const presets = [
    { label: '500', value: Math.min(500, max) },
    { label: '1000', value: Math.min(1000, max) },
    { label: '一半', value: Math.floor(max / 2) },
    { label: '全部', value: max },
  ];

  return (
    <Sheet title={`從${pot.label}提領`} onClose={onClose} accent={cat.color}>
      {/* pot summary */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <CatBubble id={pot.catId} size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>金庫餘額</div>
            <div style={{ fontSize: 20, color: 'var(--ink)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ${pot.total.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>提領後</div>
            <div style={{ fontSize: 15, color: cat.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              ${remaining.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* amount */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>提領金額</div>
        <AmountInput amount={amount} setAmount={setAmount} max={max} accent={cat.color} presets={presets}/>
      </div>

      {/* reason */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>提領原因（選填）</div>
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="例如：本月超支補貼…"
          maxLength={30}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--card)', borderRadius: 14, border: 'none', outline: 'none',
            padding: '12px 14px', fontSize: 14, color: 'var(--ink)',
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {['補貼超支', '臨時急用', '改撥到目標'].map(s => (
            <span key={s} className="tap" onClick={() => setReason(s)} style={{
              fontSize: 11, color: 'var(--ink-soft)',
              background: 'rgba(255,255,255,0.7)', border: '1px solid #F5E5DC',
              padding: '4px 10px', borderRadius: 999,
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* fox tip */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: cat.bg, borderRadius: 14, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <FoxMini size={26}/>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
            {amount === max
              ? '把整個金庫倒出來？確定喔！小桃會記住的。'
              : amount > max / 2
              ? '小桃幫你把錢轉回主帳戶 ✿'
              : '一點小額調度沒問題的 ♥'}
          </span>
        </div>
      </div>

      {/* confirm */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="tap" onClick={() => amount > 0 && onConfirm({ pot, amount, reason })} style={{
          background: amount > 0 ? cat.color : '#D5CCC4',
          borderRadius: 16, padding: '14px 0', textAlign: 'center',
          color: '#fff', fontSize: 15, fontWeight: 700,
          boxShadow: amount > 0 ? `0 6px 14px ${cat.color}44` : 'none',
        }}>
          確認提領 ${amount.toLocaleString()}
        </div>
      </div>
    </Sheet>
  );
}

// ── Deposit into goal pot (from main or other pot) ──────────────
function DepositScreen({ pot, sources, onClose, onConfirm }) {
  const [amount, setAmount] = useStatePot(1000);
  const [sourceId, setSourceId] = useStatePot('main');
  const source = sources.find(s => s.id === sourceId) || sources[0];
  const max = source.balance;
  const safeAmt = Math.min(amount, max);
  const newSaved = pot.saved + safeAmt;
  const newPct = pot.target > 0 ? Math.min(100, (newSaved / pot.target) * 100) : 0;
  const willComplete = newSaved >= pot.target;

  const presets = [
    { label: '500', value: 500 },
    { label: '1000', value: 1000 },
    { label: '3000', value: 3000 },
    { label: '剩餘', value: Math.max(0, pot.target - pot.saved) },
  ];

  return (
    <Sheet title={`撥款到${pot.label}`} onClose={onClose} accent={pot.color}>
      {/* goal summary with progress preview */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
          boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: pot.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CatIcon id={pot.icon} size={22} color={pot.color}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700 }}>{pot.label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                ${pot.saved.toLocaleString()} → <b style={{ color: pot.color }}>${newSaved.toLocaleString()}</b> / ${pot.target.toLocaleString()}
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: pot.bg, color: pot.color,
            }}>{Math.round(newPct)}%</div>
          </div>

          {/* progress preview (animated) */}
          <div style={{ marginTop: 10, background: '#F5EBE4', height: 10, borderRadius: 5, padding: 1, position: 'relative' }}>
            <div style={{
              height: '100%', width: `${(pot.saved / pot.target) * 100}%`,
              background: pot.color, opacity: 0.4, borderRadius: 4,
              position: 'absolute', top: 1, left: 1,
            }}/>
            <div style={{
              height: '100%', width: `${newPct}%`, borderRadius: 4,
              background: pot.color,
              transition: 'width 0.25s',
            }}/>
          </div>

          {willComplete && (
            <div style={{
              marginTop: 10, padding: '6px 10px', borderRadius: 10,
              background: 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)',
              color: '#A85F00', fontSize: 11, fontWeight: 700, textAlign: 'center',
            }}>🎉 撥款後就會達成目標！</div>
          )}
        </div>
      </div>

      {/* source picker */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>從哪裡撥</div>
        <div style={{
          background: 'var(--card)', borderRadius: 14, padding: 4,
          display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {sources.map((s, i) => {
            const sel = sourceId === s.id;
            return (
              <div key={s.id} className="tap" onClick={() => { setSourceId(s.id); if (amount > s.balance) setAmount(s.balance); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 10px', borderRadius: 10,
                  background: sel ? pot.bg : 'transparent',
                }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 8,
                  border: `2px solid ${sel ? pot.color : 'var(--ink-faint)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {sel && <span style={{ width: 7, height: 7, borderRadius: 4, background: pot.color }}/>}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: sel ? 700 : 500 }}>{s.label}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
                  ${s.balance.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* amount */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>撥款金額</div>
        <AmountInput amount={safeAmt} setAmount={setAmount} max={max} accent={pot.color} presets={presets.map(p => ({ ...p, value: Math.min(p.value, max) }))}/>
      </div>

      {/* fox tip */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: pot.bg, borderRadius: 14, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <FoxMini size={26}/>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 }}>
            {willComplete
              ? '哇～就要完成囉！小桃替你開心！'
              : newPct > 80
              ? '超過 80% 啦，目標就在前方 ✿'
              : '每一筆都是往目標靠近的一步 ♥'}
          </span>
        </div>
      </div>

      {/* confirm */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="tap" onClick={() => safeAmt > 0 && onConfirm({ pot, amount: safeAmt, source })} style={{
          background: safeAmt > 0 ? pot.color : '#D5CCC4',
          borderRadius: 16, padding: '14px 0', textAlign: 'center',
          color: '#fff', fontSize: 15, fontWeight: 700,
          boxShadow: safeAmt > 0 ? `0 6px 14px ${pot.color}44` : 'none',
        }}>
          確認撥款 ${safeAmt.toLocaleString()}
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { WithdrawScreen, DepositScreen });
