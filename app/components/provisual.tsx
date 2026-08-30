import React, {useRef, useState} from "react";
import Webcam from "react-webcam";
//import axios from "axios";


type ColorName =
    | "white"
    | "yellow"
    | "red"
    | "orange"
    | "blue"
    | "green";


type Face =
    | "U"
    | "D"
    | "F"
    | "B"
    | "L"
    | "R";


interface CubeState {

    U:ColorName[];
    D:ColorName[];
    F:ColorName[];
    B:ColorName[];
    L:ColorName[];
    R:ColorName[];

}


const MODEL =
"rubiks-cube-colors/2";


const API =
"https://detect.roboflow.com/";


function convertColor(
    c:string
):ColorName|null{


    switch(c){

        case "w":
            return "white";

        case "y":
            return "yellow";

        case "r":
            return "red";

        case "o":
            return "orange";

        case "b":
            return "blue";

        case "g":
            return "green";

        default:
            return null;

    }

}


function blankCube():CubeState{

    
    return {

        U:Array(9).fill("white"),
        D:Array(9).fill("yellow"),
        F:Array(9).fill("green"),
        B:Array(9).fill("blue"),
        L:Array(9).fill("orange"),
        R:Array(9).fill("red")

    };

}


export default function Scanner(){


    const webcamRef =
        useRef<Webcam>(null);


    const [frames,setFrames] =
        useState<string[]>([]);


    const [cube,setCube] =
        useState<CubeState|null>(null);



    async function capture(){


        const imgs:string[]=[];


        for(let i=0;i<100;i++){


            const img =
                webcamRef.current
                ?.getScreenshot();


            if(img)
                imgs.push(img);



            await new Promise(
                r=>setTimeout(r,100)
            );

        }


        setFrames(imgs);


        const state =
            await scanCube(imgs);



        setCube(state);

    }





    async function scanCube(
        imgs:string[]
    ):Promise<CubeState>{


        const detections:any[]=[];


        for(const img of imgs){


            const response =
                await axios.post(

                `${API}${MODEL}`,

                img.split(",")[1],

                {

                    params:{
                        api_key:
                        "YOUR_ROBOFLOW_KEY"
                    },

                    headers:{
                        "Content-Type":
                        "application/x-www-form-urlencoded"
                    }

                });


            detections.push(
                response.data
            );


        }



        return mapPredictions(
            detections
        );

    }





    function mapPredictions(
        predictions:any[]
    ):CubeState{


        const cube =
            blankCube();



        /*
            Each prediction contains:

            {
              class:"g",
              confidence:0.9,
              x:123,
              y:456,
              width:20,
              height:20
            }


            We average the 100 frames.
        */


        const stickers:
        ColorName[]=[];


        for(const frame of predictions){


            for(
                const p of frame.predictions ?? []
            ){


                const color =
                    convertColor(
                        p.class
                    );


                if(color)
                    stickers.push(color);


            }

        }



        /*
            Temporary ordering.

            Next step:
            use x/y coordinates to
            separate:
              U,D,F,B,L,R

            and sort each face
            into:

            0 1 2
            3 4 5
            6 7 8

        */



        if(stickers.length>=54){


            cube.F =
                stickers.slice(0,9);

            cube.R =
                stickers.slice(9,18);

            cube.U =
                stickers.slice(18,27);

            cube.L =
                stickers.slice(27,36);

            cube.D =
                stickers.slice(36,45);

            cube.B =
                stickers.slice(45,54);

        }



        return cube;

    }





    return (

        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "60px 24px",
                boxSizing: "border-box",
                background:
                    "radial-gradient(circle at 50% 0%, #252525 0%, #111 45%, #070707 100%)",
                color: "white",
                fontFamily: "Inter, system-ui, sans-serif"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "900px",
                    textAlign: "center"
                }}
            >

                <div
                    style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        marginBottom: "18px",
                        border: "1px solid #333",
                        borderRadius: "999px",
                        background: "#151515",
                        color: "#888",
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "2px",
                        textTransform: "uppercase"
                    }}
                >
                    RUbit's Vision
                </div>

                <h1
                    style={{
                        margin: "0",
                        fontSize: "clamp(40px, 6vw, 64px)",
                        lineHeight: "1.05",
                        fontWeight: "800",
                        letterSpacing: "-2px"
                    }}
                >
                    Rubik's Cube
                    <br />
                    <span style={{ color: "#666" }}>
                        Scanner
                    </span>
                </h1>

                <p
                    style={{
                        margin: "20px auto 40px",
                        maxWidth: "560px",
                        color: "#888",
                        fontSize: "16px",
                        lineHeight: "1.7"
                    }}
                >
                    Position your cube in front of the camera and
                    let RUbit's analyze its colors and orientation.
                </p>


                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "720px",
                        margin: "0 auto",
                        padding: "8px",
                        borderRadius: "20px",
                        background: "#151515",
                        border: "1px solid #303030",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
                        boxSizing: "border-box"
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "14px",
                            background: "#050505"
                        }}
                    >

                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode:"environment"
                            }}
                            style={{
                                display: "block",
                                width: "100%",
                                aspectRatio: "16 / 10",
                                objectFit: "cover"
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                inset: "25px",
                                border: "1px solid rgba(255,255,255,0.3)",
                                borderRadius: "10px",
                                pointerEvents: "none"
                            }}
                        />

                        <div
                            style={{
                                position: "absolute",
                                top: "18px",
                                left: "20px",
                                padding: "5px 9px",
                                borderRadius: "5px",
                                background: "rgba(0,0,0,0.65)",
                                color: "#aaa",
                                fontSize: "10px",
                                letterSpacing: "1.5px"
                            }}
                        >
                            CAMERA ACTIVE
                        </div>

                    </div>

                </div>


                <button
                    onClick={capture}
                    style={{
                        marginTop: "24px",
                        padding: "14px 42px",
                        border: "none",
                        borderRadius: "10px",
                        background: "#fff",
                        color: "#111",
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 10px 30px rgba(255,255,255,0.08)"
                    }}
                >
                    Scan Cube
                </button>


                {
                    cube &&
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "720px",
                            margin: "35px auto 0",
                            padding: "20px",
                            boxSizing: "border-box",
                            textAlign: "left",
                            borderRadius: "14px",
                            background: "#111",
                            border: "1px solid #292929"
                        }}
                    >

                        <div
                            style={{
                                marginBottom: "10px",
                                color: "#666",
                                fontSize: "11px",
                                fontWeight: "600",
                                letterSpacing: "1.5px",
                                textTransform: "uppercase"
                            }}
                        >
                            Detected Cube
                        </div>

                        <pre
                            style={{
                                margin: 0,
                                padding: "15px",
                                overflow: "auto",
                                borderRadius: "8px",
                                background: "#080808",
                                color: "#aaa",
                                fontSize: "12px",
                                lineHeight: "1.6"
                            }}
                        >
                            {
                                JSON.stringify(
                                    cube,
                                    null,
                                    2
                                )
                            }
                        </pre>

                    </div>
                }


                {frames.length > 0 && (
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "720px",
                            margin: "30px auto 0",
                            textAlign: "left"
                        }}
                    >

                        <div
                            style={{
                                marginBottom: "12px",
                                color: "#666",
                                fontSize: "11px",
                                fontWeight: "600",
                                letterSpacing: "1.5px",
                                textTransform: "uppercase"
                            }}
                        >
                            Captured Frames
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(120px, 1fr))",
                                gap: "10px"
                            }}
                        >

                            {frames.map((frame, i) => (
                                <img
                                    key={i}
                                    src={frame}
                                    width={120}
                                    alt={`Frame ${i + 1}`}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "1",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        border: "1px solid #292929"
                                    }}
                                />
                            ))}

                        </div>

                    </div>
                )}

            </div>

        </div>

    );


}