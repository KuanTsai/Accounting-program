// Onboarding flow — runs on first launch, walks user through naming
// the fox, picking style, and setting a starting budget.

const { useState: useStateOnb } = React;

const ONB_FUR_OPTIONS = [
  { id: 'orange', label: '橘狐', color: '#F5A968' },
  { id: 'white',  label: '雪狐', color: '#F0E8DC' },
  { id: 'gray',   label: '灰狐', color: '#B5B0B8' },
  { id: 'pink',   label: '粉狐', color: '#FFB4C4' },
  { id: 'black',  label: '夜狐', color: '#5A4E4A' },
];

const ONB_ACC_OPTIONS = [
  { id: 'none',    label: '不戴' },
  { id: 'bow',     label: '蝴蝶結' },
  { id: 'flower',  label: '小花' },
  { id: 'scarf',   label: '圍巾' },
];

const NAME_SUGGESTIONS = ['小桃', '可可', '橘子', '麻糬', '布丁', '奶茶'];

function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useStateOnb(0);
  const [name, setName] = useStateOnb('');
  const [fur, setFur] = useStateOnb('orange');
  const [accessory, setAccessory] = useStateOnb('bow');
  const [budget, setBudget] = useStateOnb(20000);
  const defaultEnvIds = (window.DEFAULT_ENVELOPES || []).map(e => e.id);
  const [pickedEnvs, setPickedEnvs] = useStateOnb(defaultEnvIds);
  const [advisorOpen, setAdvisorOpen] = useStateOnb(false);
  const [advisorEnvelopes, setAdvisorEnvelopes] = useStateOnb(null);

  const finalName = name.trim() || '小桃';
  const LAST = 7;

  const finish = () => {
    onFinish({
      name: finalName, fur, accessory, level: 1, exp: 0, days: 1,
      satiety: 80, energy: 80, moodScore: 90, mood: 'happy',
      budget, pickedEnvs, advisorEnvelopes,
    });
  };

  const steps = [
    '歡迎', '取名字', '選毛色', '挑配件', '預算規劃', '設預算', '選信封', '完成',
  ];
  const isChoiceStep = step === 4;
  const isLast = step === LAST;

  const sharedProps = { name, setName, fur, setFur, accessory, setAccessory, budget, setBudget, pickedEnvs, setPickedEnvs, finalName, advisorEnvelopes };

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeStep/>;
      case 1: return <NameStep {...sharedProps}/>;
      case 2: return <FurStep {...sharedProps}/>;
      case 3: return <AccessoryStep {...sharedProps}/>;
      case 4: return <BudgetChoiceStep fur={fur} accessory={accessory}
        onManual={() => setStep(5)}
        onAdvisor={() => setAdvisorOpen(true)}/>;
      case 5: return <BudgetStep {...sharedProps}/>;
      case 6: return <EnvelopeStep {...sharedProps}/>;
      case 7: return <DoneStep {...sharedProps}/>;
      default: return null;
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'linear-gradient(180deg, #FFF6F0 0%, var(--accent-faint) 40%, #FFF1E8 100%)',
      display: 'flex', flexDirection: 'column',
      animation: 'pop-in 0.3s ease-out',
    }}>
      {/* progress dots + skip */}
      <div style={{ padding: '54px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 16 : 6, height: 6, borderRadius: 3,
              background: i <= step ? 'var(--accent)' : 'rgba(74,58,53,0.15)',
              transition: 'all 0.25s',
            }}/>
          ))}
        </div>
        {!isLast && step > 0 && !isChoiceStep && (
          <span className="tap" onClick={finish} style={{ fontSize: 12, color: 'var(--ink-soft)', padding: '4px 8px' }}>略過 →</span>
        )}
      </div>

      {/* step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        {renderStep()}
      </div>

      {/* footer button — hidden for choice step */}
      {!isChoiceStep && (
        <div style={{ padding: '14px 24px 30px' }}>
          <div className="tap"
            onClick={() => { if (isLast) finish(); else setStep(step + 1); }}
            style={{
              background: isLast
                ? 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)'
                : 'var(--accent)',
              borderRadius: 18, padding: '15px 0', textAlign: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 20px rgba(255,143,171,0.35)',
            }}>
            {isLast ? '開始記錄吧 ✨' : step === 0 ? '開始 →' : '下一步 →'}
          </div>
        </div>
      )}

      {/* Advisor overlay inside onboarding */}
      {advisorOpen && (
        <FinancialAdvisorScreen
          onClose={() => setAdvisorOpen(false)}
          onApply={(envs) => {
            setAdvisorEnvelopes(envs);
            setAdvisorOpen(false);
            setStep(LAST);
          }}
        />
      )}
    </div>
  );
}

// ── Step components ────────────────────────────────────────

function WelcomeStep() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 30 }}>
      <div className="wiggle" style={{ display: 'inline-block' }}>
        <Fox mood="excited" size={180}/>
      </div>
      <div className="hand" style={{ fontSize: 32, color: 'var(--ink)', marginTop: 20 }}>
        嗨～你來了！
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.7 }}>
        我會陪你一起記帳、存錢，<br/>
        還可以寫日記留下今天的故事。
      </div>
      <div style={{
        marginTop: 28, padding: '14px 18px',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 18, textAlign: 'left',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {[
          { icon: '🦊', t: '一隻屬於你的狐狸', s: '陪你度過每個記帳的日子' },
          { icon: '✉️', t: '信封預算管理', s: '把錢分配到不同信封，花到哪看到哪' },
          { icon: '🪙', t: '可愛的小金庫', s: '每月省下的錢自動存進來' },
          { icon: '✍️', t: '記帳順便寫日記', s: '心情和支出一起記錄' },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 0',
            borderBottom: i < 3 ? '1px dashed #F5E5DC' : 'none',
          }}>
            <div style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{f.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700 }}>{f.t}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{f.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NameStep({ name, setName, fur, accessory }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <Fox mood="happy" size={130} fur={fur} accessory={accessory}/>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 14 }}>
        幫狐狸取個名字吧 ✿
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        之後在「狐狸小屋」可以隨時改
      </div>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="小桃"
        maxLength={6}
        autoFocus
        style={{
          marginTop: 22, width: 220, boxSizing: 'border-box',
          fontSize: 22, color: 'var(--ink)',
          fontFamily: "-apple-system, 'SF Pro Display', 'PingFang TC', sans-serif",
          fontWeight: 700, textAlign: 'center',
          border: 'none', outline: 'none',
          background: '#fff', borderRadius: 14,
          padding: '14px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}
      />

      <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {NAME_SUGGESTIONS.map(n => (
          <span key={n} className="tap" onClick={() => setName(n)} style={{
            fontSize: 12, color: name === n ? '#fff' : 'var(--ink-soft)',
            background: name === n ? 'var(--accent)' : 'rgba(255,255,255,0.7)',
            border: '1px solid #F5E5DC',
            padding: '6px 12px', borderRadius: 999, fontWeight: 600,
            transition: 'all 0.15s',
          }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function FurStep({ fur, setFur, accessory, finalName }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      <Fox mood="happy" size={150} fur={fur} accessory={accessory}/>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 14 }}>
        {finalName} 是什麼毛色？
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        每隻狐狸都有自己的個性 ♥
      </div>

      <div style={{
        marginTop: 24, display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)', gap: 10,
      }}>
        {ONB_FUR_OPTIONS.map(f => {
          const sel = fur === f.id;
          return (
            <div key={f.id} className="tap" onClick={() => setFur(f.id)} style={{
              textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26, margin: '0 auto',
                background: f.color,
                boxShadow: sel
                  ? `0 0 0 3px #fff, 0 0 0 5px var(--accent), 0 4px 10px rgba(0,0,0,0.12)`
                  : '0 2px 6px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, fontWeight: 700,
                transition: 'all 0.15s',
              }}>{sel && '✓'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>{f.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccessoryStep({ fur, accessory, setAccessory, finalName }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      <Fox mood="happy" size={150} fur={fur} accessory={accessory}/>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 14 }}>
        要不要戴點什麼？
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        升等之後還會解鎖更多 ✿
      </div>

      <div style={{
        marginTop: 24, display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
      }}>
        {ONB_ACC_OPTIONS.map(a => {
          const sel = accessory === a.id;
          return (
            <div key={a.id} className="tap" onClick={() => setAccessory(a.id)} style={{
              cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{
                aspectRatio: '1', borderRadius: 16,
                background: sel ? 'var(--accent-faint)' : 'rgba(255,255,255,0.7)',
                border: sel ? '2px solid var(--accent)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                <Fox mood="happy" size={56} fur={fur} accessory={a.id}/>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 4, fontWeight: 500 }}>{a.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BudgetChoiceStep({ fur, accessory, onManual, onAdvisor }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 16 }}>
      <Fox mood="happy" size={100} fur={fur} accessory={accessory}/>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 14 }}>
        怎麼設定預算？
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6, marginBottom: 28 }}>
        選一個你喜歡的方式 ✿
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="tap" onClick={onAdvisor} style={{
          background: 'linear-gradient(135deg, var(--accent-faint) 0%, #FFF1E8 100%)',
          border: '2px solid var(--accent-soft)',
          borderRadius: 22, padding: '20px 18px',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Fox mood="excited" size={44} fur={fur}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>讓小桃幫我規劃 🦊</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.55 }}>
              回答幾個問題，小桃幫你算出<br/>最適合的預算分配方式
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>

        <div className="tap" onClick={onManual} style={{
          background: 'rgba(255,255,255,0.75)',
          border: '2px solid rgba(74,58,53,0.08)',
          borderRadius: 22, padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, background: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>✏️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>自己設定</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
              直接輸入月預算金額和信封分配
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
}

function BudgetStep({ budget, setBudget, fur, accessory }) {
  const { useState: useStateBS } = React;
  const presets = [10000, 20000, 30000, 50000];
  const [raw, setRaw] = useStateBS('');
  const [editing, setEditing] = useStateBS(false);

  return (
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      <Fox mood="happy" size={110} fur={fur} accessory={accessory}/>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 12 }}>
        每月想花多少？
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        當作起點，之後在預算頁可以調整
      </div>

      <div style={{
        marginTop: 22, background: '#fff', borderRadius: 22,
        padding: '24px 18px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8 }}>點數字直接輸入</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 600 }}>NT$</span>
          {editing ? (
            <input
              autoFocus
              type="number"
              value={raw}
              onChange={e => setRaw(e.target.value)}
              onBlur={() => {
                const n = parseInt(raw, 10);
                if (!isNaN(n) && n > 0) setBudget(n);
                setEditing(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') e.target.blur();
                if (e.key === 'Escape') setEditing(false);
              }}
              style={{
                fontSize: 48, fontWeight: 700, letterSpacing: -0.5,
                border: 'none', outline: 'none', background: 'transparent',
                color: 'var(--accent)', width: 200, textAlign: 'center',
                borderBottom: '2.5px dashed var(--accent)',
              }}
            />
          ) : (
            <span
              className="tap"
              onClick={() => { setRaw(String(budget)); setEditing(true); }}
              style={{
                fontSize: 48, color: 'var(--ink)', fontWeight: 700,
                fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
                borderBottom: '2.5px dashed var(--accent-soft)',
              }}
            >
              {budget.toLocaleString()}
            </span>
          )}
          <span style={{ fontSize: 15, color: 'var(--ink-soft)' }}>/ 月</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
          {presets.map(p => (
            <span key={p} className="tap" onClick={() => setBudget(p)} style={{
              flex: 1, textAlign: 'center',
              fontSize: 13, fontWeight: 600,
              padding: '9px 0', borderRadius: 999,
              background: budget === p ? 'var(--accent)' : 'var(--bg)',
              color: budget === p ? '#fff' : 'var(--ink-soft)',
              transition: 'all 0.15s',
            }}>{p >= 10000 ? `${p / 10000}萬` : `${p / 1000}k`}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-soft)' }}>
        ＊ 不含房租、保險等固定支出
      </div>
    </div>
  );
}

function EnvelopeStep({ budget, pickedEnvs, setPickedEnvs }) {
  const allEnvs = window.DEFAULT_ENVELOPES || [];
  const defaultTotal = allEnvs.reduce((s, e) => s + e.total, 0);

  const envAmt = (env) =>
    defaultTotal > 0 ? Math.round(budget * (env.total / defaultTotal) / 500) * 500 : env.total;

  const catLabel = (catId) => (CATEGORIES.find(c => c.id === catId) || {}).label || catId;

  const toggle = (id) => setPickedEnvs(prev =>
    prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
  );

  const pickedTotal = allEnvs
    .filter(e => pickedEnvs.includes(e.id))
    .reduce((s, e) => s + envAmt(e), 0);

  return (
    <div style={{ paddingTop: 10 }}>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', textAlign: 'center' }}>
        選擇你的信封 ✉️
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center', lineHeight: 1.6 }}>
        把每月預算分配到不同信封，<br/>記帳時選信封就能看到花了多少
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allEnvs.map(env => {
          const sel = pickedEnvs.includes(env.id);
          const amt = envAmt(env);
          return (
            <div key={env.id} className="tap" onClick={() => toggle(env.id)} style={{
              background: sel ? env.bg : 'rgba(255,255,255,0.6)',
              borderRadius: 16, padding: '12px 14px',
              border: `2px solid ${sel ? env.color : 'transparent'}`,
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 24, width: 34, textAlign: 'center', flexShrink: 0 }}>{env.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{env.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: sel ? env.color : 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                    ${amt.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 3 }}>
                  {(env.cats || []).map(c => catLabel(c)).join('・')}
                </div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                background: sel ? env.color : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 700,
                transition: 'all 0.15s',
              }}>{sel ? '✓' : ''}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'rgba(255,255,255,0.7)', borderRadius: 14,
        fontSize: 12, color: 'var(--ink)', textAlign: 'center',
      }}>
        已選 <b style={{ color: 'var(--accent)' }}>{pickedEnvs.length}</b> 個信封，
        合計 <b style={{ color: 'var(--ink)' }}>${pickedTotal.toLocaleString()}</b> / 月
      </div>
    </div>
  );
}

function DoneStep({ fur, accessory, finalName, budget, pickedEnvs, advisorEnvelopes }) {
  const allEnvs = window.DEFAULT_ENVELOPES || [];
  const selected = advisorEnvelopes || allEnvs.filter(e => pickedEnvs.includes(e.id));
  const displayBudget = advisorEnvelopes
    ? advisorEnvelopes.reduce((s, e) => s + e.total, 0)
    : budget;

  return (
    <div style={{ textAlign: 'center', paddingTop: 20, position: 'relative' }}>
      {[
        { l: '8%', t: '0%' }, { l: '88%', t: '8%' },
        { l: '16%', t: '24%' }, { l: '82%', t: '30%' },
      ].map((s, i) => (
        <div key={i} className="sparkle" style={{
          position: 'absolute', left: s.l, top: s.t,
          fontSize: 16, color: 'var(--secondary)',
          animationDelay: `${i * 0.2}s`,
        }}>✦</div>
      ))}

      <div className="wiggle" style={{ display: 'inline-block' }}>
        <Fox mood="celebrate" size={150} fur={fur} accessory={accessory}/>
      </div>
      <div className="hand" style={{ fontSize: 30, color: 'var(--ink)', marginTop: 16 }}>
        我們都準備好了！
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 8 }}>
        {finalName} 會在主畫面等你 ♥
      </div>

      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: 'rgba(255,255,255,0.85)', borderRadius: 18,
        boxShadow: 'var(--shadow-sm)', textAlign: 'left',
      }}>
        <SummaryRow icon="🦊" label="狐狸" value={finalName}/>
        <SummaryRow icon="💰" label="月預算" value={`NT$ ${displayBudget.toLocaleString()}`}/>
        <div style={{ padding: '8px 0', borderTop: '1px dashed #F5E5DC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>✉️</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>信封預算</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 38 }}>
            {selected.map(env => (
              <span key={env.id} style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 999,
                background: env.bg, color: env.color, fontWeight: 700,
              }}>{env.emoji} {env.label}</span>
            ))}
          </div>
        </div>
        <SummaryRow icon="✨" label="等級" value="Lv. 1（剛起步！）" last/>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0',
      borderBottom: last ? 'none' : '1px dashed #F5E5DC',
    }}>
      <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
