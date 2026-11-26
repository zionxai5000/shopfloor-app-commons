import { useEffect, useState } from 'react';
import { DISCLAIMER } from './model.js';
import { useDemo } from './demo-context.jsx';
import { Road } from './views/Road.jsx';
import { Catalog } from './views/Catalog.jsx';
import { Builder } from './views/Builder.jsx';
import { Runner } from './views/Runner.jsx';
import { Registry } from './views/Registry.jsx';
import { Governance } from './views/Governance.jsx';
import { Standards } from './views/Standards.jsx';
import { About } from './views/About.jsx';
import { TOUR_LENGTH, Tour } from './views/Tour.jsx';

const NAV = [
  ['road', 'Road'],
  ['catalog', 'Catalog'],
  ['builder', 'Builder'],
  ['registry', 'Registry'],
  ['governance', 'Governance'],
  ['standards', 'Standards'],
  ['about', 'About'],
];

const TOUR_ROUTE = [
  { view: 'builder' },
  { view: 'builder' },
  { view: 'app', appId: 'app-kit-gate' },
  { view: 'registry' },
  { view: 'governance' },
];

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [view, id] = raw.split('/');
  if (view === 'app' && id) return { view: 'app', appId: decodeURIComponent(id) };
  if (NAV.some(([key]) => key === view)) return { view };
  return { view: 'road' };
}

export function App() {
  const demo = useDemo();
  const [route, setRoute] = useState(parseHash);
  const [tour, setTour] = useState(null);
  const [armReset, setArmReset] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!tour) return;
    const target = TOUR_ROUTE[tour.step];
    const next = target.view === 'app' ? `#/app/${target.appId}` : `#/${target.view}`;
    if (window.location.hash !== next) window.location.hash = next;
  }, [tour]);

  useEffect(() => {
    const label = route.view === 'app' ? 'App' : NAV.find(([key]) => key === route.view)?.[1] || 'Commons';
    document.title = `Commons · ${label}`;
  }, [route]);

  useEffect(() => {
    if (!tour) window.scrollTo(0, 0);
  }, [route]);

  function go(view, appId) {
    const next = view === 'app' ? `#/app/${appId}` : `#/${view}`;
    if (window.location.hash === next) setRoute(parseHash());
    else window.location.hash = next;
  }

  function startTour() {
    setArmReset(false);
    setTour({ step: 0, nonce: Date.now() });
  }

  function nextTour() {
    setTour((current) => {
      if (!current) return current;
      if (current.step >= TOUR_LENGTH - 1) return null;
      return { step: current.step + 1, nonce: Date.now() };
    });
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#content">Skip to main content</a>
      <div className="sticky">
        <header className="topbar">
          <a className="brand" href="#/road" onClick={(event) => { event.preventDefault(); go('road'); }}>
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <strong>Commons</strong>
              <em>Shop-floor apps</em>
            </span>
          </a>
          <nav className="nav" aria-label="Primary">
            {NAV.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={route.view === key ? 'on' : ''}
                data-testid={`nav-${key}`}
                onClick={() => go(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="actions">
            <button type="button" className="btn small" onClick={startTour} data-testid="start-tour">Demo tour</button>
            <button
              type="button"
              className="btn ghost small"
              data-testid="reset"
              onClick={() => {
                if (!armReset) {
                  setArmReset(true);
                  return;
                }
                setTour(null);
                setArmReset(false);
                demo.reset();
                go('road');
              }}
            >
              {armReset ? 'Confirm reset' : 'Reset demo'}
            </button>
          </div>
        </header>
        <div className="disclaimer" role="status" data-testid="disclaimer">{DISCLAIMER}</div>
      </div>

      <main id="content" tabIndex={-1}>
        {route.view === 'road' && <Road onOpenApp={(id) => go('app', id)} />}
        {route.view === 'catalog' && <Catalog />}
        {route.view === 'builder' && (
          <Builder
            tourStep={tour ? tour.step : -1}
            tourNonce={tour?.nonce || 0}
            onOpen={(id) => go('app', id)}
          />
        )}
        {route.view === 'registry' && <Registry onOpen={(id) => go('app', id)} />}
        {route.view === 'governance' && <Governance />}
        {route.view === 'standards' && <Standards />}
        {route.view === 'about' && <About onTour={startTour} />}
        {route.view === 'app' && <Runner appId={route.appId} onMissing={() => go('registry')} />}
      </main>
      <footer className="site-foot">{DISCLAIMER}. Prototype for a walkthrough. Standards tags are illustrative, not a compliance certification.</footer>
      {tour && (
        <Tour
          step={tour.step}
          routeKey={`${route.view}:${route.appId || ''}`}
          onNext={nextTour}
          onBack={() => setTour((current) => current && { step: Math.max(0, current.step - 1), nonce: Date.now() })}
          onClose={() => setTour(null)}
        />
      )}
    </div>
  );
}
