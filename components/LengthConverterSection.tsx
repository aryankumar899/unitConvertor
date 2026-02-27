import { useEffect, useRef, useState, type FC } from "react";
import {
  Ruler,
  ArrowLeftRight,
  Star,
  History,
  Share2,
  ChevronDown,
  Check,
} from "lucide-react";

type UnitSystem = "SI" | "Imperial";
type ConverterSide = "from" | "to";

type LengthUnitId =
  | "meter"
  | "kilometer"
  | "centimeter"
  | "millimeter"
  | "micrometer"
  | "nanometer"
  | "picometer"
  | "foot"
  | "inch"
  | "yard"
  | "mile"
  | "mil"
  | "nautical-mile"
  | "fathom"
  | "rod"
  | "chain";

interface LengthUnit {
  id: LengthUnitId;
  label: string;
  symbol: string;
  system: UnitSystem;
  toMeter: number;
}

const LENGTH_UNITS: LengthUnit[] = [
  { id: "meter", label: "Meter", symbol: "m", system: "SI", toMeter: 1 },
  {
    id: "kilometer",
    label: "Kilometer",
    symbol: "km",
    system: "SI",
    toMeter: 1000,
  },
  {
    id: "centimeter",
    label: "Centimeter",
    symbol: "cm",
    system: "SI",
    toMeter: 0.01,
  },
  {
    id: "millimeter",
    label: "Millimeter",
    symbol: "mm",
    system: "SI",
    toMeter: 0.001,
  },
  {
    id: "micrometer",
    label: "Micrometer",
    symbol: "um",
    system: "SI",
    toMeter: 1e-6,
  },
  {
    id: "nanometer",
    label: "Nanometer",
    symbol: "nm",
    system: "SI",
    toMeter: 1e-9,
  },
  {
    id: "picometer",
    label: "Picometer",
    symbol: "pm",
    system: "SI",
    toMeter: 1e-12,
  },
  { id: "foot", label: "Foot", symbol: "ft", system: "Imperial", toMeter: 0.3048 },
  { id: "inch", label: "Inch", symbol: "in", system: "Imperial", toMeter: 0.0254 },
  { id: "yard", label: "Yard", symbol: "yd", system: "Imperial", toMeter: 0.9144 },
  { id: "mile", label: "Mile", symbol: "mi", system: "Imperial", toMeter: 1609.344 },
  { id: "mil", label: "Mil", symbol: "mil", system: "Imperial", toMeter: 0.0000254 },
  {
    id: "nautical-mile",
    label: "Nautical Mile",
    symbol: "nmi",
    system: "Imperial",
    toMeter: 1852,
  },
  {
    id: "fathom",
    label: "Fathom",
    symbol: "ftm",
    system: "Imperial",
    toMeter: 1.8288,
  },
  { id: "rod", label: "Rod", symbol: "rd", system: "Imperial", toMeter: 5.0292 },
  { id: "chain", label: "Chain", symbol: "ch", system: "Imperial", toMeter: 20.1168 },
];

const LENGTH_UNIT_MAP: Record<LengthUnitId, LengthUnit> = LENGTH_UNITS.reduce(
  (accumulator, unit) => {
    accumulator[unit.id] = unit;
    return accumulator;
  },
  {} as Record<LengthUnitId, LengthUnit>,
);

const parseNumericInput = (value: string): number | null => {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const convertLength = (value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number => {
  return (value * fromUnit.toMeter) / toUnit.toMeter;
};

const formatNumber = (value: number): string => {
  const absoluteValue = Math.abs(value);

  if (absoluteValue !== 0 && (absoluteValue >= 1e9 || absoluteValue < 1e-6)) {
    return value.toExponential(6);
  }

  return value.toFixed(6);
};

const formatFactor = (value: number): string => {
  const absoluteValue = Math.abs(value);

  if (absoluteValue !== 0 && (absoluteValue >= 1e9 || absoluteValue < 1e-9)) {
    return value.toExponential(6);
  }

  return Number(value.toPrecision(12)).toString();
};

const LengthConverterSection: FC = () => {
  const [fromUnitId, setFromUnitId] = useState<LengthUnitId>("meter");
  const [toUnitId, setToUnitId] = useState<LengthUnitId>("foot");
  const [fromValue, setFromValue] = useState<string>("1");
  const [toValue, setToValue] = useState<string>(() =>
    formatNumber(convertLength(1, LENGTH_UNIT_MAP.meter, LENGTH_UNIT_MAP.foot)),
  );
  const [openDropdown, setOpenDropdown] = useState<ConverterSide | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const fromUnit = LENGTH_UNIT_MAP[fromUnitId];
  const toUnit = LENGTH_UNIT_MAP[toUnitId];

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const parsedFrom = parseNumericInput(fromValue);

    if (parsedFrom === null) {
      setToValue("");
      return;
    }

    const convertedValue = convertLength(parsedFrom, fromUnit, toUnit);
    setToValue(formatNumber(convertedValue));
  }, [fromValue, fromUnit, toUnit]);

  const handleInputChange = (value: string) => {
    setFromValue(value);
  };

  const handleSwap = () => {
    setOpenDropdown(null);
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const handleUnitSelect = (side: ConverterSide, unitId: LengthUnitId) => {
    setOpenDropdown(null);

    if (side === "from") {
      setFromUnitId(unitId);
      return;
    }

    setToUnitId(unitId);
  };

  const toggleUnitDropdown = (side: ConverterSide) => {
    setOpenDropdown((current) => (current === side ? null : side));
  };

  const renderUnitDropdown = (side: ConverterSide) => {
    const selectedUnit = side === "from" ? fromUnit : toUnit;

    return (
      <div className="relative mt-3">
        <button
          onClick={() => toggleUnitDropdown(side)}
          type="button"
          className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all duration-200
            bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200
            dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600
            ${side === "to" ? "shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span>{selectedUnit.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full
              bg-gray-200 text-gray-700
              dark:bg-gray-600 dark:text-gray-200">
              {selectedUnit.system}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={openDropdown === side ? "transform rotate-180 transition" : "transition"}
          />
        </button>

        {openDropdown === side ? (
          <div className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border p-2 shadow-lg
            border-gray-200 bg-white
            dark:border-gray-600 dark:bg-gray-800">
            {LENGTH_UNITS.map((unit) => {
              const isSelected = unit.id === selectedUnit.id;

              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitSelect(side, unit.id)}
                  type="button"
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition
                    ${
                      isSelected
                        ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                        : "hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{unit.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border
                      border-gray-300 text-gray-600
                      dark:border-gray-500 dark:text-gray-300">
                      {unit.system}
                    </span>
                  </div>
                  {isSelected ? <Check size={16} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const parsedFrom = parseNumericInput(fromValue);
  const parsedTo = parseNumericInput(toValue);
  const conversionFactor = fromUnit.toMeter / toUnit.toMeter;
  const formulaText =
    parsedFrom !== null && parsedTo !== null
      ? `${formatFactor(parsedFrom)} ${fromUnit.symbol} x ${formatFactor(conversionFactor)} = ${formatNumber(parsedTo)} ${toUnit.symbol}`
      : "Enter a numeric value to see the conversion formula.";

  const handleShareResult = async () => {
    if (parsedFrom === null || parsedTo === null) {
      setShareStatus("Enter a valid value before sharing.");
      return;
    }

    const shareText = `Length conversion result:\n${formulaText}`;
    const sharePayload = {
      title: "Length Conversion Result",
      text: shareText,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(sharePayload);
        setShareStatus("Result shared successfully.");
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("Result copied to clipboard.");
        return;
      }

      setShareStatus("Sharing is not supported in this browser.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus(null);
        return;
      }

      setShareStatus("Failed to share result. Please try again.");
    }
  };

  useEffect(() => {
    if (!shareStatus) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShareStatus(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shareStatus]);

  return (
    <div
      ref={sectionRef}
      className="max-w-6xl mx-auto mt-8 rounded-2xl p-8 border shadow-sm
      bg-white border-gray-200
      dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3">
          <Ruler className="mt-1 text-gray-600 dark:text-gray-300" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Length Converter
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Convert between different length units
            </p>
          </div>
        </div>

        <span
          className="bg-blue-100 text-blue-600
          dark:bg-blue-900 dark:text-blue-300
          px-4 py-1 rounded-full text-sm font-medium"
        >
          {LENGTH_UNITS.length} units
        </span>
      </div>

      {/* Converter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* FROM */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </label>

          <input
            type="number"
            value={fromValue}
            onChange={(event) => handleInputChange(event.target.value)}
            className="w-full mt-2 p-3 rounded-xl outline-none border
              bg-gray-100 text-black border-gray-200
              dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />

          {renderUnitDropdown("from")}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            type="button"
            className="p-4 rounded-full transition
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <ArrowLeftRight size={20} className="text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* TO */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
          </label>

          <input
            type="number"
            value={toValue}
            readOnly
            className="w-full mt-2 p-3 rounded-xl outline-none border shadow-sm transition-all duration-200
              bg-gray-100 text-black border-gray-200
              dark:bg-gray-700 dark:text-white dark:border-gray-600
              hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500"
          />

          {renderUnitDropdown("to")}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t my-8 border-gray-200 dark:border-gray-700"></div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 rounded-xl border transition
          bg-gray-100 hover:bg-gray-200 border-gray-200
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white"
        >
          <Star size={18} />
          Save to Favorites
        </button>

        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 rounded-xl border transition
          bg-gray-100 hover:bg-gray-200 border-gray-200
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white"
        >
          <History size={18} />
          Add to History
        </button>

        <button
          type="button"
          onClick={() => {
            void handleShareResult();
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl border transition
          bg-gray-100 hover:bg-gray-200 border-gray-200
          dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white"
        >
          <Share2 size={18} />
          Share Result
        </button>
      </div>
      {shareStatus ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{shareStatus}</p>
      ) : null}

      {/* Formula Box */}
      <div
        className="mt-8 p-6 rounded-2xl
        bg-gray-100 text-gray-700
        dark:bg-gray-700 dark:text-gray-200"
      >
        <h3 className="font-semibold mb-3">Conversion Formula:</h3>
        <p>{formulaText}</p>
      </div>
    </div>
  );
};

export default LengthConverterSection;
