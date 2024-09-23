// components/OrganizationSwitcher.tsx

"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { CheckIcon, Users } from "lucide-react";
import useListViamOrganizations from "@/hooks/useListViamOrganizations";
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

interface Organization {
  id: string;
  name: string;
  // Add other relevant fields if necessary
}

interface OrganizationSwitcherProps {
  className?: string;
}

export default function OrganizationSwitcher({
  className,
}: OrganizationSwitcherProps) {
  const { loading, error, fetchOrganizationsAndSetInAppStore } =
    useListViamOrganizations();

  const {
    currentlySelectedOrganization,
    setCurrentlySelectedOrganization,
    availableOrganizations,
  } = useAppStore();

  useEffect(() => {
    fetchOrganizationsAndSetInAppStore();
  }, [fetchOrganizationsAndSetInAppStore]);

  useEffect(() => {
    if (availableOrganizations.length > 0 && !currentlySelectedOrganization) {
      setCurrentlySelectedOrganization(availableOrganizations[0]);
    }
  }, [
    availableOrganizations,
    currentlySelectedOrganization,
    setCurrentlySelectedOrganization,
  ]);

  const handleOrganizationSelect = (org: Organization) => {
    setCurrentlySelectedOrganization(org);
    // Add any additional logic needed when an organization is selected
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={false}
          aria-label="Select an organization"
          className={cn("justify-between space-x-2", className)}
        >
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <p className="font-normal max-w-[100px] sm:max-w-[150px] truncate">
              {currentlySelectedOrganization?.name || (
                <span className="text-gray-500">Select Organization</span>
              )}
            </p>
          </div>
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            <CommandGroup heading="Organizations">
              {loading ? (
                <Skeleton className="h-8 w-full" />
              ) : error ? (
                <CommandItem disabled>Error loading organizations</CommandItem>
              ) : availableOrganizations &&
                availableOrganizations.length > 0 ? (
                availableOrganizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleOrganizationSelect(org)}
                    className="text-sm hover:cursor-pointer text-gray-900 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <Users className="h-4 w-4" />
                      <div className="flex flex-col space-y-1">
                        <span className="max-w-[100px] sm:max-w-[150px] truncate">
                          {org.name}
                        </span>
                        {/* <small className="text-gray-500">{org.id}</small> */}
                      </div>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-4 h-4 w-4",
                        currentlySelectedOrganization?.id === org.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No organizations available</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
