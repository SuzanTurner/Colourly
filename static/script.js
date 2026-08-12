const imageInput = document.getElementById("image-input");
const dropZone = document.getElementById("drop-zone");

const editor = document.getElementById("editor");
const canvas = document.getElementById("image-canvas");

const ctx = canvas.getContext("2d");

const colorPreview = document.getElementById("color-preview");

const hexValue = document.getElementById("hex-value");
const rgbValue = document.getElementById("rgb-value");
const hslValue = document.getElementById("hsl-value");
const cmykValue = document.getElementById("cmyk-value");

const recipeText = document.getElementById("recipe-text");


/* --------------------------------
   Image Upload
-------------------------------- */

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        loadImage(file);
    }

});


/* --------------------------------
   Load Image
-------------------------------- */

function loadImage(file) {

    const image = new Image();

    image.onload = function () {

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        dropZone.classList.add("hidden");
        editor.classList.remove("hidden");

    };

    image.src = URL.createObjectURL(file);
}


/* --------------------------------
   Click Image
-------------------------------- */

canvas.addEventListener("click", function (event) {

    const rect = canvas.getBoundingClientRect();

    /*
        The canvas might be displayed at a different
        size than its actual resolution.

        Therefore we calculate the scale.
    */

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(
        (event.clientX - rect.left) * scaleX
    );

    const y = Math.floor(
        (event.clientY - rect.top) * scaleY
    );


    /* Get the exact pixel */

    const pixel = ctx.getImageData(
        x,
        y,
        1,
        1
    ).data;


    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];


    updateColor(r, g, b);

});


/* --------------------------------
   Update Colour
-------------------------------- */

function updateColor(r, g, b) {

    const hex = rgbToHex(r, g, b);
    document.body.style.setProperty(
        "--selected-color",
        hex
    );

    document.body.style.setProperty(
        "--selected-rgb",
        `${r}, ${g}, ${b}`
    );
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);


    colorPreview.style.backgroundColor = hex;

    hexValue.textContent = hex;

    rgbValue.textContent =
        `${r}, ${g}, ${b}`;

    hslValue.textContent =
        `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;

    cmykValue.textContent =
        `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;


    recipeText.textContent =
        generateRecipe(r, g, b);
}


/* --------------------------------
   RGB → HEX
-------------------------------- */

function rgbToHex(r, g, b) {

    return "#" +
        [r, g, b]
        .map(value =>
            value.toString(16).padStart(2, "0")
        )
        .join("")
        .toUpperCase();

}


/* --------------------------------
   RGB → HSL
-------------------------------- */

function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h;
    let s;

    const l = (max + min) / 2;

    if (max === min) {

        h = 0;
        s = 0;

    } else {

        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {

            case r:
                h = (g - b) / d +
                    (g < b ? 6 : 0);
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


/* --------------------------------
   RGB → CMYK
-------------------------------- */

function rgbToCmyk(r, g, b) {

    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;

    const k = Math.min(c, m, y);

    if (k === 1) {

        return {
            c: 0,
            m: 0,
            y: 0,
            k: 100
        };

    }

    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}


/* --------------------------------
   Colour Recipe
-------------------------------- */

function generateRecipe(r, g, b) {

    const total = r + g + b;

    if (total === 0) {
        return "This colour is pure black.";
    }

    if (r > 240 && g > 240 && b > 240) {
        return "This colour is approximately pure white.";
    }

    if (Math.abs(r - g) < 10 &&
        Math.abs(g - b) < 10) {

        if (r > 128) {

            const black = Math.round(
                (255 - r) / 255 * 100
            );

            return `Approximately ${100 - black}% white + ${black}% black.`;

        } else {

            const white = Math.round(
                r / 255 * 100
            );

            return `Approximately ${white}% white + ${100 - white}% black.`;
        }
    }


    if (r > g && r > b) {

        if (g > b) {
            return "A warm mixture dominated by red, with yellow added to shift it toward orange.";
        }

        return "A red-dominant mixture with blue added to create a deeper violet tone.";
    }


    if (g > r && g > b) {

        return "A green-dominant mixture, approximately combining yellow and blue pigments.";
    }


    if (b > r && b > g) {

        return "A blue-dominant mixture, with red or white added depending on the desired shade.";
    }


    return "A balanced mixture of the primary colours with white or black used to adjust the shade.";
}