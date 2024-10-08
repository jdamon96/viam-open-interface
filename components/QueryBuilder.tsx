// components/QueryBuilder.tsx

import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { RefreshCcw, Trash, LockIcon } from "lucide-react";
import useAppStore from "@/store/zustand";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";
import AggregationPipelineStage from "./AggregationPipelineStage";
import { applyAggregationPipeline } from "@/lib/pipelineUtils";

interface AggregationStage {
  operator: string;
  definition: string;
}

interface QueryBuilderProps {
  stages: AggregationStage[];
  setStages: React.Dispatch<React.SetStateAction<AggregationStage[]>>;
  onClose: () => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({
  stages,
  setStages,
  onClose,
}) => {
  const [intermediateResults, setIntermediateResults] = useState<any[][]>([]);
  const { currentlySelectedOrganization } = useAppStore();
  const { fetchTabularData } = useViamGetTabularDataByMQL();

  // Function to apply the aggregation pipeline using Mingo
  const applyPipeline = async () => {
    try {
      const results = await applyAggregationPipeline(
        stages,
        currentlySelectedOrganization?.id!,
        fetchTabularData,
        true // Limit results to 3 records
      );
      setIntermediateResults(results);
    } catch (error) {
      console.error("Error applying pipeline:", error);
      setIntermediateResults([[`Error: ${error}`]]);
    }
  };

  // Apply pipeline whenever stages change
  useEffect(() => {
    if (stages.length > 0) {
      applyPipeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);

  // Handler functions
  const addStage = () => {
    setStages([...stages, { operator: "$match", definition: "{}" }]);
  };

  const updateStage = (index: number, updatedStage: AggregationStage) => {
    const newStages = [...stages];
    newStages[index] = updatedStage;
    setStages(newStages);
  };

  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg">Query Builder</h2>
        <Button
          variant={"secondary"}
          className="bg-blue-100 text-blue-800"
          onClick={applyPipeline} // Apply pipeline on button click
        >
          <RefreshCcw size={16} className="mr-2" />
          Test Query
        </Button>
      </div>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <AggregationPipelineStage
            key={index}
            stage={stage}
            index={index}
            intermediateResult={intermediateResults[index]}
            updateStage={updateStage}
            removeStage={removeStage}
            locked={index === 0} // Lock first stage
          />
        ))}

        <Button onClick={addStage} variant="secondary">
          Add Stage
        </Button>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={onClose}>Back</Button>
        <Button onClick={applyPipeline}>Refresh</Button>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Note: The data is limited to 3 records for experimentation purposes.
      </div>
    </div>
  );
};

export default QueryBuilder;
