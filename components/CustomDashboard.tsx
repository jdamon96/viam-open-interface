"use client";
import { useState, useEffect, useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAppStore from "@/store/zustand";
import useListViamRobots from "@/hooks/useListViamRobots";
import { DataCard } from "./DataVisualizationCard";
import DataVisualizationCardConfigurationForm from "./DataVisualizationCardConfigurationForm";
import ApiConfigForm from "@/components/ApiConfigForm";
import Header from "@/components/Header";
import CardsList from "@/components/CardsList";
import useDashboardCards from "@/hooks/useDashboardCards";
import useApiConfig from "@/hooks/useApiConfig";

export const LOCALSTORAGE_API_KEY = "API_KEY";
const LOCALSTORAGE_CARDS_PREFIX = "DASHBOARD_CARDS_";

export default function CustomDashboard() {
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

  const { config: apiConfig, setConfig: setApiConfig } = useApiConfig();
  const { cards, setCards } = useDashboardCards(
    currentlySelectedOrganization?.id || "",
    currentlySelectedLocation?.id || ""
  );
  const [editingCard, setEditingCard] = useState<DataCard | null>(null);
  const { fetchRobotsAndSetInAppStore } = useListViamRobots();

  useEffect(() => {
    if (currentlySelectedLocation?.id && currentlySelectedOrganization?.id) {
      fetchRobotsAndSetInAppStore(currentlySelectedLocation.id);
    }
  }, [
    currentlySelectedLocation?.id,
    currentlySelectedOrganization?.id,
    fetchRobotsAndSetInAppStore,
  ]);

  useEffect(() => {
    if (apiConfig) {
      setConfig(apiConfig);
    }
  }, [apiConfig, setConfig]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const reorderedCards = Array.from(cards);
      const [movedCard] = reorderedCards.splice(result.source.index, 1);
      reorderedCards.splice(result.destination.index, 0, movedCard);

      setCards(reorderedCards);
    },
    [cards, setCards]
  );

  const handleAddCard = useCallback(() => {
    const newCard: DataCard = {
      id: `card-${Date.now()}`,
      title: `New Card ${cards.length + 1}`,
      dataSource: "",
      robotId: "",
      visualizationType: "",
      storageKey: `${LOCALSTORAGE_CARDS_PREFIX}${currentlySelectedOrganization?.id}_${currentlySelectedLocation?.id}`,
    };
    setCards([...cards, newCard]);
    setEditingCard(newCard);
  }, [cards, setCards, config, currentlySelectedLocation]);

  const handleSaveCard = useCallback(
    (updatedCard: DataCard) => {
      setCards(
        cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setEditingCard(null);
    },
    [cards, setCards]
  );

  const handleDeleteCard = useCallback(
    (id: string) => {
      setCards(cards.filter((card) => card.id !== id));
    },
    [cards, setCards]
  );

  const handleSubmitConfig = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newConfig = { key: apiKey, id: apiKeyId };
      setConfig(newConfig);
      setApiConfig(newConfig);
    },
    [apiKey, apiKeyId, setConfig, setApiConfig]
  );

  if (!config) {
    return (
      <ApiConfigForm
        apiKey={apiKey}
        apiKeyId={apiKeyId}
        setApiKey={setApiKey}
        setApiKeyId={setApiKeyId}
        onSubmit={handleSubmitConfig}
      />
    );
  }

  return (
    <div className="px-4">
      <Header />
      <div>
        <h1 className="py-8 text-2xl">Visualize your machine data</h1>
        <CardsList
          cards={cards}
          onDragEnd={handleDragEnd}
          onAddCard={handleAddCard}
          onEditCard={setEditingCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
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
