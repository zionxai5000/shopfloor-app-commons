import { useEffect, useMemo, useState } from 'react';
import {
  DIM_LABEL,
  IDLE_MINUTES,
  INSPECTION,
  SCHEDULE,
  WAIT_PER_HELD,
  WORK_INSTRUCTIONS,
  analyzeBoard,
  answerQuestion,
  assess,
  classifyDefect,
  feedsFor,
  gateDimensions,
  shiftNote,
  stationById,
} from '../model.js';
import { useDemo } from '../demo-context.jsx';
import { InheritPanel, Modal } from '../ui.jsx';

export function Runner({ appId, onMissing }) {
  const demo = useDemo();
  const app = demo.state.apps.find((item) => item.id === appId);

  useEffect(() => {
    if (app) demo.touchApp(app.id);
  }, [appId]);

  if (!app) {
    return (
      <div className="page">
        <h1>That app is not on the road.</h1>
        <button type="button" className="btn" onClick={onMissing}>Back to the registry</button>
      </div>
    );
  }

  return (
    <div className="page">
      <AppHead app={app} />
      {app.runner === 'station-gate' && <StationBoard app={app} />}
      {app.runner === 'gemba' && <Gemba app={app} />}
      {app.runner === 'generic' && <Generic app={app} />}
    </div>
  );
}

function AppHead({ app }) {
  const { persona } = useDemo();
  const station = stationById(app.station);
  return (
    <header className="page-head">
      <p className="kicker">{app.runner === 'station-gate' ? 'Station board' : app.runner === 'gemba' ? 'Gemba log' : 'Floor app'} · v{app.version}</p>
      <h1>{app.name}</h1>
      <p className="lede">
        {app.summary} Home station {station.id} {station.name}. Opened with badge {persona.name} · {persona.badge}. Scope comes from the road, not from the app.
      </p>
      <p className="quiet">Lean signal: {app.lean}. {app.leanNote}</p>
    </header>
  );
}

function StationBoard({ app }) {
  const { state, setCheck } = useDemo();
  const [filter, setFilter] = useState('all');
  const dimensions = gateDimensions(app.blockIds);
  const jobs = state.jobs.filter((job) => job.station === app.station);
  const board = useMemo(() => analyzeBoard(jobs, dimensions), [jobs, dimensions]);
  const visible = board.rows.filter((row) => {
    if (filter === 'ready') return row.ready;
    if (filter === 'held') return !row.ready;
    return true;
  });
  const feeds = feedsFor(jobs);

  return (
    <div>
      <div className="metrics" data-tour="board">
        <article data-testid="metric-idle">
          <span>Idle minutes</span>
          <strong>{board.idleMinutes}</strong>
          <em>Waiting avoided vs no gate</em>
        </article>
        <article data-testid="metric-wait">
          <span>Wait time</span>
          <strong>{board.waitMinutes}</strong>
          <em>{board.heldCount} held × {WAIT_PER_HELD} min queue</em>
        </article>
        <article data-testid="metric-flow">
          <span>Flow</span>
          <strong>{board.readyCount} moving</strong>
          <em>{board.heldCount} held before they stop the station</em>
        </article>
        <article data-testid="metric-ftr">
          <span>First-time-right</span>
          <strong>{board.readyCount} complete</strong>
          <em>{board.heldCount} would start incomplete with no gate</em>
        </article>
      </div>
      <p className="estimate">
        Illustrative example estimate, not a measured result. No-gate baseline releases every job and the mechanic finds the gap at the station.
        The gate holds the job, so those discovery minutes are not burned. Weights: tool {IDLE_MINUTES.tool}, parts {IDLE_MINUTES.parts}, drawing {IDLE_MINUTES.drawing}, mechanic {IDLE_MINUTES.mechanic}.
      </p>
      <details className="math">
        <summary>How the idle-minute figure is built</summary>
        <ul>
          {board.dimensions.map((dim) => (
            <li key={dim}>{board.byDim[dim].count} × {DIM_LABEL[dim].toLowerCase()} × {IDLE_MINUTES[dim]} min = {board.byDim[dim].minutes}</li>
          ))}
          {board.dimensions.length === 0 && <li>This composition has no release conditions, so idle minutes stay at 0.</li>}
        </ul>
      </details>
      <div className="toolbar">
        {['all', 'held', 'ready'].map((key) => (
          <button key={key} type="button" className={`btn small ${filter === key ? 'primary' : 'ghost'}`} onClick={() => setFilter(key)}>
            {key === 'all' ? `All ${board.rows.length}` : key === 'held' ? `Not ready ${board.heldCount}` : `Ready ${board.readyCount}`}
          </button>
        ))}
      </div>
      {board.rows.length === 0 && <p className="rail-empty">No example jobs are staged at {app.station}.</p>}
      <div className="jobs">
        {visible.map((row) => (
          <article key={row.id} className={`job ${row.ready ? 'ready' : 'held'}`} data-testid={`job-${row.id}`}>
            <header>
              <div>
                <span className="mono">{row.id}</span>
                <h2>{row.title}</h2>
              </div>
              <span className={`badge ${row.ready ? 'ready' : 'held'}`}>{row.ready ? 'Ready' : 'Not ready'}</span>
            </header>
            {!row.ready && (
              <ul className="reasons">
                {row.gaps.map((gap) => <li key={gap.dim}>{gap.reason}</li>)}
              </ul>
            )}
            {row.ready && dimensions.length > 0 && <p className="ready-line">All required records confirm. The job can move.</p>}
            <div className="segs">
              {dimensions.map((dim) => (
                <button
                  key={dim}
                  type="button"
                  className={`seg ${row.checks[dim] ? 'on' : ''}`}
                  aria-pressed={row.checks[dim]}
                  data-testid={`toggle-${row.id}-${dim}`}
                  onClick={() => setCheck(row.id, dim, !row.checks[dim])}
                >
                  <span>{DIM_LABEL[dim]} · {row.checks[dim] ? 'confirmed' : 'gap'}</span>
                  <strong>{row.checks[dim] ? row.detail[dim].ok : row.detail[dim].bad}</strong>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <details className="math">
        <summary>Records this gate is reading</summary>
        <div className="onto">
          <MiniFeed title="Tools" rows={feeds.tools} />
          <MiniFeed title="Parts" rows={feeds.parts} />
          <MiniFeed title="Drawings" rows={feeds.drawings} />
          <MiniFeed title="Mechanics" rows={feeds.mechanics} />
        </div>
      </details>
      <PublishBar app={app} />
    </div>
  );
}

function MiniFeed({ title, rows }) {
  return (
    <article className="feed">
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => <li key={row.job} className={row.ok ? '' : 'bad'}>{row.text}</li>)}
      </ul>
    </article>
  );
}

function Gemba({ app }) {
  const { state, addFinding, setFindingStatus } = useDemo();
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ text: '', station: app.station, severity: 'Flow', owner: '', due: '' });
  const [error, setError] = useState('');
  const findings = state.findings.filter((finding) => showAll || finding.station === app.station);
  const open = findings.filter((finding) => finding.status === 'open');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const overdue = open.filter((finding) => finding.due < today).length;
  const quality = open.filter((finding) => finding.severity === 'Quality').length;
  const note = useMemo(() => shiftNote(state.findings, state.jobs, app.station), [state.findings, state.jobs, app.station]);

  function submit(event) {
    event.preventDefault();
    if (!form.text.trim() || !form.owner.trim() || !form.due) {
      setError('A finding needs what you saw, an owner, and a due date.');
      return;
    }
    addFinding({ ...form, text: form.text.trim(), owner: form.owner.trim() });
    setForm({ ...form, text: '', owner: '', due: '' });
    setError('');
  }

  return (
    <div data-tour="board">
      <div className="metrics">
        <article><span>Flow</span><strong>{open.length}</strong><em>Open interruptions</em></article>
        <article><span>Wait time</span><strong>{overdue}</strong><em>Past the due date</em></article>
        <article><span>First-time-right</span><strong>{quality}</strong><em>Quality findings still open</em></article>
        <article><span>Idle minutes</span><strong>—</strong><em>Counted on the release gate</em></article>
      </div>
      <div className="split-app">
        <form className="card" onSubmit={submit}>
          <h2>New backlog item</h2>
          <label className="field">What you saw
            <textarea rows={3} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} />
          </label>
          <div className="form-grid">
            <label className="field">Station
              <select value={form.station} onChange={(event) => setForm({ ...form, station: event.target.value })}>
                {['KS-04', 'KS-06', 'HB-02', 'PS-12', 'OB-01', 'WB-02'].map((id) => <option key={id}>{id}</option>)}
              </select>
            </label>
            <label className="field">Severity
              <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>
                <option>Safety</option>
                <option>Quality</option>
                <option>Flow</option>
              </select>
            </label>
            <label className="field">Owner
              <input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Name" />
            </label>
            <label className="field">Due date
              <input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} />
            </label>
          </div>
          {error && <p className="notice">{error}</p>}
          <button type="submit" className="btn primary" data-testid="add-finding">Add to the backlog</button>
        </form>
        <div className="card">
          <div className="toolbar">
            <h2>Findings</h2>
            <button type="button" className="btn ghost small" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'This station' : 'All stations'}
            </button>
          </div>
          {findings.length === 0 && <p className="quiet">No findings at this station yet. Add one, or show all stations.</p>}
          <ul className="findings">
            {findings.map((finding) => (
              <li key={finding.id} className={finding.status === 'done' ? 'done' : ''}>
                <div>
                  <span className={`badge ${finding.severity === 'Safety' ? 'held' : 'review'}`}>{finding.severity}</span>
                  <span className="mono">{finding.station}</span>
                  <p>{finding.text}</p>
                  <p className="quiet">Owner {finding.owner} · due {finding.due}</p>
                </div>
                <button type="button" className="btn small ghost" onClick={() => setFindingStatus(finding.id, finding.status === 'open' ? 'done' : 'open')}>
                  {finding.status === 'open' ? 'Mark done' : 'Reopen'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <section className="card">
        <h2>Shift note</h2>
        <p>The shift-report writer assembled this from the records. It did not call a live model. Illustrative example, not a measured handover.</p>
        <p className="note" data-testid="shift-note">{note}</p>
      </section>
      <PublishBar app={app} />
    </div>
  );
}

function Generic({ app }) {
  const { state } = useDemo();
  return (
    <div className="generic" data-tour="board">
      {app.blockIds.map((id) => <BlockPanel key={id} id={id} app={app} state={state} />)}
      <PublishBar app={app} />
    </div>
  );
}

function BlockPanel({ id, app, state }) {
  const block = state.blocks.find((item) => item.id === id);
  if (!block) return null;
  return (
    <section className="card">
      <p className="mono-label">{block.category}</p>
      <h2>{block.name}</h2>
      <PanelBody id={id} app={app} state={state} />
    </section>
  );
}

function PanelBody({ id, app, state }) {
  const demo = useDemo();
  if (id === 'ui-kpi' || id === 'dc-jobs') {
    const jobs = state.jobs.filter((job) => job.station === app.station);
    const dims = gateDimensions(app.blockIds);
    const board = analyzeBoard(jobs.length ? jobs : state.jobs.filter((job) => job.station === 'KS-04'), dims.length ? dims : ['tool', 'parts']);
    if (id === 'ui-kpi') {
      return (
        <div className="metrics compact">
          <article><span>Flow</span><strong>{board.readyCount}/{board.rows.length}</strong><em>Moving on the example board</em></article>
          <article><span>Idle minutes</span><strong>{board.idleMinutes}</strong><em>Waiting, illustrative</em></article>
          <article><span>First-time-right</span><strong>{board.readyCount}</strong><em>Complete on this slice</em></article>
        </div>
      );
    }
    const list = state.jobs.filter((job) => job.station === app.station);
    return (
      <ul className="plain">
        {(list.length ? list : state.jobs.filter((job) => job.station === 'KS-04').slice(0, 4)).map((job) => (
          <li key={job.id}><span className="mono">{job.id}</span> {job.title}</li>
        ))}
        {list.length === 0 && <li className="quiet">No example jobs at {app.station}. Showing the shape of the feed.</li>}
      </ul>
    );
  }
  if (id === 'dc-parts' || id === 'dc-tools' || id === 'dc-drawings' || id === 'dc-quals') {
    const jobs = state.jobs.filter((job) => job.station === app.station);
    const source = jobs.length ? jobs : state.jobs.filter((job) => job.station === 'KS-04');
    const feeds = feedsFor(source);
    const rows = id === 'dc-parts' ? feeds.parts : id === 'dc-tools' ? feeds.tools : id === 'dc-drawings' ? feeds.drawings : feeds.mechanics;
    return <ul className="plain">{rows.map((row) => <li key={row.job} className={row.ok ? '' : 'bad'}>{row.job}: {row.text}</li>)}</ul>;
  }
  if (id === 'ui-inspect') return <InspectForm />;
  if (id === 'ai-defect') return <DefectBox />;
  if (id === 'ai-qa') return <QuestionBox />;
  if (id === 'ai-schedule') return <ScheduleBox />;
  if (id === 'ai-shift' || id === 'ui-handover') {
    return <p className="note">{shiftNote(state.findings, state.jobs, app.station)}</p>;
  }
  if (id === 'ui-gemba') {
    const open = state.findings.filter((finding) => finding.status === 'open').length;
    return <p>{open} open findings in the shared log. Open the Gemba app to add one.</p>;
  }
  if (id === 'ui-station' || id === 'ui-exception') {
    return <p>This template is the station list. On a release-gate app it is the full board.</p>;
  }
  return <p>{demo.state.blocks.find((block) => block.id === id)?.summary}</p>;
}

function InspectForm() {
  const { state, setInspection } = useDemo();
  const done = INSPECTION.filter((item) => state.inspection[item.id]).length;
  return (
    <div>
      <p className="quiet">First-time-right: {done} of {INSPECTION.length} shift checks. Stored in this browser.</p>
      <ul className="checks">
        {INSPECTION.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={Boolean(state.inspection[item.id])} onChange={(event) => setInspection(item.id, event.target.checked)} />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DefectBox() {
  const [text, setText] = useState('Porosity along the toe of the fillet');
  const [result, setResult] = useState(null);
  return (
    <div>
      <p className="quiet">Example rules, not a live model. No match is left unclassified on purpose.</p>
      <label className="field">Description
        <textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <button type="button" className="btn small" onClick={() => setResult(classifyDefect(text))}>Classify</button>
      {result && (
        <p className="note" data-testid="defect-result"><strong>{result.title}.</strong> {result.note} <span className="quiet">({result.confidence})</span></p>
      )}
    </div>
  );
}

function QuestionBox() {
  const [wi, setWi] = useState(WORK_INSTRUCTIONS[0].id);
  const [question, setQuestion] = useState('What if the drill calibration is expired?');
  const [result, setResult] = useState(null);
  return (
    <div>
      <p className="quiet">Answers only from the selected work instruction. Example corpus, not a live model.</p>
      <label className="field">Instruction
        <select value={wi} onChange={(event) => setWi(event.target.value)}>
          {WORK_INSTRUCTIONS.map((item) => <option key={item.id} value={item.id}>{item.id} rev {item.rev} · {item.title}</option>)}
        </select>
      </label>
      <label className="field">Question
        <input value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <button type="button" className="btn small" onClick={() => setResult(answerQuestion(question, wi))}>Ask</button>
      {result && <p className="note"><span className="mono">{result.wi.id} rev {result.wi.rev}.</span> {result.text}</p>}
    </div>
  );
}

function ScheduleBox() {
  const { state, setScheduleHours } = useDemo();
  return (
    <div>
      <label className="field">Crane delay, hours: {state.scheduleHours}
        <input type="range" min="0" max="8" value={state.scheduleHours} onChange={(event) => setScheduleHours(Number(event.target.value))} />
      </label>
      <ul className="plain">
        {SCHEDULE.map((job) => {
          const slips = state.scheduleHours > job.slack;
          return <li key={job.id} className={slips ? 'bad' : ''}>{job.id} {job.title} · slack {job.slack}h · {slips ? 'Slips past the example shift window' : 'Still inside the window'}</li>;
        })}
      </ul>
      <p className="quiet">Illustrative slack. The slider does not write the plan.</p>
    </div>
  );
}

function PublishBar({ app }) {
  const { state, ensureApp, publishBlock } = useDemo();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${app.name} pattern`);
  const [about, setAbout] = useState(app.summary);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const report = useMemo(() => assess(app.blockIds, state.blocks), [app.blockIds, state.blocks]);

  function submit(event) {
    event.preventDefault();
    if (app.blockIds.length < 2) {
      setError('Combine at least two blocks before publishing.');
      return;
    }
    if (!name.trim() || !about.trim()) {
      setError('Name the block and say what it does.');
      return;
    }
    const sourceId = ensureApp({
      prompt: app.summary,
      appName: app.name,
      runner: app.runner,
      blockIds: app.blockIds,
      station: app.station,
      reasons: [],
    });
    publishBlock({ name: name.trim(), description: about.trim(), blockIds: app.blockIds, sourceAppId: sourceId });
    setDone(`“${name.trim()}” is in review. You are the owner. Tags are not inherited yet.`);
    setOpen(false);
  }

  return (
    <section className="card publish-card">
      <h2>Standards on this app</h2>
      <InheritPanel report={report} />
      <div className="row-actions">
        <button type="button" className="btn" onClick={() => { setError(''); setOpen(true); }}>Publish as block</button>
      </div>
      {done && <p className="notice" role="status">{done}</p>}
      {open && (
        <Modal
          title="Publish as a block"
          onClose={() => setOpen(false)}
          footer={(
            <>
              <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" form="runner-publish" className="btn primary">Send to review</button>
            </>
          )}
        >
          <form id="runner-publish" onSubmit={submit}>
            <p>Owner will be Casey Lin. The block stays in review until IT approves it.</p>
            <label className="field">Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="field">What it does<textarea rows={3} value={about} onChange={(event) => setAbout(event.target.value)} /></label>
            {error && <p className="notice">{error}</p>}
          </form>
        </Modal>
      )}
    </section>
  );
}
