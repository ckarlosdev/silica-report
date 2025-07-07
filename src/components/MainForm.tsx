import { Container } from "react-bootstrap";
import Title from "./Title";
import JobInfo from "./JobInfo";
import Controls from "./Controls";
import { Silica, Job } from "../types";
import Paint from "./Paint";
import Plan from "./Plan";
import Buttons from "./Buttons";
import { useState } from "react";
import useMain from "../hooks/useMain";

type Props = {
  job?: Job;
};

function MainForm({ job }: Props) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Meses son 0-11
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [silicaDetails, setSilicaDetails] = useState<Silica>({
    silicaId: 0,
    jobsId: 7,
    employeesId: 1,
    eventDate: "2025-02-17",
    workDescription: "test work_description updated",
    diagramId: "test diagram_id updated",
    diagramFolder: "test diagram_folder",
    ventilationArea: "test plan_area",
    datePlan: "2025-02-20",
    equipmentDescription: "test plan_equipment",
    signatureId: "test signature_id",
    signatureFolder: "test signature_folder",
    silicaControls: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    let newValue;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else {
      newValue = value;
    }
    setSilicaDetails((prevData) => ({
      ...prevData,
      [id]: newValue,
    }));
  };

  const handleSilicaControlChange = (
    controlDescriptionId: number,
    newValue: string
  ) => {
    setSilicaDetails((prevData) => {
      // Busca si el control ya existe
      const existingControl = prevData.silicaControls.find(
        (controlItem) =>
          controlItem.controlDescriptionId === controlDescriptionId
      );

      let updatedSilicaControls;

      if (existingControl) {
        updatedSilicaControls = prevData.silicaControls.map((controlItem) =>
          controlItem.controlDescriptionId === controlDescriptionId
            ? { ...controlItem, controlAnswer: newValue }
            : controlItem
        );
      } else {
        const newSilicaControl = {
          silicaControlId: 0,
          controlDescriptionId: controlDescriptionId,
          controlAnswer: newValue,
        };
        updatedSilicaControls = [...prevData.silicaControls, newSilicaControl];
      }

      return {
        ...prevData,
        silicaControls: updatedSilicaControls,
      };
    });
  };

  const {
    submitAnswer,
    submitLoading,
    submitError,
    submitSilicaData,
    udpateSilicaData,
  } = useMain();

  const handleSubmit = async () => {
    console.log("Attempting to save silicaDetails:", silicaDetails);

    // const API_URL = "YOUR_API_ENDPOINT_HERE"; // ¡IMPORTANTE: Cambia esto!

    try {
      let result: Silica | undefined;
      console.log(silicaDetails.silicaId);
      if (silicaDetails.silicaId === 0) {
        // Si silicaId es 0, es un nuevo registro
        result = await submitSilicaData(silicaDetails);
        alert("¡Datos creados con éxito! result: " + result);
        // Si la API devuelve el ID del nuevo registro, actualiza el estado
        console.log("respuesta:", result?.silicaId);
        if (result && result.silicaId) {
          setSilicaDetails((prev) => ({
            ...prev,
            silicaId: result ? result.silicaId : 0,
          }));
        }
      } else {
        // Si silicaId tiene un valor, es una actualización
        // Asegúrate de que tu endpoint PUT maneje el ID en la URL o en el cuerpo
        // Si el ID va en la URL, sería algo como `${API_URL}/${silicaDetails.silicaId}`
        result = await udpateSilicaData(silicaDetails);
        alert("¡Datos actualizados con éxito!");
      }

      console.log("Datos guardados con éxito:", result);
    } catch (error: any) {
      console.error("Hubo un error al intentar guardar los datos:", error);
      alert(`Error al guardar los datos: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Container>
      <br />
      <Title />
      <br />
      <JobInfo silicaData={silicaDetails} job={job} onChange={handleChange} />
      <Controls
        silicaData={silicaDetails}
        onChange={handleSilicaControlChange}
      />
      <br />
      <Paint silicaData={silicaDetails} />
      <Plan
        silicaData={
          silicaDetails || {
            ventilationArea: "",
            datePlan: "",
            equipmentDescription: "",
          }
        }
        onChange={handleChange}
      />
      <br />
      <Buttons onClick={handleSubmit} />
      <br />
    </Container>
  );
}

export default MainForm;
