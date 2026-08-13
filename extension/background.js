let offscreenCreating = null;


/* =================================
   OFFSCREEN DOCUMENT
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
                "Sample colours from the active browser tab."

        });


    await offscreenCreating;

    offscreenCreating = null;

}


/* =================================
   EXTENSION BUTTON
================================= */

chrome.action.onClicked.addListener(
    async (tab) => {

        try {

            if (!tab.id) {
                return;
            }


            console.log(
                "Colourly activated on tab:",
                tab.id
            );


            /* -------------------------
               Open side panel
            ------------------------- */

            await chrome.sidePanel.open({
                tabId: tab.id
            });


            /* -------------------------
               Inject mouse tracker
            ------------------------- */

            await chrome.scripting.executeScript({

                target: {
                    tabId: tab.id
                },

                files: [
                    "content.js"
                ]

            });


            console.log(
                "content.js injected"
            );


            /* -------------------------
               Create offscreen document
            ------------------------- */

            await ensureOffscreenDocument();


            console.log(
                "Offscreen document ready"
            );


            /* -------------------------
               Get tab stream
            ------------------------- */

            const streamId =
                await chrome.tabCapture
                    .getMediaStreamId({

                        targetTabId:
                            tab.id

                    });


            console.log(
                "Stream ID obtained"
            );


            /* -------------------------
               Start capture
            ------------------------- */

            await chrome.runtime.sendMessage({

                type:
                    "START_CAPTURE",

                streamId:
                    streamId

            });


            console.log(
                "Capture started"
            );

        }

        catch (error) {

            console.error(
                "COLOURLY START ERROR:",
                error
            );

        }

    }
);


/* =================================
   POINTER → OFFSCREEN
================================= */

chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.type !==
            "POINTER"
        ) {
            return;
        }


        chrome.runtime.sendMessage({

            type:
                "POINTER",

            x:
                message.x,

            y:
                message.y,

            viewportWidth:
                message.viewportWidth,

            viewportHeight:
                message.viewportHeight

        });

    }
);


/* =================================
   COLOUR → SIDE PANEL
================================= */

chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.type !==
            "COLOUR_UPDATE"
        ) {
            return;
        }


        chrome.runtime.sendMessage({

            type:
                "COLOUR_UPDATE",

            r:
                message.r,

            g:
                message.g,

            b:
                message.b

        });

    }
);