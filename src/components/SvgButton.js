import React from 'react';

export default function SvgButton({ x, y, width = 50, height = 50, radius = 12, fill = '#333', stroke = '#444', label, onClick, fontSize = 18 }) {
  const textX = x + width / 2;
  const textY = y + height / 2 + fontSize / 3;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}>
      <rect x={x} y={y} width={width} height={height} rx={radius} fill={fill} stroke={stroke} />
      <text x={textX} y={textY} fontSize={fontSize} fill="#fff" textAnchor="middle" alignmentBaseline="middle">{label}</text>
    </g>
  );
}