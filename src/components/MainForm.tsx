import { Container } from "react-bootstrap";
import Title from "./Title";
import JobInfo from "./JobInfo";
import Controls from "./Controls";
import { Silica, Job } from "../types";
import Plan from "./Plan";
import Buttons from "./Buttons";
import Paint, { PaintHandle } from "./Paint";
import { forwardRef, Ref } from "react";

interface Props {
  job: Job;
  silicaDetails: Silica;
  setSilicaDetails: (silica: Silica) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSilicaControlChange: (
    controlDescriptionId: number,
    newValue: string
  ) => void;
  handleSubmit: () => void;
  supervisorId?: number;
  onSupervisorChange: (supervisorId: number) => void;
}

const MainForm = forwardRef<PaintHandle, Props>(
  (
    {
      job,
      silicaDetails,
      handleChange,
      handleSilicaControlChange,
      handleSubmit,
      supervisorId,
      onSupervisorChange,
    },
    ref: Ref<PaintHandle>
  ) => {
    // const getTodayDate = () => {
    //   const today = new Date();
    //   const year = today.getFullYear();
    //   const month = String(today.getMonth() + 1).padStart(2, "0"); // Meses son 0-11
    //   const day = String(today.getDate()).padStart(2, "0");
    //   return `${year}-${month}-${day}`;
    // };

    // const paintRef = useRef<PaintHandle>(null);

    // const [silicaDetails, setSilicaDetails] = useState<Silica>({
    //   silicaId: 0,
    //   jobsId: job.jobsId,
    //   employeesId: 1,
    //   eventDate: getTodayDate(),
    //   workDescription: "",
    //   // diagramId: "test diagram_id updated",
    //   // diagramFolder: "test diagram_folder",
    //   ventilationArea: "",
    //   datePlan: getTodayDate(),
    //   equipmentDescription: "",
    //   signatureId: "",
    //   signatureFolder: "",
    //   silicaControls: [],
    //   diagramData: "",
    //   createdBy: "",
    //   updatedBy: "",
    // });

    // const handleChange = (
    //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    // ) => {
    //   const { id, value, type } = e.target;
    //   let newValue;

    //   if (type === "checkbox") {
    //     newValue = (e.target as HTMLInputElement).checked;
    //   } else {
    //     newValue = value;
    //   }
    //   setSilicaDetails((prevData) => ({
    //     ...prevData,
    //     [id]: newValue,
    //   }));
    // };

    // const handleDiagram = (diagramValues: string) => {
    //   setSilicaDetails((prevData) => ({
    //     ...prevData,
    //     diagramData: diagramValues,
    //   }));
    // };

    // const handleSilicaControlChange = (
    //   controlDescriptionId: number,
    //   newValue: string
    // ) => {
    //   setSilicaDetails((prevData) => {
    //     // Busca si el control ya existe
    //     const existingControl = prevData.silicaControls.find(
    //       (controlItem) =>
    //         controlItem.controlDescriptionId === controlDescriptionId
    //     );

    //     let updatedSilicaControls;

    //     if (existingControl) {
    //       updatedSilicaControls = prevData.silicaControls.map((controlItem) =>
    //         controlItem.controlDescriptionId === controlDescriptionId
    //           ? { ...controlItem, controlAnswer: newValue }
    //           : controlItem
    //       );
    //     } else {
    //       const newSilicaControl = {
    //         silicaControlId: 0,
    //         controlDescriptionId: controlDescriptionId,
    //         controlAnswer: newValue,
    //       };
    //       updatedSilicaControls = [...prevData.silicaControls, newSilicaControl];
    //     }

    //     return {
    //       ...prevData,
    //       silicaControls: updatedSilicaControls,
    //     };
    //   });
    // };

    return (
      <Container>
        <br />
        <Title />
        <br />
        <JobInfo
          silicaData={silicaDetails}
          job={job}
          onChange={handleChange}
          supervisorId={supervisorId}
          onSupervisorChange={onSupervisorChange}
        />
        <Controls
          silicaData={silicaDetails}
          onChange={handleSilicaControlChange}
        />
        <br />
        <Paint silicaData={silicaDetails} ref={ref} />
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
);

export default MainForm;
