// components/AggregationPipelineStage.tsx

import React, { useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { LockIcon, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import JsonCodeEditor from "./JsonEditor"; // Import JsonCodeEditor
import { Skeleton } from "./ui/skeleton";

interface AggregationStage {
  operator: string;
  definition: string;
}

interface AggregationPipelineStageProps {
  stage: AggregationStage;
  index: number;
  intermediateResult: any;
  updateStage: (index: number, updatedStage: AggregationStage) => void;
  removeStage: (index: number) => void;
  locked: boolean;
  goBack: () => void; // Add goBack prop
}

const AggregationPipelineStage: React.FC<AggregationPipelineStageProps> = ({
  stage,
  index,
  intermediateResult,
  updateStage,
  removeStage,
  locked,
  goBack, // Destructure goBack prop
}) => {
  const { operator, body } = {
    operator: stage.operator,
    body: stage.definition,
  };

  const [jsonData, setJsonData] = useState(JSON.stringify(body, null, 2));

  const handleOperatorChange = (val: string) => {
    if (!locked) {
      updateStage(index, { ...stage, operator: val });
    }
  };

  const handleDefinitionChange = (value: string) => {
    if (!locked) {
      setJsonData(value);
      let parsedContent;
      try {
        parsedContent = JSON.parse(value);
      } catch (error) {
        console.error("Invalid JSON format:", error);
        return;
      }
      updateStage(index, { ...stage, definition: parsedContent });
    }
  };

  return (
    <div
      className={`flex space-x-4 items-start p-4 border border-gray-200 rounded ${
        locked ? "bg-gray-200" : ""
      }`}
    >
      {/* Left Side: Stage Operator and Definition */}
      <div className="flex-1 space-y-4">
        <div className="h-16">
          <Label className="text-sm">Aggregation Pipeline Stage</Label>
          <div className="text-xs flex space-x-2 items-center mt-2">
            <Select
              value={operator}
              onValueChange={handleOperatorChange}
              disabled={locked}
            >
              <SelectTrigger id={`operator-${index}`}>
                <SelectValue placeholder="Select Operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$match">$match</SelectItem>
                <SelectItem value="$project">$project</SelectItem>
                <SelectItem value="$group">$group</SelectItem>
                <SelectItem value="$sort">$sort</SelectItem>
                <SelectItem value="$limit">$limit</SelectItem>
                <SelectItem value="$addFields">$addFields</SelectItem>
                {/* Add more operators as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full">
          <JsonCodeEditor
            value={jsonData}
            onChange={handleDefinitionChange}
            minHeight="min-h-[256px]"
            maxHeight="max-h-[256px]"
            readOnly={locked} // only readOnly if locked
          />
        </div>
      </div>

      {/* Right Side: Intermediate Data */}
      <div className="w-1/2 max-h-full space-y-4">
        <div className="h-4">
          <Label className="text-sm">Result</Label>
        </div>
        <div className="w-full min-h-[304px]">
          {intermediateResult === undefined ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-[304px] w-full" />
            </div>
          ) : (
            <JsonCodeEditor
              value={JSON.stringify(intermediateResult, null, 2)}
              maxHeight="max-h-[304px]"
              minHeight="min-h-[304px]"
              onChange={() => {}}
              readOnly={true} // Always readOnly
              className="w-full"
            />
          )}
        </div>
      </div>

      {/* Remove Stage Button */}
      {locked ? (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <LockIcon size={16} className="text-gray-500 mt-2" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] bg-gray-800 text-white border-none">
              <p>
                This initial match stage is locked;{" "}
                <span className="underline cursor-pointer" onClick={goBack}>
                  edit it by configuring the data source
                </span>
                .
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <Button
                type="button"
                size={"icon"}
                variant="ghost"
                onClick={() => removeStage(index)}
              >
                <Trash size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="-ml-8 max-w-[200px] bg-red-500 text-red-50 border-none">
              <p>Delete Stage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default AggregationPipelineStage;
