// useListViamRobots.ts

import { useState, useContext, useCallback } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";
import useAppStore from "@/store/zustand";

// Define the structure of the Robot object based on appApi.Robot.AsObject
export interface Robot {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  // Add other relevant fields based on your API response
}

interface UseListViamRobotsResult {
  loading: boolean;
  error?: Error;
  fetchRobotsAndSetInAppStore: (locId: string) => Promise<void>;
}

/**
 * Custom hook to list all robots within a specified location using Viam's listRobots API.
 *
 * @returns {UseListViamRobotsResult} An object containing the list of robots, loading state, error, and a function to fetch robots.
 */
const useListViamRobots = (): UseListViamRobotsResult => {
  const viamClientContext = useContext(ViamClientContext);
  const { locationMachines, setLocationMachines } = useAppStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * Fetches the list of robots for a given location using Viam's listRobots API.
   *
   * @param {string} locId - The ID of the location to list robots for.
   */
  const fetchRobotsAndSetInAppStore = useCallback(
    async (locId: string) => {
      console.debug("fetchRobots called with locId:", locId);

      if (!viamClientContext.client?.appClient) {
        const errorMsg = "Viam AppClient is not initialized.";
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(undefined);
      setLocationMachines([]);

      try {
        console.debug("Fetching robots for location ID:", locId);
        const fetchedRobots =
          await viamClientContext.client.appClient.listRobots(locId);
        if (fetchedRobots && fetchedRobots.length > 0) {
          console.debug("Robots fetched successfully:", fetchedRobots);
          setLocationMachines(fetchedRobots);
        } else {
          const errorMsg = "No robots found for the specified location.";
          console.warn(errorMsg);
          setError(new Error(errorMsg));
        }
      } catch (err: any) {
        console.error("Error fetching robots:", err);
        setError(err);
      } finally {
        setLoading(false);
        console.debug("fetchRobots completed");
      }
    },
    [viamClientContext.client?.appClient, setLocationMachines]
  );

  return { loading, error, fetchRobotsAndSetInAppStore };
};

export default useListViamRobots;
