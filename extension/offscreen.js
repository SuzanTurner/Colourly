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


let stream = null;

let videoReady = false;


/* =================================
   START CAPTURE
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
   CREATE VIDEO STREAM
================================= */

async function startCapture(
    streamId
) {

    try {

        stream =
            await navigator.mediaDevices
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
            "Colourly live capture started."
        );


    }

    catch (error) {

        console.error(
            "Could not start tab capture:",
            error
        );

    }

}


/* =================================
   SAMPLE PIXEL
================================= */

function samplePixel(
    data
) {

    if (
        !videoReady ||
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
        return;
    }


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {
        return;
    }


    /*
     * The captured video dimensions
     * can differ from CSS viewport size.
     *
     * Therefore map:
     *
     * browser coordinate
     *        ↓
     * video coordinate
     */

    const videoX =
        Math.floor(
            data.x *
            (
                video.videoWidth /
                data.viewportWidth
            )
        );


    const videoY =
        Math.floor(
            data.y *
            (
                video.videoHeight /
                data.viewportHeight
            )
        );


    /*
     * Sample only ONE pixel.
     */

    canvas.width = 1;
    canvas.height = 1;


    ctx.drawImage(

        video,

        videoX,
        videoY,

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


    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];


    /*
     * Send colour to side panel.
     */

    chrome.runtime.sendMessage({

        type: "COLOUR_UPDATE",

        r: r,

        g: g,

        b: b

    });

}