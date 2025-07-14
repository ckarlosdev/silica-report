// components/Paint.tsx
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "../styles/paint.css";
import bocina from "../assets/bocina.png";
import sprayer from "../assets/sprayer.png";
import estrella from "../assets/estrella.png";
import { initDrawingApp } from "../utils/paint"; // Import the init function
import { Silica, DrawingAppControls } from "../types"; // Import DrawingAppControls from your types

type Props = {
  silicaData?: Silica; // Puedes mantenerlo opcional si a veces no viene
};

// Define la interfaz para los métodos que Paint expone a su padre via ref
export type PaintHandle = {
  getDrawingData: () => string | null; // getDrawingData puede devolver null si los controles no están listos
  loadDrawingData: (data: string) => void; // Agregamos loadDrawingData a la interfaz expuesta
};

const Paint = forwardRef<PaintHandle, Props>(({ silicaData }, ref) => {
  // Refs para todos los elementos DOM del canvas y sus controles
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figurePaletteRef = useRef<HTMLDivElement>(null);
  const colorButtonsRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const eraserButtonRef = useRef<HTMLButtonElement>(null);
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  const imageLoadStatusRef = useRef<HTMLDivElement>(null);

  // Ref interno para almacenar la instancia de DrawingAppControls
  const drawingAppControlsRef = useRef<DrawingAppControls | null>(null);

  // EFECTO 1: Inicialización de la aplicación de dibujo (se ejecuta UNA SOLA VEZ)
  useEffect(() => {
    // Asegura que todos los refs de los elementos DOM estén disponibles
    if (
      canvasRef.current &&
      figurePaletteRef.current &&
      colorButtonsRef.current &&
      clearButtonRef.current &&
      eraserButtonRef.current &&
      drawButtonRef.current &&
      imageLoadStatusRef.current
    ) {
      // Llama a la función de inicialización y captura su valor de retorno
      const controls = initDrawingApp(
        canvasRef.current,
        figurePaletteRef.current,
        colorButtonsRef.current,
        clearButtonRef.current,
        eraserButtonRef.current,
        drawButtonRef.current,
        imageLoadStatusRef.current
      );

      // Si la inicialización fue exitosa, guarda los controles
      if (controls) {
        drawingAppControlsRef.current = controls;
        console.log("Drawing app initialized successfully (ONE TIME).");

        // Opcional: Espera a que las imágenes carguen. Esto no debe re-inicializar el lienzo.
        controls
          .getImagesLoadedPromise()
          ?.then(() => {
            console.log("All images for drawing app are loaded.");
          })
          .catch((error) => {
            console.error("Error loading images for drawing app:", error);
          });
      } else {
        console.error(
          "Failed to initialize drawing application. Check if all required DOM elements are present."
        );
      }
    }

    // La función de limpieza se ejecuta cuando el componente se desmonta
    return () => {
      // Aquí puedes añadir lógica de limpieza si initDrawingApp devolviera un método de 'destroy'
      // Por ahora, simplemente limpiamos la referencia interna.
      drawingAppControlsRef.current = null;
    };
  }, []); // <-- ¡ARRAY DE DEPENDENCIAS VACÍO! Este efecto se ejecuta SOLO UNA VEZ.

  // EFECTO 2: Cargar datos del diagrama cuando silicaData.diagramData cambie
  useEffect(() => {
    // Solo carga los datos si los controles están listos Y si hay diagramData
    // Y si el diagramaData es diferente del que ya está cargado (para evitar recargas redundantes)
    if (
      drawingAppControlsRef.current &&
      silicaData?.diagramData
      // Opcional: Puedes añadir una condición para evitar recargar si ya está cargado
      // Por ejemplo, si tienes un estado interno para el diagramData cargado
    ) {
      // Asegúrate de que las imágenes estén cargadas antes de intentar cargar el dibujo
      drawingAppControlsRef.current
        .getImagesLoadedPromise()
        ?.then(() => {
          drawingAppControlsRef.current?.loadDrawingData(
            silicaData.diagramData as string
          );
          console.log(
            "Diagram data loaded into canvas due to silicaData.diagramData change."
          );
        })
        .catch((error) => {
          console.error("Error loading drawing data or images:", error);
        });
    }
  }, [silicaData?.diagramData]); // <-- Este efecto SÍ depende de diagramData

  // Expone los métodos al componente padre a través del ref
  useImperativeHandle(ref, () => ({
    getDrawingData: () => {
      // Asegura que los controles estén disponibles antes de intentar obtener los datos
      if (drawingAppControlsRef.current) {
        return drawingAppControlsRef.current.getDrawingData();
      }
      console.warn(
        "Attempted to get drawing data before controls were initialized."
      );
      return null;
    },
    // También exponemos loadDrawingData si el padre necesita activarla manualmente
    loadDrawingData: (data: string) => {
      if (drawingAppControlsRef.current) {
        drawingAppControlsRef.current.loadDrawingData(data);
      } else {
        console.warn(
          "Attempted to load drawing data before controls were initialized."
        );
      }
    },
  }));

  return (
    <div>
      <div className="figure-palette" ref={figurePaletteRef}>
        <img src={bocina} alt="Bocina" id="bocina" draggable="true" />
        <img src={sprayer} alt="Sprayer" id="sprayer" draggable="true" />
        <img src={estrella} alt="Estrella" id="estrella" draggable="true" />
      </div>
      <div className="controls">
        <div className="color-buttons" ref={colorButtonsRef}>
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
        </button>
        <button id="eraser" ref={eraserButtonRef}>
          eraser
        </button>
        <button id="draw" ref={drawButtonRef}>
          paint
        </button>
      </div>
      <canvas
        id="drawingCanvas"
        ref={canvasRef}
        width="900"
        height="500"
      ></canvas>
      <div
        id="imageLoadStatus"
        ref={imageLoadStatusRef}
        style={{ marginTop: "10px", textAlign: "center", fontSize: "0.9em" }}
      >
        .
      </div>
    </div>
  );
});

export default Paint;
