
const STORAGE_KEY = "moneymap_transactions";



const totalBalanceEl =
    document.getElementById("totalBalance");

const totalIncomeEl =
    document.getElementById("totalIncome");

const totalExpensesEl =
    document.getElementById("totalExpenses");

const savingsRateEl =
    document.getElementById("savingsRate");

const recentTransactionsEl =
    document.getElementById("recentTransactions");


function getTransactions() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error(
            "Could not load transactions:",
            error
        );

        return [];
    }
}



function formatMoney(amount) {

    return new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 2
    }).format(amount);

}



function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-LK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function getCategoryIcon(category) {

    const icons = {

        Salary: "💰",
        Food: "🍔",
        Shopping: "🛍️",
        Transport: "🚗",
        Bills: "🧾",
        Entertainment: "🎬",
        Health: "❤️",
        Education: "📚",
        Other: "💳"

    };

    return icons[category] || "💳";

}


function updateStatistics() {

    const transactions =
        getTransactions();

    let income = 0;
    let expenses = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(transaction.amount) || 0;

            if (
                transaction.type === "income"
            ) {

                income += amount;

            } else if (
                transaction.type === "expense"
            ) {

                expenses += amount;

            }

        }
    );


    const balance =
        income - expenses;


    let savingsRate = 0;

    if (income > 0) {

        savingsRate =
            (balance / income) * 100;

    }

    if (totalBalanceEl) {

        totalBalanceEl.textContent =
            `Rs. ${formatMoney(balance)}`;

    }

    if (totalIncomeEl) {

        totalIncomeEl.textContent =
            `Rs. ${formatMoney(income)}`;

    }


    if (totalExpensesEl) {

        totalExpensesEl.textContent =
            `Rs. ${formatMoney(expenses)}`;

    }


    if (savingsRateEl) {

        savingsRateEl.textContent =
            `${savingsRate.toFixed(1)}%`;

    }

    if (totalBalanceEl) {

        totalBalanceEl.classList.remove(
            "text-emerald-400",
            "text-red-400",
            "text-white"
        );

        totalBalanceEl.classList.add(
            balance >= 0
                ? "text-emerald-400"
                : "text-red-400"
        );

    }

}



function renderRecentTransactions() {

    if (!recentTransactionsEl) {
        return;
    }

    const transactions =
        getTransactions();


    recentTransactionsEl.innerHTML = "";


   
    if (transactions.length === 0) {

        recentTransactionsEl.innerHTML = `

            <div class="py-10 text-center">

                <div class="text-4xl mb-3">
                    💳
                </div>

                <p class="font-semibold text-slate-300">
                    No transactions yet
                </p>

                <p class="text-sm text-slate-500 mt-1">
                    Add your first income or expense.
                </p>

                <a
                    href="transactions.html"
                    class="inline-block mt-4 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                >
                    + Add Transaction
                </a>

            </div>

        `;

        return;

    }



    const recent =
        transactions.slice(0, 5);


    recent.forEach(
        transaction => {

            const isIncome =
                transaction.type === "income";


            const sign =
                isIncome ? "+" : "-";


            const amountClass =
                isIncome
                    ? "text-emerald-400"
                    : "text-red-400";


            const icon =
                getCategoryIcon(
                    transaction.category
                );


            const row =
                document.createElement("div");


            row.className =
                "flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-b-0";


            row.innerHTML = `

                <div class="flex items-center gap-3 min-w-0">

                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        ${icon}
                    </div>

                    <div class="min-w-0">

                        <div class="font-semibold text-sm truncate">
                            ${escapeHTML(transaction.title)}
                        </div>

                        <div class="text-xs text-slate-500 mt-1">
                            ${escapeHTML(transaction.category)}
                            •
                            ${formatDate(transaction.date)}
                        </div>

                    </div>

                </div>


                <div class="${amountClass} font-bold text-sm whitespace-nowrap">
                    ${sign} Rs. ${formatMoney(transaction.amount)}
                </div>

            `;


            recentTransactionsEl.appendChild(
                row
            );

        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}

let incomeExpenseChart = null;


function updateChart() {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (!canvas) {
        return;
    }


    const transactions =
        getTransactions();


    const currentYear =
        new Date().getFullYear();


    const monthlyIncome =
        Array(12).fill(0);

    const monthlyExpenses =
        Array(12).fill(0);


    transactions.forEach(
        transaction => {

            const date =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            if (
                date.getFullYear() !==
                currentYear
            ) {
                return;
            }


            const month =
                date.getMonth();


            const amount =
                Number(transaction.amount) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                monthlyIncome[month] +=
                    amount;

            } else {

                monthlyExpenses[month] +=
                    amount;

            }

        }
    );


    const ctx =
        canvas.getContext("2d");


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            ctx,
            {
                type: "line",

                data: {

                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec"
                    ],

                    datasets: [

                        {
                            label: "Income",

                            data:
                                monthlyIncome,

                            borderColor:
                                "#34d399",

                            backgroundColor:
                                "rgba(52,211,153,0.08)",

                            borderWidth: 2,

                            tension: 0.4,

                            fill: true,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        },

                        {
                            label: "Expenses",

                            data:
                                monthlyExpenses,

                            borderColor:
                                "#f87171",

                            backgroundColor:
                                "rgba(248,113,113,0.05)",

                            borderWidth: 2,

                            tension: 0.4,

                            fill: true,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {
                        intersect: false,
                        mode: "index"
                    },

                    plugins: {

                        legend: {

                            labels: {
                                color: "#94a3b8"
                            }

                        },

                        tooltip: {

                            backgroundColor:
                                "#0f172a",

                            borderColor:
                                "rgba(255,255,255,0.1)",

                            borderWidth: 1,

                            callbacks: {

                                label:
                                    function(context) {

                                        return `${context.dataset.label}: Rs. ${formatMoney(context.raw)}`;

                                    }

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                color:
                                    "rgba(255,255,255,0.04)"
                            },

                            ticks: {
                                color: "#64748b"
                            }

                        },

                        y: {

                            beginAtZero: true,

                            grid: {
                                color:
                                    "rgba(255,255,255,0.04)"
                            },

                            ticks: {

                                color: "#64748b",

                                callback:
                                    function(value) {

                                        return "Rs. " +
                                            formatMoney(value);

                                    }

                            }

                        }

                    }

                }

            }
        );

}


const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (
    mobileMenuBtn &&
    mobileMenu
) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "hidden"
            );


            mobileMenuBtn.textContent =
                mobileMenu.classList.contains(
                    "hidden"
                )
                    ? "☰"
                    : "✕";

        }
    );


    document
        .querySelectorAll(
            "#mobileMenu a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.add(
                            "hidden"
                        );

                        mobileMenuBtn.textContent =
                            "☰";

                    }
                );

            }
        );

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStatistics();

        renderRecentTransactions();

        updateChart();

    }
);