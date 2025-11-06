import React, { useState } from "react";

// List of buttons and scientific operations
const BUTTONS = [
  { label: "7", value: "7" }, { label: "8", value: "8" }, { label: "9", value: "9" }, { label: "/", value: "/" }, { label: "sin", value: "sin" },
  { label: "4", value: "4" }, { label: "5", value: "5" }, { label: "6", value: "6" }, { label: "*", value: "*" }, { label: "cos", value: "cos" },
  { label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "-", value: "-" }, { label: "tan", value: "tan" },
  { label: "0", value: "0" }, { label: ".", value: "." }, { label: "(", value: "(" }, { label: ")", value: ")" }, { label: "+", value: "+" },
  { label: "^", value: "^" }, { label: "sqrt", value: "sqrt" }, { label: "log", value: "log" }, { label: "C", value: "C" }, { label: "=", value: "=" },
];

function safeEval(expr) {
  // Replace custom sci ops with Math equivalents
  expr = expr.replace(/sin\(([^)]+)\)/g, (m, x) => `Math.sin(${x})`);
  expr = expr.replace(/cos\(([^)]+)\)/g, (m, x) => `Math.cos(${x})`);
  expr = expr.replace(/tan\(([^)]+)\)/g, (m, x) => `Math.tan(${x})`);
  expr = expr.replace(/sqrt\(([^)]+)\)/g, (m, x) => `Math.sqrt(${x})`);
  expr = expr.replace(/log\(([^)]+)\)/g, (m, x) => `Math.log10(${x})`);
  expr = expr.replace(/(\d+)\^(\d+)/g, (m, a, b) => `Math.pow(${a},${b})`);
  try {
    return Function(`"use strict";return (${expr})`)();
  } catch(e) {
    return "Error";
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState("");

  function handleClick(v) {
    if (v === "=") {
      setDisplay(safeEval(display).toString());
    } else if (v === "C") {
      setDisplay("");
    } else if (["sin", "cos", "tan", "sqrt", "log"].includes(v)) {
      setDisplay(display + v + "(");
    } else {
      setDisplay(display + v);
    }
  }

  return (
    <div style={{ width: 330, margin: "40px auto", fontFamily: "sans-serif" }}>
      <svg width="320" height="420" style={{ border: "1px solid #444", borderRadius: 20, background: "#222" }}>
        {/* Display */}
        <rect x="10" y="16" width="300" height="50" rx="10" fill="#111" stroke="#444" />
        <text x="20" y="48" fontSize="28" fill="#0f0" fontFamily="monospace">{display || "0"}</text>
        {/* Buttons */}
        {BUTTONS.map((btn, i) => {
          const row = Math.floor(i / 5), col = i % 5;
          const x = 15 + col * 60, y = 80 + row * 60;
          return (
            <g key={btn.label} onClick={() => handleClick(btn.value)} style={{ cursor: "pointer" }}>
              <rect
                x={x}
                y={y}
                width="50"
                height="50"
                rx="12"
                fill="#333"
                stroke="#444"
              />
              <text
                x={x + 25}
                y={y + 30}
                fontSize="22"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >{btn.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}