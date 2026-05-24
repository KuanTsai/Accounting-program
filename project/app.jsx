// Main app — bottom nav, screen routing, state

const { useState: useStateApp, useEffect: useEffectApp } = React;

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

const LEVEL_UNLOCKS = { 3: '小花', 5: '圍巾', 8: '眼鏡', 15: '皇冠' };

// ─── level-up full-screen overlay ──────────────────────
function LevelUpOverlay({ info, foxState, onClose }) {
  const unlocked = LEVEL_UNLOCKS[info.level];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 95,
      background: 'rgba(255,240,248,0.94)', backdropFilter: 'blur(14px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'pop-in 0.4s ease-out',
    }}>
      <div className="sparkle" style={{ position: 'absolute', top: '12%', left: '18%', fontSize: 26, color: '#FFD66B' }}>✦</div>
      <div className="sparkle" style={{ position: 'absolute', top: '18%', right: '16%', fontSize: 20, color: 'var(--accent)', animationDelay: '0.2s' }}>★</div>
      <div className="sparkle" style={{ position: 'absolute', bottom: '22%', left: '14%', fontSize: 16, color: 'var(--secondary)', animationDelay: '0.5s' }}>✦</div>
      <div className="sparkle" style={{ position: 'absolute', bottom: '28%', right: '18%', fontSize: 22, color: '#C9B8F0', animationDelay: '0.3s' }}>★</div>

      <div className="wiggle">
        <Fox mood="celebrate" size={160} fur={foxState.fur} accessory={foxState.accessory}/>
      </div>
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'Caveat', fontWeight: 700, letterSpacing: '0.08em' }}>
          Level Up ✦
        </div>
        <div className="hand" style={{ fontSize: 52, color: 'var(--ink)', lineHeight: 1.1 }}>
          Lv. {info.level}
        </div>
        <div style={{ fontSize: 16, color: 'var(--ink-soft)', marginTop: 6 }}>
          {foxState.name || '小桃'} 升級了！
        </div>
        {unlocked && (
          <div style={{
            marginTop: 14, padding: '10px 22px', borderRadius: 999,
            background: '#fff', boxShadow: 'var(--shadow-sm)',
            fontSize: 14, color: 'var(--accent)', fontWeight: 700,
            display: 'inline-block',
          }}>
            🎁 解鎖新配件：{unlocked}
          </div>
        )}
      </div>
      <div className="tap" onClick={onClose} style={{
        marginTop: 34, padding: '14px 44px', borderRadius: 999,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
        color: '#fff', fontSize: 16, fontWeight: 700,
        boxShadow: '0 8px 20px rgba(255,143,171,0.45)',
      }}>
        太棒了！繼續努力 ✿
      </div>
    </div>
  );
}

// ─── celebration toast (after add) ─────────────────────
function Toast({ show, withDiary, streak = 0, expGain = 10, isFirstToday = false, foxFur = 'orange', foxAccessory = 'none' }) {
  if (!show) return null;
  const bonusNote = isFirstToday ? '　首筆 +5 ✦' : streak >= 7 ? `　連續 ${streak} 天加成` : '';
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
          <Fox mood="celebrate" size={80} fur={foxFur} accessory={foxAccessory}/>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 8 }}>
          {withDiary ? '記錄＋日記都完成！' : '你做得很棒！'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
          +{expGain} EXP{bonusNote}{withDiary ? '　·　多了一篇日記 ✿' : ''}
        </div>
      </div>
    </div>
  );
}

// ─── add modal wrapper ─────────────────────────────────
function AddModal({ open, onClose, onDone, envelopes = [], preset = {} }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 70,
      animation: 'slide-up 0.3s ease-out',
    }}>
      <AddScreen onClose={onClose} envelopes={envelopes} preset={preset} onSave={(payload) => { onClose(); onDone(payload); }}/>
    </div>
  );
}

const APP_VERSION = 'v0.1.4';

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

// ─── settings bottom sheet ─────────────────────────────
function SettingsSheet({ user, onLogout, onClose }) {
  const [phase, setPhase] = useStateApp(null); // null | 'clearData' | 'deleteAccount'
  const [working, setWorking] = useStateApp(false);
  const [error, setError] = useStateApp(null);

  const deleteCol = async (uid, col) => {
    const snap = await window.db.collection('users').doc(uid).collection(col).get();
    if (snap.empty) return;
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = window.db.batch();
      snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  };

  const wipeData = async () => {
    const uid = user.uid;
    for (const col of ['transactions', 'goals', 'autopots', 'closes', 'settings']) {
      await deleteCol(uid, col);
    }
    try { localStorage.removeItem('onboardingDone'); localStorage.removeItem('foxState'); } catch {}
  };

  const handleClearData = async () => {
    if (working) return;
    setWorking(true); setError(null);
    try {
      await wipeData();
      onLogout();
    } catch {
      setError('清除失敗，請稍後再試');
      setWorking(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (working) return;
    setWorking(true); setError(null);
    try {
      await wipeData();
      await window.auth.currentUser.delete();
      onClose();
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setError('需要重新登入後才能刪除帳號，請先登出再重新登入');
      } else {
        setError('刪除失敗，請稍後再試');
      }
      setWorking(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.18)' }} onClick={onClose}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--card)',
        borderRadius: '28px 28px 0 0',
        padding: '20px 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        animation: 'slide-up 0.3s ease-out',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.08)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: 'var(--ink-faint)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 20 }}>設定 ✿</div>

        {/* account row */}
        <div style={{ background: 'var(--bg-paper)', borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px dashed var(--accent-faint)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 3 }}>登入帳號</div>
            <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{user?.email || '未登入'}</div>
          </div>
          <div className="tap" onClick={onLogout} style={{
            padding: '15px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 15, color: '#E05A5A', fontWeight: 600 }}>登出</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
        </div>

        {/* danger zone */}
        <div style={{ background: 'var(--bg-paper)', borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '10px 16px 6px', borderBottom: '1px dashed #F5E5DC' }}>
            <div style={{ fontSize: 10, color: '#C9A0A0', fontWeight: 700, letterSpacing: '0.08em' }}>危險操作</div>
          </div>

          {/* clear data */}
          <div style={{ borderBottom: '1px dashed #F5E5DC' }}>
            <div className="tap" onClick={() => { setPhase(phase === 'clearData' ? null : 'clearData'); setError(null); }} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#C5751F', fontWeight: 600 }}>清除所有數據</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>刪除記帳紀錄、預算、金庫（帳號保留）</div>
              </div>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#C9A0A0" strokeWidth="2" style={{ transition: 'transform 0.15s', transform: phase === 'clearData' ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <path d="M1 1l4 4 4-4"/>
              </svg>
            </div>
            {phase === 'clearData' && (
              <div style={{ padding: '0 16px 14px', animation: 'pop-in 0.2s ease-out' }}>
                <div style={{ background: '#FFF4E0', borderRadius: 12, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#A0652A', lineHeight: 1.5 }}>
                  ⚠️ 所有交易紀錄、金庫存款、預算設定都會被清除，這個動作無法復原。
                </div>
                {error && <div style={{ fontSize: 12, color: '#E05A5A', marginBottom: 8 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="tap" onClick={() => { setPhase(null); setError(null); }} style={{
                    flex: 1, padding: '10px', borderRadius: 12, background: 'var(--bg)',
                    textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600,
                  }}>取消</div>
                  <div className="tap" onClick={handleClearData} style={{
                    flex: 2, padding: '10px', borderRadius: 12,
                    background: working ? '#D5CCC4' : 'linear-gradient(135deg, #FFB366 0%, #E07030 100%)',
                    textAlign: 'center', fontSize: 13, color: '#fff', fontWeight: 700,
                  }}>{working ? '清除中…' : '確認清除'}</div>
                </div>
              </div>
            )}
          </div>

          {/* delete account */}
          <div>
            <div className="tap" onClick={() => { setPhase(phase === 'deleteAccount' ? null : 'deleteAccount'); setError(null); }} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#E05A5A', fontWeight: 600 }}>刪除帳號</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>永久刪除帳號與所有數據</div>
              </div>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#C9A0A0" strokeWidth="2" style={{ transition: 'transform 0.15s', transform: phase === 'deleteAccount' ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                <path d="M1 1l4 4 4-4"/>
              </svg>
            </div>
            {phase === 'deleteAccount' && (
              <div style={{ padding: '0 16px 14px', animation: 'pop-in 0.2s ease-out' }}>
                <div style={{ background: '#FFE9E9', borderRadius: 12, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#A03030', lineHeight: 1.5 }}>
                  ⚠️ 帳號刪除後無法復原，所有數據（包含帳號本身）都會消失。
                </div>
                {error && <div style={{ fontSize: 12, color: '#E05A5A', marginBottom: 8 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="tap" onClick={() => { setPhase(null); setError(null); }} style={{
                    flex: 1, padding: '10px', borderRadius: 12, background: 'var(--bg)',
                    textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600,
                  }}>取消</div>
                  <div className="tap" onClick={handleDeleteAccount} style={{
                    flex: 2, padding: '10px', borderRadius: 12,
                    background: working ? '#D5CCC4' : 'linear-gradient(135deg, #E05A5A 0%, #B03030 100%)',
                    textAlign: 'center', fontSize: 13, color: '#fff', fontWeight: 700,
                  }}>{working ? '刪除中…' : '確認刪除帳號'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tap" onClick={onClose} style={{
          marginTop: 8, padding: '13px', borderRadius: 16,
          background: 'var(--accent-faint)', textAlign: 'center',
          fontSize: 15, color: 'var(--accent)', fontWeight: 700,
        }}>關閉</div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: 'var(--ink-faint)' }}>
          小桃の記帳日記 {APP_VERSION}
        </div>
      </div>
    </div>
  );
}

// ─── palette bottom sheet ──────────────────────────────
function PaletteSheet({ value, onChange, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.18)' }} onClick={onClose}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--card)',
        borderRadius: '28px 28px 0 0',
        padding: '20px 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        animation: 'slide-up 0.3s ease-out',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.08)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: 'var(--ink-faint)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div className="hand" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 16 }}>選擇主題色 ✿</div>
        <PaletteRadio value={value} onChange={onChange} />
        <div className="tap" onClick={onClose} style={{
          marginTop: 20, padding: '13px', borderRadius: 16,
          background: 'var(--accent-faint)', textAlign: 'center',
          fontSize: 15, color: 'var(--accent)', fontWeight: 700,
        }}>完成</div>
      </div>
    </div>
  );
}

// ─── streak calculator ─────────────────────────────────
function calculateStreak(transactions) {
  const dateSet = new Set(
    transactions
      .filter(tx => tx.createdAt)
      .map(tx => {
        const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const startOffset = dateSet.has(todayKey) ? 0 : 1;
  let streak = 0;
  for (let i = startOffset; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dateSet.has(key)) streak++;
    else break;
  }
  return streak;
}

function App() {
  const [tab, setTab] = useStateApp('home');
  const [addOpen, setAddOpen] = useStateApp(false);
  const [addPreset, setAddPreset] = useStateApp({});
  const [budgetOpen, setBudgetOpen] = useStateApp(false);
  const [vaultOpen, setVaultOpen] = useStateApp(false);
  const [closeOpen, setCloseOpen] = useStateApp(false);
  const [newGoalOpen, setNewGoalOpen] = useStateApp(false);
  const [editingGoal, setEditingGoal] = useStateApp(null);
  const [withdrawPot, setWithdrawPot] = useStateApp(null);
  const [depositPot, setDepositPot] = useStateApp(null);
  const [categoriesOpen, setCategoriesOpen] = useStateApp(false);
  const [foxOpen, setFoxOpen] = useStateApp(false);
  const [paletteOpen, setPaletteOpen] = useStateApp(false);
  const [settingsOpen, setSettingsOpen] = useStateApp(false);

  const [showOnboarding, setShowOnboarding] = useStateApp(false);
  const [profileChecking, setProfileChecking] = useStateApp(true);

  // Fox state — localStorage as cache, Firestore as source of truth
  const [foxState, setFoxState] = useStateApp(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('foxState') || 'null');
      if (saved && saved.name) return saved;
    } catch {}
    return {
      name: '小桃', level: 1, exp: 0, days: 1,
      fur: 'orange', accessory: 'bow', mood: 'happy',
      satiety: 80, energy: 80, moodScore: 90,
    };
  });

  useEffectApp(() => {
    try { localStorage.setItem('foxState', JSON.stringify(foxState)); } catch {}
  }, [foxState]);
  const [toast, setToast] = useStateApp(false);
  const [toastDiary, setToastDiary] = useStateApp(false);
  const [toastExpGain, setToastExpGain] = useStateApp(10);
  const [toastFirstToday, setToastFirstToday] = useStateApp(false);
  const [levelUpInfo, setLevelUpInfo] = useStateApp(null);
  const [foxMoodOverride, setFoxMoodOverride] = useStateApp(null);

  const foxMood = (() => {
    if (foxMoodOverride) return foxMoodOverride;
    const { energy = 80, moodScore = 80, satiety = 80 } = foxState;
    if (energy < 20 || satiety < 20) return 'sleepy';
    if (moodScore < 30) return 'sad';
    if (moodScore >= 90 && energy >= 70) return 'excited';
    return 'happy';
  })();
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [user, setUser] = useStateApp(null);
  const [authReady, setAuthReady] = useStateApp(false);
  const [transactions, setTransactions] = useStateApp([]);
  const [goalPots, setGoalPots] = useStateApp([]);
  const [autoPots, setAutoPots] = useStateApp([]);
  const [monthClosed, setMonthClosed] = useStateApp(false);
  const [envelopes, setEnvelopes] = useStateApp([]);

  // apply palette
  useEffectApp(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.sakura;
    Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [tweaks.palette]);

  // handle redirect result from Google sign-in
  useEffectApp(() => {
    window.auth.getRedirectResult().catch(() => {});
  }, []);

  // auth state + profile check (determines onboarding)
  useEffectApp(() => {
    return window.auth.onAuthStateChanged(u => {
      setUser(u);
      setAuthReady(true);
      if (!u) { setProfileChecking(false); return; }
      // Fast path: localStorage flag means onboarding already done
      const alreadyDone = (() => { try { return !!localStorage.getItem('onboardingDone'); } catch { return false; } })();
      if (alreadyDone) { setProfileChecking(false); return; }
      // Slow path: new device or cleared localStorage — check Firestore
      window.db.collection('users').doc(u.uid).collection('settings').doc('profile').get()
        .then(doc => {
          if (doc.exists) {
            setFoxState(prev => ({ ...prev, ...doc.data() }));
            try { localStorage.setItem('onboardingDone', '1'); } catch {}
          } else {
            setShowOnboarding(true);
          }
        })
        .catch(() => setShowOnboarding(true))
        .finally(() => setProfileChecking(false));
    });
  }, []);

  // categories subscription — keeps global CATEGORIES in sync
  useEffectApp(() => {
    if (!user) return;
    window.db.collection('users').doc(user.uid).collection('settings').doc('categories').get()
      .then(doc => {
        if (doc.exists && doc.data().cats && doc.data().cats.length > 0) {
          const updated = doc.data().cats.filter(c => c.on !== false).map(({ id, label, color, bg, fav, icon }) => ({ id, label, color, bg, fav: !!fav, ...(icon ? { icon } : {}) }));
          CATEGORIES.splice(0, CATEGORIES.length, ...updated);
        }
      })
      .catch(() => {});
  }, [user]);

  // transactions subscription
  useEffectApp(() => {
    if (!user) { setTransactions([]); return; }
    return window.db.collection('users').doc(user.uid).collection('transactions')
      .orderBy('createdAt', 'desc').limit(200)
      .onSnapshot(snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  // vault subscriptions
  useEffectApp(() => {
    if (!user) { setGoalPots([]); setAutoPots([]); return; }
    const uid = user.uid;
    const unsubGoals = window.db.collection('users').doc(uid).collection('goals')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snap => setGoalPots(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubAuto = window.db.collection('users').doc(uid).collection('autopots')
      .onSnapshot(snap => setAutoPots(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubGoals(); unsubAuto(); };
  }, [user]);

  // budget subscription (feeds quick actions on home screen)
  useEffectApp(() => {
    if (!user) { setEnvelopes([]); return; }
    return window.db.collection('users').doc(user.uid).collection('settings').doc('budget')
      .onSnapshot(doc => {
        const d = doc.exists ? doc.data() : null;
        setEnvelopes(d && d.envelopes && d.envelopes.length > 0 ? d.envelopes : (window.DEFAULT_ENVELOPES || []));
      });
  }, [user]);

  // Track whether current month is already closed
  useEffectApp(() => {
    if (!user) { setMonthClosed(false); return; }
    const n = new Date();
    const closeKey = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    return window.db.collection('users').doc(user.uid).collection('closes').doc(closeKey)
      .onSnapshot(doc => setMonthClosed(doc.exists));
  }, [user]);

  const handleAdd = (preset = {}) => { setAddPreset(preset); setAddOpen(true); };
  const handleLogout = async () => {
    try {
      await window.auth.signOut();
      localStorage.removeItem('onboardingDone');
    } catch (e) {}
    setSettingsOpen(false);
  };
  const handleDelete = async (txId) => {
    if (!user || !txId) return;
    await window.db.collection('users').doc(user.uid).collection('transactions').doc(txId).delete();
  };

  const gainExp = (amount) => {
    const newExpRaw = foxState.exp + amount;
    const levelsGained = Math.floor(newExpRaw / 100);
    const newExp = newExpRaw % 100;
    const newLevel = foxState.level + levelsGained;
    setFoxState(s => ({ ...s, exp: newExp, level: newLevel }));
    if (levelsGained > 0) setLevelUpInfo({ level: newLevel });
    if (user) {
      window.db.collection('users').doc(user.uid).collection('settings').doc('profile')
        .set({ exp: newExp, level: newLevel }, { merge: true });
    }
  };

  const handleSaved = async (payload) => {
    setFoxMoodOverride('celebrate');

    // EXP calculation with bonuses
    let expGain = (payload && payload.diary) ? 18 : 10;
    const streak = calculateStreak(transactions);
    if (streak >= 30) expGain += 5;
    else if (streak >= 7) expGain += 2;
    const isFirstToday = !transactions.some(tx => {
      if (!tx.createdAt) return false;
      const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
      return d.toDateString() === new Date().toDateString();
    });
    if (isFirstToday) expGain += 5;

    gainExp(expGain);
    setToastExpGain(expGain);
    setToastFirstToday(isFirstToday);
    setToast(true);
    setToastDiary(!!(payload && payload.diary));
    setTimeout(() => { setToast(false); setFoxMoodOverride(null); }, 2500);

    if (user && payload) {
      const raw = parseFloat(payload.amount) || 0;
      const amt = payload.type === 'expense' ? -raw : raw;
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      await window.db.collection('users').doc(user.uid).collection('transactions').add({
        cat: payload.cat,
        envelope: payload.envelope || null,
        label: (CATEGORIES.find(c => c.id === payload.cat) || {}).label || payload.cat,
        amt,
        note: payload.note || null,
        mood: payload.mood || null,
        diary: payload.diary || null,
        time: `今天 ${hh}:${mm}`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  };

  const handleSaveGoal = async (data) => {
    if (!user) return;
    await window.db.collection('users').doc(user.uid).collection('goals').add({
      label: data.name,
      target: data.amount,
      saved: data.initial || 0,
      color: data.color,
      bg: data.bg,
      icon: data.icon,
      deadline: data.deadline || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setNewGoalOpen(false);
  };

  const handleUpdateGoal = async (data) => {
    if (!user || !data.id) return;
    await window.db.collection('users').doc(user.uid).collection('goals').doc(data.id).update({
      label: data.name,
      target: data.amount,
      color: data.color,
      bg: data.bg,
      icon: data.icon,
      deadline: data.deadline || null,
    });
    setEditingGoal(null);
  };

  const handleDepositConfirm = async ({ pot, amount, source }) => {
    if (!user) return;
    const uid = user.uid;
    await window.db.collection('users').doc(uid).collection('goals').doc(pot.id).update({
      saved: firebase.firestore.FieldValue.increment(amount),
    });
    if (source && source.id !== 'main') {
      await window.db.collection('users').doc(uid).collection('autopots').doc(source.id).update({
        total: firebase.firestore.FieldValue.increment(-amount),
      });
    }
    setDepositPot(null);
  };

  const handleWithdrawConfirm = async ({ pot, amount }) => {
    if (!user) return;
    await window.db.collection('users').doc(user.uid).collection('autopots').doc(pot.id).update({
      total: firebase.firestore.FieldValue.increment(-amount),
    });
    setWithdrawPot(null);
  };

  const now = new Date();
  const monthlyTxs = transactions.filter(tx => {
    if (!tx.createdAt) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const income = monthlyTxs.filter(t => t.amt > 0).reduce((s, t) => s + t.amt, 0);
  const expense = Math.abs(monthlyTxs.filter(t => t.amt < 0).reduce((s, t) => s + t.amt, 0));
  const catUsed = {};
  monthlyTxs.filter(t => t.amt < 0).forEach(t => {
    catUsed[t.cat] = (catUsed[t.cat] || 0) + Math.abs(t.amt);
  });
  const todayTxs = transactions.filter(tx => {
    if (!tx.createdAt) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.toDateString() === now.toDateString();
  });
  const liveData = {
    balance: income - expense,
    income,
    expense,
    streak: calculateStreak(transactions),
    foxName: foxState.name,
    level: foxState.level,
    foxExp: foxState.exp,
    foxFur: foxState.fur,
    foxAccessory: foxState.accessory,
    recent: todayTxs,
  };

  const renderScreen = () => {
    switch (tab) {
      case 'home': return <HomeScreen data={liveData} envelopes={envelopes} catUsed={catUsed} foxMood={foxMood} onAdd={handleAdd} onOpenTx={() => setTab('stats')} onOpenClose={() => setCloseOpen(true)} onOpenFox={() => setFoxOpen(true)} onOpenPalette={() => setPaletteOpen(true)} onOpenSettings={() => setSettingsOpen(true)} onDelete={handleDelete} showCloseBanner={!monthClosed}/>;
      case 'stats': return <StatsScreen data={liveData} transactions={transactions} envelopes={envelopes}/>;
      case 'diary': return <DiaryScreen transactions={transactions} onAdd={handleAdd}/>;
      case 'profile': return <ProfileScreen onOpenBudget={() => setBudgetOpen(true)} onOpenVault={() => setVaultOpen(true)} onOpenCategories={() => setCategoriesOpen(true)} onOpenFox={() => setFoxOpen(true)} onOpenPalette={() => setPaletteOpen(true)} onOpenSettings={() => setSettingsOpen(true)} palette={tweaks.palette} foxState={foxState} transactions={transactions} envelopes={envelopes} goalPots={goalPots} autoPots={autoPots} liveData={liveData}/>;
      default: return <HomeScreen data={liveData} foxMood={foxMood} onAdd={handleAdd}/>;
    }
  };

  if (!authReady || profileChecking) return (
    <div className="paper-bg" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 36, animation: 'wiggle 1s infinite' }}>✿</div>
    </div>
  );
  if (!user) return <LoginScreen/>;

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
        <AddModal open={addOpen} onClose={() => setAddOpen(false)} onDone={handleSaved} envelopes={envelopes} preset={addPreset}/>
        {budgetOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <BudgetScreen onClose={() => setBudgetOpen(false)} transactions={transactions}/>
          </div>
        )}
        {vaultOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <VaultScreen
              onClose={() => setVaultOpen(false)}
              onAddGoal={() => setNewGoalOpen(true)}
              onWithdraw={(pot) => setWithdrawPot(pot)}
              onDeposit={(pot) => setDepositPot(pot)}
              onEditGoal={(pot) => setEditingGoal(pot)}
              onOpenClose={() => { setVaultOpen(false); setCloseOpen(true); }}
              goalPots={goalPots}
              autoPots={autoPots}
              foxFur={foxState.fur}
              foxAccessory={foxState.accessory}
            />
          </div>
        )}
        {newGoalOpen && (
          <NewGoalScreen
            onClose={() => setNewGoalOpen(false)}
            onSave={handleSaveGoal}
          />
        )}
        {editingGoal && (
          <NewGoalScreen
            existing={editingGoal}
            onClose={() => setEditingGoal(null)}
            onSave={handleUpdateGoal}
          />
        )}
        {withdrawPot && (
          <WithdrawScreen
            pot={withdrawPot}
            onClose={() => setWithdrawPot(null)}
            onConfirm={handleWithdrawConfirm}
          />
        )}
        {depositPot && (
          <DepositScreen
            pot={depositPot}
            sources={[
              { id: 'main', label: '主帳戶', balance: liveData.balance },
              ...autoPots.filter(p => (p.total || 0) > 0).map(p => ({ id: p.id, label: p.label, balance: p.total })),
            ]}
            onClose={() => setDepositPot(null)}
            onConfirm={handleDepositConfirm}
          />
        )}
        {categoriesOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <CategoryScreen onClose={() => setCategoriesOpen(false)} transactions={transactions}/>
          </div>
        )}
        {foxOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <FoxScreen foxState={foxState} setFoxState={setFoxState} onClose={() => setFoxOpen(false)} onExpGain={gainExp} transactions={transactions} streak={liveData.streak}/>
          </div>
        )}
        {showOnboarding && (
          <OnboardingScreen
            onFinish={(data) => {
              const { budget, pickedEnvs, ...fox } = data;
              const joinedAt = Date.now();
              setFoxState(s => ({ ...s, ...fox, joinedAt }));
              try { localStorage.setItem('onboardingDone', '1'); } catch {}
              setShowOnboarding(false);
              if (user) {
                const uid = user.uid;
                window.db.collection('users').doc(uid).collection('settings').doc('profile').set({ ...fox, joinedAt });
                const allEnvs = window.DEFAULT_ENVELOPES || [];
                const defaultTotal = allEnvs.reduce((s, e) => s + e.total, 0);
                const savedEnvelopes = allEnvs
                  .filter(env => !pickedEnvs || pickedEnvs.includes(env.id))
                  .map(env => ({
                    ...env,
                    total: defaultTotal > 0
                      ? Math.round(budget * (env.total / defaultTotal) / 500) * 500
                      : env.total,
                  }));
                window.db.collection('users').doc(uid).collection('settings').doc('budget').set({
                  total: budget, warnAt: 80, remindOn: true, envelopes: savedEnvelopes,
                });
              }
            }}
          />
        )}
        {closeOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 70, animation: 'slide-up 0.3s ease-out' }}>
            <MonthlyCloseScreen
              onClose={() => setCloseOpen(false)}
              onConfirm={() => setCloseOpen(false)}
              transactions={transactions}
              goalPots={goalPots}
              foxFur={foxState.fur}
              foxAccessory={foxState.accessory}
            />
          </div>
        )}
        {settingsOpen && (
          <SettingsSheet user={user} onLogout={handleLogout} onClose={() => setSettingsOpen(false)} />
        )}
        {paletteOpen && (
          <PaletteSheet
            value={tweaks.palette}
            onChange={(id) => setTweak('palette', id)}
            onClose={() => setPaletteOpen(false)}
          />
        )}
        <Toast show={toast} withDiary={toastDiary} streak={liveData.streak} expGain={toastExpGain} isFirstToday={toastFirstToday} foxFur={foxState.fur} foxAccessory={foxState.accessory}/>
        {levelUpInfo && <LevelUpOverlay info={levelUpInfo} foxState={foxState} onClose={() => { setLevelUpInfo(null); setFoxMoodOverride(null); }}/>}
      </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
