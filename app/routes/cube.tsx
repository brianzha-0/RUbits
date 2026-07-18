import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import type { Route } from "./+types/cube";


// ----------------------------
// Types
// ----------------------------

type ColorName =
    | "white"
    | "yellow"
    | "red"
    | "orange"
    | "blue"
    | "green"
    | "gray";


type Face =
    | "U"
    | "D"
    | "F"
    | "B"
    | "L"
    | "R";


interface CubeState {
    U: ColorName[];
    D: ColorName[];
    F: ColorName[];
    B: ColorName[];
    L: ColorName[];
    R: ColorName[];
}


// ----------------------------
// Default solved cube
// ----------------------------

const solvedCube: CubeState = {
    U: Array(9).fill("gray"),
    D: Array(9).fill("gray"),
    F: Array(9).fill("gray"),
    B: Array(9).fill("gray"),
    L: Array(9).fill("gray"),
    R: Array(9).fill("gray"),
};


const colors: Record<ColorName,string> = {
    white:"#ffffff",
    yellow:"#ffff00",
    red:"#ff0000",
    orange:"#ff8800",
    blue:"#0044ff",
    green:"#00aa00",
    gray:"#666666"
};


// ----------------------------
// Utility
// ----------------------------

function countColors(
    cube:CubeState
):Record<ColorName,number>{

    const counts:Record<ColorName,number> = {

        white:0,
        yellow:0,
        red:0,
        orange:0,
        blue:0,
        green:0

    };


    Object.values(cube)
        .flat()
        .forEach(color=>{

            counts[color]++;

        });


    return counts;

}



// ----------------------------
// Sticker component
// ----------------------------

function Sticker(
{
    position,
    rotation,
    color,
    onClick
}:{
    position:[number,number,number],
    rotation:[number,number,number],
    color:ColorName,
    onClick:()=>void
}){

    return (

        <mesh
            position={position}
            rotation={rotation}
            onClick={onClick}
        >

            <planeGeometry args={[0.28,0.28]}/>

            <meshStandardMaterial
                color={colors[color]}
            />

        </mesh>

    );
}




// ----------------------------
// Cube face creator
// ----------------------------


function FaceGrid(
{
    face,
    cube,
    update
}:{
    face:Face,
    cube:CubeState,
    update:(f:Face,i:number)=>void
}){


    const stickers=[];


    for(let row=0;row<3;row++){

        for(let col=0;col<3;col++){

            let x=0;
            let y=0;
            let z=0;

            let rotation:[number,number,number]=
                [0,0,0];


            const spacing=0.31;


            const a=(col-1)*spacing;
            const b=(1-row)*spacing;



            switch(face){

                case "F":
                    x=a;
                    y=b;
                    z=0.5;
                    break;


                case "B":
                    x=-a;
                    y=b;
                    z=-0.5;
                    rotation=[0,Math.PI,0];
                    break;


                case "U":
                    x=a;
                    y=0.5;
                    z=b;
                    rotation=[-Math.PI/2,0,0];
                    break;


                case "D":
                    x=a;
                    y=-0.5;
                    z=-b;
                    rotation=[Math.PI/2,0,0];
                    break;


                case "L":
                    x=-0.5;
                    y=b;
                    z=-a;
                    rotation=[0,-Math.PI/2,0];
                    break;


                case "R":
                    x=0.5;
                    y=b;
                    z=a;
                    rotation=[0,Math.PI/2,0];
                    break;
            }



            stickers.push(

                <Sticker
                    key={`${face}-${row}-${col}`}
                    position={[x,y,z]}
                    rotation={rotation}
                    color={cube[face][row*3+col]}
                    onClick={()=>
                        update(face,row*3+col)
                    }
                />

            );

        }
    }


    return stickers;

}



// ----------------------------
// 3D Cube
// ----------------------------

function Cube3D(
{
    cube,
    update
}:{
    cube:CubeState,
    update:(f:Face,i:number)=>void
}){


    return (

        <group>

            {
                (
                    [
                        "U",
                        "D",
                        "F",
                        "B",
                        "L",
                        "R"
                    ] as Face[]
                )
                .map(face=>(

                    <FaceGrid
                        key={face}
                        face={face}
                        cube={cube}
                        update={update}
                    />

                ))
            }


        </group>

    );

}



// ----------------------------
// Route
// ----------------------------


export default function CubePage(){

    const [cube,setCube]=useState<CubeState>(
        solvedCube
    );
    
    
    const [selected,setSelected]=
        useState<ColorName>("red");

        function updateSticker(
            face:Face,
            index:number
        ){
        
            setCube(prev=>{
        
                const oldColor = prev[face][index];
        
        
                // Same color, no change
                if(oldColor === selected){
                    return prev;
                }
        
        
                const counts = countColors(prev);
        
                const selectedAmount =
                    counts[selected] ?? 0;
        
        
        
                // Only block if we are adding a new sticker
                // and that color already has 9
                if(
                    selectedAmount >= 9
                    &&
                    oldColor !== selected
                ){
        
                    alert(
                        `${selected} already has 9 stickers`
                    );
        
                    return prev;
                }
        
        
        
                return {
        
                    ...prev,
        
                    [face]:
                        prev[face].map(
                            (color,i)=>
                                i===index
                                ? selected
                                : color
                        )
        
                };
            });
        }



    return (

        <div
            style={{
                width:"100vw",
                height:"100vh",
                background:"#111",
                color:"white"
            }}
        >


            <Canvas
                camera={{
                    position:[
                        2,
                        2,
                        3
                    ]
                }}
            >

                <ambientLight/>

                <pointLight
                    position={[3,3,3]}
                />


                <Cube3D
                    cube={cube}
                    update={updateSticker}
                />


                <OrbitControls/>

            </Canvas>



            <div
                style={{
                    position:"absolute",
                    top:20,
                    left:20,
                    background:"#222",
                    padding:15,
                    borderRadius:10
                }}
            >


                <h3>
                    Colors
                </h3>


                {
                    Object.keys(colors).map((c) => {

                        const color = c as ColorName;

                        return (
                            <button
                                key={color}
                                onClick={() => setSelected(color)}
                                style={{
                                    margin: 5,
                                    width: 40,
                                    height: 40,
                                    background: colors[color],
                                    border:
                                        selected === color
                                        ? "4px solid white"
                                        : "1px solid black"
                                }}
                            />
                        );

                    })
                }


                <h3>
                    Cube Data
                </h3>


                <pre
                    style={{
                        fontSize:10,
                        maxWidth:250,
                        maxHeight:200,
                        overflow:"auto"
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


        </div>

    );
}