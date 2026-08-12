const imageInput = document.getElementById("image-input");
const anotherImageInput = document.getElementById("another-image-input");

const dropZone = document.getElementById("drop-zone");
const editor = document.getElementById("editor");

const initialUpload = document.getElementById("initial-upload");
const anotherUpload = document.getElementById("another-upload");

const canvas = document.getElementById("image-canvas");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});

const colorPreview = document.getElementById("color-preview");

const hexValue = document.getElementById("hex-value");
const rgbValue = document.getElementById("rgb-value");
const hslValue = document.getElementById("hsl-value");
const cmykValue = document.getElementById("cmyk-value");

const recipeText = document.getElementById("recipe-text");

const pickerIndicator = document.getElementById("picker-indicator");
const pickerRgb = document.getElementById("picker-rgb");

const palette = document.getElementById("palette");
const copyPaletteButton = document.getElementById("copy-palette");

let currentPalette = [];


/* =================================
   PALETTE COLOUR COUNT
================================= */

/*
 * Default = 6 colours
 * Minimum = 3 colours
 * Maximum = 10 colours
 */

let paletteColourCount = 6;

const increaseColours =
    document.getElementById("increase-colours");

const decreaseColours =
    document.getElementById("decrease-colours");

const colourCount =
    document.getElementById("colour-count");


/* =================================
   IMAGE UPLOAD
================================= */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        loadImage(file);
    }

});


anotherImageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        loadImage(file);
    }

});


/* =================================
   PALETTE CONTROLS
================================= */

increaseColours.addEventListener("click", function () {

    /*
     * Maximum = 10 colours
     */

    if (paletteColourCount < 10) {

        paletteColourCount++;

        updatePaletteCount();

        extractPalette();
    }

});


decreaseColours.addEventListener("click", function () {

    /*
     * Minimum = 3 colours
     */

    if (paletteColourCount > 3) {

        paletteColourCount--;

        updatePaletteCount();

        extractPalette();
    }

});


function updatePaletteCount() {

    /*
     * Update number displayed
     */

    colourCount.textContent =
        paletteColourCount;


    /*
     * Tell CSS how many columns
     * the palette should use.
     */

    palette.style.setProperty(
        "--palette-count",
        paletteColourCount
    );

}


/*
 * Set the initial palette count
 */

updatePaletteCount();


/* =================================
   DRAG & DROP
================================= */

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragging");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragging");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragging");

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
        loadImage(file);
    }

});


/* =================================
   LOAD IMAGE
================================= */

function loadImage(file) {

    /*
     * Maximum file size = 10MB
     */

    if (file.size > 10 * 1024 * 1024) {

        alert(
            "Please choose an image smaller than 10MB."
        );

        return;
    }


    const image = new Image();


    image.onload = function () {

        canvas.width = image.width;
        canvas.height = image.height;


        ctx.drawImage(
            image,
            0,
            0
        );


        /*
         * Hide initial upload
         */

        initialUpload.classList.add("hidden");


        /*
         * Show editor
         */

        editor.classList.remove("hidden");

        anotherUpload.classList.remove("hidden");


        /*
         * Hide picker
         */

        pickerIndicator.classList.add("hidden");


        /*
         * Extract dominant colours
         */

        extractPalette();


        /*
         * Use first palette colour
         * as initial selected colour.
         */

        if (currentPalette.length > 0) {

            const first =
                hexToRgb(currentPalette[0]);


            updateColor(
                first.r,
                first.g,
                first.b
            );

        }


        /*
         * Scroll to editor
         */

        setTimeout(() => {

            editor.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);


        URL.revokeObjectURL(image.src);

    };


    image.src =
        URL.createObjectURL(file);

}


/* =================================
   CLICK IMAGE
================================= */

canvas.addEventListener("click", function (event) {

    const rect =
        canvas.getBoundingClientRect();


    /*
     * Canvas may be displayed at a
     * different size than its actual
     * resolution.
     */

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;


    const x = Math.floor(
        (event.clientX - rect.left) * scaleX
    );


    const y = Math.floor(
        (event.clientY - rect.top) * scaleY
    );


    /*
     * Get exact pixel
     */

    const pixel =
        ctx.getImageData(
            x,
            y,
            1,
            1
        ).data;


    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];


    updateColor(
        r,
        g,
        b
    );


    /*
     * Move picker indicator
     */

    pickerIndicator.style.left =
        `${event.clientX - rect.left}px`;


    pickerIndicator.style.top =
        `${event.clientY - rect.top}px`;


    pickerRgb.textContent =
        `${r}, ${g}, ${b}`;


    pickerIndicator.classList.remove(
        "hidden"
    );

});


/* =================================
   UPDATE COLOUR
================================= */

function updateColor(r, g, b) {

    const hex =
        rgbToHex(
            r,
            g,
            b
        );


    /*
     * Update page gradient.
     *
     * Your existing gradient
     * remains unchanged.
     */

    document.body.style.setProperty(
        "--selected-rgb",
        `${r}, ${g}, ${b}`
    );


    const hsl =
        rgbToHsl(
            r,
            g,
            b
        );


    const cmyk =
        rgbToCmyk(
            r,
            g,
            b
        );


    /*
     * Update colour preview
     */

    colorPreview.style.backgroundColor =
        hex;


    /*
     * Update HEX
     */

    hexValue.textContent =
        hex;


    /*
     * Update RGB
     */

    rgbValue.textContent =
        `${r}, ${g}, ${b}`;


    /*
     * Update HSL
     */

    hslValue.textContent =
        `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;


    /*
     * Update CMYK
     */

    cmykValue.textContent =
        `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;


    /*
     * Update recipe
     */

    generateRecipe(
        r,
        g,
        b
    );

}


/* =================================
   RGB → HEX
================================= */

function rgbToHex(r, g, b) {

    return "#" +
        [r, g, b]
            .map(
                value =>
                    value
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("")
            .toUpperCase();

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


    let h;
    let s;


    const l =
        (max + min) / 2;


    if (max === min) {

        h = 0;
        s = 0;

    }

    else {

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
                    (b - r) / d +
                    2;

                break;


            case b:

                h =
                    (r - g) / d +
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

    let c =
        1 - r / 255;

    let m =
        1 - g / 255;

    let y =
        1 - b / 255;


    const k =
        Math.min(
            c,
            m,
            y
        );


    if (k === 1) {

        return {

            c: 0,
            m: 0,
            y: 0,
            k: 100

        };

    }


    c =
        (c - k) /
        (1 - k);


    m =
        (m - k) /
        (1 - k);


    y =
        (y - k) /
        (1 - k);


    return {

        c: Math.round(
            c * 100
        ),

        m: Math.round(
            m * 100
        ),

        y: Math.round(
            y * 100
        ),

        k: Math.round(
            k * 100
        )

    };

}

/* =================================
   ARTIST COLOUR MIXING RECIPE
================================= */

function generateRecipe(r, g, b) {

    const hsv = rgbToHsv(r, g, b);

    const h = hsv.h;
    const s = hsv.s;
    const v = hsv.v;

    /* =================================
   GRAYSCALE COLOURS
================================= */

if (s <= 0.01) {

    /*
     * A grayscale colour has no hue.
     *
     * Therefore it must NEVER contain
     * red, yellow, or blue.
     *
     * Only white + black are relevant.
     */

    const blackPercent =
        Math.round((1 - v) * 100);

    const whitePercent =
        100 - blackPercent;


    setRecipeValues(
        0,
        0,
        0,
        whitePercent,
        blackPercent
    );


    if (blackPercent >= 95) {

        recipeText.textContent =
            "This colour is nearly pure black. Use black pigment as the base and add a tiny amount of white only if needed.";

    }

    else if (whitePercent >= 95) {

        recipeText.textContent =
            "This colour is nearly pure white. Use white pigment as the base and add a tiny amount of black to lower the brightness.";

    }

    else {

        recipeText.textContent =
            `This is a neutral grey. Start with approximately ${blackPercent}% black and ${whitePercent}% white. Actual paint results will vary by pigment.`;

    }


    return;
}


    /*
     * =================================
     * SPECIAL CASES
     * =================================
     */

    if (v <= 0.01) {

        setRecipeValues(
            0,
            0,
            0,
            0,
            100
        );

        recipeText.textContent =
            "Pure black. Use black pigment as the base.";

        return;
    }


    if (s <= 0.01 && v >= 0.99) {

        setRecipeValues(
            0,
            0,
            0,
            100,
            0
        );

        recipeText.textContent =
            "Pure white. Use white pigment as the base.";

        return;
    }


    /*
     * =================================
     * RYB HUE MIX
     * =================================
     *
     * Determine which primary pigments
     * are responsible for the hue.
     *
     * Red
     * Yellow
     * Blue
     */

    let red = 0;
    let yellow = 0;
    let blue = 0;


    /*
     * RED → YELLOW
     */

    if (h < 60) {

        const t = h / 60;

        red = 1 - t;
        yellow = t;

    }


    /*
     * YELLOW → GREEN
     *
     * Green is produced through
     * yellow + blue.
     */

    else if (h < 120) {

        const t =
            (h - 60) / 60;

        yellow = 1 - t;
        blue = t;

    }


    /*
     * GREEN → BLUE
     */

    else if (h < 240) {

        const t =
            (h - 120) / 120;

        yellow =
            0.35 * (1 - t);

        blue =
            0.65 + (0.35 * t);

    }


    /*
     * BLUE → VIOLET
     */

    else if (h < 300) {

        const t =
            (h - 240) / 60;

        blue = 1 - t;
        red = t;

    }


    /*
     * VIOLET → RED
     */

    else {

        const t =
            (h - 300) / 60;

        red =
            0.65 + (0.35 * t);

        blue =
            0.35 * (1 - t);

    }


    /*
     * =================================
     * DESATURATION
     * =================================
     *
     * A real-looking paint recipe needs
     * a way to mute colours.
     *
     * Instead of falsely claiming that
     * "red + yellow = this exact colour",
     * we introduce:
     *
     * - white for lighter muted colours
     * - black for darker muted colours
     * - complementary pigment for earthy/
     *   neutralised colours
     */

    const desaturation =
        1 - s;


    /*
     * WHITE
     *
     * More useful for light colours.
     */

    let white =
        desaturation *
        v *
        0.35;


    /*
     * BLACK
     *
     * Used both for desaturation and
     * naturally dark colours.
     */

    let black =
        desaturation *
        (1 - v) *
        0.45;


    /*
     * Additional black for genuinely
     * dark colours.
     */

    if (v < 0.55) {

        black +=
            (0.55 - v) *
            0.25;

    }


    /*
     * =================================
     * COMPLEMENTARY PIGMENT
     * =================================
     *
     * A small amount of the opposing
     * primary helps create muted/earthy
     * colours.
     *
     * This is particularly important
     * for colours such as:
     *
     * olive
     * ochre
     * dusty blue
     * muted purple
     * earthy green
     */

    let complementary =
        desaturation *
        0.20;


    /*
     * Determine which pigment is useful
     * as the neutralising pigment.
     */

    if (h < 60) {

        /*
         * Yellow/orange → blue
         */

        blue += complementary;

    }

    else if (h < 120) {

        /*
         * Yellow/green → red
         */

        red += complementary;

    }

    else if (h < 240) {

        /*
         * Green/blue → red/yellow
         */

        red +=
            complementary * 0.5;

        yellow +=
            complementary * 0.5;

    }

    else if (h < 300) {

        /*
         * Blue/violet → yellow
         */

        yellow += complementary;

    }

    else {

        /*
         * Violet/red → yellow
         */

        yellow += complementary;

    }


    /*
     * =================================
     * CALCULATE BASE PIGMENT AMOUNT
     * =================================
     *
     * White + black + complementary
     * consume part of the mixture.
     */

    const modifierAmount =
        white +
        black;


    /*
     * The remaining percentage is
     * assigned to the hue pigments.
     */

    const baseAmount =
        Math.max(
            0,
            1 - modifierAmount
        );


    /*
     * Calculate total hue pigment weight.
     */

    const hueTotal =
        red +
        yellow +
        blue;


    /*
     * Scale hue pigments into the
     * remaining mixture.
     */

    if (hueTotal > 0) {

        red =
            (red / hueTotal) *
            baseAmount;

        yellow =
            (yellow / hueTotal) *
            baseAmount;

        blue =
            (blue / hueTotal) *
            baseAmount;

    }


    /*
     * =================================
     * CONVERT TO PERCENTAGES
     * =================================
     */

    const rawValues = [

        red * 100,
        yellow * 100,
        blue * 100,
        white * 100,
        black * 100

    ];


    /*
     * =================================
     * ROUND WHILE GUARANTEEING 100%
     * =================================
     */

    const percentages =
        normalizeTo100(
            rawValues
        );


    const redPercent =
        percentages[0];

    const yellowPercent =
        percentages[1];

    const bluePercent =
        percentages[2];

    const whitePercent =
        percentages[3];

    const blackPercent =
        percentages[4];


    /*
     * =================================
     * UPDATE UI
     * =================================
     */

    setRecipeValues(
        redPercent,
        yellowPercent,
        bluePercent,
        whitePercent,
        blackPercent
    );


    /*
     * =================================
     * ARTIST DESCRIPTION
     * =================================
     */

    generateRecipeDescription(
        redPercent,
        yellowPercent,
        bluePercent,
        whitePercent,
        blackPercent
    );

}


/* =================================
   RGB → HSV
================================= */

function rgbToHsv(r, g, b) {

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


    const difference =
        max - min;


    let h = 0;


    if (difference !== 0) {

        if (max === r) {

            h =
                60 *
                (
                    ((g - b) / difference) % 6
                );

        }

        else if (max === g) {

            h =
                60 *
                (
                    ((b - r) / difference) + 2
                );

        }

        else {

            h =
                60 *
                (
                    ((r - g) / difference) + 4
                );

        }

    }


    if (h < 0) {
        h += 360;
    }


    const s =
        max === 0
            ? 0
            : difference / max;


    const v = max;


    return {
        h,
        s,
        v
    };

}


/* =================================
   NORMALIZE TO EXACTLY 100%
================================= */

function normalizeTo100(values) {

    /*
     * Remove negative values.
     */

    const cleaned =
        values.map(
            value =>
                Math.max(
                    0,
                    value
                )
        );


    /*
     * Floor everything first.
     */

    const result =
        cleaned.map(
            value =>
                Math.floor(value)
        );


    /*
     * Calculate how many percentage
     * points are still missing.
     */

    let remainder =
        100 -
        result.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    /*
     * Keep the fractional parts so
     * the rounding error goes to the
     * values that deserve it.
     */

    const fractions =
        cleaned
            .map(
                (value, index) => ({

                    index,

                    fraction:
                        value -
                        Math.floor(value)

                })
            )
            .sort(
                (a, b) =>
                    b.fraction -
                    a.fraction
            );


    /*
     * Distribute remaining percentage
     * points.
     */

    let i = 0;


    while (
        remainder > 0
    ) {

        result[
            fractions[
                i %
                fractions.length
            ].index
        ]++;


        remainder--;
        i++;

    }


    return result;

}


/* =================================
   UPDATE RECIPE UI
================================= */

function setRecipeValues(
    red,
    yellow,
    blue,
    white,
    black
) {

    document.getElementById(
        "red-percent"
    ).textContent =
        `${red}%`;


    document.getElementById(
        "yellow-percent"
    ).textContent =
        `${yellow}%`;


    document.getElementById(
        "blue-percent"
    ).textContent =
        `${blue}%`;


    document.getElementById(
        "white-percent"
    ).textContent =
        `${white}%`;


    document.getElementById(
        "black-percent"
    ).textContent =
        `${black}%`;

}


/* =================================
   ARTIST-FRIENDLY DESCRIPTION
================================= */

function generateRecipeDescription(
    red,
    yellow,
    blue,
    white,
    black
) {

    const ingredients = [];


    /*
     * Find largest pigment.
     */

    const pigments = [

        {
            name: "red",
            value: red
        },

        {
            name: "yellow",
            value: yellow
        },

        {
            name: "blue",
            value: blue
        },

        {
            name: "white",
            value: white
        },

        {
            name: "black",
            value: black
        }

    ];


    pigments.sort(
        (a, b) =>
            b.value - a.value
    );


    const main =
        pigments[0];


    /*
     * Main instruction.
     */

    let description =
        `Start with ${main.name} as the base.`;


    /*
     * Secondary pigments.
     */

    const secondary =
        pigments
            .slice(1)
            .filter(
                pigment =>
                    pigment.value >= 5
            );


    if (
        secondary.length > 0
    ) {

        description +=
            ` Gradually add ${secondary
                .map(
                    pigment =>
                        pigment.name
                )
                .join(" and ")}.`;

    }


    /*
     * Practical adjustment advice.
     */

    if (
        white >= 20
    ) {

        description +=
            " Use white to build the lighter value gradually.";

    }


    if (
        black >= 20
    ) {

        description +=
            " Add black sparingly because it can quickly overpower the mixture.";

    }


    if (
        blue >= 10 &&
        yellow >= 10 &&
        red < 10
    ) {

        description +=
            " The blue and yellow combination helps create the green character of the shade.";

    }


    if (
        yellow >= 20 &&
        red >= 10 &&
        blue >= 5
    ) {

        description +=
            " The small amount of blue helps mute the warm yellow/red base into a more earthy shade.";

    }


    /*
     * IMPORTANT DISCLAIMER
     *
     * This is not pretending to be an
     * exact physical pigment formula.
     */

    description +=
        " These are approximate starting proportions; adjust by eye because real pigments vary.";


    recipeText.textContent =
        description;

}

/* =================================
   RECONSTRUCTION PALETTE
================================= */

function extractPalette() {

    const maxSize = 160;

    /*
     * Resize image for processing.
     */

    const scale = Math.min(
        1,
        maxSize / Math.max(
            canvas.width,
            canvas.height
        )
    );

    const width = Math.max(
        1,
        Math.floor(canvas.width * scale)
    );

    const height = Math.max(
        1,
        Math.floor(canvas.height * scale)
    );


    const tempCanvas =
        document.createElement("canvas");

    tempCanvas.width = width;
    tempCanvas.height = height;


    const tempCtx =
        tempCanvas.getContext("2d", {
            willReadFrequently: true
        });


    tempCtx.drawImage(
        canvas,
        0,
        0,
        width,
        height
    );


    const imageData =
        tempCtx.getImageData(
            0,
            0,
            width,
            height
        );


    const pixels = imageData.data;

    const points = [];


    /*
     * Sample pixels.
     *
     * Every 4th pixel is enough for
     * a good reconstruction palette.
     */

    for (
        let i = 0;
        i < pixels.length;
        i += 16
    ) {

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];


        if (a < 180) {
            continue;
        }


        points.push({
            r,
            g,
            b,

            /*
             * Keep approximate location.
             * This helps preserve colours that
             * appear in different regions.
             */

            x:
                (i / 4 % width) / width,

            y:
                Math.floor(i / 4 / width) / height
        });

    }


    if (points.length === 0) {
        return;
    }


    /*
     * We generate more clusters than
     * the final palette requires.
     *
     * This gives us candidates such as:
     *
     * black
     * dark blue
     * blue
     * white
     * yellow
     * green
     *
     * and then we intelligently select
     * the best ones.
     */

    const clusterCount =
        Math.min(
            Math.max(
                paletteColourCount * 3,
                12
            ),
            30
        );


    let centroids =
        initializeReconstructionCentroids(
            points,
            clusterCount
        );


    /*
     * Run clustering.
     */

    const maxIterations = 12;


    for (
        let iteration = 0;
        iteration < maxIterations;
        iteration++
    ) {

        const clusters =
            Array.from(
                {
                    length: clusterCount
                },
                () => []
            );


        /*
         * Assign each pixel to its
         * closest colour cluster.
         */

        for (
            const point of points
        ) {

            let closest = 0;

            let smallestDistance =
                Infinity;


            for (
                let i = 0;
                i < centroids.length;
                i++
            ) {

                const distance =
                    reconstructionColorDistance(
                        point,
                        centroids[i]
                    );


                if (
                    distance <
                    smallestDistance
                ) {

                    smallestDistance =
                        distance;

                    closest = i;
                }

            }


            clusters[closest].push(
                point
            );

        }


        /*
         * Calculate new cluster centres.
         */

        const newCentroids = [];


        for (
            let i = 0;
            i < clusterCount;
            i++
        ) {

            const cluster =
                clusters[i];

            if (cluster.length === 0) {

    /*
     * Deterministic fallback.
     *
     * Use a predictable point instead
     * of Math.random().
     */

    newCentroids.push(
        points[
            i % points.length
        ]
    );

    continue;
}


            let r = 0;
            let g = 0;
            let b = 0;


            for (
                const point of cluster
            ) {

                r += point.r;
                g += point.g;
                b += point.b;

            }


            newCentroids.push({

                r:
                    Math.round(
                        r / cluster.length
                    ),

                g:
                    Math.round(
                        g / cluster.length
                    ),

                b:
                    Math.round(
                        b / cluster.length
                    )

            });

        }


        /*
         * Check convergence.
         */

        let movement = 0;


        for (
            let i = 0;
            i < clusterCount;
            i++
        ) {

            movement +=
                reconstructionColorDistance(
                    centroids[i],
                    newCentroids[i]
                );

        }


        centroids =
            newCentroids;


        if (
            movement < 5
        ) {

            break;

        }

    }


    /*
     * Analyse the final clusters.
     */

    const clusters =
        analyseReconstructionClusters(
            points,
            centroids
        );


    /*
     * Score each cluster.
     */

    clusters.forEach(
        cluster => {

            cluster.score =
                reconstructionScore(
                    cluster,
                    clusters
                );

        }
    );


    /*
     * Sort by reconstruction usefulness.
     */

    clusters.sort(
        (a, b) =>
            b.score - a.score
    );


    /*
     * Select the final palette.
     */

    const selected = [];


    for (
        const cluster of clusters
    ) {

        /*
         * Don't allow several nearly
         * identical colours.
         */

        let tooSimilar = false;


        for (
            const existing of selected
        ) {

            const distance =
                reconstructionColorDistance(
                    cluster,
                    existing
                );


            if (
                distance < 38
            ) {

                tooSimilar = true;
                break;

            }

        }


        if (
            !tooSimilar
        ) {

            selected.push(
                cluster
            );

        }


        if (
            selected.length >=
            paletteColourCount
        ) {

            break;

        }

    }


    /*
     * Safety fallback.
     *
     * Make sure we always have the
     * requested number where possible.
     */

    if (
        selected.length <
        paletteColourCount
    ) {

        for (
            const cluster of clusters
        ) {

            if (
                selected.includes(
                    cluster
                )
            ) {

                continue;

            }


            selected.push(
                cluster
            );


            if (
                selected.length >=
                paletteColourCount
            ) {

                break;

            }

        }

    }


    /*
     * Convert colours to HEX.
     */

    currentPalette =
        selected.map(
            colour =>
                rgbToHex(
                    colour.r,
                    colour.g,
                    colour.b
                )
        );


    /*
     * Render palette.
     */

    renderPalette();

}


/* =================================
   RECONSTRUCTION CLUSTER ANALYSIS
================================= */

function analyseReconstructionClusters(
    points,
    centroids
) {

    const clusters =
        centroids.map(
            centroid => ({

                r: centroid.r,
                g: centroid.g,
                b: centroid.b,

                size: 0,

                /*
                 * Used to calculate
                 * spatial distribution.
                 */

                minX: 1,
                maxX: 0,
                minY: 1,
                maxY: 0,

                totalX: 0,
                totalY: 0

            })
        );


    /*
     * Assign points to clusters again.
     */

    for (
        const point of points
    ) {

        let closest = 0;

        let smallestDistance =
            Infinity;


        for (
            let i = 0;
            i < centroids.length;
            i++
        ) {

            const distance =
                reconstructionColorDistance(
                    point,
                    centroids[i]
                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;

                closest = i;
            }

        }


        const cluster =
            clusters[closest];


        cluster.size++;


        cluster.minX =
            Math.min(
                cluster.minX,
                point.x
            );

        cluster.maxX =
            Math.max(
                cluster.maxX,
                point.x
            );

        cluster.minY =
            Math.min(
                cluster.minY,
                point.y
            );

        cluster.maxY =
            Math.max(
                cluster.maxY,
                point.y
            );


        cluster.totalX +=
            point.x;

        cluster.totalY +=
            point.y;

    }


    const totalPoints =
        points.length;


    /*
     * Add useful measurements.
     */

    clusters.forEach(
        cluster => {

            cluster.area =
                cluster.size /
                totalPoints;


            cluster.saturation =
                colourSaturation(
                    cluster.r,
                    cluster.g,
                    cluster.b
                );


            cluster.brightness =
                (
                    cluster.r +
                    cluster.g +
                    cluster.b
                ) / 3;


            cluster.contrast =
                calculateContrast(
                    cluster,
                    centroids
                );


            /*
             * Spatial spread.
             *
             * A colour appearing across
             * different areas of the image
             * gets more importance.
             */

            const spreadX =
                cluster.maxX -
                cluster.minX;


            const spreadY =
                cluster.maxY -
                cluster.minY;


            cluster.spatialSpread =
                Math.min(
                    1,
                    (
                        spreadX +
                        spreadY
                    ) / 2
                );

        }
    );


    return clusters.filter(
        cluster =>
            cluster.size > 0
    );

}


/* =================================
   RECONSTRUCTION SCORE
================================= */

function reconstructionScore(
    cluster,
    allClusters
) {

    /*
     * AREA
     *
     * Large regions matter, but they
     * should NOT dominate everything.
     */

    const areaScore =
        Math.sqrt(
            cluster.area
        );


    /*
     * CONTRAST
     *
     * Important for things like:
     *
     * white moon
     * yellow lights
     * bright stars
     * dark silhouettes
     */

    const contrastScore =
        cluster.contrast;


    /*
     * SATURATION
     *
     * Helps preserve meaningful
     * greens, yellows, reds, etc.
     */

    const saturationScore =
        cluster.saturation;


    /*
     * SPATIAL PRESENCE
     */

    const spatialScore =
        cluster.spatialSpread;


    /*
     * BRIGHTNESS EXTREMES
     *
     * Very bright and very dark colours
     * are often visually important.
     */

    let brightnessScore = 0;


    if (
        cluster.brightness < 45 ||
        cluster.brightness > 210
    ) {

        brightnessScore = 1;

    }

    else {

        brightnessScore =
            Math.abs(
                cluster.brightness -
                128
            ) / 128;

    }


    /*
     * FINAL WEIGHT
     *
     * Area:          35%
     * Contrast:      30%
     * Saturation:    15%
     * Spatial:       10%
     * Extremes:      10%
     */

    return (

        areaScore * 0.35 +

        contrastScore * 0.30 +

        saturationScore * 0.15 +

        spatialScore * 0.10 +

        brightnessScore * 0.10

    );

}


/* =================================
   CONTRAST CALCULATION
================================= */

function calculateContrast(
    cluster,
    centroids
) {

    let maximumContrast = 0;


    for (
        const other of centroids
    ) {

        const distance =
            reconstructionColorDistance(
                cluster,
                other
            );


        maximumContrast =
            Math.max(
                maximumContrast,
                distance
            );

    }


    /*
     * Normalize RGB distance.
     *
     * Maximum possible RGB distance
     * is approximately 441.
     */

    return Math.min(
        1,
        maximumContrast / 220
    );

}


/* =================================
   COLOUR SATURATION
================================= */

function colourSaturation(
    r,
    g,
    b
) {

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


    if (
        max === 0
    ) {

        return 0;

    }


    return (
        max - min
    ) / max;

}


/* =================================
   RGB COLOUR DISTANCE
================================= */

function reconstructionColorDistance(
    a,
    b
) {

    return Math.sqrt(

        Math.pow(
            a.r - b.r,
            2
        ) +

        Math.pow(
            a.g - b.g,
            2
        ) +

        Math.pow(
            a.b - b.b,
            2
        )

    );

}


/* =================================
   K-MEANS++ INITIALIZATION
================================= */
function initializeReconstructionCentroids(
    points,
    k
) {

    const centroids = [];

    /*
     * Always choose the first centroid
     * from the same location.
     */

    centroids.push(
        points[0]
    );


    /*
     * Instead of Math.random(),
     * choose the point that is farthest
     * from the colours already selected.
     *
     * This makes K-means++ deterministic.
     */

    while (
        centroids.length < k
    ) {

        let bestPoint = null;
        let bestDistance = -1;


        for (
            const point of points
        ) {

            let smallestDistance =
                Infinity;


            for (
                const centroid of centroids
            ) {

                const distance =
                    reconstructionColorDistance(
                        point,
                        centroid
                    );


                if (
                    distance <
                    smallestDistance
                ) {

                    smallestDistance =
                        distance;

                }

            }


            /*
             * Pick the point that is
             * most different from the
             * existing centroids.
             */

            if (
                smallestDistance >
                bestDistance
            ) {

                bestDistance =
                    smallestDistance;

                bestPoint =
                    point;

            }

        }


        /*
         * Safety check.
         */

        if (!bestPoint) {
            break;
        }


        centroids.push(
            bestPoint
        );

    }


    return centroids;
}


               


                


/* =================================
   RENDER PALETTE
================================= */

function renderPalette() {

    /*
     * Clear old palette.
     */

    palette.innerHTML = "";


    /*
     * Tell CSS how many colours
     * are currently being displayed.
     */

    palette.style.setProperty(
        "--palette-count",
        paletteColourCount
    );


    /*
     * Create each palette item.
     */

    currentPalette.forEach(
        hex => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "palette-item";


            item.innerHTML = `

                <div
                    class="palette-color"
                    style="background-color: ${hex}"
                ></div>

                <div class="palette-hex">
                    ${hex}
                </div>

            `;


            /*
             * Clicking a palette colour
             * selects it as the current colour.
             */

            item.addEventListener(
                "click",
                function () {

                    const rgb =
                        hexToRgb(hex);


                    updateColor(
                        rgb.r,
                        rgb.g,
                        rgb.b
                    );


                    /*
                     * Hide image picker
                     * when selecting from
                     * the palette.
                     */

                    pickerIndicator.classList.add(
                        "hidden"
                    );

                }
            );


            palette.appendChild(
                item
            );

        }
    );

}


/* =================================
   COPY BUTTONS
================================= */

document.querySelectorAll(
    ".copy-button"
).forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const target =
                    document.getElementById(
                        this.dataset.copyTarget
                    );


                navigator.clipboard.writeText(
                    target.textContent
                );

            }
        );

    }
);


/* =================================
   COPY PALETTE
================================= */

copyPaletteButton.addEventListener(
    "click",
    function () {

        navigator.clipboard.writeText(
            currentPalette.join("\n")
        );


        const original =
            this.innerHTML;


        this.textContent =
            "✓ Copied";


        setTimeout(
            () => {

                this.innerHTML =
                    original;

            },
            1200
        );

    }
);