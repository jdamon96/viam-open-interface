"use client";
import { useState, useEffect, useContext } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViamClientContext } from "./ViamClientProvider";
import OrganizationSwitcher from "./OrganizationSwitcher";
import ClientStatusIndicator from "./ClientStatusIndicator";
import useAppStore from "@/store/zustand";
import LocationSwitcher from "./LocationSwitcher";
import useListViamRobots from "@/hooks/useListViamRobots";
import DataVisualizationCard, { DataCard } from "./DataVisualizationCard";
import DataVisualizationCardConfigurationForm from "./DataVisualizationCardConfigurationForm";

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
            <DataVisualizationCardConfigurationForm
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
