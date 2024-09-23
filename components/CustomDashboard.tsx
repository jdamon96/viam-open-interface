"use client";

import { useState, useEffect, useContext } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViamClientContext } from "./ViamClientProvider";
import OrganizationSwitcher from "./OrganizationSwitcher";
import ClientStatusIndicator from "./ClientStatusIndicator";
import useAppStore from "@/store/zustand";
import LocationSwitcher from "./LocationSwitcher";
import useListViamRobots, { Robot } from "@/hooks/useListViamRobots";
import useGetViamRobotParts from "@/hooks/useGetViamRobotParts";
import { parseComponentsWithDataManager } from "@/lib/utils";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";

// Mock data for visualization types
const visualizationTypes = [
  "Bar Chart",
  "Line Chart",
  "Pie Chart",
  "Scatter Plot",
  "Table",
];

// Mock data for data sources
const dataSources = ["Sales Data", "User Analytics", "Inventory", "Finance"];

interface DataCard {
  id: string;
  title: string;
  robotId: string;
  dataSource: string;
  storageKey: string; // has form  "DASHBOARD_CARDS_{ORG_ID}_{LOC_ID}", e.g. "DASHBOARD_CARDS_85a3a4fc-f195-4d88-9ccd-26dc10f7755b_yiuf04fb9s"
  visualizationType: string;
}

interface ViamConfig {
  key: string;
  id: string;
}

export const LOCALSTORAGE_API_KEY = "API_KEY";
const LOCALSTORAGE_CARDS_PREFIX = "DASHBOARD_CARDS_";

export default function CustomDashboard() {
  const viamClientContext = useContext(ViamClientContext);
  const {
    config,
    setConfig,
    apiKey,
    apiKeyId,
    setApiKey,
    setApiKeyId,
    locationMachines,
    currentlySelectedLocation,
    currentlySelectedOrganization,
  } = useAppStore();
  const [cards, setCards] = useState<DataCard[]>([]);
  const [editingCard, setEditingCard] = useState<DataCard | null>(null);
  const { fetchRobotsAndSetInAppStore } = useListViamRobots();

  // Function to generate localStorage key for cards based on org and location
  const getCardsStorageKey = (orgId: string, locationId: string) =>
    `${LOCALSTORAGE_CARDS_PREFIX}${orgId}_${locationId}`;

  useEffect(() => {
    if (currentlySelectedLocation?.id && config?.id) {
      fetchRobotsAndSetInAppStore(currentlySelectedLocation.id);
    }
  }, [currentlySelectedLocation?.id, config?.id, fetchRobotsAndSetInAppStore]);

  useEffect(() => {
    const storedConfig = localStorage.getItem(LOCALSTORAGE_API_KEY);
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, [setConfig]);

  // Load cards from localStorage when config or location changes
  useEffect(() => {
    if (config?.id && currentlySelectedLocation?.id) {
      const storageKey = getCardsStorageKey(
        config.id,
        currentlySelectedLocation.id
      );
      const storedCards = localStorage.getItem(storageKey);
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      } else {
        setCards([]);
      }
    }
  }, [config?.id, currentlySelectedLocation?.id]);

  // Save cards to localStorage when cards, config, or location changes
  useEffect(() => {
    if (currentlySelectedOrganization?.id && currentlySelectedLocation?.id) {
      const storageKey = getCardsStorageKey(
        currentlySelectedOrganization.id,
        currentlySelectedLocation.id
      );
      const cardsWithStorageKey = cards.map((card) => ({
        ...card,
        storageKey,
      }));
      localStorage.setItem(storageKey, JSON.stringify(cardsWithStorageKey));
    }
  }, [cards, config?.id, currentlySelectedLocation?.id]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCards = Array.from(cards);
    const [reorderedCard] = newCards.splice(result.source.index, 1);
    newCards.splice(result.destination.index, 0, reorderedCard);

    setCards(newCards);
  };

  const handleAddCard = () => {
    const newCard: DataCard = {
      id: `card-${Date.now()}`,
      title: `New Card ${cards.length + 1}`,
      dataSource: "",
      robotId: "",
      visualizationType: "",
      storageKey: "",
    };
    setCards([...cards, newCard]);
    setEditingCard(newCard);
  };

  const handleSaveCard = (updatedCard: DataCard) => {
    setCards(
      cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
    setEditingCard(null);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleSubmitConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newConfig = { key: apiKey, id: apiKeyId };
    setConfig(newConfig);
    localStorage.setItem(LOCALSTORAGE_API_KEY, JSON.stringify(newConfig));
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Please enter a Viam Organization API Key and API Key ID to get
              started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyId">API Key ID</Label>
                <Input
                  id="apiKeyId"
                  type="password"
                  value={apiKeyId}
                  onChange={(e) => setApiKeyId(e.target.value)}
                  placeholder="Enter your API Key ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Config
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center border-b border-gray-300 py-4">
        <div className="flex space-x-2 items-center justify-center">
          <OrganizationSwitcher />
          <div className="px-1 text-gray-700">/</div>
          <LocationSwitcher />
        </div>
        <div className="flex space-x-2 items-center justify-center">
          <ClientStatusIndicator />
        </div>
      </div>
      <div className="">
        <h1 className="py-8 text-2xl">Visualize your machine data</h1>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded-lg w-96 h-64">
                    <p className="text-gray-500">
                      No data visualization cards yet.
                    </p>
                    <Button onClick={handleAddCard} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" /> Add Card
                    </Button>
                  </div>
                ) : (
                  cards.map((card, index) => {
                    console.log("Processing card with ID:", card.id);

                    const storageKey = card.storageKey;
                    console.log("Storage Key:", storageKey);

                    const [n, a, orgId, locId] = storageKey.split("_");
                    console.log("Extracted orgId:", orgId);
                    console.log("Extracted locId:", locId);

                    return (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DataVisualizationCard
                              card={card}
                              orgId={orgId}
                              locId={locId}
                              onEdit={() => setEditingCard(card)}
                              onDelete={() => handleDeleteCard(card.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <Dialog
        open={editingCard !== null}
        onOpenChange={() => setEditingCard(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Data Visualization Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CardConfigurationForm
              card={editingCard}
              onSave={handleSaveCard}
              locationMachines={locationMachines}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const constructMqlQueryStagesForDataVisualizationCard = (
  orgId: string,
  locId: string,
  robotId: string,
  dataSource: string,
  visualizationType: string
) => {
  return [
    {
      $match: {
        organization_id: orgId, // "5e3a2211-d311-4685-b595-e53b894c3719",
        location_id: locId, // "yiuf04fb9s",
        robot_id: robotId, // "d4e8acde-d1b9-4ed6-b9aa-229db1211d78",
      },
    },
    { $limit: 5 },
  ];
};

const DataVisualizationCard: React.FC<{
  card: DataCard;
  orgId: string;
  locId: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ card, orgId, locId, onEdit, onDelete }) => {
  const { fetchTabularData, loading, error, data } =
    useViamGetTabularDataByMQL();

  useEffect(() => {
    const mqlStages = constructMqlQueryStagesForDataVisualizationCard(
      orgId,
      locId,
      card.robotId,
      card.dataSource,
      card.visualizationType
    );
    if (orgId) {
      fetchTabularData(orgId, mqlStages).then(() => {
        console.log("Data fetched successfully!");
      });
    }
  }, [
    orgId,
    locId,
    card.robotId,
    card.dataSource,
    card.visualizationType,
    fetchTabularData,
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{card.title}</div>
        <div className="">{JSON.stringify(data, null, 2)}</div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {card.dataSource} - {card.visualizationType}
        </div>
      </CardFooter>
    </Card>
  );
};

const CardConfigurationForm: React.FC<{
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
