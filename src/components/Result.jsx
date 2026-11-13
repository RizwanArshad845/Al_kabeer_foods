import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Mustache from './Mustache.jsx';
import ScratchCard from './ScratchCard.jsx';

const BRAND_CONFETTI = ['#D7262E', '#FFC931', '#E0912F', '#FFFFFF', '#1F1512'];
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function burst() {
  if (prefersReducedMotion()) return;
  const base = { colors: BRAND_CONFETTI, disableForReducedMotion: true, zIndex: 50 };
  confetti({ ...base, particleCount: 90, spread: 75, origin: { y: 0.6 } });
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 350);
}

function Evidence({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="evidence" aria-label="What the AI saw">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Win({ result, photoUrl, onAgain }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
    burst();
  }, []);

  const onReveal = () => {
    setRevealed(true);
    burst();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.prize.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard blocked: the code stays visible to copy by hand. */
    }
  };

  return (
    <div className="result result-win">
      <div className="result-inner">
        <div className="verified">
          <img src={photoUrl} alt="Your photo" className="verified-photo" />
          <div>
            <p className="verified-label">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              Genuine pack confirmed
            </p>
            <p className="verified-name">{result.productName}</p>
          </div>
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="result-title">
          {revealed ? 'You won!' : 'Your prize is under the crumb'}
        </h1>
        <p className="result-lede">{revealed ? result.message : 'Scratch the golden card with your finger to reveal it.'}</p>

        <ScratchCard onReveal={onReveal}>
          <Mustache className="prize-stache" />
          <p className="prize-short">{result.prize.short}</p>
          <p className="prize-title">{result.prize.title}</p>
        </ScratchCard>

        <div className={`claim${revealed ? ' is-visible' : ''}`} aria-hidden={!revealed}>
          <p className="claim-label">Show this code at checkout</p>
          <div className="claim-code">
            <code>{result.prize.code}</code>
            <button type="button" className="btn btn-small" onClick={copy} tabIndex={revealed ? 0 : -1}>
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <Evidence items={result.evidence} />
          <button type="button" className="btn btn-primary btn-block" onClick={onAgain} tabIndex={revealed ? 0 : -1}>
            Scan another pack
          </button>
        </div>
      </div>
    </div>
  );
}

function Miss({ result, photoUrl, onAgain, onHome }) {
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  const isOtherAlKabeer = result.status === 'other_product';

  return (
    <div className="result result-miss">
      <div className="result-inner">
        <div className="miss-photo">
          <img src={photoUrl} alt="Your photo" />
          <img src="/products/mozzarella-sticks.png" alt="The pack to look for" className="miss-target" />
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="result-title">
          {isOtherAlKabeer ? 'Good taste, wrong pack' : 'We couldn’t find the pack'}
        </h1>
        <p className="result-lede">{result.message}</p>
        <Evidence items={result.evidence} />

        <div className="tips">
          <p className="tips-title">
            {isOtherAlKabeer
              ? 'This draw is for Al Kabeer Mozzarella Cheese Sticks 250g.'
              : 'For a clean scan:'}
          </p>
          <ul>
            <li>Show the front of the box with the Al Kabeer logo</li>
            <li>Fill most of the frame and hold steady</li>
            <li>Avoid glare from lights or windows</li>
          </ul>
        </div>

        <div className="result-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={onAgain}>
            Try again
          </button>
          <button type="button" className="text-btn text-btn-dark" onClick={onHome}>
            Back to start
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Result(props) {
  return props.result.status === 'match' && props.result.prize ? <Win {...props} /> : <Miss {...props} />;
}
