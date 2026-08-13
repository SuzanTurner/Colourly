/*
 * Colourly — Colour Name Matcher
 *
 * 1. Exact HEX match → return the exact database name.
 * 2. No exact match → find the perceptually closest colour
 *    using CIE Lab + CIE76 Delta E.
 */

let colourDatabase = null;
let colourDatabaseLab = null;


/* =================================
   LOAD COLOUR DATABASE
================================= */

async function loadColourDatabase() {

    if (colourDatabase) {
        return;
    }

    try {

        const response = await fetch(
            chrome.runtime.getURL("colors.json")
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load colors.json: ${response.status}`
            );
        }

        colourDatabase =
            await response.json();


        /*
         * Precalculate Lab values once.
         *
         * We don't want to convert all 600+
         * colours every time the user picks one.
         */

        colourDatabaseLab =
            Object.entries(
                colourDatabase
            ).map(
                ([hex, name]) => ({

                    hex:
                        hex.toUpperCase(),

                    name,

                    lab:
                        hexToLab(hex)

                })
            );


        console.log(
            `Colourly: loaded ${colourDatabaseLab.length} named colours.`
        );

    }

    catch (error) {

        console.error(
            "Colourly: failed to load colour database.",
            error
        );

        colourDatabase = {};
        colourDatabaseLab = [];

    }

}


/* =================================
   HEX → RGB
================================= */

function hexToRgb(hex) {

    const value =
        hex
            .replace("#", "")
            .toUpperCase();


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
   RGB → XYZ
================================= */

function rgbToXyz(
    r,
    g,
    b
) {

    /*
     * Normalize RGB.
     */

    r /= 255;
    g /= 255;
    b /= 255;


    /*
     * sRGB → linear RGB
     */

    r =
        r > 0.04045
            ? Math.pow(
                (r + 0.055) / 1.055,
                2.4
            )
            : r / 12.92;


    g =
        g > 0.04045
            ? Math.pow(
                (g + 0.055) / 1.055,
                2.4
            )
            : g / 12.92;


    b =
        b > 0.04045
            ? Math.pow(
                (b + 0.055) / 1.055,
                2.4
            )
            : b / 12.92;


    /*
     * Convert to XYZ.
     */

    r *= 100;
    g *= 100;
    b *= 100;


    return {

        x:
            r * 0.4124 +
            g * 0.3576 +
            b * 0.1805,

        y:
            r * 0.2126 +
            g * 0.7152 +
            b * 0.0722,

        z:
            r * 0.0193 +
            g * 0.1192 +
            b * 0.9505

    };

}


/* =================================
   XYZ → CIE LAB
================================= */

function xyzToLab(
    x,
    y,
    z
) {

    /*
     * D65 reference white.
     */

    const refX = 95.047;
    const refY = 100.000;
    const refZ = 108.883;


    x /= refX;
    y /= refY;
    z /= refZ;


    const epsilon =
        0.008856;

    const kappa =
        903.3;


    function pivot(
        value
    ) {

        return value > epsilon

            ? Math.cbrt(value)

            : (
                kappa * value + 16
            ) / 116;

    }


    const fx =
        pivot(x);

    const fy =
        pivot(y);

    const fz =
        pivot(z);


    return {

        l:
            116 * fy - 16,

        a:
            500 * (fx - fy),

        b:
            200 * (fy - fz)

    };

}


/* =================================
   HEX → LAB
================================= */

function hexToLab(
    hex
) {

    const rgb =
        hexToRgb(hex);


    const xyz =
        rgbToXyz(
            rgb.r,
            rgb.g,
            rgb.b
        );


    return xyzToLab(
        xyz.x,
        xyz.y,
        xyz.z
    );

}


/* =================================
   CIE76 DELTA E
================================= */

function deltaE(
    lab1,
    lab2
) {

    const deltaL =
        lab1.l -
        lab2.l;


    const deltaA =
        lab1.a -
        lab2.a;


    const deltaB =
        lab1.b -
        lab2.b;


    return Math.sqrt(

        deltaL * deltaL +

        deltaA * deltaA +

        deltaB * deltaB

    );

}


/* =================================
   GET COLOUR NAME
================================= */

async function getColourName(
    hex
) {

    await loadColourDatabase();


    const normalizedHex =
        hex
            .toUpperCase();


    /*
     * =================================
     * 1. EXACT MATCH
     * =================================
     *
     * If the selected HEX exists in
     * your database, trust the database.
     */

    if (
        Object.prototype.hasOwnProperty.call(
            colourDatabase,
            normalizedHex
        )
    ) {

        return {

            name:
                colourDatabase[
                    normalizedHex
                ],

            exact:
                true,

            hex:
                normalizedHex,

            distance:
                0

        };

    }


    /*
     * =================================
     * 2. CLOSEST MATCH
     * =================================
     */

    if (
        !colourDatabaseLab ||
        colourDatabaseLab.length === 0
    ) {

        return {

            name:
                "Unknown",

            exact:
                false,

            hex:
                null,

            distance:
                null

        };

    }


    const selectedLab =
        hexToLab(
            normalizedHex
        );


    let closest =
        null;


    let smallestDistance =
        Infinity;


    for (
        const colour
        of colourDatabaseLab
    ) {

        const distance =
            deltaE(
                selectedLab,
                colour.lab
            );


        if (
            distance <
            smallestDistance
        ) {

            smallestDistance =
                distance;

            closest =
                colour;

        }

    }


    return {

        name:
            closest.name,

        exact:
            false,

        hex:
            closest.hex,

        distance:
            smallestDistance

    };

}