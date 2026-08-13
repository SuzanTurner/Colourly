chrome.action.onClicked.addListener(async (tab) => {

    if (!tab.id) {
        return;
    }

    console.log("Colourly activated:", tab.id);

    try {

        await chrome.scripting.executeScript({

            target: {
                tabId: tab.id
            },

            files: [
                "picker.js"
            ]

        });

        console.log("Colourly picker started.");

    }

    catch (error) {

        console.error(
            "Colourly failed to start:",
            error
        );

    }

});

