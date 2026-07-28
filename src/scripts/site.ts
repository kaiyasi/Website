type Locale = 'zh-TW' | 'en' | 'ja' | 'ko';
type Link = { label: string; value: string; url: string };
type Journey = { title: string; detail: string };
type Profile = { name: string; alias: string; role: string; intro: string; location: string; skills: string[]; journey: Journey[]; contact: Link[] };
type Project = { title: string; description: string; tags: string[]; url?: string; github?: string };
type Payload = { version: number; profile: Record<Locale, Profile>; projects: Record<Locale, Project[]> };

const snapshot = JSON.parse(document.querySelector('#profile-snapshot')!.textContent!) as Payload;
const copy = JSON.parse(document.querySelector('#ui-copy')!.textContent!) as Record<Locale, Record<string, string | string[]>>;
let data = snapshot;
const supported: Locale[] = ['zh-TW', 'en', 'ja', 'ko'];

function preferredLocale(): Locale {
  const saved = localStorage.getItem('kaiyasi-locale') as Locale | null;
  if (saved && supported.includes(saved)) return saved;
  const language = navigator.language.toLowerCase();
  return language.startsWith('ja') ? 'ja' : language.startsWith('ko') ? 'ko' : language.startsWith('en') ? 'en' : 'zh-TW';
}

function render(locale: Locale) {
  const profile = data.profile[locale] || data.profile['zh-TW'];
  const projects = data.projects[locale]?.length ? data.projects[locale] : data.projects['zh-TW'];
  const labels = copy[locale];
  document.documentElement.lang = locale;
  document.querySelectorAll<HTMLElement>('[data-ui]').forEach(node => { node.textContent = String(labels[node.dataset.ui!] ?? ''); });
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(node => { node.textContent = (labels.nav as string[])[Number(node.dataset.nav)]; });
  document.querySelectorAll<HTMLElement>('[data-field]').forEach(node => { node.textContent = String(profile[node.dataset.field as keyof Profile] ?? ''); });
  renderIntro(profile.intro, locale);
  document.querySelector<HTMLElement>('[data-skills]')!.innerHTML = profile.skills.map((skill, index) => `<li><small>${String(index + 1).padStart(2, '0')}</small><span>${escapeHTML(skill)}</span></li>`).join('');
  document.querySelector<HTMLElement>('[data-journey]')!.innerHTML = profile.journey.slice(0, 4).map((item, index) => `<li><small>${String(index + 1).padStart(2, '0')}</small><div><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.detail)}</p></div></li>`).join('');
  document.querySelector<HTMLElement>('[data-contact]')!.innerHTML = profile.contact.map(item => `<li><a href="${escapeAttribute(item.url)}" ${item.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><small>${escapeHTML(item.label)}</small><strong>${escapeHTML(item.value)}</strong><span>↗</span></a></li>`).join('');
  document.querySelector<HTMLElement>('[data-projects]')!.innerHTML = projects.slice(0, 3).map((project, index) => `<li><div class="project-number">${String(index + 1).padStart(2, '0')}</div><div class="project-copy"><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="tags">${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div></div><div class="project-links">${project.url ? `<a href="${escapeAttribute(project.url)}" target="_blank" rel="noopener">${labels.open} ↗</a>` : ''}${project.github ? `<a href="${escapeAttribute(project.github)}" target="_blank" rel="noopener">${labels.source} ↗</a>` : ''}</div></li>`).join('');
  (document.querySelector('[data-locale]') as HTMLSelectElement).value = locale;
}

function renderIntro(intro: string, locale: Locale) {
  const statement = document.querySelector<HTMLElement>('[data-field="intro"]')!;
  const secondLine = '與參與經驗。';
  const breakAt = locale === 'zh-TW' ? intro.indexOf(secondLine) : -1;
  if (breakAt < 0) return;
  statement.replaceChildren(intro.slice(0, breakAt), document.createElement('br'), intro.slice(breakAt));
}

function escapeHTML(value: string) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
function escapeAttribute(value: string) { return escapeHTML(value).replaceAll('"', '&quot;'); }

function showPanel() {
  const requested = location.hash.slice(1);
  const key = ['profile', 'work', 'journey', 'contact'].includes(requested) ? requested : 'cover';
  document.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
    const active = panel.dataset.panel === key;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  document.querySelectorAll<HTMLElement>('[data-card]').forEach(card => {
    const active = card.dataset.card === key;
    card.classList.toggle('is-active', active);
    if (active) card.setAttribute('aria-current', 'page');
    else card.removeAttribute('aria-current');
  });
  requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-panel="${key}"] h1, [data-panel="${key}"] h2`)?.focus({ preventScroll: true }));
}

const locale = preferredLocale();
render(locale);
showPanel();
addEventListener('hashchange', showPanel);
document.querySelector('[data-locale]')!.addEventListener('change', event => {
  const next = (event.target as HTMLSelectElement).value as Locale;
  localStorage.setItem('kaiyasi-locale', next); render(next);
});
document.querySelector('[data-theme-toggle]')!.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; localStorage.setItem('kaiyasi-theme', next);
});

fetch('https://blog.gonets.top/api/profile.json', { signal: AbortSignal.timeout(8000) })
  .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
  .then((payload: Payload) => { if (payload.version === 1 && payload.profile?.['zh-TW']) { data = payload; render((document.querySelector('[data-locale]') as HTMLSelectElement).value as Locale); } })
  .catch(() => {});
