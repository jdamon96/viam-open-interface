// GroupOfMachinesConfigurationForm.tsx

import React, { useState, useMemo, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import SearchableMultiSelect from "@/components/SearchableMultiSelect";
import SearchableMachineByFragmentSelect from "./SearchableMachineByFragmentSelect";

import { Robot } from "@/hooks/useListViamRobots";
import { Fragment } from "@/hooks/useListViamOrganizationFragments";
import { DataCard } from "@/store/zustand";
import { Badge } from "./ui/badge";

interface GroupOfMachinesConfigurationFormProps {
  card: DataCard;
  locationMachines: Robot[];
  selectedGroupMachinesIds: string[];
  onMachinesSelected: (selectedMachines: string[]) => void;
  onFragmentSelected: (selectedFragmentId: string | null) => void;
  fragments: Fragment[];
  fragmentsLoading?: boolean;
}

const GroupOfMachinesConfigurationForm: React.FC<
  GroupOfMachinesConfigurationFormProps
> = ({
  card,
  locationMachines,
  selectedGroupMachinesIds,
  onMachinesSelected,
  onFragmentSelected,
  fragments,
  fragmentsLoading,
}) => {
  const [selectionType, setSelectionType] = useState<"specific" | "fragment">(
    card?.groupFragment == null ? "specific" : "fragment"
  );

  const [selectedMachines, setSelectedMachines] = useState<string[]>(
    selectedGroupMachinesIds
  );
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(
    card?.groupFragment ? card.groupFragment : null
  );

  // Memoize machine options
  const machines = useMemo(
    () =>
      locationMachines.map((machine) => ({
        value: machine.id,
        label: machine.name,
      })),
    [locationMachines]
  );

  // Memoize handler to prevent re-renders
  const handleSelectionTypeChange = useCallback(
    (value: "specific" | "fragment") => {
      setSelectionType(value);
      setSelectedMachines([]);
      onMachinesSelected([]);
      setSelectedFragmentId(null);
      onFragmentSelected(null);
    },
    [onMachinesSelected, onFragmentSelected]
  );

  // Handler for fragment selection
  const handleGroupOfMachinesFragmentSelection = useCallback(
    (fragmentId: string | null, selectedMachinesIds: string[]) => {
      onFragmentSelected(fragmentId);
      setSelectedMachines(selectedMachinesIds);
      onMachinesSelected(selectedMachinesIds);
    },
    [onMachinesSelected]
  );

  return (
    <div className="w-full space-y-6 py-4">
      <RadioGroup
        value={selectionType}
        onValueChange={handleSelectionTypeChange}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="specific" id="specific" />
          <Label htmlFor="specific">Choose specific machines</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fragment" id="fragment" disabled />
          <Label htmlFor="fragment" className="text-gray-400">
            Choose machines by configuration fragment
          </Label>
          <Badge variant="outline" className="ml-2">
            Coming Soon
          </Badge>
        </div>
      </RadioGroup>

      {selectionType === "specific" && (
        <SearchableMultiSelect
          options={machines}
          placeholder="Select machines..."
          onChange={(selected) => {
            setSelectedMachines(selected);
            onMachinesSelected(selected);
          }}
          selectedOptionIds={selectedGroupMachinesIds}
        />
      )}

      {selectionType === "fragment" && (
        <SearchableMachineByFragmentSelect
          fragments={fragments}
          fragmentsLoading={fragmentsLoading}
          onFragmentSelected={handleGroupOfMachinesFragmentSelection}
          initSelectedFragmentId={selectedFragmentId}
        />
      )}

      {selectedMachines.length > 0 && (
        <div className="mt-4">
          <Label>Selected Machines ({selectedMachines.length}):</Label>
          <div className="flex flex-wrap space-x-2 w-full items-center justify-start mt-2">
            {selectedMachines.slice(0, 10).map((machine) => (
              <Badge
                key={machine}
                variant="outline"
                className="mb-2 font-normal"
              >
                {machine}
              </Badge>
            ))}
            {selectedMachines.length > 10 && (
              <Badge variant="outline" className="mb-2 font-normal">
                +{selectedMachines.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOfMachinesConfigurationForm;
