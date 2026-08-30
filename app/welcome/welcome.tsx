import Webcam from "react-webcam";
import React from "react";
import DSPlay from "/build/client/diamondsinall.jfif";
import { sendImages } from "../api";
import { Link } from "react-router";
import Provisual from "~/components/provisual";

export default function Welcome() {

    const webcamRef = React.useRef<Webcam>(null);
    const [screenshots, setScreenshots] = React.useState<string[]>([]);
    const [solution, setSolution] = React.useState("");

    const captureScreenshots = async () => {
        const captures: string[] = [];

        for (let i = 0; i < 100; ++i) {

            const imageSrc =
                webcamRef.current?.getScreenshot();

            if (imageSrc)
                captures.push(imageSrc);

            await new Promise(resolve =>
                setTimeout(resolve, 200)
            );
        }

        setScreenshots(captures);

        try {
            const moves = await sendImages(captures);
            setSolution(moves);
        }
        catch(err) {
            console.error(err);
            setSolution("Failed to solve cube.");
        }
    };


    return (
        <main
            className="min-h-screen text-white flex flex-col items-center overflow-hidden"
            style={{
                background:
                    "radial-gradient(circle at 50% 0%, #252525 0%, #111 40%, #070707 100%)"
            }}
        >

            <nav
                className="w-full flex items-center justify-between px-8 py-5"
                style={{
                    borderBottom: "1px solid #292929",
                    background: "rgba(10,10,10,0.75)",
                    backdropFilter: "blur(12px)"
                }}
            >

                <div
                    className="flex items-center gap-3"
                >
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold cube-color"
                        style={{
                            // background:
                            //     "linear-gradient(135deg, #fff, #777)",
                            color: "#111"
                        }}
                    >
                        𓃑
                    </div>

                    <span
                        className="font-semibold tracking-wide"
                    >
                        RUbit's
                    </span>
                </div>

                <Link
                    to="/cube"
                    className="px-5 py-2 rounded-lg text-sm font-semibold transition"
                    style={{
                        background: "#fff",
                        color: "#111"
                    }}
                >
                    Cube Editor
                </Link>

            </nav>


            <section
                className="w-full max-w-6xl px-6 pt-16 pb-20 flex flex-col items-center text-center"
            >

                <div
                    className="px-3 py-1 rounded-full text-xs tracking-widest uppercase mb-6"
                    style={{
                        border: "1px solid #3a3a3a",
                        background: "#171717",
                        color: "#aaa"
                    }}
                >
                    Revolving around problem solving.
                </div>


                <h1
                    className="font-bold tracking-tight"
                    style={{
                        fontSize: "clamp(42px, 7vw, 76px)",
                        lineHeight: 1.05,
                        maxWidth: "850px"
                    }}
                >
                    Solve your cube.
                    <br />
                    <span style={{ color: "#777" }}>
                        One scan at a time.
                    </span>
                </h1>


                <pre
                    className="mt-6 text-lg"
                    style={{
                        color: "#999",
                        maxWidth: "620px",
                        lineHeight: 1.7,
                        fontFamily: "Courier New",
                        whiteSpace: "pre-wrap",
                        fontWeight: 900
                    }}
                >
                    Point your camera at your Rubik's Cube and let<br />
                    our RUbit's program analyze it to figure out a<br />
                    generative orientation for solution in solving
                </pre>


                <div
                    className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center"
                >

                    <div
                        className="flex flex-col items-center"
                    >

                        {typeof window !== "undefined" && (
                            <div
                                className="relative rounded-2xl overflow-hidden"
                                style={{
                                    width: "100%",
                                    maxWidth: "560px",
                                    aspectRatio: "16 / 10",
                                    border: "1px solid #383838",
                                    background: "#050505",
                                    boxShadow:
                                        "0 25px 80px rgba(0,0,0,0.5)"
                                }}
                            >

                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        facingMode: "user"
                                    }}
                                    className="w-full h-full object-cover"
                                />

                                <div
                                    className="absolute inset-5 pointer-events-none"
                                    style={{
                                        border:
                                            "1px solid rgba(255,255,255,0.35)",
                                        borderRadius: "12px"
                                    }}
                                />

                                <div
                                    className="absolute bottom-4 left-4 right-4 flex justify-between text-xs"
                                    style={{
                                        color: "#aaa"
                                    }}
                                >
                                    <span>
                                        CAMERA ACTIVE
                                    </span>

                                    <span>
                                        READY
                                    </span>
                                </div>

                            </div>
                        )}


                        <button
                            onClick={captureScreenshots}
                            className="mt-5 px-7 py-3 rounded-xl font-semibold transition"
                            style={{
                                background: "#fff",
                                color: "#111",
                                boxShadow:
                                    "0 10px 35px rgba(255,255,255,0.08)"
                            }}
                        >
                            Scan Cube
                        </button>

                        <p
                            className="mt-3 text-xs"
                            style={{
                                color: "#666"
                            }}
                        >
                            Captures 100 frames for analysis
                        </p>

                    </div>


                    <div
                        className="flex flex-col items-center"
                    >

                        <div
                            className="rounded-2xl p-5 w-full max-w-[560px]"
                            style={{
                                background: "#151515",
                                border: "1px solid #292929"
                            }}
                        >

                            <img
                                src={DSPlay}
                                alt="Digital Signal Processing Logo"
                                className="w-full max-w-[360px] mx-auto rounded-xl"
                                style={{
                                    opacity: 0.9
                                }}
                            />

                        </div>

                        <div
                            className="mt-6 rounded-2xl p-5 w-full max-w-[560px]"
                            style={{
                                background: "#151515",
                                border: "1px solid #292929"
                            }}
                        >

                            <div
                                className="text-xs uppercase tracking-widest mb-3"
                                style={{
                                    color: "#666"
                                }}
                            >
                                How it works
                            </div>

                            <div
                                className="grid grid-cols-3 gap-3"
                            >

                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                    >
                                        01
                                    </div>
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: "#888" }}
                                    >
                                        Scan
                                    </div>
                                </div>

                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                    >
                                        02
                                    </div>
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: "#888" }}
                                    >
                                        Analyze
                                    </div>
                                </div>

                                <div>
                                    <div
                                        className="text-2xl font-bold"
                                    >
                                        03
                                    </div>
                                    <div
                                        className="text-xs mt-1"
                                        style={{ color: "#888" }}
                                    >
                                        Solve
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {solution && (
                    <div
                        className="mt-10 w-full max-w-3xl rounded-2xl p-6"
                        style={{
                            background: "#151515",
                            border: "1px solid #383838"
                        }}
                    >

                        <div
                            className="text-xs uppercase tracking-widest"
                            style={{
                                color: "#777"
                            }}
                        >
                            Solution
                        </div>

                        <div
                            className="mt-3 font-mono text-xl break-words"
                        >
                            {solution}
                        </div>

                    </div>
                )}

            </section>


            <section
                className="w-full max-w-5xl px-6 pb-20 flex flex-col items-center"
            >

                <div
                    className="text-center mb-8"
                >
                    <h2
                        className="text-3xl font-bold"
                    >
                        Manual Cube Editor
                    </h2>

                    <p
                        className="mt-2"
                        style={{
                            color: "#777"
                        }}
                    >
                        Prefer entering the cube yourself?
                    </p>
                </div>


                <div
                    className="w-full max-w-[500px] p-5 rounded-2xl"
                    style={{
                        background: "#151515",
                        border: "1px solid #292929"
                    }}
                >

                    <img
                        src="/1273436.png"
                        alt="Rubik's Cube Artwork Deep Etched"
                        className="block w-full rounded-xl"
                    />

                    <Link
                        to="/cube"
                        className="mt-5 block text-center w-full py-3 rounded-xl font-semibold"
                        style={{
                            background: "#fff",
                            color: "#111"
                        }}
                    >
                        Open Cube Editor
                    </Link>

                </div>

            </section>


            {screenshots.length > 0 && (
                <section
                    className="w-full max-w-6xl px-6 pb-20"
                >

                    <div
                        className="mb-5"
                    >
                        <h2 className="text-xl font-semibold">
                            Captured Frames
                        </h2>

                        <p
                            className="text-sm mt-1"
                            style={{
                                color: "#666"
                            }}
                        >
                            {screenshots.length} frames captured
                        </p>
                    </div>

                    <div
                        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3"
                    >
                        {screenshots.map((src, index) => (
                            <img
                                key={index}
                                src={src}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                                style={{
                                    border: "1px solid #292929"
                                }}
                            />
                        ))}
                    </div>

                </section>
            )}


            <div
                className="w-full flex justify-center pb-16"
            >
                <Provisual />
            </div>


            <footer
                className="w-full py-6 text-center text-xs"
                style={{
                    borderTop: "1px solid #222",
                    color: "#555"
                }}
            >
                (R)(N)otational · Intelligent Cube Analysis
            </footer>

        </main>
    );
}