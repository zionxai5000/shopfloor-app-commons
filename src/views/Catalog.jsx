import { useMemo, useState } from 'react';
import { usedByCount } from '../model.js';
import { useDemo } from '../demo-context.jsx';
import { BlockTags, StatusPill, levelLabel } from '../ui.jsx';

const FILTERS = ['All', 'Data connectors', 'AI patterns', 'UI templates', 'Composed', 'In review', 'Rejected'];

function haystack(block, query) {
  const hay = `${block.name} ${block.owner} ${block.summary} ${(block.isa95 || []).join(' ')}`.toLowerCase();
  return hay.includes(query.trim().toLowerCase());
}

export function Catalog() {
  const { state } = useDemo();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const blocks = useMemo(() => state.blocks.filter((block) => {
    if (filter === 'Rejected') return block.status === 'rejected' && haystack(block, query);
    if (block.status === 'rejected') return false;
    if (filter === 'In review' && block.status !== 'in-review') return false;
    if (filter !== 'All' && filter !== 'In review' && block.category !== filter) return false;
    return haystack(block, query);
  }), [state.blocks, filter, query]);

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Block catalog</p>
        <h1>Approved blocks, with the standards already on them.</h1>
        <p className="lede">
          A floor app is a combination of these blocks. Each one has an owner, a version, and tags the app inherits: ISA-95 level, a CUI flag, quality traceability, and, for a model, the AI frameworks.
        </p>
      </header>
      <div className="toolbar">
        <div className="filters">
          {FILTERS.map((item) => (
            <button key={item} type="button" className={`btn small ${filter === item ? 'primary' : 'ghost'}`} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blocks" aria-label="Search blocks" />
      </div>
      <div className="catalog">
        {blocks.map((block) => {
          const used = usedByCount(block.id, state.apps);
          const open = openId === block.id;
          return (
            <article key={block.id} className="block-card">
              <header>
                <p className="mono-label">{block.category}</p>
                <h2>{block.name}</h2>
                <p>{block.summary}</p>
              </header>
              <BlockTags block={block} />
              <dl className="meta">
                <div><dt>Owner</dt><dd>{block.owner}</dd></div>
                <div><dt>Version</dt><dd className="mono">{block.version}</dd></div>
                <div><dt>Used by</dt><dd>{used}</dd></div>
                <div><dt>Audit trail</dt><dd>{block.auditTrail ? 'On' : 'Off'}</dd></div>
              </dl>
              <button type="button" className="btn ghost small" onClick={() => setOpenId(open ? null : block.id)} aria-expanded={open}>
                {open ? 'Hide standards' : 'Standards and history'}
              </button>
              {open && (
                <div className="block-detail">
                  <p><strong>ISA-95.</strong> {(block.isa95 || []).map(levelLabel).join(', ') || 'Unassigned'}.</p>
                  <p><strong>CUI.</strong> {block.cui ? 'Flagged. Example families inherited once approved: Access Control and Audit & Accountability.' : 'Not flagged in this example.'}</p>
                  <p><strong>ISO 9001 / AS9100.</strong> Steward {block.owner}, version {block.version}, change history below, audit trail {block.auditTrail ? 'on' : 'off'}.</p>
                  {block.ai && (
                    <>
                      <p><strong>NIST AI RMF.</strong> Risk tier {block.ai.risk}. Govern <StatusPill value={block.ai.rmf.govern} /> Map <StatusPill value={block.ai.rmf.map} /> Measure <StatusPill value={block.ai.rmf.measure} /> Manage <StatusPill value={block.ai.rmf.manage} /></p>
                      <p><strong>ISO/IEC 42001.</strong> Policy <StatusPill value={block.ai.iso42001.policy} /> Impact <StatusPill value={block.ai.iso42001.impact} /> Operations <StatusPill value={block.ai.iso42001.operations} /> Performance <StatusPill value={block.ai.iso42001.performance} /></p>
                      <p><strong>DoD Responsible AI.</strong> Responsible <StatusPill value={block.ai.rai.responsible} /> Equitable <StatusPill value={block.ai.rai.equitable} /> Traceable <StatusPill value={block.ai.rai.traceable} /> Reliable <StatusPill value={block.ai.rai.reliable} /> Governable <StatusPill value={block.ai.rai.governable} /></p>
                    </>
                  )}
                  {block.composedOf && (
                    <p><strong>Made of.</strong> {block.composedOf.map((id) => state.blocks.find((item) => item.id === id)?.name || id).join(', ')}.</p>
                  )}
                  <h3>Change history</h3>
                  <ul className="history">
                    {block.history.map((row) => (
                      <li key={`${row.version}-${row.note}`}><span className="mono">{row.version}</span> <span className="quiet">{row.date}</span> {row.note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {blocks.length === 0 && <p className="quiet">No blocks match.</p>}
    </div>
  );
}
