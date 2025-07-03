import { useEffect, useState } from "react";
import { Job } from "../types";
import useHttpData from "./useHttpData";

export default () => {
  const [jobSelected, setJobSelected] = useState<Job | undefined>(undefined);
};
