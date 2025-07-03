import axios from "axios";
import { useEffect, useState } from "react";

export default <T>(url?: string) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let aborted = false;
    if (!url) {
      setData(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const signal = controller.signal;

    axios
      .get<T>(url, { signal })
      .then(({ data }) => {
        if (!aborted) {
          setData(data);
        }
      })
      .catch((e) => {
        if (!aborted) {
          console.log(e);
          setError(e);
          setData(undefined);
        }
      })
      .finally(() => {
        if (!aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
      aborted = true;
    };
  }, [url]);

  const search = (url: string) => {
    setLoading(true);
    axios
      .get(url)
      .then(({ data }) => {
        setData(data);
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return { data, loading, error, search };
};
