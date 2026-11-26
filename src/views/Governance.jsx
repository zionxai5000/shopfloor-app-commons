import { useMemo, useState } from 'react';
import {
  EXAMPLE_TOKEN_RATE,
  appTokens,
  assess,
  dataTouched,
  exampleCost,
  promotionReadiness,
  suggestArchive,
  teamSpend,
} from '../model.js';
import { useDemo } from '../demo-context.jsx';
import { DaysNote, InheritPanel } from '../ui.jsx';

export function Governance() {
  const { state, approveBlock, rejectBlock } = useDemo();
  const [selectedId, setSelectedId] = useState('app-kit-gate');
  const selected = state.apps.find((app) => app.id === selectedId) || state.apps[0];
  const report = useMemo(() => (selected ? assess(selected.blockIds, state.blocks) : null), [selected, state.blocks]);
  const readiness = useMemo(() => (selected ? promotionReadiness(selected, state.blocks) : null), [selected, state.blocks]);
  const spend = teamSpend(state.apps, state.blocks);
  const queue = state.blocks.filter((block) => block.status === 'in-review');
  const promoted = state.apps.filter((app) => app.status === 'promoted').length;
  const archived = state.apps.filter((app) => app.status === 'archived').length;
  const suggested = state.apps.filter(suggestArchive).length;
  const active = state.apps.filter((app) => app.status !== 'archived').length;

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">IT governance</p>
        <h1>See every app, the data it touches, and what is left to review.</h1>
        <p className="lede">
          Corporate IT owns the road. This view is how it stays that way without becoming the team that rebuilds every tool.
        </p>
      </header>

      <div className="metrics">
        <article><span>Apps on the road</span><strong>{active}</strong><em>{promoted} promoted · {archived} archived</em></article>
        <article><span>Archive suggested</span><strong>{suggested}</strong><em>Quiet 30 days or more</em></article>
        <article><span>Blocks in review</span><strong>{queue.length}</strong><em>Not inherited until approved</em></article>
        <article><span>Promoted</span><strong>{promoted}</strong><em>Hardened, shared, supported</em></article>
      </div>

      <section className="card" data-testid="checks-compare" data-tour="governance">
        <div className="toolbar">
          <h2>Checks inherited vs. new checks needed</h2>
          <label className="field inline">
            <span className="sr">App</span>
            <select value={selected?.id} onChange={(event) => setSelectedId(event.target.value)} aria-label="App for the check comparison">
              {state.apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
            </select>
          </label>
        </div>
        <DaysNote />
        {report && <InheritPanel report={report} leftTitle="Checks inherited" rightTitle="New checks needed" />}
        {readiness && (
          <div className="promo-line">
            <h3>Promotion gate</h3>
            <p>Promotion requires an owner, a version, an audit trail, and passing inherited checks.</p>
            <ul className="inline-checks">
              {readiness.checks.map((check) => (
                <li key={check.id} className={check.met ? 'met' : 'open'}>{check.label}: {check.detail}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <h2>Token spend</h2>
      <p className="quiet">Example rate ${EXAMPLE_TOKEN_RATE} per million tokens. Patterns here run on rules; the figures estimate a metered call.</p>
      <div className="budget-list">
        {spend.map((team) => {
          const pct = Math.min(100, Math.round((team.spent / team.budget) * 100));
          return (
            <div key={team.id} className="budget">
              <div className="budget-top">
                <strong>{team.id}</strong>
                <span>{team.spent.toLocaleString()} tokens · ${exampleCost(team.spent).toFixed(2)}</span>
              </div>
              <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>App</th>
              <th>Team</th>
              <th>Data touched</th>
              <th>Blocks</th>
              <th>Tokens / week</th>
              <th>Inherited</th>
              <th>New checks</th>
            </tr>
          </thead>
          <tbody>
            {state.apps.map((app) => {
              const appReport = assess(app.blockIds, state.blocks);
              const tokens = appTokens(app, state.blocks).week;
              return (
                <tr key={app.id} className={app.id === selected?.id ? 'selected-row' : ''}>
                  <td><button type="button" className="linkish" onClick={() => setSelectedId(app.id)}>{app.name}</button></td>
                  <td>{app.team}</td>
                  <td>{dataTouched(app, state.blocks).join(', ') || '—'}</td>
                  <td>{app.blockIds.length}</td>
                  <td>{app.status === 'archived' ? '—' : tokens.toLocaleString()}</td>
                  <td>{appReport.inherited.length}</td>
                  <td>{appReport.gaps.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="card">
        <h2>Approval queue</h2>
        {queue.length === 0 && <p>No blocks are waiting. A published combination will land here.</p>}
        <ul className="queue">
          {queue.map((block) => (
            <li key={block.id}>
              <div>
                <strong>{block.name}</strong>
                <p>{block.summary}</p>
                <p className="quiet">Owner {block.owner} · v{block.version} · {(block.isa95 || []).join(', ')} · {block.cui ? 'CUI, AC and AU proposed' : 'Not CUI'}</p>
                <p className="quiet">Not inherited until you approve it.</p>
              </div>
              <div className="row-actions">
                <button type="button" className="btn small primary" data-testid={`approve-${block.id}`} onClick={() => approveBlock(block.id)}>Approve</button>
                <button type="button" className="btn small ghost" data-testid={`reject-${block.id}`} onClick={() => rejectBlock(block.id)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
