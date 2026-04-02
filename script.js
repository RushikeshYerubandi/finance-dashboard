let transactions = JSON.parse(localStorage.getItem("transactions")) || [
  { date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
  { date: "2026-04-02", amount: 200, category: "Food", type: "expense" }
];

let role = "viewer";

// SUMMARY
function updateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.getElementById("income").innerText = "Income: ₹ " + income;
  document.getElementById("expenses").innerText = "Expenses: ₹ " + expense;
  document.getElementById("balance").innerText =
    "Balance: ₹ " + (income - expense);
}

// TABLE
function renderTable(data = transactions) {
  let tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";

  data.forEach(t => {
    tbody.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.amount}</td>
        <td>${t.category}</td>
        <td>${t.type}</td>
      </tr>
    `;
  });
}

// SEARCH
document.getElementById("search").addEventListener("input", (e) => {
  let val = e.target.value.toLowerCase();
  let filtered = transactions.filter(t =>
    t.category.toLowerCase().includes(val)
  );
  renderTable(filtered);
});

// ROLE TOGGLE
function setupRole() {
  const v = document.getElementById("viewerBtn");
  const a = document.getElementById("adminBtn");

  v.onclick = () => {
    role = "viewer";
    v.classList.add("active");
    a.classList.remove("active");
    document.getElementById("adminControls").style.display = "none";
  };

  a.onclick = () => {
    role = "admin";
    a.classList.add("active");
    v.classList.remove("active");
    document.getElementById("adminControls").style.display = "block";
  };
}

// ADD TRANSACTION
function addTransaction() {
  if (role !== "admin") {
    alert("Switch to Admin!");
    return;
  }

  let amount = document.getElementById("amount").value;
  let category = document.getElementById("category").value;
  let type = document.getElementById("type").value;

  if (!amount || !category) {
    alert("Enter valid data");
    return;
  }

  transactions.push({
    date: new Date().toISOString().split("T")[0],
    amount: Number(amount),
    category,
    type
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateSummary();
  renderTable();
  generateInsights();
  drawCharts();

  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
}

// INSIGHTS
function generateInsights() {
  let cat = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      cat[t.category] = (cat[t.category] || 0) + t.amount;
    }
  });

  let max = Object.keys(cat).reduce((a, b) =>
    cat[a] > cat[b] ? a : b
  , "None");

  document.getElementById("insights").innerText =
    "Highest Spending: " + max;
}

// CHARTS
let pieChart, lineChart;

function drawCharts() {
  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();

  let cat = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      cat[t.category] = (cat[t.category] || 0) + t.amount;
    }
  });

  if (Object.keys(cat).length === 0) cat["No Data"] = 1;

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(cat),
      datasets: [{ data: Object.values(cat) }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  let dates = [], balance = 0, data = [];

  transactions.forEach(t => {
    balance += t.type === "income" ? t.amount : -t.amount;
    dates.push(t.date);
    data.push(balance);
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [{ label: "Balance", data }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  updateSummary();
  renderTable();
  generateInsights();
  drawCharts();
  setupRole();

  document.getElementById("adminControls").style.display = "none";
});