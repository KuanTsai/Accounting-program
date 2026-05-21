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
  const [pickedCats, setPickedCats] = useStateOnb(['food', 'shop', 'fun', 'drink', 'transport']);

  const finalName = name.trim() || '小桃';

  const finish = () => {
    onFinish({
      name: finalName, fur, accessory, level: 1, exp: 0, days: 1,
      satiety: 80, energy: 80, moodScore: 90, mood: 'happy',
      budget, pickedCats,
    });
  };

  const steps = [
    { title: '歡迎', component: WelcomeStep },
    { title: '取名字', component: NameStep },
    { title: '選毛色', component: FurStep },
    { title: '挑配件', component: AccessoryStep },
    { title: '設預算', component: BudgetStep },
    { title: '選分類', component: CategoryStep },
    { title: '完成', component: DoneStep },
  ];
  const Step = steps[step].component;
  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'linear-gradient(180deg, #FFF6F0 0%, var(--accent-faint) 40%, #FFF1E8 100%)',
      display: 'flex', flexDirection: 'column',
      animation: 'pop-in 0.3s ease-out',
    }}>
      {/* progress dots + skip */}
      <div style={{
        padding: '54px 24px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 16 : 6, height: 6, borderRadius: 3,
              background: i <= step ? 'var(--accent)' : 'rgba(74,58,53,0.15)',
              transition: 'all 0.25s',
            }}/>
          ))}
        </div>
        {!isLast && step > 0 && (
          <span className="tap" onClick={finish} style={{
            fontSize: 12, color: 'var(--ink-soft)', padding: '4px 8px',
          }}>略過 →</span>
        )}
      </div>

      {/* step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <Step {...{
          name, setName, fur, setFur, accessory, setAccessory,
          budget, setBudget, pickedCats, setPickedCats, finalName,
        }}/>
      </div>

      {/* footer button */}
      <div style={{ padding: '14px 24px 30px' }}>
        <div className="tap"
          onClick={() => {
            if (isLast) finish();
            else setStep(step + 1);
          }}
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
          { icon: '🪙', t: '可愛的小金庫', s: '把省下的錢分類存起來' },
          { icon: '✍️', t: '記帳順便寫日記', s: '心情和支出一起記錄' },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 0',
            borderBottom: i < 2 ? '1px dashed #F5E5DC' : 'none',
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

function BudgetStep({ budget, setBudget, fur, accessory }) {
  const presets = [10000, 20000, 30000, 50000];
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
        padding: '20px 18px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>NT$</span>
          <span style={{
            fontSize: 38, color: 'var(--ink)', fontWeight: 700,
            fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
          }}>{budget.toLocaleString()}</span>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>/ 月</span>
        </div>
        <input
          type="range" min={5000} max={80000} step={1000}
          value={budget} onChange={e => setBudget(Number(e.target.value))}
          style={{ width: '100%', marginTop: 14, accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {presets.map(p => (
            <span key={p} className="tap" onClick={() => setBudget(p)} style={{
              flex: 1, textAlign: 'center',
              fontSize: 12, fontWeight: 600,
              padding: '8px 0', borderRadius: 999,
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

function CategoryStep({ pickedCats, setPickedCats }) {
  const toggle = (id) => {
    setPickedCats(pickedCats.includes(id)
      ? pickedCats.filter(c => c !== id)
      : [...pickedCats, id]);
  };
  return (
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 10 }}>
        你常花在哪些地方？
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        選 3-6 個常用分類，之後還能改
      </div>

      <div style={{
        marginTop: 20,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      }}>
        {CATEGORIES.filter(c => c.id !== 'salary').map(c => {
          const sel = pickedCats.includes(c.id);
          return (
            <div key={c.id} className="tap" onClick={() => toggle(c.id)} style={{
              cursor: 'pointer',
              background: sel ? c.bg : 'rgba(255,255,255,0.7)',
              border: sel ? `2px solid ${c.color}` : '2px solid transparent',
              borderRadius: 16, padding: '12px 0 8px',
              textAlign: 'center', transition: 'all 0.15s',
              position: 'relative',
            }}>
              <CatBubble id={c.id} size={36}/>
              <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 4, fontWeight: sel ? 700 : 500 }}>
                {c.label}
              </div>
              {sel && (
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 16, height: 16, borderRadius: 8,
                  background: c.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 16, padding: '10px 14px',
        background: 'rgba(255,255,255,0.7)', borderRadius: 14,
        fontSize: 12, color: 'var(--ink)',
      }}>
        已選 <b style={{ color: 'var(--accent)' }}>{pickedCats.length}</b> 個 ♥
      </div>
    </div>
  );
}

function DoneStep({ fur, accessory, finalName, budget }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20, position: 'relative' }}>
      {/* sparkles */}
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
        <Fox mood="celebrate" size={160} fur={fur} accessory={accessory}/>
      </div>
      <div className="hand" style={{ fontSize: 30, color: 'var(--ink)', marginTop: 16 }}>
        我們都準備好了！
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 8 }}>
        {finalName} 會在主畫面等你 ♥
      </div>

      <div style={{
        marginTop: 24, padding: '14px 18px',
        background: 'rgba(255,255,255,0.85)', borderRadius: 18,
        boxShadow: 'var(--shadow-sm)', textAlign: 'left',
      }}>
        <SummaryRow icon="🦊" label="狐狸" value={finalName}/>
        <SummaryRow icon="💰" label="月預算" value={`NT$ ${budget.toLocaleString()}`}/>
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
