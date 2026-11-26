import { useMemo, useState } from 'react';
import { STATIONS, leanValue, promotionReadiness, suggestArchive, stationById } from '../model.js';
import { useDemo } from '../demo-context.jsx';
import { Modal } from '../ui.jsx';

export function Registry({ onOpen }) {
  const { state, forkApp, promoteApp, archiveApp, restoreApp, persona } = useDemo();
  const [forkFor, setForkFor] = useState(null);
  const [promoteFor, setPromoteFor] = useState(null);
  const [archiveFor, setArchiveFor] = useState(null);
  const [forkForm, setForkForm] = useState({ name: '', owner: persona.name, station: 'KS-06' });
  const [forkError, setForkError] = useState('');

  const forest = useMemo(() => {
    const byParent = new Map();
    state.apps.forEach((app) => {
      const key = app.parentId || 'root';
      byParent.set(key, [...(byParent.get(key) || []), app]);
    });
    const roots = state.apps.filter((app) => !app.parentId || !state.apps.some((parent) => parent.id === app.parentId));
    return { roots, byParent };
  }, [state.apps]);

  function openFork(app) {
    const other = STATIONS.find((station) => station.id !== app.station) || STATIONS[0];
    setForkForm({ name: `${app.name} · ${other.id}`, owner: persona.name, station: other.id });
    setForkError('');
    setForkFor(app);
  }

  function submitFork(event) {
    event.preventDefault();
    if (!forkForm.owner.trim() || !forkForm.name.trim()) {
      setForkError('A fork needs a name and an owner.');
      return;
    }
    const id = forkApp(forkFor.id, { name: forkForm.name.trim(), owner: forkForm.owner.trim(), station: forkForm.station });
    setForkFor(null);
    if (id) onOpen(id);
  }

  const readiness = promoteFor ? promotionReadiness(promoteFor, state.blocks) : null;

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">App registry</p>
        <h1>What gets used is visible. What sits idle is flagged.</h1>
        <p className="lede">
          Every app has an owner, a station, and a Lean value signal. Fork it to the next station. Promote it only with an owner, a version, an audit trail, and passing inherited checks. Quiet for 30 days, and archive is suggested.
        </p>
      </header>
      <div className="table-wrap" data-tour="registry">
        <table className="table">
          <thead>
            <tr>
              <th>App</th>
              <th>Owner</th>
              <th>Station</th>
              <th>Users</th>
              <th>Weekly use</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.apps.map((app) => {
              const stale = suggestArchive(app);
              return (
                <tr key={app.id} className={app.status === 'archived' ? 'muted-row' : ''}>
                  <td>
                    <button type="button" className="linkish" onClick={() => onOpen(app.id)}>{app.name}</button>
                    <div className="quiet">v{app.version}{app.parentId ? ' · fork' : ''}</div>
                  </td>
                  <td>{app.owner}</td>
                  <td className="mono">{app.station}</td>
                  <td>{app.users}</td>
                  <td>{app.weeklyUses}</td>
                  <td>
                    <strong>{app.lean}</strong>
                    <div>{leanValue(app, state)}</div>
                    <div className="quiet">{app.leanNote}</div>
                  </td>
                  <td>
                    <span className={`badge ${app.status === 'promoted' ? 'promoted' : app.status === 'archived' ? 'archived' : 'ready'}`}>{app.status}</span>
                    {stale && <div className="stale">Unused {app.lastUsedDaysAgo} days. Archive suggested.</div>}
                  </td>
                  <td>
                    <div className="row-actions">
                    <button type="button" className="btn small ghost" data-testid={`fork-${app.id}`} onClick={() => openFork(app)}>Fork</button>
                    {app.status !== 'archived' && app.status !== 'promoted' && (
                      <button type="button" className="btn small" data-testid={`promote-${app.id}`} onClick={() => setPromoteFor(app)}>Promote</button>
                    )}
                    {app.status !== 'archived' ? (
                      <button type="button" className="btn small ghost" data-testid={`archive-${app.id}`} onClick={() => setArchiveFor(app)}>Archive</button>
                    ) : (
                      <button type="button" className="btn small ghost" onClick={() => restoreApp(app.id)}>Restore</button>
                    )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="quiet">Value figures are illustrative example estimates. Lean terms: idle minutes (waiting), wait time, flow, first-time-right.</p>

      <section className="lineage">
        <h2>Lineage</h2>
        <p className="quiet">Forks stay attached to the app they came from. A published block is a contribution from the app that submitted it.</p>
        <ul className="tree">
          {forest.roots.map((app) => (
            <LineNode key={app.id} app={app} byParent={forest.byParent} blocks={state.blocks} />
          ))}
        </ul>
      </section>

      {forkFor && (
        <Modal
          title={`Fork ${forkFor.name}`}
          onClose={() => setForkFor(null)}
          footer={(
            <>
              <button type="button" className="btn ghost" onClick={() => setForkFor(null)}>Cancel</button>
              <button type="submit" form="fork-form" className="btn primary">Fork to that station</button>
            </>
          )}
        >
          <form id="fork-form" onSubmit={submitFork}>
            <p>The fork keeps the blocks, so it keeps the inherited checks. It starts at version 0.1.0 with an audit event. Promotion still needs an owner, a version, an audit trail, and passing checks.</p>
            <label className="field">App name<input value={forkForm.name} onChange={(event) => setForkForm({ ...forkForm, name: event.target.value })} /></label>
            <label className="field">Owner<input value={forkForm.owner} onChange={(event) => setForkForm({ ...forkForm, owner: event.target.value })} /></label>
            <label className="field">Station
              <select value={forkForm.station} onChange={(event) => setForkForm({ ...forkForm, station: event.target.value })}>
                {STATIONS.filter((station) => station.id !== forkFor.station).map((station) => (
                  <option key={station.id} value={station.id}>{station.id} · {station.name}</option>
                ))}
              </select>
            </label>
            {forkError && <p className="notice">{forkError}</p>}
          </form>
        </Modal>
      )}

      {promoteFor && readiness && (
        <Modal
          title={`Promote ${promoteFor.name}`}
          onClose={() => setPromoteFor(null)}
          footer={(
            <>
              <button type="button" className="btn ghost" onClick={() => setPromoteFor(null)}>Close</button>
              <button
                type="button"
                className="btn primary"
                disabled={!readiness.ok}
                data-testid="confirm-promote"
                onClick={() => {
                  promoteApp(promoteFor.id);
                  setPromoteFor(null);
                }}
              >
                Promote
              </button>
            </>
          )}
        >
          <p>Promotion requires an owner, a version, an audit trail, and passing inherited checks. It marks the app hardened, shared, and supported. This is an example workflow, not a certification.</p>
          <ul className="check-list">
            {readiness.checks.map((check) => (
              <li key={check.id}>
                <span className={`pill ${check.met ? 'met' : 'gap'}`}>{check.met ? 'Met' : 'Open'}</span>
                <p><strong>{check.label}.</strong> {check.detail}</p>
              </li>
            ))}
          </ul>
          {readiness.report.gaps.length > 0 && (
            <>
              <h3>Remaining gaps</h3>
              <ul className="plain">
                {readiness.report.gaps.map((gap) => <li key={gap.text}>{gap.framework}: {gap.text}</li>)}
              </ul>
            </>
          )}
          <h3>Audit trail</h3>
          <ul className="history">
            {promoteFor.history.map((row) => (
              <li key={`${row.at}-${row.event}`}><span className="mono">{row.version}</span> {row.at} · {row.actor} · {row.event}</li>
            ))}
          </ul>
        </Modal>
      )}

      {archiveFor && (
        <Modal
          title={`Archive ${archiveFor.name}`}
          onClose={() => setArchiveFor(null)}
          footer={(
            <>
              <button type="button" className="btn ghost" onClick={() => setArchiveFor(null)}>Cancel</button>
              <button type="button" className="btn primary" onClick={() => { archiveApp(archiveFor.id); setArchiveFor(null); }}>Archive</button>
            </>
          )}
        >
          <p>
            {suggestArchive(archiveFor)
              ? `This app has been quiet for ${archiveFor.lastUsedDaysAgo} days. Archiving takes it off the active road. You can restore it.`
              : `Archive “${archiveFor.name}” at ${stationById(archiveFor.station).name}? You can restore it later.`}
          </p>
        </Modal>
      )}
    </div>
  );
}

function LineNode({ app, byParent, blocks }) {
  const children = byParent.get(app.id) || [];
  const contributions = blocks.filter((block) => block.sourceAppId === app.id);
  return (
    <li>
      <div className="tree-card">
        <strong>{app.name}</strong>
        <span className="quiet">{app.owner} · {app.station} · {app.status}</span>
        {contributions.map((block) => (
          <span key={block.id} className="quiet">Contribution: {block.name} ({block.status})</span>
        ))}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child) => <LineNode key={child.id} app={child} byParent={byParent} blocks={blocks} />)}
        </ul>
      )}
    </li>
  );
}
