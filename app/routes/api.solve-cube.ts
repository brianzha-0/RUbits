import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const body = await request.json();
        const cubeString = body.cubeString;

        if (typeof cubeString !== "string") {
            return new Response(
                JSON.stringify({
                    error: "cubeString must be a string"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (cubeString.length !== 54) {
            return new Response(
                JSON.stringify({
                    error: `Invalid cube string length: ${cubeString.length}. Expected 54.`
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (!/^[WYROBG]+$/.test(cubeString)) {
            return new Response(
                JSON.stringify({
                    error: "Cube string contains invalid characters."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const prompt = `
You are a Rubik's Cube solving assistant.

The user gives you a 54-character Rubik's Cube facelet string.

The facelet order is:
U R F D L B

Each face contains 9 stickers in reading order:
top-left to bottom-right.

Colors:
W = white
Y = yellow
R = red
O = orange
B = blue
G = green

Cube string:
${cubeString}

Solve this exact Rubik's Cube.

Your response MUST contain ONLY the solution moves in standard Singmaster notation on ONE LINE.

Rules:
- Use only U, D, L, R, F, B
- Prime turns use '
- Double turns use 2
- Separate moves with single spaces
- Do not use markdown
- Do not explain anything
- Do not include "Solution:"
- Do not include a code block
- Output only the move sequence
`;

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Rubik's Cube Solver"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 500
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error("OpenRouter error:", errorText);

            return new Response(
                JSON.stringify({
                    error: "Failed to get a solution from OpenRouter."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const data = await response.json();

        let solution =
            data?.choices?.[0]?.message?.content || "";

        solution = solution
            .trim()
            .replace(/```/g, "")
            .replace(/^Solution:\s*/i, "")
            .replace(/\s+/g, " ")
            .trim();

        const validNotation =
            /^(?:[UDLRFB](?:2|')?)(?: (?:[UDLRFB](?:2|')?))*$/;

        if (!solution || !validNotation.test(solution)) {
            return new Response(
                JSON.stringify({
                    error: "The model returned invalid cube notation.",
                    raw: solution
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({ solution }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        console.error("Solve cube error:", error);

        return new Response(
            JSON.stringify({
                error: "Unexpected server error."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}