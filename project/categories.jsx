// Category icons — flat, cute, geometric (no copyrighted symbols)
// Each is a small 24x24 SVG inside a colored circle.

const CATEGORIES = [
  { id: 'food',     label: '飲食',     color: '#FF8FAB', bg: '#FFE5EC' },
  { id: 'drink',    label: '飲料',     color: '#FFB97A', bg: '#FFE9D6' },
  { id: 'transport',label: '交通',     color: '#A8D8F0', bg: '#E0F2FA' },
  { id: 'shop',     label: '購物',     color: '#C9B8F0', bg: '#EFE9FF' },
  { id: 'fun',      label: '玩樂',     color: '#FFD66B', bg: '#FFF4D1' },
  { id: 'beauty',   label: '美妝',     color: '#F590BB', bg: '#FFE0EE' },
  { id: 'home',     label: '居家',     color: '#9DD6B0', bg: '#E2F4E8' },
  { id: 'health',   label: '醫療',     color: '#F08A8A', bg: '#FFE0E0' },
  { id: 'study',    label: '學習',     color: '#7FBEE0', bg: '#DDF0FA' },
  { id: 'gift',     label: '禮物',     color: '#E891C7', bg: '#FBE0F0' },
  { id: 'travel',   label: '旅遊',     color: '#7DCBC4', bg: '#D8F0EE' },
  { id: 'salary',   label: '薪水',     color: '#7DCBA8', bg: '#D8F0E2' },
];

function CatIcon({ id, size = 24, color = '#fff' }) {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'food': // bowl with chopsticks
      return (
        <svg {...props}>
          <path d="M 4 12 Q 4 19 12 19 Q 20 19 20 12 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 4 12 Q 4 19 12 19 Q 20 19 20 12"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="14" y1="3" x2="17" y2="10" strokeWidth="1.6"/>
          <line x1="16" y1="3" x2="19" y2="10" strokeWidth="1.6"/>
        </svg>
      );
    case 'drink': // cup
      return (
        <svg {...props}>
          <path d="M 6 6 L 18 6 L 17 20 Q 12 21 7 20 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 6 6 L 18 6 L 17 20 Q 12 21 7 20 Z"/>
          <line x1="6" y1="10" x2="18" y2="10"/>
          <circle cx="12" cy="3.5" r="0.6" fill={color}/>
        </svg>
      );
    case 'transport': // car
      return (
        <svg {...props}>
          <path d="M 3 14 L 5 8 Q 6 7 7 7 L 17 7 Q 18 7 19 8 L 21 14 L 21 17 L 3 17 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 3 14 L 5 8 Q 6 7 7 7 L 17 7 Q 18 7 19 8 L 21 14 L 21 17 L 3 17 Z"/>
          <circle cx="7" cy="17" r="2" fill={color}/>
          <circle cx="17" cy="17" r="2" fill={color}/>
        </svg>
      );
    case 'shop': // bag
      return (
        <svg {...props}>
          <path d="M 5 9 L 6 20 L 18 20 L 19 9 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 5 9 L 6 20 L 18 20 L 19 9 Z"/>
          <path d="M 9 9 Q 9 5 12 5 Q 15 5 15 9"/>
        </svg>
      );
    case 'fun': // game controller (rounded rect with buttons)
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="10" rx="4" fill={color} fillOpacity="0.25"/>
          <rect x="3" y="8" width="18" height="10" rx="4"/>
          <circle cx="8" cy="13" r="1.2" fill={color}/>
          <circle cx="16" cy="13" r="1.2" fill={color}/>
        </svg>
      );
    case 'beauty': // lipstick
      return (
        <svg {...props}>
          <path d="M 9 4 L 15 4 L 14 9 L 10 9 Z" fill={color} fillOpacity="0.4"/>
          <rect x="9" y="9" width="6" height="11" rx="1" fill={color} fillOpacity="0.25"/>
          <rect x="9" y="9" width="6" height="11" rx="1"/>
          <path d="M 9 4 L 15 4 L 14 9 L 10 9 Z"/>
        </svg>
      );
    case 'home': // house
      return (
        <svg {...props}>
          <path d="M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z"/>
          <rect x="10" y="13" width="4" height="7" fill={color}/>
        </svg>
      );
    case 'health': // cross / pill
      return (
        <svg {...props}>
          <rect x="10" y="4" width="4" height="16" rx="2" fill={color} fillOpacity="0.25"/>
          <rect x="4" y="10" width="16" height="4" rx="2" fill={color} fillOpacity="0.25"/>
          <rect x="10" y="4" width="4" height="16" rx="2"/>
          <rect x="4" y="10" width="16" height="4" rx="2"/>
        </svg>
      );
    case 'study': // book
      return (
        <svg {...props}>
          <path d="M 4 5 Q 8 4 12 5 Q 16 4 20 5 L 20 19 Q 16 18 12 19 Q 8 18 4 19 Z" fill={color} fillOpacity="0.25"/>
          <path d="M 4 5 Q 8 4 12 5 Q 16 4 20 5 L 20 19 Q 16 18 12 19 Q 8 18 4 19 Z"/>
          <line x1="12" y1="5" x2="12" y2="19"/>
        </svg>
      );
    case 'gift': // ribbon box
      return (
        <svg {...props}>
          <rect x="4" y="9" width="16" height="11" rx="1" fill={color} fillOpacity="0.25"/>
          <rect x="4" y="9" width="16" height="11" rx="1"/>
          <line x1="12" y1="9" x2="12" y2="20"/>
          <path d="M 8 9 Q 7 5 9 5 Q 12 5 12 9 Q 12 5 15 5 Q 17 5 16 9"/>
        </svg>
      );
    case 'travel': // airplane
      return (
        <svg {...props}>
          <path d="M 4 14 L 10 12 L 12 4 L 14 4 L 14 12 L 20 14 L 20 16 L 14 15 L 13 20 L 15 21 L 9 21 L 11 20 L 10 15 L 4 16 Z" fill={color} fillOpacity="0.3"/>
          <path d="M 4 14 L 10 12 L 12 4 L 14 4 L 14 12 L 20 14 L 20 16 L 14 15 L 13 20 L 15 21 L 9 21 L 11 20 L 10 15 L 4 16 Z"/>
        </svg>
      );
    case 'salary': // coins
      return (
        <svg {...props}>
          <ellipse cx="12" cy="7" rx="6" ry="2.5" fill={color} fillOpacity="0.3"/>
          <ellipse cx="12" cy="7" rx="6" ry="2.5"/>
          <path d="M 6 7 L 6 12 Q 6 14 12 14 Q 18 14 18 12 L 18 7"/>
          <path d="M 6 12 L 6 17 Q 6 19 12 19 Q 18 19 18 17 L 18 12"/>
        </svg>
      );
    default:
      return <svg {...props}><circle cx="12" cy="12" r="8"/></svg>;
  }
}

const BUILTIN_IDS = ['food','drink','transport','shop','fun','beauty','home','health','study','gift','travel','salary'];

// circular icon w/ background — used in lists, chips, etc
function CatBubble({ id, size = 44 }) {
  const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
  const isBuiltin = BUILTIN_IDS.includes(id);
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: cat.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `inset 0 -2px 0 ${cat.color}22`,
    }}>
      {(isBuiltin || cat.icon)
        ? <CatIcon id={cat.icon || id} size={size * 0.55} color={cat.color}/>
        : <span style={{ fontSize: size * 0.42, fontWeight: 700, color: cat.color, lineHeight: 1 }}>{(cat.label || '?')[0]}</span>
      }
    </div>
  );
}

// Generic UI: rounded button
function CuteButton({ children, onClick, variant = 'primary', style = {} }) {
  const bg = variant === 'primary' ? 'var(--accent)'
           : variant === 'ghost' ? 'transparent'
           : variant === 'soft' ? 'var(--accent-faint)'
           : 'var(--card)';
  const color = variant === 'primary' ? '#fff'
              : variant === 'soft' ? 'var(--accent)'
              : 'var(--ink)';
  return (
    <button onClick={onClick} className="tap" style={{
      background: bg, color, border: 'none',
      padding: '14px 22px', borderRadius: 999,
      fontSize: 16, fontWeight: 600,
      fontFamily: 'inherit',
      boxShadow: variant === 'primary' ? '0 4px 12px rgba(255,143,171,0.35)' : 'none',
      ...style,
    }}>{children}</button>
  );
}

// Washi tape strip — decorative
function Tape({ color = 'var(--accent-soft)', rotate = -8, style = {} }) {
  return (
    <div style={{
      position: 'absolute', width: 70, height: 20,
      background: color, opacity: 0.85,
      backgroundImage: 'repeating-linear-gradient(45deg, transparent 0, transparent 5px, rgba(255,255,255,0.4) 5px, rgba(255,255,255,0.4) 9px)',
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      ...style,
    }} />
  );
}

// Sticker — colored circle with text/emoji-like char
function Sticker({ char, color = '#FFD66B', size = 36, rotate = 0, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, color: '#fff',
      transform: `rotate(${rotate}deg)`,
      boxShadow: `0 3px 0 ${color}88, 0 2px 4px rgba(0,0,0,0.1)`,
      fontWeight: 700,
      ...style,
    }}>{char}</div>
  );
}

Object.assign(window, { CATEGORIES, CatIcon, CatBubble, CuteButton, Tape, Sticker });
