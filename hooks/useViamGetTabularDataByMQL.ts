// useViamGetTabularDataByMQL.ts

import { useState, useContext, useCallback } from "react";
import { BSON } from "bsonfy";
import { ViamClientContext } from "@/components/ViamClientProvider";

// Define the structure of the hook's return type
interface UseViamGetTabularDataByMQLResult<T = any> {
  data?: T[];
  loading: boolean;
  error?: Error;
  fetchTabularData: (orgId: string, mqlStages: object[]) => Promise<void>;
}

/**
 * Custom hook to execute arbitrary MQL queries using Viam's tabularDataByMQL API.
 *
 * @returns {UseViamGetTabularDataByMQLResult} An object containing data, loading, error, and fetchTabularData function.
 */
const useViamGetTabularDataByMQL = <
  T = any
>(): UseViamGetTabularDataByMQLResult<T> => {
  const viamClientContext = useContext(ViamClientContext);
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * Executes the provided MQL query against the specified organization.
   *
   * @param {string} orgId - The ID of the organization.
   * @param {object[]} mqlStages - An array of MQL query stages.
   */
  const fetchTabularData = useCallback(
    async (orgId: string, mqlStages: object[]) => {
      if (!viamClientContext?.client?.dataClient) {
        setError(new Error("Viam data client is not initialized."));
        return;
      }

      setLoading(true);
      setError(undefined);
      setData(undefined);

      try {
        // Serialize each MQL stage to BSON
        const bsonQuery = mqlStages.map((stage) => BSON.serialize(stage));

        // Execute the MQL query
        const response =
          await viamClientContext.client.dataClient.tabularDataByMQL(
            orgId,
            bsonQuery
          );

        setData(response as T[]);
      } catch (err: any) {
        console.error("Error fetching tabular data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [viamClientContext.client?.dataClient]
  );

  return { data, loading, error, fetchTabularData };
};

export default useViamGetTabularDataByMQL;
