// components/DataVisualizationCardConfigurationForm.tsx

import React, { useState, useEffect } from "react";
import {
  constructMqlQueryStagesForDataVisualizationCard,
  DataCard,
} from "./DataVisualizationCard";
import useGetViamRobotParts from "@/hooks/useGetViamRobotParts";
import { Robot } from "@/hooks/useListViamRobots";
import { parseComponentsWithDataManager } from "@/lib/utils";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Braces, Pencil, RefreshCcw, Trash } from "lucide-react";
import useAppStore from "@/store/zustand";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";
import QueryBuilder from "./QueryBuilder";
import { Input } from "./ui/input";
import { applyAggregationPipeline } from "@/lib/pipelineUtils";
import { AggregationStage } from "@/types/AggregationStage";

// Mock data for visualization types
const visualizationTypes = [
  "Bar Chart",
  "Line Chart",
  "Pie Chart",
  "Scatter Plot",
  "Table",
];

interface DataVisualizationCardConfigurationFormProps {
  card: DataCard;
  onSave: (card: DataCard) => void;
  locationMachines: Robot[];
  onModeChange: (isQueryBuilder: boolean) => void;
}

const DataVisualizationCardConfigurationForm: React.FC<
  DataVisualizationCardConfigurationFormProps
> = ({ card, onSave, locationMachines, onModeChange }) => {
  // State Management
  const [title, setTitle] = useState(card.title);
  const [dataSource, setDataSource] = useState(card.dataSource);
  const [dataSourceRobotId, setDataSourceRobotId] = useState(
    card.robotId || ""
  );
  const [machineSource, setMachineSource] = useState<Robot | undefined>(
    locationMachines.find((machine) => machine.id === card?.robotId)
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

  const [stages, setStages] = useState<AggregationStage[]>(
    card.aggregationStages ?? []
  );
  const { currentlySelectedLocation, currentlySelectedOrganization } =
    useAppStore();

  const { fetchRobotParts, robotParts } = useGetViamRobotParts();

  const { fetchTabularData, loading, error, data } =
    useViamGetTabularDataByMQL();

  // Fetch Robot Parts when machineSource changes
  useEffect(() => {
    if (machineSource?.id) {
      fetchRobotParts(machineSource.id);
    }
  }, [machineSource, fetchRobotParts]);

  // Parse components when robotParts changes
  useEffect(() => {
    if (robotParts) {
      const components = parseComponentsWithDataManager(robotParts);
      setDataCollectingComponents(components);
    }
  }, [robotParts]);

  /**
   * Construct and update stages whenever relevant form fields change.
   * This ensures that the query builder preview is live-updating.
   */
  useEffect(() => {
    if (
      !currentlySelectedLocation ||
      !currentlySelectedOrganization ||
      !dataSourceRobotId
    )
      return;

    const updatedStages = constructMqlQueryStagesForDataVisualizationCard(
      currentlySelectedOrganization.id,
      currentlySelectedLocation.id,
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
    card.dateRange,
  ]);

  // Optionally, if you have other fields that should trigger stage updates, include them here.

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...card,
      title,
      dataSource,
      robotId: machineSource?.id || "",
      visualizationType,
      aggregationStages: stages,
    });
  };

  return (
    <>
      {isQueryBuilder ? (
        <QueryBuilder
          stages={stages}
          setStages={setStages}
          onClose={() => toggleQueryBuilder(false)}
        />
      ) : (
        <ConfigurationForm
          title={title}
          setTitle={setTitle}
          dataSource={dataSource}
          setDataSource={setDataSource}
          machineSource={machineSource}
          setMachineSource={setMachineSource}
          setDataSourceRobotId={setDataSourceRobotId}
          locationMachines={locationMachines}
          dataCollectingComponents={dataCollectingComponents}
          visualizationType={visualizationType}
          setVisualizationType={setVisualizationType}
          stages={stages}
          toggleQueryBuilder={toggleQueryBuilder}
          handleSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default DataVisualizationCardConfigurationForm;

/**
 * ConfigurationForm Component
 * Refactored <form /> and its contents into a separate functional component for better readability.
 */

interface ConfigurationFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  dataSource: string;
  setDataSource: React.Dispatch<React.SetStateAction<string>>;
  machineSource: Robot | undefined;
  setMachineSource: React.Dispatch<React.SetStateAction<Robot | undefined>>;
  setDataSourceRobotId: React.Dispatch<React.SetStateAction<string>>;
  locationMachines: Robot[];
  dataCollectingComponents: any;
  visualizationType: string;
  setVisualizationType: React.Dispatch<React.SetStateAction<string>>;
  stages: AggregationStage[];
  toggleQueryBuilder: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  title,
  setTitle,
  dataSource,
  setDataSource,
  machineSource,
  setMachineSource,
  setDataSourceRobotId,
  locationMachines,
  dataCollectingComponents,
  visualizationType,
  setVisualizationType,
  stages,
  toggleQueryBuilder,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Card Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Machine Selection */}
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

      {/* Data Source Selection */}
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
              (dataCollectingComponent: any, idx: number) => (
                <SelectItem
                  key={dataCollectingComponent.id + idx}
                  value={dataCollectingComponent.name}
                >
                  {dataCollectingComponent.name}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Visualization Type Selection */}
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

      {/* Query Aggregation Pipeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="visualizationType">Query Aggregation Pipeline</Label>
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
          {stages.map((stage, index) => {
            console.log(stage);
            return (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg w-full flex items-center justify-between text-sm relative"
              >
                <pre className="overflow-hidden text-ellipsis">
                  <code className="text-gray-600 line-clamp-4">
                    {JSON.stringify(stage.operator, null, 2)}:{" "}
                    {JSON.stringify(stage.definition, null, 2)}
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
            );
          })}
        </div>
      </div>

      {/* Save Configuration Button */}
      <Button type="submit">Save Configuration</Button>
    </form>
  );
};
