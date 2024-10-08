// components/CardsList.tsx
import {
  Droppable,
  Draggable,
  DropResult,
  DragDropContext,
} from "react-beautiful-dnd";
import DataVisualizationCard from "./DataVisualizationCard";
import { DataCard } from "./DataVisualizationCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CardsListProps {
  cards: DataCard[];
  onAddCard: () => void;
  onEditCard: (card: DataCard) => void;
  onDeleteCard: (id: string) => void;
  userIsEditingCard: boolean;
}

// Utility function to safely extract orgId and locId
const parseStorageKey = (
  storageKey: string
): { orgId: string; locId: string } | null => {
  const parts = storageKey.split("_");
  if (parts.length < 4) return null;
  return { orgId: parts[2], locId: parts[3] };
};

const CardsList: React.FC<CardsListProps> = ({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
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
      cards.map((card, index) => {
        const parsedKey = parseStorageKey(card.storageKey);
        if (!parsedKey) {
          console.error(`Invalid storage key format: ${card.storageKey}`);
          return null;
        }
        const { orgId, locId } = parsedKey;
        return (
          <DataVisualizationCard
            key={index}
            card={card}
            orgId={orgId}
            locId={locId}
            onEdit={() => onEditCard(card)}
            onDelete={() => onDeleteCard(card.id)}
            onSave={(updatedCard) => {
              onEditCard(updatedCard);
            }}
            userIsEditingCard={userIsEditingCard}
          />
        );
      })
    )}
  </div>
);

export default CardsList;
