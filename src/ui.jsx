import { useEffect } from 'react';

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="btn ghost small" onClick={onClose}>Close</button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function StatusPill({ value }) {
  const met = value === 'covered' || value === 'pass' || value === true;
  const partial = value === 'partial';
  const label = value === true ? 'Yes' : value === false ? 'No' : value;
  return <span className={`pill ${met ? 'met' : partial ? 'partial' : 'gap'}`}>{label}</span>;
}

export function InheritPanel({ report, leftTitle = 'Inherited controls', rightTitle = 'Remaining gaps' }) {
  if (!report) return null;
  return (
    <div className="inherit-grid">
      <section data-testid="inherited-controls">
        <h3>{leftTitle} <span className="count">{report.inherited.length}</span></h3>
        {report.inherited.length === 0 && <p className="quiet">Nothing is inherited yet.</p>}
        <ul className="check-list">
          {report.inherited.map((item) => (
            <li key={`${item.framework}-${item.text}`}>
              <span className="kicker">{item.framework}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
        {report.notApplicable.length > 0 && (
          <div className="na-block">
            <h4>Not applicable</h4>
            <ul className="check-list">
              {report.notApplicable.map((item) => (
                <li key={`${item.framework}-${item.text}`}>
                  <span className="kicker">{item.framework}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section data-testid="remaining-gaps">
        <h3>{rightTitle} <span className="count">{report.gaps.length}</span></h3>
        {report.gaps.length === 0 ? (
          <p className="clear-gap">No remaining gaps. Every applicable check on this composition is inherited from approved blocks.</p>
        ) : (
          <ul className="check-list gaps">
            {report.gaps.map((item) => (
              <li key={`${item.framework}-${item.text}`}>
                <span className="kicker">{item.framework}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function DaysNote() {
  return (
    <p className="days-note">
      Review covers the remaining gaps only. Inherited controls were accepted when the block was approved, which is why a composition review takes days, not weeks.
    </p>
  );
}

export function BlockTags({ block }) {
  return (
    <div className="tag-row">
      {(block.isa95 || []).map((level) => (
        <span key={level} className="pill level">{levelLabel(level)}</span>
      ))}
      <span className={`pill ${block.cui ? 'cui' : 'met'}`}>{block.cui ? 'CUI' : 'Not CUI'}</span>
      {block.cui && <span className="pill">AC</span>}
      {block.cui && <span className="pill">AU</span>}
      {block.ai && <span className="pill partial">AI · {block.ai.risk}</span>}
      <span className={`pill ${block.status === 'approved' ? 'met' : block.status === 'in-review' ? 'partial' : 'gap'}`}>
        {block.status === 'in-review' ? 'In review' : block.status === 'approved' ? 'Approved' : 'Rejected'}
      </span>
    </div>
  );
}

const LEVEL_LABEL = { L0: 'L0 Shop floor', L1: 'L1 Control', L2: 'L2 Control', L3: 'L3 MES', L4: 'L4 ERP' };

export function levelLabel(level) {
  return LEVEL_LABEL[level] || level;
}
