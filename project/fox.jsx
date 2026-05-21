// Fox mascot — geometric, mood-driven
// Built with circles, triangles, and arcs only.
// Moods: happy, excited, sleepy, sad, eating, celebrate

function Fox({ mood = 'happy', size = 120, accent = '#FF8FAB', fur = 'orange', accessory = 'none' }) {
  // Core fox colors based on `fur` variant
  const FUR_VARIANTS = {
    orange: { fur: '#F5A968', dark: '#E08850', cream: '#FFF1E0' },
    white:  { fur: '#F0E8DC', dark: '#D8CCB8', cream: '#FFFAF0' },
    gray:   { fur: '#B5B0B8', dark: '#928D96', cream: '#F2EFE8' },
    pink:   { fur: '#FFB4C4', dark: '#F08FA8', cream: '#FFF0F5' },
    black:  { fur: '#5A4E4A', dark: '#3B312E', cream: '#FFF1E0' },
  };
  const FUR = FUR_VARIANTS[fur]?.fur || FUR_VARIANTS.orange.fur;
  const FUR_DARK = FUR_VARIANTS[fur]?.dark || FUR_VARIANTS.orange.dark;
  const CREAM = FUR_VARIANTS[fur]?.cream || FUR_VARIANTS.orange.cream;
  const NOSE = '#3D2820';
  const BLUSH = '#FFB4C4';

  // eye styles per mood
  const eyes = (() => {
    switch (mood) {
      case 'happy':
        return (
          <g>
            <path d="M 38 52 Q 44 46 50 52" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <path d="M 70 52 Q 76 46 82 52" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
          </g>
        );
      case 'excited':
        return (
          <g>
            <circle cx="44" cy="52" r="4.5" fill={NOSE}/>
            <circle cx="76" cy="52" r="4.5" fill={NOSE}/>
            <circle cx="42.5" cy="50" r="1.5" fill="#fff"/>
            <circle cx="74.5" cy="50" r="1.5" fill="#fff"/>
            {/* sparkles around */}
            <text x="22" y="38" fontSize="14" fill={accent}>✦</text>
            <text x="92" y="36" fontSize="12" fill={accent}>✦</text>
          </g>
        );
      case 'sleepy':
        return (
          <g>
            <path d="M 36 54 Q 44 50 52 54" stroke={NOSE} strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 68 54 Q 76 50 84 54" stroke={NOSE} strokeWidth="3" strokeLinecap="round" fill="none"/>
            <text x="92" y="32" fontSize="14" fill={NOSE} opacity="0.6" fontFamily="Caveat, cursive" fontWeight="700">z</text>
            <text x="100" y="22" fontSize="10" fill={NOSE} opacity="0.4" fontFamily="Caveat, cursive" fontWeight="700">z</text>
          </g>
        );
      case 'sad':
        return (
          <g>
            <path d="M 38 50 Q 44 56 50 50" stroke={NOSE} strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M 70 50 Q 76 56 82 50" stroke={NOSE} strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="50" cy="60" r="2" fill="#A8D8F0" opacity="0.8"/>
          </g>
        );
      case 'celebrate':
        return (
          <g>
            <path d="M 36 50 Q 44 42 52 50" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <path d="M 68 50 Q 76 42 84 50" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <text x="14" y="22" fontSize="16" fill="#FFE08A">★</text>
            <text x="96" y="18" fontSize="13" fill={accent}>♥</text>
            <text x="100" y="42" fontSize="11" fill="#9DD6B0">✦</text>
          </g>
        );
      case 'eating':
        return (
          <g>
            <path d="M 38 52 Q 44 46 50 52" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <path d="M 70 52 Q 76 46 82 52" stroke={NOSE} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
          </g>
        );
      default:
        return null;
    }
  })();

  // mouth
  const mouth = (() => {
    if (mood === 'sleepy') {
      return <ellipse cx="60" cy="74" rx="3" ry="2" fill={NOSE} opacity="0.5"/>;
    }
    if (mood === 'sad') {
      return <path d="M 54 76 Q 60 72 66 76" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" fill="none"/>;
    }
    if (mood === 'eating') {
      return (
        <g>
          <ellipse cx="60" cy="76" rx="6" ry="5" fill={NOSE}/>
          <ellipse cx="60" cy="79" rx="3" ry="2" fill={accent}/>
        </g>
      );
    }
    if (mood === 'celebrate' || mood === 'excited') {
      return <path d="M 54 70 Q 60 80 66 70" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" fill={NOSE} fillOpacity="0.15"/>;
    }
    // happy default — small smile
    return <path d="M 56 72 Q 60 76 64 72" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" fill="none"/>;
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      {/* ears — back layer */}
      <path d="M 18 30 L 30 12 L 42 32 Z" fill={FUR}/>
      <path d="M 102 30 L 90 12 L 78 32 Z" fill={FUR}/>
      <path d="M 24 28 L 30 18 L 36 30 Z" fill={CREAM}/>
      <path d="M 96 28 L 90 18 L 84 30 Z" fill={CREAM}/>

      {/* head */}
      <circle cx="60" cy="58" r="36" fill={FUR}/>

      {/* cheek cream patches */}
      <ellipse cx="40" cy="68" rx="14" ry="12" fill={CREAM}/>
      <ellipse cx="80" cy="68" rx="14" ry="12" fill={CREAM}/>
      {/* chin cream */}
      <ellipse cx="60" cy="82" rx="20" ry="10" fill={CREAM}/>

      {/* forehead darker tuft */}
      <path d="M 46 30 Q 60 26 74 30 Q 70 40 60 40 Q 50 40 46 30 Z" fill={FUR_DARK} opacity="0.5"/>

      {/* blushes */}
      <circle cx="34" cy="70" r="4.5" fill={BLUSH} opacity="0.7"/>
      <circle cx="86" cy="70" r="4.5" fill={BLUSH} opacity="0.7"/>

      {/* eyes */}
      {eyes}

      {/* nose */}
      <ellipse cx="60" cy="66" rx="4" ry="3" fill={NOSE}/>

      {/* mouth */}
      {mouth}

      {/* accessories overlay (drawn last so they sit on top) */}
      {accessory === 'bow' && (
        <g transform="translate(28, 12)">
          <path d="M 0 4 L 6 0 L 6 8 Z" fill="#FF8FAB"/>
          <path d="M 12 4 L 6 0 L 6 8 Z" fill="#FF8FAB"/>
          <circle cx="6" cy="4" r="2.5" fill="#FFC2D1"/>
        </g>
      )}
      {accessory === 'flower' && (
        <g transform="translate(82, 14)">
          {[0, 72, 144, 216, 288].map(deg => (
            <ellipse key={deg} cx="0" cy="-4" rx="3" ry="4.5" fill="#FFD66B"
              transform={`rotate(${deg})`}/>
          ))}
          <circle r="2.5" fill="#F08A8A"/>
        </g>
      )}
      {accessory === 'scarf' && (
        <g>
          <path d="M 28 88 Q 60 96 92 88 L 92 96 Q 60 104 28 96 Z" fill="#A8D8F0"/>
          <path d="M 28 88 Q 60 96 92 88 L 92 96 Q 60 104 28 96 Z" fill="none" stroke="#7FBEE0" strokeWidth="1.2" strokeDasharray="3,2"/>
          <path d="M 78 96 L 92 110 L 86 112 L 76 100 Z" fill="#A8D8F0"/>
        </g>
      )}
      {accessory === 'glasses' && (
        <g fill="none" stroke={NOSE} strokeWidth="2">
          <circle cx="44" cy="55" r="9" fill="#fff" fillOpacity="0.3"/>
          <circle cx="76" cy="55" r="9" fill="#fff" fillOpacity="0.3"/>
          <path d="M 53 55 L 67 55"/>
        </g>
      )}
      {accessory === 'crown' && (
        <g transform="translate(45, 6)">
          <path d="M 0 12 L 5 0 L 12 8 L 19 0 L 24 8 L 30 0 L 30 16 L 0 16 Z"
            fill="#FFD66B" stroke="#E0A848" strokeWidth="1"/>
          <circle cx="15" cy="13" r="1.6" fill="#F08A8A"/>
        </g>
      )}
    </svg>
  );
}

// tiny sticker fox (just face, for chips/badges)
function FoxMini({ size = 28 }) {
  const FUR = '#F5A968';
  const CREAM = '#FFF1E0';
  const NOSE = '#3D2820';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path d="M 4 9 L 8 3 L 12 10 Z" fill={FUR}/>
      <path d="M 28 9 L 24 3 L 20 10 Z" fill={FUR}/>
      <circle cx="16" cy="17" r="11" fill={FUR}/>
      <ellipse cx="11" cy="20" rx="4" ry="3.5" fill={CREAM}/>
      <ellipse cx="21" cy="20" rx="4" ry="3.5" fill={CREAM}/>
      <ellipse cx="16" cy="24" rx="6" ry="3" fill={CREAM}/>
      <circle cx="12.5" cy="17" r="1.3" fill={NOSE}/>
      <circle cx="19.5" cy="17" r="1.3" fill={NOSE}/>
      <ellipse cx="16" cy="20.5" rx="1.2" ry="1" fill={NOSE}/>
    </svg>
  );
}

Object.assign(window, { Fox, FoxMini });
