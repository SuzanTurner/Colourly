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
   COLOUR RECIPE
================================= */

function generateRecipe(r, g, b) {

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


    /*
     * Calculate approximate
     * pigment proportions.
     */

    let red = 0;
    let yellow = 0;
    let blue = 0;
    let white = 0;
    let black = 0;


    /*
     * Black component
     */

    if (max < 128) {

        black =
            Math.round(
                ((255 - max) / 255) * 100
            );

    }


    /*
     * White component
     */

    if (min > 180) {

        white =
            Math.round(
                (min / 255) * 100
            );

    }


    /*
     * Primary colour proportions
     */

    const adjustedR =
        Math.max(
            0,
            r - min
        );


    const adjustedG =
        Math.max(
            0,
            g - min
        );


    const adjustedB =
        Math.max(
            0,
            b - min
        );


    const primaryTotal =
        adjustedR +
        adjustedG +
        adjustedB;


    if (primaryTotal > 0) {

        red =
            Math.round(
                (adjustedR / primaryTotal) * 100
            );


        yellow =
            Math.round(
                (adjustedG / primaryTotal) * 100
            );


        blue =
            Math.round(
                (adjustedB / primaryTotal) * 100
            );

    }


    /*
     * Make percentages visually useful.
     */

    if (max > 200) {

        white =
            Math.max(
                white,
                Math.round(
                    (max - 180) / 75 * 100
                )
            );

    }


    if (max < 80) {

        black =
            Math.max(
                black,
                Math.round(
                    (80 - max) / 80 * 100
                )
            );

    }


    /*
     * Update UI
     */

    document.getElementById(
        "red-percent"
    ).textContent =
        `${Math.min(red, 100)}%`;


    document.getElementById(
        "yellow-percent"
    ).textContent =
        `${Math.min(yellow, 100)}%`;


    document.getElementById(
        "blue-percent"
    ).textContent =
        `${Math.min(blue, 100)}%`;


    document.getElementById(
        "white-percent"
    ).textContent =
        `${Math.min(white, 100)}%`;


    document.getElementById(
        "black-percent"
    ).textContent =
        `${Math.min(black, 100)}%`;


    /*
     * Human-readable explanation
     */

    let description = "";


    if (
        r > g * 1.25 &&
        r > b * 1.25
    ) {

        description =
            "Start with a strong red base. Add a small amount of yellow to warm the colour, then adjust with white to create a lighter shade or black for a deeper tone.";

    }


    else if (
        r > b &&
        g > b
    ) {

        description =
            "Start with red and yellow to create a warm orange base. Increase red for a richer tone, or add white to make the colour softer and lighter.";

    }


    else if (
        g > r &&
        g > b
    ) {

        description =
            "Start with yellow and blue to create the green base. Add more yellow for a warmer green or blue for a deeper, cooler shade.";

    }


    else if (
        b > r &&
        b > g
    ) {

        description =
            "Start with blue as the dominant colour. Add red to move toward violet, or add white to create a softer and lighter blue.";

    }


    else if (
        Math.abs(r - g) < 15 &&
        Math.abs(g - b) < 15
    ) {

        if (max > 180) {

            description =
                "This is a light neutral shade. Start with white and add a very small amount of black to reduce its brightness.";

        }

        else {

            description =
                "This is a neutral darker shade. Start with black and gradually introduce white until you reach the desired brightness.";

        }

    }


    else {

        description =
            "This colour is a balanced mixture of primary tones. Adjust the dominant colour first, then use white to lighten or black to deepen the final shade.";

    }


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


            if (
                cluster.length === 0
            ) {

                newCentroids.push(
                    points[
                        Math.floor(
                            Math.random() *
                            points.length
                        )
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
     * First centroid.
     */

    centroids.push(
        points[
            Math.floor(
                Math.random() *
                points.length
            )
        ]
    );


    /*
     * Choose additional centres
     * that are far away from existing
     * colours.
     */

    while (
        centroids.length < k
    ) {

        const distances = [];

        let totalDistance = 0;


        for (
            const point of points
        ) {

            let smallest =
                Infinity;


            for (
                const centroid
                of centroids
            ) {

                const distance =
                    reconstructionColorDistance(
                        point,
                        centroid
                    );


                if (
                    distance <
                    smallest
                ) {

                    smallest =
                        distance;

                }

            }


            const squared =
                smallest * smallest;


            distances.push(
                squared
            );


            totalDistance +=
                squared;

        }


        let random =
            Math.random() *
            totalDistance;


        let selectedIndex = 0;


        for (
            let i = 0;
            i < distances.length;
            i++
        ) {

            random -=
                distances[i];


            if (
                random <= 0
            ) {

                selectedIndex = i;

                break;

            }

        }


        centroids.push(
            points[selectedIndex]
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