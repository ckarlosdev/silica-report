const base = "https://checklist-api-8j62.onrender.com/api/v1";

export const searchJobURL = (jobNumber: string) =>
  `${base}/job/number/${jobNumber}`;

export const searchControlsURL = () => `${base}/controls`;

export const submitSilicaURL = () => `${base}/silica`;

export const searchSilicaByIdURL = (silicaId: number) =>
  `${base}/silica/${silicaId}`;

export const searchJobIdURL = (jobId: number) => `${base}/job/${jobId}`;

export const searchEmployeesURL = () => `${base}/employee`;
