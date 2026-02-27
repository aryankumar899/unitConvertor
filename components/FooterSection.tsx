import type { JSX } from "react";

const FooterSection = (): JSX.Element => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-700 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">

        {/* Top 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-6 text-lg">
              Unit Systems Supported
            </h3>
            <ul className="space-y-3">
              <li>• International System (SI)</li>
              <li>• Centimeter-Gram-Second (CGS)</li>
              <li>• Imperial & US Customary</li>
              <li>• Natural & Atomic Units</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-6 text-lg">
              Physical Quantities
            </h3>
            <ul className="space-y-3">
              <li>• Length, Mass, Time, Temperature</li>
              <li>• Energy, Power, Force, Pressure</li>
              <li>• Viscosity, Conductivity, Frequency</li>
              <li>• And many more...</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-6 text-lg">
              Features
            </h3>
            <ul className="space-y-3">
              <li>• AI-powered natural language queries</li>
              <li>• Scientific calculator integration</li>
              <li>• Comprehensive constants library</li>
              <li>• Export & sharing capabilities</li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Scientific Unit Converter. Built for scientists, engineers & students.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
