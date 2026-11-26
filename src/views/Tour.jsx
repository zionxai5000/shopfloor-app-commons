import { useEffect, useState } from 'react';

const STEPS = [
  {
    title: '1 · Start from the job',
    body: 'A lead types the question they already have, or picks a preset. Nothing is built until it is on the road.',
    selector: '[data-tour="prompt"]',
  },
  {
    title: '2 · Approved blocks lock in',
    body: 'The same words resolve the same way, and each block says why. Standards roll up with the blocks: inherited controls, and any gap still open.',
    selector: '[data-tour="rail"]',
  },
  {
    title: '3 · The app runs',
    body: 'A job is Ready only when tool, parts, drawing, and a qualified mechanic all confirm. If not, the exact gap is named. The tiles use Lean terms, and they are an example estimate.',
    selector: '[data-tour="board"]',
  },
  {
    title: '4 · Keep what works',
    body: 'The app is already registered. Fork it to the next station. Promote it when the checks pass. Archive it after 30 quiet days. Lineage keeps the forks.',
    selector: '[data-tour="registry"]',
  },
  {
    title: '5 · IT can see the floor',
    body: 'Every app, the data it touches, the token spend, and the queue. Checks inherited versus new checks needed is why a review is days, not weeks.',
    selector: '[data-tour="governance"]',
  },
];

export function Tour({ step, routeKey, onNext, onBack, onClose }) {
  const [box, setBox] = useState(null);
  const current = STEPS[step];

  useEffect(() => {
    const node = document.querySelector(current.selector);
    if (!node) {
      setBox(null);
      return undefined;
    }
    node.scrollIntoView({ block: 'center', behavior: 'auto' });
    function measure() {
      const rect = node.getBoundingClientRect();
      const top = Math.max(rect.top, 108);
      const bottom = Math.min(rect.bottom, window.innerHeight - 150);
      setBox({
        top,
        left: Math.max(8, rect.left - 8),
        width: Math.min(window.innerWidth - 16, rect.width + 16),
        height: Math.max(72, bottom - top),
      });
    }
    const timer = setTimeout(measure, 60);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [step, current.selector, routeKey]);

  const cardOnTop = box ? box.top > window.innerHeight * 0.42 : false;

  return (
    <>
      {box && <div className="tour-hole" style={box} />}
      <div className={`tour-card${cardOnTop ? ' top' : ''}`} role="dialog" aria-label="Demo tour">
        <p className="mono-label">Demo tour · {step + 1} of {STEPS.length}</p>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="dots">
          {STEPS.map((item, index) => <span key={item.title} className={index === step ? 'on' : ''} />)}
        </div>
        <div className="row-actions">
          <button type="button" className="btn ghost small" onClick={onClose}>End</button>
          <button type="button" className="btn ghost small" onClick={onBack} disabled={step === 0}>Back</button>
          <button type="button" className="btn primary small" data-testid="tour-next" onClick={onNext}>
            {step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}

export const TOUR_LENGTH = STEPS.length;
