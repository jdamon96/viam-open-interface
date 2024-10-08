// components/pipelineUtils.ts

import { AggregationStage } from "@/types/AggregationStage";
import { Aggregator } from "mingo";

export const applyAggregationPipeline = async (
  stages: AggregationStage[],
  organizationId: string,
  fetchTabularData: (orgId: string, pipeline: any[]) => Promise<any>
): Promise<any[][]> => {
  const results: any[][] = [];

  if (stages.length === 0) {
    console.error("No stages defined");
    return results;
  }

  try {
    console.log("Starting pipeline application...");

    // Fetch initial data with the first stage
    const initialStage = stages[0];
    console.log("Initial stage:", initialStage);

    const aggPipelineFirstStage = [
      {
        [initialStage.operator]: initialStage.definition,
      },
    ];
    console.log("Initial pipeline:", aggPipelineFirstStage);

    const initialData = await fetchTabularData(
      organizationId,
      aggPipelineFirstStage
    );
    if (!initialData) {
      console.error("Failed to fetch initial data");
      return results;
    }
    console.log("Initial data fetched:", initialData);

    results.push(initialData);

    // Apply subsequent stages iteratively
    let currentData = initialData;
    for (let i = 1; i < stages.length; i++) {
      const stage = stages[i];
      console.log(`Applying stage ${i}:`, stage);

      const pipeline = [
        { [stage.operator]: JSON.parse(stage.definition) },
        { $limit: 3 }, // Add $limit implicitly
      ];
      console.log(`Pipeline for stage ${i}:`, pipeline);

      const aggregator = new Aggregator(pipeline);
      const cursor = aggregator.run(currentData);
      currentData = cursor;
      console.log(`Data after stage ${i}:`, currentData);

      results.push(currentData);
    }
    console.log("Pipeline application completed.");

    return results;
  } catch (error) {
    console.error("Error applying pipeline:", error);
    results.push([`Error: ${error}`]);
    return results;
  }
};
