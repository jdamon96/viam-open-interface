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

const SearchableMachineByFragmentSelect: React.FC<
  SearchableMachineByFragmentSelectProps
> = ({ fragments, fragmentsLoading = false, onMachinesSelected }) => {
  // State to manage selected fragment IDs (single selection)
  const [selectedFragmentIds, setSelectedFragmentIds] = useState<string[]>([]);

  // Extract the single selected fragment ID
  const selectedFragmentId = selectedFragmentIds[0] || "";

  // Use the custom hook to fetch machines associated with the selected fragment
  const { loading, error, machines } =
    useMachinesByFragment(selectedFragmentId);

  // Transform fragments into options for the Select component
  const fragmentOptions = useMemo(
    () =>
      fragments.map((fragment) => ({
        value: fragment.name + fragment.id,
        label: fragment.name,
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
      onMachinesSelected(machineIds);
    } else {
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
      />
      {fragmentsLoading && (
        <p className="text-blue-500">Loading fragments...</p>
      )}
      {error && (
        <p className="text-red-500">
          Error: {error.message || "Failed to load machines."}
        </p>
      )}
      {!loading && selectedFragmentId && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {machines.length} machine(s) associated with the selected fragment.
          </p>
        </div>
      )}
      {loading && selectedFragmentId && (
        <p className="text-blue-500">Loading machines...</p>
      )}
    </div>
  );
};

export default SearchableMachineByFragmentSelect;
