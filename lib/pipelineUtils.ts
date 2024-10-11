// components/pipelineUtils.ts

import { AggregationStage } from "@/types/AggregationStage";
import { Aggregator } from "mingo";
import { useOperators as loadOperators, OperatorType } from "mingo/core";
import { $sum, $push } from "mingo/operators/accumulator";
import {
  $dateToString,
  $dateFromString,
  $substrBytes,
  $arrayToObject,
  $ifNull,
} from "mingo/operators/expression";
import {
  $group,
  $limit,
  $match,
  $project,
  $sort,
  $addFields,
} from "mingo/operators/pipeline";
// import {} from 'mingo/operators/projection';
// import {} from "mingo/operators/query";
// import {} from "mingo/operators/update";
import {} from "mingo/operators/window";
loadOperators(OperatorType.ACCUMULATOR, { $sum, $push });
loadOperators(OperatorType.EXPRESSION, {
  $dateToString,
  $dateFromString,
  $substrBytes,
  $arrayToObject,
  $ifNull,
});
loadOperators(OperatorType.PIPELINE, {
  $match,
  $project,
  $group,
  $sort,
  $limit,
  $addFields,
});

export const applyAggregationPipeline = async (
  stages: AggregationStage[],
  organizationId: string,
  fetchTabularData: (orgId: string, pipeline: any[]) => Promise<any>,
  limitResults = false
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

    const aggPipelineFirstStage: Array<{ [key: string]: any }> = [
      {
        [initialStage.operator]: initialStage.definition,
      },
    ];
    if (limitResults) {
      aggPipelineFirstStage.push({ $limit: 3 });
    }

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
        { [stage.operator]: stage.definition },
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
