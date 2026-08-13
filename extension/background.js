let creatingOffscreen = null;


async function setupOffscreen() {

    const existing =
        await chrome.runtime.getContexts({
            contextTypes: ["OFFSCREEN_DOCUMENT"]
        });


    if (existing.length > 0) {
        return;
    }


    if (creatingOffscreen) {
        await creatingOffscreen;
        return;
    }


    creatingOffscreen =
        chrome.offscreen.createDocument({

            url: "offscreen.html",

            reasons: ["USER_MEDIA"],

            justification:
                "Continuously sample colours from the active browser tab."

        });


    await creatingOffscreen;

    creatingOffscreen = null;

}


/* =================================
   OPEN COLOURLY
================================= */

chrome.runtime.onInstalled.addListener(() => {

    chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true
    });

});


/* =================================
   START CAPTURE
================================= */

chrome.action.onClicked.addListener(
    async (tab) => {

        try {

            await setupOffscreen();


            /*
             * Get a live stream of the
             * currently active tab.
             */

            const streamId =
                await chrome.tabCapture
                    .getMediaStreamId({
                        targetTabId: tab.id
                    });


            /*
             * Tell the offscreen document
             * to start processing it.
             */

            chrome.runtime.sendMessage({

                type: "START_CAPTURE",

                streamId: streamId

            });


        }

        catch (error) {

            console.error(
                "Colourly capture failed:",
                error
            );

        }

    }
);