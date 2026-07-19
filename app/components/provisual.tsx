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

        <div>

            <h1>
                Rubik's Cube Scanner
            </h1>


            <Webcam

                ref={webcamRef}

                screenshotFormat="image/jpeg"

                videoConstraints={{
                    facingMode:"environment"
                }}

            />


            <button
                onClick={capture}
            >
                Scan Cube
            </button>


            {
                cube &&
                <pre>

                    {
                        JSON.stringify(
                            cube,
                            null,
                            2
                        )
                    }

                </pre>
            }

            {frames.map((frame, i) => (
                <img
                    key={i}
                    src={frame}
                    width={120}
                    alt={`Frame ${i + 1}`}
                />
            ))}

        </div>

    );


}