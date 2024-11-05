"use client";
import React, { FC, useContext, useEffect, useState } from "react";
import { ViamClientContext } from "./ViamClientProvider";
import useAppStore from "@/store/zustand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { CheckIcon, RotateCcw, XIcon } from "lucide-react";

interface ClientStatusIndicatorProps {
  // Define props and propTypes here
}

const ClientStatusIndicator: FC<ClientStatusIndicatorProps> = (props) => {
  const viamClientContext = useContext(ViamClientContext);
  const { setConfig, setApiKey, setApiKeyId } = useAppStore();
  const [connectingToClient, setConnectingToClient] = useState<boolean>(false);

  const triggerClientConnectionHandler = async () => {
    setConnectingToClient(true);
    const client = await viamClientContext.triggerClientConnection();
    setConnectingToClient(false);
  };

  useEffect(() => {
    if (!viamClientContext.client) {
      triggerClientConnectionHandler();
    }
  }, []);

  const handleResetConfig = () => {
    // Clear all app state
    useAppStore.getState().clearAllState();

    // Force a page reload to ensure all components re-initialize
    window.location.reload();
  };

  useEffect(() => {
    // Example of reading from the Zustand store
    const storedApiKey = useAppStore.getState().apiKey;
    if (!storedApiKey) {
      triggerClientConnectionHandler();
    }
  }, [useAppStore]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-white border border-gray-200 text-black px-3 py-1 rounded-sm hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 ease-in-out flex items-center"
          onClick={triggerClientConnectionHandler}
        >
          {connectingToClient ? (
            <span>Loading...</span>
          ) : (
            <span className="relative flex h-2 w-2 mr-2">
              {viamClientContext.client ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              )}
            </span>
          )}
          Viam Client Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-4 space-y-2 flex flex-col items-center justify-center mr-4">
        {viamClientContext.client ? (
          <div className="flex items-center space-x-2">
            <CheckIcon className="text-green-500 h-4 w-4" />
            <p className="">Viam client is connected.</p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <XIcon className="text-red-500 h-4 w-4" />
            <p className="">No client connected.</p>
          </div>
        )}
        <div className="pt-2 flex flex-col space-y-2">
          {!viamClientContext.client && (
            <Button
              onClick={triggerClientConnectionHandler}
              className="w-full"
              variant={"secondary"}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reconnect Viam Client
            </Button>
          )}
          <Button
            onClick={handleResetConfig}
            variant={"secondary"}
            className="w-full"
          >
            <XIcon className="mr-2 h-4 w-4" />
            Reset API Key Connection
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClientStatusIndicator;
