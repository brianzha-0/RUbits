import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

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

const colors: Record<ColorName, string> = {
    white: "#ffffff",
    yellow: "#ffff00",
    red: "#ff0000",
    orange: "#ff8800",
    blue: "#0044ff",
    green: "#00aa00",
    gray: "#666666"
};

function countColors(
    cube: CubeState
): Record<ColorName, number> {

    const counts: Record<ColorName, number> = {
        white: 0,
        yellow: 0,
        red: 0,
        orange: 0,
        blue: 0,
        green: 0,
        gray: 0
    };

    Object.values(cube)
        .flat()
        .forEach(color => {
            counts[color]++;
        });

    return counts;
}

function Sticker({
    position,
    rotation,
    color,
    onClick
}: {
    position: [number, number, number];
    rotation: [number, number, number];
    color: ColorName;
    onClick: () => void;
}) {

    return (
        <mesh
            position={position}
            rotation={rotation}
            onClick={onClick}
        >
            <planeGeometry args={[0.28, 0.28]} />

            <meshStandardMaterial
                color={colors[color]}
            />
        </mesh>
    );
}

function FaceGrid({
    face,
    cube,
    update
}: {
    face: Face;
    cube: CubeState;
    update: (face: Face, index: number) => void;
}) {

    const stickers = [];

    for (let row = 0; row < 3; row++) {

        for (let col = 0; col < 3; col++) {

            let x = 0;
            let y = 0;
            let z = 0;

            let rotation: [
                number,
                number,
                number
            ] = [0, 0, 0];

            const spacing = 0.31;

            const a =
                (col - 1) * spacing;

            const b =
                (1 - row) * spacing;

            switch (face) {

                case "F":
                    x = a;
                    y = b;
                    z = 0.5;
                    break;

                case "B":
                    x = -a;
                    y = b;
                    z = -0.5;
                    rotation = [
                        0,
                        Math.PI,
                        0
                    ];
                    break;

                case "U":
                    x = a;
                    y = 0.5;
                    z = b;
                    rotation = [
                        -Math.PI / 2,
                        0,
                        0
                    ];
                    break;

                case "D":
                    x = a;
                    y = -0.5;
                    z = -b;
                    rotation = [
                        Math.PI / 2,
                        0,
                        0
                    ];
                    break;

                case "L":
                    x = -0.5;
                    y = b;
                    z = -a;
                    rotation = [
                        0,
                        -Math.PI / 2,
                        0
                    ];
                    break;

                case "R":
                    x = 0.5;
                    y = b;
                    z = a;
                    rotation = [
                        0,
                        Math.PI / 2,
                        0
                    ];
                    break;
            }

            stickers.push(
                <Sticker
                    key={`${face}-${row}-${col}`}
                    position={[x, y, z]}
                    rotation={rotation}
                    color={
                        cube[face][row * 3 + col]
                    }
                    onClick={() =>
                        update(
                            face,
                            row * 3 + col
                        )
                    }
                />
            );
        }
    }

    return stickers;
}

function Cube3D({
    cube,
    update
}: {
    cube: CubeState;
    update: (
        face: Face,
        index: number
    ) => void;
}) {

    const faces: Face[] = [
        "U",
        "D",
        "F",
        "B",
        "L",
        "R"
    ];

    return (
        <group>
            {faces.map(face => (
                <FaceGrid
                    key={face}
                    face={face}
                    cube={cube}
                    update={update}
                />
            ))}
        </group>
    );
}

function cubeToString(
    cube: CubeState
): string {

    const map: Record<
        ColorName,
        string
    > = {
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

export default function CubePage() {

    const [cube, setCube] =
        useState<CubeState>(
            solvedCube
        );

    const [selected, setSelected] =
        useState<ColorName>("red");

    const [solution, setSolution] =
        useState("");

    const [normalizedCube, setNormalizedCube] =
        useState("");

    const [solving, setSolving] =
        useState(false);

    const [solveError, setSolveError] =
        useState("");

    function updateSticker(
        face: Face,
        index: number
    ) {

        setCube(prev => {

            const oldColor =
                prev[face][index];

            if (oldColor === selected) {
                return prev;
            }

            const counts =
                countColors(prev);

            if (
                selected !== "gray" &&
                counts[selected] >= 9
            ) {

                alert(
                    `${selected} already has 9 stickers`
                );

                return prev;
            }

            const newCube: CubeState = {
                ...prev,
                [face]: prev[face].map(
                    (color, i) =>
                        i === index
                            ? selected
                            : color
                )
            };

            return newCube;
        });
    }

    async function solveCube() {

        const cubeString =
            cubeToString(cube);

        if (cubeString.includes("X")) {

            setSolveError(
                "Finish coloring all 54 stickers before solving."
            );

            return;
        }

        setSolving(true);
        setSolveError("");
        setSolution("");
        setNormalizedCube("");

        try {

            const response =
                await fetch(
                    "/api/solve-cube",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            "Accept":
                                "application/json"
                        },
                        body: JSON.stringify({
                            cubeString
                        })
                    }
                );

            const text =
                await response.text();

            let result: {
                solution?: string;
                normalizedCube?: string;
                message?: string;
                error?: string;
            };

            try {

                result =
                    JSON.parse(text);

            } catch {

                throw new Error(
                    text ||
                    "API returned an invalid response."
                );
            }

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to get cube solution."
                );
            }

            setNormalizedCube(
                result.normalizedCube || ""
            );

            setSolution(
                result.solution || ""
            );

        } catch (error) {

            console.error(error);

            setSolveError(
                error instanceof Error
                    ? error.message
                    : "Failed to get cube solution."
            );

        } finally {

            setSolving(false);
        }
    }

    const cubeString =
        cubeToString(cube);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
                color: "white",
                position: "relative",
                overflow: "hidden"
            }}
        >

            <Canvas
                camera={{
                    position: [
                        2,
                        2,
                        3
                    ]
                }}
            >

                <ambientLight
                    intensity={1}
                />

                <pointLight
                    position={[3, 3, 3]}
                    intensity={2}
                />

                <Cube3D
                    cube={cube}
                    update={updateSticker}
                />

                <OrbitControls />

            </Canvas>

            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "#222",
                    padding: 15,
                    borderRadius: 10,
                    width: 280,
                    maxHeight: "calc(100vh - 40px)",
                    overflowY: "auto"
                }}
            >

                <h1
                    style={{
                        marginTop: 0
                    }}
                >
                    Colors
                </h1>

                <div>
                    {(
                        [
                            "white",
                            "yellow",
                            "red",
                            "orange",
                            "blue",
                            "green",
                            "gray"
                        ] as ColorName[]
                    ).map(color => (

                        <button
                            key={color}
                            onClick={() =>
                                setSelected(
                                    color
                                )
                            }
                            style={{
                                margin: 5,
                                width: 40,
                                height: 40,
                                background:
                                    colors[color],
                                border:
                                    selected === color
                                        ? "4px solid white"
                                        : "1px solid black",
                                borderRadius: 5,
                                cursor: "pointer"
                            }}
                        />

                    ))}
                </div>

                <h2>
                    Cube Data
                </h2>

                <pre
                    style={{
                        fontSize: 10,
                        maxWidth: 250,
                        maxHeight: 100,
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all"
                    }}
                >
                    {cubeString}
                </pre>

                <h2>
                    Normalized Cube
                </h2>

                <pre
                    style={{
                        fontSize: 10,
                        maxWidth: 250,
                        maxHeight: 100,
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all"
                    }}
                >
                    {normalizedCube || "Not normalized yet"}
                </pre>

                <button
                    onClick={solveCube}
                    disabled={solving}
                    style={{
                        marginTop: 10,
                        width: "100%",
                        padding: 12,
                        border: "none",
                        borderRadius: 6,
                        cursor: solving
                            ? "wait"
                            : "pointer",
                        background: solving
                            ? "#555"
                            : "#fff",
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: 15
                    }}
                >
                    {solving
                        ? "Solving..."
                        : "Solve Cube"}
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
                                fontFamily:
                                    "monospace",
                                fontSize: 16,
                                wordBreak:
                                    "break-word"
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
                            fontSize: 12,
                            wordBreak:
                                "break-word"
                        }}
                    >
                        {solveError}
                    </div>
                )}

            </div>

        </div>
    );
}