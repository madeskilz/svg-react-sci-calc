import { create, all } from 'mathjs';

// create a reusable mathjs instance with full functionality
const baseMath = create(all, {});

function degToRad(x) {
  return x * Math.PI / 180;
}
function radToDeg(x) {
  return x * 180 / Math.PI;
}

function createMathWithAngle(angle) {
  if (angle === 'DEG') {
    // create a fresh instance and override trig functions to operate in degrees
    const m = create(all, {});
    m.import({
      sin: (x) => Math.sin(degToRad(x)),
      cos: (x) => Math.cos(degToRad(x)),
      tan: (x) => Math.tan(degToRad(x)),
      asin: (x) => radToDeg(Math.asin(x)),
      acos: (x) => radToDeg(Math.acos(x)),
      atan: (x) => radToDeg(Math.atan(x)),
    }, { override: true });
    return m;
  }
  return baseMath;
}

export function normalizeExpression(expr) {
  if (typeof expr !== 'string') return '';
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\\u2212/g, '-') // minus sign
    .replace(/\s+/g, '');
}

export function evaluateExpression(expr, { angle = 'RAD' } = {}) {
  const normalized = normalizeExpression(expr);
  const math = createMathWithAngle(angle);
  try {
    // use math.evaluate which is safe for mathjs expressions
    const result = math.evaluate(normalized);
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function formatResult(value) {
  if (value === null || value === undefined) return '';
  // show reasonable number of digits for floats
  if (typeof value === 'number') {
    if (!isFinite(value)) return String(value);
    // avoid long floats
    return Number.isInteger(value) ? String(value) : String(Number.parseFloat(value).toPrecision(12)).replace(/(?:\.0+|(?:(0+)))$/,'');
  }
  return String(value);
}