import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import type { Route } from "./+types/cube";

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

function cubeToString(cube: CubeState): string {

    const map: Record<ColorName, string> = {
        white: "W",
        yellow: "Y",
        red: "R",
        orange: "O",
        blue: "B",
        green: "G",
        gray: "X"
    };

    const order: Face[] = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];

    return order
        .flatMap(face => cube[face])
        .map(color => map[color])
        .join("");
}

export default function CubePage(){

    const [cube,setCube]=useState<CubeState>(
        solvedCube
    );

    const [selected,setSelected]=
        useState<ColorName>("red");

    const [solution,setSolution]=
        useState("");

    const [solving,setSolving]=
        useState(false);

    const [solveError,setSolveError]=
        useState("");

    function updateSticker(
        face:Face,
        index:number
    ){

        setCube(prev=>{

            const oldColor = prev[face][index];

            if(oldColor === selected){
                return prev;
            }

            const counts = countColors(prev);

            const selectedAmount =
                counts[selected] ?? 0;

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

            const newCube: CubeState = {

                ...prev,

                [face]:
                    prev[face].map(
                        (color, i) =>
                            i === index
                                ? selected
                                : color
                    )

            };

            const cubeString = cubeToString(newCube);

            console.log(cubeString);

            return newCube;
        });
    }

    async function solveCube() {

        const cubeString = cubeToString(cube);

        if (cubeString.includes("X")) {

            setSolveError(
                "Finish coloring all 54 stickers before solving."
            );

            return;
        }

        setSolving(true);
        setSolveError("");
        setSolution("");

        try {

            const response = await fetch(
                "/api/solve-cube",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cubeString
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to solve cube."
                );

            }

            setSolution(data.solution);

        } catch (error) {

            console.error(error);

            setSolveError(
                error instanceof Error
                    ? error.message
                    : "Failed to solve cube."
            );

        } finally {

            setSolving(false);

        }
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

                <h1>
                    Colors
                </h1>

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

                <h1>
                    Cube Data
                </h1>

                <pre
                    style={{
                        fontSize:10,
                        maxWidth:250,
                        maxHeight:200,
                        overflow:"auto"
                    }}
                >
                    {cubeToString(cube)}
                </pre>

                <button
                    onClick={solveCube}
                    disabled={solving}
                    style={{
                        marginTop: 10,
                        width: "100%",
                        padding: "10px",
                        border: "none",
                        borderRadius: 6,
                        cursor: solving ? "wait" : "pointer",
                        background: solving ? "#555" : "#ffffff",
                        color: "#000",
                        fontWeight: "bold"
                    }}
                >
                    {solving ? "Solving..." : "Solve Cube"}
                </button>

                {solution && (
                    <div
                        style={{
                            marginTop: 10,
                            padding: 10,
                            background: "#111",
                            borderRadius: 6
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                color: "#aaa",
                                marginBottom: 5
                            }}
                        >
                            Solution
                        </div>

                        <div
                            style={{
                                fontFamily: "monospace",
                                fontSize: 16,
                                wordBreak: "break-word"
                            }}
                        >
                            {solution}
                        </div>
                    </div>
                )}

                {solveError && (
                    <div
                        style={{
                            marginTop: 10,
                            color: "#ff6666",
                            fontSize: 12
                        }}
                    >
                        {solveError}
                    </div>
                )}

            </div>

        </div>

    );
}