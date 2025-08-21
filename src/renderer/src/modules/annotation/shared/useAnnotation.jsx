import { useEffect, useState } from "react";
import { ANNOTATION_CONFIG } from "../panel/constants";

const useAnnotationConfig = (initialConfig = {}) => {
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const fetchedConfig = await window.api.annotation.getConfig();
        setConfig(fetchedConfig || initialConfig);
      } catch (e) {
        console.warn("Failed to get the annotation config:", e);
      }
    };

    fetchConfig();
  }, [initialConfig]);

  const updateConfig = async (partailConfig) => {
    const updatedConfig = {
      ...ANNOTATION_CONFIG,
      ...Object.fromEntries(
        Object.entries(partailConfig).filter(([, v]) => v != null)
      )
    }
    setConfig(updatedConfig)
    await window.api.annotation.updateConfig(partailConfig)
  };

  return [
    config,
    updateConfig,
  ];
};

export default useAnnotationConfig;
