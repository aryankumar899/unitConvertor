import type { FC, ReactNode } from "react";
import {
  Ruler,
  FlaskConical,
  Calculator,
  Bot,
  History,
  Heart,
} from "lucide-react";

export type CalculationTab =
  | "Converter"
  | "Constants"
  | "Calculator"
  | "AI Assistant"
  | "History"
  | "Favorites";

interface TabsForCalculationProps {
  activeTab: CalculationTab;
  onTabChange: (tab: CalculationTab) => void;
}

const TABS: { label: CalculationTab; icon: ReactNode }[] = [
  { icon: <Ruler size={18} />, label: "Converter" },
  { icon: <FlaskConical size={18} />, label: "Constants" },
  { icon: <Calculator size={18} />, label: "Calculator" },
  { icon: <Bot size={18} />, label: "AI Assistant" },
  { icon: <History size={18} />, label: "History" },
  { icon: <Heart size={18} />, label: "Favorites" },
];

const TabsForCalculation: FC<TabsForCalculationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 flex gap-2 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onTabChange(tab.label)}
          type="button"
          className={`flex items-center gap-2 px-6 py-2 rounded-full cursor-pointer transition
                ${
                  activeTab === tab.label
                    ? "bg-white dark:bg-gray-700 shadow text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700"
                }`}
        >
          {tab.icon}
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabsForCalculation;
