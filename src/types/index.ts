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

export type Silica = {
  silicaId: number;
  jobsId: number;
  employeesId: number;
  eventDate: string;
  workDescription: string;
  diagramId: string;
  diagramFolder: string;
  ventilationArea: string;
  datePlan: string;
  equipmentDescription: string;
  signatureId: string;
  signatureFolder: string;
  silicaControls: SilicaControl[];
};

export type SilicaControl = {
  silicaControlId: number;
  controlDescriptionId: number;
  controlAnswer: string;
};
