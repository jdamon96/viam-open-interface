"use client";
import { useState, useEffect, useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAppStore, { DataCard } from "@/store/zustand";
import useListViamRobots from "@/hooks/useListViamRobots";
import DataVisualizationCardConfigurationForm from "./DataVisualizationCardConfigurationForm";
import ApiConfigForm from "@/components/ApiConfigForm";
import Header from "@/components/Header";
import CardsList from "@/components/CardsList";
import { addDays } from "date-fns";

export default function CustomDashboard() {
  const [editingCard, setEditingCard] = useState<DataCard | null>(null);
  const [userIsEditingCard, setUserIsEditingCard] = useState(false);
  const [isQueryBuilder, setIsQueryBuilder] = useState(false);

  const {
    config,
    setConfig,
    apiKey,
    setApiKey,
    apiKeyId,
    setApiKeyId,
    locationMachines,
    currentlySelectedLocation,
    currentlySelectedOrganization,
    cards,
    setCards,
  } = useAppStore();

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

  const handleAddCard = useCallback(() => {
    if (!currentlySelectedOrganization?.id || !currentlySelectedLocation?.id) {
      console.error("Organization or Location ID is missing");
      return;
    }
    const newCard: DataCard = {
      id: `card-${Date.now()}`,
      orgId: currentlySelectedOrganization.id,
      locId: currentlySelectedLocation.id,
      title: `New Card ${cards.length + 1}`,
      dataSource: "",
      robotId: "",
      visualizationType: "",
      dateRange: {
        from: addDays(new Date(), -3),
        to: new Date(),
      },
      aggregationStages: [
        {
          operator: "$match",
          definition: {
            organization_id: currentlySelectedOrganization.id,
            location_id: currentlySelectedLocation.id,
          },
        },
      ],
    };
    setCards([...cards, newCard]);
    setEditingCard(newCard);
    setUserIsEditingCard(true);
  }, [
    cards,
    setCards,
    currentlySelectedOrganization,
    currentlySelectedLocation,
  ]);

  const handleSaveCard = useCallback(
    (updatedCard: DataCard) => {
      setCards(
        cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
      );
      setEditingCard(null);
      setUserIsEditingCard(false);
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
    },
    [apiKey, apiKeyId, setConfig]
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

  const matchingOrgLocCards = cards.filter(
    (card) =>
      card.orgId === currentlySelectedOrganization?.id &&
      card.locId === currentlySelectedLocation?.id
  );

  return (
    <div className="px-4">
      <Header />
      <div>
        <h1 className="py-8 text-2xl">Visualize your machine data</h1>
        <CardsList
          cards={matchingOrgLocCards}
          onAddCard={handleAddCard}
          onEditCard={(card) => {
            setEditingCard(card);
            setUserIsEditingCard(true);
          }}
          onDeleteCard={handleDeleteCard}
          onSaveCard={handleSaveCard}
          userIsEditingCard={userIsEditingCard}
        />
      </div>
      <Dialog
        open={!!editingCard}
        onOpenChange={() => {
          setEditingCard(null);
          setIsQueryBuilder(false);
          setUserIsEditingCard(false);
        }}
      >
        <DialogContent className="w-11/12">
          {!isQueryBuilder && (
            <DialogTitle className="font-normal">
              Configure Data Visualization Card
            </DialogTitle>
          )}

          {editingCard && (
            <DataVisualizationCardConfigurationForm
              card={editingCard}
              onSave={handleSaveCard}
              locationMachines={locationMachines}
              onModeChange={setIsQueryBuilder}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
