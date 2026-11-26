import { DISCLAIMER } from '../model.js';

export function About({ onTour }) {
  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">About</p>
        <h1>A commons, not another pile of one-off tools.</h1>
        <p className="lede">
          Floor teams can assemble a tool in an afternoon. Most of those tools never share a definition of a job, a tool, or a person.
          They spend tokens, they diverge, and they die when the author rotates off the station. IT still owns identity, data, and cost, but cannot see the work.
        </p>
      </header>
      <div className="about-grid">
        <section className="card">
          <h2>The road</h2>
          <p>Give the floor a catalog of approved blocks and a road those blocks already run on. Let them build. Register every app. Promote the ones that earn their keep. Archive the rest.</p>
          <p>IT reviews the composition, not a blank sheet, because the blocks already carry the checks. That is why review is days, not weeks.</p>
        </section>
        <section className="card">
          <h2>What promote means</h2>
          <p>Promoted means hardened, shared, and supported. The gate is an owner, a version, an audit trail, and inherited checks with nothing left open. It is a workflow in this prototype, not a certificate.</p>
        </section>
      </div>
      <section className="diagram-wrap">
        <h2>How a prompt becomes a supported app</h2>
        <Architecture />
      </section>
      <section className="card">
        <h2>How to walk it in five minutes</h2>
        <ol className="tour-list">
          <li>Prompt. A lead types the job, or picks the kit-staging preset.</li>
          <li>Blocks snap together, each with a reason, and the inherited controls roll up.</li>
          <li>The gate runs. A job turns ready only when every required record confirms.</li>
          <li>The registry shows the fork, the promote gate, and anything quiet for 30 days.</li>
          <li>IT sees spend, the queue, and checks inherited versus new checks needed.</li>
        </ol>
        <button type="button" className="btn primary" onClick={onTour}>Start the demo tour</button>
      </section>
      <p className="quiet">{DISCLAIMER}. Standards tags are illustrative, not a compliance certification. No server, no account, and nothing here is a shipyard system of record.</p>
    </div>
  );
}

function Architecture() {
  return (
    <svg className="diagram" viewBox="0 0 920 460" role="img" aria-labelledby="arch-title arch-desc">
      <title id="arch-title">Architecture of the shop-floor app commons</title>
      <desc id="arch-desc">
        A floor prompt is matched to approved blocks that already carry standards. The app runs on a paved road of identity, ontology, models, and logging. The registry then promotes or archives it. IT reviews inherited checks against new checks.
      </desc>
      <rect x="20" y="24" width="170" height="78" rx="10" className="d-box" />
      <text x="105" y="54" textAnchor="middle" className="d-title">Floor prompt</text>
      <text x="105" y="76" textAnchor="middle" className="d-sub">or a preset</text>
      <rect x="230" y="24" width="200" height="78" rx="10" className="d-box" />
      <text x="330" y="50" textAnchor="middle" className="d-title">Approved blocks</text>
      <text x="330" y="72" textAnchor="middle" className="d-sub">standards travel with them</text>
      <rect x="470" y="24" width="190" height="78" rx="10" className="d-box" />
      <text x="565" y="50" textAnchor="middle" className="d-title">App runs</text>
      <text x="565" y="72" textAnchor="middle" className="d-sub">on the paved road</text>
      <rect x="700" y="24" width="190" height="78" rx="10" className="d-box" />
      <text x="795" y="50" textAnchor="middle" className="d-title">Registry</text>
      <text x="795" y="72" textAnchor="middle" className="d-sub">fork · promote · archive</text>
      <path d="M190 63 H230 M430 63 H470 M660 63 H700" className="d-line" />
      <rect x="20" y="150" width="880" height="150" rx="12" className="d-road" />
      <text x="40" y="178" className="d-title">Paved road, owned by IT</text>
      <g>
        {['Identity', 'Ontology', 'Models & tokens', 'Logging & cost'].map((label, index) => (
          <g key={label} transform={`translate(${40 + index * 215}, 200)`}>
            <rect width="200" height="70" rx="8" className="d-layer" />
            <text x="100" y="42" textAnchor="middle" className="d-sub">{label}</text>
          </g>
        ))}
      </g>
      <rect x="20" y="330" width="430" height="100" rx="12" className="d-box" />
      <text x="40" y="362" className="d-title">Checks inherited</text>
      <text x="40" y="388" className="d-sub">Accepted when the block was approved.</text>
      <text x="40" y="408" className="d-sub">Review does not reopen them.</text>
      <rect x="470" y="330" width="430" height="100" rx="12" className="d-gap" />
      <text x="490" y="362" className="d-title">New checks needed</text>
      <text x="490" y="388" className="d-sub">The only items a reviewer opens.</text>
      <text x="490" y="408" className="d-sub">That is why review is days, not weeks.</text>
    </svg>
  );
}
