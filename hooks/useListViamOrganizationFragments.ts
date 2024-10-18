import { useContext, useCallback, useState } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";
import useAppStore from "@/store/zustand";
import { ViamClient } from "@viamrobotics/sdk";

interface Fragment {
  // Define the structure of the Fragment object based on your API response
  id: string;
  name: string;
  // Add other relevant fields
}

interface UseListViamOrganizationFragmentsResult {
  loading: boolean;
  error?: Error;
  fetchFragmentsAndSetInAppStore: (
    orgId: string,
    fragmentVisibility?: string[]
  ) => Promise<void>;
}

/**
 * Custom hook to list all fragments associated with a specified organization using Viam's listFragments API.
 *
 * @returns {UseListViamOrganizationFragmentsResult} An object containing the list of fragments, loading state, error, and a function to fetch fragments.
 */
const useListViamOrganizationFragments =
  (): UseListViamOrganizationFragmentsResult => {
    const viamClientContext = useContext(ViamClientContext);
    const { organizationFragments, setOrganizationFragments } = useAppStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    /**
     * Fetches the list of fragments created by the organization.
     *
     * @param {string} orgId - The ID of the organization to list fragments for.
     * @returns {Promise<Fragment[]>} - A promise that resolves to the list of fragments.
     */
    const getAllOrgFragments = async (orgId: string): Promise<Fragment[]> => {
      if (!viamClientContext.client?.appClient) {
        console.debug(
          "Viam app client is not initialized. Triggering client connection"
        );
        await viamClientContext.triggerClientConnection();
      }

      if (!viamClientContext.client?.appClient) {
        const errorMsg = "Viam app client is not initialized.";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.debug("Fetching fragments created by organization ID:", orgId);
      const fragments = await viamClientContext.client.appClient.listFragments(
        orgId,
        false, // Assuming publicOnly is deprecated and not used
        [0] // 1 is private, 2 is public, 3 is unlisted, 0 is unspecified
      );

      return fragments || [];
    };

    /**
     * Fetches the list of fragments in use by the organization's machines.
     *
     * @param {string} orgId - The ID of the organization to list fragments for.
     * @returns {Promise<Fragment[]>} - A promise that resolves to the list of fragments.
     */
    const getAllFragmentsInUseByOrgMachines = async (
      orgId: string
    ): Promise<Fragment[]> => {
      // TO_DO: finish this implementation
      let fragmentsInUseByOrgMachines: Fragment[] = [];
      // step 1: Fetch all machines associated with the organization
      const machines = await viamClientContext?.client?.appClient?.listRobots(
        orgId
      );
      // step 2: Fetch all fragments associated with the machines
      if (machines) {
        for (const machine of machines) {
          // Naveed said on 10/17/24 `listMachineFragments` should be released on monday 10/21/24
          // https://viaminc.slack.com/archives/C0653ULNNAX/p1729177614079899?thread_ts=1729176402.804239&cid=C0653ULNNAX
          const machineFragments =
            viamClientContext?.client?.appClient?.listMachineFragments(
              machine.id
            );
          fragmentsInUseByOrgMachines = [
            ...fragmentsInUseByOrgMachines,
            ...machineFragments,
          ];
        }
      }

      // step 3: Return the list of fragments associated with the machines
      return [];
    };

    /**
     * Fetches the list of all fragments associated with the organization.
     *
     * @param {string} orgId - The ID of the organization to list fragments for.
     */
    const fetchFragmentsAndSetInAppStore = useCallback(
      async (orgId: string) => {
        setLoading(true);
        setError(undefined);
        setOrganizationFragments([]);

        try {
          const orgFragments = await getAllOrgFragments(orgId);
          const fragmentsInUseByOrgMachines =
            await getAllFragmentsInUseByOrgMachines(orgId);

          const allOrgAssociatedFragments = [
            ...orgFragments,
            ...fragmentsInUseByOrgMachines,
          ];

          if (allOrgAssociatedFragments.length > 0) {
            console.debug(
              "Fragments fetched successfully:",
              allOrgAssociatedFragments
            );
            setOrganizationFragments(allOrgAssociatedFragments);
          } else {
            const errorMsg =
              "No fragments found for the specified organization.";
            console.warn(errorMsg);
            setError(new Error(errorMsg));
          }
        } catch (err: any) {
          console.error("Error fetching fragments:", err);
          setError(err);
        } finally {
          setLoading(false);
          console.debug("fetchFragments completed");
        }
      },
      [viamClientContext.client?.appClient, setOrganizationFragments]
    );

    return { loading, error, fetchFragmentsAndSetInAppStore };
  };

export default useListViamOrganizationFragments;
