// useGetViamOrgInfo.ts

import { ViamClientContext } from "@/components/ViamClientProvider";
import { useState, useContext, useCallback } from "react";

// Define the structure of the Organization object based on appApi.Organization.AsObject
interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  // Add other relevant fields based on your API response
}

interface UseGetViamOrgInfoResult {
  organization?: Organization;
  loading: boolean;
  error?: Error;
  fetchOrganization: (orgId: string) => Promise<void>;
}

const useGetViamOrgInfo = (): UseGetViamOrgInfoResult => {
  const viamClientContext = useContext(ViamClientContext);
  const [organization, setOrganization] = useState<Organization | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchOrganization = useCallback(
    async (orgId: string) => {
      console.debug("fetchOrganization called with orgId:", orgId);

      if (!viamClientContext.client) {
        const errorMsg = "Viam client is not initialized.";
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(undefined);

      try {
        console.debug("Fetching organization with orgId:", orgId);
        const org = await viamClientContext.client?.appClient?.getOrganization(
          orgId
        );
        if (org) {
          console.debug("Organization fetched successfully:", org);
          setOrganization(org);
        } else {
          const errorMsg = "Organization not found.";
          console.error(errorMsg);
          setError(new Error(errorMsg));
        }
      } catch (err: any) {
        console.error("Error fetching organization:", err);
        setError(err);
      } finally {
        setLoading(false);
        console.debug("fetchOrganization completed");
      }
    },
    [viamClientContext.client]
  );

  return { organization, loading, error, fetchOrganization };
};

export default useGetViamOrgInfo;
