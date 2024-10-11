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
}

const AggregationPipelineStage: React.FC<AggregationPipelineStageProps> = ({
  stage,
  index,
  intermediateResult,
  updateStage,
  removeStage,
  locked,
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
      <div className="flex-1">
        <Label className="text-sm">Aggregation Pipeline Stage</Label>
        <div className="text-xs flex space-x-2 items-center mb-2">
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
        <div className="w-full">
          <JsonCodeEditor
            value={jsonData}
            onChange={handleDefinitionChange}
            maxHeight="max-h-[256px]"
            readOnly={locked} // only readOnly if locked
          />
        </div>
      </div>

      {/* Right Side: Intermediate Data */}
      <div className="w-1/2 max-h-full">
        <Label className="text-sm">Result</Label>
        {intermediateResult === undefined ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-[256px] w-[256px]" />
          </div>
        ) : (
          <JsonCodeEditor
            value={JSON.stringify(intermediateResult, null, 2)}
            maxHeight="max-h-[256px]"
            onChange={() => {}}
            readOnly={true} // Always readOnly
          />
        )}
      </div>

      {/* Remove Stage Button */}
      {locked ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <LockIcon size={16} className="text-gray-500 mt-2" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] bg-gray-800 text-white border-none">
              <p>
                These stages are locked while in the query builder (so you can
                test your query with 3 records instead of all data)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          type="button"
          size={"icon"}
          variant="ghost"
          onClick={() => removeStage(index)}
          className="mt-2"
        >
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
};

export default AggregationPipelineStage;
