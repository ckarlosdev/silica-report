import { useState } from "react";
import { Job, Silica } from "../types";
import useHttpData from "./useHttpData";
import { submitSilicaURL } from "./urls";

export default () => {
  const [jobSelected, setJobSelected] = useState<Job | undefined>(undefined);

  const {
    data: submitAnswer,
    loading: submitLoading,
    error: submitError,
    postData: submitSilica,
    putData: updateSilica,
  } = useHttpData<Silica>();

  const submitSilicaData = (silica: Silica): Promise<Silica | undefined> => {
    return submitSilica(submitSilicaURL(), silica);
  };

  const udpateSilicaData = (silica: Silica): Promise<Silica | undefined> => {
    return updateSilica(submitSilicaURL(), silica);
  };

  return {
    submitAnswer,
    submitLoading,
    submitError,
    submitSilicaData,
    udpateSilicaData,
  };
};
