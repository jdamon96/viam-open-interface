// hooks/useDashboardCards.ts
import { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import { DataCard } from "@/components/DataVisualizationCard";

const LOCALSTORAGE_CARDS_PREFIX = "DASHBOARD_CARDS_";

const useDashboardCards = (orgId: string, locId: string) => {
  const storageKey = `${LOCALSTORAGE_CARDS_PREFIX}${orgId}_${locId}`;
  const [storedCards, setStoredCards] = useLocalStorage<DataCard[]>(
    storageKey,
    []
  );
  const [cards, setCards] = useState<DataCard[]>(storedCards);

  useEffect(() => {
    setCards(storedCards);
  }, [storedCards]);

  const saveCards = (newCards: DataCard[]) => {
    setStoredCards(newCards);
  };

  return { cards, setCards: saveCards };
};

export default useDashboardCards;
