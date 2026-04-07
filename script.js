document.addEventListener("DOMContentLoaded", function () {
    // Main calculate button
    document.getElementById("calculateBtn").addEventListener("click", calculate);

    // Toggle detailed expense section
    const btn = document.getElementById("toggle-expenses-btn");
    const section = document.getElementById("detailed-expenses");

    btn.addEventListener("click", () => {
        if (section.style.display === "none") {
            section.style.display = "block";
            btn.textContent = "Hide Detailed Expenses";
        } else {
            section.style.display = "none";
            btn.textContent = "Show Detailed Expenses";
        }
    });

    // Listen for detailed expenses changing
    ["taxes", "insurance", "maintenance"].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.addEventListener("input", updateExpenseRatioFromDetails);
    });
});

/* -----------------------------
   UPDATE EXPENSE RATIO BASED ON DETAILED INPUTS
--------------------------------*/
function updateExpenseRatioFromDetails() {
    let rent = parseFloat(document.getElementById("rent").value) || 0;

    let taxes = parseFloat(document.getElementById("taxes").value) || 0;
    let insurance = parseFloat(document.getElementById("insurance").value) || 0;
    let maintenancePct = parseFloat(document.getElementById("maintenance").value) || 0;

    // Convert maintenance % -> monthly dollars
    let maintenance = rent * (maintenancePct / 100);

    let totalMonthlyExpenses = (taxes + insurance) / 12 + maintenance;

    let ratio = rent > 0 ? (totalMonthlyExpenses / rent) * 100 : 0;

    document.getElementById("expenseRatio").value = ratio.toFixed(2);
}

/* -----------------------------
   MAIN CALCULATE FUNCTION
--------------------------------*/
function calculate() {
    // INPUTS
    let propertyValue = parseFloat(document.getElementById("propertyValue").value);
    let downPayment = parseFloat(document.getElementById("downPayment").value);
    let dpType = document.getElementById("dpType").value;
    let interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    let loanTerm = parseFloat(document.getElementById("loanTerm").value);
    let rent = parseFloat(document.getElementById("rent").value);
    let expenseRatio = parseFloat(document.getElementById("expenseRatio").value) / 100;

    // Convert down payment if percent
    if (dpType === "percent") {
        downPayment = propertyValue * (downPayment / 100);
    }

    // LOAN AMOUNT & MORTGAGE
    let loanAmount = propertyValue - downPayment;
    let r = interestRate / 12;
    let n = loanTerm * 12;
    let mortgagePayment =
        loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // CASH FLOW & PERFORMANCE
    let expenses = rent * expenseRatio;
    let noi = rent - expenses;
    let monthlyCashFlow = noi - mortgagePayment;
    let annualCashFlow = monthlyCashFlow * 12;
    let cocReturn = (annualCashFlow / downPayment) * 100;
    let capRate = (noi * 12 / propertyValue) * 100;

    // UPDATE RESULTS
    document.getElementById("loanAmount").innerText =
        loanAmount.toLocaleString("en-US", { style: "currency", currency: "USD" });

    document.getElementById("mortgagePayment").innerText =
        mortgagePayment.toLocaleString("en-US", { style: "currency", currency: "USD" });

    let monthlyCashFlowEl = document.getElementById("monthlyCashFlow");
    monthlyCashFlowEl.innerText =
        monthlyCashFlow.toLocaleString("en-US", { style: "currency", currency: "USD" });
    monthlyCashFlowEl.style.color = monthlyCashFlow >= 0 ? "green" : "red";

    document.getElementById("cocReturn").innerText = cocReturn.toFixed(2) + "%";
    document.getElementById("capRate").innerText = capRate.toFixed(2) + "%";

    // AMORTIZATION TABLE
    let tableBody = document
        .getElementById("amortTable")
        .getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    let balance = loanAmount;
    for (let i = 1; i <= n; i++) {
        let interestPayment = balance * r;
        let principalPayment = mortgagePayment - interestPayment;
        let endingBalance = balance - principalPayment;

        let row = tableBody.insertRow();
        row.innerHTML = `
            <td>${i}</td>
            <td>${balance.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
            <td>${mortgagePayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
            <td>${principalPayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
            <td>${interestPayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
            <td>${endingBalance.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
        `;

        balance = endingBalance;
        if (balance <= 0) break;
    }
}
