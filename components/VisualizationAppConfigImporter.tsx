import React, { FC, useState } from "react";
import useAppStore from "@/store/zustand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CodeEditor from "@uiw/react-textarea-code-editor";

interface VisualizationAppConfigImporterProps {}

const VisualizationAppConfigImporter: FC<
  VisualizationAppConfigImporterProps
> = () => {
  const [jsonInput, setJsonInput] = useState("");
  const { loadStateFromJson } = useAppStore();

  const handleImport = () => {
    try {
      const parsedState = JSON.parse(jsonInput);
      loadStateFromJson(parsedState);
    } catch (error) {
      console.error("Invalid JSON input", error);
    }
  };

  return (
    <div className="flex space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Import Config</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
            <DialogDescription>
              Paste your JSON configuration below and click &quot;Load
              State&quot; to import.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-2 w-full mx-auto max-w-xl">
            <CodeEditor
              value={jsonInput}
              language="json"
              placeholder="Paste an existing JSON config."
              onChange={(evn) => setJsonInput(evn.target.value)}
              padding={15}
              style={{
                backgroundColor: "#f5f5f5",
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                height: "256px",
                overflow: "auto",
              }}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleImport}>Load State</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisualizationAppConfigImporter;
