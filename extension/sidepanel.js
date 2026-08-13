const colourPreview =
    document.getElementById("colour-preview");

const hexValue =
    document.getElementById("hex-value");

const rgbValue =
    document.getElementById("rgb-value");

const hslValue =
    document.getElementById("hsl-value");

const cmykValue =
    document.getElementById("cmyk-value");


/* =================================
   RECEIVE LIVE COLOUR
================================= */

chrome.runtime.onMessage.addListener((message) => {

    if (message.type !== "COLOUR_UPDATE") {
        return;
    }

    updateColour(
        message.r,
        message.g,
        message.b
    );

});


/* =================================
   UPDATE COLOUR
================================= */

function updateColour(r, g, b) {

    const hex =
        rgbToHex(r, g, b);

    const hsl =
        rgbToHsl(r, g, b);

    const cmyk =
        rgbToCmyk(r, g, b);


    /* -----------------------------
       Colour preview
    ----------------------------- */

    colourPreview.style.backgroundColor =
        hex;


    /* -----------------------------
       Values
    ----------------------------- */

    hexValue.textContent =
        hex;

    rgbValue.textContent =
        `${r}, ${g}, ${b}`;

    hslValue.textContent =
        `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;

    cmykValue.textContent =
        `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;


    /* -----------------------------
       Colourly background
    ----------------------------- */

    document.body.style.setProperty(
        "--selected-rgb",
        `${r}, ${g}, ${b}`
    );

}


/* =================================
   RGB → HEX
================================= */

function rgbToHex(r, g, b) {

    return (
        "#" +

        [r, g, b]
            .map(value =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
            .toUpperCase()
    );

}


/* =================================
   RGB → HSL
================================= */

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


/* =================================
   RGB → CMYK
================================= */

function rgbToCmyk(r, g, b) {

    const R = r / 255;
    const G = g / 255;
    const B = b / 255;


    const k =
        1 -
        Math.max(R, G, B);


    /* Pure black */

    if (k >= 0.999999) {

        return {
            c: 0,
            m: 0,
            y: 0,
            k: 100
        };

    }


    const c =
        (1 - R - k) /
        (1 - k);

    const m =
        (1 - G - k) /
        (1 - k);

    const y =
        (1 - B - k) /
        (1 - k);


    return {

        c: Math.round(c * 100),

        m: Math.round(m * 100),

        y: Math.round(y * 100),

        k: Math.round(k * 100)

    };

}


/* =================================
   COPY VALUES
================================= */

document
    .querySelectorAll(".copy-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const element =
                    document.getElementById(
                        button.dataset.copy
                    );


                if (!element) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        element.textContent
                    );


                    const oldText =
                        button.textContent;


                    button.textContent =
                        "✓";


                    setTimeout(() => {

                        button.textContent =
                            oldText;

                    }, 800);

                }

                catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                }

            }
        );

    });