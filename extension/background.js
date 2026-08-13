chrome.action.onClicked.addListener(async (tab) => {

    if (!tab.id) {
        return;
    }

    console.log("Colourly activated:", tab.id);

    try {

        /*
         * Fire CSS + JS injection together instead of
         * awaiting one after the other. Sequential awaits
         * add delay between your click and the EyeDropper
         * opening, and that gap can be enough for Chrome to
         * treat the picker as no longer "attached" to your
         * click gesture.
         */

        await Promise.all([

            chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["picker.css"]
            }),

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["picker.js"],
                injectImmediately: true
            })

        ]);

        console.log("Colourly picker started.");

    }

    catch (error) {

        console.error(
            "Colourly failed to start:",
            error
        );

    }

});