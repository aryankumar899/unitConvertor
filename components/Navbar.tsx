import type { FC } from "react";
import TabsForCalculation, { type CalculationTab } from "./TabsForCalculation";

interface NavbarProps {
  activeTab: CalculationTab;
  onTabChange: (tab: CalculationTab) => void;
}

const Navbar: FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="max-w-[1200px] mx-auto">
      <TabsForCalculation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Navbar;
