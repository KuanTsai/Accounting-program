// Financial advisor — fox interviews user and suggests budget allocation

const { useState: useStateAdv } = React;

function FoxBubble({ children, fur, accessory }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ flexShrink: 0 }}><Fox mood="happy" size={48} fur={fur} accessory={accessory}/></div>
      <div style={{
        background: 'var(--card)', borderRadius: 18, borderBottomLeftRadius: 4,
        padding: '13px 16px', flex: 1,
        fontSize: 14, color: 'var(--ink)', lineHeight: 1.65,
        boxShadow: 'var(--shadow-sm)',
      }}>{children}</div>
    </div>
  );
}

function FinancialAdvisorScreen({ onClose, onApply, foxFur = 'orange', foxAccessory = 'none', foxName = '小桃' }) {
  const [step, setStep] = useStateAdv(0);
  const [income, setIncome] = useStateAdv('');
  const [fixedList, setFixedList] = useStateAdv([
    { id: 'rent',      label: '房租／房貸',    val: '' },
    { id: 'transport', label: '交通（月票等）', val: '' },
    { id: 'telecom',   label: '電信費',         val: '' },
    { id: 'insurance', label: '保險費',         val: '' },
    { id: 'loan',      label: '貸款',           val: '' },
    { id: 'sub',       label: '訂閱服務',       val: '' },
    { id: 'other',     label: '其他固定支出',   val: '' },
  ]);
  const [situation, setSituation] = useStateAdv(null);
  const [goals, setGoals] = useStateAdv([]);
  const [suggested, setSuggested] = useStateAdv(null);
  const [activeIds, setActiveIds] = useStateAdv(null);

  const incomeNum = parseInt(income) || 0;
  const fixedTotal = fixedList.reduce((s, i) => s + (parseInt(i.val) || 0), 0);
  const disposable = Math.max(0, incomeNum - fixedTotal);

  const SITUATIONS = [
    { id: 'none',     label: '存款不多，沒有緊急備用金',  emoji: '😅' },
    { id: 'little',   label: '有一點存款，但還不夠穩',    emoji: '🌱' },
    { id: 'stable',   label: '有 3～6 個月緊急備用金',    emoji: '🌿' },
    { id: 'invested', label: '已有穩定投資或儲蓄計畫',    emoji: '🌳' },
  ];

  const GOALS = [
    { id: 'emergency',   label: '建立緊急備用金', emoji: '🛡️' },
    { id: 'bigpurchase', label: '存錢買大件物品', emoji: '🏠' },
    { id: 'travel',      label: '旅遊基金',       emoji: '✈️' },
    { id: 'invest',      label: '開始投資理財',   emoji: '📈' },
    { id: 'debt',        label: '還清負債',       emoji: '💪' },
    { id: 'enjoy',       label: '提升生活品質',   emoji: '✨' },
  ];

  const toggleGoal = (id) =>
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const updateFixed = (id, val) =>
    setFixedList(prev => prev.map(i => i.id === id ? { ...i, val } : i));

  const round500 = (n) => Math.max(0, Math.round(n / 500) * 500);

  const runAnalysis = () => {
    const d = disposable;

    // Savings rate based on situation + goals
    let savingsRate = 0.20;
    if (situation === 'none')     savingsRate = 0.30;
    if (situation === 'little')   savingsRate = 0.25;
    if (situation === 'stable')   savingsRate = 0.20;
    if (situation === 'invested') savingsRate = 0.15;

    if (goals.includes('emergency') && (situation === 'none' || situation === 'little'))
      savingsRate = Math.max(savingsRate, 0.35);
    if (goals.includes('debt'))        savingsRate = Math.max(savingsRate, 0.30);
    if (goals.includes('bigpurchase')) savingsRate = Math.max(savingsRate, 0.25);
    if (goals.includes('invest'))      savingsRate = Math.max(savingsRate, 0.20);
    if (goals.includes('enjoy'))       savingsRate = Math.min(savingsRate, 0.15);
    savingsRate = Math.min(savingsRate, 0.50);

    const savingsAmt = round500(d * savingsRate);
    const lifestyle  = d - savingsAmt;

    // Lifestyle: daily 45%, fun 25%, self 15%, beauty+shop 15%
    const dailyAmt  = round500(lifestyle * 0.45);
    const funAmt    = round500(lifestyle * 0.25);
    const selfAmt   = round500(lifestyle * 0.15);
    const beautyAmt = Math.max(0, lifestyle - dailyAmt - funAmt - selfAmt);

    const envs = [
      { id: 'daily',  label: '日常生活', emoji: '🧺', color: '#FF8FAB', bg: '#FFE5EC', total: dailyAmt, cats: ['food','drink','home','transport'], vault: true,  daily: true  },
      { id: 'fun',    label: '玩樂享受', emoji: '🎮', color: '#FFD66B', bg: '#FFF4D1', total: funAmt,   cats: ['fun','travel','gift'],             vault: false, daily: false },
      { id: 'invest', label: '投資自己', emoji: '📈', color: '#7DCBA8', bg: '#D8F0E2', total: selfAmt,  cats: ['study','health'],                  vault: true,  daily: false },
    ];

    if (beautyAmt >= 1000) {
      envs.push({ id: 'beauty', label: '美妝購物', emoji: '💄', color: '#F590BB', bg: '#FFE0EE', total: beautyAmt, cats: ['beauty','shop'], vault: false, daily: false });
    } else if (beautyAmt > 0) {
      envs[1].total += beautyAmt;
    }

    if (savingsAmt >= 500) {
      envs.push({ id: 'reserve', label: '儲蓄備用', emoji: '🛡️', color: '#C9B8F0', bg: '#EFE9FF', total: savingsAmt, cats: [], vault: true, daily: false });
    }

    setSuggested(envs);
    setActiveIds(null);
    setStep(5);
  };

  const getActiveIds = () => activeIds || (suggested ? suggested.map(e => e.id) : []);

  const toggleEnv = (id) => {
    const ids = getActiveIds();
    if (ids.length <= 1 && ids.includes(id)) return;
    setActiveIds(ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  // Redistribute removed envelope budgets proportionally among active ones
  const getDisplayEnvs = () => {
    if (!suggested) return [];
    const ids = getActiveIds();
    const active = suggested.filter(e => ids.includes(e.id));
    if (active.length === suggested.length) return suggested;
    const activeSubtotal = active.reduce((s, e) => s + e.total, 0);
    const totalBudget = suggested.reduce((s, e) => s + e.total, 0);
    return active.map(env => ({
      ...env,
      total: activeSubtotal > 0 ? round500(env.total / activeSubtotal * totalBudget) : env.total,
    }));
  };

  const foxTip = () => {
    const savings = suggested ? suggested.find(e => e.id === 'reserve') : null;
    const pct = savings && disposable > 0 ? Math.round((savings.total / disposable) * 100) : 0;
    if (goals.includes('debt'))
      return `還清負債是最好的投資回報！每月撥 ${pct}% 還款，讓自己越來越輕鬆 💪`;
    if (situation === 'none' || goals.includes('emergency'))
      return `先把緊急備用金存到位最重要！每月撥 ${pct}% 存起來，剩下的再分配生活費 ✿`;
    if (goals.includes('invest'))
      return `每月存下 ${pct}% 做為投資或備用，剩下的均衡分配到生活各面向 ✿`;
    return `根據你的狀況，每月存下 ${pct}% 是個穩健的起點，其他依生活需求分配 🌸`;
  };

  const canNext = [true, incomeNum > 0, true, !!situation, goals.length > 0, true];

  const handleNext = () => {
    if (step === 4) runAnalysis();
    else setStep(s => s + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '8px 28px 24px' }}>
            <div className="wiggle" style={{ display: 'inline-block', marginBottom: 14 }}>
              <Fox mood="happy" size={110} fur={foxFur} accessory={foxAccessory}/>
            </div>
            <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginBottom: 10 }}>
              讓{foxName}幫你規劃！
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: 24 }}>
              我會問你幾個關於收入和支出的問題，<br/>
              根據你的狀況幫你算出最適合的<br/>
              預算信封分配方式 ✿
            </div>
            <div style={{ background: 'var(--accent-faint)', borderRadius: 18, padding: '14px 18px', fontSize: 13, color: 'var(--ink-soft)', textAlign: 'left', lineHeight: 1.8 }}>
              ⏱ 大概 2 分鐘可以完成<br/>
              🔒 資料只存在你的帳號裡
            </div>
          </div>
        );

      case 1:
        return (
          <div style={{ padding: '8px 24px' }}>
            <FoxBubble fur={foxFur} accessory={foxAccessory}>
              每個月的<b>稅後總收入</b>大概多少？<br/>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>本薪＋兼職＋獎金平均都算進去</span>
            </FoxBubble>
            <div style={{ position: 'relative', margin: '20px 0 16px' }}>
              <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: 'var(--ink-soft)', zIndex: 1 }}>NT$</span>
              <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                placeholder="例：40000"
                style={{ width: '100%', boxSizing: 'border-box', padding: '18px 18px 18px 60px', borderRadius: 20, border: '2px solid var(--accent-soft)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', background: 'var(--card)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[25000, 35000, 45000, 60000, 80000].map(v => (
                <div key={v} className="tap" onClick={() => setIncome(String(v))} style={{
                  padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                  background: income === String(v) ? 'var(--accent)' : 'var(--accent-faint)',
                  color: income === String(v) ? '#fff' : 'var(--accent)',
                }}>{v / 1000}K</div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ padding: '8px 24px' }}>
            <FoxBubble fur={foxFur} accessory={foxAccessory}>
              每個月有哪些<b>固定支出</b>？<br/>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>不確定的可以留空，0 也沒關係</span>
            </FoxBubble>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
              {fixedList.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 14, padding: '10px 14px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', flex: 1, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ position: 'relative', width: 120 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', fontSize: 12, fontWeight: 700 }}>$</span>
                    <input type="number" value={item.val} onChange={e => updateFixed(item.id, e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px 9px 22px', borderRadius: 10, border: '1.5px solid var(--accent-soft)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {incomeNum > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'var(--accent-faint)', borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>固定支出合計</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>NT${fixedTotal.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, background: '#E2F4E8', borderRadius: 14, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#3B8A5C' }}>每月可支配</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#3B8A5C', fontVariantNumeric: 'tabular-nums' }}>NT${disposable.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div style={{ padding: '8px 24px' }}>
            <FoxBubble fur={foxFur} accessory={foxAccessory}>目前的存款狀況大概是哪一種？</FoxBubble>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              {SITUATIONS.map(s => (
                <div key={s.id} className="tap" onClick={() => setSituation(s.id)} style={{
                  padding: '15px 18px', borderRadius: 18,
                  border: `2px solid ${situation === s.id ? 'var(--accent)' : 'transparent'}`,
                  background: situation === s.id ? 'var(--accent-faint)' : 'var(--card)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <span style={{ fontSize: 24 }}>{s.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--ink)', fontWeight: situation === s.id ? 700 : 500 }}>{s.label}</span>
                  {situation === s.id && <span style={{ color: 'var(--accent)', fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ padding: '8px 24px' }}>
            <FoxBubble fur={foxFur} accessory={foxAccessory}>
              最後！最想達成的理財目標是？<br/>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>可以多選 ✿</span>
            </FoxBubble>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
              {GOALS.map(g => {
                const sel = goals.includes(g.id);
                return (
                  <div key={g.id} className="tap" onClick={() => toggleGoal(g.id)} style={{
                    padding: '16px 12px', borderRadius: 18, textAlign: 'center',
                    border: `2px solid ${sel ? 'var(--accent)' : 'transparent'}`,
                    background: sel ? 'var(--accent-faint)' : 'var(--card)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{g.emoji}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: sel ? 700 : 500, lineHeight: 1.4 }}>{g.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5: {
        if (!suggested) return null;
        const ids = getActiveIds();
        const displayEnvs = getDisplayEnvs();
        return (
          <div style={{ padding: '8px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
              <div className="wiggle" style={{ flexShrink: 0 }}><Fox mood="excited" size={52} fur={foxFur} accessory={foxAccessory}/></div>
              <div style={{
                background: 'var(--card)', borderRadius: 18, borderBottomLeftRadius: 4,
                padding: '14px 16px', flex: 1, fontSize: 13, color: 'var(--ink)',
                lineHeight: 1.7, boxShadow: 'var(--shadow-sm)',
              }}>{foxTip()}</div>
            </div>

            {/* income summary bar */}
            <div style={{ background: 'var(--card)', borderRadius: 18, padding: '14px 16px', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
                <span>月收入 <b style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>NT${incomeNum.toLocaleString()}</b></span>
                <span>固定 <b style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>NT${fixedTotal.toLocaleString()}</b></span>
                <span style={{ color: '#3B8A5C' }}>可支配 <b style={{ fontVariantNumeric: 'tabular-nums' }}>NT${disposable.toLocaleString()}</b></span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#F5EBE4', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', width: `${Math.min(100, incomeNum > 0 ? (fixedTotal / incomeNum) * 100 : 0)}%`, background: '#A8D8F0' }}/>
                <div style={{ height: '100%', flex: 1, background: 'var(--accent)', opacity: 0.4 }}/>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
              點右側開關可以移除信封，金額會自動重新分配 ✿
            </div>

            {/* envelope list with toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {suggested.map(env => {
                const isActive = ids.includes(env.id);
                const display = displayEnvs.find(e => e.id === env.id);
                const pct = display && disposable > 0 ? Math.round((display.total / disposable) * 100) : 0;
                return (
                  <div key={env.id} style={{
                    background: 'var(--card)', borderRadius: 16, padding: '13px 16px',
                    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 12,
                    opacity: isActive ? 1 : 0.4, transition: 'opacity 0.2s',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: env.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{env.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700 }}>{env.label}</div>
                      <div style={{ height: 5, borderRadius: 3, background: '#F5EBE4', marginTop: 6 }}>
                        <div style={{ height: '100%', width: isActive ? `${pct}%` : '0%', background: env.color, borderRadius: 3, transition: 'width 0.3s' }}/>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                      {isActive ? (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 700, color: env.color, fontVariantNumeric: 'tabular-nums' }}>NT${(display?.total || 0).toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{pct}%</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>不加入</div>
                      )}
                    </div>
                    <div className="tap" onClick={() => toggleEnv(env.id)} style={{
                      width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                      background: isActive ? env.color : '#E8E0DA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, color: '#fff', fontWeight: 700,
                      transition: 'background 0.2s',
                    }}>
                      {isActive ? '✓' : '✕'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'var(--accent-faint)', borderRadius: 14, padding: '11px 14px', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              ✿ 設定後可以在「預算管理」隨時調整金額和信封內容
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  const stepLabel = [`${foxName}理財規劃`, '月收入', '固定支出', '存款狀況', '理財目標', `${foxName}的建議`];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'slide-up 0.3s ease-out' }}>
      {/* header */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div className="tap" onClick={step === 0 ? onClose : () => setStep(s => s - 1)} style={{
          width: 36, height: 36, borderRadius: 12, background: 'var(--card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
            {step === 0
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <path d="M15 18l-6-6 6-6"/>}
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>{stepLabel[step]}</div>
          {step >= 1 && step <= 4 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>第 {step} 步 / 共 4 步</div>
          )}
        </div>
      </div>

      {/* progress bar */}
      {step >= 1 && step <= 4 && (
        <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--accent-faint)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }}/>
          </div>
        </div>
      )}

      {/* content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {renderStep()}
      </div>

      {/* bottom button */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 20px 28px', background: 'rgba(255,246,240,0.95)', backdropFilter: 'blur(8px)' }}>
        {step < 5 ? (
          <div className="tap" onClick={canNext[step] ? handleNext : null} style={{
            background: canNext[step]
              ? 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)'
              : '#D5CCC4',
            borderRadius: 16, padding: '15px 0', textAlign: 'center',
            color: '#fff', fontSize: 15, fontWeight: 700,
            boxShadow: canNext[step] ? '0 6px 16px rgba(255,143,171,0.35)' : 'none',
          }}>
            {step === 0 ? '開始訪談 ✿' : step === 4 ? '幫我分析！🦊' : '繼續 →'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="tap" onClick={onClose} style={{
              flex: 1, padding: '15px 0', borderRadius: 16, background: 'var(--card)',
              textAlign: 'center', fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
            }}>謝謝，我自己設定</div>
            <div className="tap" onClick={() => onApply(getDisplayEnvs())} style={{
              flex: 2, padding: '15px 0', borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
              textAlign: 'center', fontSize: 15, color: '#fff', fontWeight: 700,
              boxShadow: '0 6px 16px rgba(255,143,171,0.35)',
            }}>幫我設定好！✿</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FinancialAdvisorScreen });
