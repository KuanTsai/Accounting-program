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

function FoxMini({ size = 28 }) {
  return (
    <img src="icons/icon-192.png" width={size} height={size} draggable={false}
      style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}/>
  );
}

Object.assign(window, { Fox, FoxMini });
