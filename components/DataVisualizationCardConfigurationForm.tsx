// DataVisualizationCardConfigurationForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { constructInitialMatchStageBasedOnCardConfigurationForm } from "./DataVisualizationCard";
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
import { ArrowRight, Info, Wrench } from "lucide-react";
import useAppStore, { DataCard } from "@/store/zustand";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";
import QueryBuilder from "./QueryBuilder";
import { Input } from "./ui/input";
import { AggregationStage } from "@/types/AggregationStage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import JsonCodeEditor from "./JsonEditor";

import SingleMachineConfigurationForm from "./SingleMachineConfigurationForm";
import GroupOfMachinesConfigurationForm from "./GroupOfMachinesConfigurationForm";
import useListViamOrganizationFragments from "@/hooks/useListViamOrganizationFragments";

interface StageBlockProps {
  stage: AggregationStage;
  onClick: () => void;
}

const StageBlock: React.FC<StageBlockProps> = ({ stage, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 cursor-pointer transition-colors duration-200"
            variant={"secondary"}
          >
            {stage.operator}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-0 py-0">
          <JsonCodeEditor
            value={JSON.stringify(stage.definition, null, 2)}
            onChange={() => {}}
            minHeight="min-h-[256px]"
            maxHeight="max-h-[256px]"
            readOnly={true} // only readOnly if locked
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const visualizationTypes = ["Stacked Bar Chart", "Line Chart", "Table"];

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

  // **Initial Tab Selection Based on Configured Machines**
  const initialActiveTab = useMemo<"singleMachine" | "groupOfMachines">(() => {
    return card.groupMachines && card.groupMachines.length > 0
      ? "groupOfMachines"
      : "singleMachine";
  }, [card.groupMachines]);

  const [activeTab, setActiveTab] = useState<
    "singleMachine" | "groupOfMachines"
  >(initialActiveTab);

  const toggleQueryBuilder = useCallback(
    (value: boolean) => {
      setIsQueryBuilder(value);
      onModeChange(value); // Notify parent
    },
    [onModeChange]
  );

  const [stages, setStages] = useState<AggregationStage[]>(
    card.aggregationStages ?? []
  );
  const {
    currentlySelectedLocation,
    currentlySelectedOrganization,
    organizationFragments,
  } = useAppStore();

  const { fetchRobotParts, robotParts } = useGetViamRobotParts();

  const {
    fetchTabularData,
    loading: tabularDataLoading,
    error: tabularDataError,
    data,
  } = useViamGetTabularDataByMQL();

  const {
    fetchFragmentsAndSetInAppStore,
    loading: fragmentsLoading,
    error: fragmentsError,
  } = useListViamOrganizationFragments();

  useEffect(() => {
    if (currentlySelectedOrganization?.id && currentlySelectedLocation?.id) {
      console.log(
        "[DataVisualizationCardConfigForm useEffect]: Fetching fragments for organization ID:",
        currentlySelectedOrganization.id
      );
      fetchFragmentsAndSetInAppStore(
        currentlySelectedOrganization.id,
        currentlySelectedLocation.id
      );
    }
  }, [
    currentlySelectedOrganization,
    currentlySelectedLocation,
    fetchFragmentsAndSetInAppStore,
  ]);

  if (fragmentsError) {
    console.error("Error fetching fragments", fragmentsError);
  }

  // **State for Group of Machines**
  const [selectedGroupMachines, setSelectedGroupMachines] = useState<string[]>(
    card.groupMachines || []
  );
  const [selectedGroupFragment, setSelectedGroupFragment] = useState<
    string | null
  >(card.groupFragment || null);

  // Memoize machines options to prevent unnecessary recalculations
  const machinesOptions = useMemo(
    () =>
      locationMachines.map((machine) => ({
        value: machine.id,
        label: machine.name,
      })),
    [locationMachines]
  );

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
   * Construct and update agg pipeline initial $match stage whenever relevant form fields change.
   * Updated to handle both single machine and group of machines selections.
   */
  useEffect(() => {
    if (
      !currentlySelectedLocation ||
      !currentlySelectedOrganization ||
      (activeTab === "singleMachine" && !dataSourceRobotId) ||
      (activeTab === "groupOfMachines" && selectedGroupMachines.length === 0)
    )
      return;

    const updatedInitMatchStage =
      constructInitialMatchStageBasedOnCardConfigurationForm(
        currentlySelectedOrganization.id,
        currentlySelectedLocation.id,
        activeTab === "singleMachine" ? dataSourceRobotId : undefined,
        activeTab === "groupOfMachines" ? selectedGroupMachines : undefined,
        card.dateRange,
        dataSource
      );
    setStages((prevStages) => [updatedInitMatchStage, ...prevStages.slice(1)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    dataSource,
    dataSourceRobotId,
    selectedGroupMachines,
    visualizationType,
    currentlySelectedLocation,
    currentlySelectedOrganization,
    card.dateRange,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const updatedCard: DataCard = {
        ...card,
        title,
        visualizationType,
        aggregationStages: stages,
      };

      if (activeTab === "singleMachine") {
        updatedCard.dataSource = dataSource;
        updatedCard.robotId = machineSource?.id || "";
        updatedCard.groupMachines = []; // Clear groupMachines
        updatedCard.groupFragment = null; // Clear groupFragment
      } else if (activeTab === "groupOfMachines") {
        updatedCard.groupMachines = selectedGroupMachines;
        updatedCard.groupFragment = selectedGroupFragment;
        updatedCard.robotId = ""; // Clear robotId if group is selected
        updatedCard.dataSource = ""; // Clear dataSource
      }

      onSave(updatedCard);
    },
    [
      card,
      title,
      visualizationType,
      stages,
      activeTab,
      dataSource,
      machineSource,
      selectedGroupMachines,
      selectedGroupFragment,
      onSave,
    ]
  );

  // Handlers for GroupOfMachinesConfigurationForm
  const handleMachinesSelected = useCallback((selectedMachines: string[]) => {
    setSelectedGroupMachines(selectedMachines);
  }, []);

  const handleFragmentSelected = useCallback(
    (selectedFragmentId: string | null) => {
      setSelectedGroupFragment(selectedFragmentId);
    },
    []
  );

  return (
    <>
      {isQueryBuilder ? (
        <QueryBuilder
          stages={stages}
          setStages={setStages}
          onClose={() => toggleQueryBuilder(false)}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 flex flex-col space-y-6 min-w-[410px] overflow-auto"
        >
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

          {/* Visualization Type */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="visualizationType">Visualization Type</Label>

              {visualizationType && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800 hover:cursor-pointer rounded px-3 py-1 flex items-center space-x-1"
                      >
                        <Info size={16} className="text-yellow-700" />
                        <span className="font-semibold">
                          {" "}
                          Expected data format
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-0 py-0">
                      <div className="flex flex-col">
                        <div className="p-3 border-b border-gray-200 text-sm italic">
                          Example input data format for a{" "}
                          <span className="font-semibold">
                            {visualizationType}
                          </span>{" "}
                          data visualization.
                        </div>
                        <JsonCodeEditor
                          value={JSON.stringify(
                            getVisualizationTypeExpectedDataFormat(
                              visualizationType
                            ),
                            null,
                            2
                          )}
                          onChange={() => {}}
                          minHeight="min-h-[256px]"
                          maxHeight="max-h-[256px]"
                          readOnly={true}
                        />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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

          <Label>Data Source</Label>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "singleMachine" | "groupOfMachines")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="singleMachine">Single Machine</TabsTrigger>
              <TabsTrigger value="groupOfMachines">
                Group of Machines
              </TabsTrigger>
            </TabsList>
            <TabsContent value="singleMachine">
              <SingleMachineConfigurationForm
                title={title}
                setTitle={setTitle}
                dataSource={dataSource}
                setDataSource={setDataSource}
                machineSource={machineSource}
                setMachineSource={setMachineSource}
                setDataSourceRobotId={setDataSourceRobotId}
                locationMachines={locationMachines}
                dataCollectingComponents={dataCollectingComponents}
                stages={stages}
                toggleQueryBuilder={toggleQueryBuilder}
              />
            </TabsContent>
            <TabsContent value="groupOfMachines">
              <GroupOfMachinesConfigurationForm
                card={card}
                locationMachines={locationMachines}
                selectedGroupMachinesIds={selectedGroupMachines}
                onMachinesSelected={handleMachinesSelected}
                onFragmentSelected={handleFragmentSelected}
                fragments={organizationFragments}
                fragmentsLoading={fragmentsLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Data Aggregation Pipeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Data Aggregation Pipeline</Label>

              <Button
                variant={"ghost"}
                onClick={() => toggleQueryBuilder(true)}
                className="text-xs border border-gray-300 hover:bg-gray-100 hover:cursor-pointer rounded px-3 py-1 flex items-center space-x-1"
              >
                <Wrench size={12} className="text-gray-700" />
                <span>Configure</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto py-2">
              {stages.map((stage, index) => (
                <React.Fragment key={index}>
                  <StageBlock
                    stage={stage}
                    onClick={() => toggleQueryBuilder(true)}
                  />
                  {index < stages.length - 1 && (
                    <ArrowRight className="text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Save Configuration Button */}
          <Button type="submit">Save Configuration</Button>
        </form>
      )}
    </>
  );
};

export default DataVisualizationCardConfigurationForm;

/**
 * Utility function to get expected data format for each visualization type
 */
const getVisualizationTypeExpectedDataFormat = (visualizationType: string) => {
  console.log(`Visualization Type: ${visualizationType}`);
  switch (visualizationType) {
    case "Stacked Bar Chart":
      return [
        {
          // The category for the x-axis
          category: "Category Example",
          // The value for the first series
          series1: 100,
          // The value for the second series
          series2: 200,
        },
        {
          category: "Another Category",
          series1: 150,
          series2: 250,
        },
      ];
    case "Line Chart":
      return [
        {
          // The date for the x-axis
          date: "2023-01-01",
          // The value for the first metric
          metric1: 5,
          // The value for the second metric
          metric2: 60,
        },
        {
          date: "2023-01-02",
          metric1: 7,
          metric2: 65,
        },
      ];
    case "Table":
      return [
        {
          // The timestamp of the data
          timestamp: "2023-01-01T00:00:00Z",
          // The ID of the device
          deviceId: "device-001",
          // The voltage reading
          voltage: 3.7,
          // The current reading
          current: 1.2,
          // The power reading
          power: 4.44,
        },
        {
          timestamp: "2023-01-01T01:00:00Z",
          deviceId: "device-002",
          voltage: 3.8,
          current: 1.1,
          power: 4.18,
        },
      ];
    default:
      return [];
  }
};
