import { useLocation } from "react-router-dom";
import MainForm from "./components/MainForm";
import { useEffect, useState } from "react";
import useHttpData from "./hooks/useHttpData";
import { searchJobURL } from "./hooks/urls";
import { Job } from "./types";

function App() {
  const location = useLocation();
  const [jobNumber, setJobNumber] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<Job | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobNum = params.get("jobNumber");
    if (jobNum) {
      setJobNumber(jobNum);
    }
  }, [location.search]);

  const { data: jobData, error, search } = useHttpData<Job>();

  const getData = () => {
    if (jobNumber) {
      search(searchJobURL(jobNumber));
    }
  };

  useEffect(() => {
    if (jobNumber) {
      getData();
    }
  }, [jobNumber]);

  useEffect(() => {
    setJobDetails(jobData);
  }, [jobData]);

  if (error) {
    return <p>Error al cargar los datos del trabajo: {error.message}</p>;
  }

  if (!jobNumber || !jobData) {
    return <p>Cargando información del trabajo...</p>;
  }

  // console.log(jobDetails);

  return (
    <div>
      <MainForm job={jobDetails} />
    </div>
  );
}

export default App;
