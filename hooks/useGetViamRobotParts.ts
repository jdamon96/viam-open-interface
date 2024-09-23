// useGetViamRobotParts.ts

import { useState, useContext, useCallback } from "react";
import { ViamClientContext } from "@/components/ViamClientProvider";

// Define the structure of the RobotPart object based on appApi.RobotPart.AsObject
interface RobotPart {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  // Add other relevant fields based on your API response
}

interface UseGetViamRobotPartsResult {
  robotParts?: RobotPart[];
  loading: boolean;
  error?: Error;
  fetchRobotParts: (robotId: string) => Promise<void>;
}

/**
 * Custom hook to fetch robot parts using Viam's getRobotParts API.
 *
 * @returns {UseGetViamRobotPartsResult} An object containing robot parts, loading state, error, and a function to fetch robot parts.
 */
const useGetViamRobotParts = (): UseGetViamRobotPartsResult => {
  const viamClientContext = useContext(ViamClientContext);
  const [robotParts, setRobotParts] = useState<RobotPart[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  /**
   * Fetches the list of robot parts for a given robot ID using Viam's getRobotParts API.
   *
   * @param {string} robotId - The ID of the robot to query.
   */
  const fetchRobotParts = useCallback(
    async (robotId: string) => {
      console.debug("fetchRobotParts called with robotId:", robotId);

      if (!viamClientContext.client?.appClient) {
        const errorMsg = "Viam AppClient is not initialized.";
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      if (!robotId) {
        const errorMsg = "Robot ID is required to fetch robot parts.";
        console.error(errorMsg);
        setError(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(undefined);
      setRobotParts(undefined);

      try {
        console.log("Fetching robot parts for robot ID:", robotId);
        const fetchedParts =
          await viamClientContext.client.appClient.getRobotParts(robotId);
        if (fetchedParts && fetchedParts.length > 0) {
          console.log("Robot parts fetched successfully:", fetchedParts);
          setRobotParts(fetchedParts);
        } else {
          const errorMsg = "No robot parts found for the specified robot.";
          console.warn(errorMsg);
          setError(new Error(errorMsg));
        }
      } catch (err: any) {
        console.error("Error fetching robot parts:", err);
        setError(err);
      } finally {
        setLoading(false);
        console.log("fetchRobotParts completed");
      }
    },
    [viamClientContext.client?.appClient]
  );

  return { robotParts, loading, error, fetchRobotParts };
};

export default useGetViamRobotParts;
