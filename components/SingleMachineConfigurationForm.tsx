// SingleMachineConfigurationForm.tsx

import React, { useMemo, useCallback } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Robot } from "@/hooks/useListViamRobots";
import { AggregationStage } from "@/types/AggregationStage";

interface SingleMachineConfigurationFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  dataSource: string;
  setDataSource: React.Dispatch<React.SetStateAction<string>>;
  machineSource: Robot | undefined;
  setMachineSource: React.Dispatch<React.SetStateAction<Robot | undefined>>;
  setDataSourceRobotId: React.Dispatch<React.SetStateAction<string>>;
  locationMachines: Robot[];
  dataCollectingComponents: any;
  stages: AggregationStage[];
  toggleQueryBuilder: (value: boolean) => void;
}

const SingleMachineConfigurationForm: React.FC<
  SingleMachineConfigurationFormProps
> = ({
  title,
  setTitle,
  dataSource,
  setDataSource,
  machineSource,
  setMachineSource,
  setDataSourceRobotId,
  locationMachines,
  dataCollectingComponents,
  stages,
  toggleQueryBuilder,
}) => {
  // Memoize machine options to prevent unnecessary recalculations
  const machineOptions = useMemo(() => {
    const options = locationMachines.map((machine) => ({
      value: machine.id,
      label: machine.name,
    }));

    return options;
  }, [locationMachines]);

  const handleMachineChange = useCallback(
    (val: string) => {
      const machine = locationMachines.find((robot) => robot.id === val);
      setMachineSource(machine);
      setDataSourceRobotId(machine?.id || "");
    },
    [locationMachines, setMachineSource, setDataSourceRobotId]
  );

  const dataSourceOptions = useMemo(
    () =>
      dataCollectingComponents?.map((component: any, idx: number) => ({
        value: component.name,
        label: component.name,
      })) || [],
    [dataCollectingComponents]
  );

  return (
    <div className="py-4 flex flex-col space-y-6 min-w-[410px] overflow-auto">
      {/* Machine Selection */}
      <div className="space-y-2">
        <Label htmlFor="machineSource">Machine</Label>
        {machineOptions.length > 0 ? (
          <Select
            value={machineSource?.id || ""}
            onValueChange={handleMachineChange}
            required
          >
            <SelectTrigger id="machineSource">
              <SelectValue
                placeholder="Select a machine"
                defaultValue={machineSource?.name || ""}
              />
            </SelectTrigger>
            <SelectContent>
              {machineOptions.map((robot) => (
                <SelectItem key={robot.value} value={robot.value}>
                  {robot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-gray-500">
            No machines available in this location.
          </p>
        )}
      </div>

      {/* Data Source Selection */}
      <div className="space-y-2">
        <Label htmlFor="dataSource">Data Source</Label>
        {dataSourceOptions.length > 0 ? (
          <Select
            value={dataSource}
            onValueChange={(val) => setDataSource(val)}
            required
            disabled={!dataCollectingComponents}
          >
            <SelectTrigger id="dataSource">
              <SelectValue placeholder="Select a data source" />
            </SelectTrigger>
            <SelectContent>
              {dataSourceOptions.map(
                (dataCollectingComponent: any, idx: any) => (
                  <SelectItem
                    key={`${dataCollectingComponent.value}-${idx}`}
                    value={dataCollectingComponent.value}
                  >
                    {dataCollectingComponent.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-gray-500">
            No machines available in this location.
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleMachineConfigurationForm;
