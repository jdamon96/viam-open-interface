// hooks/useMachinesByFragment.ts
import { useContext, useState, useCallback } from "react";
import useAppStore from "@/store/zustand";
import { ViamClientContext } from "@/components/ViamClientProvider";
import { ViamClient } from "@viamrobotics/sdk";

interface Machine {
  id: string;
  name: string;
  // ... other machine properties
}

const useMachinesByFragment = () => {
  const { fragmentToMachinesMap } = useAppStore();
  const viamClientContext = useContext(ViamClientContext);
  const [loading, setLoading] = useState(false);

  // Memoize fetchMachinesByFragment with useCallback
  const fetchMachinesByFragment = useCallback(
    async (fragmentId: string): Promise<Machine[]> => {
      setLoading(true);
      try {
        const machineIds = fragmentToMachinesMap[fragmentId] || [];
        const fetchedMachines: Machine[] = [];

        // Fetch machines concurrently for better performance
        const machinePromises = machineIds.map(async (machineId) => {
          const machine = await viamClientContext.client?.appClient?.getRobot(
            machineId
          );
          return machine;
        });

        const machines = await Promise.all(machinePromises);
        machines.forEach((machine) => {
          if (machine) {
            fetchedMachines.push(machine);
          }
        });

        return fetchedMachines;
      } catch (error) {
        console.error("Error fetching machines:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [fragmentToMachinesMap, viamClientContext.client] // Dependencies
  );

  return { fetchMachinesByFragment, loading };
};

export default useMachinesByFragment;
