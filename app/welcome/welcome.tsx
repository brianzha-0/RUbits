import Webcam from "react-webcam";
import React from "react";
import DSPlay from "/build/client/diamondsionall.jfif";

export function Welcome() {
  const webcamRef = React.useRef(null);
  const [screenshots, setScreenshots] = React.useState([]);
  
  const captureScreenshots = async () => {
    const captures = [];
    for (let i = 0; i < 100; ++i) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) captures.push(imageSrc);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setScreenshots(captures);
  };

  return (
    <main className="flex flex-col items-center justify-center pt-16 pb-4 gap-10">
      <div>
        <img
          className="vtx-fade-el"
          src={DSPlay} 
          alt="Digital Signal Processing (DSP) Logo (Asset) Representation" 
          style={{ width: "480px", height: "480px", margin: "-40px 0 0 0" }} 
        />
      </div>
      {typeof window !== "undefined" && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="rounded-xl w-[500px] max-w-[100vw]"
        />
      )}

      <button
        onClick={captureScreenshots}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Capture 100 Screenshots
      </button>

      <div className="screenshots-grid">
        {screenshots.map((src, index) => (
          <img key={index} src={src} alt={`Screenshot ${index + 1}`} className="max-w-xs mb-2" />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src="/1273436.png"
              alt="Rubik's Cube Artwork Deep Etched"
              className="block w-full dark:hidden"
            />
            <img
              src="/1273436.png"
              alt="Rubik's Cube Artwork Deep Etched"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
      </div>
    </main>
  );
}