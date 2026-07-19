export async function sendImages(images: string[]): 
Promise<string> {
    const response = await fetch("http://localhost:5173/solve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images }),
    });
    
    const data = await response.json();
    return data.solution;
}