function calculate() {
    // INPUTS
    let propertyValue = parseFloat(document.getElementById("propertyValue").value);
    let downPayment = parseFloat(document.getElementById("downPayment").value);
    let dpType = document.getElementById("dpType").value;
    let interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    let loanTerm = parseFloat(document.getElementById("loanTerm").value);
    let rent = parseFloat(document.getElementById("rent").value);
    let expenseRatio = parseFloat(document.getElementById("expenseRatio").value) / 100;

    // DOWN PAYMENT CALC
    if (dpType === "percent") {
        downPayment = propertyValue * (downPayment / 100);
    }

    // LOAN AMOUNT
    let loanAmount = propertyValue - downPayment;

    // MORTGAGE FORMULA
    let r = interestRate / 12;
    let n = loanTerm * 12;

    let mortgagePayment = loanAmount * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);

    // EXPENSES
    let expenses = rent * expenseRatio;

    // NOI
    let noi = rent - expenses;

    // MONTHLY CASH FLOW
    let monthlyCashFlow = noi - mortgagePayment;

    // ANNUAL CASH FLOW
    let annualCashFlow = monthlyCashFlow * 12;

    // CASH-ON-CASH RETURN
    let cocReturn = (annualCashFlow / downPayment) * 100;

    // CAP RATE
    let capRate = ((noi * 12) / propertyValue) * 100;

    // UPDATE RESULTS
    document.getElementById("loanAmount").innerText = loanAmount.toLocaleString("en-US", {style: "currency", currency: "USD"});
document.getElementById("mortgagePayment").innerText = mortgagePayment.toLocaleString("en-US", {style: "currency", currency: "USD"});
let monthlyCashFlowEl = document.getElementById("monthlyCashFlow");
monthlyCashFlowEl.innerText = monthlyCashFlow.toLocaleString("en-US", {style: "currency", currency: "USD"});

// Color coding: green for positive, red for negative
monthlyCashFlowEl.style.color = monthlyCashFlow >= 0 ? "green" : "red";

document.getElementById("annualCashFlow").innerText = annualCashFlow.toLocaleString("en-US", {style: "currency", currency: "USD"});
    document.getElementById("cocReturn").innerText = cocReturn.toFixed(2);
    document.getElementById("capRate").innerText = capRate.toFixed(2);

    // ===============================
    //   AMORTIZATION TABLE
    // ===============================
    let balance = loanAmount;
    let table = document.getElementById("amortTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";

    for (let i = 1; i <= n; i++) {
        let interestPayment = balance * r;
        let principalPayment = mortgagePayment - interestPayment;
        let endingBalance = balance - principalPayment;

        let row = table.insertRow();
        row.innerHTML = `
        row.innerHTML = `
    <td>${i}</td>
    <td>${balance.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
    <td>${mortgagePayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
    <td>${principalPayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
    <td>${interestPayment.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
    <td>${endingBalance.toLocaleString("en-US", {style: "currency", currency: "USD"})}</td>
`;

        balance = endingBalance;

        if (balance < 0) break;
    }
}
