export const DISCLAIMER = 'Example data, not real shipyard data';
export const CERT_DISCLAIMER = 'Illustrative, not a compliance certification.';

export const EXAMPLE_PROMPT = 'show me which jobs at my station are missing parts or tools';

export const PERSONA = {
  name: 'Casey Lin',
  role: 'Floor lead',
  badge: 'FL-204',
  station: 'KS-04',
  team: 'Structural',
};

export const ISA95 = {
  L0: { short: 'L0 Shop floor', blurb: 'Physical process' },
  L1: { short: 'L1 Control', blurb: 'Sensing and manipulation' },
  L2: { short: 'L2 Control', blurb: 'Supervision' },
  L3: { short: 'L3 MES', blurb: 'Manufacturing operations' },
  L4: { short: 'L4 ERP', blurb: 'Business planning' },
};

export const FRAMEWORKS = [
  {
    id: 'isa95',
    name: 'ISA-95',
    line: 'L0 shop floor, L1–L2 control, L3 MES, L4 ERP — the level a block is allowed to touch.',
  },
  {
    id: 'rmf',
    name: 'NIST AI RMF',
    line: 'Govern, Map, Measure, and Manage, plus a risk tier, for every block that calls a model.',
  },
  {
    id: 'cui',
    name: 'NIST SP 800-171 / CMMC Level 2',
    line: 'An example CUI flag mapped to two control families: Access Control, and Audit & Accountability.',
  },
  {
    id: 'quality',
    name: 'ISO 9001 / AS9100',
    line: 'Quality traceability: a steward, a version, a change history, and an audit trail on the block.',
  },
  {
    id: 'iso42001',
    name: 'ISO/IEC 42001',
    line: 'An AI management system: policy, impact, operations, and performance evaluation.',
  },
  {
    id: 'rai',
    name: 'DoD Responsible AI',
    line: 'Responsible, Equitable, Traceable, Reliable, and Governable — a checklist on AI blocks.',
  },
];

export const STATIONS = [
  { id: 'KS-04', name: 'Kit staging', bay: 'Bay 4', team: 'Structural' },
  { id: 'KS-06', name: 'Kit staging', bay: 'Bay 6', team: 'Structural' },
  { id: 'HB-02', name: 'Hull block fit-up', bay: 'Block 2', team: 'Structural' },
  { id: 'PS-12', name: 'Pipe spool', bay: 'Shop 1', team: 'Pipe' },
  { id: 'OB-01', name: 'Outfit bay', bay: 'Deck 3', team: 'Outfit' },
  { id: 'WB-02', name: 'Weld booth', bay: 'Booth 2', team: 'Structural' },
];

export const TEAMS = [
  { id: 'Structural', budget: 80000 },
  { id: 'Outfit', budget: 20000 },
  { id: 'Pipe', budget: 10000 },
];

export const MODELS = [
  { id: 'reader', name: 'Instruction reader', use: 'Answers only from an approved work instruction.' },
  { id: 'pattern', name: 'Defect pattern', use: 'Sorts a description into a fixed class list.' },
  { id: 'drafter', name: 'Note drafter', use: 'Drafts a shift note from records the app already holds.' },
];

export const PEOPLE = [
  { name: 'A. Okonkwo', qual: 'Structural fit-up', current: true },
  { name: 'P. Rahman', qual: 'Structural fit-up', current: true },
  { name: 'D. Ibarra', qual: 'Pipe fit-up', current: true },
  { name: 'E. Santos', qual: 'Electrical install', current: true },
  { name: 'M. Chen', qual: 'Work instruction control', current: true },
  { name: 'R. Hale', qual: 'Station lead', current: true },
  { name: 'J. Adeyemi', qual: 'Pipe fit-up', current: true },
  { name: 'S. Novak', qual: 'Welding', current: false },
];

export const IDLE_MINUTES = { tool: 22, parts: 35, drawing: 12, mechanic: 28 };
export const WAIT_PER_HELD = 18;

export const GATE_BLOCKS = [
  'dc-jobs',
  'dc-parts',
  'dc-tools',
  'dc-drawings',
  'dc-quals',
  'ui-station',
  'ui-exception',
  'ui-kpi',
];

export const GEMBA_BLOCKS = ['ui-gemba', 'dc-jobs', 'ai-shift', 'ui-kpi'];
export const INSPECT_BLOCKS = ['ui-inspect', 'ai-defect', 'dc-quals', 'ui-kpi'];

const DIMS = [
  ['tool', 'Tool'],
  ['parts', 'Parts'],
  ['drawing', 'Drawing'],
  ['mechanic', 'Mechanic'],
];

export const DIM_LABEL = Object.fromEntries(DIMS);

function aiProfile(risk, extra = {}) {
  return {
    risk,
    rmf: { govern: 'covered', map: 'covered', measure: 'partial', manage: 'covered', ...extra.rmf },
    iso42001: { policy: 'covered', impact: 'covered', operations: 'covered', performance: 'partial', ...extra.iso42001 },
    rai: {
      responsible: 'pass',
      equitable: 'pass',
      traceable: 'pass',
      reliable: 'partial',
      governable: 'pass',
      ...extra.rai,
    },
  };
}

function block(partial) {
  return {
    status: 'approved',
    auditTrail: true,
    cui: false,
    ai: null,
    composedOf: null,
    tokens: partial.category === 'AI patterns' ? 900 : partial.category === 'Data connectors' ? 120 : 0,
    ...partial,
  };
}

export function seedBlocks() {
  return [
    block({
      id: 'dc-parts',
      name: 'Parts & inventory feed',
      category: 'Data connectors',
      owner: 'Materials desk',
      version: '3.2.0',
      summary: 'On-hand and kitted quantities for fasteners, seals, and piece parts, tied to the job.',
      isa95: ['L3', 'L4'],
      cui: true,
      touches: ['Materials', 'Parts'],
      history: [
        { version: '3.2.0', date: '2026-08-14', note: 'Shortage reason now names the bin.' },
        { version: '3.1.0', date: '2026-03-02', note: 'Every read is scoped to the station badge.' },
      ],
    }),
    block({
      id: 'dc-tools',
      name: 'Tool & calibration tracker',
      category: 'Data connectors',
      owner: 'Tool crib',
      version: '2.6.1',
      summary: 'Tool identity and calibration status. Present is not the same as calibrated.',
      isa95: ['L3'],
      cui: false,
      touches: ['Tools'],
      history: [
        { version: '2.6.1', date: '2026-07-21', note: 'Expired tools stay unavailable until the crib clears them.' },
        { version: '2.5.0', date: '2026-01-18', note: 'Calibration date is the system of record.' },
      ],
    }),
    block({
      id: 'dc-quals',
      name: 'Mechanic qualifications',
      category: 'Data connectors',
      owner: 'Workforce desk',
      version: '1.9.0',
      summary: 'Who holds a current qualification, from the people record, not a name typed into an app.',
      isa95: ['L3'],
      cui: true,
      touches: ['People'],
      history: [
        { version: '1.9.0', date: '2026-06-03', note: 'Lapsed certifications stay visible to the station lead.' },
        { version: '1.8.0', date: '2025-11-12', note: 'Qualification reads are logged to the badge.' },
      ],
    }),
    block({
      id: 'dc-jobs',
      name: 'Job / work-order feed',
      category: 'Data connectors',
      owner: 'Planning desk',
      version: '4.0.2',
      summary: 'Work orders for the station on the badge. Apps do not keep a private job list.',
      isa95: ['L3', 'L4'],
      cui: true,
      touches: ['Jobs', 'Stations'],
      history: [
        { version: '4.0.2', date: '2026-09-01', note: 'Station scope is taken from the badge, not the app.' },
        { version: '3.8.0', date: '2026-02-11', note: 'Work-order identity aligned with the planning record.' },
      ],
    }),
    block({
      id: 'dc-drawings',
      name: 'Drawings & work instructions',
      category: 'Data connectors',
      owner: 'Work instruction desk',
      version: '2.3.4',
      summary: 'The revision at the station, checked against the revision on the job.',
      isa95: ['L3'],
      cui: true,
      touches: ['Drawings'],
      history: [
        { version: '2.3.4', date: '2026-05-19', note: 'A revision mismatch is a named gap, not a warning banner.' },
        { version: '2.2.0', date: '2025-12-08', note: 'Work instructions are read-only in every app.' },
      ],
    }),
    block({
      id: 'ai-qa',
      name: 'Work-instruction Q&A',
      category: 'AI patterns',
      owner: 'Applied patterns',
      version: '1.4.0',
      summary: 'Answers a question from the approved instruction only. If the instruction is silent, it says so.',
      isa95: ['L3'],
      cui: true,
      touches: ['Drawings'],
      ai: aiProfile('moderate'),
      history: [
        { version: '1.4.0', date: '2026-04-22', note: 'Refusal when the instruction has no matching sentence.' },
        { version: '1.2.0', date: '2026-01-09', note: 'Answers cite the work-instruction id and revision.' },
      ],
    }),
    block({
      id: 'ai-defect',
      name: 'Defect classifier',
      category: 'AI patterns',
      owner: 'Applied patterns',
      version: '1.1.2',
      summary: 'Sorts a defect description into an approved class. No match goes to a person.',
      isa95: ['L3'],
      cui: true,
      touches: ['Jobs'],
      ai: aiProfile('moderate', { rai: { equitable: 'partial' } }),
      history: [
        { version: '1.1.2', date: '2026-08-02', note: 'Unclassified descriptions are routed to a person.' },
        { version: '1.0.0', date: '2026-03-16', note: 'Class list frozen to the quality desk set.' },
      ],
    }),
    block({
      id: 'ai-schedule',
      name: 'Schedule what-if',
      category: 'AI patterns',
      owner: 'Planning desk',
      version: '0.9.3',
      summary: 'Shows which jobs slip if a delay grows. It does not move the plan.',
      isa95: ['L3', 'L4'],
      cui: false,
      touches: ['Jobs'],
      ai: aiProfile('low'),
      history: [
        { version: '0.9.3', date: '2026-07-07', note: 'What-if results stay in the session and do not write back.' },
        { version: '0.8.0', date: '2026-02-20', note: 'Slack is read from the example schedule, not invented.' },
      ],
    }),
    block({
      id: 'ai-shift',
      name: 'Shift report writer',
      category: 'AI patterns',
      owner: 'Floor design',
      version: '1.3.0',
      summary: 'Drafts a handover from jobs and findings already on the road. A person sends it.',
      isa95: ['L3'],
      cui: true,
      touches: ['Jobs', 'People'],
      ai: aiProfile('low'),
      history: [
        { version: '1.3.0', date: '2026-06-28', note: 'The note quotes records; it does not add events.' },
        { version: '1.1.0', date: '2026-01-30', note: 'Safety findings are listed before flow findings.' },
      ],
    }),
    block({
      id: 'ui-station',
      name: 'Station board',
      category: 'UI templates',
      owner: 'Floor design',
      version: '2.0.0',
      summary: 'The approved go / no-go layout for one station.',
      isa95: ['L3'],
      cui: false,
      touches: ['Jobs'],
      history: [
        { version: '2.0.0', date: '2026-05-04', note: 'Ready and not-ready states use the same row, not two tools.' },
        { version: '1.4.0', date: '2025-10-15', note: 'Layout approved for a station screen and a phone.' },
      ],
    }),
    block({
      id: 'ui-inspect',
      name: 'Inspection form',
      category: 'UI templates',
      owner: 'Quality desk',
      version: '1.6.0',
      summary: 'A shift-start checklist. Answers stay on the road, not in a side sheet.',
      isa95: ['L3'],
      cui: true,
      touches: ['Jobs'],
      history: [
        { version: '1.6.0', date: '2026-04-11', note: 'Each tick is attributed to the badge.' },
        { version: '1.3.0', date: '2025-09-19', note: 'Form fields locked to the quality desk list.' },
      ],
    }),
    block({
      id: 'ui-gemba',
      name: 'Gemba finding log',
      category: 'UI templates',
      owner: 'Floor design',
      version: '1.5.1',
      summary: 'A walk finding becomes a backlog item with an owner and a due date.',
      isa95: ['L3'],
      cui: true,
      touches: ['Stations'],
      history: [
        { version: '1.5.1', date: '2026-08-19', note: 'Owner and due date are required before a finding is saved.' },
        { version: '1.2.0', date: '2026-02-02', note: 'Findings are station-scoped and shared, not private notes.' },
      ],
    }),
    block({
      id: 'ui-kpi',
      name: 'KPI tile',
      category: 'UI templates',
      owner: 'Floor design',
      version: '1.2.0',
      summary: 'A small tile for a Lean signal: idle minutes, wait time, flow, or first-time-right.',
      isa95: ['L3', 'L4'],
      cui: false,
      touches: ['Jobs'],
      history: [
        { version: '1.2.0', date: '2026-03-27', note: 'Tiles name the Lean term and say when the figure is an example.' },
        { version: '1.0.0', date: '2025-11-01', note: 'Tile chrome approved for station and office screens.' },
      ],
    }),
    block({
      id: 'ui-exception',
      name: 'Exception banner',
      category: 'UI templates',
      owner: 'Floor design',
      version: '1.1.0',
      summary: 'Shows the exact gap in the words of the record that failed.',
      isa95: ['L3'],
      cui: false,
      touches: ['Jobs'],
      history: [
        { version: '1.1.0', date: '2026-05-30', note: 'The banner quotes the connector. It does not paraphrase.' },
        { version: '1.0.0', date: '2026-01-12', note: 'One gap, one sentence.' },
      ],
    }),
    block({
      id: 'ui-handover',
      name: 'Shift handover card',
      category: 'UI templates',
      owner: 'Floor design',
      version: '1.0.4',
      summary: 'A card for the note the oncoming shift actually reads.',
      isa95: ['L3'],
      cui: true,
      touches: ['Jobs'],
      history: [
        { version: '1.0.4', date: '2026-06-12', note: 'Card keeps safety items above the fold.' },
        { version: '1.0.0', date: '2026-02-14', note: 'Handover layout approved.' },
      ],
    }),
    block({
      id: 'ui-coat',
      name: 'Coat-thickness spot check',
      category: 'UI templates',
      owner: 'L. Ferreira',
      version: '0.9.0',
      status: 'in-review',
      summary: 'A spot check for coating thickness, submitted from the outfit bay and not yet approved.',
      isa95: ['L3'],
      cui: true,
      touches: ['Jobs'],
      history: [
        { version: '0.9.0', date: '2026-10-02', note: 'Submitted for review by L. Ferreira. Checks are not inherited yet.' },
      ],
    }),
  ];
}

function job(id, title, station, team, flags, tool, parts, drawing, mechanic) {
  const pack = (row) => ({ name: row[0], ok: row[1], bad: row[2] });
  return {
    id,
    title,
    station,
    team,
    checks: {
      tool: Boolean(flags[0]),
      parts: Boolean(flags[1]),
      drawing: Boolean(flags[2]),
      mechanic: Boolean(flags[3]),
    },
    detail: { tool: pack(tool), parts: pack(parts), drawing: pack(drawing), mechanic: pack(mechanic) },
  };
}

export function seedJobs() {
  const okTool = (name) => [name, `${name} calibration current`, `${name} calibration expired`];
  return [
    job('WO-4412', 'Frame splice kit, bay 3', 'KS-04', 'Structural', [0, 1, 1, 1],
      ['Drill DR-114', 'Drill DR-114 calibration current', 'Drill DR-114 calibration expired'],
      ['M12 fasteners', 'M12 fasteners and splice plate kitted', 'M12 fasteners short of the kit quantity'],
      ['WI-KS-220', 'WI-KS-220 rev C confirmed', 'WI-KS-220 not confirmed at the station'],
      ['A. Okonkwo', 'A. Okonkwo, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4418', 'Bracket kit, frame 12', 'KS-04', 'Structural', [1, 0, 1, 1],
      okTool('Driver set DS-04'),
      ['M10 fasteners', 'M10 fasteners kitted from bin F-19', 'M10 fasteners short, bin F-19'],
      ['WI-KS-104', 'WI-KS-104 rev A confirmed', 'WI-KS-104 not confirmed at the station'],
      ['P. Rahman', 'P. Rahman, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4421', 'Pipe hanger kit, zone C', 'KS-04', 'Structural', [1, 1, 0, 1],
      okTool('Banding tool BT-2'),
      ['Hanger stock', 'Hanger stock kitted', 'Hanger stock short'],
      ['WI-PH-118', 'WI-PH-118 confirmed at the station', 'Work instruction WI-PH-118 not confirmed at the station'],
      ['D. Ibarra', 'D. Ibarra, pipe fit-up, current', 'No pipe fitter is assigned']),
    job('WO-4427', 'Stiffener kit, bay 5', 'KS-04', 'Structural', [1, 1, 1, 0],
      okTool('Grinder GR-19'),
      ['Stiffener stock', 'Stiffener stock kitted', 'Stiffener stock short'],
      ['WI-KS-310', 'WI-KS-310 rev B confirmed', 'WI-KS-310 not confirmed at the station'],
      ['Unassigned', 'Qualified mechanic confirmed for this shift', 'No mechanic with structural fit-up is free on this shift']),
    job('WO-4430', 'Access hatch kit', 'KS-04', 'Structural', [0, 0, 1, 1],
      ['Torque wrench TW-08', 'Torque wrench TW-08 calibration current', 'Torque wrench TW-08 calibration expired'],
      ['Hatch seal kit', 'Hatch seal kit kitted', 'Hatch seal kit short'],
      ['WI-HT-014', 'WI-HT-014 rev D confirmed', 'WI-HT-014 not confirmed at the station'],
      ['A. Okonkwo', 'A. Okonkwo, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4433', 'Cable tray supports', 'KS-04', 'Structural', [1, 1, 1, 1],
      okTool('Impact wrench IW-3'),
      ['Tray hardware', 'Tray hardware kitted', 'Tray hardware short'],
      ['WI-EL-077', 'WI-EL-077 rev A confirmed', 'WI-EL-077 not confirmed at the station'],
      ['E. Santos', 'E. Santos, electrical install, current', 'No electrician is assigned']),
    job('WO-4436', 'Deck socket kit', 'KS-04', 'Structural', [1, 1, 1, 1],
      okTool('Rivet gun RG-12'),
      ['Deck sockets', 'Deck sockets kitted', 'Deck sockets short'],
      ['WI-KS-188', 'WI-KS-188 rev B confirmed', 'WI-KS-188 not confirmed at the station'],
      ['P. Rahman', 'P. Rahman, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4440', 'Handrail section B', 'KS-04', 'Structural', [1, 1, 0, 1],
      okTool('Chop saw CS-7'),
      ['Handrail hardware', 'Handrail hardware kitted', 'Handrail hardware short'],
      ['DRW-HR-B', 'Drawing rev C confirmed at the station', 'Drawing at the station is rev B; the job calls rev C'],
      ['A. Okonkwo', 'A. Okonkwo, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4444', 'Foundation bolts, skid 2', 'KS-04', 'Structural', [1, 0, 1, 1],
      okTool('Torque gun TG-2'),
      ['Foundation bolts', 'Foundation bolts kitted', 'Foundation bolts are not in the kit'],
      ['WI-FD-009', 'WI-FD-009 rev A confirmed', 'WI-FD-009 not confirmed at the station'],
      ['P. Rahman', 'P. Rahman, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4449', 'Ladder cage kit', 'KS-04', 'Structural', [1, 1, 1, 1],
      okTool('Hydraulic puller HP-5'),
      ['Cage fasteners', 'Cage fasteners kitted', 'Cage fasteners short'],
      ['WI-KS-274', 'WI-KS-274 rev A confirmed', 'WI-KS-274 not confirmed at the station'],
      ['A. Okonkwo', 'A. Okonkwo, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4452', 'Insulation pins, bulkhead', 'KS-04', 'Structural', [1, 1, 1, 1],
      okTool('Needle scaler ND-1'),
      ['Insulation pins', 'Insulation pins kitted', 'Insulation pins short'],
      ['WI-IN-033', 'WI-IN-033 rev C confirmed', 'WI-IN-033 not confirmed at the station'],
      ['E. Santos', 'E. Santos, electrical install, current', 'Assigned mechanic certification lapsed']),
    job('WO-4458', 'Watertight door frame kit', 'KS-04', 'Structural', [1, 1, 1, 1],
      okTool('Clamp kit CL-9'),
      ['Door frame hardware', 'Door frame hardware kitted', 'Door frame hardware short'],
      ['WI-WT-021', 'WI-WT-021 rev B confirmed', 'WI-WT-021 not confirmed at the station'],
      ['P. Rahman', 'P. Rahman, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4601', 'Angle kit, bay 6', 'KS-06', 'Structural', [0, 1, 1, 1],
      ['Drill DR-220', 'Drill DR-220 calibration current', 'Drill DR-220 calibration expired'],
      ['Angle clips', 'Angle clips kitted', 'Angle clips short'],
      ['WI-KS-401', 'WI-KS-401 rev A confirmed', 'WI-KS-401 not confirmed at the station'],
      ['T. Brooks', 'T. Brooks, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4602', 'Clip kit, bay 6', 'KS-06', 'Structural', [1, 1, 1, 1],
      okTool('Driver set DS-11'),
      ['Clips', 'Clips kitted', 'Clips short'],
      ['WI-KS-402', 'WI-KS-402 rev A confirmed', 'WI-KS-402 not confirmed at the station'],
      ['T. Brooks', 'T. Brooks, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4603', 'Padeye kit, bay 6', 'KS-06', 'Structural', [1, 0, 1, 1],
      okTool('Torque wrench TW-14'),
      ['Padeye stock', 'Padeye stock kitted', 'Padeye stock short'],
      ['WI-KS-403', 'WI-KS-403 rev B confirmed', 'WI-KS-403 not confirmed at the station'],
      ['T. Brooks', 'T. Brooks, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4604', 'Doubler kit, bay 6', 'KS-06', 'Structural', [1, 1, 1, 1],
      okTool('Grinder GR-06'),
      ['Doubler plate', 'Doubler plate kitted', 'Doubler plate short'],
      ['WI-KS-404', 'WI-KS-404 rev A confirmed', 'WI-KS-404 not confirmed at the station'],
      ['T. Brooks', 'T. Brooks, structural fit-up, current', 'No mechanic with structural fit-up is assigned']),
    job('WO-4701', 'Spool S-14', 'PS-12', 'Pipe', [1, 0, 1, 1],
      okTool('Fit-up clamp FC-2'),
      ['Gasket set', 'Gasket set kitted', 'Gasket set short'],
      ['ISO-PS-14', 'ISO sheet PS-14 confirmed', 'ISO sheet PS-14 not confirmed'],
      ['J. Adeyemi', 'J. Adeyemi, pipe fit-up, current', 'No pipe fitter is assigned']),
    job('WO-4702', 'Spool S-15', 'PS-12', 'Pipe', [1, 1, 1, 1],
      okTool('Fit-up clamp FC-3'),
      ['Gasket set', 'Gasket set kitted', 'Gasket set short'],
      ['ISO-PS-15', 'ISO sheet PS-15 confirmed', 'ISO sheet PS-15 not confirmed'],
      ['J. Adeyemi', 'J. Adeyemi, pipe fit-up, current', 'No pipe fitter is assigned']),
    job('WO-4703', 'Spool S-16', 'PS-12', 'Pipe', [1, 1, 0, 1],
      okTool('Banding tool BT-9'),
      ['Flange kit', 'Flange kit kitted', 'Flange kit short'],
      ['ISO-PS-16', 'ISO sheet PS-16 rev B confirmed', 'ISO sheet PS-16 rev A not confirmed'],
      ['D. Ibarra', 'D. Ibarra, pipe fit-up, current', 'No pipe fitter is assigned']),
  ];
}

function isoIn(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function seedFindings() {
  return [
    { id: 'F-100', text: 'Temporary light is out on the bay 3 stair. The landing is dark.', station: 'KS-04', severity: 'Safety', owner: 'E. Santos', due: isoIn(1), status: 'open' },
    { id: 'F-101', text: 'Kit cart is parked on the weld ground cable for frame 12.', station: 'KS-04', severity: 'Flow', owner: 'R. Hale', due: isoIn(2), status: 'open' },
    { id: 'F-102', text: 'The binder at the station still has WI-KS-220 rev B. The job calls rev C.', station: 'KS-04', severity: 'Quality', owner: 'M. Chen', due: isoIn(4), status: 'open' },
    { id: 'F-103', text: 'Torque wrench TW-08 is on the cart with an expired calibration tag.', station: 'KS-04', severity: 'Quality', owner: 'Tool crib', due: isoIn(3), status: 'open' },
    { id: 'F-104', text: 'Walkway paint marks at bay 4 were renewed before shift.', station: 'KS-04', severity: 'Flow', owner: 'R. Hale', due: isoIn(-2), status: 'done' },
  ];
}

function appRecord(partial) {
  return {
    status: 'active',
    parentId: null,
    origin: 'seed',
    users: 6,
    weeklyUses: 10,
    lastUsedDaysAgo: 1,
    ...partial,
  };
}

export function seedApps() {
  return [
    appRecord({
      id: 'app-kit-gate',
      name: 'Kit-Staging Release Gate',
      owner: 'R. Hale',
      station: 'KS-04',
      team: 'Structural',
      users: 11,
      weeklyUses: 48,
      lastUsedDaysAgo: 0,
      version: '1.4.0',
      blockIds: [...GATE_BLOCKS],
      runner: 'station-gate',
      lean: 'Idle minutes',
      leanNote: 'Waiting avoided versus a no-gate release',
      summary: 'Holds a job until the tool, parts, drawing, and a qualified mechanic all confirm.',
      history: [
        { version: '1.4.0', at: 'Sep 12', actor: 'R. Hale', event: 'Registered on the road at KS-04' },
        { version: '1.3.0', at: 'Jun 2', actor: 'R. Hale', event: 'Added the qualification check before release' },
      ],
    }),
    appRecord({
      id: 'app-kit-b6',
      name: 'Kit-Staging Gate · Bay 6',
      owner: 'T. Brooks',
      station: 'KS-06',
      team: 'Structural',
      users: 4,
      weeklyUses: 12,
      lastUsedDaysAgo: 2,
      version: '0.3.0',
      blockIds: [...GATE_BLOCKS],
      runner: 'station-gate',
      parentId: 'app-kit-gate',
      origin: 'fork',
      lean: 'Idle minutes',
      leanNote: 'Waiting avoided versus a no-gate release',
      summary: 'Fork of the bay 4 gate, pointed at bay 6 jobs.',
      history: [
        { version: '0.3.0', at: 'Oct 3', actor: 'T. Brooks', event: 'Forked from Kit-Staging Release Gate 1.4.0' },
      ],
    }),
    appRecord({
      id: 'app-gemba',
      name: 'Gemba Finding Log',
      owner: 'M. Chen',
      station: 'KS-04',
      team: 'Structural',
      users: 7,
      weeklyUses: 18,
      lastUsedDaysAgo: 1,
      version: '1.2.0',
      blockIds: [...GEMBA_BLOCKS],
      runner: 'gemba',
      lean: 'Flow',
      leanNote: 'Open interruptions from the walk',
      summary: 'Walk findings become backlog items with an owner and a due date.',
      history: [
        { version: '1.2.0', at: 'Aug 19', actor: 'M. Chen', event: 'Required an owner and a due date on every finding' },
      ],
    }),
    appRecord({
      id: 'app-kpi',
      name: 'Outfit Bay KPI Wall',
      owner: 'L. Ferreira',
      station: 'OB-01',
      team: 'Outfit',
      users: 15,
      weeklyUses: 40,
      lastUsedDaysAgo: 0,
      status: 'promoted',
      version: '2.1.0',
      blockIds: ['ui-kpi', 'dc-jobs', 'dc-parts', 'dc-tools'],
      runner: 'generic',
      lean: 'Flow',
      leanNote: 'Jobs moving versus jobs short a part or a tool',
      summary: 'A supported wall of flow tiles for the outfit bay.',
      history: [
        { version: '2.1.0', at: 'Jul 1', actor: 'L. Ferreira', event: 'Promoted. Hardened, shared, and supported.' },
        { version: '2.0.0', at: 'Apr 18', actor: 'L. Ferreira', event: 'Registered on the road' },
      ],
    }),
    appRecord({
      id: 'app-pipe',
      name: 'Pipe Spool Tracker',
      owner: 'J. Adeyemi',
      station: 'PS-12',
      team: 'Pipe',
      users: 4,
      weeklyUses: 3,
      lastUsedDaysAgo: 41,
      version: '0.4.0',
      blockIds: ['dc-jobs', 'dc-parts', 'ui-station', 'ui-exception'],
      runner: 'station-gate',
      lean: 'Wait time',
      leanNote: 'Jobs waiting on a short kit',
      summary: 'A spool list that holds a job when the kit is short.',
      history: [
        { version: '0.4.0', at: 'Aug 1', actor: 'J. Adeyemi', event: 'Registered on the road at PS-12' },
      ],
    }),
    appRecord({
      id: 'app-weld',
      name: 'Weld Map Scratchpad',
      owner: 'S. Novak',
      station: 'WB-02',
      team: 'Structural',
      users: 2,
      weeklyUses: 6,
      lastUsedDaysAgo: 54,
      version: '0.2.0',
      blockIds: ['ai-defect', 'ui-inspect'],
      runner: 'generic',
      lean: 'First-time-right',
      leanNote: 'Defects classed before close-up',
      summary: 'A scratchpad that classes a defect description. Quiet for 54 days.',
      history: [
        { version: '0.2.0', at: 'Jul 8', actor: 'S. Novak', event: 'Registered on the road at WB-02' },
      ],
    }),
    appRecord({
      id: 'app-inspect',
      name: 'Shift-start inspection',
      owner: 'L. Ferreira',
      station: 'KS-04',
      team: 'Structural',
      users: 9,
      weeklyUses: 8,
      lastUsedDaysAgo: 1,
      version: '0.8.0',
      blockIds: [...INSPECT_BLOCKS],
      runner: 'generic',
      lean: 'First-time-right',
      leanNote: 'Shift-start checks completed before work starts',
      summary: 'A shift-start form with a defect pattern on anything flagged.',
      history: [
        { version: '0.8.0', at: 'Oct 20', actor: 'L. Ferreira', event: 'Registered on the road at KS-04' },
      ],
    }),
  ];
}

export function seedLogs() {
  return [
    { id: 'L1', at: 'Example shift · 06:40', message: 'Tool crib feed refreshed calibration. Drill DR-114 and torque wrench TW-08 remain expired.' },
    { id: 'L2', at: 'Example shift · 06:42', message: 'Kit-Staging Release Gate read 12 jobs at KS-04 on badge FL-204.' },
    { id: 'L3', at: 'Example shift · 06:55', message: 'Coat-thickness spot check submitted for review by L. Ferreira. Checks are not inherited yet.' },
    { id: 'L4', at: 'Example shift · 07:05', message: 'Weld Map Scratchpad has had no runs in 54 days. Archive is suggested.' },
  ];
}

export const INSPECTION = [
  { id: 'ppe', label: 'PPE at the station matches the work instruction' },
  { id: 'cal', label: 'Calibration tags on the tools for this shift are current' },
  { id: 'kit', label: 'Kits for the first three jobs are present and labeled' },
  { id: 'wi', label: 'Work instruction revision matches the job' },
  { id: 'house', label: 'Walkway and weld grounds are clear' },
];

export const SCHEDULE = [
  { id: 'WO-4501', title: 'Block lift, bay 2', slack: 2 },
  { id: 'WO-4502', title: 'Pipe spool set, zone C', slack: 5 },
  { id: 'WO-4503', title: 'Hatch install', slack: 1 },
  { id: 'WO-4504', title: 'Cable pull, deck 3', slack: 8 },
  { id: 'WO-4505', title: 'Handrail close-up', slack: 3 },
];

export const WORK_INSTRUCTIONS = [
  {
    id: 'WI-KS-220',
    title: 'Frame splice fit-up',
    rev: 'C',
    answers: [
      { keys: ['torque', 'bolt', 'fastener', 'tighten'], text: 'Tighten splice bolts in the sequence on the drawing, then confirm the gap gauge. Example instruction only.' },
      { keys: ['drill', 'dr-114', 'hole', 'pierc'], text: 'Use a calibrated drill. If the calibration tag is expired, stop and swap the tool before piercing.' },
    ],
  },
  {
    id: 'WI-HT-014',
    title: 'Access hatch close-up',
    rev: 'D',
    answers: [
      { keys: ['seal', 'gasket', 'hatch'], text: 'Fit the seal dry, confirm the kit quantity, then torque the perimeter in the drawn order.' },
      { keys: ['torque', 'wrench', 'tw-08'], text: 'The torque wrench for this instruction must show a current calibration tag before the first fastener.' },
    ],
  },
  {
    id: 'WI-PH-118',
    title: 'Pipe hanger install',
    rev: 'B',
    answers: [
      { keys: ['hanger', 'spacing', 'band'], text: 'Set hanger spacing from the isometric, then band the spool. Do not substitute a hanger size.' },
    ],
  },
];

const DEFECTS = [
  { keys: ['porosity', 'pore', 'gas hole'], title: 'Porosity', note: 'Surface pores. Hold the joint and follow the work instruction for that class.' },
  { keys: ['undercut'], title: 'Undercut', note: 'Edge undercut. Hold the joint for review against the acceptance standard in the instruction.' },
  { keys: ['misalign', 'hi-lo', 'hi lo', 'offset'], title: 'Misalignment', note: 'Fit-up offset. Do not weld out a misaligned joint to hide it.' },
  { keys: ['incomplete', 'lack of fusion', 'not filled'], title: 'Incomplete fusion', note: 'The joint is not filled. Stop and send it to the person named on the job.' },
  { keys: ['coating', 'paint', 'overspray', 'thickness'], title: 'Coating damage', note: 'Coating is outside the example class list for a sound film. Record it; do not blend it by eye.' },
  { keys: ['dimension', 'out of tolerance', 'short by', 'gap'], title: 'Dimensional', note: 'A measured miss against the drawing. Quote the drawing revision in the record.' },
];

export function classifyDefect(text) {
  const t = text.toLowerCase();
  const hit = DEFECTS.find((d) => d.keys.some((k) => t.includes(k)));
  if (!hit) {
    return {
      title: 'Unclassified',
      note: 'No approved class matched. This pattern will not invent one. Send it to a person.',
      confidence: 'no match',
    };
  }
  return { ...hit, confidence: 'keyword match on the example pattern' };
}

export function answerQuestion(question, wiId) {
  const wi = WORK_INSTRUCTIONS.find((w) => w.id === wiId) || WORK_INSTRUCTIONS[0];
  const t = question.toLowerCase();
  const hit = wi.answers.find((a) => a.keys.some((k) => t.includes(k)));
  if (!hit) {
    return {
      wi,
      text: 'No sentence in the approved work instruction answers that. This pattern will not guess a step.',
      matched: false,
    };
  }
  return { wi, text: hit.text, matched: true };
}

export function gateDimensions(blockIds) {
  const dims = [];
  if (blockIds.includes('dc-tools')) dims.push('tool');
  if (blockIds.includes('dc-parts')) dims.push('parts');
  if (blockIds.includes('dc-drawings')) dims.push('drawing');
  if (blockIds.includes('dc-quals')) dims.push('mechanic');
  return dims;
}

export function analyzeBoard(jobs, dimensions) {
  const dims = dimensions.length ? dimensions : [];
  const rows = jobs.map((jobRow) => {
    const gaps = dims
      .filter((dim) => !jobRow.checks[dim])
      .map((dim) => ({
        dim,
        label: DIM_LABEL[dim],
        reason: jobRow.detail[dim].bad,
        minutes: IDLE_MINUTES[dim],
      }));
    return {
      ...jobRow,
      gaps,
      ready: gaps.length === 0,
      minutes: gaps.reduce((sum, gap) => sum + gap.minutes, 0),
    };
  });
  const held = rows.filter((row) => !row.ready);
  const readyCount = rows.length - held.length;
  const byDim = {};
  dims.forEach((dim) => {
    const count = rows.filter((row) => row.gaps.some((gap) => gap.dim === dim)).length;
    byDim[dim] = { count, minutes: count * IDLE_MINUTES[dim], label: DIM_LABEL[dim] };
  });
  return {
    rows,
    readyCount,
    heldCount: held.length,
    idleMinutes: held.reduce((sum, row) => sum + row.minutes, 0),
    waitMinutes: held.length * WAIT_PER_HELD,
    byDim,
    dimensions: dims,
  };
}

export function stationById(id) {
  return STATIONS.find((station) => station.id === id) || STATIONS[0];
}

function reason(id, role, why) {
  return { id, role, why };
}

export function gatePlan(prompt, source = 'rules') {
  return {
    prompt,
    source,
    appName: 'Kit-Staging Release Gate',
    runner: 'station-gate',
    blockIds: [...GATE_BLOCKS],
    presetId: 'kit-gate',
    reasons: [
      reason('dc-jobs', 'matched', 'You asked which jobs at your station. The work-order feed is scoped by the badge, so the app cannot point at a private list.'),
      reason('dc-parts', 'matched', '“Parts” is the parts and inventory feed. Fasteners count. A short bin is not ready.'),
      reason('dc-tools', 'matched', '“Tools” is the calibration tracker. A tool on the cart with an expired calibration is a named gap.'),
      reason('dc-drawings', 'release rule', 'A release that ignores the drawing sends the mechanic to the wrong revision. The work-instruction feed is required before a job can go green.'),
      reason('dc-quals', 'release rule', 'Ready includes a qualified mechanic. That status comes from the people record, not a name typed into the app.'),
      reason('ui-station', 'matched', 'The answer is a go / no-go list, which is the station board template.'),
      reason('ui-exception', 'release rule', 'The board has to show the exact gap, in the words of the record that failed.'),
      reason('ui-kpi', 'release rule', 'The tiles carry idle minutes, wait time, flow, and first-time-right against a no-gate baseline.'),
    ],
  };
}

export function gembaPlan(prompt, source = 'rules') {
  return {
    prompt,
    source,
    appName: 'Gemba Finding Log',
    runner: 'gemba',
    blockIds: [...GEMBA_BLOCKS],
    presetId: 'gemba',
    reasons: [
      reason('ui-gemba', 'matched', 'A finding log is the approved way to capture a walk without a side spreadsheet. Owner and due date are required.'),
      reason('dc-jobs', 'matched', 'Findings often point at a job. The work-order feed gives them a real anchor.'),
      reason('ai-shift', 'matched', 'The shift-report writer can fold open findings into the handover. A person still sends it.'),
      reason('ui-kpi', 'matched', 'Tiles keep flow, wait time, and first-time-right visible after the walk is over.'),
    ],
  };
}

export function inspectPlan(prompt, source = 'rules') {
  return {
    prompt,
    source,
    appName: 'Shift-start inspection',
    runner: 'generic',
    blockIds: [...INSPECT_BLOCKS],
    presetId: 'inspect',
    reasons: [
      reason('ui-inspect', 'matched', 'A shift-start inspection uses the approved form, not a new checklist invented in the prompt.'),
      reason('ai-defect', 'matched', 'Anything you flag as a defect is classed by the approved pattern. No match goes to a person.'),
      reason('dc-quals', 'matched', 'The form is attributed to a qualified badge, read from the people record.'),
      reason('ui-kpi', 'matched', 'A first-time-right tile shows how much of the form is complete.'),
    ],
  };
}

export const PRESETS = [
  { id: 'kit-gate', label: 'Kit-staging release gate', prompt: EXAMPLE_PROMPT, build: gatePlan },
  { id: 'gemba', label: 'Gemba finding log', prompt: 'Log gemba walk findings and turn them into backlog items with an owner and a due date', build: gembaPlan },
  { id: 'inspect', label: 'Shift-start inspection', prompt: 'Shift-start inspection form that can classify a defect I flag', build: inspectPlan },
];

const KEYWORD_RULES = [
  { id: 'dc-parts', test: /\b(parts?|fasteners?|inventory|stock|materials?|kits?)\b/, why: 'The prompt names parts, stock, or a kit, so the parts feed is the record to read.' },
  { id: 'dc-tools', test: /\b(tools?|calibrat\w*|drills?|wrenches?|gauges?)\b/, why: 'The prompt names tools or calibration, so availability includes the calibration status.' },
  { id: 'dc-quals', test: /\b(mechanics?|qualified|qualification|cert\w*|fitters?|welders?)\b/, why: 'The prompt names a person or a qualification, which is the people record.' },
  { id: 'dc-jobs', test: /\b(jobs?|work orders?|stations?)\b/, why: 'The prompt is about jobs or a station, so it starts from the work-order feed.' },
  { id: 'dc-drawings', test: /\b(drawings?|work instructions?|revision|rev\b)\b/, why: 'The prompt names a drawing or work instruction, including the revision.' },
  { id: 'ai-qa', test: /\b(q&a|question|ask|how do i)\b/, why: 'The prompt is a question against a work instruction, which is the Q&A pattern.' },
  { id: 'ai-defect', test: /\b(defects?|classif\w*|porosity|undercut|ncr)\b/, why: 'The prompt asks to class a defect, which is the approved classifier, not a free description.' },
  { id: 'ai-schedule', test: /\b(schedules?|what if|what-if|slips?|delays?)\b/, why: 'The prompt is a what-if on the schedule. The pattern shows the slip and does not move the plan.' },
  { id: 'ai-shift', test: /\b(shift reports?|handovers?|end of shift)\b/, why: 'The prompt asks for a shift note, which the writer drafts from records already on the road.' },
  { id: 'ui-station', test: /\b(boards?|which jobs|ready|gates?)\b/, why: 'The prompt wants a station list, which is the station board template.' },
  { id: 'ui-inspect', test: /\b(inspections?|checklists?|inspect)\b/, why: 'The prompt is an inspection, so it uses the approved form.' },
  { id: 'ui-gemba', test: /\b(gemba|findings?|backlogs?)\b/, why: 'The prompt is a finding or a backlog item, which is the gemba log.' },
  { id: 'ui-kpi', test: /\b(kpis?|metrics?|tiles?|dashboards?)\b/, why: 'The prompt asks for a metric, which is a KPI tile.' },
  { id: 'ui-exception', test: /\b(missing|exceptions?|blocked|not ready)\b/, why: 'The prompt is about a gap, so the exception banner has to quote it.' },
  { id: 'ui-handover', test: /\b(handovers?|shift reports?)\b/, why: 'The prompt is a handover, so the oncoming shift gets the approved card.' },
];

export function matchIntent(prompt) {
  const raw = (prompt || '').trim();
  if (!raw) return null;
  const text = raw.toLowerCase();

  const aboutJobs = /\b(jobs?|work orders?|stations?)\b/.test(text);
  const aboutMissing = /\b(missing|short|ready|readiness|gates?|releases?|not ready|blocked)\b/.test(text);
  const aboutPartsOrTools = /\b(parts?|tools?|fasteners?|kits?|calibrat\w*|inventory)\b/.test(text);
  if (aboutJobs && aboutMissing && aboutPartsOrTools) return gatePlan(raw);

  if (/\b(gemba|findings?|backlogs?)\b/.test(text)) return gembaPlan(raw);
  if (/\b(inspections?|checklists?|shift-start|shift start)\b/.test(text)) return inspectPlan(raw);

  const blockIds = [];
  const reasons = [];
  KEYWORD_RULES.forEach((rule) => {
    if (rule.test.test(text) && !blockIds.includes(rule.id)) {
      blockIds.push(rule.id);
      reasons.push(reason(rule.id, 'matched', rule.why));
    }
  });

  if (!blockIds.length) {
    blockIds.push('dc-jobs', 'ui-kpi');
    reasons.push(
      reason('dc-jobs', 'matched', 'The prompt did not name a connector. The road starts from the job feed so the app still has a governed record.'),
      reason('ui-kpi', 'matched', 'A tile gives the prompt a visible result while you add blocks.'),
    );
  }

  let runner = 'generic';
  if (blockIds.includes('ui-gemba')) runner = 'gemba';
  else if (blockIds.includes('ui-station') && blockIds.includes('dc-jobs') && (blockIds.includes('dc-parts') || blockIds.includes('dc-tools'))) {
    runner = 'station-gate';
  }

  const appName = runner === 'station-gate'
    ? 'Kit-Staging Release Gate'
    : raw.length < 52
      ? raw.charAt(0).toUpperCase() + raw.slice(1)
      : `${raw.slice(0, 48).replace(/\s+\S*$/, '')}…`;

  return { prompt: raw, source: 'rules', appName, runner, blockIds, reasons, presetId: null };
}

export function planFromModelJson(json, catalog, prompt) {
  const allowed = new Map(catalog.filter((b) => b.status !== 'rejected').map((b) => [b.id, b]));
  const byName = new Map(catalog.filter((b) => b.status !== 'rejected').map((b) => [b.name.toLowerCase(), b.id]));
  const rawIds = Array.isArray(json?.blockIds) ? json.blockIds : [];
  const blockIds = [];
  rawIds.forEach((value) => {
    const text = String(value || '').trim();
    const id = allowed.has(text) ? text : byName.get(text.toLowerCase());
    if (id && !blockIds.includes(id)) blockIds.push(id);
  });
  if (!blockIds.length) {
    throw new Error('The model returned no blocks from the catalog.');
  }
  let runner = ['station-gate', 'gemba', 'generic'].includes(json?.runner) ? json.runner : 'generic';
  if (runner === 'gemba' && !blockIds.includes('ui-gemba')) blockIds.unshift('ui-gemba');
  if (runner === 'station-gate' && gateDimensions(blockIds).length === 0) runner = 'generic';
  if (runner === 'generic' && blockIds.includes('ui-gemba')) runner = 'gemba';
  const modelReasons = new Map((json?.reasons || []).map((row) => [row.id, row.why]));
  const reasons = blockIds.map((id) => reason(
    id,
    'model',
    modelReasons.get(id) || 'Selected by the live model from the approved catalog.',
  ));
  const appName = String(json?.appName || '').trim() || 'Floor app';
  return { prompt, source: 'model', appName, runner, blockIds, reasons, presetId: null };
}

const FRAMEWORK_ORDER = [
  'ISA-95',
  'NIST SP 800-171 / CMMC Level 2',
  'ISO 9001 / AS9100',
  'NIST AI RMF',
  'ISO/IEC 42001',
  'DoD Responsible AI',
  'Catalog review',
];

const RMF_COPY = {
  govern: {
    covered: 'Govern is covered: the pattern is an approved block with an owner and cannot write the system of record.',
    partial: 'Govern is partial: ownership or the boundary of the pattern is incomplete.',
    gap: 'Govern is open: the pattern has no approved boundary.',
  },
  map: {
    covered: 'Map is covered: the use is named, and a person acts on the result.',
    partial: 'Map is partial: the use of the pattern is not fully named.',
    gap: 'Map is open: the use is not described.',
  },
  measure: {
    covered: 'Measure is covered: a recorded error rate is attached to the pattern.',
    partial: 'Measure is partial: this prototype does not record an accuracy or error rate.',
    gap: 'Measure is open: there is no evaluation.',
  },
  manage: {
    covered: 'Manage is covered: the pattern refuses or routes to a person when it cannot support the decision, and the call is logged.',
    partial: 'Manage is partial: fallback or logging is incomplete.',
    gap: 'Manage is open: the pattern has no fallback.',
  },
};

const ISO_COPY = {
  policy: {
    covered: 'AI policy is covered: the pattern runs only as an approved catalog block.',
    partial: 'AI policy is partial.',
    gap: 'AI policy is open.',
  },
  impact: {
    covered: 'Impact assessment is covered: a risk tier is recorded on the block.',
    partial: 'Impact assessment is partial: the risk tier is incomplete.',
    gap: 'Impact assessment is open.',
  },
  operations: {
    covered: 'Operational controls are covered: the pattern is logged and does not write the system of record.',
    partial: 'Operational controls are partial.',
    gap: 'Operational controls are open.',
  },
  performance: {
    covered: 'Performance evaluation is covered: a scheduled review of pattern quality is recorded.',
    partial: 'Performance evaluation is partial: there is no scheduled review of pattern quality in this prototype.',
    gap: 'Performance evaluation is open.',
  },
};

const RAI_COPY = {
  responsible: {
    pass: 'Responsible: a person performs the work. The pattern does not sign the job.',
    partial: 'Responsible is partial.',
    gap: 'Responsible is open.',
  },
  equitable: {
    pass: 'Equitable: the same approved pattern is applied for every badge at the station.',
    partial: 'Equitable is partial: the example pattern is not checked across joint types or stations.',
    gap: 'Equitable is open.',
  },
  traceable: {
    pass: 'Traceable: the result cites the record or the rule that produced it.',
    partial: 'Traceable is partial.',
    gap: 'Traceable is open.',
  },
  reliable: {
    pass: 'Reliable: a measured error rate supports the pattern.',
    partial: 'Reliable is partial: the pattern has no measured error rate in this prototype.',
    gap: 'Reliable is open.',
  },
  governable: {
    pass: 'Governable: the block can be withdrawn from the catalog, and the app cannot keep a private copy.',
    partial: 'Governable is partial.',
    gap: 'Governable is open.',
  },
};

function names(list) {
  return list.map((b) => b.name).join(', ');
}

function splitStatus(blocks, getter) {
  const groups = { covered: [], pass: [], partial: [], gap: [] };
  blocks.forEach((b) => {
    const status = getter(b);
    (groups[status] || groups.gap).push(b);
  });
  return groups;
}

function pushStatus(inherited, gaps, framework, groups, copy) {
  ['covered', 'pass'].forEach((status) => {
    if (groups[status]?.length && copy[status]) {
      inherited.push({ framework, text: `${copy[status]} Blocks: ${names(groups[status])}.` });
    }
  });
  ['partial', 'gap'].forEach((status) => {
    if (groups[status]?.length && copy[status]) {
      gaps.push({ framework, text: `${copy[status]} Blocks: ${names(groups[status])}.` });
    }
  });
}

export function assess(blockIds, blocks) {
  const chosen = blockIds.map((id) => blocks.find((b) => b.id === id)).filter(Boolean);
  const approved = chosen.filter((b) => b.status === 'approved');
  const pending = chosen.filter((b) => b.status !== 'approved');
  const inherited = [];
  const gaps = [];
  const notApplicable = [];

  const levels = [...new Set(approved.flatMap((b) => b.isa95 || []))];
  if (levels.length) {
    inherited.push({
      framework: 'ISA-95',
      text: `Levels declared on the approved blocks: ${levels.map((level) => ISA95[level].short).join(', ')}. No approved block writes to L0 shop floor or L1 control.`,
    });
  }
  chosen.filter((b) => b.ai && (b.isa95 || []).some((level) => level === 'L0' || level === 'L1')).forEach((b) => {
    gaps.push({
      framework: 'ISA-95',
      text: `${b.name} is a model block at ${(b.isa95 || []).join(', ')}. Models are not approved to write to shop-floor or control equipment.`,
    });
  });

  const cuiBlocks = approved.filter((b) => b.cui);
  if (cuiBlocks.length) {
    inherited.push({
      framework: 'NIST SP 800-171 / CMMC Level 2',
      text: `CUI flag on ${cuiBlocks.length} approved block${cuiBlocks.length === 1 ? '' : 's'} (${names(cuiBlocks)}). Access Control and Audit & Accountability travel with them. Example practices: limit access to the station badge (3.1.1) and log the action to that badge (3.3.1, 3.3.2).`,
    });
  } else if (approved.length) {
    notApplicable.push({
      framework: 'NIST SP 800-171 / CMMC Level 2',
      text: 'No approved block in this composition is flagged CUI, so these example control families are not invoked.',
    });
  }

  const traceable = approved.filter((b) => b.owner && b.version && b.history?.length && b.auditTrail);
  if (traceable.length === approved.length && approved.length) {
    inherited.push({
      framework: 'ISO 9001 / AS9100',
      text: `Owner, version, change history, and audit trail are present on all ${approved.length} approved blocks.`,
    });
  }
  approved.filter((b) => !(b.owner && b.version && b.history?.length && b.auditTrail)).forEach((b) => {
    gaps.push({ framework: 'ISO 9001 / AS9100', text: `${b.name} is missing an owner, a version, a change history, or an audit trail.` });
  });

  const ai = approved.filter((b) => b.ai);
  if (!ai.length && approved.length) {
    notApplicable.push({
      framework: 'NIST AI RMF',
      text: 'This composition does not call a model, so NIST AI RMF, ISO/IEC 42001, and DoD Responsible AI do not apply.',
    });
  }
  if (ai.length) {
    const rank = { low: 1, moderate: 2, high: 3 };
    const top = ai.reduce((best, b) => (rank[b.ai.risk] > rank[best.ai.risk] ? b : best), ai[0]);
    inherited.push({
      framework: 'NIST AI RMF',
      text: `Example risk tier: ${top.ai.risk}. Highest tier among ${names(ai)}.`,
    });
    pushStatus(inherited, gaps, 'NIST AI RMF', splitStatus(ai, (b) => b.ai.rmf.govern), RMF_COPY.govern);
    pushStatus(inherited, gaps, 'NIST AI RMF', splitStatus(ai, (b) => b.ai.rmf.map), RMF_COPY.map);
    pushStatus(inherited, gaps, 'NIST AI RMF', splitStatus(ai, (b) => b.ai.rmf.measure), RMF_COPY.measure);
    pushStatus(inherited, gaps, 'NIST AI RMF', splitStatus(ai, (b) => b.ai.rmf.manage), RMF_COPY.manage);
    pushStatus(inherited, gaps, 'ISO/IEC 42001', splitStatus(ai, (b) => b.ai.iso42001.policy), ISO_COPY.policy);
    pushStatus(inherited, gaps, 'ISO/IEC 42001', splitStatus(ai, (b) => b.ai.iso42001.impact), ISO_COPY.impact);
    pushStatus(inherited, gaps, 'ISO/IEC 42001', splitStatus(ai, (b) => b.ai.iso42001.operations), ISO_COPY.operations);
    pushStatus(inherited, gaps, 'ISO/IEC 42001', splitStatus(ai, (b) => b.ai.iso42001.performance), ISO_COPY.performance);
    pushStatus(inherited, gaps, 'DoD Responsible AI', splitStatus(ai, (b) => b.ai.rai.responsible), RAI_COPY.responsible);
    pushStatus(inherited, gaps, 'DoD Responsible AI', splitStatus(ai, (b) => b.ai.rai.equitable), RAI_COPY.equitable);
    pushStatus(inherited, gaps, 'DoD Responsible AI', splitStatus(ai, (b) => b.ai.rai.traceable), RAI_COPY.traceable);
    pushStatus(inherited, gaps, 'DoD Responsible AI', splitStatus(ai, (b) => b.ai.rai.reliable), RAI_COPY.reliable);
    pushStatus(inherited, gaps, 'DoD Responsible AI', splitStatus(ai, (b) => b.ai.rai.governable), RAI_COPY.governable);
  }

  pending.forEach((b) => {
    gaps.push({
      framework: 'Catalog review',
      text: `${b.name} is ${b.status === 'rejected' ? 'rejected' : 'in review'}. None of its tags are inherited until it is approved.`,
    });
  });

  const sortItems = (items) => items.sort((a, b) => FRAMEWORK_ORDER.indexOf(a.framework) - FRAMEWORK_ORDER.indexOf(b.framework));
  return {
    inherited: sortItems(inherited),
    gaps: sortItems(gaps),
    notApplicable: sortItems(notApplicable),
    levels,
    cui: cuiBlocks.length > 0,
  };
}

export function promotionReadiness(app, blocks) {
  const report = assess(app.blockIds, blocks);
  const checks = [
    { id: 'owner', label: 'Owner', met: Boolean(app.owner && app.owner.trim()), detail: app.owner || 'Missing' },
    { id: 'version', label: 'Version', met: Boolean(app.version && app.version.trim()), detail: app.version || 'Missing' },
    {
      id: 'audit',
      label: 'Audit trail',
      met: Boolean(app.history?.length) && app.blockIds.every((id) => blocks.find((b) => b.id === id)?.auditTrail),
      detail: app.history?.length ? `${app.history.length} app events, block trails on` : 'No app events',
    },
    {
      id: 'checks',
      label: 'Passing inherited checks',
      met: report.gaps.length === 0 && app.blockIds.length > 0,
      detail: report.gaps.length === 0 ? 'No remaining gaps' : `${report.gaps.length} remaining gap${report.gaps.length === 1 ? '' : 's'}`,
    },
  ];
  return { ok: checks.every((check) => check.met) && app.status !== 'archived', checks, report };
}

export function coverage(blocks) {
  const approved = blocks.filter((b) => b.status === 'approved');
  const ai = approved.filter((b) => b.ai);
  const cui = approved.filter((b) => b.cui);
  const countStatus = (getter, good) => ai.filter((b) => good.includes(getter(b))).length;
  return {
    approved: approved.length,
    inReview: blocks.filter((b) => b.status === 'in-review').length,
    isa95: approved.filter((b) => b.isa95?.length).length,
    quality: approved.filter((b) => b.owner && b.version && b.history?.length && b.auditTrail).length,
    cui: cui.length,
    cuiFamilies: cui.length,
    ai: ai.length,
    rmf: {
      govern: countStatus((b) => b.ai.rmf.govern, ['covered']),
      map: countStatus((b) => b.ai.rmf.map, ['covered']),
      measure: countStatus((b) => b.ai.rmf.measure, ['covered']),
      manage: countStatus((b) => b.ai.rmf.manage, ['covered']),
      measurePartial: countStatus((b) => b.ai.rmf.measure, ['partial', 'gap']),
    },
    iso42001: {
      policy: countStatus((b) => b.ai.iso42001.policy, ['covered']),
      impact: countStatus((b) => b.ai.iso42001.impact, ['covered']),
      operations: countStatus((b) => b.ai.iso42001.operations, ['covered']),
      performance: countStatus((b) => b.ai.iso42001.performance, ['covered']),
      performancePartial: countStatus((b) => b.ai.iso42001.performance, ['partial', 'gap']),
    },
    rai: {
      responsible: countStatus((b) => b.ai.rai.responsible, ['pass']),
      equitable: countStatus((b) => b.ai.rai.equitable, ['pass']),
      traceable: countStatus((b) => b.ai.rai.traceable, ['pass']),
      reliable: countStatus((b) => b.ai.rai.reliable, ['pass']),
      governable: countStatus((b) => b.ai.rai.governable, ['pass']),
    },
    noControlWrite: approved.filter((b) => b.ai && (b.isa95 || []).some((level) => level === 'L0' || level === 'L1')).length,
  };
}

export function usedByCount(blockId, apps) {
  return apps.filter((app) => app.status !== 'archived' && app.blockIds.includes(blockId)).length;
}

export function suggestArchive(app) {
  return app.status !== 'archived' && app.lastUsedDaysAgo >= 30;
}

export function appTokens(app, blocks) {
  const perRun = app.blockIds.reduce((sum, id) => sum + (blocks.find((b) => b.id === id)?.tokens || 0), 0);
  return { perRun, week: perRun * app.weeklyUses };
}

export function teamSpend(apps, blocks) {
  const totals = Object.fromEntries(TEAMS.map((team) => [team.id, 0]));
  apps.filter((app) => app.status !== 'archived').forEach((app) => {
    totals[app.team] = (totals[app.team] || 0) + appTokens(app, blocks).week;
  });
  return TEAMS.map((team) => ({ ...team, spent: totals[team.id] || 0 }));
}

export function dataTouched(app, blocks) {
  const set = new Set();
  app.blockIds.forEach((id) => {
    (blocks.find((b) => b.id === id)?.touches || []).forEach((item) => set.add(item));
  });
  return [...set];
}

export function signatureOf(runner, blockIds, station) {
  return `${runner}|${station}|${[...blockIds].sort().join(',')}`;
}

export function formatNow() {
  return new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function composeBlock(children, { name, description, owner, sourceAppId, sourceAppName }) {
  const isa95 = [...new Set(children.flatMap((b) => b.isa95 || []))];
  const aiChildren = children.filter((b) => b.ai);
  let ai = null;
  if (aiChildren.length) {
    const rank = { low: 1, moderate: 2, high: 3 };
    const worse = (a, b) => {
      const order = { covered: 0, pass: 0, partial: 1, gap: 2 };
      return (order[a] || 0) >= (order[b] || 0) ? a : b;
    };
    const top = aiChildren.reduce((best, b) => (rank[b.ai.risk] > rank[best.ai.risk] ? b : best), aiChildren[0]);
    const merge = (getter) => aiChildren.map(getter).reduce(worse);
    ai = {
      risk: top.ai.risk,
      rmf: {
        govern: merge((b) => b.ai.rmf.govern),
        map: merge((b) => b.ai.rmf.map),
        measure: merge((b) => b.ai.rmf.measure),
        manage: merge((b) => b.ai.rmf.manage),
      },
      iso42001: {
        policy: merge((b) => b.ai.iso42001.policy),
        impact: merge((b) => b.ai.iso42001.impact),
        operations: merge((b) => b.ai.iso42001.operations),
        performance: merge((b) => b.ai.iso42001.performance),
      },
      rai: {
        responsible: merge((b) => b.ai.rai.responsible),
        equitable: merge((b) => b.ai.rai.equitable),
        traceable: merge((b) => b.ai.rai.traceable),
        reliable: merge((b) => b.ai.rai.reliable),
        governable: merge((b) => b.ai.rai.governable),
      },
    };
  }
  return {
    id: `cmp-${Date.now().toString(36)}`,
    name,
    category: 'Composed',
    owner,
    version: '0.1.0',
    status: 'in-review',
    summary: description,
    tokens: children.reduce((sum, b) => sum + (b.tokens || 0), 0),
    isa95,
    cui: children.some((b) => b.cui),
    auditTrail: children.every((b) => b.auditTrail),
    touches: [...new Set(children.flatMap((b) => b.touches || []))],
    ai,
    composedOf: children.map((b) => b.id),
    sourceAppId,
    sourceAppName,
    history: [
      { version: '0.1.0', date: formatNow(), note: `Submitted from ${sourceAppName}. Checks are not inherited until approval.` },
    ],
  };
}

export function approveBlockRecord(block, actor) {
  return {
    ...block,
    status: 'approved',
    version: '1.0.0',
    history: [
      { version: '1.0.0', date: formatNow(), note: `Approved by ${actor}. Tags can now be inherited.` },
      ...block.history,
    ],
  };
}

export function rejectBlockRecord(block, actor) {
  return {
    ...block,
    status: 'rejected',
    history: [
      { version: block.version, date: formatNow(), note: `Rejected by ${actor}. It stays out of the inherited set.` },
      ...block.history,
    ],
  };
}

export function leanValue(app, state) {
  const jobs = state.jobs.filter((jobRow) => jobRow.station === app.station);
  if (app.runner === 'station-gate') {
    const board = analyzeBoard(jobs, gateDimensions(app.blockIds));
    if (app.lean === 'Wait time') return `${board.waitMinutes} min queue`;
    return `${board.idleMinutes} idle min`;
  }
  if (app.runner === 'gemba') {
    const open = state.findings.filter((f) => f.status === 'open' && f.station === app.station).length;
    return `${open} open interruptions`;
  }
  if (app.blockIds.includes('ui-inspect')) {
    const done = INSPECTION.filter((item) => state.inspection[item.id]).length;
    return `${done} of ${INSPECTION.length} checks`;
  }
  if (jobs.length) {
    const dims = gateDimensions(app.blockIds);
    const board = analyzeBoard(jobs, dims.length ? dims : ['parts', 'tool']);
    return `${board.readyCount} of ${board.rows.length} moving`;
  }
  return `${app.weeklyUses} runs this week`;
}

export function feedsFor(jobs) {
  return {
    tools: jobs.map((jobRow) => ({ job: jobRow.id, name: jobRow.detail.tool.name, ok: jobRow.checks.tool, text: jobRow.checks.tool ? jobRow.detail.tool.ok : jobRow.detail.tool.bad })),
    parts: jobs.map((jobRow) => ({ job: jobRow.id, name: jobRow.detail.parts.name, ok: jobRow.checks.parts, text: jobRow.checks.parts ? jobRow.detail.parts.ok : jobRow.detail.parts.bad })),
    drawings: jobs.map((jobRow) => ({ job: jobRow.id, name: jobRow.detail.drawing.name, ok: jobRow.checks.drawing, text: jobRow.checks.drawing ? jobRow.detail.drawing.ok : jobRow.detail.drawing.bad })),
    mechanics: jobs.map((jobRow) => ({ job: jobRow.id, name: jobRow.detail.mechanic.name, ok: jobRow.checks.mechanic, text: jobRow.checks.mechanic ? jobRow.detail.mechanic.ok : jobRow.detail.mechanic.bad })),
  };
}

export function shiftNote(findings, jobs, station = 'KS-04') {
  const scoped = findings.filter((f) => f.station === station);
  const open = scoped.filter((f) => f.status === 'open');
  const safety = open.filter((f) => f.severity === 'Safety');
  const heldCount = jobs
    .filter((jobRow) => jobRow.station === station)
    .filter((jobRow) => !jobRow.checks.tool || !jobRow.checks.parts || !jobRow.checks.drawing || !jobRow.checks.mechanic)
    .length;
  const owners = [...new Set(open.map((f) => f.owner))];
  return `Example shift note for ${station}, assembled from records. ${open.length} open findings, ${safety.length} marked safety. ${heldCount} jobs at ${station} are held at the gate. ${safety[0] ? `First safety item: ${safety[0].text}` : 'No open safety item.'} Owners still open: ${owners.join(', ') || 'none'}.`;
}

export function blockMap(blocks) {
  return Object.fromEntries(blocks.map((b) => [b.id, b]));
}

export const EXAMPLE_TOKEN_RATE = 4;

export function exampleCost(tokens) {
  return (tokens / 1_000_000) * EXAMPLE_TOKEN_RATE;
}
