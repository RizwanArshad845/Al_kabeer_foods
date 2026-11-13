import { useEffect, useRef, useState } from 'react';

const REVEAL_AT = 0.5; // share of the coating that must be scratched away

// Paints a golden breadcrumb coating — the user rubs it off to find the prize, like biting into a cheese stick.
function paintCoating(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#F2B035');
  grad.addColorStop(0.5, '#D98A22');
  grad.addColorStop(1, '#B9661A');
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Crumbs: deterministic speckle so every card looks the same.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const crumbs = Math.round((w * h) / 140);
  for (let i = 0; i < crumbs; i++) {
    const r = rand() * 2.2 + 0.6;
    ctx.fillStyle = rand() > 0.55 ? 'rgba(255, 226, 150, 0.55)' : 'rgba(120, 60, 10, 0.35)';
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, r * (w / canvas.clientWidth || 1), 0, Math.PI * 2);
    ctx.fill();
  }

  const scale = w / (canvas.clientWidth || w);
  ctx.fillStyle = '#1F1512';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(26 * scale)}px "Baloo Bhaijaan 2", system-ui, sans-serif`;
  ctx.fillText('Scratch here', w / 2, h / 2 - 12 * scale);
  ctx.font = `600 ${Math.round(16 * scale)}px "Baloo Bhaijaan 2", system-ui, sans-serif`;
  ctx.fillText('امسح هنا', w / 2, h / 2 + 18 * scale);
}

export default function ScratchCard({ children, onReveal }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const paint = () => {
      canvas.width = Math.round(wrap.clientWidth * dpr);
      canvas.height = Math.round(wrap.clientHeight * dpr);
      paintCoating(canvas);
    };
    paint();
    // Repaint once the brand font has loaded so the label uses it.
    document.fonts?.ready.then(() => !drawing.current && moves.current === 0 && paint());
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal?.();
  };

  const scratchedShare = () => {
    const canvas = canvasRef.current;
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] === 0) clear++;
    }
    return clear / total;
  };

  const point = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const scratch = (from, to) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = (canvas.width / canvas.clientWidth) * 46;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
  };

  const onDown = (e) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    scratch(last.current, last.current);
  };
  const onMove = (e) => {
    if (!drawing.current || revealed) return;
    const p = point(e);
    scratch(last.current, p);
    last.current = p;
    if (++moves.current % 8 === 0 && scratchedShare() >= REVEAL_AT) reveal();
  };
  const onUp = () => {
    drawing.current = false;
    if (!revealed && scratchedShare() >= REVEAL_AT) reveal();
  };

  return (
    <div className={`scratch${revealed ? ' is-revealed' : ''}`}>
      <div ref={wrapRef} className="scratch-card">
        <div className="scratch-prize" aria-hidden={!revealed}>
          {children}
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-coating"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-hidden="true"
        />
      </div>
      {!revealed && (
        <button type="button" className="text-btn text-btn-dark" onClick={reveal}>
          Reveal without scratching
        </button>
      )}
    </div>
  );
}
