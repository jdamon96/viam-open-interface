// components/CardsList.tsx
import React from "react";
import DataVisualizationCard from "./DataVisualizationCard";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/store/zustand";
import { Plus } from "lucide-react";

interface CardsListProps {
  cards: DataCard[];
  onAddCard: () => void;
  onEditCard: (card: DataCard) => void;
  onDeleteCard: (id: string) => void;
  onSaveCard: (card: DataCard) => void; // Add onSaveCard prop
  userIsEditingCard: boolean;
}

const CardsList: React.FC<CardsListProps> = ({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onSaveCard, // Destructure onSaveCard
  userIsEditingCard,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {cards.length === 0 ? (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded-lg w-96 h-64">
        <p className="text-gray-500">No data visualization cards yet.</p>
        <Button onClick={onAddCard} className="mt-2">
          <Plus className="mr-2 h-4 w-4" /> Add Card
        </Button>
      </div>
    ) : (
      cards.map((card) => (
        <DataVisualizationCard
          key={card.id} // Use unique ID as key
          card={card}
          orgId={card.orgId}
          locId={card.locId}
          onEdit={() => onEditCard(card)}
          onDelete={() => onDeleteCard(card.id)}
          onSave={onSaveCard} // Pass the save handler directly
          userIsEditingCard={userIsEditingCard}
        />
      ))
    )}
  </div>
);

export default CardsList;
