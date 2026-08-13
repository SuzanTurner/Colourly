console.log(
    "Colourly content script loaded."
);


let lastX = -1;
let lastY = -1;

let lastSent = 0;


/*
 * Approximately 30 updates/second.
 */

const UPDATE_INTERVAL = 33;


document.addEventListener(
    "mousemove",
    (event) => {

        const now =
            performance.now();


        if (
            now - lastSent <
            UPDATE_INTERVAL
        ) {
            return;
        }


        if (
            event.clientX === lastX &&
            event.clientY === lastY
        ) {
            return;
        }


        lastSent = now;


        lastX =
            event.clientX;

        lastY =
            event.clientY;


        chrome.runtime.sendMessage({

            type:
                "POINTER",

            x:
                event.clientX,

            y:
                event.clientY,

            viewportWidth:
                window.innerWidth,

            viewportHeight:
                window.innerHeight

        });

    },

    true
);