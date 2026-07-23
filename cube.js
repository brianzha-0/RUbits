import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
// ----------------------------
// Default solved cube
// ----------------------------
const solvedCube = {
    U: Array(9).fill("gray"),
    D: Array(9).fill("gray"),
    F: Array(9).fill("gray"),
    B: Array(9).fill("gray"),
    L: Array(9).fill("gray"),
    R: Array(9).fill("gray"),
};
const colors = {
    white: "#ffffff",
    yellow: "#ffff00",
    red: "#ff0000",
    orange: "#ff8800",
    blue: "#0044ff",
    green: "#00aa00",
    gray: "#666666"
};
// ----------------------------
// Utility
// ----------------------------
function countColors(cube) {
    const counts = {
        white: 0,
        yellow: 0,
        red: 0,
        orange: 0,
        blue: 0,
        green: 0
    };
    Object.values(cube)
        .flat()
        .forEach(color => {
        counts[color]++;
    });
    return counts;
}
// ----------------------------
// Sticker component
// ----------------------------
function Sticker({ position, rotation, color, onClick }) {
    return (React.createElement("mesh", { position: position, rotation: rotation, onClick: onClick },
        React.createElement("planeGeometry", { args: [0.28, 0.28] }),
        React.createElement("meshStandardMaterial", { color: colors[color] })));
}
// ----------------------------
// Cube face creator
// ----------------------------
function FaceGrid({ face, cube, update }) {
    const stickers = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            let x = 0;
            let y = 0;
            let z = 0;
            let rotation = [0, 0, 0];
            const spacing = 0.31;
            const a = (col - 1) * spacing;
            const b = (1 - row) * spacing;
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
                    rotation = [0, Math.PI, 0];
                    break;
                case "U":
                    x = a;
                    y = 0.5;
                    z = b;
                    rotation = [-Math.PI / 2, 0, 0];
                    break;
                case "D":
                    x = a;
                    y = -0.5;
                    z = -b;
                    rotation = [Math.PI / 2, 0, 0];
                    break;
                case "L":
                    x = -0.5;
                    y = b;
                    z = -a;
                    rotation = [0, -Math.PI / 2, 0];
                    break;
                case "R":
                    x = 0.5;
                    y = b;
                    z = a;
                    rotation = [0, Math.PI / 2, 0];
                    break;
            }
            stickers.push(React.createElement(Sticker, { key: `${face}-${row}-${col}`, position: [x, y, z], rotation: rotation, color: cube[face][row * 3 + col], onClick: () => update(face, row * 3 + col) }));
        }
    }
    return stickers;
}
// ----------------------------
// 3D Cube
// ----------------------------
function Cube3D({ cube, update }) {
    return (React.createElement("group", null, [
        "U",
        "D",
        "F",
        "B",
        "L",
        "R"
    ]
        .map(face => (React.createElement(FaceGrid, { key: face, face: face, cube: cube, update: update })))));
}
// ----------------------------
// Route
// ----------------------------
export default function CubePage() {
    const [cube, setCube] = useState(solvedCube);
    const [selected, setSelected] = useState("red");
    function updateSticker(face, index) {
        setCube(prev => {
            const oldColor = prev[face][index];
            // Same color, no change
            if (oldColor === selected) {
                return prev;
            }
            const counts = countColors(prev);
            const selectedAmount = counts[selected] ?? 0;
            // Only block if we are adding a new sticker
            // and that color already has 9
            if (selectedAmount >= 9
                &&
                    oldColor !== selected) {
                alert(`${selected} already has 9 stickers`);
                return prev;
            }
            return {
                ...prev,
                [face]: prev[face].map((color, i) => i === index
                    ? selected
                    : color)
            };
        });
    }
    return (React.createElement("div", { style: {
            width: "100vw",
            height: "100vh",
            background: "#111",
            color: "white"
        } },
        React.createElement(Canvas, { camera: {
                position: [
                    2,
                    2,
                    3
                ]
            } },
            React.createElement("ambientLight", null),
            React.createElement("pointLight", { position: [3, 3, 3] }),
            React.createElement(Cube3D, { cube: cube, update: updateSticker }),
            React.createElement(OrbitControls, null)),
        React.createElement("div", { style: {
                position: "absolute",
                top: 20,
                left: 20,
                background: "#222",
                padding: 15,
                borderRadius: 10
            } },
            React.createElement("h3", null, "Colors"),
            Object.keys(colors).map((c) => {
                const color = c;
                return (React.createElement("button", { key: color, onClick: () => setSelected(color), style: {
                        margin: 5,
                        width: 40,
                        height: 40,
                        background: colors[color],
                        border: selected === color
                            ? "4px solid white"
                            : "1px solid black"
                    } }));
            }),
            React.createElement("h3", null, "Cube Data"),
            React.createElement("pre", { style: {
                    fontSize: 10,
                    maxWidth: 250,
                    maxHeight: 200,
                    overflow: "auto"
                } }, JSON.stringify(cube, null, 2)))));
}
