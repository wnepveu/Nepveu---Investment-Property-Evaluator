document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("calculateBtn").addEventListener("click", calculate);
    document.getElementById("toggle-expenses-btn").addEventListener("click", toggleDetails);
    document.getElementById("help-icon").addEventListener("click", toggleHelp);

    // Listen for changes in detailed expenses
    ["taxes", "insurance", "maintenance", "management", "vacancy", "otherExp"]
        .forEach(id => {
            document.getElementById(id).addEventListener("input", updateExpenseRatioFromDetails);
        });
});

/* -----------------------------
   TOGGLE DETAILED EXPENSES
--------------------------------*/
function toggleDetails() {
    let box = document.getElementById("detailed-expenses");
    let btn = document.getElementById("toggle-expenses-btn");

    if (box.style.display === "none") {
        box.style.display = "block";
        btn.innerText = "Hide Detailed Expenses";
    } else {
        box.style.display = "none";
        btn.innerText = "Show Detailed Expenses";
    }
}

/* -----------------------------
   HELP POPUP TOGGLE
--------------------------------*/
function toggleHelp() {
    let popup = document.getElementById("help-popup");
    popup.style.display = popup.style.display === "block" ? "none" : "block";
}

/* -----------------------------
   UPDATE EXPENSE RATIO
--------------------------------*/
function updateExpenseRatioFromDetails() {

    let rent = parseFloat(document.getElementById("rent").value) || 0;

    // Dollar values — allow blank inputs
    let taxes = parseFloat(document.getElementById("taxes").value);
    let insurance = parseFloat(document.getElementById("insurance").value);
    let other = parseFloat(document.getElementById("otherExp").value);

    // Percent values — allow blank inputs
    let maintenance = parseFloat(document.getElementById("maintenance").value);
    let management = parseFloat(document.getElementById("management").value);
    let vacancy = parseFloat(document.getElementById("vacancy").value);

    // Convert percentages to decimals, handle empty fields
    maintenance = maintenance ? maintenance / 100 : 0;
    management = management ? management / 100 : 0;
    vacancy = vacancy ? vacancy / 100 : 0;

    // Convert monthly rent to yearly for consistency
    let annualRent = rent * 12;

    let annualExpenses =
        (taxes || 0) +
        (insurance || 0) +
        (other || 0) +
        (annualRent * maintenance) +
        (annualRent * management) +
        (annualRent * vacancy);

    let ratio = annualRent > 0 ? (annualExpenses / annualRent) * 100 : 0;

    document.getElementById("expenseRatio").value = ratio.toFixed(2);
}

/* -----------------------------
   CALCULATE MAIN MODEL
--------------------------------*/
function calculate() {

    let propertyValue = parseFloat(document.getElementById("propertyValue").value);
    let downPayment = parseFloat(document.getElementById("downPayment").value);
    let dpType = document.getElementById("dpType").value;
    let interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    let loanTerm = parseFloat(document.getElementById("loanTerm").value);
    let rent = parseFloat(document.getElementById("rent").value);
    let expenseRatio = parseFloat(document.getElementById("expenseRatio").value) / 100;

    if (dpType === "percent") {
        downPayment = propertyValue * (downPayment / 100);
    }

    let loanAmount = propertyValue - downPayment;
    let r = interestRate / 12;
    let n = loanTerm * 12;

    let mortgagePayment =
        loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    let expenses = rent * expenseRatio;
    let noi = rent - expenses;

    let monthlyCashFlow = noi - mortgagePayment;
    let annualCashFlow = monthlyCashFlow * 12;
    let cocReturn = (annualCashFlow / downPayment) * 100;
    let capRate = (noi * 12 / propertyValue) * 100;

    document.getElementById("loanAmount").innerText =
        loanAmount.toLocaleString("en-US", { style: "currency", currency: "USD" });

    document.getElementById("mortgagePayment").innerText =
        mortgagePayment.toLocaleString("en-US", { style: "currency", currency: "USD" });

    let mcf = document.getElementById("monthlyCashFlow");
    mcf.innerText =
        monthlyCashFlow.toLocaleString("en-US", { style: "currency", currency: "USD" });
    mcf.style.color = monthlyCashFlow >= 0 ? "green" : "red";

    document.getElementById("cocReturn").innerText = cocReturn.toFixed(2) + "%";
    document.getElementById("capRate").innerText = capRate.toFixed(2) + "%";

    // Amortization Table
    let tableBody = document.getElementById("amortTable").querySelector("tbody");
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
