"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { CheckIcon, MapPin, ChevronsUpDown } from "lucide-react";
import useListViamLocations from "@/hooks/useListViamLocations";
import useAppStore from "@/store/zustand";

const CaretSortIcon = ({ className }: { className?: string }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    className={className}
  >
    <path
      d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);

interface Location {
  id: string;
  name: string;
  // Add other relevant fields if necessary
}

interface LocationSwitcherProps {
  className?: string;
}

export default function LocationSwitcher({ className }: LocationSwitcherProps) {
  const { loading, error, fetchLocationsAndSetInAppStore } =
    useListViamLocations();

  const {
    currentlySelectedLocation,
    setCurrentlySelectedLocation,
    availableLocations,
    currentlySelectedOrganization,
  } = useAppStore();

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (currentlySelectedOrganization) {
      fetchLocationsAndSetInAppStore(currentlySelectedOrganization.id);
    }
  }, [fetchLocationsAndSetInAppStore, currentlySelectedOrganization]);

  useEffect(() => {
    if (availableLocations.length > 0 && !currentlySelectedLocation) {
      setCurrentlySelectedLocation(availableLocations[0]);
    }
  }, [
    availableLocations,
    currentlySelectedLocation,
    setCurrentlySelectedLocation,
  ]);

  const handleLocationSelect = (loc: Location) => {
    setCurrentlySelectedLocation(loc);
    setOpen(false);
    // Add any additional logic needed when a location is selected
  };

  const filteredLocations = availableLocations.filter((loc) =>
    loc.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a location"
          className={cn("justify-between space-x-2", className)}
        >
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <p className="font-normal max-w-[100px] sm:max-w-[150px] truncate">
              {currentlySelectedLocation?.name || (
                <span className="text-gray-500">Select Location</span>
              )}
            </p>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Search location..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup heading="Locations">
              {loading ? (
                <Skeleton className="h-8 w-full" />
              ) : error ? (
                <CommandItem disabled>Error loading locations</CommandItem>
              ) : filteredLocations && filteredLocations.length > 0 ? (
                filteredLocations
                  .sort((a, b) => {
                    const robotCountA = "robotCount" in a ? a.robotCount : 0;
                    const robotCountB = "robotCount" in b ? b.robotCount : 0;
                    return (robotCountB ?? 0) - (robotCountA ?? 0);
                  })
                  .map((loc) => (
                    <CommandItem
                      key={loc.id}
                      onSelect={() => handleLocationSelect(loc)}
                      className="text-sm hover:cursor-pointer text-gray-900"
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="">
                          {loc.name} ({"robotCount" in loc ? loc.robotCount : 0}{" "}
                          machines)
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          currentlySelectedLocation?.id === loc.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))
              ) : (
                <CommandItem disabled>No locations available</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
