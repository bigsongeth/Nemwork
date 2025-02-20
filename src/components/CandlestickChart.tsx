import React from "react";
import { Chart } from "react-google-charts";

// Define the interface for the raw price feed data from nemo.tsx
export interface CandleDataPoint {
  ts: number;       // timestamp in milliseconds
  price: string;    // price as a string
}

// Props for our chart component
interface CandlestickChartProps {
  data: CandleDataPoint[];
  width?: string;
  height?: string;
}

/**
 * Transform the raw price feed data into an array-of-arrays with explicit column definitions.
 * Here, we define the header row as an array of objects specifying column type.
 * This tells Google Charts that the first column is of type "date" and the second is "number".
 */
const transformData = (data: CandleDataPoint[]): any[] => {
  const header = [
    { type: "date", label: "Time" },
    { type: "number", label: "Price" }
  ];
  const rows = data.map((point) => {
    // Convert the timestamp to a Date object.
    // Explicitly convert the raw value (if it's a string) to a number.
    const rawTs = typeof point.ts === "string" ? Number(point.ts) : point.ts;
    const time = new Date(rawTs);
    // Parse the price string into a float.
    const price = parseFloat(point.price);
    return [time, price];
  });
  return [header, ...rows];
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  width = "100%",
  height = "400px",
}) => {
  const chartData = transformData(data);
  
  const options = {
    legend: "none",
    hAxis: {
      title: "Time",
      format: "M/d/yy H:mm" // Customize the time format as needed
    },
    vAxis: {
      title: "Price"
    },
    firstRowIsData: false // Ensure the header row is treated as column definitions.
    // Additional options (e.g., chartArea, colors) can be added here.
  };

  return (
    <Chart
      chartType="LineChart"
      width={width}
      height={height}
      data={chartData}
      options={options}
      loader={<div>Loading Chart...</div>}
    />
  );
};

export default CandlestickChart;