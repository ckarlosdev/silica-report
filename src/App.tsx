import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MainForm from "./components/MainForm";
import useHttpData from "./hooks/useHttpData";
import useMain from "./hooks/useMain";
import { PaintHandle } from "./components/Paint";
import {
  searchJobIdURL,
  searchJobURL,
  searchSilicaByIdURL,
} from "./hooks/urls";
import { Job, Silica } from "./types";

function App() {
  const location = useLocation();

  // Fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Estados principales
  const [supervisorId, setSupervisorId] = useState<number>();
  const [jobNumber, setJobNumber] = useState<string | null>(null);
  const [silicaId, setSilicaId] = useState<number | null>(null);
  const [jobDetails, setJobDetails] = useState<Job | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [jobFetched, setJobFetched] = useState(false);
  const [silicaDetails, setSilicaDetails] = useState<Silica>({
    silicaId: 0,
    jobsId: 0,
    employeesId: 1,
    eventDate: getTodayDate(),
    workDescription: "",
    ventilationArea: "",
    datePlan: getTodayDate(),
    equipmentDescription: "",
    signatureId: "",
    signatureFolder: "",
    silicaControls: [],
    diagramData: "",
    createdBy: "",
    updatedBy: "",
  });

  const { data: jobData, error, search } = useHttpData<Job>();
  const {
    data: silicaData,
    error: errorSilica,
    search: searchSilica,
  } = useHttpData<Silica>();
  const { submitSilicaData, udpateSilicaData } = useMain();
  const paintRef = useRef<PaintHandle>(null);

  // Leer parámetros de URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobNum = params.get("jobNumber");
    const silicaParam = params.get("silicaId");
    const silica_id = silicaParam ? Number(silicaParam) : null;

    if (jobNum) setJobNumber(jobNum);
    if (silica_id !== null && !isNaN(silica_id)) setSilicaId(silica_id);
  }, [location.search]);

  // Buscar trabajo por número
  useEffect(() => {
    if (jobNumber) {
      const url = searchJobURL(jobNumber);
      console.log("🔍 Fetching job from:", url);
      search(url);
    }
  }, [jobNumber]);

  // Buscar ficha silica por ID
  useEffect(() => {
    if (silicaId !== null) {
      const url = searchSilicaByIdURL(silicaId);
      console.log("🔍 Fetching silica from:", url);
      searchSilica(url);
    }
  }, [silicaId]);

  // Cuando llega el job
  useEffect(() => {
    if (jobData) {
      setJobDetails(jobData);
      setSilicaDetails((prev) => ({
        ...prev,
        jobsId: jobData.jobsId, // o jobData.jobsId dependiendo de tu modelo
      }));
    }
  }, [jobData]);

  // Cuando llega el silica
  useEffect(() => {
    if (silicaData) {
      console.log("✔️ silicaDetails:", silicaData);
      setSilicaDetails(silicaData);
    }
  }, [silicaData]);

  // Obtener job por ID si viene desde silica
  useEffect(() => {
    if (silicaDetails && !jobFetched && silicaDetails.silicaId > 0) {
      const url = searchJobIdURL(silicaDetails.jobsId);
      search(url);
      setJobFetched(true);
      setSupervisorId(silicaDetails.employeesId);
    }
  }, [silicaDetails]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setSilicaDetails((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleSilicaControlChange = (
    controlDescriptionId: number,
    newValue: string
  ) => {
    setSilicaDetails((prev) => {
      const existingControl = prev.silicaControls.find(
        (c) => c.controlDescriptionId === controlDescriptionId
      );

      const updatedControls = existingControl
        ? prev.silicaControls.map((c) =>
            c.controlDescriptionId === controlDescriptionId
              ? { ...c, controlAnswer: newValue }
              : c
          )
        : [
            ...prev.silicaControls,
            {
              silicaControlId: 0,
              controlDescriptionId,
              controlAnswer: newValue,
            },
          ];

      return {
        ...prev,
        silicaControls: updatedControls,
      };
    });
  };

  const handleSubmit = async () => {
    const diagramData = paintRef.current?.getDrawingData();
    const updatedData: Silica = {
      ...silicaDetails,
      diagramData: diagramData ?? silicaDetails.diagramData,
    };

    if (diagramData) {
      setSilicaDetails(updatedData);
    }

    // console.log("updatedData: ", updatedData);
    setIsSaving(true);

    try {
      let result: Silica | undefined;
      if (updatedData.silicaId === 0) {
        result = await submitSilicaData(updatedData);
        alert("¡Datos creados con éxito!");
        if (result?.silicaId) {
          setSilicaDetails((prev) => ({ ...prev, silicaId: result!.silicaId }));
        }
      } else {
        result = await udpateSilicaData(updatedData);
        alert("¡Datos actualizados con éxito!");
      }
    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert(
        `Error al guardar los datos: ${error.message || "Error desconocido"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cargando o error
  const isLoading =
    (jobNumber && !jobDetails) ||
    (silicaId !== null && !silicaData && silicaDetails.silicaId === 0);

  if (error || errorSilica) {
    return (
      <p>Error al cargar los datos: {error?.message || errorSilica?.message}</p>
    );
  }

  if (isLoading) {
    return <p>Cargando información...</p>;
  }

  if (!jobDetails && !silicaDetails.jobsId) {
    return <p>Preparando formulario...</p>;
  }

  // Render final
  return (
    <div>
      {isSaving && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="mb-0">Saving Data...</p>
          </div>
        </div>
      )}
      {jobDetails && (
        <MainForm
          key={silicaDetails?.silicaId || "new-silica-form"}
          job={jobDetails}
          supervisorId={supervisorId}
          onSupervisorChange={(id) => {
            setSupervisorId(id);
            setSilicaDetails((prev) => ({
              ...prev,
              employeesId: id,
            }));
          }}
          silicaDetails={silicaDetails}
          setSilicaDetails={setSilicaDetails}
          handleChange={handleChange}
          handleSilicaControlChange={handleSilicaControlChange}
          handleSubmit={handleSubmit}
          ref={paintRef}
        />
      )}
    </div>
  );
}

export default App;
