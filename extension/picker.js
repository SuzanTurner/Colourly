/*
 * Colourly picker
 *
 * Features:
 * - Home / Favorites / History tabs
 * - Persistent history
 * - Persistent favorites
 * - Maximum 40 history items
 * - Maximum 40 favorites
 * - Copy individual values
 * - Copy all HEX values
 * - Dynamic Colourly gradient
 */

(function () {

    const WIDGET_ID = "colourly-widget";

    const MAX_HISTORY = 40;
    const MAX_FAVORITES = 40;

    const HISTORY_KEY = "colourly-history";
    const FAVORITES_KEY = "colourly-favorites";


    /*
     * Chrome only allows one EyeDropper open at a time —
     * calling `new EyeDropper()` while one is already
     * pending throws, and that throw was happening silently
     * (only visible in the page console), which is why
     * repeat clicks on the toolbar icon looked like nothing
     * was happening. `window` is used (not a local variable)
     * because this whole script re-runs from scratch on
     * every click, but `window` persists across those runs
     * for as long as the page is open.
     */

    if (window.__colourlyPicking) {

        console.log(
            "Colourly: a pick is already in progress — move to the page and click to select a colour."
        );

        return;

    }


    /* =================================
       STORAGE

       chrome.storage.local is used instead of
       localStorage. localStorage is scoped per
       *website origin*, so history/favorites saved
       on one site are invisible on every other site.
       chrome.storage.local is scoped to the extension
       itself, so the same data is shared everywhere.

       It's also async (returns Promises), so these
       functions — and everything that calls them —
       need to be async now.
    ================================= */

    async function getHistory() {

        try {

            const result =
                await chrome.storage.local.get(
                    HISTORY_KEY
                );

            return result[HISTORY_KEY] || [];

        }

        catch {

            return [];

        }

    }


    async function saveHistory(history) {

        await chrome.storage.local.set({
            [HISTORY_KEY]: history
        });

    }


    async function getFavorites() {

        try {

            const result =
                await chrome.storage.local.get(
                    FAVORITES_KEY
                );

            return result[FAVORITES_KEY] || [];

        }

        catch {

            return [];

        }

    }


    async function saveFavorites(favorites) {

        await chrome.storage.local.set({
            [FAVORITES_KEY]: favorites
        });

    }


    /* =================================
       HISTORY
    ================================= */

    async function addToHistory(hex) {

        let history =
            await getHistory();


        /*
         * Remove duplicate if it already exists.
         */

        history =
            history.filter(
                colour => colour !== hex
            );


        /*
         * Newest colour goes first.
         */

        history.unshift(hex);


        /*
         * Keep only the newest 40.
         */

        history =
            history.slice(
                0,
                MAX_HISTORY
            );


        await saveHistory(history);

    }


    /* =================================
       FAVORITES
    ================================= */

    async function isFavorite(hex) {

        const favorites =
            await getFavorites();

        return favorites.includes(hex);

    }


    async function toggleFavorite(hex) {

        let favorites =
            await getFavorites();


        if (
            favorites.includes(hex)
        ) {

            favorites =
                favorites.filter(
                    colour =>
                        colour !== hex
                );

        }

        else {

            /*
             * Newest favorite goes first.
             */

            favorites.unshift(hex);


            favorites =
                favorites.slice(
                    0,
                    MAX_FAVORITES
                );

        }


        await saveFavorites(favorites);

    }


    /* =================================
       START EYEDROPPER
    ================================= */

    async function pickColour() {

        if (!window.EyeDropper) {

            alert(
                "Colourly: your browser doesn't support the EyeDropper API."
            );

            return;

        }


        try {

            window.__colourlyPicking = true;

            const eyeDropper =
                new EyeDropper();


            const result =
                await eyeDropper.open();


            const hex =
                result.sRGBHex.toUpperCase();

            renderWidget(hex);

            addToHistory(hex);


            await addToHistory(hex);

            await renderWidget(hex);

        }

        catch {

            console.log(
                "Colourly: pick cancelled."
            );

        }

        finally {

            window.__colourlyPicking = false;

        }

    }


    /* =================================
       COLOUR CONVERSIONS
    ================================= */

    function hexToRgb(hex) {

        const value =
            hex.replace("#", "");


        return {

            r: parseInt(
                value.substring(0, 2),
                16
            ),

            g: parseInt(
                value.substring(2, 4),
                16
            ),

            b: parseInt(
                value.substring(4, 6),
                16
            )

        };

    }


    function rgbToHsl(r, g, b) {

        r /= 255;
        g /= 255;
        b /= 255;


        const max =
            Math.max(r, g, b);

        const min =
            Math.min(r, g, b);


        let h = 0;
        let s = 0;


        const l =
            (max + min) / 2;


        if (max !== min) {

            const d =
                max - min;


            s =
                l > 0.5
                    ? d / (2 - max - min)
                    : d / (max + min);


            switch (max) {

                case r:

                    h =
                        (g - b) / d +
                        (g < b ? 6 : 0);

                    break;

                case g:

                    h =
                        (b - r) / d + 2;

                    break;

                case b:

                    h =
                        (r - g) / d + 4;

                    break;

            }


            h /= 6;

        }


        return {

            h: Math.round(h * 360),

            s: Math.round(s * 100),

            l: Math.round(l * 100)

        };

    }


    function rgbToCmyk(r, g, b) {

        const R = r / 255;
        const G = g / 255;
        const B = b / 255;


        const k =
            1 -
            Math.max(
                R,
                G,
                B
            );


        if (k >= 0.999999) {

            return {

                c: 0,
                m: 0,
                y: 0,
                k: 100

            };

        }


        return {

            c: Math.round(
                ((1 - R - k) /
                    (1 - k)) * 100
            ),

            m: Math.round(
                ((1 - G - k) /
                    (1 - k)) * 100
            ),

            y: Math.round(
                ((1 - B - k) /
                    (1 - k)) * 100
            ),

            k: Math.round(
                k * 100
            )

        };

    }


    /* =================================
       RENDER WIDGET
    ================================= */

    async function renderWidget(hex) {

        const colourResult =
        await getColourName(hex);

        const colourName =
        colourResult.name;

        const colourNameClass =
    colourResult.exact
        ? "cw-colour-name cw-exact"
        : "cw-colour-name";

        let widget =
            document.getElementById(
                WIDGET_ID
            );


        if (!widget) {

            widget =
                document.createElement(
                    "div"
                );


            widget.id =
                WIDGET_ID;


            document.documentElement
                .appendChild(widget);


            makeDraggable(widget);

        }


        const rgb =
            hexToRgb(hex);


        const hsl =
            rgbToHsl(
                rgb.r,
                rgb.g,
                rgb.b
            );


        const cmyk =
            rgbToCmyk(
                rgb.r,
                rgb.g,
                rgb.b
            );


        const rgbText =
            `${rgb.r}, ${rgb.g}, ${rgb.b}`;


        const hslText =
            `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;


        const cmykText =
            `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;


        const favorite =
            await isFavorite(hex);


        /* =================================
           DYNAMIC GRADIENT
        ================================= */

        widget.style.background = `

            radial-gradient(
                circle at 0% 0%,

                rgba(
                    ${rgb.r},
                    ${rgb.g},
                    ${rgb.b},
                    0.42
                ),

                rgba(
                    ${rgb.r},
                    ${rgb.g},
                    ${rgb.b},
                    0.18
                ) 40%,

                rgba(
                    255,
                    255,
                    255,
                    0
                ) 70%
            ),

            radial-gradient(
                circle at 100% 100%,

                rgba(
                    ${rgb.r},
                    ${rgb.g},
                    ${rgb.b},
                    0.38
                ),

                rgba(
                    ${rgb.r},
                    ${rgb.g},
                    ${rgb.b},
                    0.15
                ) 40%,

                rgba(
                    255,
                    255,
                    255,
                    0
                ) 70%
            ),

            #ffffff
        `;


        /* =================================
           HOME
        ================================= */

        widget.innerHTML = `

            <div class="cw-tabs">

                <button
                    class="cw-tab active"
                    data-tab="home"
                >
                    Home
                </button>

                <button
                    class="cw-tab"
                    data-tab="favorites"
                >
                    Favorites
                </button>

                <button
                    class="cw-tab"
                    data-tab="history"
                >
                    History
                </button>

            </div>


            <div class="cw-view cw-home-view">

                <button
                    class="cw-close"
                    title="Close"
                >
                    &times;
                </button>


                <div class="cw-top">

                    <div
                        class="cw-swatch"
                        style="background:${hex}"
                    ></div>


                    <div class="cw-hex">

                        <span class="cw-label">
                            HEX
                        </span>


                        <div class="cw-hexrow">

                            <strong>
                                ${hex}
                            </strong>


                            <button
                                class="cw-star ${favorite ? "active" : ""}"
                                data-action="favorite"
                                title="${favorite ? "Remove from favorites" : "Add to favorites"}"
                            >
                                ${favorite ? "★" : "☆"}
                            </button>


                            <button
                                class="cw-copy"
                                data-value="${hex}"
                                title="Copy HEX"
                            >
                                &#10697;
                            </button>

                        </div>
                           <span class="${colourNameClass}">
                              ${colourName}
                            </span>

                    </div>

                </div>


                <div class="cw-rows">

                    <div class="cw-row">

                        <span class="cw-label">
                            RGB
                        </span>

                        <strong>
                            ${rgbText}
                        </strong>

                        <button
                            class="cw-copy"
                            data-value="${rgbText}"
                        >
                            &#10697;
                        </button>

                    </div>


                    <div class="cw-row">

                        <span class="cw-label">
                            HSL
                        </span>

                        <strong>
                            ${hslText}
                        </strong>

                        <button
                            class="cw-copy"
                            data-value="${hslText}"
                        >
                            &#10697;
                        </button>

                    </div>


                    <div class="cw-row">

                        <span class="cw-label">
                            CMYK
                        </span>

                        <strong>
                            ${cmykText}
                        </strong>

                        <button
                            class="cw-copy"
                            data-value="${cmykText}"
                        >
                            &#10697;
                        </button>

                    </div>

                </div>


                <button
                    class="cw-pick-again"
                >
                    Pick another colour
                </button>

            </div>


            <div
                class="cw-view cw-list-view"
                data-view="favorites"
                hidden
            ></div>


            <div
                class="cw-view cw-list-view"
                data-view="history"
                hidden
            ></div>

        `;


        setupWidgetEvents(
            widget,
            hex
        );

    }


    /* =================================
       TAB / BUTTON EVENTS
    ================================= */

    function setupWidgetEvents(
        widget,
        currentHex
    ) {

        const tabs =
            widget.querySelectorAll(
                ".cw-tab"
            );


        tabs.forEach(tab => {

            tab.addEventListener(
                "click",
                async () => {

                    await switchTab(
                        widget,
                        tab.dataset.tab,
                        currentHex
                    );

                }
            );

        });


        widget
            .querySelector(".cw-close")
            .addEventListener(
                "click",
                () => {

                    widget.remove();

                }
            );


        widget
            .querySelector(".cw-pick-again")
            .addEventListener(
                "click",
                pickColour
            );


        widget
            .querySelectorAll(".cw-copy")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        copyValue(
                            button
                        );

                    }
                );

            });


        const star =
            widget.querySelector(
                ".cw-star"
            );


        star.addEventListener(
            "click",
            async () => {

                await toggleFavorite(
                    currentHex
                );


                await renderWidget(
                    currentHex
                );

            }
        );

    }


    /* =================================
       SWITCH TABS
    ================================= */

    async function switchTab(
        widget,
        tabName,
        currentHex
    ) {

        widget
            .querySelectorAll(
                ".cw-tab"
            )
            .forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.tab ===
                    tabName
                );

            });


        const home =
            widget.querySelector(
                ".cw-home-view"
            );


        const favorites =
            widget.querySelector(
                '[data-view="favorites"]'
            );


        const history =
            widget.querySelector(
                '[data-view="history"]'
            );


        home.hidden =
            tabName !== "home";


        favorites.hidden =
            tabName !== "favorites";


        history.hidden =
            tabName !== "history";


        if (
            tabName === "favorites"
        ) {

            renderList(
                favorites,
                await getFavorites(),
                "favorites",
                currentHex
            );

        }


        if (
            tabName === "history"
        ) {

            renderList(
                history,
                await getHistory(),
                "history",
                currentHex
            );

        }

    }


    /* =================================
       RENDER HISTORY / FAVORITES
    ================================= */

    function renderList(
        container,
        colours,
        type,
        currentHex
    ) {

        const title =
            type === "favorites"
                ? "Favorites"
                : "History";


        if (!colours.length) {

            container.innerHTML = `

                <div class="cw-list-header">

                    <strong>
                        ${title}
                    </strong>

                </div>


                <div class="cw-empty">

                    ${
                        type === "favorites"
                            ? "No favorite colours yet."
                            : "Your picked colours will appear here."
                    }

                </div>

            `;

            return;

        }


        const items =
    colours
        .map(
            colour => `

                <div
                    class="cw-history-item"
                    data-colour="${colour}"
                >

                    <span
                        class="cw-history-swatch"
                        style="background:${colour}"
                    ></span>


                    <strong>
                        ${colour}
                    </strong>


                    ${
                        type === "favorites"
                            ? `
                                <button
                                    class="cw-unfavorite"
                                    data-value="${colour}"
                                    title="Remove from favorites"
                                >
                                    ★
                                </button>
                              `
                            : ""
                    }


                    <button
                        class="cw-list-copy"
                        data-value="${colour}"
                        title="Copy"
                    >
                        &#10697;
                    </button>

                </div>

            `
        )
        .join("");


        container.innerHTML = `

            <div class="cw-list-header">

                <strong>
                    ${title}
                </strong>


                <button
                    class="cw-copy-all"
                    data-type="${type}"
                >
                    Copy all
                </button>

            </div>


            <div class="cw-list">

                ${items}

            </div>


            <div class="cw-list-footer">

                <button
                    class="cw-clear"
                    data-type="${type}"
                >
                    ${
                        type === "history"
                            ? "Clear history"
                            : "Clear favorites"
                    }
                </button>

            </div>

        `;


        /* ---------------------------------
           Copy individual colour
        --------------------------------- */

        container
            .querySelectorAll(
                ".cw-list-copy"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        copyValue(
                            button
                        );

                    }
                );

            });

        /* ---------------------------------
   Unfavorite
--------------------------------- */

if (type === "favorites") {

    container
        .querySelectorAll(".cw-unfavorite")
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const colour =
                        button.dataset.value;

                    let favorites =
                        await getFavorites();

                    favorites =
                        favorites.filter(
                            item =>
                                item !== colour
                        );

                    await saveFavorites(
                        favorites
                    );


                    /*
                     * Refresh the favorites
                     * list without leaving
                     * the tab.
                     */

                    renderList(
                        container,
                        await getFavorites(),
                        "favorites",
                        currentHex
                    );

                }
            );

        });

}
        /* ---------------------------------
           Click colour
        --------------------------------- */

        container
            .querySelectorAll(
                ".cw-history-item"
            )
            .forEach(item => {

                item.addEventListener(
                    "click",
                    async () => {

                        const colour =
                            item.dataset.colour;


                        await addToHistory(
                            colour
                        );


                        await renderWidget(
                            colour
                        );

                    }
                );

            });


        /* ---------------------------------
           Copy all
        --------------------------------- */

        container
            .querySelector(
                ".cw-copy-all"
            )
            .addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    copyAll(
                        colours,
                        event.currentTarget
                    );

                }
            );


        /* ---------------------------------
           Clear
        --------------------------------- */

        container
            .querySelector(
                ".cw-clear"
            )
            .addEventListener(
                "click",
                async event => {

                    event.stopPropagation();


                    if (
                        type === "history"
                    ) {

                        await chrome.storage.local.remove(
                            HISTORY_KEY
                        );

                    }

                    else {

                        await chrome.storage.local.remove(
                            FAVORITES_KEY
                        );

                    }


                    await switchTab(
                        container.closest(
                            "#colourly-widget"
                        ),
                        type,
                        currentHex
                    );

                }
            );

    }


    /* =================================
       COPY VALUE
    ================================= */

    async function copyValue(
        button
    ) {

        try {

            await navigator
                .clipboard
                .writeText(
                    button.dataset.value
                );


            const original =
                button.innerHTML;


            button.textContent =
                "✓";


            setTimeout(
                () => {

                    button.innerHTML =
                        original;

                },
                700
            );

        }

        catch (error) {

            console.error(
                "Colourly: copy failed.",
                error
            );

        }

    }


    /* =================================
       COPY ALL
    ================================= */

    async function copyAll(
        colours,
        button
    ) {

        try {

            await navigator
                .clipboard
                .writeText(
                    colours.join("\n")
                );


            const original =
                button.textContent;


            button.textContent =
                "Copied!";


            setTimeout(
                () => {

                    button.textContent =
                        original;

                },
                900
            );

        }

        catch (error) {

            console.error(
                "Colourly: copy all failed.",
                error
            );

        }

    }


    /* =================================
       DRAG
    ================================= */

    function makeDraggable(widget) {

        let isDragging = false;

        let offsetX = 0;
        let offsetY = 0;


        widget.addEventListener(
            "mousedown",
            event => {

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;

                }


                isDragging = true;


                const rect =
                    widget.getBoundingClientRect();


                offsetX =
                    event.clientX -
                    rect.left;


                offsetY =
                    event.clientY -
                    rect.top;


                widget.style.left =
                    `${rect.left}px`;


                widget.style.top =
                    `${rect.top}px`;


                widget.style.right =
                    "auto";


                widget.classList.add(
                    "cw-dragging"
                );


                event.preventDefault();

            }
        );


        document.addEventListener(
            "mousemove",
            event => {

                if (!isDragging) {
                    return;
                }


                widget.style.left =
                    `${event.clientX - offsetX}px`;


                widget.style.top =
                    `${event.clientY - offsetY}px`;

            }
        );


        document.addEventListener(
            "mouseup",
            () => {

                isDragging = false;


                widget.classList.remove(
                    "cw-dragging"
                );

            }
        );

    }


    /* =================================
       START
    ================================= */

    pickColour();

})();