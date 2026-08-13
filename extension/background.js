chrome.action.onClicked.addListener(async (tab) => {

    if (!tab.id) {
        return;
    }

    try {

        /*
         * Inject the EyeDropper directly into
         * the active webpage.
         */

        const results =
            await chrome.scripting.executeScript({

                target: {
                    tabId: tab.id
                },

                func: startColourlyPicker

            });


        /*
         * Get the HEX returned by the page.
         */

        const result =
            results?.[0]?.result;


        if (
            result &&
            result.hex
        ) {

            /*
             * Open the side panel after
             * the colour has been selected.
             */

            await chrome.sidePanel.open({
                tabId: tab.id
            });


            /*
             * Give the side panel a moment
             * to initialize.
             */

            setTimeout(() => {

                chrome.runtime.sendMessage({

                    type: "COLOUR_SELECTED",

                    hex: result.hex

                });

            }, 100);

        }

    }

    catch (error) {

        console.error(
            "Colourly picker failed:",
            error
        );

    }

});


/*
 * This function runs inside the webpage.
 *
 * It is deliberately self-contained because
 * functions injected with executeScript cannot
 * rely on extension globals.
 */

async function startColourlyPicker() {

    if (!window.EyeDropper) {

        return {
            error:
                "EyeDropper API is not supported."
        };

    }


    try {

        const eyeDropper =
            new EyeDropper();


        console.log(
            "Colourly: starting EyeDropper..."
        );


        const result =
            await eyeDropper.open();


        console.log(
            "Colourly selected:",
            result.sRGBHex
        );


        return {

            hex:
                result.sRGBHex

        };

    }

    catch (error) {

        console.error(
            "Colourly EyeDropper error:",
            error
        );


        return {

            error:
                error.name

        };

    }

}