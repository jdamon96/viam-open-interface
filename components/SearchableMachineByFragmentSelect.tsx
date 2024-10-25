// components/SearchableMachineByFragmentSelect.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback, use } from "react";
import SearchableMultiSelect from "./SearchableMultiSelect";
import useMachinesByFragment from "@/hooks/useMachinesByFragment";
import { Fragment } from "@/hooks/useListViamOrganizationFragments";
import { Label } from "./ui/label";

interface SearchableMachineByFragmentSelectProps {
  fragments: Fragment[];
  fragmentsLoading?: boolean;
  onFragmentSelected: (
    fragmentId: string | null,
    selectedMachines: string[]
  ) => void;
  initSelectedFragmentId?: string | null; // Add selectedFragmentId prop
}

const SearchableMachineByFragmentSelect: React.FC<
  SearchableMachineByFragmentSelectProps
> = ({
  fragments,
  fragmentsLoading = false,
  onFragmentSelected,
  initSelectedFragmentId,
}) => {
  // Initialize selectedFragmentIds with selectedFragmentId if provided
  const [selectedFragmentId, setSelectedFragmentId] = useState<string[]>(
    initSelectedFragmentId ? [initSelectedFragmentId] : []
  );
  const [
    machinesConfiguredBySelectedFragment,
    setMachinesConfiguredBySelectedFragment,
  ] = useState<string[]>([]);

  // Extract the single selected fragment ID
  // const selectedFragmentId = parseFragmentId(selectedFragmentIds[0] || "");

  // Use the custom hook to fetch machines associated with the selected fragment
  const { loading, fetchMachinesByFragment } = useMachinesByFragment();

  useEffect(() => {
    if (selectedFragmentId.length > 0) {
      console.log(
        "Fetching machines for selected fragment id:",
        selectedFragmentId[0]
      );
      fetchMachinesByFragment(selectedFragmentId[0]).then((machines) => {
        const machineIds = machines.map((machine) => machine.id);
        console.log(
          "Setting machines configured by selected fragment:",
          machineIds.length
        );
        setMachinesConfiguredBySelectedFragment(machineIds);
        onFragmentSelected(
          selectedFragmentId[0],
          machinesConfiguredBySelectedFragment
        );
      });
    }
  }, [selectedFragmentId, fetchMachinesByFragment]);

  // Transform fragments into options for the Select component
  const fragmentOptions = useMemo(
    () =>
      fragments.map((fragment) => ({
        value: fragment.id, // adding fragment.name is a hack to let search work, but means we need to remove it when getting the value
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
  const handleFragmentChange = useCallback(
    (selectedId: string[]) => {
      setSelectedFragmentId(selectedId);
      // this will trigger the useEffect to fetch machines
      // and call onFragmentSelected with the selected fragment ID + list of machine IDs of machines configured by that fragment
    },
    [machinesConfiguredBySelectedFragment, onFragmentSelected]
  );

  return (
    <div className="space-y-2 max-w-md">
      <Label>Select a Configuration Fragment</Label>
      <SearchableMultiSelect
        options={fragmentOptions}
        placeholder="Search and select a fragment..."
        onChange={handleFragmentChange}
        selectedOptionIds={selectedFragmentId}
        loading={fragmentsLoading}
      />

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
