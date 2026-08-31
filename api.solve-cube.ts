import Cube from "cubejs";
import type { ActionFunctionArgs } from "react-router";

Cube.initSolver();

type Face =
    | "U"
    | "R"
    | "F"
    | "D"
    | "L"
    | "B";

export function normalizeCube(
    cubeString: string
): string {

    const faces: Record<Face, string[]> = {
        U: cubeString.slice(0, 9).split(""),
        R: cubeString.slice(9, 18).split(""),
        F: cubeString.slice(18, 27).split(""),
        D: cubeString.slice(27, 36).split(""),
        L: cubeString.slice(36, 45).split(""),
        B: cubeString.slice(45, 54).split("")
    };

    const centers = {
        U: faces.U[4],
        R: faces.R[4],
        F: faces.F[4],
        D: faces.D[4],
        L: faces.L[4],
        B: faces.B[4]
    };

    const requiredColors = new Set(
        Object.values(centers)
    );

    if (requiredColors.size !== 6) {
        throw new Error(
            "Each cube face must have a different center color."
        );
    }

    const colorToFace: Record<
        string,
        Face
    > = {
        [centers.U]: "U",
        [centers.R]: "R",
        [centers.F]: "F",
        [centers.D]: "D",
        [centers.L]: "L",
        [centers.B]: "B"
    };

    return [
        ...faces.U,
        ...faces.R,
        ...faces.F,
        ...faces.D,
        ...faces.L,
        ...faces.B
    ]
        .map(color => colorToFace[color])
        .join("");
}

export async function action({
    request
}: ActionFunctionArgs) {

    try {

        const body =
            await request.json();

        const cubeString =
            body.cubeString;

        if (
            typeof cubeString !== "string"
        ) {
            return new Response(
                JSON.stringify({
                    error:
                        "cubeString must be a string"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        const normalizedCube =
            normalizeCube(
                cubeString
            );

        console.log(
            "Original cube:",
            cubeString
        );

        console.log(
            "Normalized cube:",
            normalizedCube
        );

        let cube: Cube;

        try {

            cube =
                Cube.fromString(
                    normalizedCube
                );

        } catch {

            return new Response(
                JSON.stringify({
                    error:
                        "This is not a physically valid Rubik's Cube state."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        if (cube.isSolved()) {

            return new Response(
                JSON.stringify({
                    solution: "",
                    normalizedCube,
                    message: "Already solved!"
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        const solution =
            cube.solve()
                .trim()
                .replace(/\s+/g, " ");

        return new Response(
            JSON.stringify({
                solution,
                normalizedCube,
                message:
                    `Solution: ${solution}`
            }),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "Unexpected server error."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }
}