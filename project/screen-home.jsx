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
function HomeScreen({ data, onAdd, onOpenTx, foxMood, onOpenClose, onOpenFox, onDelete, onOpenPalette, onOpenSettings, showCloseBanner = true, envelopes = [] }) {
  const isNearMonthEnd = (() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return lastDay - d.getDate() < 5;
  })();
  const { balance, income, expense, recent, streak, level, foxExp = 0, foxName, foxFur = 'orange', foxAccessory = 'none' } = data;
  const _now = new Date();
  const monthLabel = `${_now.getMonth() + 1}月`;
  const todayLabel = `${_now.getMonth() + 1}/${_now.getDate()}`;

  // envelope budget stats
  const budgetTotal = envelopes.reduce((s, e) => s + (e.total || 0), 0);
  const budgetRemaining = Math.max(0, budgetTotal - expense);
  const budgetPct = budgetTotal > 0 ? Math.min((expense / budgetTotal) * 100, 100) : 0;
  const budgetOver = budgetTotal > 0 && expense > budgetTotal;
  const daysLeft = (() => {
    const last = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate();
    return Math.max(1, last - _now.getDate());
  })();
  const dailyLeft = budgetRemaining > 0 ? Math.round(budgetRemaining / daysLeft) : 0;
  const useEnvelopeMode = budgetTotal > 0;

  return (
    <div style={{ paddingBottom: 100 }}>
      <ScreenHeader
        title="今天也很棒"
        subtitle="Today is a lovely day ✿"
        right={null} />
      

      {/* month-end ceremony banner */}
      {showCloseBanner && isNearMonthEnd && (
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
                {monthLabel}結算時間到了 ✿
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 1 }}>
                幫你把省下的錢存進小金庫
              </div>
            </div>
            <span style={{ fontSize: 13, color: '#C5751F', fontWeight: 700 }}>結算 →</span>
          </div>
        </div>
      )}

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
              height: '100%', width: `${foxExp}%`, borderRadius: 999,
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)'
            }} />
            <span style={{ position: 'absolute', right: 6, top: -16, fontSize: 10, color: 'var(--ink-soft)', fontFamily: 'Caveat', fontWeight: 600 }}>
              EXP {foxExp} / 100
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
              {useEnvelopeMode ? `${monthLabel}預算剩餘` : `${monthLabel}結餘`}
            </div>
            <span className="hand-en" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{todayLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>NT$</span>
            <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5, color: budgetOver ? '#D86A8A' : 'var(--ink)' }}>
              {useEnvelopeMode ? budgetRemaining.toLocaleString() : balance.toLocaleString()}
            </span>
          </div>

          {useEnvelopeMode ? (
            <>
              {/* progress bar */}
              <div style={{ marginTop: 14, background: '#F5EBE4', borderRadius: 999, height: 10, padding: 2 }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${budgetPct}%`,
                  background: budgetOver
                    ? 'linear-gradient(90deg, #FFB97A 0%, #F08A8A 100%)'
                    : 'linear-gradient(90deg, var(--accent) 0%, var(--secondary) 100%)',
                  transition: 'width 0.4s',
                }} />
              </div>
              <div style={{ fontSize: 10, color: budgetOver ? '#D86A8A' : 'var(--ink-soft)', marginTop: 6, textAlign: 'right', fontWeight: 500 }}>
                {budgetOver
                  ? `超支 $${(expense - budgetTotal).toLocaleString()} ！`
                  : `已花 $${expense.toLocaleString()} ／ $${budgetTotal.toLocaleString()}`
                }
              </div>
              {/* daily budget */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <div style={{ flex: 1, background: budgetOver ? '#FFE0E0' : '#E2F4E8', borderRadius: 18, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: budgetOver ? '#D86A8A' : '#5BA37D', fontWeight: 600, letterSpacing: '0.05em' }}>每天可花</div>
                  <div style={{ fontSize: 18, color: budgetOver ? '#D86A8A' : '#3B8A5C', fontWeight: 700, marginTop: 2 }}>
                    ${budgetOver ? 0 : dailyLeft.toLocaleString()}
                  </div>
                </div>
                <div style={{ flex: 1, background: 'var(--accent-faint)', borderRadius: 18, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>剩 {daysLeft} 天</div>
                  <div style={{ fontSize: 18, color: '#D86A8A', fontWeight: 700, marginTop: 2 }}>
                    ${expense.toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          ) : (
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
          )}
        </div>
      </div>

      {/* quick actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>快速記帳</div>
          <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'Caveat', fontWeight: 600 }}>tap to add ♥</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {(() => {
            const favCats = CATEGORIES.filter(c => c.fav);
            const quickItems = favCats.length > 0
              ? favCats.slice(0, 6).map(c => ({ id: c.id, envLabel: '' }))
              : envelopes.length > 0
                ? envelopes.flatMap(env => env.cats.map(catId => ({ id: catId, envLabel: env.label }))).slice(0, 6)
                : [{ id: 'food' }, { id: 'drink' }, { id: 'transport' }, { id: 'shop' }, { id: 'fun' }];
            return quickItems.map((q, i) => {
              const cat = CATEGORIES.find(c => c.id === q.id) || { label: q.id };
              return (
                <div key={i} className="tap pop-in" onClick={() => onAdd({ cat: q.id, type: 'expense' })} style={{
                  flexShrink: 0, background: 'var(--card)', borderRadius: 18,
                  padding: '10px 12px 12px', minWidth: 92,
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #F5E8E0'
                }}>
                  <CatBubble id={q.id} size={36} />
                  <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>{cat.label}</div>
                  {q.envLabel && (
                    <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 1 }}>{q.envLabel}</div>
                  )}
                </div>
              );
            });
          })()}
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