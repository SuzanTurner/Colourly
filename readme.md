# Colourly

**Colourly** is a web-based colour picker and image palette generator that helps users discover and recreate the key colours in an image.

## Features

* Upload images using drag-and-drop or file selection.
* Click anywhere on an image to extract the exact pixel colour.
* View HEX, RGB, HSL, and CMYK values.
* Generate a reconstruction-focused colour palette.
* Adjust the palette from **3 to 10 colours**.
* Click palette colours to inspect them individually.
* Get an approximate colour-mixing recipe.
* Dynamically update the background based on the selected colour.
* Copy individual colour values or the entire palette.

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Flask
* **Image Processing:** HTML5 Canvas
* **Colour Analysis:** Custom JavaScript colour clustering

## How to Run (for now)

```bash
git clone <repository-url>
cd Colourly

pip install -r requirements.txt

python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Project Structure

```text
Colourly/
├── static/
│   ├── style.css
│   └── script.js
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
└── README.md
```

## Purpose

As an artist myself, I often find it difficult to pinpoint the exact colour I require, and to conjour that colour from the limited primary colours I have is basically a matter of chance. 

And that... gave birth to Colourly.

It's free. 
No ads.
No distractions.

Colourly's palatte generation algorithm focuses on **reconstructing an image's visual identity**, rather than simply returning its most frequent colours. The palette balances colour coverage, contrast, saturation, and visual diversity to preserve important colours such as highlights, shadows, and small details.

## Note from the Author

Feel free to send your ideas and improvisations on yadhnikawakde@gmail.com, or just contribute!