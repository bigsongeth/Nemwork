import React from "react";

export interface PriceFeedData {
  pair: string;
  price: string;
  ts: number;
}

interface PriceFeedCardProps {
  data: PriceFeedData;
}

const PriceFeedCard: React.FC<PriceFeedCardProps> = ({ data }) => {
  const { pair, price, ts } = data;
  // Convert the timestamp to a readable date string.
  const timeStr = new Date(ts).toLocaleString();
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-bold">{pair}</h3>
      <p className="text-xl">Price: {price}</p>
      <p className="text-sm text-gray-600">Time: {timeStr}</p>
    </div>
  );
};

export default PriceFeedCard;