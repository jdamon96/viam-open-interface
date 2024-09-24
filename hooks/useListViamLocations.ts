import { useContext, useCallback, useState } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";
import useAppStore from "@/store/zustand";

interface UseListViamLocationsResult {
  loading: boolean;
  error?: Error;
  fetchLocationsAndSetInAppStore: (orgId: string) => Promise<void>;
}

/**
 * Custom hook to list all locations accessible to the user using Viam's listLocations API.
 *
 * @returns {UseListViamLocationsResult} An object containing the list of locations, loading state, error, and a function to fetch locations.
 */
const useListViamLocations = (): UseListViamLocationsResult => {
  const viamClientContext = useContext(ViamClientContext);
  const { availableLocations, setAvailableLocations } = useAppStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * Fetches the list of locations using Viam's listLocations API.
   */
  const fetchLocationsAndSetInAppStore = useCallback(
    async (orgId: string) => {
      if (!viamClientContext.client?.appClient) {
        console.debug(
          "Viam app client is not initialized. Triggering client connection"
        );
        await viamClientContext.triggerClientConnection();
      }

      if (!viamClientContext.client?.appClient) {
        console.log(viamClientContext.client);
        const errorMsg = "Viam app client is not initialized.";
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(undefined);
      setAvailableLocations([]);

      try {
        console.debug("Fetching list of locations...");
        const locations =
          await viamClientContext.client.appClient.listLocations(orgId);

        const supplementedLocations = [];
        for (const loc of locations) {
          const robots = await viamClientContext.client.appClient.listRobots(
            loc.id
          );
          supplementedLocations.push({
            ...loc,
            robotCount: robots.length,
          });
        }
        if (locations && locations.length > 0) {
          console.debug("Locations fetched successfully:", locations);
          setAvailableLocations(supplementedLocations);
        } else {
          const errorMsg = "No locations found.";
          console.warn(errorMsg);
          setError(new Error(errorMsg));
        }
      } catch (err: any) {
        console.error("Error fetching locations:", err);
        setError(err);
      } finally {
        setLoading(false);
        console.debug("fetchLocations completed");
      }
    },
    [viamClientContext.client?.appClient, setAvailableLocations]
  );

  return { loading, error, fetchLocationsAndSetInAppStore };
};

export default useListViamLocations;
