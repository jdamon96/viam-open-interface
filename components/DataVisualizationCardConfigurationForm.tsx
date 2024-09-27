import React, { useState, useEffect } from "react";
import { DataCard } from "./DataVisualizationCard";
import useGetViamRobotParts from "@/hooks/useGetViamRobotParts";
import { Robot } from "@/hooks/useListViamRobots";
import { parseComponentsWithDataManager } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Braces, Pencil, RefreshCcw, Trash } from "lucide-react";

import { Aggregator } from "mingo"; // Import Mingo

// Mock data for visualization types
const visualizationTypes = [
  "Bar Chart",
  "Line Chart",
  "Pie Chart",
  "Scatter Plot",
  "Table",
];

interface AggregationStage {
  operator: string;
  definition: string;
}

interface DataVisualizationCardConfigurationFormProps {
  card: DataCard;
  onSave: (card: DataCard) => void;
  locationMachines: Robot[];
  onModeChange: (isQueryBuilder: boolean) => void;
}

interface AggregationPipelineStageProps {
  stage: AggregationStage;
  index: number;
  intermediateResult: any;
  updateStage: (index: number, updatedStage: AggregationStage) => void;
  removeStage: (index: number) => void;
}

const AggregationPipelineStage: React.FC<AggregationPipelineStageProps> = ({
  stage,
  index,
  intermediateResult,
  updateStage,
  removeStage,
}) => {
  // Utility function to split an aggregation pipeline stage into operator and body
  const splitAggregationStage = (
    stage: Record<string, any>
  ): { operator: string; body: Record<string, any> } => {
    const operator = Object.keys(stage)[0];
    const body = stage[operator];
    return { operator, body };
  };
  const { operator, body } = splitAggregationStage(stage);

  return (
    <div
      key={index}
      className="flex space-x-4 items-start p-4 border border-gray-200 rounded"
    >
      {/* Left Side: Stage Operator and Definition */}
      <div className="flex-1">
        <div className="flex space-x-2 items-center mb-2">
          <Select
            value={operator}
            onValueChange={(val) =>
              updateStage(index, { ...stage, operator: val })
            }
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
        <div>
          <pre
            contentEditable={true}
            className="bg-gray-100 p-4 rounded-sm max-w-lg text-sm break-words whitespace-pre-wrap"
          >
            <code
              id={`definition-${index}`}
              className="break-words whitespace-pre-wrap"
              onInput={(e) =>
                updateStage(index, {
                  ...stage,
                  definition: e.currentTarget.textContent ?? "",
                })
              }
            >
              {JSON.stringify(body, null, 2)}
            </code>
          </pre>
        </div>
      </div>

      {/* Right Side: Intermediate Data */}
      <div className="w-1/2">
        <Label className="text-sm">Result</Label>
        <div className="mt-1 p-2 bg-gray-100 rounded h-40 overflow-auto text-xs">
          {intermediateResult ? (
            <pre>{JSON.stringify(intermediateResult, null, 2)}</pre>
          ) : (
            <span>No data</span>
          )}
        </div>
      </div>

      {/* Remove Stage Button */}
      <Button
        type="button"
        size={"icon"}
        variant="destructive"
        onClick={() => removeStage(index)}
        className="mt-2"
      >
        <Trash size={16} />
      </Button>
    </div>
  );
};

const DataVisualizationCardConfigurationForm: React.FC<
  DataVisualizationCardConfigurationFormProps
> = ({ card, onSave, locationMachines, onModeChange }) => {
  const [title, setTitle] = useState(card.title);
  const [dataSource, setDataSource] = useState(card.dataSource);
  const [dataSourceRobotId, setDataSourceRobotId] = useState(
    card.robotId || ""
  );
  const [machineSource, setMachineSource] = useState<Robot | undefined>(
    locationMachines.find((machine) => {
      return machine.id === card?.robotId;
    })
  );
  const [dataCollectingComponents, setDataCollectingComponents] =
    useState<any>();
  const [visualizationType, setVisualizationType] = useState(
    card.visualizationType
  );
  const [isQueryBuilder, setIsQueryBuilder] = useState(false);

  const toggleQueryBuilder = (value: boolean) => {
    setIsQueryBuilder(value);
    onModeChange(value); // Notify parent
  };

  const [stages, setStages] = useState<any[]>(card.aggregationStages ?? []);

  const [intermediateResults, setIntermediateResults] = useState<any[][]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...card,
      title,
      dataSource,
      robotId: machineSource?.id || "",
      visualizationType,
    });
  };

  const { fetchRobotParts, robotParts } = useGetViamRobotParts();

  useEffect(() => {
    if (machineSource?.id) {
      fetchRobotParts(machineSource.id);
    }
  }, [machineSource, fetchRobotParts]);

  useEffect(() => {
    if (robotParts) {
      const components = parseComponentsWithDataManager(robotParts);
      setDataCollectingComponents(components);
    }
  }, [robotParts]);

  // Function to apply the aggregation pipeline using Mingo
  // const applyPipeline = () => {
  //   let data = initialData;
  //   const results: any[][] = [];

  //   stages.forEach((stage, index) => {
  //     try {
  //       const aggregator = new Aggregator([
  //         JSON.parse(`{ "${stage.operator}": ${stage.definition} }`),
  //       ]);
  //       const cursor = aggregator.run(data);
  //       data = cursor; // Directly assign cursor to data
  //       results.push(data);
  //     } catch (error) {
  //       console.error(`Error in stage ${index + 1}:`, error);
  //       results.push([`Error: ${error}`]);
  //     }
  //   });

  //   setIntermediateResults(results);
  // };

  // // Apply pipeline whenever stages change
  // useEffect(() => {
  //   applyPipeline();
  // }, [stages]);

  // Handler functions for Query Builder
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
    <>
      {isQueryBuilder ? (
        <div className="p-4">
          <div className="flex items-center justify-between py-4">
            <h2 className="text-xl font-bold mb-4">Query Builder</h2>
            <Button variant={"secondary"} className="bg-blue-100 text-blue-800">
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
              />
            ))}

            <Button onClick={addStage} variant="secondary">
              Add Stage
            </Button>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button onClick={() => toggleQueryBuilder(false)}>Back</Button>
            <Button onClick={() => alert("applyPipeline")}>Refresh</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {JSON.stringify(card)}
          <div className="space-y-2">
            <Label htmlFor="title">Card Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machineSource">Machine</Label>
            <Select
              value={machineSource?.name || ""}
              onValueChange={(val) => {
                const machine = locationMachines.find(
                  (robot) => robot.name === val
                );
                setMachineSource(machine);
                setDataSourceRobotId(machine?.id || "");
              }}
              required
            >
              <SelectTrigger id="machineSource">
                <SelectValue
                  placeholder="Select a machine"
                  defaultValue={machineSource?.name || ""}
                />
              </SelectTrigger>
              <SelectContent>
                {locationMachines?.map((robot) => (
                  <SelectItem key={robot.id} value={robot.name}>
                    {robot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select
              value={dataSource}
              onValueChange={(val) => {
                const selectedComponent = dataCollectingComponents.find(
                  (component: any) => component.name === val
                );
                setDataSource(val);
              }}
              required
              disabled={!dataCollectingComponents}
            >
              <SelectTrigger id="dataSource">
                <SelectValue placeholder="Select a data source" />
              </SelectTrigger>
              <SelectContent>
                {dataCollectingComponents?.map(
                  (dataCollectingComponent: any) => (
                    <SelectItem
                      key={dataCollectingComponent.id}
                      value={dataCollectingComponent.name}
                    >
                      {dataCollectingComponent.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visualizationType">Visualization Type</Label>
            <Select
              value={visualizationType}
              onValueChange={setVisualizationType}
              required
            >
              <SelectTrigger id="visualizationType">
                <SelectValue placeholder="Select a visualization type" />
              </SelectTrigger>
              <SelectContent>
                {visualizationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="visualizationType">
                Query Aggregation Pipeline
              </Label>
              <button
                type="button"
                onClick={() => toggleQueryBuilder(true)}
                className="text-xs border border-gray-300 hover:bg-gray-100 hover:cursor-pointer rounded px-3 py-1 flex items-center justify-center space-x-1"
              >
                <Braces size={12} className="text-gray-700" />
                <span>Configure</span>
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              {stages.map((stage, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg w-full flex items-center justify-between text-sm relative"
                >
                  <pre>
                    <code>{JSON.stringify(stage, null, 2)}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    onClick={() => toggleQueryBuilder(true)}
                    className="absolute top-4 right-4 hover:bg-gray-300"
                  >
                    <Pencil size={12} className="text-gray-700" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit">Save Configuration</Button>
        </form>
      )}
    </>
  );
};
export default DataVisualizationCardConfigurationForm;
