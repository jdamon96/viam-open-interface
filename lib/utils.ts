import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ViamConfig {
  key: string;
  id: string;
}

interface Value {
  nullValue?: number;
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
  listValue?: {
    valuesList: Value[];
  };
  structValue?: {
    fieldsMap: [string, Value][];
  };
}

interface Component {
  id: string;
  name: string;
  type: string;
  [key: string]: any; // To accommodate additional fields if needed
}

/**
 * Parses the given response and returns a list of components configured with the 'data_manager' service.
 * @param response - The JSON response to parse.
 * @returns An array of components with 'data_manager' service configured.
 */
export function parseComponentsWithDataManager(
  response: any | any[]
): Component[] {
  // If response is a single object, wrap it in an array for uniform processing
  const items: any[] = Array.isArray(response) ? response : [response];

  const componentsWithDataManager: Component[] = [];

  // Helper function to parse a single Value object
  function parseValue(value: Value): any {
    // Prioritize structValue and listValue
    if (value.structValue && value.structValue.fieldsMap.length > 0) {
      return parseFieldsMap(value.structValue.fieldsMap);
    }

    if (value.listValue && Array.isArray(value.listValue.valuesList)) {
      return value.listValue.valuesList.map(parseValue);
    }

    if (value.stringValue !== undefined && value.stringValue !== "") {
      return value.stringValue;
    }

    if (value.numberValue !== undefined && value.numberValue !== 0) {
      return value.numberValue;
    }

    if (value.boolValue !== undefined) {
      return value.boolValue;
    }

    if (value.nullValue !== undefined && value.nullValue !== 0) {
      return null;
    }

    // If none of the above, return undefined
    return undefined;
  }

  // Helper function to parse fieldsMap into an object
  function parseFieldsMap(fieldsMap: [string, Value][]): {
    [key: string]: any;
  } {
    const obj: { [key: string]: any } = {};
    for (const [key, value] of fieldsMap) {
      obj[key] = parseValue(value);
    }
    return obj;
  }

  for (const item of items) {
    // Parse the main object's fieldsMap if present
    // In the provided JSON, the top-level object doesn't have a fieldsMap,
    // so we can access properties directly.

    const robotConfig = item.robotConfig;
    if (!robotConfig || !robotConfig.fieldsMap) continue;

    const parsedRobotConfig = parseFieldsMap(robotConfig.fieldsMap);

    const components = parsedRobotConfig.components;
    if (!Array.isArray(components)) continue;

    for (const component of components) {
      if (!component || typeof component !== "object") continue;

      const serviceConfigs = component.service_configs;
      if (!Array.isArray(serviceConfigs)) continue;

      // Check if any service config has type 'data_manager'
      const hasDataManager = serviceConfigs.some(
        (service: any) => service.type === "data_manager"
      );

      if (hasDataManager) {
        // Extract relevant component details
        // You can modify the fields extracted as needed
        const extractedComponent: Component = {
          id: item.id,
          name: component.name,
          type: component.type,
          // Add other fields if necessary
        };
        componentsWithDataManager.push(extractedComponent);
      }
    }
  }

  return componentsWithDataManager;
}
