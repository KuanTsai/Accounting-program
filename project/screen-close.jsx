// Monthly close ceremony — real budget vs actual spend, Firestore writes on confirm

const { useState: useStateClose, useEffect: useEffectClose } = React;

function MonthlyCloseScreen({ onClose, onConfirm, transactions = [], goalPots = [], foxFur = 'orange', foxAccessory = 'none' }) {
  const now = new Date();
  const closeYear = now.getFullYear();
  const closeMonth = now.getMonth();
  const closeMonthLabel = `${closeMonth + 1}月`;

  const [envelopes, setEnvelopes] = useStateClose([]);
  const [loadingBudget, setLoadingBudget] = useStateClose(true);
  const [picks, setPicks] = useStateClose({});
  const [openPicker, setOpenPicker] = useStateClose(null);
  const [confirmed, setConfirmed] = useStateClose(false);
  const [saving, setSaving] = useStateClose(false);

  useEffectClose(() => {
    const uid = window.auth.currentUser?.uid;
    if (!uid) { setLoadingBudget(false); return; }
    window.db.collection('users').doc(uid).collection('settings').doc('budget').get()
      .then(doc => {
        const d = doc.exists ? doc.data() : null;
        setEnvelopes(d && d.envelopes && d.envelopes.length > 0 ? d.envelopes : (window.DEFAULT_ENVELOPES || []));
        setLoadingBudget(false);
      });
  }, []);

  // Compute real used amounts for this month
  const envExplicit = {};
  const catImplicit = {};
  transactions.filter(tx => {
    if (!tx.createdAt || tx.amt >= 0) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === closeYear && d.getMonth() === closeMonth;
  }).forEach(tx => {
    if (tx.envelope) {
      envExplicit[tx.envelope] = (envExplicit[tx.envelope] || 0) + Math.abs(tx.amt);
    } else {
      catImplicit[tx.cat] = (catImplicit[tx.cat] || 0) + Math.abs(tx.amt);
    }
  });

  const items = envelopes
    .filter(env => env.total > 0)
    .map(env => {
      const used = (envExplicit[env.id] || 0) + (env.cats || []).reduce((s, cid) => s + (catImplicit[cid] || 0), 0);
      return { envId: env.id, label: env.label, emoji: env.emoji, color: env.color, bg: env.bg, total: env.total, used, leftover: Math.max(0, env.total - used), vault: env.vault };
    })
    .filter(it => it.leftover > 0);

  const destinations = [
    { id: 'auto', label: '對應金庫', kind: 'auto' },
    { id: 'rollover', label: '合併到下月預算', kind: 'rollover' },
    ...goalPots.map(g => ({ id: g.id, label: g.label, kind: 'goal' })),
  ];

  // Set default picks once items load
  useEffectClose(() => {
    if (items.length > 0 && Object.keys(picks).length === 0) {
      setPicks(Object.fromEntries(items.map(it => [it.envId, it.vault ? 'auto' : 'rollover'])));
    }
  }, [items.length]);

  const totalSaved = items.reduce((s, it) => {
    const dest = destinations.find(d => d.id === (picks[it.envId] || 'rollover'));
    return s + (dest && dest.kind !== 'rollover' ? it.leftover : 0);
  }, 0);
  const totalRollover = items.reduce((s, it) => s + (picks[it.envId] === 'rollover' ? it.leftover : 0), 0);

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    const uid = window.auth.currentUser?.uid;
    if (!uid) { setSaving(false); return; }
    try {
      // Auto pot updates (get existing for history)
      for (const it of items.filter(it => picks[it.envId] === 'auto' && it.leftover > 0)) {
        const potRef = window.db.collection('users').doc(uid).collection('autopots').doc(it.envId);
        const existing = await potRef.get();
        if (existing.exists) {
          const hist = (existing.data().history || []).slice(0, 11);
          hist.unshift({ m: closeMonthLabel, v: it.leftover });
          await potRef.update({
            total: firebase.firestore.FieldValue.increment(it.leftover),
            monthly: it.leftover, history: hist,
            emoji: it.emoji, color: it.color, bg: it.bg,
          });
        } else {
          await potRef.set({
            envId: it.envId, label: `${it.label}金庫`,
            emoji: it.emoji, color: it.color, bg: it.bg,
            total: it.leftover, monthly: it.leftover,
            history: [{ m: closeMonthLabel, v: it.leftover }],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
      // Goal pot deposits
      for (const it of items.filter(it => picks[it.envId] && picks[it.envId] !== 'auto' && picks[it.envId] !== 'rollover' && it.leftover > 0)) {
        await window.db.collection('users').doc(uid).collection('goals').doc(picks[it.envId]).update({
          saved: firebase.firestore.FieldValue.increment(it.leftover),
        });
      }
      // Rollover — add leftover back to each envelope's budget total
      const rolloverItems = items.filter(it => (picks[it.envId] || 'rollover') === 'rollover' && it.leftover > 0);
      if (rolloverItems.length > 0) {
        const budgetRef = window.db.collection('users').doc(uid).collection('settings').doc('budget');
        const budgetDoc = await budgetRef.get();
        if (budgetDoc.exists) {
          const envs = (budgetDoc.data().envelopes || []).map(env => {
            const match = rolloverItems.find(it => it.envId === env.id);
            return match ? { ...env, total: (env.total || 0) + match.leftover } : env;
          });
          const newTotal = envs.reduce((s, e) => s + (e.total || 0), 0);
          await budgetRef.update({ envelopes: envs, total: newTotal });
        }
      }
      // Record close
      const closeKey = `${closeYear}-${String(closeMonth + 1).padStart(2, '0')}`;
      await window.db.collection('users').doc(uid).collection('closes').doc(closeKey).set({
        closedAt: firebase.firestore.FieldValue.serverTimestamp(),
        totalSaved, totalRollover, month: closeMonthLabel,
        items: items.map(it => ({ envId: it.envId, leftover: it.leftover, dest: picks[it.envId] || 'rollover' })),
      });
      setConfirmed(true);
    } catch (e) {
      console.error('Close failed', e);
      setSaving(false);
    }
  };

  if (confirmed) {
    return <ConfirmOverlay totalSaved={totalSaved} totalRollover={totalRollover}
      transactions={transactions} goalPots={goalPots}
      closeMonth={closeMonth} closeYear={closeYear} closeMonthLabel={closeMonthLabel}
      foxFur={foxFur} foxAccessory={foxAccessory}
      onClose={onConfirm}/>;
  }

  if (loadingBudget) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: 36, animation: 'wiggle 1s infinite' }}>✿</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="tap" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>{closeMonthLabel}結算</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center', gap: 16 }}>
          <Fox mood="neutral" size={80} fur={foxFur} accessory={foxAccessory}/>
          <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>還沒設定預算</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            請先到「我的 → 預算管理」設定每月預算，<br/>結算才能幫你計算每個分類省下多少 ✿
          </div>
          <div className="tap" onClick={onClose} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            去設定預算
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* header */}
      <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tap" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div className="hand" style={{ fontSize: 22, color: 'var(--ink)' }}>{closeMonthLabel}結算</div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* fox intro card */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-faint) 0%, #FFF6F0 50%, #FFF1E8 100%)', borderRadius: 26, padding: '18px 20px 16px', position: 'relative', overflow: 'hidden' }}>
            <Tape color="var(--accent-soft)" rotate={-5} style={{ top: -10, left: 40 }}/>
            <div className="sparkle" style={{ position: 'absolute', top: 18, right: 26, fontSize: 14, color: 'var(--secondary)' }}>✦</div>
            <div className="sparkle" style={{ position: 'absolute', bottom: 24, right: 90, fontSize: 10, color: 'var(--lavender)', animationDelay: '0.5s' }}>★</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="wiggle"><Fox mood="celebrate" size={76} fur={foxFur} accessory={foxAccessory}/></div>
              <div style={{ flex: 1 }}>
                <div className="hand" style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.35 }}>
                  {closeMonthLabel}過完啦！<br/>來看看你存了多少 ✿
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.5 }}>
                  每個信封沒花完的錢，現在幫你存進金庫 🌸
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-soft)', fontWeight: 600 }}>本月結餘</div>
                <div style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ${items.reduce((s, it) => s + it.leftover, 0).toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#C5751F', fontWeight: 600 }}>進金庫</div>
                <div style={{ fontSize: 18, color: '#C5751F', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ${totalSaved.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* per-category breakdown */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="hand" style={{ fontSize: 20, color: 'var(--ink)' }}>信封處理</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>點箭頭可以改去向 ▾</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(it => {
              const pick = picks[it.envId] || 'rollover';
              const dest = destinations.find(d => d.id === pick);
              const destLabel = pick === 'auto' ? `${it.label}金庫` : (dest?.label || pick);
              const isRollover = pick === 'rollover';
              return (
                <div key={it.envId} style={{ background: 'var(--card)', borderRadius: 18, padding: '12px 14px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: it.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{it.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{it.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 1 }}>
                        花 ${it.used.toLocaleString()} / 預算 ${it.total.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>結餘</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#3B8A5C', fontVariantNumeric: 'tabular-nums' }}>
                        +${it.leftover.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="tap" onClick={() => setOpenPicker(openPicker === it.envId ? null : it.envId)} style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 12,
                    background: isRollover ? 'var(--accent-faint)' : '#FFF1E8',
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: `1px solid ${isRollover ? 'var(--accent-soft)' : '#FFD3B0'}`,
                  }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: isRollover ? 'var(--accent)' : 'linear-gradient(135deg, #FFE08A 0%, #FFB366 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                      {isRollover ? '↻' : '$'}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--ink-soft)' }}>去向：</span>
                      <b style={{ color: isRollover ? 'var(--accent)' : '#C5751F' }}>{destLabel}</b>
                    </div>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="var(--ink-soft)" strokeWidth="2" style={{ transition: 'transform 0.15s', transform: openPicker === it.envId ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path d="M1 1l4 4 4-4"/>
                    </svg>
                  </div>
                  {openPicker === it.envId && (
                    <div style={{ marginTop: 6, background: 'var(--bg)', borderRadius: 12, padding: 4, animation: 'pop-in 0.2s ease-out' }}>
                      {destinations.map(d => {
                        const label = d.id === 'auto' ? `${it.label}金庫` : d.label;
                        const isSelected = pick === d.id;
                        return (
                          <div key={d.id} className="tap" onClick={() => { setPicks({ ...picks, [it.envId]: d.id }); setOpenPicker(null); }} style={{
                            padding: '8px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                            background: isSelected ? 'var(--accent-faint)' : 'transparent',
                            color: isSelected ? 'var(--accent)' : 'var(--ink)',
                            fontSize: 12, fontWeight: isSelected ? 700 : 500,
                          }}>
                            <span style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--ink-faint)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isSelected && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }}/>}
                            </span>
                            <span style={{ flex: 1 }}>{label}</span>
                            {d.id === 'auto' && <span style={{ fontSize: 9, color: 'var(--ink-faint)', background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: 999 }}>預設</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* summary */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="hand" style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>結算總覽</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #F5E5DC', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-soft)' }}>進入小金庫</span>
              <b style={{ color: '#C5751F', fontVariantNumeric: 'tabular-nums' }}>+${totalSaved.toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--ink-soft)' }}>合併至下月預算</span>
              <b style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>+${totalRollover.toLocaleString()}</b>
            </div>
          </div>
        </div>
      </div>

      {/* sticky confirm button */}
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, background: 'rgba(255,246,240,0.92)', borderRadius: 18, padding: 6, backdropFilter: 'blur(8px)' }}>
        <div className="tap" onClick={handleConfirm} style={{
          background: saving ? '#D5CCC4' : 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
          borderRadius: 14, padding: '14px 0',
          color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center',
          boxShadow: saving ? 'none' : '0 6px 16px rgba(255,143,171,0.35)',
        }}>
          {saving ? '儲存中…' : `確認結算 · 入金庫 $${totalSaved.toLocaleString()} ✨`}
        </div>
      </div>
    </div>
  );
}

// ── Confirmation overlay (fox ceremony) ──────────────
function ShareCardOverlay({ totalSaved, thisTotal, txCount, savedMore, diffPct, closeMonthLabel, closeYear, tagline, foxFur, foxAccessory, onClose }) {
  const doShare = () => {
    const text = `🦊 ${closeYear}年${closeMonthLabel}我用小桃信封日記省了 $${totalSaved.toLocaleString()}！\n用信封理財法，養成存錢小習慣 ✿\nhttps://kuantsai.github.io/Accounting-program/`;
    if (navigator.share) {
      navigator.share({ title: '小桃の信封日記 月結報告', text }).catch(() => {});
    }
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(30,20,25,0.82)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      {/* card */}
      <div style={{ width: '100%', maxWidth: 340, borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {/* header gradient */}
        <div style={{ background: 'linear-gradient(135deg, #FF8FAB 0%, #FFB97A 100%)', padding: '22px 22px 18px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>✦</div>
          <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>★</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>小桃の信封日記</div>
          <Fox mood="celebrate" size={72} fur={foxFur} accessory={foxAccessory}/>
          <div className="hand" style={{ fontSize: 20, color: '#fff', marginTop: 6 }}>{closeYear}年{closeMonthLabel} 月結報告</div>
        </div>

        {/* body */}
        <div style={{ background: '#FFFAF5', padding: '18px 20px 20px' }}>
          {/* big numbers */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, background: '#FFF1E8', borderRadius: 16, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#B07050', fontWeight: 600, marginBottom: 4 }}>本月支出</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#4A3A35', fontVariantNumeric: 'tabular-nums' }}>${thisTotal.toLocaleString()}</div>
            </div>
            {totalSaved > 0 && (
              <div style={{ flex: 1, background: '#FFF0F4', borderRadius: 16, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#B05070', fontWeight: 600, marginBottom: 4 }}>省下入庫</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#D86A8A', fontVariantNumeric: 'tabular-nums' }}>+${totalSaved.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ padding: '4px 12px', borderRadius: 999, background: '#F0EEF8', fontSize: 12, color: '#7B6BA8', fontWeight: 600 }}>
              📝 記了 {txCount} 筆
            </div>
            {diffPct > 0 && (
              <div style={{ padding: '4px 12px', borderRadius: 999, background: savedMore ? '#E8F8EE' : '#FFF4E0', fontSize: 12, color: savedMore ? '#3B8A5C' : '#A0700A', fontWeight: 600 }}>
                {savedMore ? `↓ 比上月省 ${diffPct}%` : `↑ 比上月多 ${diffPct}%`}
              </div>
            )}
          </div>

          {/* tagline */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#8C7670', fontStyle: 'italic', borderTop: '1px dashed #F5E5DC', paddingTop: 12, marginBottom: 10, lineHeight: 1.6 }}>
            「{tagline}」
          </div>

          <div style={{ textAlign: 'center', fontSize: 10, color: '#C4ADA5' }}>
            🦊 kuantsai.github.io/Accounting-program
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20, width: '100%', maxWidth: 340 }}>
        <div className="tap" onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 16, background: 'rgba(255,255,255,0.15)', textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 600 }}>關閉</div>
        {navigator.share && (
          <div className="tap" onClick={doShare} style={{ flex: 2, padding: '13px', borderRadius: 16, background: 'linear-gradient(135deg, #FF8FAB 0%, #FFB97A 100%)', textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>分享 ↑</div>
        )}
      </div>
      {!navigator.share && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>截圖來分享這個月的成果 ✿</div>
      )}
    </div>
  );
}

function ConfirmOverlay({ totalSaved, totalRollover, transactions, goalPots, closeMonth, closeYear, closeMonthLabel, foxFur = 'orange', foxAccessory = 'none', onClose }) {
  const thisMonthExp = transactions.filter(tx => {
    if (!tx.createdAt || tx.amt >= 0) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === closeYear && d.getMonth() === closeMonth;
  });
  const lastD = new Date(closeYear, closeMonth - 1, 1);
  const lastMonthExp = transactions.filter(tx => {
    if (!tx.createdAt || tx.amt >= 0) return false;
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.getFullYear() === lastD.getFullYear() && d.getMonth() === lastD.getMonth();
  });
  const thisTotal = thisMonthExp.reduce((s, tx) => s + Math.abs(tx.amt), 0);
  const lastTotal = lastMonthExp.reduce((s, tx) => s + Math.abs(tx.amt), 0);
  const savedMore = lastTotal > 0 && thisTotal < lastTotal;
  const diffPct = lastTotal > 0 ? Math.round(Math.abs(1 - thisTotal / lastTotal) * 100) : 0;

  const topGoal = [...goalPots].sort((a, b) => (b.saved / b.target) - (a.saved / a.target))[0];

  const moodCounts = {};
  transactions.filter(tx => tx.mood).forEach(tx => { moodCounts[tx.mood] = (moodCounts[tx.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const moodNames = { happy: '開心', tired: '疲憊', love: '戀愛腦', neutral: '平靜', guilty: '罪惡感' };

  const facts = [
    { icon: '📝', color: '#7DCBA8', label: `本月共記帳 ${thisMonthExp.length} 筆`, sub: '每一筆都算數 ✿' },
    lastTotal > 0 && {
      icon: savedMore ? '↑' : '↓',
      color: savedMore ? '#FF8FAB' : '#FFB97A',
      label: savedMore ? `比上月省了 ${diffPct}%` : `比上月多花了 ${diffPct}%`,
      sub: savedMore ? `少花了 $${(lastTotal - thisTotal).toLocaleString()}` : `多花了 $${(thisTotal - lastTotal).toLocaleString()}`,
    },
    topGoal && {
      icon: '🎯', color: topGoal.color || '#F590BB',
      label: `${topGoal.label} ${Math.round((topGoal.saved / topGoal.target) * 100)}% 達成`,
      sub: `距目標還差 $${Math.max(0, topGoal.target - topGoal.saved).toLocaleString()}`,
    },
    topMood && {
      icon: '◡', color: '#FFD66B',
      label: `最常是「${moodNames[topMood[0]] || topMood[0]}」心情`,
      sub: `${topMood[1]} 次記帳時如此 ♥`,
    },
  ].filter(Boolean);

  const tagline = totalSaved > 4000 ? '比上個月還會存錢，超棒的 ✿'
    : totalSaved > 1000 ? '小小的努力會變成大大的存款 ♥'
    : '有開始就是進步，下個月再加油！';

  const [shareOpen, setShareOpen] = useStateClose(false);

  return (
    <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', position: 'relative', overflow: 'hidden' }}>
      {[{ l: '12%', t: '6%', c: 'var(--accent)' }, { l: '85%', t: '10%', c: 'var(--secondary)' }, { l: '22%', t: '18%', c: 'var(--lavender)' }, { l: '78%', t: '24%', c: '#A8D8F0' }].map((d, i) =>
        <div key={i} className="sparkle" style={{ position: 'absolute', left: d.l, top: d.t, width: 10, height: 10, borderRadius: 5, background: d.c, animationDelay: `${i * 0.1}s` }}/>
      )}

      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26, overflowY: 'auto' }}>
        <div className="wiggle"><Fox mood="celebrate" size={108} fur={foxFur} accessory={foxAccessory}/></div>
        <div className="hand" style={{ fontSize: 26, color: 'var(--ink)', marginTop: 10 }}>結算完成！</div>
        <div style={{ fontSize: 16, color: 'var(--accent)', marginTop: 4, textAlign: 'center', fontFamily: "'ChenYuluoyan', 'Noto Sans TC', sans-serif", letterSpacing: '0.04em' }}>
          {tagline}
        </div>

        <div style={{ marginTop: 18, padding: '14px 16px', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--shadow-card)', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
          <Tape color="var(--accent-soft)" rotate={-4} style={{ top: -10, left: 30 }}/>
          <Tape color="var(--secondary-soft)" rotate={6} style={{ top: -10, right: 30 }}/>
          <div className="hand" style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 10 }}>{closeMonthLabel}小結論 ✿</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {facts.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < facts.length - 1 ? '1px dashed #F5E5DC' : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, background: `${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, padding: '14px 18px', background: 'linear-gradient(135deg, #FFF1E8 0%, var(--accent-faint) 100%)', borderRadius: 20, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>進入小金庫</span>
            <b style={{ fontSize: 22, color: '#C5751F', fontVariantNumeric: 'tabular-nums' }}>+${totalSaved.toLocaleString()}</b>
          </div>
          {totalRollover > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderTop: '1px dashed rgba(74,58,53,0.12)', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>合併到下月</span>
              <b style={{ fontSize: 16, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>+${totalRollover.toLocaleString()}</b>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
          🦊　＋50 EXP　·　達成成就「準時結算」
        </div>
      </div>

      <div style={{ width: '100%', padding: '12px 0 20px', display: 'flex', gap: 10 }}>
        <div className="tap" onClick={() => setShareOpen(true)} style={{
          flex: 1, background: 'var(--accent-faint)', borderRadius: 16, padding: '14px 0',
          textAlign: 'center', color: 'var(--accent)', fontSize: 14, fontWeight: 700,
        }}>分享月結 📤</div>
        <div className="tap" onClick={onClose} style={{
          flex: 2, background: 'var(--accent)', borderRadius: 16, padding: '14px 0',
          textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 700,
          boxShadow: '0 6px 16px rgba(255,143,171,0.35)',
        }}>收下，下月加油！</div>
      </div>

      {shareOpen && (
        <ShareCardOverlay
          totalSaved={totalSaved}
          thisTotal={thisTotal}
          txCount={thisMonthExp.length}
          savedMore={savedMore}
          diffPct={diffPct}
          closeMonthLabel={closeMonthLabel}
          closeYear={closeYear}
          tagline={tagline}
          foxFur={foxFur}
          foxAccessory={foxAccessory}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { MonthlyCloseScreen });
