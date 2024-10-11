import React, { FC, useState } from "react";
import useAppStore from "@/store/zustand";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import JsonCodeEditor from "./JsonEditor";

interface AppStateControllerProps {
  // Define props and propTypes here
}

const AppStateController: FC<AppStateControllerProps> = (props) => {
  const [jsonInput, setJsonInput] = useState("");
  const { loadStateFromJson, ...state } = useAppStore();
  const { toast } = useToast();

  const handleImport = () => {
    try {
      const parsedState = JSON.parse(jsonInput);
      loadStateFromJson(parsedState);
      toast({
        title: "State loaded",
        description:
          "The state has been loaded directly from the provided JSON.",
      });
    } catch (error) {
      console.error("Invalid JSON input", error);
    }
  };

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
    <div className="flex space-x-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Save size={16} className="text-gray-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Configuration</DialogTitle>
            <DialogDescription>
              Paste your JSON configuration below and click "Load State" to
              import.
            </DialogDescription>
          </DialogHeader>

          <JsonCodeEditor
            value={jsonInput}
            onChange={setJsonInput}
            placeholder="Paste your JSON configuration here"
            className=""
          />

          <DialogFooter className="flex justify-between">
            <Button variant={"outline"} onClick={handleCopyToClipboard}>
              Copy Current State
            </Button>
            <DialogClose asChild>
              <Button onClick={handleImport}>Load State</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppStateController;
