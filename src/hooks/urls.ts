const base = "https://checklist-api-8j62.onrender.com/api/v1";

export const searchJobURL = (jobNumber: string) =>
  `${base}/job/number/${jobNumber}`;

export const searchControlsURL = () => `${base}/controls`;
