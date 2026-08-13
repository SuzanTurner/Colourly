let lastX = -1;
let lastY = -1;

let lastSent = 0;


/*
 * Send coordinates at roughly 30 FPS.
 *
 * We don't need 100+ messages per second.
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


        lastSent = now;


        const x =
            event.clientX;

        const y =
            event.clientY;


        /*
         * Don't send the same pixel repeatedly.
         */

        if (
            x === lastX &&
            y === lastY
        ) {
            return;
        }


        lastX = x;
        lastY = y;


        chrome.runtime.sendMessage({

            type: "POINTER",

            x: x,

            y: y,

            viewportWidth:
                window.innerWidth,

            viewportHeight:
                window.innerHeight,

            devicePixelRatio:
                window.devicePixelRatio

        });

    },
    true
);