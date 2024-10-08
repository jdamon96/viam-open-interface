// components/AggregationPipelineStage.tsx

import React from "react";
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
  // Utility function to parse the definition JSON
  const parseDefinition = (definition: string): Record<string, any> => {
    try {
      return JSON.parse(definition);
    } catch (error) {
      console.error("Invalid JSON in stage definition:", error);
      return {};
    }
  };

  const { operator, body } = {
    operator: stage.operator,
    body: stage.definition,
  };

  const handleOperatorChange = (val: string) => {
    if (!locked) {
      updateStage(index, { ...stage, operator: val });
    }
  };

  const handleDefinitionChange = (e: React.FormEvent<HTMLPreElement>) => {
    if (!locked) {
      const content = e.currentTarget.textContent || "";
      updateStage(index, { ...stage, definition: content });
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
        <div className="flex space-x-2 items-center mb-2">
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
              {/* Add more operators as needed */}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <pre
            contentEditable={!locked}
            className={`w-full bg-gray-100 p-4 rounded-sm text-sm break-words whitespace-pre-wrap ${
              locked ? "cursor-not-allowed" : ""
            }`}
            style={{ width: "100%", maxHeight: "200px", overflowY: "auto" }}
            onInput={(e: React.FormEvent<HTMLPreElement>) =>
              handleDefinitionChange(e)
            }
          >
            <code
              id={`definition-${index}`}
              className="break-words whitespace-pre-wrap"
            >
              {JSON.stringify(body, null, 2)}
            </code>
          </pre>
        </div>
      </div>

      {/* Right Side: Intermediate Data */}
      <div className="w-1/2 max-h-full">
        <Label className="text-sm">Result</Label>
        <div className="mt-1 p-2 bg-gray-100 rounded h-60 overflow-y-scroll no-scrollbar text-xs">
          {intermediateResult ? (
            <pre>{JSON.stringify(intermediateResult, null, 2)}</pre>
          ) : (
            <span>No data</span>
          )}
        </div>
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
