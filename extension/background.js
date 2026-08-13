/*
 * Clicking the extension icon is the "switch on" moment.
 * We inject picker.css + picker.js into the active tab.
 * Everything else — opening the EyeDropper, showing the
 * floating card, copy buttons — happens inside picker.js,
 * on the page itself. No side panel, no message passing,
 * no race conditions.
 */

chrome.action.onClicked.addListener(async (tab) => {

    if (!tab.id) {
        return;
    }

    try {

        await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["picker.css"]
        });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["picker.js"]
        });

    }

    catch (error) {

        console.error(
            "Colourly: could not start picker on this page.",
            error
        );

    }

});
