import * as params from '@params';

let fuse; // holds our search engine
let resList = document.getElementById('searchResults');
let sInput = document.getElementById('searchInput');
let first, last, current_elem = null
let resultsAvailable = false;

// load our search index
window.onload = function () {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data) {
                    // fuse.js options; check fuse.js website for details
                    let options = {
                        distance: 100,
                        threshold: 0.4,
                        ignoreLocation: true,
                        keys: [
                            'title',
                            'permalink',
                            'summary',
                            'content'
                        ]
                    };
                    if (params.fuseOpts) {
                        options = {
                            isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
                            includeScore: params.fuseOpts.includescore ?? false,
                            includeMatches: params.fuseOpts.includematches ?? false,
                            minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
                            shouldSort: params.fuseOpts.shouldsort ?? true,
                            findAllMatches: params.fuseOpts.findallmatches ?? false,
                            keys: params.fuseOpts.keys ?? ['title', 'permalink', 'summary', 'content'],
                            location: params.fuseOpts.location ?? 0,
                            threshold: params.fuseOpts.threshold ?? 0.4,
                            distance: params.fuseOpts.distance ?? 100,
                            ignoreLocation: params.fuseOpts.ignorelocation ?? true
                        }
                    }
                    fuse = new Fuse(data, options); // build the index from the json file
                }
            } else {
                console.log(xhr.responseText);
            }
        }
    };
    xhr.open('GET', "../index.json");
    xhr.send();
}

function activeToggle(ae) {
    document.querySelectorAll('.focus').forEach(function (element) {
        // rm focus class
        element.classList.remove("focus")
    });
    if (ae) {
        ae.focus()
        document.activeElement = current_elem = ae;
        ae.parentElement.classList.add("focus")
    } else {
        document.activeElement.parentElement.classList.add("focus")
    }
}

function reset() {
    resultsAvailable = false;
    resList.innerHTML = sInput.value = ''; // clear inputbox and searchResults
    sInput.focus(); // shift focus to input box
}

// execute search as each character is typed
sInput.onkeyup = function (e) {
    // run a search query (for "term") every time a letter is typed
    // in the search box
    if (fuse) {
        let results;
        if (params.fuseOpts) {
            results = fuse.search(this.value.trim(), { limit: params.fuseOpts.limit }); // the actual query being run using fuse.js along with options
        } else {
            results = fuse.search(this.value.trim()); // the actual query being run using fuse.js
        }


        if (results.length !== 0) {
            // Track unique results by permalink
            const seen = new Set();
            let resultSet = "";

            for (let i = 0; i < results.length; i++) {
                const post = results[i].item;

                // Skip duplicates
                if (seen.has(post.permalink)) continue;
                seen.add(post.permalink);

                // Extract data
                const title = post.title || "Untitled";
                const permalink = post.permalink;
                const content = post.summary || post.content || "";
                const query = this.value.trim();

                // --- Smarter snippet extraction: show exact matching line or nearby sentences ---
                let snippet = "";
                if (query.length > 1 && content) {
                    // Split into lines or sentences to catch keyword context
                    const parts = content.split(/[\n.!?]/);
                    const found = parts.find(p => new RegExp(`\\b${query}\\b`, "i").test(p.trim()));

                    if (found) {
                        // Include a little context before and after if available
                        const idx = parts.indexOf(found);
                        const start = Math.max(0, idx - 1);
                        const end = Math.min(parts.length, idx + 2);
                        snippet = parts.slice(start, end).join(". ").trim() + " ...";
                    } else {
                        snippet = content.substring(0, 180) + " ...";
                    }

                    // Highlight query
                    const highlight = new RegExp(`(${query})`, "gi");
                    snippet = snippet.replace(highlight, "<mark>$1</mark>");
                    // Clean excessive newlines and multiple spaces
                    snippet = snippet.replace(/\n+/g, " ");   // remove line breaks
                    snippet = snippet.replace(/\s{2,}/g, " "); // collapse extra spaces
                } else {
                    snippet = content.substring(0, 180) + " ...";
                }

                if (snippet.length > 300) {
                    snippet = snippet.substring(0, 300) + " ...";
                }
                // Build HTML
                resultSet += `
      <li class="post-entry search-result">
        <a href="${permalink}" class="result-title">${title}</a>
        <p class="result-snippet">${snippet}</p>
      </li>`;
            }

            resList.innerHTML = resultSet;
            resultsAvailable = true;
            first = resList.firstChild;
            last = resList.lastChild;
        } else {
            resultsAvailable = false;
            resList.innerHTML = '';
        }
    }
}

sInput.addEventListener('search', function (e) {
    // clicked on x
    if (!this.value) reset()
})

// kb bindings
document.onkeydown = function (e) {
    let key = e.key;
    let ae = document.activeElement;

    let inbox = document.getElementById("searchbox").contains(ae)

    if (ae === sInput) {
        let elements = document.getElementsByClassName('focus');
        while (elements.length > 0) {
            elements[0].classList.remove('focus');
        }
    } else if (current_elem) ae = current_elem;

    if (key === "Escape") {
        reset()
    } else if (!resultsAvailable || !inbox) {
        return
    } else if (key === "ArrowDown") {
        e.preventDefault();
        if (ae == sInput) {
            // if the currently focused element is the search input, focus the <a> of first <li>
            activeToggle(resList.firstChild.lastChild);
        } else if (ae.parentElement != last) {
            // if the currently focused element's parent is last, do nothing
            // otherwise select the next search result
            activeToggle(ae.parentElement.nextSibling.lastChild);
        }
    } else if (key === "ArrowUp") {
        e.preventDefault();
        if (ae.parentElement == first) {
            // if the currently focused element is first item, go to input box
            activeToggle(sInput);
        } else if (ae != sInput) {
            // if the currently focused element is input box, do nothing
            // otherwise select the previous search result
            activeToggle(ae.parentElement.previousSibling.lastChild);
        }
    } else if (key === "ArrowRight") {
        ae.click(); // click on active link
    }
}
