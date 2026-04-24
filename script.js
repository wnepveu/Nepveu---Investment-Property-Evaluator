document.addEventListener("DOMContentLoaded", function () {
  const calculateBtn = document.getElementById("calculateBtn");
  const toggleBtn = document.getElementById("toggle-expenses-btn");
  const helpIcon = document.getElementById("help-icon");

  if (calculateBtn) calculateBtn.addEventListener("click", calculate);
  if (toggleBtn) toggleBtn.addEventListener("click", toggleDetails);
  if (helpIcon) helpIcon.addEventListener("click", toggleHelp);

  ["taxes", "insurance", "maintenance", "management", "vacancy", "otherExp"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener("input", updateExpenseRatioFromDetails);
  });
});

function toggleHelp() {
  const popup = document.getElementById("help-popup");
  if (!popup) return;

  popup.style.display = popup.style.display === "block" ? "none" : "block";
}

function toggleDetails() {
  const box = document.getElementById("detailed-expenses");
  const btn = document.getElementById("toggle-expenses-btn");

  if (!box || !btn) return;

  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
    btn.innerText = "Hide Detailed Expenses";
  } else {
    box.style.display = "none";
    btn.innerText = "Show Detailed Expenses";
  }
}

function updateExpenseRatioFromDetails() {
  const rent = parseFloat(document.getElementById("rent").value) || 0;
  const taxes = parseFloat(document.getElementById("taxes").value) || 0;
  const insurance = parseFloat(document.getElementById("insurance").value) || 0;
  const other = parseFloat(document.getElementById("otherExp").value) || 0;

  const maintenance = (parseFloat(document.getElementById("maintenance").value) || 0) / 100;
  const management = (parseFloat(document.getElementById("management").value) || 0) / 100;
  const vacancy = (parseFloat(document.getElementById("vacancy").value) || 0) / 100;

  const annualRent = rent * 12;
  const annualExpenses = taxes + insurance + other + annualRent * (maintenance + management + vacancy);

  const ratio = annualRent > 0 ? (annualExpenses / annualRent) * 100 : 0;

  document.getElementById("expenseRatio").value = ratio.toFixed(2);
}

function calculate() {
  const propertyValue = parseFloat(document.getElementById("propertyValue").value) || 0;
  let downPayment = parseFloat(document.getElementById("downPayment").value) || 0;
  const dpType = document.getElementById("dpType").value;
  const interestRate = (parseFloat(document.getElementById("interestRate").value) || 0) / 100;
  const loanTerm = parseFloat(document.getElementById("loanTerm").value) || 0;
  const rent = parseFloat(document.getElementById("rent").value) || 0;
  const expenseRatio = (parseFloat(document.getElementById("expenseRatio").value) || 0) / 100;

  if (dpType === "percent") {
    downPayment = propertyValue * (downPayment / 100);
  }

  const loanAmount = propertyValue - downPayment;
  const r = interestRate / 12;
  const n = loanTerm * 12;

  let mortgagePayment = 0;

  if (r > 0) {
    mortgagePayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else {
    mortgagePayment = loanAmount / n;
  }

  const expenses = rent * expenseRatio;
  const noi = rent - expenses;
  const monthlyCashFlow = noi - mortgagePayment;
  const annualCashFlow = monthlyCashFlow * 12;

  const cocReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
  const capRate = propertyValue > 0 ? ((noi * 12) / propertyValue) * 100 : 0;
  const breakEvenRent = expenseRatio < 1 ? mortgagePayment / (1 - expenseRatio) : 0;

  document.getElementById("loanAmount").innerText = formatCurrency(loanAmount);
  document.getElementById("mortgagePayment").innerText = formatCurrency(mortgagePayment);

  const mcf = document.getElementById("monthlyCashFlow");
  mcf.innerText = formatCurrency(monthlyCashFlow);
  mcf.style.color = monthlyCashFlow >= 0 ? "green" : "red";

  document.getElementById("cocReturn").innerText = cocReturn.toFixed(2) + "%";
  document.getElementById("capRate").innerText = capRate.toFixed(2) + "%";
  document.getElementById("breakEvenRent").innerText = formatCurrency(breakEvenRent);

  buildAmortizationTable(loanAmount, mortgagePayment, r, n);
}

function buildAmortizationTable(loanAmount, mortgagePayment, r, n) {
  const tableBody = document.getElementById("amortTable").querySelector("tbody");
  tableBody.innerHTML = "";

  let balance = loanAmount;

  for (let i = 1; i <= n; i++) {
    const interestPayment = balance * r;
    const principalPayment = mortgagePayment - interestPayment;
    let endingBalance = balance - principalPayment;

    if (endingBalance < 0) endingBalance = 0;

    const row = tableBody.insertRow();

    row.innerHTML = `
      <td>${i}</td>
      <td>${formatCurrency(balance)}</td>
      <td>${formatCurrency(mortgagePayment)}</td>
      <td>${formatCurrency(principalPayment)}</td>
      <td>${formatCurrency(interestPayment)}</td>
      <td>${formatCurrency(endingBalance)}</td>
    `;

    balance = endingBalance;

    if (balance <= 0) break;
  }
}

function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}
