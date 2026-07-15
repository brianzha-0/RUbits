import React, {useRef, useState} from "react";
import Webcam from "react-webcam";
import axios from "axios";

type ColorName =
    | "white"
    | "yellow"
    | "red"
    | "orange"
    | "blue"
    | "green";


interface CubeState {

    U:ColorName[];
    D:ColorName[];
    F:ColorName[];
    B:ColorName[];
    L:ColorName[];
    R:ColorName[];

}



export default function Scanner(){


    const webcamRef = useRef<Webcam>(null);


    const [images,setImages] =
        useState<string[]>([]);


    const [cube,setCube] =
        useState<CubeState|null>(null);



    async function capture(){

        const shots:string[]=[];


        for(let i=0;i<100;i++){

            const img =
                webcamRef.current
                ?.getScreenshot();


            if(img)
                shots.push(img);


            await new Promise(
                r=>setTimeout(r,100)
            );

        }


        setImages(shots);

        await analyze(shots);

    }




    async function analyze(
        imgs:string[]
    ){

        /*
          Roboflow endpoint example:

          https://detect.roboflow.com/
          MODEL_NAME/VERSION
        */


        const result:any[]=[];


        for(const img of imgs){


            const response =
                await axios.post(

                "YOUR_ROBOFLOW_ENDPOINT",

                img,

                {
                    params:{
                        api_key:
                        "YOUR_API_KEY"
                    },

                    headers:{
                        "Content-Type":
                        "application/x-www-form-urlencoded"
                    }

                });


            result.push(
                response.data
            );


        }



        const mapped =
            convertPredictions(result);


        setCube(mapped);

    }





    function convertPredictions(
        predictions:any[]
    ):CubeState{


        /*
          Placeholder mapping.

          Later this will:
          - sort detections
          - determine face
          - determine sticker position
        */


        return {

            U:Array(9).fill("white"),
            D:Array(9).fill("yellow"),
            F:Array(9).fill("green"),
            B:Array(9).fill("blue"),
            L:Array(9).fill("orange"),
            R:Array(9).fill("red")

        };

    }





    return (

        <div>


            <h1>
                Cube Scanner
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



        </div>

    );

}