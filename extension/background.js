let offscreenCreating = null;


/* =================================
   CREATE OFFSCREEN DOCUMENT
================================= */

async function ensureOffscreenDocument() {

    const existingContexts =
        await chrome.runtime.getContexts({
            contextTypes: [
                "OFFSCREEN_DOCUMENT"
            ]
        });


    if (existingContexts.length > 0) {
        return;
    }


    if (offscreenCreating) {
        await offscreenCreating;
        return;
    }


    offscreenCreating =
        chrome.offscreen.createDocument({

            url: "offscreen.html",

            reasons: [
                "USER_MEDIA"
            ],

            justification:
                "Capture the active tab and sample colours under the mouse cursor."

        });


    await offscreenCreating;

    offscreenCreating = null;

}


/* =================================
   EXTENSION CLICK
================================= */

chrome.action.onClicked.addListener(
    async (tab) => {

        try {

            if (!tab.id) {
                return;
            }


            /*
             * Open Colourly side panel.
             */

            await chrome.sidePanel.open({
                windowId: tab.windowId
            });


            /*
             * Create offscreen document.
             */

            await ensureOffscreenDocument();


            /*
             * Get stream for this tab.
             */

            const streamId =
                await chrome.tabCapture
                    .getMediaStreamId({
                        targetTabId: tab.id
                    });


            /*
             * Tell offscreen document
             * to start capturing.
             */

            await chrome.runtime.sendMessage({

                type: "START_CAPTURE",

                streamId: streamId,

                tabId: tab.id

            });

        }

        catch (error) {

            console.error(
                "Colourly failed to start:",
                error
            );

        }

    }
);


/* =================================
   FORWARD MOUSE POSITION
================================= */

chrome.runtime.onMessage.addListener(
    (message, sender) => {

        if (
            message.type ===
            "POINTER"
        ) {

            /*
             * Forward pointer coordinates
             * to offscreen document.
             */

            chrome.runtime.sendMessage({

                type: "POINTER",

                x: message.x,

                y: message.y,

                viewportWidth:
                    message.viewportWidth,

                viewportHeight:
                    message.viewportHeight,

                tabId:
                    sender.tab
                        ? sender.tab.id
                        : null

            });

        }

    }
);


/* =================================
   RECEIVE COLOUR FROM OFFSCREEN
================================= */

chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.type !==
            "COLOUR_UPDATE"
        ) {
            return;
        }


        /*
         * Send colour to the side panel.
         */

        chrome.runtime.sendMessage({

            type: "COLOUR_UPDATE",

            r: message.r,

            g: message.g,

            b: message.b

        });

    }
);