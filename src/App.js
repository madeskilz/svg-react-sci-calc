import React, { useState } from "react";

// base button grid (6 rows x 5 cols). visible labels may change when SHIFT is active
const BUTTONS = [
  { id: "SHIFT", label: "SHIFT", value: "SHIFT" }, { id: "DRG", label: "DRG", value: "DRG" }, { id: "PI", label: "π", value: "PI" }, { id: "EXP", label: "EXP", value: "EXP" }, { id: "DEL", label: "DEL", value: "DEL" },
  { id: "M+", label: "M+", value: "M+" }, { id: "M-", label: "M-", value: "M-" }, { id: "MR", label: "MR", value: "MR" }, { id: "MC", label: "MC", value: "MC" }, { id: "C", label: "C", value: "C" },
  { id: "7", label: "7", value: "7" }, { id: "8", label: "8", value: "8" }, { id: "9", label: "9", value: "9" }, { id: "/", label: "/", value: "/" }, { id: "sin", label: "sin", value: "sin" },
  { id: "4", label: "4", value: "4" }, { id: "5", label: "5", value: "5" }, { id: "6", label: "6", value: "6" }, { id: "*", label: "*", value: "*" }, { id: "cos", label: "cos", value: "cos" },
  { id: "1", label: "1", value: "1" }, { id: "2", label: "2", value: "2" }, { id: "3", label: "3", value: "3" }, { id: "-", label: "-", value: "-" }, { id: "tan", label: "tan", value: "tan" },
  { id: "+/-", label: "+/-", value: "+/-" }, { id: "0", label: "0", value: "0" }, { id: ".", label: ".", value: "." }, { id: "(", label: "(", value: "(" }, { id: ")", label: ")", value: ")" },
  { id: "^", label: "^", value: "^" }, { id: "sqrt", label: "√", value: "sqrt" }, { id: "log", label: "log", value: "log" }, { id: "ANS", label: "ANS", value: "ANS" }, { id: "=", label: "=", value: "=" },
];

function safeEval(expr, angleMode = "RAD", ans = 0) {
  if (!expr || expr.trim() === "") return 0;

  // allow ANS/PI tokens
  expr = expr.replace(/\bANS\b/g, `(${Number(ans)})`);
  expr = expr.replace(/\bPI\b/g, `(${Math.PI})`);

  // caret -> exponent
  expr = expr.replace(/\^/g, "**");

  // unary factorial: replace "n!" with fact(n)
  // handle parenthesized factorials and numbers: e.g. (3+2)! or 5!
  // We'll transform using a regex that captures (...)! or number!
  expr = expr.replace(/(\([^\)]+\)|\d+(\.\d+)?|\bANS\b)!/g, (m, g1) => `fact(${g1})`);

  // map functions including inverse and hyperbolic variants
  const angleWrap = (inner, forInverse = false) =>
    // when evaluating inverse trig in DEG mode we must convert result from rad to deg after asin/acos/atan
    forInverse
      ? (angleMode === "DEG" ? `(${inner}*180/Math.PI)` : `(${inner})`)
      : (angleMode === "DEG" ? `(${inner}*Math.PI/180)` : `(${inner})`);

  // functions mapping: support asin/acos/atan, asinh/acosh/atanh as well
  expr = expr.replace(/asin\(([^)]+)\)/g, (m, x) => `(${angleWrap(`Math.asin(${x})`, true)})`);
  expr = expr.replace(/acos\(([^)]+)\)/g, (m, x) => `(${angleWrap(`Math.acos(${x})`, true)})`);
  expr = expr.replace(/atan\(([^)]+)\)/g, (m, x) => `(${angleWrap(`Math.atan(${x})`, true)})`);

  expr = expr.replace(/sin\(([^)]+)\)/g, (m, x) => `Math.sin(${angleWrap(x)})`);
  expr = expr.replace(/cos\(([^)]+)\)/g, (m, x) => `Math.cos(${angleWrap(x)})`);
  expr = expr.replace(/tan\(([^)]+)\)/g, (m, x) => `Math.tan(${angleWrap(x)})`);

  expr = expr.replace(/asinh\(([^)]+)\)/g, (m, x) => `Math.asinh(${x})`);
  expr = expr.replace(/acosh\(([^)]+)\)/g, (m, x) => `Math.acosh(${x})`);
  expr = expr.replace(/atanh\(([^)]+)\)/g, (m, x) => `Math.atanh(${x})`);

  expr = expr.replace(/sqrt\(([^)]+)\)/g, (m, x) => `Math.sqrt(${x})`);
  expr = expr.replace(/log\(([^)]+)\)/g, (m, x) =>
    `((typeof Math.log10==='function')?Math.log10(${x}):Math.log(${x})/Math.LN10)`
  );

  try {
    // inject a small helper (fact) and evaluate in a strict function
    const wrapper = `
      "use strict";
      const fact = (n) => {
        n = Math.floor(Number(n));
        if (n < 0 || !Number.isFinite(n)) throw new Error('Factorial error');
        if (n === 0) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
      };
      return (${expr});
    `;
    // eslint-disable-next-line no-new-func
    const result = Function(wrapper)();
    if (typeof result === "number" && isFinite(result)) return result;
    return "Error";
  } catch (e) {
    return "Error";
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState("");
  const [angleMode, setAngleMode] = useState("DEG"); // Casio often defaults to DEG
  const [ans, setAns] = useState(0);
  const [shift, setShift] = useState(false);
  const [memory, setMemory] = useState(0);

  // Display geometry
  const DISP_X = 10, DISP_Y = 16, DISP_W = 300, DISP_H = 50, H_PAD = 10;

  function computeFontSize(text) {
    const base = 28;
    const len = (text || "").toString().length;
    if (len <= 12) return base;
    return Math.max(14, base - (len - 12));
  }

  function toggleSign(expr) {
    const m = expr.match(/([0-9.]+|\([^\)]+\))$/);
    if (!m) return expr + "-";
    const token = m[0], start = m.index;
    if (token.startsWith("(-") && token.endsWith(")")) {
      return expr.slice(0, start) + token.slice(2, -1);
    }
    return expr.slice(0, start) + "(-" + token + ")";
  }

  // compute the visual label for function buttons depending on SHIFT
  function visibleLabel(id, baseLabel) {
    if (!shift) return baseLabel;
    // SHIFT variants for some keys (mimic common Casio shift legends)
    switch (id) {
      case "sin": return "sin⁻¹";
      case "cos": return "cos⁻¹";
      case "tan": return "tan⁻¹";
      case "sqrt": return "x²";
      case "log": return "10^x"; // shift: 10^x typically
      default: return baseLabel;
    }
  }

  function handleClick(v) {
    // SHIFT toggles alternate functions for next keypress (Casio STYLE: one-shot)
    if (v === "SHIFT") {
      setShift((s) => !s);
      return;
    }

    if (v === "DRG") {
      setAngleMode((m) => (m === "DEG" ? "RAD" : "DEG"));
      setShift(false);
      return;
    }

    if (v === "C") { setDisplay(""); setShift(false); return; }
    if (v === "DEL") { setDisplay((d) => (d ? d.slice(0, -1) : "")); setShift(false); return; }

    if (v === "M+") {
      const val = safeEval(display, angleMode, ans);
      if (val !== "Error") setMemory((m) => m + Number(val));
      setShift(false);
      return;
    }
    if (v === "M-") {
      const val = safeEval(display, angleMode, ans);
      if (val !== "Error") setMemory((m) => m - Number(val));
      setShift(false);
      return;
    }
    if (v === "MR") { setDisplay((d) => d + String(memory)); setShift(false); return; }
    if (v === "MC") { setMemory(0); setShift(false); return; }

    if (v === "PI") { setDisplay((d) => d + "PI"); setShift(false); return; }
    if (v === "EXP") { setDisplay((d) => d + "e"); setShift(false); return; }
    if (v === "ANS") { setDisplay((d) => d + String(ans)); setShift(false); return; }

    if (v === "+/-") { setDisplay((d) => toggleSign(d)); setShift(false); return; }

    // handle "=" evaluate
    if (v === "=") {
      const res = safeEval(display, angleMode, ans);
      if (res !== "Error") {
        setAns(res);
        setDisplay(String(res));
      } else {
        setDisplay("Error");
      }
      setShift(false);
      return;
    }

    // function keys with SHIFT variants
    if (["sin", "cos", "tan", "sqrt", "log"].includes(v)) {
      if (shift) {
        // insert inverse or alternate form
        switch (v) {
          case "sin": setDisplay((d) => d + "asin("); break;
          case "cos": setDisplay((d) => d + "acos("); break;
          case "tan": setDisplay((d) => d + "atan("); break;
          case "sqrt": setDisplay((d) => d + "("); /* SHIFT x^2: insert parenthesis to square next token: user would press ) then ^2 — keep simple */ break;
          case "log": setDisplay((d) => d + "10**("); break;
          default: setDisplay((d) => d + v + "(");
        }
        setShift(false);
        return;
      } else {
        setDisplay((d) => d + v + "(");
        return;
      }
    }

    // default: append token (numbers/operators/parentheses)
    setDisplay((d) => d + v);
    setShift(false);
  }

  const fontSize = computeFontSize(display);
  const textX = DISP_X + DISP_W - H_PAD;

  return (
    <div style={{ width: 340, margin: "40px auto", fontFamily: "sans-serif" }}>
      <svg width="320" height="520" style={{ border: "1px solid #444", borderRadius: 20, background: "#222" }}>
        <defs>
          <clipPath id="displayClip">
            <rect x={DISP_X} y={DISP_Y} width={DISP_W} height={DISP_H} rx="10" />
          </clipPath>
        </defs>

        <rect x={DISP_X} y={DISP_Y} width={DISP_W} height={DISP_H} rx="10" fill="#111" stroke="#444" />

        {/* Angle and SHIFT indicators */}
        <text x={DISP_X + 8} y={DISP_Y + 18} fontSize="10" fill="#6f6" fontFamily="monospace">{angleMode}</text>
        <text x={DISP_X + 8} y={DISP_Y + 34} fontSize="10" fill={shift ? "#ff0" : "#666"} fontFamily="monospace">{shift ? "SHIFT" : ""}</text>

        <g clipPath="url(#displayClip)">
          <text
            x={textX}
            y={DISP_Y + 32}
            fontSize={fontSize}
            fill="#0f0"
            fontFamily="monospace"
            textAnchor="end"
            alignmentBaseline="middle"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {display || "0"}
          </text>
        </g>

        {BUTTONS.map((btn, i) => {
          const row = Math.floor(i / 5), col = i % 5;
          const x = 15 + col * 60, y = 90 + row * 60;
          // determine visible label (SHIFT modifies some)
          const label = visibleLabel(btn.id, btn.label);
          // visual highlight for SHIFT and DRG keys
          const fill = btn.id === "SHIFT" ? (shift ? "#ff8" : "#aa6") : (btn.id === "DRG" ? "#6a6" : "#333");
          return (
            <g key={btn.id} onClick={() => handleClick(btn.value)} style={{ cursor: "pointer" }}>
              <rect x={x} y={y} width="50" height="50" rx="12" fill={fill} stroke="#444" />
              <text x={x + 25} y={y + 30} fontSize="14" fill="#fff" textAnchor="middle" alignmentBaseline="middle">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: "center", color: "#888", marginTop: 8, fontSize: 12 }}>
        Memory: {memory} • ANS: {ans}
      </div>
    </div>
  );
}