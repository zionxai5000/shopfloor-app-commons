import { useEffect, useMemo, useState } from 'react';
import { EXAMPLE_PROMPT, PRESETS, assess, blockMap, matchIntent } from '../model.js';
import { clearLlmConfig, loadLlmConfig, pickBlocks, saveLlmConfig } from '../ai.js';
import { useDemo } from '../demo-context.jsx';
import { DaysNote, InheritPanel, Modal } from '../ui.jsx';

export function Builder({ tourStep, tourNonce, onOpen }) {
  const { state, ensureApp, publishBlock } = useDemo();
  const [prompt, setPrompt] = useState('');
  const [station, setStation] = useState('KS-04');
  const [plan, setPlan] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const [llm, setLlm] = useState(() => loadLlmConfig());
  const [publishOpen, setPublishOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAbout, setDraftAbout] = useState('');
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    if (tourStep === 0 && tourNonce) {
      setPrompt('');
      setPlan(null);
      setNotice('');
      setStation('KS-04');
    }
  }, [tourStep, tourNonce]);

  useEffect(() => {
    if (tourStep !== 1 || !tourNonce) return;
    const next = { ...matchIntent(EXAMPLE_PROMPT), station: 'KS-04' };
    setStation('KS-04');
    setPrompt(EXAMPLE_PROMPT);
    setNotice('');
    setPlan(next);
  }, [tourStep, tourNonce]);

  useEffect(() => {
    if (!plan) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setRevealed(plan.blockIds.length);
      return undefined;
    }
    setRevealed(0);
    const timers = plan.blockIds.map((_, index) => setTimeout(() => setRevealed(index + 1), 380 * (index + 1)));
    return () => timers.forEach(clearTimeout);
  }, [plan]);

  const blocks = blockMap(state.blocks);
  const report = useMemo(() => (plan ? assess(plan.blockIds, state.blocks) : null), [plan, state.blocks]);

  async function assemble(nextPrompt, preset) {
    const text = (nextPrompt ?? prompt).trim();
    if (!text) {
      setNotice('Write a prompt, or start from a preset.');
      return;
    }
    setNotice('');
    if (preset) {
      setPlan({ ...preset.build(text, 'preset'), station });
      return;
    }
    if (!live) {
      setPlan({ ...matchIntent(text), station });
      return;
    }
    if (!llm.apiKey.trim()) {
      setPlan({ ...matchIntent(text), station });
      setNotice('Live AI is on, but there is no key in this tab. Showing the deterministic match instead.');
      return;
    }
    setBusy(true);
    try {
      const picked = await pickBlocks({ ...llm, prompt: text, catalog: state.blocks });
      setPlan({ ...picked, station });
      setNotice('Blocks chosen by the live model. Controls are still read from the catalog, not from the model.');
    } catch (error) {
      setPlan({ ...matchIntent(text), station });
      setNotice(`${error.message} Showing the deterministic match instead.`);
    } finally {
      setBusy(false);
    }
  }

  function openApp() {
    if (!plan) return;
    const id = ensureApp({ ...plan, station });
    onOpen(id);
  }

  function submitPublish(event) {
    event.preventDefault();
    if (!plan || plan.blockIds.length < 2) {
      setPublishError('Combine at least two blocks before publishing.');
      return;
    }
    if (!draftName.trim() || !draftAbout.trim()) {
      setPublishError('Name the block and say what it does.');
      return;
    }
    const appId = ensureApp({ ...plan, station });
    publishBlock({
      name: draftName.trim(),
      description: draftAbout.trim(),
      blockIds: plan.blockIds,
      sourceAppId: appId,
    });
    setPublishOpen(false);
    setNotice(`“${draftName.trim()}” is in the catalog as in review, and in the IT queue. Its tags are not inherited yet.`);
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Builder</p>
        <h1>Start from a preset, or from the sentence in front of you.</h1>
        <p className="lede">
          Default matching is deterministic: the same words resolve to the same blocks, and each block says why. Live AI is optional and never required for the demo.
        </p>
      </header>

      <div className="builder">
        <section className="builder-entry" data-tour="prompt">
          <h2>Presets</h2>
          <div className="preset-row">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="btn ghost"
                data-testid={`preset-${preset.id}`}
                onClick={() => {
                  setPrompt(preset.prompt);
                  assemble(preset.prompt, preset);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <h2>Or a blank prompt</h2>
          <label className="field">
            <span>What do you need at the station?</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={EXAMPLE_PROMPT}
              rows={4}
              data-testid="prompt"
            />
          </label>
          <label className="field inline">
            <span>Station</span>
            <select value={station} onChange={(event) => setStation(event.target.value)} aria-label="Station">
              {['KS-04', 'KS-06', 'HB-02', 'PS-12', 'OB-01', 'WB-02'].map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
          <div className="live-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={live}
                onChange={(event) => setLive(event.target.checked)}
                data-testid="live-ai"
              />
              <span>Live AI mode</span>
            </label>
            <span className="quiet">{live ? 'Sends the prompt to your OpenAI-compatible endpoint.' : 'Deterministic keyword match. Default.'}</span>
          </div>
          {live && (
            <div className="llm-box">
              <p>The key stays in this tab’s session storage. It is not written into the demo data and it is not in the repo.</p>
              <label className="field">Base URL
                <input value={llm.baseUrl} onChange={(event) => setLlm({ ...llm, baseUrl: event.target.value })} autoComplete="off" />
              </label>
              <label className="field">Model
                <input value={llm.model} onChange={(event) => setLlm({ ...llm, model: event.target.value })} autoComplete="off" />
              </label>
              <label className="field">API key
                <input type="password" value={llm.apiKey} onChange={(event) => setLlm({ ...llm, apiKey: event.target.value })} autoComplete="off" data-testid="api-key" />
              </label>
              <div className="row-actions">
                <button type="button" className="btn small" onClick={() => saveLlmConfig(llm)}>Keep in this tab</button>
                <button type="button" className="btn ghost small" onClick={() => { clearLlmConfig(); setLlm({ ...llm, apiKey: '' }); }}>Clear key</button>
              </div>
            </div>
          )}
          <button type="button" className="btn primary" data-testid="build" disabled={busy} onClick={() => assemble(prompt)}>
            {busy ? 'Asking the model…' : 'Build on the road'}
          </button>
          {notice && <p className="notice" role="status">{notice}</p>}
        </section>

        <section className="rail" data-tour="rail" aria-live="polite">
          {!plan && <div className="rail-empty">Approved blocks will lock in here, with the reason each one was pulled.</div>}
          {plan && (
            <>
              <header className="rail-head">
                <div>
                  <p className="mono-label">{plan.source === 'model' ? 'Live model' : plan.source === 'preset' ? 'Preset' : 'Deterministic match'}</p>
                  <h2>{plan.appName}</h2>
                </div>
                {revealed < plan.blockIds.length && (
                  <button type="button" className="btn ghost small" onClick={() => setRevealed(plan.blockIds.length)}>Skip animation</button>
                )}
              </header>
              <ol className="snaps">
                {plan.reasons.map((item, index) => {
                  const block = blocks[item.id];
                  const shown = index < revealed;
                  return (
                    <li key={item.id} className={`snap ${shown ? 'shown' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                      <div className="snap-top">
                        <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                        <strong>{block?.name || item.id}</strong>
                        <em className={item.role === 'release rule' ? 'rule' : ''}>{item.role}</em>
                      </div>
                      {shown && <p>{item.why}</p>}
                    </li>
                  );
                })}
              </ol>
              {revealed >= plan.blockIds.length && report && (
                <>
                  <DaysNote />
                  <InheritPanel report={report} />
                  <p className="quiet">Illustrative, not a compliance certification. Tags are read from the catalog.</p>
                  <div className="row-actions">
                    <button type="button" className="btn primary" data-testid="open-app" onClick={openApp}>Open the app</button>
                    <button
                      type="button"
                      className="btn"
                      data-testid="publish-block"
                      onClick={() => {
                        setDraftName(`${plan.appName} pattern`);
                        setDraftAbout(plan.prompt);
                        setPublishError('');
                        setPublishOpen(true);
                      }}
                    >
                      Publish as block
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {publishOpen && (
        <Modal
          title="Publish as a block"
          onClose={() => setPublishOpen(false)}
          footer={(
            <>
              <button type="button" className="btn ghost" onClick={() => setPublishOpen(false)}>Cancel</button>
              <button type="submit" form="publish-form" className="btn primary">Send to review</button>
            </>
          )}
        >
          <form id="publish-form" onSubmit={submitPublish}>
            <p>This combination goes to the IT queue. You are the owner. Until it is approved, none of its tags are inherited.</p>
            <label className="field">Name
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            </label>
            <label className="field">What it does
              <textarea rows={3} value={draftAbout} onChange={(event) => setDraftAbout(event.target.value)} />
            </label>
            {publishError && <p className="notice">{publishError}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}
