let lastX = -1;
let lastY = -1;

let lastSent = 0;


/*
 * 30 updates per second.
 */

const UPDATE_INTERVAL = 33;


document.addEventListener(
    "mousemove",
    (event) => {

        const now =
            performance.now();


        /*
         * Limit update frequency.
         */

        if (
            now - lastSent <
            UPDATE_INTERVAL
        ) {
            return;
        }


        /*
         * Ignore if mouse hasn't moved.
         */

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

            type: "POINTER",

            x: event.clientX,

            y: event.clientY,

            viewportWidth:
                window.innerWidth,

            viewportHeight:
                window.innerHeight

        });

    },

    true

);