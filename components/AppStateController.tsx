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
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another

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

          <div className="block w-full max-w-xl mx-auto max-h-[512px] overflow-auto">
            <ReactSimpleCodeEditor
              value={jsonInput}
              onValueChange={(code) => setJsonInput(code)}
              highlight={(code) => highlight(code, languages.json, "json")}
              padding={15}
              placeholder="Paste your JSON configuration here"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                overflowX: "auto",
              }}
              className="bg-gray-50 w-full rounded-sm max-w-xl whitespace-pre-wrap"
            />
          </div>

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
