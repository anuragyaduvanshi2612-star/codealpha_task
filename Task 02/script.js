const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

let expression = "";        // e.g. "12+3×4"
let justEvaluated = false;  // true right after pressing "="

const isOperator = (ch) => "+-×÷".includes(ch);

/* ---------- Calculation (no eval) ---------- */
function evaluate(expr) {
  const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+\-×÷])/g);
  if (!tokens) return null;

  const nums = [];
  const ops = [];
  let negative = false;

  for (const t of tokens) {
    if (isOperator(t)) {
      if (nums.length === ops.length) {
        // operator where a number is expected: allow only unary minus
        if (t === "-") negative = !negative;
        else return null;
      } else {
        ops.push(t);
      }
    } else {
      const n = parseFloat(t);
      nums.push(negative ? -n : n);
      negative = false;
    }
  }

  if (nums.length === 0 || nums.length === ops.length) return null; // incomplete

  // Pass 1: × and ÷
  for (let i = 0; i < ops.length; ) {
    if (ops[i] === "×" || ops[i] === "÷") {
      if (ops[i] === "÷" && nums[i + 1] === 0) return NaN; // divide by zero
      const value = ops[i] === "×" ? nums[i] * nums[i + 1] : nums[i] / nums[i + 1];
      nums.splice(i, 2, value);
      ops.splice(i, 1);
    } else {
      i++;
    }
  }

  // Pass 2: + and -
  let total = nums[0];
  for (let i = 0; i < ops.length; i++) {
    total = ops[i] === "+" ? total + nums[i + 1] : total - nums[i + 1];
  }
  return total;
}

function format(value) {
  if (Number.isNaN(value)) return "Error";
  return String(parseFloat(value.toFixed(10)));
}

/* ---------- Display ---------- */
function updateDisplay() {
  expressionEl.textContent = expression;

  if (expression === "") {
    resultEl.textContent = "0";
    return;
  }
  // real-time result
  const live = evaluate(expression);
  if (live !== null && /[+\-×÷]/.test(expression.slice(1))) {
    resultEl.textContent = format(live);
  } else {
    resultEl.textContent = expression;
  }
}

/* ---------- Input handlers ---------- */
function inputNumber(ch) {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  if (ch === ".") {
    const currentNumber = expression.split(/[+\-×÷]/).pop();
    if (currentNumber.includes(".")) return;
    if (currentNumber === "") ch = "0.";
  }
  expression += ch;
  updateDisplay();
}

function inputOperator(op) {
  justEvaluated = false;
  if (expression === "Error") expression = "";
  if (expression === "") {
    if (op === "-") expression = "-";   // allow negative first number
    updateDisplay();
    return;
  }
  const last = expression[expression.length - 1];
  if (isOperator(last)) {
    if (expression.length === 1) return;          // only a "-" so far
    expression = expression.slice(0, -1) + op;    // replace operator
  } else {
    expression += op;
  }
  updateDisplay();
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) { clearAll(); return; }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (expression === "") return;
  const value = evaluate(expression);
  if (value === null) return;               // incomplete expression
  const text = format(value);
  expressionEl.textContent = expression + " =";
  resultEl.textContent = text;
  expression = text === "Error" ? "" : text;
  justEvaluated = true;
}

/* ---------- Button clicks ---------- */
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const { value, action } = btn.dataset;
  if (action === "clear") clearAll();
  else if (action === "delete") deleteLast();
  else if (action === "equals") calculate();
  else if (isOperator(value)) inputOperator(value);
  else inputNumber(value);
});

/* ---------- Keyboard support (Bonus) ---------- */
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (/^[0-9.]$/.test(k)) inputNumber(k);
  else if (k === "+" || k === "-") inputOperator(k);
  else if (k === "*" || k === "x" || k === "X") inputOperator("×");
  else if (k === "/") { e.preventDefault(); inputOperator("÷"); }
  else if (k === "Enter" || k === "=") { e.preventDefault(); calculate(); }
  else if (k === "Backspace") deleteLast();
  else if (k === "Escape" || k === "Delete") clearAll();
});

updateDisplay();