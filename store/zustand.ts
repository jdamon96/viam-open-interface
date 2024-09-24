import { create } from "zustand";

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
  config: ViamConfig | null;
  setConfig: (config: ViamConfig | null) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  apiKeyId: string;
  setApiKeyId: (apiKeyId: string) => void;
}

interface ViamConfig {
  key: string;
  id: string;
}

const useAppStore = create<AppState>((set) => ({
  availableOrganizations: [],
  setAvailableOrganizations: (organizations) =>
    set({ availableOrganizations: organizations }),
  availableLocations: [],
  setAvailableLocations: (locations) => set({ availableLocations: locations }),
  currentlySelectedOrganization: null,
  setCurrentlySelectedOrganization: (organization) =>
    set({ currentlySelectedOrganization: organization }),
  currentlySelectedLocation: null,
  setCurrentlySelectedLocation: (location) =>
    set({ currentlySelectedLocation: location }),
  locationMachines: [],
  setLocationMachines: (machines) => set({ locationMachines: machines }),
  config: null,
  setConfig: (config) => set({ config }),
  apiKey: "",
  setApiKey: (apiKey) => set({ apiKey }),
  apiKeyId: "",
  setApiKeyId: (apiKeyId) => set({ apiKeyId }),
}));

export default useAppStore;
