import { useState } from 'react';
import {
  EXAMPLE_TOKEN_RATE,
  MODELS,
  PEOPLE,
  STATIONS,
  appTokens,
  exampleCost,
  feedsFor,
  teamSpend,
} from '../model.js';
import { useDemo } from '../demo-context.jsx';

const LAYERS = [
  {
    id: 'identity',
    name: 'Identity and security',
    line: 'Every app runs as the badge on the road. An app does not pick its own user.',
  },
  {
    id: 'data',
    name: 'Governed data',
    line: 'People, tools, materials, parts, jobs, and stations are one ontology. Apps read it. They do not copy it.',
  },
  {
    id: 'models',
    name: 'Models and token budgets',
    line: 'Patterns call a named model. Spend is metered to the team, not hidden in a side account.',
  },
  {
    id: 'logging',
    name: 'Logging and cost',
    line: 'Reads, releases, and submissions are logged. Cost is an example rate so IT can see the shape of the bill.',
  },
];

export function Road({ onOpenApp }) {
  const { state, persona } = useDemo();
  const [open, setOpen] = useState('identity');
  const spend = teamSpend(state.apps, state.blocks);
  const tokens = state.apps.filter((app) => app.status !== 'archived').reduce((sum, app) => sum + appTokens(app, state.blocks).week, 0);
  const jobs = state.jobs.filter((job) => job.station === persona.station);
  const feeds = feedsFor(jobs);
  const expired = feeds.tools.filter((tool) => !tool.ok).length;
  const short = feeds.parts.filter((part) => !part.ok).length;

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Paved road</p>
        <h1>Every floor app runs on a road IT owns.</h1>
        <p className="lede">
          Floor teams will build tools. The choice is whether they build on a road you can see, or in a side channel you cannot.
          Commons is that road: identity, a shared ontology, metered models, and a log. Approved blocks already carry the standards, so a new app inherits them.
        </p>
      </header>

      <section className="road-apps">
        <div className="section-label">Apps on this road</div>
        <div className="chip-row">
          {state.apps.map((app) => (
            <button key={app.id} type="button" className={`chip ${app.status}`} onClick={() => onOpenApp(app.id)}>
              <strong>{app.name}</strong>
              <span>{app.station} · {app.status}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="stack">
        {LAYERS.map((layer) => (
          <section key={layer.id} className={`layer ${open === layer.id ? 'open' : ''}`}>
            <button type="button" className="layer-hit" aria-expanded={open === layer.id} onClick={() => setOpen(layer.id)}>
              <span className="layer-index">0{LAYERS.indexOf(layer) + 1}</span>
              <span>
                <strong>{layer.name}</strong>
                <em>{layer.line}</em>
              </span>
            </button>
            {open === layer.id && (
              <div className="layer-body">
                {layer.id === 'identity' && (
                  <div className="split">
                    <div>
                      <p className="mono-label">Badge in this demo</p>
                      <p className="identity-name">{persona.name}</p>
                      <p>{persona.role} · {persona.badge} · {persona.station} · {persona.team}</p>
                      <ul className="plain">
                        <li>Can build from approved blocks and submit a new block for review.</li>
                        <li>Cannot approve their own block, change the ontology, or turn off the log.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="mono-label">Stations in scope</p>
                      <ul className="plain">
                        {STATIONS.map((station) => (
                          <li key={station.id}><span className="mono">{station.id}</span> {station.name}, {station.bay} · {station.team}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {layer.id === 'data' && (
                  <div>
                    <p className="quiet">These are the same records the release gate reads. Toggle a gap on the gate and the tool or kit status here moves with it.</p>
                    <div className="onto">
                      <Feed title="People" items={PEOPLE.map((person) => `${person.name} · ${person.qual}${person.current ? '' : ' · lapsed'}`)} />
                      <Feed title={`Tools at ${persona.station}`} items={feeds.tools.map((tool) => `${tool.job} · ${tool.text}`)} />
                      <Feed title="Materials and parts" items={feeds.parts.map((part) => `${part.job} · ${part.text}`)} />
                      <Feed title="Jobs" items={jobs.map((job) => `${job.id} · ${job.title}`)} />
                      <Feed title="Stations" items={STATIONS.map((station) => `${station.id} · ${station.name}`)} />
                      <Feed title="Drawings" items={feeds.drawings.map((drawing) => `${drawing.job} · ${drawing.text}`)} />
                    </div>
                    <p className="quiet">{expired} tools expired and {short} kits short at {persona.station}, from the live example jobs.</p>
                  </div>
                )}
                {layer.id === 'models' && (
                  <div>
                    <div className="model-list">
                      {MODELS.map((model) => (
                        <article key={model.id} className="mini">
                          <h3>{model.name}</h3>
                          <p>{model.use}</p>
                        </article>
                      ))}
                    </div>
                    <div className="budget-list">
                      {spend.map((team) => {
                        const pct = Math.min(100, Math.round((team.spent / team.budget) * 100));
                        return (
                          <div key={team.id} className="budget">
                            <div className="budget-top">
                              <strong>{team.id}</strong>
                              <span>{team.spent.toLocaleString()} / {team.budget.toLocaleString()} example tokens</span>
                            </div>
                            <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                            <span className="quiet">{pct}% of the example weekly budget</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="quiet">Patterns in this demo run on rules so no key is required. Token figures are example estimates of a metered call.</p>
                  </div>
                )}
                {layer.id === 'logging' && (
                  <div>
                    <p className="quiet">
                      Example rate ${EXAMPLE_TOKEN_RATE} per million tokens. Week estimate {tokens.toLocaleString()} tokens, about ${exampleCost(tokens).toFixed(2)}.
                    </p>
                    <ul className="log">
                      {state.logs.map((line) => (
                        <li key={line.id}><span className="mono">{line.at}</span> {line.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Feed({ title, items }) {
  return (
    <article className="feed">
      <h3>{title}</h3>
      <ul>
        {items.slice(0, 8).map((item) => <li key={item}>{item}</li>)}
        {items.length > 8 && <li className="quiet">+ {items.length - 8} more</li>}
      </ul>
    </article>
  );
}
