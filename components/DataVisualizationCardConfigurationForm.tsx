import React, { useState, useEffect } from "react";
import {
  constructMqlQueryStagesForDataVisualizationCard,
  DataCard,
} from "./DataVisualizationCard";
import useGetViamRobotParts from "@/hooks/useGetViamRobotParts";
import { Robot } from "@/hooks/useListViamRobots";
import { parseComponentsWithDataManager } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Braces, LockIcon, Pencil, RefreshCcw, Trash } from "lucide-react";

import { Aggregator } from "mingo"; // Import Mingo
import useAppStore from "@/store/zustand";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";

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
  locked: boolean; // New prop
}

const AggregationPipelineStage: React.FC<AggregationPipelineStageProps> = ({
  stage,
  index,
  intermediateResult,
  updateStage,
  removeStage,
  locked, // New prop
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
            onValueChange={(val) =>
              !locked && updateStage(index, { ...stage, operator: val })
            }
            disabled={locked} // Disable if locked
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
          >
            <code
              id={`definition-${index}`}
              className="break-words whitespace-pre-wrap"
              onInput={(e) =>
                !locked &&
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
          variant="destructive"
          onClick={() => removeStage(index)}
          className="mt-2"
        >
          <Trash size={16} />
        </Button>
      )}
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
  const { currentlySelectedLocation, currentlySelectedOrganization } =
    useAppStore();

  useEffect(() => {
    if (!currentlySelectedLocation || !currentlySelectedOrganization) return;
    const updatedStages = constructMqlQueryStagesForDataVisualizationCard(
      currentlySelectedLocation?.id,
      currentlySelectedOrganization?.id,
      dataSourceRobotId,
      card.dateRange,
      dataSource,
      visualizationType,
      true // Pass true for queryBuilder
    );
    setStages(updatedStages);
  }, [
    dataSource,
    dataSourceRobotId,
    visualizationType,
    currentlySelectedLocation,
    currentlySelectedOrganization,
  ]);

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

  const { fetchTabularData, loading, error, data } =
    useViamGetTabularDataByMQL();

  useEffect(() => {
    fetchTabularData(currentlySelectedOrganization?.id!, stages);
  }, [stages]);

  // Function to apply the aggregation pipeline using Mingo
  const applyPipeline = async () => {
    const results: any[][] = [];

    if (stages.length === 0) {
      console.error("No stages defined");
      return;
    }

    try {
      console.log("Starting pipeline application...");

      // Fetch initial data with the first stage
      const initialStage = stages[0];
      console.log("Initial stage:", initialStage);

      const initialPipeline = [
        {
          [Object.keys(initialStage)[0]]: Object.values(initialStage)[0],
        },
      ];
      console.log("Initial pipeline:", initialPipeline);

      const initialData = await fetchTabularData(
        currentlySelectedOrganization?.id!,
        initialPipeline
      );
      if (!initialData) {
        console.error("Failed to fetch initial data");
        return;
      }
      console.log("Initial data fetched:", initialData);

      results.push(initialData);

      // Apply subsequent stages iteratively
      let currentData = initialData;
      for (let i = 1; i < stages.length; i++) {
        const stage = stages[i];
        console.log(`Applying stage ${i}:`, stage);

        const pipeline = [
          { [stage.operator]: JSON.parse(stage.definition) },
          { $limit: 3 }, // Add $limit implicitly
        ];
        console.log(`Pipeline for stage ${i}:`, pipeline);

        const aggregator = new Aggregator(pipeline);
        const cursor = aggregator.run(currentData);
        currentData = cursor;
        console.log(`Data after stage ${i}:`, currentData);

        results.push(currentData);
      }
      console.log("Pipeline application completed.");

      setIntermediateResults(results);
    } catch (error) {
      console.error("Error applying pipeline:", error);
      results.push([`Error: ${error}`]);
      setIntermediateResults(results);
    }
  };

  // Apply pipeline whenever stages change
  useEffect(() => {
    if (stages.length > 0) {
      applyPipeline();
    }
  }, [stages]);

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
                locked={index === 0 || index === 1} // Lock first two stages
              />
            ))}

            <Button onClick={addStage} variant="secondary">
              Add Stage
            </Button>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button onClick={() => toggleQueryBuilder(false)}>Back</Button>
            <Button onClick={applyPipeline}>Refresh</Button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Note: The data is limited to 3 records for experimentation purposes.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    <code className="text-gray-600">
                      {JSON.stringify(stage, null, 2)
                        .split("\n")
                        .slice(0, 3)
                        .join("\n")}
                      {JSON.stringify(stage, null, 2).split("\n").length > 3 &&
                        " ..."}
                    </code>
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
