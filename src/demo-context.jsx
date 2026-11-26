import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  PERSONA,
  approveBlockRecord,
  composeBlock,
  formatNow,
  promotionReadiness,
  rejectBlockRecord,
  stationById,
  signatureOf,
} from './model.js';
import { freshState, loadState, saveState } from './storage.js';

const DemoContext = createContext(null);
const BUMP_KEY = 'commons.bumped';

function prepend(logs, entry) {
  return [entry, ...logs].slice(0, 40);
}

function entry(message) {
  return {
    id: `L-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: formatNow(),
    message,
  };
}

export function DemoProvider({ children }) {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const api = useMemo(() => ({
    state,
    persona: PERSONA,
    reset() {
      sessionStorage.removeItem(BUMP_KEY);
      setState(freshState());
    },
    setCheck(jobId, dim, value) {
      setState((current) => {
        const jobs = current.jobs.map((job) => (
          job.id === jobId ? { ...job, checks: { ...job.checks, [dim]: value } } : job
        ));
        const job = jobs.find((item) => item.id === jobId);
        const text = value ? job.detail[dim].ok : job.detail[dim].bad;
        const message = `${PERSONA.name} ${value ? 'confirmed' : 'cleared'} ${dim} on ${jobId}: ${text}`;
        return { ...current, jobs, logs: prepend(current.logs, entry(message)) };
      });
    },
    addFinding(finding) {
      const item = { ...finding, id: `F-${Date.now().toString(36)}`, status: 'open' };
      setState((current) => ({
        ...current,
        findings: [item, ...current.findings],
        logs: prepend(current.logs, entry(`${PERSONA.name} logged a ${finding.severity.toLowerCase()} finding for ${finding.owner}, due ${finding.due}.`)),
      }));
    },
    setFindingStatus(id, status) {
      setState((current) => ({
        ...current,
        findings: current.findings.map((finding) => (finding.id === id ? { ...finding, status } : finding)),
      }));
    },
    setInspection(id, value) {
      setState((current) => ({
        ...current,
        inspection: { ...current.inspection, [id]: value },
      }));
    },
    setScheduleHours(hours) {
      setState((current) => ({ ...current, scheduleHours: hours }));
    },
    ensureApp(plan) {
      let id = null;
      setState((current) => {
        const signature = signatureOf(plan.runner, plan.blockIds, plan.station);
        const found = current.apps.find((app) => (
          app.status !== 'archived' && signatureOf(app.runner, app.blockIds, app.station) === signature
        ));
        if (found) {
          id = found.id;
          return current;
        }
        const station = stationById(plan.station);
        id = `app-${Date.now().toString(36)}`;
        const created = {
          id,
          name: plan.appName,
          owner: PERSONA.name,
          station: plan.station,
          team: station.team,
          users: 1,
          weeklyUses: 0,
          status: 'active',
          lastUsedDaysAgo: 0,
          version: '0.1.0',
          blockIds: [...plan.blockIds],
          runner: plan.runner,
          parentId: null,
          origin: 'built',
          lean: plan.runner === 'station-gate' ? 'Idle minutes' : plan.runner === 'gemba' ? 'Flow' : 'First-time-right',
          leanNote: plan.prompt,
          summary: plan.prompt,
          history: [{ version: '0.1.0', at: formatNow(), actor: PERSONA.name, event: 'Built from a prompt on the road' }],
        };
        return {
          ...current,
          apps: [created, ...current.apps],
          logs: prepend(current.logs, entry(`${PERSONA.name} registered “${created.name}” at ${created.station}.`)),
        };
      });
      return id;
    },
    touchApp(appId) {
      const seen = JSON.parse(sessionStorage.getItem(BUMP_KEY) || '[]');
      if (seen.includes(appId)) return;
      sessionStorage.setItem(BUMP_KEY, JSON.stringify([...seen, appId]));
      setState((current) => {
        const app = current.apps.find((item) => item.id === appId);
        if (!app) return current;
        return {
          ...current,
          apps: current.apps.map((item) => (
            item.id === appId ? { ...item, weeklyUses: item.weeklyUses + 1, lastUsedDaysAgo: 0 } : item
          )),
          logs: prepend(current.logs, entry(`Opened ${app.name} at ${app.station}.`)),
        };
      });
    },
    publishBlock({ name, description, blockIds, sourceAppId }) {
      let createdId = null;
      setState((current) => {
        const children = blockIds.map((id) => current.blocks.find((block) => block.id === id)).filter(Boolean);
        const source = current.apps.find((app) => app.id === sourceAppId);
        const block = composeBlock(children, {
          name,
          description,
          owner: PERSONA.name,
          sourceAppId,
          sourceAppName: source?.name || 'a floor composition',
        });
        createdId = block.id;
        return {
          ...current,
          blocks: [block, ...current.blocks],
          apps: current.apps.map((app) => (
            app.id === sourceAppId
              ? {
                ...app,
                history: [{ version: app.version, at: formatNow(), actor: PERSONA.name, event: `Submitted “${name}” as a block for review` }, ...app.history],
              }
              : app
          )),
          logs: prepend(current.logs, entry(`${PERSONA.name} submitted “${name}” for review. It is not inherited until approved.`)),
        };
      });
      return createdId;
    },
    approveBlock(id) {
      setState((current) => {
        const block = current.blocks.find((item) => item.id === id);
        if (!block) return current;
        return {
          ...current,
          blocks: current.blocks.map((item) => (item.id === id ? approveBlockRecord(item, PERSONA.name) : item)),
          logs: prepend(current.logs, entry(`${PERSONA.name} approved “${block.name}”. Its tags can now be inherited.`)),
        };
      });
    },
    rejectBlock(id) {
      setState((current) => {
        const block = current.blocks.find((item) => item.id === id);
        if (!block) return current;
        return {
          ...current,
          blocks: current.blocks.map((item) => (item.id === id ? rejectBlockRecord(item, PERSONA.name) : item)),
          logs: prepend(current.logs, entry(`${PERSONA.name} rejected “${block.name}”.`)),
        };
      });
    },
    forkApp(appId, { name, owner, station }) {
      let id = null;
      setState((current) => {
        const parent = current.apps.find((app) => app.id === appId);
        if (!parent) return current;
        const home = stationById(station);
        id = `app-${Date.now().toString(36)}`;
        const child = {
          id,
          name,
          owner,
          station,
          team: home.team,
          users: 1,
          weeklyUses: 0,
          status: 'active',
          lastUsedDaysAgo: 0,
          version: '0.1.0',
          blockIds: [...parent.blockIds],
          runner: parent.runner,
          parentId: parent.id,
          origin: 'fork',
          lean: parent.lean,
          leanNote: parent.leanNote,
          summary: `Fork of ${parent.name}.`,
          history: [{ version: '0.1.0', at: formatNow(), actor: owner, event: `Forked from ${parent.name} ${parent.version}` }],
        };
        return {
          ...current,
          apps: [child, ...current.apps],
          logs: prepend(current.logs, entry(`${owner} forked “${parent.name}” to ${station}.`)),
        };
      });
      return id;
    },
    promoteApp(appId) {
      let result = null;
      setState((current) => {
        const app = current.apps.find((item) => item.id === appId);
        if (!app) return current;
        result = promotionReadiness(app, current.blocks);
        if (!result.ok || app.status === 'archived') return current;
        return {
          ...current,
          apps: current.apps.map((item) => (
            item.id === appId
              ? {
                ...item,
                status: 'promoted',
                history: [{ version: item.version, at: formatNow(), actor: PERSONA.name, event: 'Promoted. Hardened, shared, and supported.' }, ...item.history],
              }
              : item
          )),
          logs: prepend(current.logs, entry(`${PERSONA.name} promoted “${app.name}” at version ${app.version}.`)),
        };
      });
      return result;
    },
    archiveApp(id) {
      setState((current) => ({
        ...current,
        apps: current.apps.map((app) => (app.id === id ? { ...app, status: 'archived' } : app)),
        logs: prepend(current.logs, entry(`Archived “${current.apps.find((app) => app.id === id)?.name || id}”.`)),
      }));
    },
    restoreApp(id) {
      setState((current) => ({
        ...current,
        apps: current.apps.map((app) => (app.id === id ? { ...app, status: 'active' } : app)),
        logs: prepend(current.logs, entry(`Restored “${current.apps.find((app) => app.id === id)?.name || id}” to active.`)),
      }));
    },
  }), [state]);

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
