import { useState, useEffect } from "react";
import { fetchCMSContent, FetchCraftOptions } from "../fetchCmsContent";

export function useFetchCMS(options: FetchCraftOptions) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchCMSContent(options)
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false; // avoid state update on unmounted component
    };
  }, [options.baseURL, options.locale]);

  return { data, error, loading };
}
