import { CERT_DISCLAIMER, FRAMEWORKS, ISA95, coverage } from '../model.js';
import { useDemo } from '../demo-context.jsx';
import { StatusPill, levelLabel } from '../ui.jsx';

export function Standards() {
  const { state } = useDemo();
  const stats = coverage(state.blocks);
  const visible = state.blocks.filter((block) => block.status !== 'rejected');

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Standards</p>
        <h1>The catalog carries the frameworks. Apps inherit them.</h1>
        <aside className="cert-banner" data-testid="standards-disclaimer">
          <strong>{CERT_DISCLAIMER}</strong>
          <p>These tags show how a catalog would carry standards into an app. They are not an assessment, an accreditation, or evidence that a control is implemented.</p>
        </aside>
      </header>

      <div className="frameworks">
        {FRAMEWORKS.map((framework) => (
          <article key={framework.id} className="framework">
            <h2>{framework.name}</h2>
            <p>{framework.line}</p>
          </article>
        ))}
      </div>

      <section className="coverage">
        <h2>Coverage across the approved catalog</h2>
        <div className="metrics">
          <article><span>ISA-95 assigned</span><strong>{stats.isa95}/{stats.approved}</strong><em>L0 shop floor through L4 ERP</em></article>
          <article><span>Quality traceability</span><strong>{stats.quality}/{stats.approved}</strong><em>ISO 9001 / AS9100 fields</em></article>
          <article><span>CUI flagged</span><strong>{stats.cui}</strong><em>Each carries AC and AU</em></article>
          <article><span>AI blocks</span><strong>{stats.ai}</strong><em>Measure partial on {stats.rmf.measurePartial}</em></article>
        </div>
        <ul className="plain coverage-notes">
          <li>ISA-95: {Object.values(ISA95).map((level) => level.short).join(' · ')}. AI blocks sit at L3 or L4. None are approved to write L0 or L1 ({stats.noControlWrite} exceptions).</li>
          <li>NIST AI RMF on {stats.ai} AI blocks: Govern {stats.rmf.govern}/{stats.ai}, Map {stats.rmf.map}/{stats.ai}, Measure {stats.rmf.measure}/{stats.ai} covered, Manage {stats.rmf.manage}/{stats.ai}. Measure stays partial until there is an error rate.</li>
          <li>ISO/IEC 42001: policy {stats.iso42001.policy}/{stats.ai}, impact {stats.iso42001.impact}/{stats.ai}, operations {stats.iso42001.operations}/{stats.ai}, performance evaluation {stats.iso42001.performance}/{stats.ai} covered ({stats.iso42001.performancePartial} partial).</li>
          <li>DoD Responsible AI passes: Responsible {stats.rai.responsible}/{stats.ai}, Equitable {stats.rai.equitable}/{stats.ai}, Traceable {stats.rai.traceable}/{stats.ai}, Reliable {stats.rai.reliable}/{stats.ai}, Governable {stats.rai.governable}/{stats.ai}.</li>
          <li>{stats.inReview} block{stats.inReview === 1 ? ' is' : 's are'} in review and {stats.inReview === 1 ? 'is' : 'are'} not part of the inherited coverage until approved.</li>
        </ul>
      </section>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Status</th>
              <th>ISA-95</th>
              <th>CUI</th>
              <th>AC / AU</th>
              <th>Audit</th>
              <th>AI RMF</th>
              <th>42001</th>
              <th>Responsible AI</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((block) => (
              <tr key={block.id}>
                <td>
                  <strong>{block.name}</strong>
                  <div className="quiet">{block.owner} · v{block.version}</div>
                </td>
                <td>{block.status === 'in-review' ? 'In review' : 'Approved'}</td>
                <td>{(block.isa95 || []).map(levelLabel).join(', ')}</td>
                <td>{block.cui ? 'Yes' : 'No'}</td>
                <td>{block.cui ? 'Access Control, Audit & Accountability' : '—'}</td>
                <td>{block.auditTrail ? 'On' : 'Off'}</td>
                <td>{block.ai ? <Rmf block={block} /> : '—'}</td>
                <td>{block.ai ? <Iso block={block} /> : '—'}</td>
                <td>{block.ai ? <Rai block={block} /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Rmf({ block }) {
  return (
    <span className="mini-pills">
      G <StatusPill value={block.ai.rmf.govern} /> M <StatusPill value={block.ai.rmf.map} /> Me <StatusPill value={block.ai.rmf.measure} /> Mg <StatusPill value={block.ai.rmf.manage} />
    </span>
  );
}

function Iso({ block }) {
  return (
    <span className="mini-pills">
      <StatusPill value={block.ai.iso42001.performance} />
    </span>
  );
}

function Rai({ block }) {
  const rai = block.ai.rai;
  const partials = Object.entries(rai).filter(([, value]) => value !== 'pass').map(([key]) => key);
  return <span>{partials.length ? `Partial: ${partials.join(', ')}` : 'All five pass'}</span>;
}
