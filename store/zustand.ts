import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DateRange } from "react-day-picker";
import { AggregationStage } from "@/types/AggregationStage";
import { Fragment } from "@/hooks/useListViamOrganizationFragments";

export interface DataCard {
  id: string;
  orgId: string;
  locId: string;
  title: string;
  robotId: string;
  dataSource: string;
  aggregationStages: any[];
  visualizationType: string;
  dateRange?: DateRange;
  groupMachines?: string[]; // Array of machine IDs
  groupFragment?: string | null; // Selected fragment ID
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface SupplementedLocation extends Location {
  robotCount?: number;
}

export interface Machine {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface AppState {
  availableOrganizations: Organization[];
  setAvailableOrganizations: (organizations: Organization[]) => void;
  availableLocations: (Location | SupplementedLocation)[];
  setAvailableLocations: (
    locations: (Location | SupplementedLocation)[]
  ) => void;
  currentlySelectedOrganization: Organization | null;
  setCurrentlySelectedOrganization: (organization: Organization | null) => void;
  currentlySelectedLocation: Location | null;
  setCurrentlySelectedLocation: (location: Location | null) => void;
  locationMachines: Machine[];
  setLocationMachines: (machines: Machine[]) => void;
  organizationFragments: Fragment[];
  setOrganizationFragments: (fragments: Fragment[]) => void;
  fragmentToMachinesMap: Record<string, string[]>; // Map of fragment ID to machine IDs
  setFragmentToMachinesMap: (map: Record<string, string[]>) => void;
  config: ViamConfig | null;
  setConfig: (config: ViamConfig | null) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  apiKeyId: string;
  setApiKeyId: (apiKeyId: string) => void;
  cards: DataCard[];
  setCards: (cards: DataCard[]) => void;
  loadStateFromJson: (state: Partial<AppState>) => void;
  clearAllState: () => void;
}

interface ViamConfig {
  key: string;
  id: string;
}

const useAppStore = create(
  persist<AppState>(
    (set) => ({
      availableOrganizations: [],
      setAvailableOrganizations: (organizations) =>
        set({ availableOrganizations: organizations }),
      availableLocations: [],
      setAvailableLocations: (locations) =>
        set({ availableLocations: locations }),
      currentlySelectedOrganization: null,
      setCurrentlySelectedOrganization: (organization) =>
        set({ currentlySelectedOrganization: organization }),
      currentlySelectedLocation: null,
      setCurrentlySelectedLocation: (location) =>
        set({ currentlySelectedLocation: location }),
      locationMachines: [],
      setLocationMachines: (machines) => set({ locationMachines: machines }),
      organizationFragments: [],
      setOrganizationFragments: (fragments) =>
        set({ organizationFragments: fragments }),
      fragmentToMachinesMap: {},
      setFragmentToMachinesMap: (map) => set({ fragmentToMachinesMap: map }),
      config: null,
      setConfig: (config) => set({ config }),
      apiKey: "",
      setApiKey: (apiKey) => set({ apiKey }),
      apiKeyId: "",
      setApiKeyId: (apiKeyId) => set({ apiKeyId }),
      cards: [],
      setCards: (cards) => set({ cards }),
      loadStateFromJson: (state) => set(state),
      clearAllState: () =>
        set({
          availableOrganizations: [],
          availableLocations: [],
          currentlySelectedOrganization: null,
          currentlySelectedLocation: null,
          locationMachines: [],
          organizationFragments: [],
          fragmentToMachinesMap: {},
          config: null,
          apiKey: "",
          apiKeyId: "",
          cards: [],
        }),
    }),
    {
      name: "custom-viam-dashboards-app-storage",
    }
  )
);

export default useAppStore;
