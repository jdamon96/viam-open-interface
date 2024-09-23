import React, { createContext, useState } from "react";
import {
  ViamClient,
  ViamClientOptions,
  createViamClient,
} from "@viamrobotics/sdk";
import { LOCALSTORAGE_API_KEY } from "./CustomDashboard";

// Create a context for the ViamClient, the triggerClientConnection function, and the isConnectingClient state
export const ViamClientContext = createContext<{
  client: ViamClient | undefined;
  triggerClientConnection: () => Promise<void>;
  connectionError: string;
}>({
  client: undefined,
  triggerClientConnection: async () => {},
  connectionError: "",
});

// This is a provider component for the ViamClient context
export const ViamClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State for the ViamClient
  const [client, setClient] = useState<ViamClient>();
  const [connectionError, setConnectionError] = useState<string>("");

  const triggerClientConnection = async () => {
    const connectClient = async () => {
      console.log(
        "Attempting to retrieve API key configuration from localStorage..."
      );
      const storedConfig = localStorage.getItem(LOCALSTORAGE_API_KEY);
      if (!storedConfig) {
        const errorMsg = "API key configuration not found in localStorage";
        console.error(errorMsg);
        setConnectionError(errorMsg);
        return;
      }

      console.log("API key configuration found, parsing...");
      const { key: apiKeySecret, id: apiKeyId } = JSON.parse(storedConfig);

      const opts: ViamClientOptions = {
        credential: {
          type: "api-key",
          authEntity: apiKeyId,
          payload: apiKeySecret,
        },
      };

      console.log("Creating Viam client with options:", opts);
      try {
        const client = await createViamClient(opts);
        console.debug("Viam client created successfully:", client);
        setClient(client);
      } catch (error) {
        console.error("Error creating Viam client:", error);
        //@ts-ignore
        if (error.message) {
          //@ts-ignore
          setConnectionError(error.message);
        }
      }
    };

    // Connect the client and handle any errors
    return await connectClient().catch(console.error);
  };

  // Provide the ViamClient, the triggerClientConnection function, and the isConnectingClient state in the context to children components
  return (
    <ViamClientContext.Provider
      value={{
        client,
        triggerClientConnection,
        connectionError,
      }}
    >
      {children}
    </ViamClientContext.Provider>
  );
};
