let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = new AudioContextClass();
  return audioContext;
};

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const playSound = async (type: 'correct' | 'wrong' | 'complete' | 'next') => {
  if (localStorage.getItem('soundEnabled') === 'false') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context on every play attempt just in case, 
  // though it should ideally be handled by a user gesture once.
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const now = ctx.currentTime;

  if (type === 'correct') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'wrong') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'next') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'complete') {
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 }, // C5
      { freq: 659.25, time: 0.15, duration: 0.15 }, // E5
      { freq: 783.99, time: 0.3, duration: 0.15 }, // G5
      { freq: 1046.50, time: 0.45, duration: 0.6 }, // C6
    ];

    notes.forEach(note => {
      const oscNode = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscNode.type = 'triangle';
      oscNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscNode.frequency.value = note.freq;
      
      gainNode.gain.setValueAtTime(0, now + note.time);
      gainNode.gain.linearRampToValueAtTime(0.2, now + note.time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
      
      oscNode.start(now + note.time);
      oscNode.stop(now + note.time + note.duration);
    });
  }
};
