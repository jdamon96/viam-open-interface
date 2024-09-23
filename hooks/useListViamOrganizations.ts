// useListViamOrganizations.ts

import { useContext, useCallback, useState } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";
import useAppStore from "@/store/zustand";

interface UseListViamOrganizationsResult {
  loading: boolean;
  error?: Error;
  fetchOrganizationsAndSetInAppStore: () => Promise<void>;
}

/**
 * Custom hook to list all organizations accessible to the user using Viam's listOrganizations API.
 *
 * @returns {UseListViamOrganizationsResult} An object containing the list of organizations, loading state, error, and a function to fetch organizations.
 */
const useListViamOrganizations = (): UseListViamOrganizationsResult => {
  const viamClientContext = useContext(ViamClientContext);
  const { availableOrganizations, setAvailableOrganizations } = useAppStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * Fetches the list of organizations using Viam's listOrganizations API.
   */
  const fetchOrganizationsAndSetInAppStore = useCallback(async () => {
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
    setAvailableOrganizations([]);

    try {
      console.debug("Fetching list of organizations...");
      const orgs = await viamClientContext.client.appClient.listOrganizations();
      if (orgs && orgs.length > 0) {
        console.debug("Organizations fetched successfully:", orgs);
        setAvailableOrganizations(orgs);
      } else {
        const errorMsg = "No organizations found.";
        console.warn(errorMsg);
        setError(new Error(errorMsg));
      }
    } catch (err: any) {
      console.error("Error fetching organizations:", err);
      setError(err);
    } finally {
      setLoading(false);
      console.debug("fetchOrganizations completed");
    }
  }, [viamClientContext.client?.appClient, setAvailableOrganizations]);

  return { loading, error, fetchOrganizationsAndSetInAppStore };
};

export default useListViamOrganizations;
