// types.ts

// --- Core Application Data Types ---

export type Job = {
  jobsId: number;
  number: string;
  type: string;
  name: string;
  address: string;
  contractor: string;
  contact: string;
  status: string;
};

export type Control = {
  controlsId: number;
  controlGroup: string;
  controlType: string;
  typeDescription: string;
  descriptions: ControlDescription[];
};

export type ControlDescription = {
  controlsDescriptionsId: number;
  controlsId: number;
  controlName: string;
  componentType: string;
};

// --- Drawing Application Types ---

/**
 * Defines the basic properties common to all drawing elements.
 * All drawable elements should have a unique ID, position (x, y), and potentially rotation.
 */
export interface BaseDrawingElement {
  id: string; // Unique identifier for each element for easier tracking/manipulation
  x: number;
  y: number;
  rotation?: number; // Optional rotation in radians for elements that can be rotated
}

/**
 * Defines a point in 2D space, typically used for coordinates within a line or path.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Defines a line or path drawing element.
 */
export interface LineDrawingElement extends BaseDrawingElement {
  type: "line";
  color: string;
  lineWidth: number; // The width (thickness) of the line
  points: Point[]; // An array of points that define the line's path
}

/**
 * Defines an image (figure) drawing element.
 * These correspond to images dragged from your palette.
 */
export interface ImageDrawingElement extends BaseDrawingElement {
  type: "figure"; // Using 'figure' as per your paint.js for image elements
  imageId: string; // Corresponds to the ID of the preloaded image (e.g., 'bocina', 'sprayer')
  width: number; // The rendered width of the image on the canvas
  height: number; // The rendered height of the image on the canvas
}

// NOTE: If you haven't implemented RectangleDrawingElement or CircleDrawingElement
// in your `paint.ts` logic yet, you should comment them out or remove them
// until they are actively used, to avoid unused type definitions.
/*
export interface RectangleDrawingElement extends BaseDrawingElement {
  type: "rectangle";
  color: string;
  lineWidth: number;
  width: number;
  height: number;
  fillColor?: string; // Optional fill color for the rectangle
}

export interface CircleDrawingElement extends BaseDrawingElement {
  type: "circle";
  color: string;
  lineWidth: number;
  radius: number;
  fillColor?: string; // Optional fill color for the circle
}
*/

/**
 * A union type representing any possible drawing element currently supported on the canvas.
 * If you add more drawing shapes (like rectangles, circles), remember to add them here.
 */
export type DrawingElement = LineDrawingElement | ImageDrawingElement;
// | RectangleDrawingElement // Uncomment and include if implemented
// | CircleDrawingElement; // Uncomment and include if implemented

/**
 * Defines the interface for the controls object returned by `initDrawingApp`.
 * This object provides methods for your React component to interact with the drawing logic
 * (e.g., saving, loading, checking image load status).
 */
export interface DrawingAppControls {
  /**
   * Retrieves the current drawing data as a JSON string.
   * This string can be stored (e.g., in a database) and later reloaded.
   */
  getDrawingData: () => string;
  /**
   * Loads drawing data from a JSON string onto the canvas.
   * The canvas will be cleared and redrawn with the provided data.
   * @param jsonString The JSON string representing the drawing elements.
   */
  loadDrawingData: (jsonString: string) => void;
  /**
   * Returns a Promise that resolves when all images from the figure palette
   * have been successfully loaded. This is useful for knowing when it's safe
   * to call `loadDrawingData` with figure data that references these images.
   * Returns `null` if image preloading hasn't been initialized (e.g., no images in palette).
   */
  getImagesLoadedPromise: () => Promise<void> | null;
}

/**
 * Defines the handles (controls) that the Paint component exposes.
 * Currently, it's identical to `DrawingAppControls`. If `Paint` component
 * needed to expose other methods specific to its React lifecycle or state,
 * they would be added here.
 */
export interface PaintHandles extends DrawingAppControls {}

// --- Silica Related Types ---

/**
 * Defines the structure for a Silica data record, which includes
 * the `diagramData` field to store the canvas drawing.
 */
export type Silica = {
  silicaId: number;
  jobsId: number;
  employeesId: number;
  eventDate: string;
  workDescription: string;
  // diagramId: string;
  // diagramFolder: string;
  ventilationArea: string;
  datePlan: string;
  equipmentDescription: string;
  signatureId: string;
  signatureFolder: string;
  silicaControls: SilicaControl[];
  diagramData?: string; // Stores the JSON string representation of the drawing
  createdBy: string;
  updatedBy: string;
};

/**
 * Defines a control record associated with Silica data.
 */
export type SilicaControl = {
  silicaControlId: number;
  controlDescriptionId: number;
  controlAnswer: string;
};

export type Employee = {
  employeesId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  title: string;
};
