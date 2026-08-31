import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { normalizeCube } from "./api.solve-cube";

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

type CubeSize = 3 | 4;

interface CubeState {
    U: ColorName[];
    D: ColorName[];
    F: ColorName[];
    B: ColorName[];
    L: ColorName[];
    R: ColorName[];
}

const colors: Record<ColorName, string> = {
    white: "#ffffff",
    yellow: "#ffff00",
    red: "#ff0000",
    orange: "#ff8800",
    blue: "#0044ff",
    green: "#00aa00",
    gray: "#666666"
};

function createSolvedCube(size: CubeSize): CubeState {

    const stickers = size * size;

    return {
        U: Array(stickers).fill("gray"),
        D: Array(stickers).fill("gray"),
        F: Array(stickers).fill("gray"),
        B: Array(stickers).fill("gray"),
        L: Array(stickers).fill("gray"),
        R: Array(stickers).fill("gray")
    };
}

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
    size,
    onClick
}: {
    position: [number, number, number];
    rotation: [number, number, number];
    color: ColorName;
    size: number;
    onClick: () => void;
}) {

    return (
        <mesh
            position={position}
            rotation={rotation}
            onClick={onClick}
        >
            <planeGeometry args={[size, size]} />

            <meshStandardMaterial
                color={colors[color]}
            />
        </mesh>
    );
}

function FaceGrid({
    face,
    cube,
    update,
    dimension
}: {
    face: Face;
    cube: CubeState;
    update: (face: Face, index: number) => void;
    dimension: CubeSize;
}) {

    const stickers = [];

    const spacing =
        dimension === 3
            ? 0.31
            : 0.235;

    const stickerSize =
        dimension === 3
            ? 0.28
            : 0.21;

    const faceSize =
        spacing * dimension;

    const start =
        (dimension - 1) / 2;

    for (
        let row = 0;
        row < dimension;
        row++
    ) {

        for (
            let col = 0;
            col < dimension;
            col++
        ) {

            let x = 0;
            let y = 0;
            let z = 0;

            let rotation: [
                number,
                number,
                number
            ] = [0, 0, 0];

            const a =
                (col - start) * spacing;

            const b =
                (start - row) * spacing;

            switch (face) {

                case "F":
                    x = a;
                    y = b;
                    z = faceSize / 2;
                    break;

                case "B":
                    x = -a;
                    y = b;
                    z = -faceSize / 2;
                    rotation = [
                        0,
                        Math.PI,
                        0
                    ];
                    break;

                case "U":
                    x = a;
                    y = faceSize / 2;
                    z = b;
                    rotation = [
                        -Math.PI / 2,
                        0,
                        0
                    ];
                    break;

                case "D":
                    x = a;
                    y = -faceSize / 2;
                    z = -b;
                    rotation = [
                        Math.PI / 2,
                        0,
                        0
                    ];
                    break;

                case "L":
                    x = -faceSize / 2;
                    y = b;
                    z = -a;
                    rotation = [
                        0,
                        -Math.PI / 2,
                        0
                    ];
                    break;

                case "R":
                    x = faceSize / 2;
                    y = b;
                    z = a;
                    rotation = [
                        0,
                        Math.PI / 2,
                        0
                    ];
                    break;
            }

            const index =
                row * dimension + col;

            stickers.push(
                <Sticker
                    key={`${face}-${row}-${col}`}
                    position={[x, y, z]}
                    rotation={rotation}
                    color={cube[face][index]}
                    size={stickerSize}
                    onClick={() =>
                        update(
                            face,
                            index
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
    update,
    dimension
}: {
    cube: CubeState;
    update: (
        face: Face,
        index: number
    ) => void;
    dimension: CubeSize;
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
                    dimension={dimension}
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

    const [dimension, setDimension] =
        useState<CubeSize>(3);

    const [cube, setCube] =
        useState<CubeState>(
            createSolvedCube(3)
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

    function changeDimension(
        newDimension: CubeSize
    ) {

        setDimension(newDimension);

        setCube(
            createSolvedCube(newDimension)
        );

        setSolution("");
        setNormalizedCube("");
        setSolveError("");
    }

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

            const maxStickers =
                dimension * dimension;

            if (
                selected !== "gray" &&
                counts[selected] >= maxStickers
            ) {

                alert(
                    `${selected} already has ${maxStickers} stickers`
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

        if (dimension === 4) {

            setSolveError(
                "4x4 solving is not supported by the current solver yet."
            );

            return;
        }

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

            const normalizedCube =
                normalizeCube(
                    cubeString
                );

            setNormalizedCube(
                normalizedCube
            );

            const response =
                await fetch(
                    "/api/solve-cube",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            cubeString
                        })
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to get cube solution."
                );
            }

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

    const stickerCount =
        dimension * dimension * 6;

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
                    position:
                        dimension === 3
                            ? [2, 2, 3]
                            : [2.5, 2.5, 3.5]
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
                    dimension={dimension}
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
                    maxHeight:
                        "calc(100vh - 40px)",
                    overflowY: "auto"
                }}
            >

                <h1
                    style={{
                        marginTop: 0
                    }}
                >
                    Cube
                </h1>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 15
                    }}
                >

                    <button
                        onClick={() =>
                            changeDimension(3)
                        }
                        style={{
                            flex: 1,
                            padding: 10,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            background:
                                dimension === 3
                                    ? "#fff"
                                    : "#444",
                            color:
                                dimension === 3
                                    ? "#000"
                                    : "#fff",
                            fontWeight: "bold"
                        }}
                    >
                        3×3
                    </button>

                    <button
                        onClick={() =>
                            changeDimension(4)
                        }
                        style={{
                            flex: 1,
                            padding: 10,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            background:
                                dimension === 4
                                    ? "#fff"
                                    : "#444",
                            color:
                                dimension === 4
                                    ? "#000"
                                    : "#fff",
                            fontWeight: "bold"
                        }}
                    >
                        4×4
                    </button>

                </div>

                <h2>
                    Colors
                </h2>

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

                <div
                    style={{
                        fontSize: 11,
                        color: "#aaa",
                        marginTop: 5
                    }}
                >
                    {dimension}×{dimension} cube
                    {" • "}
                    {stickerCount} stickers
                </div>

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
                    {normalizedCube ||
                        "Not normalized yet"}
                </pre>

                <button
                    onClick={solveCube}
                    disabled={
                        solving ||
                        dimension === 4
                    }
                    style={{
                        marginTop: 10,
                        width: "100%",
                        padding: 12,
                        border: "none",
                        borderRadius: 6,
                        cursor:
                            solving ||
                            dimension === 4
                                ? "not-allowed"
                                : "pointer",
                        background:
                            solving ||
                            dimension === 4
                                ? "#555"
                                : "#fff",
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: 15
                    }}
                >
                    {dimension === 4
                        ? "4×4 Solver Unavailable"
                        : solving
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