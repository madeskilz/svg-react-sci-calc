import React, { useState } from 'react';
import SvgButton from './SvgButton';
import { evaluateExpression, formatResult } from '../math/engine';
import '../styles.css';

const LAYOUT = [
  ['(', ')', '←', 'C', 'RAD'],
  ['7', '8', '9', '÷', 'sin'],
  ['4', '5', '6', '×', 'cos'],
  ['1', '2', '3', '-', 'tan'],
  ['0', '.', 'π', '+', '^'],
  ['sqrt', 'log', 'ln', '!', '=']
];

export default function Calculator() {
  const [display, setDisplay] = useState('');
  const [angle, setAngle] = useState('RAD');
  const [memory, setMemory] = useState(null);

  function pushToken(token) {
    // insert token into the display appropriately
    setDisplay((d) => d + token);
  }

  function handleClear() {
    setDisplay('');
  }

  function handleBackspace() {
    setDisplay((d) => d.slice(0, -1));
  }

  function handleToggleAngle() {
    setAngle((a) => (a === 'RAD' ? 'DEG' : 'RAD'));
  }

  function handleEvaluate() {
    const { ok, result, error } = evaluateExpression(display, { angle });
    if (ok) {
      setDisplay(formatResult(result));
    } else {
      setDisplay('Error');
      console.error('Eval error', error);
    }
  }

  function handleButton(label) {
    switch (label) {
      case 'C':
        return handleClear();
      case '←':
        return handleBackspace();
      case 'RAD':
        return handleToggleAngle();
      case '=':
        return handleEvaluate();
      case '×':
      case '÷':
      case '+':
      case '-':
      case '^':
      case '.':
      case '(': 
      case ')':
        return pushToken(label === '×' ? '×' : label === '÷' ? '÷' : label);
      case 'π':
        return pushToken('π');
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sqrt':
      case 'log':
      case 'ln':
        return pushToken(`${label}(`);
      case '!':
        return pushToken('!');
      default:
        // digits
        return pushToken(label);
    }
  }

  // layout rendering: compute positions
  const width = 320;
  const padding = 15;
  const btnW = 50;
  const btnH = 50;
  const gapX = 10;
  const gapY = 10;

  return (
    <div className="calc-root" style={{ width: 330, margin: '20px auto', fontFamily: 'sans-serif' }}>
      <svg width={width} height={480} style={{ border: '1px solid #444', borderRadius: 12, background: '#222' }}>
        {/* Display */}
        <rect x={padding} y={16} width={width - padding * 2} height={60} rx={8} fill="#111" stroke="#444" />
        <text x={padding + 10} y={54} fontSize={28} fill="#0f0" fontFamily="monospace">{display || '0'}</text>
        <text x={width - padding - 10} y={34} fontSize={12} fill="#bbb" textAnchor="end">{angle}</text>

        {/* Buttons */}
        {LAYOUT.map((row, rIdx) => {
          return row.map((label, cIdx) => {
            const x = padding + cIdx * (btnW + gapX);
            const y = 90 + rIdx * (btnH + gapY);
            // style special buttons
            let fill = '#333';
            let fontSize = 18;
            if (label === '=') fill = '#0a84ff';
            if (label === 'C' || label === '←') fill = '#8b0000';
            if (label === 'RAD') fill = '#444';
            return (
              <SvgButton
                key={`${rIdx}-${cIdx}`}
                x={x}
                y={y}
                width={btnW}
                height={btnH}
                fill={fill}
                label={label}
                fontSize={fontSize}
                onClick={() => handleButton(label)}
              />
            );
          });
        })}
      </svg>

      <div style={{ marginTop: 8, color: '#ddd', fontSize: 12 }}>
        <div>Memory: {memory === null ? 'empty' : String(memory)}</div>
        <div style={{ marginTop: 6 }}>
          <button onClick={() => setMemory((m) => (m === null ? Number(display || 0) : m + Number(display || 0)))}>M+</button>
          <button onClick={() => setMemory((m) => (m === null ? -Number(display || 0) : m - Number(display || 0)))}>M-</button>
          <button onClick={() => setDisplay(String(memory || 0))}>MR</button>
          <button onClick={() => setMemory(null)}>MC</button>
        </div>
      </div>
    </div>
  );
}