// components/QueryBuilder.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Plus, ExternalLink } from "lucide-react";
import useAppStore from "@/store/zustand";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";
import AggregationPipelineStage from "./AggregationPipelineStage";
import { applyAggregationPipeline } from "@/lib/pipelineUtils";
import Link from "next/link";

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
  const stagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [stages]);

  // Handler functions
  const addStage = () => {
    setStages([...stages, { operator: "$match", definition: "{}" }]);
    setTimeout(() => {
      stagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
    <div className="p-4 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start justify-center py-2">
          <h2 className="text-lg">Query Builder</h2>
          <div className="mt-1 text-xs text-gray-500 max-w-2xl">
            Note: For query building, the data is limited to 3 records to help
            you iterate and get the data shape right. The data visualization
            card will request the full configured pipeline without any limit
            unless explicitly added.
          </div>
        </div>
        <Link
          href="https://www.mongodb.com/docs/manual/core/aggregation-pipeline/"
          className="w-[256px] text-xs text-blue-500 px-3 py-1 hover:bg-blue-100 rounded-sm flex items-center justify-center"
          target="_blank" // Open link in a new tab
          rel="noopener noreferrer" // Security measure
        >
          <ExternalLink size={16} className="mr-2" />
          Learn about aggregation pipelines
        </Link>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto bg-gray-50 p-4">
        {stages.map((stage, index) => (
          <AggregationPipelineStage
            key={index}
            stage={stage}
            index={index}
            intermediateResult={intermediateResults[index]}
            updateStage={updateStage}
            removeStage={removeStage}
            locked={index === 0} // Lock first stage
            goBack={onClose} // Add goBack prop
          />
        ))}
        <div ref={stagesEndRef} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button onClick={addStage} variant="secondary">
          <Plus size={16} className="mr-2" /> Add Stage
        </Button>
        <div className="flex items-center space-x-4">
          <Button onClick={onClose}>Back</Button>
          <Button onClick={applyPipeline}>Refresh</Button>
        </div>
      </div>
    </div>
  );
};

export default QueryBuilder;
