import { useState, type FC } from "react";
import CalculationChatbotSection from "./CalculationChatbotSection";
import LengthConverterSection from "./LengthConverterSection";
import Navbar from "./Navbar";
import ScientificCalculatorSection from "./ScientificCalculatorSection";
import { type CalculationTab } from "./TabsForCalculation";
import UnitCategories, { type UnitCategory } from "./UnitCategories";

const UnitConvertorContainer: FC = () => {
  const [activeTab, setActiveTab] = useState<CalculationTab>("Converter");
  const [activeCategory, setActiveCategory] = useState<UnitCategory>("Length");

  return (
    <div className="px-6 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "AI Assistant" ? <CalculationChatbotSection /> : null}
      {activeTab === "Calculator" ? <ScientificCalculatorSection /> : null}
      {activeTab !== "AI Assistant" && activeTab !== "Calculator" ? (
        <>
          <UnitCategories
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          {activeCategory === "Length" ? <LengthConverterSection /> : null}
        </>
      ) : null}
    </div>
  );
};

export default UnitConvertorContainer;
