import { readFile, writeFile } from 'node:fs/promises';

const endpoint = process.env.PROFILE_API_URL || 'https://blog.gonets.top/api/profile.json';
const output = new URL('../src/data/profile.json', import.meta.url);

try {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Profile API returned ${response.status}`);
  const payload = await response.json();
  if (payload?.version !== 1 || !payload.profile?.['zh-TW'] || !payload.projects?.['zh-TW']) {
    throw new Error('Profile API returned an unsupported payload');
  }
  await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`[profile] Updated snapshot from ${endpoint}`);
} catch (error) {
  await readFile(output);
  console.warn(`[profile] Keeping bundled snapshot: ${error.message}`);
}
