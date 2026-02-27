import type { FC, ReactNode } from "react";
import {
  Ruler,
  Scale,
  Thermometer,
  Clock,
  Zap,
  Activity,
  Gauge,
  Wind,
} from "lucide-react";

export type UnitCategory =
  | "Length"
  | "Mass"
  | "Temperature"
  | "Time"
  | "Energy"
  | "Power"
  | "Pressure"
  | "Force";

interface UnitCategoriesProps {
  activeCategory: UnitCategory;
  onSelectCategory: (category: UnitCategory) => void;
}

interface CategoryItem {
  icon: ReactNode;
  label: UnitCategory;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { icon: <Ruler />, label: "Length" },
  { icon: <Scale />, label: "Mass" },
  { icon: <Thermometer />, label: "Temperature" },
  { icon: <Clock />, label: "Time" },
  { icon: <Zap />, label: "Energy" },
  { icon: <Activity />, label: "Power" },
  { icon: <Gauge />, label: "Pressure" },
  { icon: <Wind />, label: "Force" },
];

const UnitCategories: FC<UnitCategoriesProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Unit Categories
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">
        Select the type of physical quantity you want to convert
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORY_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelectCategory(item.label)}
            type="button"
            className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border cursor-pointer transition
                ${
                  activeCategory === item.label
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitCategories;
