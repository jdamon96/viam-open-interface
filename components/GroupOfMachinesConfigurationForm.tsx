// GroupOfMachinesConfigurationForm.tsx

import React, { useState, useMemo, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import SearchableMultiSelect from "@/components/SearchableMultiSelect";
import SearchableMachineByFragmentSelect from "./SearchableMachineByFragmentSelect";

import { Robot } from "@/hooks/useListViamRobots";
import { Fragment } from "@/hooks/useListViamOrganizationFragments";
import { DataCard } from "@/store/zustand";

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
  console.log(card?.groupFragment);
  const [selectionType, setSelectionType] = useState<"specific" | "fragment">(
    card?.groupFragment !== null || card?.groupFragment !== undefined
      ? "fragment"
      : "specific"
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
    <div className="w-full max-w-md space-y-6 py-4">
      <RadioGroup
        value={selectionType}
        onValueChange={handleSelectionTypeChange}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="specific" id="specific" />
          <Label htmlFor="specific">Choose specific machines</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fragment" id="fragment" />
          <Label htmlFor="fragment" className="">
            Choose machines by configuration fragment
          </Label>
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
          <Label>Selected Machines:</Label>
          <p className="text-xs">
            {selectedMachines.length} machine(s) selected
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupOfMachinesConfigurationForm;
