import { Container } from "react-bootstrap";
import Title from "./Title";
import JobInfo from "./JobInfo";
import Controls from "./Controls";
import { Silica, Job } from "../types";
import Paint from "./Paint";
import Plan from "./Plan";
import Buttons from "./Buttons";
import { useEffect, useState } from "react";

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

  //   const control = {
  //     descriptions: [
  //       {
  //         silicaControlId: 1,
  //         controlDescriptionId: 1,
  //         controlAnswer: "test anwer",
  //       },
  //       {
  //         silicaControlId: 2,
  //         controlDescriptionId: 2,
  //         controlAnswer: "test anwer 4",
  //       },
  //       {
  //         silicaControlId: 3,
  //         controlDescriptionId: 3,
  //         controlAnswer: "test anwer 3",
  //       },
  //     ],
  //   };

  const [silicaDetails, setSilicaDetails] = useState<Silica>({
    silicaId: 1,
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

  useEffect(() => {
    console.log(silicaDetails);
  }, [silicaDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    let newValue;
    // Safely access 'checked' only if the target is an HTMLInputElement and its type is 'checkbox'
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

  //   const handleSilicaControlChange = (
  //     controlDescriptionId: number,
  //     newValue: string
  //   ) => {
  //     setSilicaDetails((prevData) => ({
  //       ...prevData,
  //       silicaControls: prevData.silicaControls.map((controlItem) =>
  //         controlItem.controlDescriptionId === controlDescriptionId
  //           ? { ...controlItem, controlAnswer: newValue }
  //           : controlItem
  //       ),
  //     }));
  //   };

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
          silicaControlId: Date.now(), 
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
      <Buttons />
      <br />
    </Container>
  );
}

export default MainForm;
