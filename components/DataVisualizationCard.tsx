// components/DataVisualizationCard.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import useViamGetTabularDataByMQL from "@/hooks/useViamGetTabularDataByMQL";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import {
  ChartColumn,
  ChevronsLeftRightEllipsis,
  Copy,
  MoreVertical,
  Trash,
  Wrench,
} from "lucide-react";
import { DateRangePicker } from "./ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { AggregationStage } from "@/types/AggregationStage";
import { DataCard } from "@/store/zustand";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CopyToClipboard } from "react-copy-to-clipboard";

// Import Recharts components
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Predefined color palette for data series
const colorPalette = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ffc0cb",
  "#ffbb28",
  "#ff7300",
];

export const constructInitialMatchStageBasedOnCardConfigurationForm = (
  orgId: string,
  locId: string,
  robotId?: string,
  date?: DateRange,
  dataSource?: string
): AggregationStage => {
  const startTime = date?.from ? date.from : new Date(0).toISOString();
  const endTime = date?.to ? date.to : new Date().toISOString();

  const matchStage: any = {
    organization_id: orgId,
    location_id: locId,
    $expr: {
      $and: [
        {
          $gte: ["$time_received", { $toDate: startTime }],
        },
        {
          $lte: ["$time_received", { $toDate: endTime }],
        },
      ],
    },
  };

  if (robotId) {
    matchStage.robot_id = robotId;
  }

  if (dataSource) {
    matchStage.component_name = dataSource;
  }

  return {
    operator: "$match",
    definition: matchStage,
  };
};

const DataVisualizationCard: React.FC<{
  card: DataCard;
  orgId: string;
  locId: string;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (card: DataCard) => void;
  userIsEditingCard: boolean;
}> = ({ card, orgId, locId, onEdit, onDelete, onSave, userIsEditingCard }) => {
  const [date, setDate] = useState<DateRange | undefined>(
    card.dateRange ?? {
      from: addDays(new Date(), -7),
      to: new Date(),
    }
  );
  const { fetchTabularData, loading, error, data } =
    useViamGetTabularDataByMQL();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showVisualization, setShowVisualization] = useState(true);

  // Synchronize local date state with card.dateRange prop
  useEffect(() => {
    if (card.dateRange) {
      setDate(card.dateRange);
    }
  }, [card.dateRange]);

  // Fetch data when card configuration changes
  useEffect(() => {
    if (!userIsEditingCard) {
      const aggregationPipeline = card.aggregationStages.map((stage) => ({
        [stage.operator]: stage.definition,
      }));

      if (orgId) {
        fetchTabularData(orgId, aggregationPipeline).then(() => {
          console.log("Data fetched successfully!");
        });
      }
    }
  }, [
    orgId,
    locId,
    card.robotId,
    card.dataSource,
    card.visualizationType,
    card.aggregationStages,
    fetchTabularData,
    date,
    userIsEditingCard,
  ]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onSave({ ...card, dateRange: newDate });
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleCopy = () => {
    setCopyFeedback("Copied to clipboard!");
    setTimeout(() => {
      setCopyFeedback("");
    }, 2000);
  };

  // Render data preview with a "See full data" button if data is too large
  const renderDataPreview = (data: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const previewLimit = 512; // Limit for preview
    if (jsonString.length > previewLimit) {
      const truncatedString = jsonString.substring(0, previewLimit);
      const lastSpaceIndex = truncatedString.lastIndexOf(" ");
      const displayString =
        lastSpaceIndex === -1
          ? truncatedString
          : truncatedString.substring(0, lastSpaceIndex);
      return (
        <div className="text-xs w-full">
          <pre>{displayString} ...</pre>
          <div>
            <Button
              variant="link"
              onClick={handleDialogOpen}
              className="text-blue-500 px-0 pb-0"
            >
              See full data
            </Button>
          </div>
        </div>
      );
    }
    return <pre>{jsonString}</pre>;
  };

  // Dynamically generate chartConfig based on data keys
  const dynamicChartConfig = useMemo(() => {
    if (!data || data.length === 0) return {};

    // Identify the x-axis key - currently assuming the first string key as x-axis, may need to make this configurable
    const sample = data[0];
    const possibleXAxisKeys = Object.keys(sample).filter((key) => {
      const value = sample[key];
      return (
        typeof value === "string" ||
        value instanceof String ||
        value instanceof Date
      );
    });

    // I may want to make this configurable in the future. For now, taking the first string key as x-axis
    const xAxisKey = possibleXAxisKeys[0] || "category";

    // Extracting the rest of the keys as data series
    const dataSeriesKeys = Object.keys(sample).filter(
      (key) => key !== xAxisKey
    );

    // Assigning colors from the palette
    const config: { [key: string]: { label: string; color: string } } = {};
    dataSeriesKeys.forEach((key, index) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colorPalette[index % colorPalette.length],
      };
    });

    return { xAxisKey, dataSeriesKeys, config };
  }, [data]);

  return (
    <>
      <Card className="w-full min-w-[768px] p-6 flex flex-col space-y-6">
        <CardHeader className="flex flex-row items-center justify-between p-0">
          <CardTitle className="text-lg font-normal flex-shrink-0">
            {card.title}
          </CardTitle>
          <div className="flex items-center justify-end space-x-2 w-full">
            <DateRangePicker
              date={date}
              setDate={(date) =>
                handleDateChange(date as DateRange | undefined)
              }
              className=""
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onEdit}
                  className="hover:cursor-pointer"
                >
                  <Wrench className="h-4 w-4 mr-3 text-gray-500" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowVisualization(!showVisualization)}
                  className="hover:cursor-pointer"
                >
                  {showVisualization ? (
                    <>
                      <ChevronsLeftRightEllipsis className="h-4 w-4 mr-3 text-gray-600" />
                      {"Show Raw Data"}
                    </>
                  ) : (
                    <>
                      <ChartColumn className="h-4 w-4 mr-3 text-gray-600" />
                      {"Show Visualization"}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="hover:cursor-pointer"
                >
                  <>
                    {" "}
                    <Trash className="h-4 w-4 mr-3 text-gray-600" />
                    {"Delete"}
                  </>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent
          className={`border border-gray-200 bg-gray-50 rounded-sm flex items-center ${
            data && !showVisualization ? "justify-start" : "justify-center"
          } p-4`}
        >
          {showVisualization ? (
            card.visualizationType === "Stacked Bar Chart" && data ? (
              dynamicChartConfig.xAxisKey ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dynamicChartConfig.xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {dynamicChartConfig.dataSeriesKeys.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={dynamicChartConfig.config[key].color}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center flex flex-col space-y-2 p-8">
                  <ChartColumn className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg font-semibold text-gray-500">
                    Visualization Placeholder
                  </p>
                  <p className="text-sm text-gray-500">
                    This is where the visualization content will be displayed.
                  </p>
                  {JSON.stringify(data, null, 2)}
                </div>
              )
            ) : (
              <div className="text-center flex flex-col space-y-2 p-8">
                <ChartColumn className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p className="text-lg font-semibold text-gray-500">
                  Visualization Placeholder
                </p>
                <p className="text-sm text-gray-500">
                  This is where the visualization content will be displayed.
                </p>
                {JSON.stringify(data, null, 2)}
              </div>
            )
          ) : data ? (
            <div className="">{renderDataPreview(data)}</div>
          ) : (
            <div className="text-center flex flex-col space-y-2 p-8">
              <ChartColumn className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="text-lg font-semibold text-gray-500">
                No Data Available
              </p>
              <p className="text-sm text-gray-500">
                Finish configuring your card to set up the data visualization.
              </p>
            </div>
          )}
        </CardContent>
        {(card.dataSource || card.visualizationType) && (
          <CardFooter className="p-0">
            <div className="text-xs text-muted-foreground">
              <div>
                <span className="font-semibold">Data source:</span>{" "}
                {card.dataSource}
              </div>
              <div>
                <span className="font-semibold">Visualization Type:</span>{" "}
                {card.visualizationType}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-11/12">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-normal">
              Full Data ({data ? data.length : 0} readings)
            </DialogTitle>
            <CopyToClipboard
              text={JSON.stringify(data, null, 2)}
              onCopy={handleCopy}
            >
              <Button variant={"secondary"} className="mr-8">
                {copyFeedback ? (
                  <span className="flex items-center">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <span>Copy Results to Clipboard</span>
                  </>
                )}
              </Button>
            </CopyToClipboard>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataVisualizationCard;
