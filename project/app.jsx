// Main app — bottom nav, screen routing, state

const { useState: useStateApp, useEffect: useEffectApp } = React;

// ─── data ──────────────────────────────────────────────
const SEED_DATA = {
  balance: 28450,
  income: 38000,
  expense: 14800,
  streak: 12,
  level: 8,
  foxName: '小桃',
  recent: [
    { cat: 'drink', label: '櫻花拿鐵', amt: -280, time: '今天 14:30', note: '車站旁新咖啡廳' },
    { cat: 'food', label: '便利商店便當', amt: -110, time: '今天 12:15', note: '加班晚餐 QQ' },
    { cat: 'transport', label: '捷運', amt: -30, time: '今天 08:42', note: null },
    { cat: 'salary', label: '本月薪水', amt: 38000, time: '昨天', note: '5月入帳' },
    { cat: 'shop', label: 'Uniqlo T恤', amt: -590, time: '昨天 19:20', note: '夏季新款' },
    { cat: 'food', label: '早午餐', amt: -320, time: '昨天 11:00', note: '和小芸' },
  ],
};

// ─── bottom nav ────────────────────────────────────────
function BottomNav({ current, onSelect, onAdd, isMobile }) {
  const tabs = [
    { id: 'home', label: '首頁', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c.active ? c.color : 'none'} stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>
      </svg>
    )},
    { id: 'stats', label: '統計', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="20" x2="4" y2="12"/>
        <line x1="10" y1="20" x2="10" y2="4"/>
        <line x1="16" y1="20" x2="16" y2="14"/>
        <line x1="22" y1="20" x2="2" y2="20"/>
        {c.active && <circle cx="10" cy="4" r="2" fill={c.color}/>}
      </svg>
    )},
    { id: 'add', isAdd: true },
    { id: 'diary', label: '日記', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c.active ? c.color : 'none'} stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-4-3-4 3-4-3-4 3z"/>
      </svg>
    )},
    { id: 'profile', label: '我的', icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={c.active ? c.color : 'none'} stroke={c.color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 22a8 8 0 0 1 16 0"/>
      </svg>
    )},
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 8px)' : 18, pointerEvents: 'none',
    }}>
      <div style={{
        margin: '0 14px', height: 70, borderRadius: 28,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 10px 30px rgba(255,143,171,0.18), 0 0 0 1px rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center',
        padding: '0 8px',
        pointerEvents: 'auto',
      }}>
        {tabs.map((t) => {
          if (t.isAdd) {
            return (
              <div key="add" style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div className="tap" onClick={onAdd} style={{
                  width: 58, height: 58, borderRadius: 29,
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255,143,171,0.45), inset 0 -3px 0 rgba(0,0,0,0.08)',
                  marginTop: -22, position: 'relative',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <div className="sparkle" style={{ position: 'absolute', top: -4, right: -4, fontSize: 14, color: '#FFD66B' }}>✦</div>
                </div>
              </div>
            );
          }
          const active = current === t.id;
          return (
            <div key={t.id} className="tap" onClick={() => onSelect(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 0',
            }}>
              {t.icon({ active, color: active ? 'var(--accent)' : '#B5A89F' })}
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: active ? 'var(--accent)' : '#B5A89F',
              }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── celebration toast (after add) ─────────────────────
function Toast({ show, withDiary }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', top: '40%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 80, pointerEvents: 'none',
      animation: 'pop-in 0.4s ease-out',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(14px)',
        borderRadius: 26, padding: '22px 28px', textAlign: 'center',
        boxShadow: '0 20px 50px rgba(255,143,171,0.3)',
        minWidth: 220,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Fox mood="celebrate" size={80}/>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 8 }}>
          {withDiary ? '記錄＋日記都完成！' : '你做得很棒！'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
          {withDiary ? '+18 EXP　·　多了一篇日記 ✿' : '+12 EXP　·　連續第 12 天'}
        </div>
      </div>
    </div>
  );
}

// ─── add modal wrapper ─────────────────────────────────
function AddModal({ open, onClose, onDone }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 70,
      animation: 'slide-up 0.3s ease-out',
    }}>
      <AddScreen onClose={onClose} onSave={(payload) => { onClose(); onDone(payload); }}/>
    </div>
  );
}

// ─── root ──────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sakura"
}/*EDITMODE-END*/;

const PALETTES = {
  sakura: { '--bg': '#FFF6F0', '--bg-paper': '#FFFAF5', '--accent': '#FF8FAB', '--accent-soft': '#FFC2D1', '--accent-faint': '#FFE5EC', '--secondary': '#FFB97A', '--secondary-soft': '#FFE0C2', '--ink': '#4A3A35', '--ink-soft': '#8C7670', '--ink-faint': '#C4ADA5' },
  mint:   { '--bg': '#F0FAF3', '--bg-paper': '#F5FCF7', '--accent': '#6FC68C', '--accent-soft': '#B4E5BA', '--accent-faint': '#E2F4E8', '--secondary': '#A8D8F0', '--secondary-soft': '#DDF0FA', '--ink': '#2D4A38', '--ink-soft': '#7A9485', '--ink-faint': '#B5C9BC' },
  lavender:{ '--bg': '#F8F4FF', '--bg-paper': '#FAF7FF', '--accent': '#9B7FE0', '--accent-soft': '#D4BFFF', '--accent-faint': '#EFE9FF', '--secondary': '#F590BB', '--secondary-soft': '#FFE0EE', '--ink': '#3D2E54', '--ink-soft': '#7E6E94', '--ink-faint': '#C4B8D6' },
  peach:  { '--bg': '#FFF4EC', '--bg-paper': '#FFF9F4', '--accent': '#FF9F6B', '--accent-soft': '#FFCBA4', '--accent-faint': '#FFE9D6', '--secondary': '#FFD66B', '--secondary-soft': '#FFF4D1', '--ink': '#553828', '--ink-soft': '#9E7C68', '--ink-faint': '#D4B5A0' },
  navy:   { '--bg': '#1F1B2E', '--bg-paper': '#2A2540', '--accent': '#FF8FAB', '--accent-soft': '#5D4A6E', '--accent-faint': '#382F4A', '--secondary': '#FFD66B', '--secondary-soft': '#5A4D38', '--ink': '#F5EEFA', '--ink-soft': '#B0A6C5', '--ink-faint': '#6D6585' },
};

// Custom palette picker — 5 swatches each showing the palette's accent + 2 supporting colors
function PaletteRadio({ value, onChange }) {
  const opts = [
    { id: 'sakura', label: '櫻花', colors: ['#FF8FAB', '#FFC2D1', '#FFE5EC'] },
    { id: 'mint', label: '薄荷', colors: ['#6FC68C', '#B4E5BA', '#E2F4E8'] },
    { id: 'lavender', label: '薰衣草', colors: ['#9B7FE0', '#D4BFFF', '#EFE9FF'] },
    { id: 'peach', label: '蜜桃', colors: ['#FF9F6B', '#FFCBA4', '#FFE9D6'] },
    { id: 'navy', label: '夜空', colors: ['#1F1B2E', '#FF8FAB', '#FFD66B'] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, width: '100%' }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          appearance: 'none', border: 0, padding: 0, background: 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          cursor: 'default',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: value === o.id
              ? '0 0 0 2px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.12)'
              : '0 0 0 0.5px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
          }}>
            <div style={{ flex: 1.5, background: o.colors[0] }}/>
            <div style={{ display: 'flex', flex: 1 }}>
              <div style={{ flex: 1, background: o.colors[1] }}/>
              <div style={{ flex: 1, background: o.colors[2] }}/>
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(41,38,27,0.7)', fontWeight: 500 }}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function App() {
  const [tab, setTab] = useStateApp('home');
  const [addOpen, setAddOpen] = useStateApp(false);
  const [budgetOpen, setBudgetOpen] = useStateApp(false);
  const [vaultOpen, setVaultOpen] = useStateApp(false);
  const [closeOpen, setCloseOpen] = useStateApp(false);
  const [newGoalOpen, setNewGoalOpen] = useStateApp(false);
  const [withdrawPot, setWithdrawPot] = useStateApp(null);
  const [depositPot, setDepositPot] = useStateApp(null);
  const [categoriesOpen, setCategoriesOpen] = useStateApp(false);
  const [foxOpen, setFoxOpen] = useStateApp(false);

  // Onboarding: show on first launch (no localStorage marker yet)
  const [showOnboarding, setShowOnboarding] = useStateApp(() => {
    try { return !localStorage.getItem('onboardingDone'); } catch { return true; }
  });

  // Fox state — persisted via localStorage so the user's pet survives reloads
  const [foxState, setFoxState] = useStateApp(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('foxState') || 'null');
      if (saved && saved.name) return saved;
    } catch {}
    return {
      name: '小桃', level: 8, exp: 68, days: 247,
      fur: 'orange', accessory: 'bow', mood: 'happy',
      satiety: 72, energy: 84, moodScore: 90,
    };
  });

  useEffectApp(() => {
    try { localStorage.setItem('foxState', JSON.stringify(foxState)); } catch {}
  }, [foxState]);
  const [toast, setToast] = useStateApp(false);
  const [toastDiary, setToastDiary] = useStateApp(false);
  const [foxMood, setFoxMood] = useStateApp('happy');
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];

  // apply palette
  useEffectApp(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.sakura;
    Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [tweaks.palette]);

  const handleAdd = () => setAddOpen(true);
  const handleSaved = (payload) => {
    setFoxMood('celebrate');
    setToast(true);
    setToastDiary(!!(payload && payload.diary));
    setTimeout(() => { setToast(false); setFoxMood('happy'); }, 2000);
  };

  const renderScreen = () => {
    const liveData = {
      ...SEED_DATA,
      foxName: foxState.name,
      level: foxState.level,
      foxFur: foxState.fur,
      foxAccessory: foxState.accessory,
    };
    switch (tab) {
      case 'home': return <HomeScreen data={liveData} foxMood={foxMood} onAdd={handleAdd} onOpenTx={() => setTab('stats')} onOpenClose={() => setCloseOpen(true)} onOpenFox={() => setFoxOpen(true)}/>;
      case 'stats': return <StatsScreen data={liveData}/>;
      case 'diary': return <DiaryScreen/>;
      case 'profile': return <ProfileScreen onOpenBudget={() => setBudgetOpen(true)} onOpenVault={() => setVaultOpen(true)} onOpenCategories={() => setCategoriesOpen(true)} onOpenFox={() => setFoxOpen(true)} foxState={foxState}/>;
      default: return <HomeScreen data={liveData} foxMood={foxMood} onAdd={handleAdd}/>;
    }
  };

  return (
    <div data-screen-label="App" className="paper-bg" style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 'env(safe-area-inset-top, 0px)', flexShrink: 0 }}/>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }} data-screen-label={tab}>
        {renderScreen()}
      </div>
      <BottomNav current={tab} onSelect={setTab} onAdd={handleAdd} isMobile={true}/>
        <AddModal open={addOpen} onClose={() => setAddOpen(false)} onDone={handleSaved}/>
        {budgetOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <BudgetScreen onClose={() => setBudgetOpen(false)}/>
          </div>
        )}
        {vaultOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <VaultScreen
              onClose={() => setVaultOpen(false)}
              onAddGoal={() => setNewGoalOpen(true)}
              onWithdraw={(pot) => setWithdrawPot(pot)}
              onDeposit={(pot) => setDepositPot(pot)}
            />
          </div>
        )}
        {newGoalOpen && (
          <NewGoalScreen
            onClose={() => setNewGoalOpen(false)}
            onSave={() => setNewGoalOpen(false)}
          />
        )}
        {withdrawPot && (
          <WithdrawScreen
            pot={withdrawPot}
            onClose={() => setWithdrawPot(null)}
            onConfirm={() => setWithdrawPot(null)}
          />
        )}
        {depositPot && (
          <DepositScreen
            pot={depositPot}
            sources={[
              { id: 'main', label: '主帳戶', balance: 28450 },
              { id: 'life', label: '生活金庫', balance: 8400 },
              { id: 'fun', label: '玩樂金庫', balance: 12200 },
            ]}
            onClose={() => setDepositPot(null)}
            onConfirm={() => setDepositPot(null)}
          />
        )}
        {categoriesOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <CategoryScreen onClose={() => setCategoriesOpen(false)}/>
          </div>
        )}
        {foxOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <FoxScreen foxState={foxState} setFoxState={setFoxState} onClose={() => setFoxOpen(false)}/>
          </div>
        )}
        {showOnboarding && (
          <OnboardingScreen
            onFinish={(data) => {
              const { budget, pickedCats, ...fox } = data;
              setFoxState(s => ({ ...s, ...fox }));
              try { localStorage.setItem('onboardingDone', '1'); } catch {}
              setShowOnboarding(false);
            }}
          />
        )}
        {closeOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <MonthlyCloseScreen onClose={() => setCloseOpen(false)} onConfirm={() => setCloseOpen(false)}/>
          </div>
        )}
        <Toast show={toast} withDiary={toastDiary}/>
      </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
