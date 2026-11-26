import { seedApps, seedBlocks, seedFindings, seedJobs, seedLogs } from './model.js';

export const STORAGE_KEY = 'commons.demo.v1';

export function freshState() {
  return {
    version: 1,
    jobs: seedJobs(),
    findings: seedFindings(),
    blocks: seedBlocks(),
    apps: seedApps(),
    inspection: {},
    scheduleHours: 3,
    logs: seedLogs(),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.jobs) || !Array.isArray(parsed.blocks)) {
      return freshState();
    }
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
