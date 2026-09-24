// Shadows themes/PaperMod/assets/js/fastsearch.js. Based on the theme's copy,
// with two changes: results are de-duplicated by permalink, and each result
// shows a keyword-context snippet instead of just the title.
// Diff against the theme's copy after a submodule bump.
import * as params from '@params';

const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');

let fuse;
let currentElement = null;
let firstResult = null;
let lastResult = null;

const defaultFuseOptions = {
    distance: 100,
    threshold: 0.4,
    ignoreLocation: true,
    keys: ['title', 'permalink', 'summary', 'content']
};

const buildFuseOptions = () => {
    if (!params.fuseOpts) {
        return defaultFuseOptions;
    }

    return {
        isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
        includeScore: params.fuseOpts.includescore ?? false,
        includeMatches: params.fuseOpts.includematches ?? false,
        minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
        shouldSort: params.fuseOpts.shouldsort ?? true,
        findAllMatches: params.fuseOpts.findallmatches ?? false,
        keys: params.fuseOpts.keys ?? defaultFuseOptions.keys,
        location: params.fuseOpts.location ?? 0,
        threshold: params.fuseOpts.threshold ?? defaultFuseOptions.threshold,
        distance: params.fuseOpts.distance ?? defaultFuseOptions.distance,
        ignoreLocation: params.fuseOpts.ignorelocation ?? defaultFuseOptions.ignoreLocation
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The index holds HTML-entity-encoded text (&rsquo; etc.); decode it to plain
// text first so escaping below doesn't double-encode. DOMParser runs no scripts.
const decodeEntities = (s) =>
    new DOMParser().parseFromString(s, 'text/html').documentElement.textContent;

const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// The sentence containing the query plus one on each side, with the query
// highlighted. Falls back to the opening of the post.
const buildSnippet = (content, query) => {
    let snippet = content.substring(0, 180);

    if (query.length > 1 && content) {
        const parts = content.split(/[\n.!?]/);
        const wordMatch = new RegExp(`\\b${escapeRegExp(query)}\\b`, 'i');
        const idx = parts.findIndex((p) => wordMatch.test(p));

        if (idx !== -1) {
            snippet = parts.slice(Math.max(0, idx - 1), idx + 2).join('. ').trim();
        }
    }

    snippet = snippet.replace(/\s+/g, ' ').substring(0, 300) + ' ...';
    snippet = escapeHTML(snippet);

    if (query.length > 1) {
        const highlight = new RegExp(`(${escapeRegExp(escapeHTML(query))})`, 'gi');
        snippet = snippet.replace(highlight, '<mark>$1</mark>');
    }

    return snippet;
};

const reset = () => {
    currentElement = null;
    firstResult = null;
    lastResult = null;
    resList.innerHTML = '';
    sInput.value = '';
    sInput.focus();
};

const setActiveResult = (element) => {
    document.querySelectorAll('.focus').forEach((item) => item.classList.remove('focus'));

    if (!element) {
        return;
    }

    element.focus();
    element.parentElement?.classList.add('focus');
    currentElement = element;
};

const renderResults = (results, query) => {
    if (!Array.isArray(results) || results.length === 0) {
        resList.innerHTML = '';
        firstResult = lastResult = currentElement = null;
        return;
    }

    const seen = new Set();
    let html = '';

    for (const { item } of results) {
        if (seen.has(item.permalink)) continue;
        seen.add(item.permalink);

        const title = escapeHTML(decodeEntities(item.title || 'Untitled'));
        const snippet = buildSnippet(decodeEntities(item.summary || item.content || ''), query);

        html += `<li class="post-entry search-result">`
            + `<a href="${escapeHTML(item.permalink)}" class="result-title">${title}</a>`
            + `<p class="result-snippet">${snippet}</p>`
            + `</li>`;
    }

    resList.innerHTML = html;
    firstResult = resList.firstElementChild;
    lastResult = resList.lastElementChild;
};

const performSearch = () => {
    if (!fuse) {
        return;
    }

    const query = sInput.value.trim();
    if (!query) {
        renderResults([]);
        return;
    }

    const searchOptions = params.fuseOpts?.limit ? { limit: params.fuseOpts.limit } : undefined;
    const results = searchOptions ? fuse.search(query, searchOptions) : fuse.search(query);
    renderResults(results, query);
};

const initSearch = async () => {
    if (!sInput || !resList) {
        return;
    }

    sInput.disabled = false;
    sInput.focus();

    try {
        const response = await fetch('../index.json');
        if (!response.ok) {
            throw new Error(`Search index load failed: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            fuse = new Fuse(data, buildFuseOptions());
            if (sInput.value.trim()) performSearch();
        }
    } catch (error) {
        console.error(error);
    }
};

window.addEventListener('load', initSearch);

sInput?.addEventListener('input', debounce(performSearch, 150));

sInput?.addEventListener('search', () => {
    if (!sInput.value) {
        reset();
    }
});

document.addEventListener('keydown', (event) => {
    const { key } = event;
    const active = document.activeElement;
    const isInSearchBox = searchBox?.contains(active);

    if (key === 'Escape') {
        reset();
        return;
    }

    if (!firstResult || !isInSearchBox) {
        return;
    }

    if (key === 'ArrowDown') {
        event.preventDefault();

        if (active === sInput) {
            setActiveResult(firstResult.querySelector('.result-title'));
        } else if (active?.parentElement !== lastResult) {
            setActiveResult(active?.parentElement?.nextElementSibling?.querySelector('.result-title'));
        }
    } else if (key === 'ArrowUp') {
        event.preventDefault();

        if (active?.parentElement === firstResult) {
            setActiveResult(sInput);
        } else if (active !== sInput) {
            setActiveResult(active?.parentElement?.previousElementSibling?.querySelector('.result-title'));
        }
    } else if (key === 'ArrowRight') {
        if (active?.matches?.('.result-title')) {
            active.click();
        }
    }
});
