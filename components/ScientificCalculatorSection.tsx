import { useEffect, useState, type FC, type ReactNode } from "react";
import {
  Calculator,
  ChevronDown,
  Copy,
  Delete,
  FlaskConical,
  History,
  RotateCcw,
} from "lucide-react";

type BinaryOperator = "+" | "-" | "*" | "/" | "^";

interface CalculatorHistoryItem {
  expression: string;
  result: string;
}

interface QuickConstant {
  key: string;
  label: string;
  value: number;
}

type UnitAwareCategoryId =
  | "pressure"
  | "length"
  | "mass"
  | "time"
  | "energy"
  | "temperature";

interface UnitAwareUnit {
  id: string;
  label: string;
  symbol: string;
  toBase?: number;
  fromBase?: (baseValue: number) => number;
}

interface UnitAwareCategory {
  id: UnitAwareCategoryId;
  label: string;
  baseSymbol: string;
  defaultUnitId: string;
  units: UnitAwareUnit[];
}

interface CalculatorButtonProps {
  label: ReactNode;
  onClick: () => void;
  title?: string;
  variant?: "default" | "operator" | "accent" | "soft";
  className?: string;
}

const OPERATOR_SYMBOL: Record<BinaryOperator, string> = {
  "+": "+",
  "-": "-",
  "*": "x",
  "/": "/",
  "^": "^",
};

const QUICK_CONSTANTS: QuickConstant[] = [
  { key: "pi", label: "pi", value: Math.PI },
  { key: "e", label: "e", value: Math.E },
  { key: "c", label: "c", value: 299_792_458 },
  { key: "h", label: "h", value: 6.626_070_15e-34 },
  { key: "k_B", label: "k_B", value: 1.380_649e-23 },
  { key: "N_A", label: "N_A", value: 6.022_140_76e23 },
  { key: "R", label: "R", value: 8.314_462_618 },
  { key: "g", label: "g", value: 9.806_65 },
  { key: "sigma", label: "sigma", value: 5.670_374_419e-8 },
  { key: "alpha", label: "alpha", value: 7.297_352_5693e-3 },
];

const UNIT_AWARE_CATEGORIES: UnitAwareCategory[] = [
  {
    id: "pressure",
    label: "Pressure",
    baseSymbol: "Pa",
    defaultUnitId: "kPa",
    units: [
      { id: "Pa", label: "Pascal", symbol: "Pa", toBase: 1 },
      { id: "kPa", label: "Kilopascal", symbol: "kPa", toBase: 1_000 },
      { id: "bar", label: "Bar", symbol: "bar", toBase: 100_000 },
      { id: "atm", label: "Atmosphere", symbol: "atm", toBase: 101_325 },
      { id: "psi", label: "PSI", symbol: "psi", toBase: 6_894.757_293_168 },
    ],
  },
  {
    id: "length",
    label: "Length",
    baseSymbol: "m",
    defaultUnitId: "cm",
    units: [
      { id: "m", label: "Meter", symbol: "m", toBase: 1 },
      { id: "km", label: "Kilometer", symbol: "km", toBase: 1_000 },
      { id: "cm", label: "Centimeter", symbol: "cm", toBase: 0.01 },
      { id: "mm", label: "Millimeter", symbol: "mm", toBase: 0.001 },
      { id: "ft", label: "Foot", symbol: "ft", toBase: 0.3048 },
      { id: "in", label: "Inch", symbol: "in", toBase: 0.0254 },
    ],
  },
  {
    id: "mass",
    label: "Mass",
    baseSymbol: "kg",
    defaultUnitId: "g",
    units: [
      { id: "kg", label: "Kilogram", symbol: "kg", toBase: 1 },
      { id: "g", label: "Gram", symbol: "g", toBase: 0.001 },
      { id: "mg", label: "Milligram", symbol: "mg", toBase: 0.000001 },
      { id: "lb", label: "Pound", symbol: "lb", toBase: 0.453_592_37 },
    ],
  },
  {
    id: "time",
    label: "Time",
    baseSymbol: "s",
    defaultUnitId: "min",
    units: [
      { id: "s", label: "Second", symbol: "s", toBase: 1 },
      { id: "min", label: "Minute", symbol: "min", toBase: 60 },
      { id: "h", label: "Hour", symbol: "h", toBase: 3_600 },
      { id: "day", label: "Day", symbol: "day", toBase: 86_400 },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    baseSymbol: "J",
    defaultUnitId: "kJ",
    units: [
      { id: "J", label: "Joule", symbol: "J", toBase: 1 },
      { id: "kJ", label: "Kilojoule", symbol: "kJ", toBase: 1_000 },
      { id: "cal", label: "Calorie", symbol: "cal", toBase: 4.184 },
      { id: "eV", label: "Electronvolt", symbol: "eV", toBase: 1.602_176_634e-19 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    baseSymbol: "K",
    defaultUnitId: "C",
    units: [
      { id: "K", label: "Kelvin", symbol: "K", toBase: 1 },
      {
        id: "C",
        label: "Celsius",
        symbol: "degC",
        fromBase: (baseValue) => baseValue - 273.15,
      },
      {
        id: "F",
        label: "Fahrenheit",
        symbol: "degF",
        fromBase: (baseValue) => ((baseValue - 273.15) * 9) / 5 + 32,
      },
    ],
  },
];

const UNIT_AWARE_CATEGORY_MAP: Record<UnitAwareCategoryId, UnitAwareCategory> =
  UNIT_AWARE_CATEGORIES.reduce(
    (accumulator, category) => {
      accumulator[category.id] = category;
      return accumulator;
    },
    {} as Record<UnitAwareCategoryId, UnitAwareCategory>,
  );

const BUTTON_BASE_CLASS =
  "h-12 sm:h-14 rounded-xl border px-3 text-lg sm:text-xl font-medium transition active:scale-[0.98]";

const BUTTON_VARIANT_CLASS: Record<NonNullable<CalculatorButtonProps["variant"]>, string> = {
  default:
    "bg-white border-gray-200 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700",
  operator:
    "bg-gray-200 border-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600",
  accent:
    "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600",
  soft: "bg-gray-200 border-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600",
};

const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const absoluteValue = Math.abs(value);

  if (absoluteValue === 0) {
    return "0";
  }

  if (absoluteValue >= 1e12 || absoluteValue < 1e-6) {
    return value.toExponential(8);
  }

  return Number(value.toPrecision(12)).toString();
};

const parseDisplayValue = (display: string): number | null => {
  const parsed = Number(display);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateBinaryOperation = (
  leftValue: number,
  rightValue: number,
  operator: BinaryOperator,
): number | null => {
  switch (operator) {
    case "+":
      return leftValue + rightValue;
    case "-":
      return leftValue - rightValue;
    case "*":
      return leftValue * rightValue;
    case "/":
      if (rightValue === 0) {
        return null;
      }
      return leftValue / rightValue;
    case "^":
      return leftValue ** rightValue;
    default:
      return null;
  }
};

const factorial = (value: number): number | null => {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    return null;
  }

  let result = 1;

  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }

  return result;
};

const convertFromBaseUnit = (baseValue: number, unit: UnitAwareUnit): number | null => {
  if (typeof unit.fromBase === "function") {
    const converted = unit.fromBase(baseValue);
    return Number.isFinite(converted) ? converted : null;
  }

  if (typeof unit.toBase !== "number" || unit.toBase === 0) {
    return null;
  }

  const converted = baseValue / unit.toBase;
  return Number.isFinite(converted) ? converted : null;
};

const CalculatorButton: FC<CalculatorButtonProps> = ({
  label,
  onClick,
  title,
  variant = "default",
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${BUTTON_BASE_CLASS} ${BUTTON_VARIANT_CLASS[variant]} ${className}`}
    >
      {label}
    </button>
  );
};

const ScientificCalculatorSection: FC = () => {
  const [display, setDisplay] = useState("0");
  const [preview, setPreview] = useState("");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<BinaryOperator | null>(null);
  const [awaitingNextValue, setAwaitingNextValue] = useState(false);
  const [history, setHistory] = useState<CalculatorHistoryItem[]>([]);
  const [memoryValue, setMemoryValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedUnitCategory, setSelectedUnitCategory] =
    useState<UnitAwareCategoryId>("pressure");
  const [selectedOutputUnit, setSelectedOutputUnit] = useState("kPa");

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [statusMessage]);

  const clearError = () => {
    setErrorMessage(null);
  };

  const setError = (message: string) => {
    setErrorMessage(message);
    setDisplay("Error");
    setPreview("");
    setStoredValue(null);
    setPendingOperator(null);
    setAwaitingNextValue(true);
  };

  const pushHistory = (expression: string, resultValue: number) => {
    const item: CalculatorHistoryItem = {
      expression,
      result: formatValue(resultValue),
    };

    setHistory((previous) => [item, ...previous].slice(0, 12));
  };

  const handleClearAll = () => {
    setDisplay("0");
    setPreview("");
    setStoredValue(null);
    setPendingOperator(null);
    setAwaitingNextValue(false);
    clearError();
  };

  const handleBackspace = () => {
    if (awaitingNextValue || display === "Error") {
      setDisplay("0");
      setAwaitingNextValue(false);
      clearError();
      return;
    }

    setDisplay((current) => {
      if (current.length <= 1) {
        return "0";
      }

      return current.slice(0, -1);
    });
  };

  const handleDigit = (digit: string) => {
    clearError();

    if (awaitingNextValue || display === "Error") {
      setDisplay(digit);
      setAwaitingNextValue(false);
      return;
    }

    setDisplay((current) => (current === "0" ? digit : `${current}${digit}`));
  };

  const handleDecimal = () => {
    clearError();

    if (awaitingNextValue || display === "Error") {
      setDisplay("0.");
      setAwaitingNextValue(false);
      return;
    }

    if (display.includes(".")) {
      return;
    }

    setDisplay((current) => `${current}.`);
  };

  const handleSignToggle = () => {
    const value = parseDisplayValue(display);

    if (value === null) {
      setError("Enter a valid number.");
      return;
    }

    setDisplay(formatValue(value * -1));
  };

  const handleOperator = (nextOperator: BinaryOperator) => {
    const inputValue = parseDisplayValue(display);

    if (inputValue === null) {
      setError("Enter a valid number before choosing an operator.");
      return;
    }

    clearError();

    if (storedValue !== null && pendingOperator !== null) {
      if (awaitingNextValue) {
        setPendingOperator(nextOperator);
        setPreview(`${formatValue(storedValue)} ${OPERATOR_SYMBOL[nextOperator]}`);
        return;
      }

      const calculated = calculateBinaryOperation(storedValue, inputValue, pendingOperator);
      if (calculated === null || !Number.isFinite(calculated)) {
        setError(
          pendingOperator === "/"
            ? "Division by zero is not allowed."
            : "Invalid calculation.",
        );
        return;
      }

      setStoredValue(calculated);
      setDisplay(formatValue(calculated));
      setPreview(`${formatValue(calculated)} ${OPERATOR_SYMBOL[nextOperator]}`);
      setPendingOperator(nextOperator);
      setAwaitingNextValue(true);
      return;
    }

    setStoredValue(inputValue);
    setPendingOperator(nextOperator);
    setPreview(`${formatValue(inputValue)} ${OPERATOR_SYMBOL[nextOperator]}`);
    setAwaitingNextValue(true);
  };

  const handleEquals = () => {
    if (storedValue === null || pendingOperator === null || awaitingNextValue) {
      return;
    }

    const rightValue = parseDisplayValue(display);

    if (rightValue === null) {
      setError("Enter a valid number before calculating.");
      return;
    }

    const calculated = calculateBinaryOperation(storedValue, rightValue, pendingOperator);

    if (calculated === null || !Number.isFinite(calculated)) {
      setError(
        pendingOperator === "/" ? "Division by zero is not allowed." : "Invalid calculation.",
      );
      return;
    }

    const expression = `${formatValue(storedValue)} ${OPERATOR_SYMBOL[pendingOperator]} ${formatValue(rightValue)}`;
    pushHistory(expression, calculated);
    setDisplay(formatValue(calculated));
    setPreview(expression);
    setStoredValue(null);
    setPendingOperator(null);
    setAwaitingNextValue(true);
    clearError();
  };

  const handleUnaryOperation = (
    label: string,
    operation: (value: number) => number | null,
    invalidMessage: string,
  ) => {
    const inputValue = parseDisplayValue(display);

    if (inputValue === null) {
      setError("Enter a valid number.");
      return;
    }

    const calculated = operation(inputValue);

    if (calculated === null || !Number.isFinite(calculated)) {
      setError(invalidMessage);
      return;
    }

    const expression = `${label}(${formatValue(inputValue)})`;
    pushHistory(expression, calculated);
    setDisplay(formatValue(calculated));
    setPreview(expression);
    setAwaitingNextValue(!(storedValue !== null && pendingOperator !== null));
    clearError();
  };

  const handleInsertConstant = (constant: QuickConstant) => {
    const formatted = formatValue(constant.value);
    setDisplay(formatted);
    setPreview(`${constant.label} constant`);
    setAwaitingNextValue(!(storedValue !== null && pendingOperator !== null));
    clearError();
  };

  const handleMemoryStore = () => {
    const value = parseDisplayValue(display);

    if (value === null) {
      setError("Cannot store an invalid number in memory.");
      return;
    }

    setMemoryValue(value);
    setStatusMessage("Stored in memory.");
  };

  const handleMemoryAdd = () => {
    const value = parseDisplayValue(display);

    if (value === null) {
      setError("Cannot add invalid number to memory.");
      return;
    }

    setMemoryValue((previous) => previous + value);
    setStatusMessage("Added to memory.");
  };

  const handleMemoryRecall = () => {
    setDisplay(formatValue(memoryValue));
    setPreview("Memory recall");
    setAwaitingNextValue(!(storedValue !== null && pendingOperator !== null));
    clearError();
  };

  const handleCopyDisplay = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatusMessage("Clipboard is not supported here.");
      return;
    }

    try {
      await navigator.clipboard.writeText(display);
      setStatusMessage("Copied result.");
    } catch {
      setStatusMessage("Copy failed.");
    }
  };

  const activeUnitCategory = UNIT_AWARE_CATEGORY_MAP[selectedUnitCategory];
  const activeUnitDefinition =
    activeUnitCategory.units.find((unit) => unit.id === selectedOutputUnit) ??
    activeUnitCategory.units[0];
  const parsedDisplayValue = parseDisplayValue(display);
  const convertedUnitValue =
    parsedDisplayValue === null
      ? null
      : convertFromBaseUnit(parsedDisplayValue, activeUnitDefinition);

  const handleUnitCategoryChange = (categoryId: UnitAwareCategoryId) => {
    const nextCategory = UNIT_AWARE_CATEGORY_MAP[categoryId];
    setSelectedUnitCategory(categoryId);
    setSelectedOutputUnit(nextCategory.defaultUnitId);
  };

  return (
    <div className="max-w-[1200px] mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-3">
            <Calculator className="text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
              Scientific Calculator
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-1 rounded-xl text-sm font-semibold bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-900">
              Scientific Mode
            </span>
            <button
              type="button"
              onClick={() => {
                void handleCopyDisplay();
              }}
              className="h-11 w-12 grid place-items-center rounded-xl border transition
                bg-white border-gray-200 text-gray-700 hover:bg-gray-100
                dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              aria-label="Copy display"
              title="Copy display"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="rounded-2xl bg-black text-white p-4 sm:p-6 min-h-[124px] flex flex-col justify-end">
              <p className="text-right text-4xl sm:text-5xl font-semibold break-all leading-tight">
                {display}
              </p>
            </div>

            {preview ? (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 truncate">{preview}</p>
            ) : null}
            {errorMessage ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            ) : null}
            {statusMessage ? (
              <p className="mt-2 text-sm text-green-700 dark:text-green-400">{statusMessage}</p>
            ) : null}

            <div className="grid grid-cols-6 gap-2 sm:gap-3 mt-4">
              <CalculatorButton
                label="MC"
                onClick={() => setMemoryValue(0)}
                title="Memory clear"
                className="text-base sm:text-xl"
              />
              <CalculatorButton
                label="MR"
                onClick={handleMemoryRecall}
                title="Memory recall"
                className="text-base sm:text-xl"
              />
              <CalculatorButton
                label="M+"
                onClick={handleMemoryAdd}
                title="Memory add"
                className="text-base sm:text-xl"
              />
              <CalculatorButton
                label="MS"
                onClick={handleMemoryStore}
                title="Memory store"
                className="text-base sm:text-xl"
              />
              <CalculatorButton
                label={<RotateCcw size={22} className="mx-auto" />}
                onClick={handleClearAll}
                title="Clear all"
                className="text-base sm:text-xl"
              />
              <CalculatorButton
                label={<Delete size={22} className="mx-auto" />}
                onClick={handleBackspace}
                title="Backspace"
                className="text-base sm:text-xl"
              />
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton
                label="sin"
                onClick={() =>
                  handleUnaryOperation("sin", (value) => Math.sin(value), "Invalid input for sin.")
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="cos"
                onClick={() =>
                  handleUnaryOperation("cos", (value) => Math.cos(value), "Invalid input for cos.")
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="tan"
                onClick={() =>
                  handleUnaryOperation("tan", (value) => Math.tan(value), "Invalid input for tan.")
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="ln"
                onClick={() =>
                  handleUnaryOperation(
                    "ln",
                    (value) => (value > 0 ? Math.log(value) : null),
                    "ln is defined only for positive numbers.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="log"
                onClick={() =>
                  handleUnaryOperation(
                    "log",
                    (value) => (value > 0 ? Math.log10(value) : null),
                    "log is defined only for positive numbers.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="sqrt"
                onClick={() =>
                  handleUnaryOperation(
                    "sqrt",
                    (value) => (value >= 0 ? Math.sqrt(value) : null),
                    "Square root requires a non-negative number.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton
                label="x^2"
                onClick={() =>
                  handleUnaryOperation(
                    "x^2",
                    (value) => value ** 2,
                    "Could not square the value.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="1/x"
                onClick={() =>
                  handleUnaryOperation(
                    "1/x",
                    (value) => (value !== 0 ? 1 / value : null),
                    "Cannot divide by zero.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="exp"
                onClick={() =>
                  handleUnaryOperation("exp", (value) => Math.exp(value), "Value is out of range.")
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="10^x"
                onClick={() =>
                  handleUnaryOperation("10^x", (value) => 10 ** value, "Value is out of range.")
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="x^y"
                onClick={() => handleOperator("^")}
                variant="soft"
                className="text-base sm:text-2xl"
              />
              <CalculatorButton
                label="x!"
                onClick={() =>
                  handleUnaryOperation(
                    "x!",
                    (value) => factorial(value),
                    "Factorial needs a whole number between 0 and 170.",
                  )
                }
                variant="soft"
                className="text-base sm:text-2xl"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton label="7" onClick={() => handleDigit("7")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="8" onClick={() => handleDigit("8")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="9" onClick={() => handleDigit("9")} className="text-2xl sm:text-3xl" />
              <CalculatorButton
                label="/"
                onClick={() => handleOperator("/")}
                variant="operator"
                className="text-2xl sm:text-3xl"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton label="4" onClick={() => handleDigit("4")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="5" onClick={() => handleDigit("5")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="6" onClick={() => handleDigit("6")} className="text-2xl sm:text-3xl" />
              <CalculatorButton
                label="x"
                onClick={() => handleOperator("*")}
                variant="operator"
                className="text-2xl sm:text-3xl"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton label="1" onClick={() => handleDigit("1")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="2" onClick={() => handleDigit("2")} className="text-2xl sm:text-3xl" />
              <CalculatorButton label="3" onClick={() => handleDigit("3")} className="text-2xl sm:text-3xl" />
              <CalculatorButton
                label="-"
                onClick={() => handleOperator("-")}
                variant="operator"
                className="text-2xl sm:text-3xl"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton
                label="0"
                onClick={() => handleDigit("0")}
                className="col-span-2 text-2xl sm:text-3xl"
              />
              <CalculatorButton label="." onClick={handleDecimal} className="text-2xl sm:text-3xl" />
              <CalculatorButton
                label="+"
                onClick={() => handleOperator("+")}
                variant="operator"
                className="text-2xl sm:text-3xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <CalculatorButton label="+/-" onClick={handleSignToggle} className="text-2xl sm:text-3xl" />
              <CalculatorButton
                label="="
                onClick={handleEquals}
                variant="accent"
                className="text-2xl sm:text-3xl"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
              Unit-Aware Calculations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="relative">
                <select
                  value={selectedUnitCategory}
                  onChange={(event) =>
                    handleUnitCategoryChange(event.target.value as UnitAwareCategoryId)
                  }
                  className="h-12 w-full rounded-xl border pl-4 pr-10 outline-none transition appearance-none
                    bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  {UNIT_AWARE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedOutputUnit}
                  onChange={(event) => setSelectedOutputUnit(event.target.value)}
                  className="h-12 w-full rounded-xl border pl-4 pr-10 outline-none transition appearance-none
                    bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  {activeUnitCategory.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.symbol}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                />
              </div>
            </div>

            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {convertedUnitValue === null
                ? "Selected: No numeric value"
                : `Selected: ${formatValue(convertedUnitValue)} ${activeUnitDefinition.symbol}`}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Base unit used: {activeUnitCategory.baseSymbol}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical className="text-gray-700 dark:text-gray-300" />
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                Quick Constants
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {QUICK_CONSTANTS.map((constant) => (
                <button
                  key={constant.key}
                  type="button"
                  onClick={() => handleInsertConstant(constant)}
                  className="h-12 sm:h-14 rounded-xl border px-3 text-base sm:text-lg font-medium transition
                    bg-white border-gray-200 text-gray-900 hover:bg-gray-100
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  title={`Insert ${constant.label}`}
                >
                  {constant.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Click any constant to insert its value
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm min-h-[280px]">
            <div className="flex items-center gap-3 mb-4">
              <History className="text-gray-700 dark:text-gray-300" />
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
                History
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="h-[180px] rounded-xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center">
                <p className="text-lg sm:text-2xl text-gray-500 dark:text-gray-400">
                  No calculations yet
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {history.map((item, index) => (
                  <button
                    key={`${item.expression}-${index}`}
                    type="button"
                    onClick={() => {
                      setDisplay(item.result);
                      setPreview(item.expression);
                      setStoredValue(null);
                      setPendingOperator(null);
                      setAwaitingNextValue(true);
                      clearError();
                    }}
                    className="w-full rounded-xl border p-3 text-left transition
                      bg-gray-100 border-gray-200 hover:bg-gray-200
                      dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {item.expression}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                      = {item.result}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white">
              Memory
            </h3>
            <div className="mt-4 rounded-xl p-4 text-center bg-gray-100 dark:bg-gray-700">
              <p className="text-base text-gray-500 dark:text-gray-300">Stored Value</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white break-all">
                {formatValue(memoryValue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculatorSection;
