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

// Mock data for visualization types
const visualizationTypes = [
  "Bar Chart",
  "Line Chart",
  "Pie Chart",
  "Scatter Plot",
  "Table",
];

const DataVisualizationCardConfigurationForm: React.FC<{
  card: DataCard;
  onSave: (card: DataCard) => void;
  locationMachines: Robot[];
}> = ({ card, onSave, locationMachines }) => {
  const [title, setTitle] = useState(card.title);
  const [dataSource, setDataSource] = useState(card.dataSource);
  const [dataSourceRobotId, setDataSourceRobotId] = useState(
    card.robotId || ""
  );
  const [machineSource, setMachineSource] = useState<Robot | undefined>(
    undefined
  );
  const [dataCollectingComponents, setDataCollectingComponents] =
    useState<any>();
  const [visualizationType, setVisualizationType] = useState(
    card.visualizationType
  );

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

  return (
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
            <SelectValue placeholder="Select a machine" />
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
            {dataCollectingComponents?.map((dataCollectingComponent: any) => (
              <SelectItem
                key={dataCollectingComponent.id}
                value={dataCollectingComponent.name}
              >
                {dataCollectingComponent.name}
              </SelectItem>
            ))}
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
      <Button type="submit">Save Configuration</Button>
    </form>
  );
};
export default DataVisualizationCardConfigurationForm;
