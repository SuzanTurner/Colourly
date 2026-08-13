const colourPreview =
    document.getElementById(
        "colour-preview"
    );

const hexValue =
    document.getElementById(
        "hex-value"
    );

const rgbValue =
    document.getElementById(
        "rgb-value"
    );

const hslValue =
    document.getElementById(
        "hsl-value"
    );

const cmykValue =
    document.getElementById(
        "cmyk-value"
    );


/* =================================
   RECEIVE SELECTED COLOUR
================================= */

chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.type !==
            "COLOUR_SELECTED"
        ) {
            return;
        }


        updateColour(
            message.hex
        );

    }
);


/* =================================
   UPDATE COLOUR
================================= */

function updateColour(hex) {

    hex =
        hex.toUpperCase();


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


    /* Preview */

    colourPreview.style.backgroundColor =
        hex;


    /* HEX */

    hexValue.textContent =
        hex;


    /* RGB */

    rgbValue.textContent =
        `${rgb.r}, ${rgb.g}, ${rgb.b}`;


    /* HSL */

    hslValue.textContent =
        `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;


    /* CMYK */

    cmykValue.textContent =
        `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;


    /* Colourly gradient */

    document.body.style.setProperty(

        "--selected-rgb",

        `${rgb.r}, ${rgb.g}, ${rgb.b}`

    );

}


/* =================================
   HEX → RGB
================================= */

function hexToRgb(hex) {

    const value =
        hex.replace(
            "#",
            ""
        );


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


/* =================================
   RGB → HSL
================================= */

function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;


    const max =
        Math.max(
            r,
            g,
            b
        );

    const min =
        Math.min(
            r,
            g,
            b
        );


    let h = 0;
    let s = 0;


    const l =
        (max + min) / 2;


    if (max !== min) {

        const d =
            max - min;


        s =
            l > 0.5
                ? d /
                  (2 - max - min)
                : d /
                  (max + min);


        switch (max) {

            case r:

                h =
                    (g - b) /
                    d +
                    (g < b ? 6 : 0);

                break;


            case g:

                h =
                    (b - r) /
                    d +
                    2;

                break;


            case b:

                h =
                    (r - g) /
                    d +
                    4;

                break;

        }


        h /= 6;

    }


    return {

        h: Math.round(
            h * 360
        ),

        s: Math.round(
            s * 100
        ),

        l: Math.round(
            l * 100
        )

    };

}


/* =================================
   RGB → CMYK
================================= */

function rgbToCmyk(r, g, b) {

    const R =
        r / 255;

    const G =
        g / 255;

    const B =
        b / 255;


    const k =
        1 -
        Math.max(
            R,
            G,
            B
        );


    if (
        k >= 0.999999
    ) {

        return {

            c: 0,
            m: 0,
            y: 0,
            k: 100

        };

    }


    return {

        c: Math.round(
            (
                (1 - R - k) /
                (1 - k)
            ) * 100
        ),

        m: Math.round(
            (
                (1 - G - k) /
                (1 - k)
            ) * 100
        ),

        y: Math.round(
            (
                (1 - B - k) /
                (1 - k)
            ) * 100
        ),

        k: Math.round(
            k * 100
        )

    };

}


/* =================================
   COPY
================================= */

document
    .querySelectorAll(
        ".copy-button"
    )
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

                    await navigator
                        .clipboard
                        .writeText(
                            element.textContent
                        );


                    const original =
                        button.textContent;


                    button.textContent =
                        "✓";


                    setTimeout(() => {

                        button.textContent =
                            original;

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