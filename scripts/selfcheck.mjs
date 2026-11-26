import {
  CERT_DISCLAIMER,
  DISCLAIMER,
  EXAMPLE_PROMPT,
  GATE_BLOCKS,
  analyzeBoard,
  assess,
  classifyDefect,
  composeBlock,
  coverage,
  gateDimensions,
  gatePlan,
  matchIntent,
  planFromModelJson,
  promotionReadiness,
  seedApps,
  seedBlocks,
  seedJobs,
  suggestArchive,
} from '../src/model.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

assert(DISCLAIMER === 'Example data, not real shipyard data', 'disclaimer text');
assert(CERT_DISCLAIMER === 'Illustrative, not a compliance certification.', 'cert disclaimer');

const blocks = seedBlocks();
const approved = blocks.filter((block) => block.status === 'approved');
assert(approved.length === 15, `expected 15 approved blocks, got ${approved.length}`);
assert(blocks.filter((block) => block.status === 'in-review').length === 1, 'in-review seed');
assert(new Set(approved.map((block) => block.category)).size === 3, 'three categories');

for (const block of approved) {
  assert(block.owner && block.version && block.history.length && block.auditTrail, `${block.id} traceability`);
  assert(block.isa95.length, `${block.id} isa95`);
  assert(!block.isa95.includes('L0') && !block.isa95.includes('L1'), `${block.id} must not write L0/L1`);
  if (block.cui) assert(block.auditTrail, `${block.id} cui audit`);
  if (block.ai) {
    for (const key of ['govern', 'map', 'measure', 'manage']) assert(block.ai.rmf[key], `${block.id} rmf ${key}`);
    for (const key of ['policy', 'impact', 'operations', 'performance']) assert(block.ai.iso42001[key], `${block.id} 42001 ${key}`);
    for (const key of ['responsible', 'equitable', 'traceable', 'reliable', 'governable']) assert(block.ai.rai[key], `${block.id} rai ${key}`);
  }
}

const plan = matchIntent(EXAMPLE_PROMPT);
assert(plan.runner === 'station-gate', 'example runner');
assert(plan.blockIds.join() === GATE_BLOCKS.join(), `example blocks ${plan.blockIds}`);
assert(plan.reasons.length === 8, 'eight reasons');
assert(matchIntent('Log gemba walk findings and turn them into backlog items with an owner and a due date').runner === 'gemba', 'gemba');
assert(matchIntent('Shift-start inspection form that can classify a defect I flag').runner === 'generic', 'inspect');
assert(matchIntent('   ') === null, 'blank prompt');
assert(gatePlan(EXAMPLE_PROMPT).blockIds.join() === plan.blockIds.join(), 'preset matches matcher');

const jobs = seedJobs().filter((job) => job.station === 'KS-04');
assert(jobs.length === 12, '12 kit jobs');
const blocked = jobs.find((job) => job.id === 'WO-4412');
assert(blocked.detail.tool.bad === 'Drill DR-114 calibration expired', 'exact gap text');
const board = analyzeBoard(jobs, gateDimensions(GATE_BLOCKS));
assert(board.heldCount === 7 && board.readyCount === 5, `board counts ${board.heldCount}/${board.readyCount}`);
assert(board.idleMinutes === 201, `idle ${board.idleMinutes}`);
assert(board.rows.find((row) => row.id === 'WO-4412').gaps[0].reason === 'Drill DR-114 calibration expired', 'row reason');
const cleared = { ...blocked, checks: { tool: true, parts: true, drawing: true, mechanic: true } };
assert(analyzeBoard([cleared], gateDimensions(GATE_BLOCKS)).readyCount === 1, 'toggle clears the gate');

const apps = seedApps();
const gate = apps.find((app) => app.id === 'app-kit-gate');
const inspect = apps.find((app) => app.id === 'app-inspect');
const gateReport = assess(gate.blockIds, blocks);
const inspectReport = assess(inspect.blockIds, blocks);
assert(gateReport.gaps.length === 0, `gate gaps ${gateReport.gaps.length}`);
assert(gateReport.inherited.some((item) => item.framework.startsWith('NIST SP 800-171')), 'cui inherited');
assert(gateReport.inherited.some((item) => item.framework === 'ISO 9001 / AS9100'), 'quality inherited');
assert(inspectReport.gaps.length > 0, 'inspect has gaps');
assert(inspectReport.gaps.some((item) => item.text.includes('Measure is partial')), 'measure gap');
assert(promotionReadiness(gate, blocks).ok, 'gate can promote');
assert(!promotionReadiness(inspect, blocks).ok, 'inspect cannot promote');
assert(suggestArchive(apps.find((app) => app.id === 'app-pipe')), 'pipe archive');
assert(suggestArchive(apps.find((app) => app.id === 'app-weld')), 'weld archive');
assert(!suggestArchive(gate), 'gate not stale');

const stats = coverage(blocks);
assert(stats.approved === 15 && stats.isa95 === 15 && stats.quality === 15, 'coverage complete');
assert(stats.ai === 4 && stats.rmf.measurePartial === 4, 'ai measure partial');
assert(stats.cui > 0, 'cui flagged');

const modelPlan = planFromModelJson({
  appName: 'Custom',
  runner: 'generic',
  blockIds: ['dc-jobs', 'not-a-block', 'Work-instruction Q&A'],
  reasons: [{ id: 'dc-jobs', why: 'Because jobs.' }],
}, blocks, 'jobs and questions');
assert(modelPlan.blockIds.includes('dc-jobs') && modelPlan.blockIds.includes('ai-qa'), 'model ids normalized');
assert(!modelPlan.blockIds.includes('not-a-block'), 'unknown dropped');

const composed = composeBlock(
  [blocks.find((block) => block.id === 'dc-jobs'), blocks.find((block) => block.id === 'ui-station')],
  { name: 'Test pattern', description: 'A test', owner: 'Casey Lin', sourceAppId: 'app-kit-gate', sourceAppName: 'Kit-Staging Release Gate' },
);
assert(composed.status === 'in-review' && composed.owner === 'Casey Lin', 'publish owner');
assert(assess([composed.id], [composed, ...blocks]).gaps.some((gap) => gap.framework === 'Catalog review'), 'unpublished not inherited');

const defect = classifyDefect('cluster of porosity on the toe');
assert(defect.title === 'Porosity', 'classifier');
const unknown = classifyDefect('the crane is late');
assert(unknown.title === 'Unclassified', 'classifier refuses');

console.log('selfcheck ok', {
  idle: board.idleMinutes,
  gateInherited: gateReport.inherited.length,
  inspectGaps: inspectReport.gaps.length,
  cui: stats.cui,
});
