import { planFromModelJson } from './model.js';

const LLM_KEY = 'commons.llm.v1';

export function loadLlmConfig() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(LLM_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '' };
    return {
      baseUrl: parsed.baseUrl || 'https://api.openai.com/v1',
      model: parsed.model || 'gpt-4o-mini',
      apiKey: parsed.apiKey || '',
    };
  } catch {
    return { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '' };
  }
}

export function saveLlmConfig(config) {
  sessionStorage.setItem(LLM_KEY, JSON.stringify({
    baseUrl: config.baseUrl,
    model: config.model,
    apiKey: config.apiKey,
  }));
}

export function clearLlmConfig() {
  sessionStorage.removeItem(LLM_KEY);
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The model did not return JSON.');
  return JSON.parse(raw.slice(start, end + 1));
}

export async function pickBlocks({ baseUrl, model, apiKey, prompt, catalog }) {
  const endpoint = `${String(baseUrl || '').replace(/\/$/, '')}/chat/completions`;
  const catalogBrief = catalog
    .filter((block) => block.status !== 'rejected')
    .map((block) => `${block.id} | ${block.name} | ${block.category}`)
    .join('\n');
  const system = [
    'You compose shop-floor apps only from the catalog ids below.',
    'Reply with JSON only, no markdown:',
    '{"appName":"","runner":"station-gate|gemba|generic","blockIds":["id"],"reasons":[{"id":"","why":""}]}',
    'Use runner station-gate for a readiness or missing parts/tools gate.',
    'Use runner gemba for findings, walks, or backlog items.',
    'Otherwise use generic. Pick 3 to 8 ids. Do not invent ids. Do not assign compliance tags.',
    'Catalog:',
    catalogBrief,
  ].join('\n');

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    });
  } catch {
    throw new Error('The live model could not be reached.');
  }

  if (!response.ok) {
    throw new Error(`The live model returned ${response.status}.`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return planFromModelJson(parseJson(content), catalog, prompt);
}
