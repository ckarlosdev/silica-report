import { useEffect, useRef } from "react"; // Import useEffect and useRef
import "../styles/paint.css";
import bocina from "../assets/bocina.png";
import sprayer from "../assets/sprayer.png";
import estrella from "../assets/estrella.png";
import { initDrawingApp } from "../utils/paint"; // Import the init function
import { Silica } from "../types";

type Props = {
  silicaData?: Silica;
};

function Paint({ silicaData }: Props) {
  // Create refs for all the DOM elements you need to access
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figurePaletteRef = useRef<HTMLDivElement>(null);
  const colorButtonsRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const eraserButtonRef = useRef<HTMLButtonElement>(null);
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  // Add a ref for the image load status element
  const imageLoadStatusRef = useRef<HTMLDivElement>(null);

  // Use useEffect to run the initialization code after the component mounts
  useEffect(() => {
    // Ensure all refs have current values (i.e., elements are mounted)
    if (
      canvasRef.current &&
      figurePaletteRef.current &&
      colorButtonsRef.current &&
      clearButtonRef.current &&
      eraserButtonRef.current &&
      drawButtonRef.current &&
      imageLoadStatusRef.current // Check for this ref too
    ) {
      // Call the initialization function from paint.js, passing the DOM elements
      initDrawingApp(
        canvasRef.current,
        figurePaletteRef.current,
        colorButtonsRef.current,
        clearButtonRef.current,
        eraserButtonRef.current,
        drawButtonRef.current,
        imageLoadStatusRef.current // Pass the image load status element
      );
    }

    // Optional: Cleanup function if initDrawingApp adds event listeners
    // This return function runs when the component unmounts
    return () => {
      // If initDrawingApp added global listeners or complex setups,
      // you'd add cleanup logic here (e.g., removeEventListener)
      // For this example, the listeners are on ref.current, so they'll be garbage collected
      // when the component unmounts and the elements are removed.
    };
  }, []); // Empty dependency array means this effect runs only once after initial render

  return (
    <div>
      <div className="figure-palette" ref={figurePaletteRef}>
        {" "}
        <img src={bocina} alt="Bocina" id="bocina" draggable="true" />
        {/* IMPORTANT: IDs must be unique. Changed 'estrella' to unique IDs */}
        <img src={sprayer} alt="Sprayer" id="sprayer" draggable="true" />
        {/* <img src={water} alt="Water Drop" id="water" draggable="true" /> */}
        <img
          src={estrella}
          alt="Estrella"
          id="estrella"
          draggable="true"
        />{" "}
        {/* Kept one as estrella */}
      </div>
      <div className="controls">
        <div className="color-buttons" ref={colorButtonsRef}>
          {" "}
          {/* Attach ref */}
          <button
            id="red"
            aria-label="Color Rojo"
            style={{ backgroundColor: "red" }}
          ></button>
          <button
            id="blue"
            aria-label="Color Azul"
            style={{ backgroundColor: "blue" }}
          ></button>
          <button
            id="green"
            aria-label="Color Verde"
            style={{ backgroundColor: "green" }}
          ></button>
          <button
            id="black"
            aria-label="Color Negro"
            style={{ backgroundColor: "black" }}
          ></button>
        </div>
        <button id="clear" ref={clearButtonRef}>
          delete
        </button>{" "}
        {/* Attach ref */}
        <button id="eraser" ref={eraserButtonRef}>
          eraser
        </button>{" "}
        {/* Attach ref */}
        <button id="draw" ref={drawButtonRef}>
          paint
        </button>{" "}
        {/* Attach ref */}
      </div>
      <canvas
        id="drawingCanvas"
        ref={canvasRef}
        width="900"
        height="500"
      ></canvas>{" "}
      {/* Attach ref */}
      {/* Add the imageLoadStatus element and attach its ref */}
      <div
        id="imageLoadStatus"
        ref={imageLoadStatusRef}
        style={{ marginTop: "10px", textAlign: "center", fontSize: "0.9em" }}
      >
        {" "}
      </div>
    </div>
  );
}

export default Paint;
