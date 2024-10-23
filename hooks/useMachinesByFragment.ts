// Create a new hook, e.g., useMachinesByFragment.ts
import { useContext, useState, useEffect } from "react";
import useAppStore from "@/store/zustand";
import { ViamClientContext } from "@/components/ViamClientProvider";
import { ViamClient } from "@viamrobotics/sdk";

interface Machine {
  id: string;
  name: string;
  // ... other machine properties
}

interface UseMachinesByFragmentResult {
  loading: boolean;
  error?: Error;
  machines: Machine[];
}

const useMachinesByFragment = (
  fragmentId: string
): UseMachinesByFragmentResult => {
  const { fragmentToMachinesMap } = useAppStore();
  const viamClientContext = useContext(ViamClientContext);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      setError(undefined);
      setMachines([]);

      try {
        const machineIds = fragmentToMachinesMap[fragmentId] || [];
        const fetchedMachines: Machine[] = [];

        for (const machineId of machineIds) {
          const machine = await viamClientContext.client?.appClient?.getRobot(
            machineId
          );
          if (machine) {
            fetchedMachines.push(machine);
          }
        }

        setMachines(fetchedMachines);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (fragmentId) {
      fetchMachines();
    }
  }, [fragmentId, fragmentToMachinesMap, viamClientContext.client?.appClient]);

  return { loading, error, machines };
};

export default useMachinesByFragment;
