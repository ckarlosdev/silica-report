// utils/paint.js

// Export a single initialization function that takes DOM elements as arguments
export const initDrawingApp = (
  canvasElement,
  figurePaletteElement,
  colorButtonsContainer,
  clearButton,
  eraserButton,
  drawButton,
  imageLoadStatusElement // Pass the image load status element
) => {
  // Mensaje de diagnóstico para asegurar que el script se carga correctamente
  console.log("initDrawingApp cargado y ejecutándose.");

  // --- Initial DOM element checks and context setup ---
  if (!canvasElement) {
    console.error("Canvas element is null. Cannot initialize drawing app.");
    return;
  }
  const ctx = canvasElement.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context from canvas.");
    return;
  }

  // Ensure other elements are provided (add checks for all passed elements)
  if (
    !figurePaletteElement ||
    !colorButtonsContainer ||
    !clearButton ||
    !eraserButton ||
    !drawButton ||
    !imageLoadStatusElement
  ) {
    console.error(
      "One or more required DOM elements for initialization are missing."
    );
    return;
  }

  // --- Drawing State Variables (scoped to this function) ---
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentColor = "black";
  const penWidth = 3;
  const ERASER_SIZE = 20; // Tamaño del "pincel" del borrador (radio del círculo)
  const DEFAULT_FIGURE_SIZE = 80; // Tamaño predefinido para las figuras (ancho y alto)

  const drawingElements = []; // Stores drawn lines and figures

  let currentMode = "drawing"; // 'drawing', 'moving', 'rotating', 'erasing'

  let selectedFigure = null;
  let startDragOffsetX = 0;
  let startDragOffsetY = 0;

  // Variables para la rotación
  let startAngle = 0;
  let startRotationClientX = 0;
  let startRotationClientY = 0;

  // Temporizadores para detectar doble clic/doble toque
  let lastClickTime = 0;
  const DBL_CLICK_THRESHOLD = 300; // milisegundos
  let lastTouchTime = 0;
  let touchTimeout = null;

  // --- Verificación y carga de imágenes ---
  const imagesToLoad = figurePaletteElement.querySelectorAll("img");
  let loadedImagesCount = 0;
  const totalImages = imagesToLoad.length;
  const loadedImageObjects = {}; // Stores the loaded Image objects (important for drawing)

  imagesToLoad.forEach((imgElement) => {
    imgElement.classList.add("loading");
    imgElement.onload = () => {
      loadedImagesCount++;
      imgElement.classList.remove("loading");
      imgElement.classList.add("loaded");
      loadedImageObjects[imgElement.id] = imgElement; // Store the actual Image object by its ID
      console.log(`[IMAGENES] Cargada: ${imgElement.id}`);
      // if (loadedImagesCount === totalImages) {
      //   imageLoadStatusElement.textContent = "Todas las imágenes cargadas.";
      //   imageLoadStatusElement.style.color = "green";
      // }
    };
    imgElement.onerror = () => {
      console.error(`[IMAGENES] Error al cargar: ${imgElement.src}`);
      imgElement.classList.remove("loading");
      imgElement.classList.add("error");
      // imageLoadStatusElement.textContent = `Error al cargar algunas imágenes. Revisa la consola.`;
      // imageLoadStatusElement.style.color = "red";
    };
  });

  // --- Funciones de redimensionamiento del Canvas ---
  const resizeCanvas = () => {
    const parentWidth = canvasElement.parentElement.clientWidth;
    const parentHeight = canvasElement.parentElement.clientHeight;

    // const desiredWidth = Math.min(1200, parentWidth * 0.9);
    // const desiredHeight = Math.min(700, window.innerHeight * 0.7);

    const desiredWidth = 900;
    const desiredHeight = 500;

    const oldWidth = canvasElement.width;
    const oldHeight = canvasElement.height;

    canvasElement.width = desiredWidth;
    canvasElement.height = desiredHeight;

    if (
      (oldWidth && oldHeight && oldWidth !== desiredWidth) ||
      oldHeight !== desiredHeight
    ) {
      const scaleX = desiredWidth / oldWidth;
      const scaleY = desiredHeight / oldHeight;

      drawingElements.forEach((el) => {
        if (el.type === "figure") {
          el.x *= scaleX;
          el.y *= scaleY;
        } else if (el.type === "line") {
          el.points.forEach((p) => {
            p.x *= scaleX;
            p.y *= scaleY;
          });
        }
      });
    }
    redrawCanvas();
  };

  window.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);

  // --- Función para redibujar todo el canvas ---
  const redrawCanvas = () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    drawingElements.forEach((el) => {
      if (el.type === "line") {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (el.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
      } else if (el.type === "figure") {
        const imgToDraw = loadedImageObjects[el.imageId];
        if (imgToDraw instanceof HTMLImageElement && imgToDraw.complete) {
          ctx.save();
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate(el.rotation || 0);
          ctx.drawImage(
            imgToDraw,
            -el.width / 2,
            -el.height / 2,
            el.width,
            el.height
          );
          ctx.restore();
        } else {
          console.warn(
            `[DIBUJO] No se pudo dibujar la figura. Imagen no cargada o inválida: ${
              el.imageId ? el.imageId : "desconocida"
            }`
          );
        }
      }
    });
  };

  // --- Lógica de Interacción (dibujo, movimiento, rotación y BORRADOR) ---
  const updateCanvasCursor = () => {
    canvasElement.classList.remove("move-cursor", "eraser-cursor");
    if (currentMode === "moving" || currentMode === "rotating") {
      canvasElement.classList.add("move-cursor");
    } else if (currentMode === "erasing") {
      canvasElement.classList.add("eraser-cursor");
    } else {
      canvasElement.style.cursor = "crosshair"; // Cursor normal de dibujo
    }
    console.log(
      `[CURSOR] Cursor actualizado a: ${canvasElement.style.cursor} (Modo: ${currentMode})`
    );
  };

  updateCanvasCursor();

  canvasElement.addEventListener("mousedown", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    console.log(`[MOUSE_DOWN] Coordenadas: (${mouseX}, ${mouseY})`);
    const currentTime = new Date().getTime();

    // Prioridad: Borrador si está activo
    if (currentMode === "erasing") {
      isDrawing = true; // Para arrastrar el borrador
      eraseAtPosition(mouseX, mouseY);
      console.log("[MOUSE_DOWN] Modo: Borrador, borrando en", mouseX, mouseY);
      lastClickTime = currentTime; // Actualizar tiempo de click para evitar doble click accidental
      return; // Salir para no procesar otras lógicas
    }

    // Intentar seleccionar una figura para mover o rotar
    selectedFigure = getFigureAtPosition(mouseX, mouseY);
    console.log(
      "[MOUSE_DOWN] Figura seleccionada por getFigureAtPosition:",
      selectedFigure ? selectedFigure.type : "ninguna"
    );

    if (selectedFigure) {
      // Lógica de doble clic para rotación
      if (currentTime - lastClickTime < DBL_CLICK_THRESHOLD) {
        currentMode = "rotating";
        startRotationClientX = e.clientX;
        startRotationClientY = e.clientY;
        startAngle = selectedFigure.rotation || 0;
        console.log("[MOUSE_DOWN] Modo: Rotando (doble clic detectado)");
      } else {
        // Clic simple en figura para mover
        currentMode = "moving";
        startDragOffsetX = mouseX - selectedFigure.x;
        startDragOffsetY = mouseY - selectedFigure.y;
        console.log("[MOUSE_DOWN] Modo: Moviendo (clic simple en figura)");
      }
    } else {
      // Clic en espacio vacío para dibujar
      currentMode = "drawing";
      isDrawing = true;
      lastX = mouseX;
      lastY = mouseY;
      drawingElements.push({
        type: "line",
        color: currentColor,
        width: penWidth,
        points: [{ x: lastX, y: lastY }],
      });
      console.log("[MOUSE_DOWN] Modo: Dibujo (clic en vacío)");
    }

    updateCanvasCursor(); // Actualiza el cursor basado en el nuevo modo
    lastClickTime = currentTime; // Actualizar tiempo de click
  });

  canvasElement.addEventListener("mousemove", (e) => {
    if (currentMode === "drawing" && isDrawing) {
      const currentLine = drawingElements[drawingElements.length - 1];
      if (currentLine) {
        currentLine.points.push({ x: e.offsetX, y: e.offsetY });
        redrawCanvas();
      }
    } else if (currentMode === "moving" && selectedFigure) {
      const newX = e.offsetX - startDragOffsetX;
      const newY = e.offsetY - startDragOffsetY;

      selectedFigure.x = newX;
      selectedFigure.y = newY;
      redrawCanvas();
    } else if (currentMode === "rotating" && selectedFigure) {
      const rect = canvasElement.getBoundingClientRect();
      const figureCenterX = selectedFigure.x + selectedFigure.width / 2;
      const figureCenterY = selectedFigure.y + selectedFigure.height / 2;

      // Convertir coordenadas del ratón a coordenadas relativas al centro de la figura
      const mouseXRelativeToFigureCenter =
        e.clientX - (rect.left + figureCenterX);
      const mouseYRelativeToFigureCenter =
        e.clientY - (rect.top + figureCenterY);

      // Calcular el ángulo actual del ratón respecto al centro de la figura
      const currentAngle = Math.atan2(
        mouseYRelativeToFigureCenter,
        mouseXRelativeToFigureCenter
      );

      // Calcular el ángulo inicial del ratón respecto al centro de la figura
      const startAngleRelativeToFigureCenter = Math.atan2(
        startRotationClientY - (rect.top + figureCenterY),
        startRotationClientX - (rect.left + figureCenterX)
      );

      let rotationDelta = currentAngle - startAngleRelativeToFigureCenter;

      // Normalizar el delta de rotación para evitar saltos grandes (ej. de PI a -PI)
      if (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
      if (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;

      selectedFigure.rotation = startAngle + rotationDelta;
      redrawCanvas();
      console.log(
        `[MOUSE_MOVE] Rotando. Figura: ${selectedFigure.type}, Ángulo: ${(
          (selectedFigure.rotation * 180) /
          Math.PI
        ).toFixed(2)} deg`
      );
    } else if (currentMode === "erasing" && isDrawing) {
      eraseAtPosition(e.offsetX, e.offsetY);
    }
  });

  // --- Variables para el arrastre táctil de figuras desde la paleta ---
  let touchDraggedImage = null; // La imagen HTML de la paleta que se está arrastrando
  let currentGhostElement = null; // El elemento "fantasma" que se crea para el arrastre visual
  let touchDragOffsetX = 0; // Offset X desde el punto de toque inicial a la esquina superior izquierda del fantasma
  let touchDragOffsetY = 0; // Offset Y desde el punto de toque inicial a la esquina superior izquierda del fantasma

  figurePaletteElement.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault(); // Previene el scroll y zoom
        touchDraggedImage = e.target;
        console.log(
          `[TOUCH_DRAG] touchstart (paleta): ${touchDraggedImage.id}`
        );

        const touch = e.touches[0];
        const imgRect = touchDraggedImage.getBoundingClientRect(); // Posición de la imagen original

        // Calcula el offset desde el punto de toque hasta la esquina superior izquierda de la imagen original
        touchDragOffsetX = touch.clientX - imgRect.left;
        touchDragOffsetY = touch.clientY - imgRect.top;
        console.log(
          `[TOUCH_DRAG] Offset calculado: (${touchDragOffsetX}, ${touchDragOffsetY})`
        );

        // --- Limpiar cualquier fantasma existente antes de crear uno nuevo ---
        if (
          currentGhostElement &&
          document.body.contains(currentGhostElement)
        ) {
          document.body.removeChild(currentGhostElement);
          currentGhostElement = null;
          console.log("[TOUCH_DRAG] Fantasma anterior limpiado.");
        }

        // Crea un "fantasma" visual para el arrastre
        const ghost = touchDraggedImage.cloneNode(true);
        ghost.style.position = "absolute";
        ghost.style.opacity = "0.7";
        ghost.style.pointerEvents = "none"; // Crucial para que no intercepte eventos del canvas
        ghost.style.width = DEFAULT_FIGURE_SIZE + "px"; // Mantiene el tamaño fijo
        ghost.style.height = DEFAULT_FIGURE_SIZE + "px"; // Mantiene el tamaño fijo

        // Posiciona el fantasma para que el punto de toque esté en la misma posición relativa
        // que en la imagen original de la paleta. Usamos pageX/Y para coordenadas relativas al documento.
        ghost.style.left = touch.pageX - touchDragOffsetX + "px";
        ghost.style.top = touch.pageY - touchDragOffsetY + "px";
        ghost.style.zIndex = "9999"; // Asegura que el fantasma esté por encima de todo
        document.body.appendChild(ghost);
        currentGhostElement = ghost; // Almacena el elemento fantasma directamente para una eliminación robusta
        console.log(
          `[TOUCH_DRAG] Fantasma creado en: (${ghost.style.left}, ${ghost.style.top})`
        );

        currentMode = "drawing"; // Se asume que al soltar, la interacción será de dibujo/movimiento
        updateCanvasCursor();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (currentGhostElement) {
        // Usa currentGhostElement aquí
        e.preventDefault();
        const touch = e.touches[0];
        // Mueve el fantasma manteniendo el offset calculado
        currentGhostElement.style.left = touch.pageX - touchDragOffsetX + "px";
        currentGhostElement.style.top = touch.pageY - touchDragOffsetY + "px";
      }
    },
    { passive: false }
  );

  document.addEventListener("touchend", (e) => {
    // Elimina el fantasma del DOM
    if (currentGhostElement) {
      if (document.body.contains(currentGhostElement)) {
        document.body.removeChild(currentGhostElement);
        console.log(
          "[TOUCH_END] Ghost element successfully removed from body."
        );
      } else {
        console.warn(
          "[TOUCH_END] Ghost element not found in body for removal."
        );
      }
      currentGhostElement = null; // Clear the ghost reference
    }

    if (touchDraggedImage) {
      console.log(`[TOUCH_DRAG] touchend (documento): ${touchDraggedImage.id}`);
      console.log(`[TOUCH_DRAG] touchDraggedImage:`, touchDraggedImage);
      console.log(
        `[TOUCH_DRAG] ID de touchDraggedImage:`,
        touchDraggedImage ? touchDraggedImage.id : "N/A"
      );
      console.log(
        `[TOUCH_DRAG] touchDraggedImage.complete:`,
        touchDraggedImage ? touchDraggedImage.complete : "N/A"
      );

      const touch = e.changedTouches[0];
      const rect = canvasElement.getBoundingClientRect();

      // Comprueba si el toque final fue DENTRO del área del canvas
      if (
        touch.clientX > rect.left &&
        touch.clientX < rect.right &&
        touch.clientY > rect.top &&
        touch.clientY < rect.bottom
      ) {
        const imgWidth = DEFAULT_FIGURE_SIZE;
        const imgHeight = DEFAULT_FIGURE_SIZE;

        // Calcula la posición para dibujar en el canvas, centrando la imagen
        const x = touch.clientX - rect.left - imgWidth / 2;
        const y = touch.clientY - rect.top - imgHeight / 2;

        if (touchDraggedImage.complete) {
          drawingElements.push({
            type: "figure",
            imageId: touchDraggedImage.id, // Store the ID, not the DOM element directly
            x: x,
            y: y,
            width: imgWidth, // <--- Tamaño fijo
            height: imgHeight, // <--- Tamaño fijo
            rotation: 0,
          });
          redrawCanvas();
          console.log(
            `[TOUCH_DRAG] Figura táctil añadida: ${
              touchDraggedImage.id
            } en (${x.toFixed(0)}, ${y.toFixed(
              0
            )}) con tamaño ${imgWidth}x${imgHeight}`
          );
        } else {
          console.warn(
            "[TOUCH_DRAG] No se pudo soltar la imagen táctil: Imagen no cargada (complete=false)."
          );
        }
      } else {
        console.log("[TOUCH_DRAG] Imagen soltada fuera del canvas.");
      }
      touchDraggedImage = null; // Resetea la variable
    }
    // Restablecer modo y figura seleccionada al finalizar el toque
    selectedFigure = null;
    currentMode = "drawing";
    updateCanvasCursor();
    console.log(
      "Modo táctil finalizado (touchend):",
      currentMode,
      "Figura seleccionada:",
      selectedFigure
    );
  });

  canvasElement.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // Previene el scroll y el zoom predeterminado

      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const currentTime = new Date().getTime();

      console.log(`[CANVAS TOUCH_START] Coordenadas: (${touchX}, ${touchY})`);
      console.log(`[CANVAS TOUCH_START] Modo actual: ${currentMode}`);

      // Limpia cualquier touchTimeout pendiente para evitar comportamientos no deseados
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = null;
        console.log("[TOUCH_START] touchTimeout limpiado.");
      }

      // Prioridad: Borrador si está activo
      if (currentMode === "erasing") {
        isDrawing = true; // Para arrastrar el borrador táctil
        eraseAtPosition(touchX, touchY);
        console.log(
          "[TOUCH_START] Modo: Borrador, borrando en",
          touchX,
          touchY
        );
        lastTouchTime = currentTime; // Actualizar tiempo de toque
        updateCanvasCursor();
        return; // Salir temprano si estamos borrando
      }

      // Intentar seleccionar una figura para mover o rotar
      selectedFigure = getFigureAtPosition(touchX, touchY);
      console.log(
        "[TOUCH_START] Figura seleccionada por getFigureAtPosition:",
        selectedFigure ? selectedFigure.type : "ninguna"
      );

      if (selectedFigure) {
        const timeDiff = currentTime - lastTouchTime;
        console.log(
          `[TOUCH_START] timeDiff: ${timeDiff}, DBL_CLICK_THRESHOLD: ${DBL_CLICK_THRESHOLD}`
        );

        // Lógica para rotación (doble toque)
        if (timeDiff < DBL_CLICK_THRESHOLD) {
          currentMode = "rotating";
          startRotationClientX = touch.clientX;
          startRotationClientY = touch.clientY;
          startAngle = selectedFigure.rotation || 0;
          console.log("[TOUCH_START] Modo: Rotando (doble toque detectado)");
        } else {
          // Toque simple en figura para mover
          currentMode = "moving";
          startDragOffsetX = touchX - selectedFigure.x;
          startDragOffsetY = touchY - selectedFigure.y;
          console.log("[TOUCH_START] Modo: Moviendo (toque simple en figura)");
        }
      } else {
        // Toque en espacio vacío para dibujar
        currentMode = "drawing";
        isDrawing = true;
        lastX = touchX;
        lastY = touchY;
        drawingElements.push({
          type: "line",
          color: currentColor,
          width: penWidth,
          points: [{ x: lastX, y: lastY }],
        });
        console.log("[TOUCH_START] Modo: Dibujo (toque en vacío)");
      }
      lastTouchTime = currentTime; // Actualiza el tiempo del último toque para la próxima detección
      updateCanvasCursor(); // Actualiza el cursor para el nuevo modo
    },
    { passive: false } // Importante para permitir e.preventDefault()
  );

  canvasElement.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault(); // Previene el scroll y el zoom
      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      if (currentMode === "drawing" && isDrawing) {
        const currentLine = drawingElements[drawingElements.length - 1];
        if (currentLine) {
          currentLine.points.push({ x: touchX, y: touchY });
          redrawCanvas();
        }
      } else if (currentMode === "moving" && selectedFigure) {
        const newX = touchX - startDragOffsetX;
        const newY = touchY - startDragOffsetY;

        selectedFigure.x = newX;
        selectedFigure.y = newY;
        redrawCanvas();
        console.log(
          `[TOUCH_MOVE] Moviendo figura: ${
            selectedFigure.imageId
          } a (${newX.toFixed(0)}, ${newY.toFixed(0)})`
        );
      } else if (currentMode === "rotating" && selectedFigure) {
        // Lógica de rotación táctil
        const figureCenterX = selectedFigure.x + selectedFigure.width / 2;
        const figureCenterY = selectedFigure.y + selectedFigure.height / 2;

        // Convertir coordenadas del toque a coordenadas relativas al centro de la figura
        const touchXRelativeToFigureCenter =
          touch.clientX - (rect.left + figureCenterX);
        const touchYRelativeToFigureCenter =
          touch.clientY - (rect.top + figureCenterY);

        // Calcular el ángulo actual del toque respecto al centro de la figura
        const currentAngle = Math.atan2(
          touchYRelativeToFigureCenter,
          touchXRelativeToFigureCenter
        );

        // Calcular el ángulo inicial del toque respecto al centro de la figura
        const startAngleRelativeToFigureCenter = Math.atan2(
          startRotationClientY - (rect.top + figureCenterY),
          startRotationClientX - (rect.left + figureCenterX)
        );

        let rotationDelta = currentAngle - startAngleRelativeToFigureCenter;

        // Normalizar el delta de rotación
        if (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
        if (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;

        selectedFigure.rotation = startAngle + rotationDelta;
        redrawCanvas();
        console.log(
          `[TOUCH_MOVE] Rotando. Figura: ${selectedFigure.type}, Ángulo: ${(
            (selectedFigure.rotation * 180) /
            Math.PI
          ).toFixed(2)} deg`
        );
      } else if (currentMode === "erasing" && isDrawing) {
        eraseAtPosition(touchX, touchY);
      }
    },
    { passive: false }
  );

  document.addEventListener("touchcancel", () => {
    // Elimina el fantasma del DOM
    if (currentGhostElement) {
      if (document.body.contains(currentGhostElement)) {
        document.body.removeChild(currentGhostElement);
        console.log(
          "[TOUCH_CANCEL] Ghost element successfully removed from body."
        );
      } else {
        console.warn(
          "[TOUCH_CANCEL] Ghost element not found in body for removal on cancel."
        );
      }
      currentGhostElement = null; // Clear the ghost reference
    }
    touchDraggedImage = null;
    // Restablecer modo y figura seleccionada al cancelar el toque
    selectedFigure = null;
    currentMode = "drawing";
    updateCanvasCursor();
    console.log("Arrastre táctil o rotación cancelado (touchcancel).");
  });

  // Eventos para finalizar la interacción (ratón y táctil)
  canvasElement.addEventListener("mouseup", () => {
    console.log(
      "[MOUSE_UP] Evento mouseup detectado. Modo actual:",
      currentMode
    );
    isDrawing = false;
    // Siempre limpiar la figura seleccionada y volver al modo de dibujo por defecto
    selectedFigure = null;
    currentMode = "drawing";
    updateCanvasCursor();
    console.log(
      "Modo finalizado (mouseup):",
      currentMode,
      "Figura seleccionada:",
      selectedFigure
    );
  });

  canvasElement.addEventListener("mouseout", (e) => {
    if (currentMode === "drawing" && isDrawing) {
      isDrawing = false;
      console.log("[MOUSE_OUT] Dibujo detenido.");
    }
  });

  // --- Función para borrar elementos ---
  const eraseAtPosition = (x, y) => {
    let elementsErased = false;
    const currentElementsLength = drawingElements.length;

    for (let i = currentElementsLength - 1; i >= 0; i--) {
      const el = drawingElements[i];

      if (el.type === "figure") {
        const distanceX = Math.abs(x - (el.x + el.width / 2));
        const distanceY = Math.abs(y - (el.y + el.height / 2));
        const halfWidth = el.width / 2;
        const halfHeight = el.height / 2;

        if (
          distanceX < halfWidth + ERASER_SIZE &&
          distanceY < halfHeight + ERASER_SIZE
        ) {
          drawingElements.splice(i, 1);
          elementsErased = true;
          console.log("[BORRADOR] Figura borrada.");
          break;
        }
      } else if (el.type === "line") {
        for (let pIdx = el.points.length - 1; pIdx >= 0; pIdx--) {
          const point = el.points[pIdx];
          const dist = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          );
          if (dist <= ERASER_SIZE) {
            drawingElements.splice(i, 1);
            elementsErased = true;
            console.log("[BORRADOR] Línea borrada.");
            break;
          }
        }
      }
    }

    if (elementsErased) {
      redrawCanvas();
    }
  };

  // --- Configuración inicial del contexto de dibujo ---
  ctx.lineWidth = penWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- Eventos para cambiar de color ---
  colorButtonsContainer.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentColor = button.id;
      currentMode = "drawing";
      selectedFigure = null;
      updateCanvasCursor();
      console.log("Color cambiado a rojo, modo dibujo.");
    });
  });

  // --- Evento para borrar TODO el contenido del canvas ---
  clearButton.addEventListener("click", () => {
    drawingElements.length = 0;
    redrawCanvas();
    console.log("Canvas limpiado.");
    currentMode = "drawing";
    selectedFigure = null;
    updateCanvasCursor();
  });

  // --- Evento para activar el modo borrador ---
  eraserButton.addEventListener("click", () => {
    currentMode = "erasing";
    isDrawing = false;
    selectedFigure = null;
    updateCanvasCursor();
    console.log("Modo: Borrador activado.");
  });

  // --- Evento para activar el modo dibujo (por si se está en borrador o movimiento) ---
  drawButton.addEventListener("click", () => {
    currentMode = "drawing";
    isDrawing = false;
    selectedFigure = null;
    updateCanvasCursor();
    console.log("Modo: Dibujo activado.");
  });

  // --- Lógica para Arrastrar y Soltar Figuras DESDE LA PALETA (ratón) ---
  let draggedImage = null;

  figurePaletteElement.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
      draggedImage = e.target;
      e.dataTransfer.setData("text/plain", e.target.id);
      e.dataTransfer.effectAllowed = "copy";
      currentMode = "drawing";
      updateCanvasCursor();
      console.log(`[DRAG] dragstart: ${draggedImage.id}`);
    }
  });

  canvasElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });

  canvasElement.addEventListener("drop", (e) => {
    e.preventDefault();
    console.log("[DRAG] Evento drop en canvas.");
    console.log(`[DRAG] draggedImage:`, draggedImage);
    console.log(
      `[DRAG] ID de draggedImage:`,
      draggedImage ? draggedImage.id : "N/A"
    );
    console.log(
      `[DRAG] draggedImage.complete:`,
      draggedImage ? draggedImage.complete : "N/A"
    );

    if (draggedImage && draggedImage.complete) {
      const rect = canvasElement.getBoundingClientRect();
      const imgWidth = DEFAULT_FIGURE_SIZE;
      const imgHeight = DEFAULT_FIGURE_SIZE;

      const x = e.clientX - rect.left - imgWidth / 2;
      const y = e.clientY - rect.top - imgHeight / 2;

      drawingElements.push({
        type: "figure",
        imageId: draggedImage.id,
        x: x,
        y: y,
        width: imgWidth,
        height: imgHeight,
        rotation: 0,
      });
      redrawCanvas();
      console.log(
        `[DRAG] Figura añadida: ${draggedImage.id} en (${x.toFixed(
          0
        )}, ${y.toFixed(0)}) con tamaño ${imgWidth}x${imgHeight}`
      );
      draggedImage = null;
      currentMode = "drawing";
      updateCanvasCursor();
    } else {
      console.warn(
        "[DRAG] No se pudo soltar la imagen: draggedImage no es válido o no está cargado (complete=false)."
      );
    }
  });

  // --- Función para detectar si se hizo clic/toque en una figura ---
  const getFigureAtPosition = (x, y) => {
    console.log(`[getFigureAtPosition] Checking position: (${x}, ${y})`);
    for (let i = drawingElements.length - 1; i >= 0; i--) {
      const el = drawingElements[i];
      if (el.type === "figure") {
        console.log(
          `[getFigureAtPosition] Checking figure at (${el.x}, ${el.y}) with size (${el.width}, ${el.height})`
        );
        if (
          x >= el.x &&
          x <= el.x + el.width &&
          y >= el.y &&
          y <= el.y + el.height
        ) {
          console.log(`[getFigureAtPosition] Figure found: ${el.imageId}`);
          return el;
        }
      }
    }
    console.log("[getFigureAtPosition] No figure found.");
    return null;
  };
}; // End of initDrawingApp
