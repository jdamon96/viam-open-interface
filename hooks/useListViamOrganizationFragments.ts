import { useContext, useCallback, useState } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";
import useAppStore from "@/store/zustand";
import { ViamClient } from "@viamrobotics/sdk";

export interface Fragment {
  id: string;
  name: string;
  createdOn: {
    nanos: number;
    seconds: number;
  };
  onlyUsedByOwner: boolean;
  organizationCount: number;
  organizationName: string;
  organizationOwner: string;
  public: boolean;
  robotPartCount: number;
  visibility: number;
  fields: {
    components: Record<string, unknown>;
    services: Record<string, unknown>;
  };
}

interface UseListViamOrganizationFragmentsResult {
  loading: boolean;
  error?: Error;
  fetchFragmentsAndSetInAppStore: (
    orgId: string,
    locId: string,
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
    const {
      organizationFragments,
      setOrganizationFragments,
      setFragmentToMachinesMap,
    } = useAppStore();
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
        await viamClientContext.triggerClientConnection();
      }

      if (!viamClientContext.client?.appClient) {
        const errorMsg =
          "[useListViamOrganizationFragments - getAllOrgFragments]: Viam app client is not initialized.";
        throw new Error(errorMsg);
      }

      try {
        const fragments =
          await viamClientContext.client.appClient.listFragments(orgId, false, [
            0,
          ]);
        //@ts-ignore
        return fragments || [];
      } catch (error) {
        return [];
      }
    };

    /**
     * Fetches the list of fragments in use by the location's machines.
     *
     * @param {string} locId - The ID of the location to list fragments for.
     * @returns {Promise<Fragment[]>} - A promise that resolves to the list of fragments.
     */
    const getAllFragmentsInUseByLocationMachines = async (
      locId: string
    ): Promise<Fragment[]> => {
      let fragmentsInUseByLocationMachines: Fragment[] = [];

      // step 1: Fetch all machines associated with the location
      const machines = await viamClientContext?.client?.appClient?.listRobots(
        locId
      );

      // step 2: Fetch all fragments associated with the machines
      if (machines) {
        for (const machine of machines) {
          const machineFragments =
            await viamClientContext?.client?.appClient?.listMachineFragments(
              machine.id
            );
          //@ts-ignore
          fragmentsInUseByLocationMachines = [
            ...fragmentsInUseByLocationMachines,
            ...(machineFragments ?? []),
          ];
        }
      }

      // step 3: Return the list of fragments associated with the machines
      return fragmentsInUseByLocationMachines;
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
      let fragmentsInUseByOrgMachines: Fragment[] = [];

      // step 1: Fetch all locations associated with the organization
      const locations =
        await viamClientContext?.client?.appClient?.listLocations(orgId);

      // step 2: Fetch all fragments associated with the locations' machines
      if (locations) {
        for (const location of locations) {
          const locationFragments =
            await getAllFragmentsInUseByLocationMachines(location.id);
          fragmentsInUseByOrgMachines = [
            ...fragmentsInUseByOrgMachines,
            ...locationFragments,
          ];
        }
      }

      // step 3: Return the list of fragments associated with the organization's machines
      return fragmentsInUseByOrgMachines;
    };

    /**
     * Fetches the list of all fragments associated with the organization.
     *
     * @param {string} orgId - The ID of the organization to list fragments for.
     */
    const fetchFragmentsAndSetInAppStore = useCallback(
      async (orgId: string, locId: string) => {
        setLoading(true);
        setError(undefined);
        setOrganizationFragments([]);
        setFragmentToMachinesMap({}); // Reset the mapping

        try {
          const orgFragments = await getAllOrgFragments(orgId);
          const fragmentsInUseByOrgMachines =
            await getAllFragmentsInUseByLocationMachines(locId);

          const allOrgAssociatedFragments = [
            ...orgFragments,
            ...fragmentsInUseByOrgMachines,
          ];

          const uniqueOrgAssociatedFragments = Array.from(
            new Set(allOrgAssociatedFragments.map((fragment) => fragment.id))
          )
            .map((id) =>
              allOrgAssociatedFragments.find((fragment) => fragment.id === id)
            )
            .filter((fragment): fragment is Fragment => fragment !== undefined);

          // Build the fragment to machines mapping
          const fragmentToMachinesMap: Record<string, string[]> = {};

          // Fetch all machines associated with the location
          const machines =
            await viamClientContext?.client?.appClient?.listRobots(locId);

          if (machines) {
            for (const machine of machines) {
              const machineFragments =
                await viamClientContext?.client?.appClient?.listMachineFragments(
                  machine.id
                );
              if (machineFragments) {
                machineFragments.forEach((fragment: any) => {
                  if (!fragmentToMachinesMap[fragment.id]) {
                    fragmentToMachinesMap[fragment.id] = [];
                  }
                  fragmentToMachinesMap[fragment.id].push(machine.id);
                });
              }
            }
          }

          setOrganizationFragments(uniqueOrgAssociatedFragments);
          setFragmentToMachinesMap(fragmentToMachinesMap);
        } catch (err: any) {
          setError(err);
        } finally {
          setLoading(false);
        }
      },
      [
        viamClientContext.client?.appClient,
        setOrganizationFragments,
        setFragmentToMachinesMap,
      ]
    );

    return { loading, error, fetchFragmentsAndSetInAppStore };
  };

export default useListViamOrganizationFragments;
