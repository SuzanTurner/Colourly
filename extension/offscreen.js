const video =
    document.getElementById(
        "tab-video"
    );


const canvas =
    document.getElementById(
        "sample-canvas"
    );


const ctx =
    canvas.getContext(
        "2d",
        {
            willReadFrequently: true
        }
    );


let videoReady = false;


/* =================================
   RECEIVE MESSAGES
================================= */

chrome.runtime.onMessage.addListener(
    async (message) => {

        if (
            message.type ===
            "START_CAPTURE"
        ) {

            await startCapture(
                message.streamId
            );

        }


        if (
            message.type ===
            "POINTER"
        ) {

            samplePixel(
                message
            );

        }

    }
);


/* =================================
   START TAB CAPTURE
================================= */

async function startCapture(
    streamId
) {

    try {

        /*
         * Stop previous stream if any.
         */

        if (video.srcObject) {

            video.srcObject
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

        }


        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    audio: false,

                    video: {

                        mandatory: {

                            chromeMediaSource:
                                "tab",

                            chromeMediaSourceId:
                                streamId

                        }

                    }

                });


        video.srcObject =
            stream;


        await video.play();


        videoReady = true;


        console.log(
            "Colourly capture ready:",
            video.videoWidth,
            video.videoHeight
        );

    }

    catch (error) {

        videoReady = false;

        console.error(
            "Colourly capture error:",
            error
        );

    }

}


/* =================================
   SAMPLE PIXEL
================================= */

function samplePixel(data) {

    if (!videoReady) {
        return;
    }


    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
        return;
    }


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {
        return;
    }


    /*
     * Convert browser coordinates
     * to captured video coordinates.
     */

    const x =
        Math.floor(
            data.x *
            (
                video.videoWidth /
                data.viewportWidth
            )
        );


    const y =
        Math.floor(
            data.y *
            (
                video.videoHeight /
                data.viewportHeight
            )
        );


    /*
     * Don't sample outside the video.
     */

    if (
        x < 0 ||
        y < 0 ||
        x >= video.videoWidth ||
        y >= video.videoHeight
    ) {
        return;
    }


    /*
     * One-pixel canvas.
     */

    canvas.width = 1;
    canvas.height = 1;


    ctx.drawImage(

        video,

        x,
        y,

        1,
        1,

        0,
        0,

        1,
        1

    );


    const pixel =
        ctx.getImageData(
            0,
            0,
            1,
            1
        ).data;


    const r =
        pixel[0];

    const g =
        pixel[1];

    const b =
        pixel[2];


    /*
     * Send colour back.
     */

    chrome.runtime.sendMessage({

        type: "COLOUR_UPDATE",

        r: r,

        g: g,

        b: b

    });

}