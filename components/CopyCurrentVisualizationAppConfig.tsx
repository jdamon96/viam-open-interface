"use client";
import useAppStore from "@/store/zustand";
import React, { FC } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface CopyCurrentVisualizationAppConfigProps {
  // Define props and propTypes here
}
const CopyCurrentVisualizationAppConfig: FC<
  CopyCurrentVisualizationAppConfigProps
> = (props) => {
  const { loadStateFromJson, ...state } = useAppStore();
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    try {
      const stateJson = JSON.stringify(state, null, 2);
      navigator.clipboard.writeText(stateJson);
      toast({
        title: "State copied to clipboard",
        description: "The current state has been successfully copied.",
      });
    } catch (error) {
      console.error("Failed to copy state to clipboard", error);
    }
  };

  return (
    <Button variant={"outline"} onClick={handleCopyToClipboard}>
      Copy Config
    </Button>
  );
};

export default CopyCurrentVisualizationAppConfig;
