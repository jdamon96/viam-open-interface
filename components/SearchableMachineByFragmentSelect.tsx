// components/SearchableMachineByFragmentSelect.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import SearchableMultiSelect from "./SearchableMultiSelect";
import useMachinesByFragment from "@/hooks/useMachinesByFragment";
import { Fragment } from "@/hooks/useListViamOrganizationFragments";
import { Label } from "./ui/label";

interface SearchableMachineByFragmentSelectProps {
  fragments: Fragment[];
  fragmentsLoading?: boolean;
  onMachinesSelected: (selectedMachines: string[]) => void;
}
// Utility function to parse fragment ID from the fragment value
const parseFragmentId = (fragmentValue: string): string => {
  const parts = fragmentValue.split(".");
  return parts[parts.length - 1];
};

const SearchableMachineByFragmentSelect: React.FC<
  SearchableMachineByFragmentSelectProps
> = ({ fragments, fragmentsLoading = false, onMachinesSelected }) => {
  // State to manage selected fragment IDs (single selection)
  const [selectedFragmentIds, setSelectedFragmentIds] = useState<string[]>([]);

  // Extract the single selected fragment ID
  const selectedFragmentId = parseFragmentId(selectedFragmentIds[0] || "");

  // Use the custom hook to fetch machines associated with the selected fragment
  const {
    loading: machinesByFragmentLoading,
    error,
    machines,
  } = useMachinesByFragment(selectedFragmentId);

  // Transform fragments into options for the Select component
  const fragmentOptions = useMemo(
    () =>
      fragments.map((fragment) => ({
        value: fragment.name + "." + fragment.id, // adding fragment.name is a hack to let search work, but means we need to remove it when getting the value
        label: fragment.name,
        sublabel: (
          <span className="text-xs text-gray-700">
            {fragment.robotPartCount} configured{" "}
            {fragment.robotPartCount === 1 ? "machine" : "machines"}
          </span>
        ),
      })),
    [fragments]
  );

  /**
   * Handler for when the selected fragments change.
   * Enforces single selection by keeping only the most recently selected fragment.
   *
   * @param selectedIds - Array of selected fragment IDs
   */
  const handleFragmentChange = useCallback((selectedIds: string[]) => {
    if (selectedIds.length > 1) {
      // If multiple fragments are selected, keep only the last one
      setSelectedFragmentIds([selectedIds[selectedIds.length - 1]]);
    } else {
      setSelectedFragmentIds(selectedIds);
    }
  }, []);

  // Effect to call onMachinesSelected whenever machines change
  useEffect(() => {
    if (selectedFragmentId) {
      const machineIds = machines.map((machine) => machine.id);
      console.log(
        "Setting selected machines for selected fragment id " +
          selectedFragmentId +
          ":",
        machineIds
      );
      onMachinesSelected(machineIds);
    } else {
      console.log("Clearing selected machines.");
      onMachinesSelected([]);
    }
  }, [machines, selectedFragmentId, onMachinesSelected]);

  return (
    <div className="space-y-2">
      <Label>Select a Configuration Fragment</Label>
      <SearchableMultiSelect
        options={fragmentOptions}
        placeholder="Search and select a fragment..."
        onChange={handleFragmentChange}
        selectedOptionIds={selectedFragmentIds}
        loading={fragmentsLoading}
      />

      {error && (
        <p className="text-red-500">
          Error: {error.message || "Failed to load machines."}
        </p>
      )}
      {/* {!loading && selectedFragmentId && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {machines.length} machine(s) associated with the selected fragment.
          </p>
        </div>
      )} */}
    </div>
  );
};

export default SearchableMachineByFragmentSelect;
