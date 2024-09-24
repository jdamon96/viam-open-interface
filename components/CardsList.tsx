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
  onDragEnd: (result: DropResult) => void;
  onAddCard: () => void;
  onEditCard: (card: DataCard) => void;
  onDeleteCard: (id: string) => void;
}

const CardsList: React.FC<CardsListProps> = ({
  cards,
  onDragEnd,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="dashboard">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded-lg w-96 h-64">
              <p className="text-gray-500">No data visualization cards yet.</p>
              <Button onClick={onAddCard} className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Card
              </Button>
            </div>
          ) : (
            cards.map((card, index) => {
              const [_, __, orgId, locId] = card.storageKey.split("_");
              return (
                <Draggable key={card.id} draggableId={card.id} index={index}>
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
                        onEdit={() => onEditCard(card)}
                        onDelete={() => onDeleteCard(card.id)}
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
);

export default CardsList;
