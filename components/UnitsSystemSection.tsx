import React, { type JSX } from "react";

type UnitItem = {
  name: string;
  symbol?: string;
  badge?: string;
};

const siUnits: UnitItem[] = [
  { name: "Meter", symbol: "m" },
  { name: "Kilometer", symbol: "km" },
  { name: "Centimeter", symbol: "cm" },
  { name: "Millimeter", symbol: "mm" },
  { name: "Micrometer", symbol: "µm" },
];

const imperialUnits: UnitItem[] = [
  { name: "Foot", symbol: "ft" },
  { name: "Inch", symbol: "in" },
  { name: "Yard", symbol: "yd" },
  { name: "Mile", symbol: "mi" },
  { name: "Mil", symbol: "mil" },
];

const otherSystems: UnitItem[] = [
  { name: "Nautical Mile", badge: "Nautical" },
  { name: "Astronomical Unit", badge: "Astronomical" },
  { name: "Light Year", badge: "Astronomical" },
  { name: "Parsec", badge: "Astronomical" },
];

const Card = ({ title, data }: { title: string; data: UnitItem[] }) => {
  return (
    <div className="rounded-2xl border p-8 transition-colors duration-300
      bg-white border-gray-200
      dark:bg-gray-900 dark:border-gray-700">

      <h3 className="text-xl font-semibold mb-6
        text-gray-900 dark:text-white">
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((unit, index) => (
          <div
            key={index}
            className="flex justify-between items-center
              text-gray-700 dark:text-gray-300">

            <span>{unit.name}</span>

            {unit.symbol && (
              <span className="text-gray-500 dark:text-gray-400">
                {unit.symbol}
              </span>
            )}

            {unit.badge && (
              <span className="text-xs px-3 py-1 rounded-full border
                border-gray-300 text-gray-600
                dark:border-gray-600 dark:text-gray-300">
                {unit.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const UnitsSystemSection = (): JSX.Element => {
  return (
    <div className="px-6 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card title="SI Units" data={siUnits} />
          <Card title="Imperial Units" data={imperialUnits} />
          <Card title="Other Systems" data={otherSystems} />
        </div>
      </div>
    </div>
  );
};

export default UnitsSystemSection;
