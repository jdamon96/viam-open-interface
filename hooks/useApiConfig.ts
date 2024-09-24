// hooks/useApiConfig.ts
import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

interface ApiConfig {
  key: string;
  id: string;
}

const LOCALSTORAGE_API_KEY = "API_KEY";

const useApiConfig = () => {
  const [config, setConfig] = useLocalStorage<ApiConfig | null>(
    LOCALSTORAGE_API_KEY,
    null
  );

  return { config, setConfig };
};

export default useApiConfig;
