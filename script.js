document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("calculateBtn").addEventListener("click", calculate);
});

function calculate() {
    // ====================
    // READ AND CLEAN INPUTS
    // ====================
    let propertyValue = parseFloat(document.getElementById("propertyValue").value.replace(/[^0-9.-]+/g,""));
    let downPayment = parseFloat(document.getElementById("downPayment").value.replace(/[^0-9.-]+/g,""));
    let dpType = document.getElementById("dpType").value;
    let interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    let loanTerm = parseFloat(document.getElementById("loanTerm").value);
    let rent = parseFloat(document.getElementById("rent").value.replace(/[^0-9.-]+/g,""));
    let expenseRatio = parseFloat(document.getElementById("expenseRatio").value) / 100;

    // ====================
    // FORMAT INPUTS LIKE OUTPUTS
    // ====================
    document.getElementById("propertyValue").value =
        propertyValue.toLocaleString("en-US", {style: "currency", currency: "USD"});

    document.getElementById("rent").value =
        rent.toLocaleString("en-US", {style: "currency", currency: "USD"});

    // For down payment, only format if it's in dollars
    if (dpType === "dollar") {
        document.getElementById("downPayment").value =
            downPayment.toLocaleString("en-US", {style: "currency", currency: "USD"});
    }

    // ====================
    // CALCULATIONS
    // ====================
    if (dpType === "percent") {
        downPayment = propertyValue * (downPayment / 100);
    }

    let loanAmount = propertyValue - downPayment;
    let r = interestRate / 12;
    let n = loanTerm * 12;
    let mortgagePayment = loanAmount * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);

    let expenses = rent * expenseRatio;
    let noi = rent - expenses;
    let monthlyCashFlow = noi - mortgagePayment;
    let annualCashFlow = monthlyCashFlow * 12;
    let cocReturn = (annualCashFlow / downPayment) * 100;
    let capRate = (noi * 12 / propertyValue) * 100;

    // ====================
    // UPDATE OUTPUTS
    // ====================
    document.getElementById("loanAmount").innerText =
        loanAmount.toLocaleString("en-US", {style: "currency", currency: "USD"});
    document.getElementById("mortgagePayment").innerText =
        mortgagePayment.toLocaleString("en-US", {style: "currency", currency: "USD"});

    let monthlyCashFlowEl = document.getElementById("monthlyCashFlow");
    monthlyCashFlowEl.innerText =
        monthlyCashFlow.toLocaleString("en-US", {style: "currency", currency: "USD"});
    monthlyCashFlowEl.style.color = monthlyCashFlow >= 0 ? "green" : "red";

    document.getElementById("cocReturn").innerText = cocReturn.toFixed(2) + "%";
    document.getElementById("capRate").innerText = capRate.toFixed(2) + "%";

    // ====================
    // AMORTIZATION TABLE
    // ====================
    let tableBody = document.getElementById("amortTable").getElementsByTagName("tbody")[0];
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
        if (balance <= 0) break; // stop loop when loan is fully paid
    }
}
