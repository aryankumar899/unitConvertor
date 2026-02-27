import { useState, useEffect, type FC } from "react";
import { Zap, Ruler, FlaskConical, Activity, Bot, Sun, Moon } from "lucide-react";

const HeroSection: FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className=" px-6 py-12 transition-colors duration-300 bg-gray-50 dark:bg-gray-900">

      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md">
            <Zap className="text-white" size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Scientific Unit Converter
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Universal conversion platform for scientists & engineers
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <Sun size={18} className="text-gray-500 dark:text-gray-400" />
          
          <div
            onClick={toggleTheme}
            className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            ></div>
          </div>

          <Moon size={18} className="text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          { icon: <Ruler size={28} />, value: "15+", label: "Unit Categories" },
          { icon: <FlaskConical size={28} />, value: "50+", label: "Scientific Constants" },
          { icon: <Activity size={28} />, value: "1000+", label: "Conversions Available" },
          { icon: <Bot size={28} />, value: "Smart", label: "AI Powered" },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
          >
            <div className="text-gray-700 dark:text-gray-300 mb-6">
              {card.icon}
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
              {card.value}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HeroSection;