"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { X, GripHorizontal, Minus, Maximize2, Minimize2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

type AngleMode = "DEG" | "RAD";

export default function ScientificCalculator({ onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const resizeRef = useRef({
    active: false,
    edge: "",
    startX: 0,
    startY: 0,
    originW: 0,
    originH: 0,
    originX: 0,
    originY: 0,
  });

  const [pos, setPos] = useState({
    x: window.innerWidth / 2 - 175,
    y: window.innerHeight / 2 - 240,
  });
  const [size, setSize] = useState({ w: 350, h: 480 });
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [prevState, setPrevState] = useState({
    pos: { x: 0, y: 0 },
    size: { w: 350, h: 480 },
  });

  // Calculator state
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [isSecond, setIsSecond] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (maximized) return;
      const client = "touches" in e ? e.touches[0] : e;
      dragRef.current = {
        active: true,
        startX: client.clientX,
        startY: client.clientY,
        originX: pos.x,
        originY: pos.y,
      };
      e.preventDefault();
    },
    [maximized, pos]
  );

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.active) return;
      const client =
        "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
      const dx = client.clientX - dragRef.current.startX;
      const dy = client.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    };
    const up = () => {
      dragRef.current.active = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  const onResizeStart = useCallback(
    (e: React.MouseEvent, edge: string) => {
      if (maximized) return;
      resizeRef.current = {
        active: true,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        originW: size.w,
        originH: size.h,
        originX: pos.x,
        originY: pos.y,
      };
      e.preventDefault();
      e.stopPropagation();
    },
    [maximized, size, pos]
  );

  useEffect(() => {
    const MIN_W = 290,
      MIN_H = 380;
    const move = (e: MouseEvent) => {
      if (!resizeRef.current.active) return;
      const { edge, startX, startY, originW, originH, originX, originY } =
        resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let nw = originW,
        nh = originH,
        nx = originX,
        ny = originY;
      if (edge.includes("e")) nw = Math.max(MIN_W, originW + dx);
      if (edge.includes("s")) nh = Math.max(MIN_H, originH + dy);
      if (edge.includes("w")) {
        nw = Math.max(MIN_W, originW - dx);
        nx = originX + (originW - nw);
      }
      if (edge.includes("n")) {
        nh = Math.max(MIN_H, originH - dy);
        ny = originY + (originH - nh);
      }
      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    };
    const up = () => {
      resizeRef.current.active = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  // ── Maximize / Minimize ───────────────────────────────────────────────────
  function toggleMaximize() {
    if (!maximized) {
      setPrevState({ pos: { ...pos }, size: { ...size } });
      setPos({ x: 0, y: 0 });
      setSize({ w: window.innerWidth, h: window.innerHeight });
      setMaximized(true);
    } else {
      setPos(prevState.pos);
      setSize(prevState.size);
      setMaximized(false);
    }
  }

  // ── Calc logic ────────────────────────────────────────────────────────────
  const toRad = (v: number) => (angleMode === "DEG" ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) =>
    angleMode === "DEG" ? (v * 180) / Math.PI : v;

  function inputDigit(digit: string) {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }

  function inputDot() {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  }

  function handleOperator(op: string) {
    const val = parseFloat(display);
    const expr = expression.trim();

    if (expr && !waitingForOperand) {
      // evaluate pending
      const result = evalBinary(expr, val);
      const rs = formatNum(result);
      setDisplay(rs);
      setExpression(rs + " " + op + " ");
      setHistory((h) => [`${expr}${val} = ${rs}`, ...h.slice(0, 9)]);
    } else {
      setExpression(display + " " + op + " ");
    }
    setWaitingForOperand(true);
  }

  function evalBinary(expr: string, rhs: number): number {
    // expr like "12 + " or "5 * "
    const parts = expr.trim().split(" ");
    const lhs = parseFloat(parts[0]);
    const op = parts[1];
    switch (op) {
      case "+":
        return lhs + rhs;
      case "−":
        return lhs - rhs;
      case "×":
        return lhs * rhs;
      case "÷":
        return rhs !== 0 ? lhs / rhs : NaN;
      case "^":
        return Math.pow(lhs, rhs);
      case "ʸ√":
        return Math.pow(rhs, 1 / lhs);
      default:
        return rhs;
    }
  }

  function handleEquals() {
    if (!expression) return;
    const val = parseFloat(display);
    const result = evalBinary(expression, val);
    const rs = formatNum(result);
    setHistory((h) => [`${expression}${display} = ${rs}`, ...h.slice(0, 9)]);
    setDisplay(rs);
    setExpression("");
    setWaitingForOperand(true);
  }

  function formatNum(n: number): string {
    if (!isFinite(n)) return isNaN(n) ? "Error" : n > 0 ? "∞" : "-∞";
    const s = parseFloat(n.toPrecision(12)).toString();
    return s;
  }

  function handleUnary(fn: string) {
    const val = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin":
        result = Math.sin(toRad(val));
        break;
      case "cos":
        result = Math.cos(toRad(val));
        break;
      case "tan":
        result = Math.tan(toRad(val));
        break;
      case "asin":
        result = fromRad(Math.asin(val));
        break;
      case "acos":
        result = fromRad(Math.acos(val));
        break;
      case "atan":
        result = fromRad(Math.atan(val));
        break;
      case "log":
        result = Math.log10(val);
        break;
      case "ln":
        result = Math.log(val);
        break;
      case "√":
        result = Math.sqrt(val);
        break;
      case "x²":
        result = val * val;
        break;
      case "x³":
        result = val * val * val;
        break;
      case "1/x":
        result = 1 / val;
        break;
      case "n!":
        result = factorial(val);
        break;
      case "10^x":
        result = Math.pow(10, val);
        break;
      case "e^x":
        result = Math.exp(val);
        break;
      case "+/-":
        result = -val;
        break;
      case "%":
        result = val / 100;
        break;
      default:
        return;
    }
    setHistory((h) => [
      `${fn}(${display}) = ${formatNum(result)}`,
      ...h.slice(0, 9),
    ]);
    setDisplay(formatNum(result));
    setWaitingForOperand(true);
  }

  function factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) r *= i;
    return r;
  }

  function handleClear() {
    setDisplay("0");
    setExpression("");
    setWaitingForOperand(false);
  }
  function handleBackspace() {
    if (waitingForOperand) return;
    const next = display.length > 1 ? display.slice(0, -1) : "0";
    setDisplay(next);
  }

  // Memory
  function memStore() {
    setMemory(parseFloat(display));
  }
  function memRecall() {
    setDisplay(formatNum(memory));
    setWaitingForOperand(false);
  }
  function memAdd() {
    setMemory((m) => m + parseFloat(display));
  }
  function memClear() {
    setMemory(0);
  }

  // ── Button definitions ────────────────────────────────────────────────────
  type Btn = {
    label: string;
    label2?: string;
    action: () => void;
    action2?: () => void;
    variant?: string;
    wide?: boolean;
  };

  const buttons: Btn[] = [
    // Row 1
    {
      label: "2nd",
      action: () => setIsSecond((s) => !s),
      variant: isSecond ? "active" : "fn",
    },
    {
      label: angleMode,
      action: () => setAngleMode((m) => (m === "DEG" ? "RAD" : "DEG")),
      variant: "fn",
    },
    { label: "MC", action: memClear, variant: "fn" },
    { label: "MR", action: memRecall, variant: "fn" },
    { label: "M+", action: memAdd, variant: "fn" },
    { label: "MS", action: memStore, variant: "fn" },
    // Row 2
    {
      label: "sin",
      label2: "sin⁻¹",
      action: () => handleUnary("sin"),
      action2: () => handleUnary("asin"),
      variant: "sci",
    },
    {
      label: "cos",
      label2: "cos⁻¹",
      action: () => handleUnary("cos"),
      action2: () => handleUnary("acos"),
      variant: "sci",
    },
    {
      label: "tan",
      label2: "tan⁻¹",
      action: () => handleUnary("tan"),
      action2: () => handleUnary("atan"),
      variant: "sci",
    },
    {
      label: "log",
      label2: "10^x",
      action: () => handleUnary("log"),
      action2: () => handleUnary("10^x"),
      variant: "sci",
    },
    {
      label: "ln",
      label2: "e^x",
      action: () => handleUnary("ln"),
      action2: () => handleUnary("e^x"),
      variant: "sci",
    },
    { label: "n!", action: () => handleUnary("n!"), variant: "sci" },
    // Row 3
    {
      label: "x²",
      label2: "x³",
      action: () => handleUnary("x²"),
      action2: () => handleUnary("x³"),
      variant: "sci",
    },
    {
      label: "√",
      label2: "ʸ√x",
      action: () => handleUnary("√"),
      action2: () => handleOperator("ʸ√"),
      variant: "sci",
    },
    { label: "xʸ", action: () => handleOperator("^"), variant: "sci" },
    { label: "1/x", action: () => handleUnary("1/x"), variant: "sci" },
    {
      label: "π",
      action: () => {
        setDisplay(formatNum(Math.PI));
        setWaitingForOperand(false);
      },
      variant: "sci",
    },
    {
      label: "e",
      action: () => {
        setDisplay(formatNum(Math.E));
        setWaitingForOperand(false);
      },
      variant: "sci",
    },
    // Row 4
    { label: "AC", action: handleClear, variant: "clear" },
    { label: "+/-", action: () => handleUnary("+/-"), variant: "op" },
    { label: "%", action: () => handleUnary("%"), variant: "op" },
    { label: "⌫", action: handleBackspace, variant: "op" },
    { label: "÷", action: () => handleOperator("÷"), variant: "operator" },
    // Row 5
    { label: "7", action: () => inputDigit("7"), variant: "num" },
    { label: "8", action: () => inputDigit("8"), variant: "num" },
    { label: "9", action: () => inputDigit("9"), variant: "num" },
    { label: "×", action: () => handleOperator("×"), variant: "operator" },
    // Row 6
    { label: "4", action: () => inputDigit("4"), variant: "num" },
    { label: "5", action: () => inputDigit("5"), variant: "num" },
    { label: "6", action: () => inputDigit("6"), variant: "num" },
    { label: "−", action: () => handleOperator("−"), variant: "operator" },
    // Row 7
    { label: "1", action: () => inputDigit("1"), variant: "num" },
    { label: "2", action: () => inputDigit("2"), variant: "num" },
    { label: "3", action: () => inputDigit("3"), variant: "num" },
    { label: "+", action: () => handleOperator("+"), variant: "operator" },
    // Row 8
    { label: "0", action: () => inputDigit("0"), variant: "num", wide: true },
    { label: ".", action: inputDot, variant: "num" },
    { label: "=", action: handleEquals, variant: "equals" },
  ];

  const variantClass: Record<string, string> = {
    fn: "bg-muted text-muted-foreground hover:bg-muted/70 text-[10px] font-semibold",
    active: "bg-primary text-primary-foreground text-[10px] font-semibold",
    sci: "bg-muted/60 text-foreground hover:bg-muted text-[11px] font-medium",
    num: "bg-card border border-border text-foreground hover:bg-muted text-sm font-medium",
    op: "bg-muted text-foreground hover:bg-muted/70 text-sm font-medium",
    clear:
      "bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 font-bold text-sm",
    operator:
      "bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 text-sm font-bold",
    equals:
      "bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold",
  };

  // grid layout rows: 6sci + 4num rows = different column counts
  // sci rows: 6 cols, num rows: 4 cols + special last row
  const rows = [
    buttons.slice(0, 6), // fn row
    buttons.slice(6, 12), // sci row 1
    buttons.slice(12, 18), // sci row 2
    buttons.slice(18, 23), // ops row (5 items: AC +/- % ⌫ ÷)
    buttons.slice(23, 27), // 7 8 9 ×
    buttons.slice(27, 31), // 4 5 6 −
    buttons.slice(31, 35), // 1 2 3 +
    buttons.slice(35), // 0 . =
  ];

  return (
    <div
      ref={modalRef}
      style={
        maximized
          ? {
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
            }
          : {
              position: "fixed",
              left: pos.x,
              top: pos.y,
              width: size.w,
              height: minimized ? "auto" : size.h,
              zIndex: 9999,
            }
      }
      className="flex flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden select-none"
    >
      {/* Resize handles */}
      {!maximized && !minimized && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "n")}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "s")}
          />
          <div
            className="absolute top-0 left-0 bottom-0 w-1 cursor-w-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "w")}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-1 cursor-e-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "e")}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "se")}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "sw")}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "ne")}
          />
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10"
            onMouseDown={(e) => onResizeStart(e, "nw")}
          />
        </>
      )}

      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b bg-muted/40 cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            Kalkulator Ilmiah
          </span>
          {memory !== 0 && (
            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
              M={formatNum(memory)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="rounded-lg p-1 hover:bg-muted transition-colors"
            title={minimized ? "Perbesar" : "Perkecil"}
          >
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={toggleMaximize}
            className="rounded-lg p-1 hover:bg-muted transition-colors"
            title={maximized ? "Kembalikan" : "Layar Penuh"}
          >
            {maximized ? (
              <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-red-500/15 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Display */}
          <div className="shrink-0 px-4 pt-3 pb-2 bg-muted/20">
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground font-mono min-h-[16px] truncate">
                {expression || "\u00A0"}
              </div>
              <div
                className="font-mono font-bold text-foreground leading-tight overflow-hidden text-ellipsis"
                style={{
                  fontSize: Math.min(
                    28,
                    Math.max(14, 28 - Math.max(0, display.length - 10) * 1.5)
                  ),
                }}
              >
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex-1 p-2 flex flex-col gap-1 overflow-hidden">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-1 flex-1 min-h-0">
                {row.map((btn, bi) => {
                  const label = isSecond && btn.label2 ? btn.label2 : btn.label;
                  const action =
                    isSecond && btn.action2 ? btn.action2 : btn.action;
                  return (
                    <button
                      key={bi}
                      onClick={() => {
                        action();
                        if (isSecond && btn.label2) setIsSecond(false);
                      }}
                      className={`
                        rounded-xl transition-all duration-75 active:scale-95 flex-1 min-w-0
                        ${btn.wide ? "flex-[2]" : ""}
                        ${
                          variantClass[btn.variant || "num"] || variantClass.num
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
