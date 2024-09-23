import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// viamClient.ts

export interface ViamConfig {
  key: string;
  id: string;
}

export const initializeViamClient = async (config: ViamConfig) => {
  const VIAM = await import("@viamrobotics/sdk");
  const robot = await VIAM.createRobotClient({
    host: "thermo-main.jfep7z3w9l.viam.cloud", // Replace with your actual host or make it configurable
    credential: {
      type: "api-key",
      payload: config.key,
    },
    authEntity: config.id,
    signalingAddress: "https://app.viam.com:443",
  });
  return new VIAM.ServoClient(robot, "thermo-dial"); // Adjust the servo name as needed
};
