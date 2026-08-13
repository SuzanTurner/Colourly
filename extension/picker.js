/*
 * Colourly picker — runs directly on the page.
 *
 * Wrapped in an IIFE so re-injecting it (clicking the
 * icon again) never collides with anything already
 * declared from a previous run.
 */

(function () {

    const WIDGET_ID = "colourly-widget";


    /* =================================
       START THE EYEDROPPER
    ================================= */

    async function pickColour() {

        if (!window.EyeDropper) {

            alert(
                "Colourly: your browser doesn't support the EyeDropper API yet."
            );

            return;

        }

        try {

            const eyeDropper = new EyeDropper();

            const result = await eyeDropper.open();

            renderWidget(
                result.sRGBHex.toUpperCase()
            );

        }

        catch (error) {

            /*
             * User pressed Escape or clicked away —
             * not a real error, just a cancelled pick.
             */

            console.log(
                "Colourly: pick cancelled."
            );

        }

    }


    /* =================================
       COLOUR CONVERSIONS
    ================================= */

    function hexToRgb(hex) {

        const value = hex.replace("#", "");

        return {
            r: parseInt(value.substring(0, 2), 16),
            g: parseInt(value.substring(2, 4), 16),
            b: parseInt(value.substring(4, 6), 16)
        };

    }

    function rgbToHsl(r, g, b) {

        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {

            const d = max - min;

            s = l > 0.5
                ? d / (2 - max - min)
                : d / (max + min);

            switch (max) {

                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
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

        const k = 1 - Math.max(R, G, B);

        if (k >= 0.999999) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        return {
            c: Math.round(((1 - R - k) / (1 - k)) * 100),
            m: Math.round(((1 - G - k) / (1 - k)) * 100),
            y: Math.round(((1 - B - k) / (1 - k)) * 100),
            k: Math.round(k * 100)
        };

    }


    /* =================================
       RENDER THE FLOATING CARD
    ================================= */

    function renderWidget(hex) {

        let widget = document.getElementById(WIDGET_ID);

        if (!widget) {

            widget = document.createElement("div");
            widget.id = WIDGET_ID;
            document.documentElement.appendChild(widget);

            makeDraggable(widget);

        }

        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

        const rgbText = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        const hslText = `${hsl.h}\u00B0, ${hsl.s}%, ${hsl.l}%`;
        const cmykText = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;

        widget.innerHTML = `
            <button class="cw-close" title="Close">&times;</button>
            <div class="cw-top">
                <div class="cw-swatch" style="background:${hex}"></div>
                <div class="cw-hex">
                    <span class="cw-label">HEX</span>
                    <div class="cw-hexrow">
                        <strong>${hex}</strong>
                        <button class="cw-copy" data-value="${hex}">&#10697;</button>
                    </div>
                </div>
            </div>
            <div class="cw-rows">
                <div class="cw-row">
                    <span class="cw-label">RGB</span>
                    <strong>${rgbText}</strong>
                    <button class="cw-copy" data-value="${rgbText}">&#10697;</button>
                </div>
                <div class="cw-row">
                    <span class="cw-label">HSL</span>
                    <strong>${hslText}</strong>
                    <button class="cw-copy" data-value="${hslText}">&#10697;</button>
                </div>
                <div class="cw-row">
                    <span class="cw-label">CMYK</span>
                    <strong>${cmykText}</strong>
                    <button class="cw-copy" data-value="${cmykText}">&#10697;</button>
                </div>
            </div>
            <button class="cw-pick-again">Pick another colour</button>
        `;

        widget
            .querySelector(".cw-close")
            .addEventListener("click", () => widget.remove());

        widget
            .querySelectorAll(".cw-copy")
            .forEach((button) => {

                button.addEventListener("click", async () => {

                    try {

                        await navigator.clipboard.writeText(
                            button.dataset.value
                        );

                        const original = button.innerHTML;

                        button.textContent = "\u2713";

                        setTimeout(() => {
                            button.innerHTML = original;
                        }, 800);

                    }

                    catch (error) {

                        console.error(
                            "Colourly: copy failed.",
                            error
                        );

                    }

                });

            });

        widget
            .querySelector(".cw-pick-again")
            .addEventListener("click", pickColour);

    }
function renderWidget(hex) {

    let widget =
        document.getElementById(WIDGET_ID);


    if (!widget) {

        widget =
            document.createElement("div");

        widget.id =
            WIDGET_ID;

        document.documentElement
            .appendChild(widget);

        makeDraggable(widget);

    }


    /* =================================
       COLOUR VALUES
    ================================= */

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


    /* =================================
       COLOURLY RADIAL GRADIENT
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
       RENDER WIDGET
    ================================= */

    widget.innerHTML = `

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
                        class="cw-copy"
                        data-value="${hex}"
                    >
                        &#10697;
                    </button>

                </div>

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

    `;


    /* =================================
       CLOSE
    ================================= */

    widget
        .querySelector(".cw-close")
        .addEventListener(
            "click",
            () => {

                widget.remove();

            }
        );


    /* =================================
       COPY
    ================================= */

    widget
        .querySelectorAll(".cw-copy")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

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


                        setTimeout(() => {

                            button.innerHTML =
                                original;

                        }, 800);

                    }

                    catch (error) {

                        console.error(
                            "Colourly: copy failed.",
                            error
                        );

                    }

                }
            );

        });


    /* =================================
       PICK AGAIN
    ================================= */

    widget
        .querySelector(
            ".cw-pick-again"
        )
        .addEventListener(
            "click",
            pickColour
        );

}

    /* =================================
       DRAG TO MOVE
       Attached once per widget element,
       not re-attached on every renderWidget()
       call, so listeners don't stack up.
    ================================= */

    function makeDraggable(widget) {

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        widget.addEventListener("mousedown", (event) => {

            /*
             * Don't start a drag if the click
             * was on a button (close / copy / pick again).
             */

            if (event.target.closest("button")) {
                return;
            }

            isDragging = true;

            const rect = widget.getBoundingClientRect();

            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            /* Switch from top/right to left/top so it can move freely. */

            widget.style.left = `${rect.left}px`;
            widget.style.top = `${rect.top}px`;
            widget.style.right = "auto";

            widget.classList.add("cw-dragging");

            event.preventDefault();

        });

        document.addEventListener("mousemove", (event) => {

            if (!isDragging) {
                return;
            }

            widget.style.left = `${event.clientX - offsetX}px`;
            widget.style.top = `${event.clientY - offsetY}px`;

        });

        document.addEventListener("mouseup", () => {

            isDragging = false;

            widget.classList.remove("cw-dragging");

        });

    }


    /*
     * Kick things off the moment this script is injected —
     * that's the "hover and capture" step the user wants.
     */

    pickColour();

})();
