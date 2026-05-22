// All screen components for the diary accounting app
// Available globals: Fox, FoxMini, CATEGORIES, CatIcon, CatBubble, CuteButton, Tape, Sticker

const { useState, useEffect } = React;

// ─────────────────────────────────────────────────────────────
// Shared header — large title with hand-written feel + tape
// ─────────────────────────────────────────────────────────────
function ScreenHeader({ title, subtitle, right, decoration }) {
  return (
    <div style={{ padding: '16px 24px 12px', position: 'relative' }}>
      {decoration}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="hand" style={{ fontSize: 34, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '0.04em' }}>
            {title}
          </div>
          {subtitle &&
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, fontFamily: 'Caveat, cursive', fontWeight: 600 }}>
              {subtitle}
            </div>
          }
        </div>
        {right}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HOME screen — balance + fox + recent entries
// ─────────────────────────────────────────────────────────────
function HomeScreen({ data, onAdd, onOpenTx, foxMood, onOpenClose, onOpenFox, onDelete }) {
  const { balance, income, expense, recent, streak, level, foxName, foxFur = 'orange', foxAccessory = 'none' } = data;
  const monthLabel = `${new Date().getMonth() + 1}月`;

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="今天也很棒"
        subtitle="Today is a lovely day ✿"
        right={
        <div style={{ display: 'flex', gap: 8 }}>
            <div className="tap" style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.07 7.07l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.07-7.07l4.24-4.24" />
              </svg>
            </div>
            <div className="tap" style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <span style={{
              position: 'absolute', marginLeft: 14, marginTop: -14,
              width: 8, height: 8, borderRadius: 4, background: 'var(--accent)'
            }} />
            </div>
          </div>
        } />
      

      {/* month-end ceremony banner */}
      <div style={{ padding: '4px 20px 0' }}>
        <div className="tap" onClick={onOpenClose} style={{
          background: 'linear-gradient(135deg, #FFF1E8 0%, #FFE5D4 100%)',
          borderRadius: 18, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px dashed #FFCBA4',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="sparkle" style={{ position: 'absolute', top: 6, right: 80, fontSize: 9, color: '#FFB366' }}>✦</div>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#A85F00', fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>🌙</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
              5 月結算時間到了 ✿
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 1 }}>
              本月省下 $5,000，來看看要怎麼分配
            </div>
          </div>
          <span style={{ fontSize: 13, color: '#C5751F', fontWeight: 700 }}>結算 →</span>
        </div>
      </div>

      {/* fox mood card */}
      <div style={{ padding: '8px 20px 0', position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-faint) 0%, #FFF6FA 100%)',
          borderRadius: 28, padding: '20px 20px 18px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* decorative sparkles */}
          <div className="sparkle" style={{ position: 'absolute', top: 14, right: 22, fontSize: 12, color: 'var(--accent)' }}>✦</div>
          <div className="sparkle" style={{ position: 'absolute', top: 36, right: 52, fontSize: 8, color: 'var(--secondary)', animationDelay: '0.3s' }}>✦</div>
          <div className="sparkle" style={{ position: 'absolute', bottom: 20, left: 110, fontSize: 10, color: 'var(--lavender)', animationDelay: '0.8s' }}>★</div>

          <div className="tap" onClick={onOpenFox} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="wiggle" style={{ flexShrink: 0 }}>
              <Fox mood={foxMood} size={90} fur={foxFur} accessory={foxAccessory} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7DCBA8' }} />
                Lv.{level}　{foxName}
              </div>
              <div className="hand" style={{ fontSize: 19, color: 'var(--ink)', marginTop: 8, lineHeight: 1.3 }}>
                你做得好棒！<br />已經連續記帳 {streak} 天了 🌸
              </div>
            </div>
          </div>

          {/* exp bar */}
          <div style={{ marginTop: 14, background: '#fff', borderRadius: 999, height: 10, padding: 2, position: 'relative' }}>
            <div style={{
              height: '100%', width: '68%', borderRadius: 999,
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)'
            }} />
            <span style={{ position: 'absolute', right: 6, top: -16, fontSize: 10, color: 'var(--ink-soft)', fontFamily: 'Caveat', fontWeight: 600 }}>
              EXP 68 / 100
            </span>
          </div>
        </div>
      </div>

      {/* balance card */}
      <div style={{ padding: '16px 20px 0', position: 'relative' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 28,
          padding: 22, boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}>
          <Tape color="var(--accent-soft)" rotate={-6} style={{ top: -10, left: 28 }} />
          <Tape color="var(--secondary-soft)" rotate={10} style={{ top: -10, right: 30 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>
              {monthLabel}結餘
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-faint)' }}>
              <span className="hand-en">May 21</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>NT$</span>
            <span style={{ fontSize: 38, color: 'var(--ink)', fontWeight: 700, letterSpacing: -0.5 }}>
              {balance.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, background: '#E2F4E8', borderRadius: 18, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: '#5BA37D', fontWeight: 600, letterSpacing: '0.05em' }}>＋ 收入</div>
              <div style={{ fontSize: 18, color: '#3B8A5C', fontWeight: 700, marginTop: 2 }}>
                ${income.toLocaleString()}
              </div>
            </div>
            <div style={{ flex: 1, background: 'var(--accent-faint)', borderRadius: 18, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>− 支出</div>
              <div style={{ fontSize: 18, color: '#D86A8A', fontWeight: 700, marginTop: 2 }}>
                ${expense.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* quick actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>快速記帳</div>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Caveat', fontWeight: 600 }}>tap to add ♥</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {[
          { id: 'drink', label: '手搖飲', amt: 65 },
          { id: 'food', label: '便當', amt: 120 },
          { id: 'transport', label: '捷運', amt: 30 },
          { id: 'shop', label: '便利商店', amt: 45 },
          { id: 'fun', label: '電影', amt: 320 }].
          map((q, i) =>
          <div key={i} className="tap pop-in" onClick={onAdd} style={{
            flexShrink: 0, background: 'var(--card)', borderRadius: 18,
            padding: '10px 12px 12px', minWidth: 92,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #F5E8E0'
          }}>
              <CatBubble id={q.id} size={36} />
              <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>${q.amt}</div>
            </div>
          )}
        </div>
      </div>

      {/* today entries */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>今日記錄</div>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }} onClick={onOpenTx} className="tap">全部 →</span>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {recent.length === 0
            ? <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-faint)' }}>還沒有記錄，點 ＋ 開始記帳 ✿</div>
            : recent.slice(0, 5).map((tx, i, arr) =>
              <TxRow key={tx.id || i} tx={tx} isLast={i === arr.length - 1} onDelete={onDelete} />
            )
          }
        </div>
      </div>
    </div>);

}

function TxRow({ tx, isLast, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div onClick={() => setExpanded(e => !e)} style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        borderBottom: !expanded && isLast ? 'none' : '1px dashed #F5E5DC',
        cursor: 'pointer',
      }}>
        <CatBubble id={tx.cat} size={40} />
        <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{tx.label}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
            {tx.time}　·　{tx.note || '一般支出'}
          </div>
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700,
          color: tx.amt > 0 ? '#3B8A5C' : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {tx.amt > 0 ? '+' : '−'}${Math.abs(tx.amt)}
        </div>
      </div>
      {expanded && (
        <div style={{
          display: 'flex', gap: 8, padding: '0 16px 12px',
          borderBottom: isLast ? 'none' : '1px dashed #F5E5DC',
        }}>
          {onDelete && (
            <div className="tap" onClick={() => { onDelete(tx.id); setExpanded(false); }} style={{
              flex: 1, padding: '8px', borderRadius: 12,
              background: 'var(--accent-faint)', textAlign: 'center',
              fontSize: 13, color: 'var(--accent)', fontWeight: 600,
            }}>🗑 刪除這筆</div>
          )}
          <div className="tap" onClick={() => setExpanded(false)} style={{
            padding: '8px 16px', borderRadius: 12,
            background: '#f5f5f5', textAlign: 'center',
            fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600,
          }}>取消</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenHeader, HomeScreen, TxRow });