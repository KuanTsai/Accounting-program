// Fox mascot — PNG-based, mood and fur driven

function Fox({ mood = 'happy', size = 120, fur = 'orange', accessory = 'none' }) {
  const VALID_MOODS = ['happy', 'excited', 'sleepy', 'sad', 'celebrate', 'eating'];
  const VALID_FURS  = ['orange', 'white', 'gray', 'pink', 'black'];
  const resolvedMood = VALID_MOODS.includes(mood) ? mood : 'happy';
  const resolvedFur  = VALID_FURS.includes(fur)   ? fur  : 'orange';

  const foxSrc = `project/assets/fox/fox_${resolvedFur}_${resolvedMood}.png`;
  const accSrc = accessory && accessory !== 'none' ? `project/assets/fox/acc_${accessory}.png` : null;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <img src={foxSrc} width={size} height={size} draggable={false}
        style={{ display: 'block', objectFit: 'contain' }}/>
      {accSrc && (
        <img src={accSrc} width={size} height={size} draggable={false}
          style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}/>
      )}
    </div>
  );
}

// tiny icon fox — kept as SVG for small badge/chip use
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
