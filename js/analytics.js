
const STORAGE_KEY = "moneymap_transactions";


const analyticsIncome =
    document.getElementById(
        "analyticsIncome"
    );

const analyticsExpenses =
    document.getElementById(
        "analyticsExpenses"
    );

const analyticsBalance =
    document.getElementById(
        "analyticsBalance"
    );

const analyticsSavings =
    document.getElementById(
        "analyticsSavings"
    );

const monthlySummaryBody =
    document.getElementById(
        "monthlySummaryBody"
    );

const insightsContainer =
    document.getElementById(
        "insightsContainer"
    );


function getTransactions() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Unable to load transactions:",
            error
        );

        return [];

    }

}




function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-LK",
        {
            maximumFractionDigits: 2
        }
    ).format(amount);

}


const monthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];

function getMonthlyData() {

    const transactions =
        getTransactions();

    const income =
        Array(12).fill(0);

    const expenses =
        Array(12).fill(0);


    transactions.forEach(
        transaction => {

            if (!transaction.date) {
                return;
            }

            const date =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );

            const month =
                date.getMonth();

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income[month] += amount;

            } else if (
                transaction.type ===
                "expense"
            ) {

                expenses[month] += amount;

            }

        }
    );


    return {
        income,
        expenses
    };

}



function updateSummary() {

    const transactions =
        getTransactions();

    let income = 0;

    let expenses = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            } else {

                expenses += amount;

            }

        }
    );


    const balance =
        income - expenses;


    const savingsRate =
        income > 0
            ? (balance / income) * 100
            : 0;


    analyticsIncome.textContent =
        `Rs. ${formatMoney(income)}`;


    analyticsExpenses.textContent =
        `Rs. ${formatMoney(expenses)}`;


    analyticsBalance.textContent =
        `Rs. ${formatMoney(balance)}`;


    analyticsSavings.textContent =
        `${savingsRate.toFixed(1)}%`;


    if (balance >= 0) {

        analyticsBalance.classList.remove(
            "text-red-400"
        );

        analyticsBalance.classList.add(
            "text-blue-400"
        );

    } else {

        analyticsBalance.classList.remove(
            "text-blue-400"
        );

        analyticsBalance.classList.add(
            "text-red-400"
        );

    }

}


let monthlyChartInstance = null;


function createMonthlyChart() {

    const canvas =
        document.getElementById(
            "monthlyChart"
        );

    if (!canvas) {
        return;
    }


    const data =
        getMonthlyData();


    if (monthlyChartInstance) {

        monthlyChartInstance.destroy();

    }


    monthlyChartInstance =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels: monthNames.map(
                        month =>
                            month.substring(
                                0,
                                3
                            )
                    ),

                    datasets: [

                        {

                            label:
                                "Income",

                            data:
                                data.income,

                            backgroundColor:
                                "rgba(52,211,153,0.75)",

                            borderRadius:
                                6

                        },

                        {

                            label:
                                "Expenses",

                            data:
                                data.expenses,

                            backgroundColor:
                                "rgba(248,113,113,0.75)",

                            borderRadius:
                                6

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#94a3b8"

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
                                    context =>
                                        `${context.dataset.label}: Rs. ${formatMoney(context.raw)}`

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

                                color:
                                    "#64748b"

                            }

                        },

                        y: {

                            beginAtZero:
                                true,

                            grid: {

                                color:
                                    "rgba(255,255,255,0.04)"

                            },

                            ticks: {

                                color:
                                    "#64748b",

                                callback:
                                    value =>
                                        "Rs. " +
                                        formatMoney(
                                            value
                                        )

                            }

                        }

                    }

                }

            }
        );

}


function getCategoryData() {

    const transactions =
        getTransactions();

    const categories = {};


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {
                return;
            }


            const category =
                transaction.category ||
                "Other";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                !categories[category]
            ) {

                categories[category] =
                    0;

            }


            categories[category] +=
                amount;

        }
    );


    return categories;

}


let categoryChartInstance = null;


function createCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );

    if (!canvas) {
        return;
    }


    const categories =
        getCategoryData();


    const labels =
        Object.keys(categories);


    const values =
        Object.values(categories);


    if (categoryChartInstance) {

        categoryChartInstance.destroy();

    }


    // No expenses
    if (labels.length === 0) {

        categoryChartInstance =
            new Chart(
                canvas.getContext("2d"),
                {

                    type: "doughnut",

                    data: {

                        labels: [
                            "No Expenses"
                        ],

                        datasets: [

                            {

                                data: [1],

                                backgroundColor: [
                                    "rgba(100,116,139,0.25)"
                                ],

                                borderWidth: 0

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                labels: {

                                    color:
                                        "#94a3b8"

                                }

                            }

                        }

                    }

                }
            );

        return;

    }


    const chartColors = [

        "#34d399",
        "#60a5fa",
        "#f87171",
        "#fbbf24",
        "#a78bfa",
        "#fb7185",
        "#22d3ee",
        "#c084fc",
        "#84cc16"

    ];


    categoryChartInstance =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor:
                                chartColors,

                            borderColor:
                                "#020617",

                            borderWidth: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "65%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    "#94a3b8",

                                padding:
                                    14

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return `${context.label}: Rs. ${formatMoney(context.raw)}`;

                                    }

                            }

                        }

                    }

                }

            }
        );

}


function renderMonthlySummary() {

    const data =
        getMonthlyData();


    monthlySummaryBody.innerHTML =
        "";


    monthNames.forEach(
        (month, index) => {

            const income =
                data.income[index];

            const expenses =
                data.expenses[index];

            const balance =
                income - expenses;


            const row =
                document.createElement(
                    "tr"
                );


            row.className =
                "border-b border-white/5";


            const balanceClass =
                balance >= 0
                    ? "text-emerald-400"
                    : "text-red-400";


            row.innerHTML = `

                <td class="px-5 py-4 font-medium text-sm">
                    ${month}
                </td>

                <td class="px-5 py-4 text-right text-sm text-emerald-400">
                    Rs. ${formatMoney(income)}
                </td>

                <td class="px-5 py-4 text-right text-sm text-red-400">
                    Rs. ${formatMoney(expenses)}
                </td>

                <td class="px-5 py-4 text-right text-sm font-semibold ${balanceClass}">
                    Rs. ${formatMoney(balance)}
                </td>

            `;


            monthlySummaryBody.appendChild(
                row
            );

        }
    );

}


function renderInsights() {

    const transactions =
        getTransactions();


    insightsContainer.innerHTML =
        "";


    if (
        transactions.length === 0
    ) {

        insightsContainer.innerHTML = `

            <div
                class="
                    summary-item
                    rounded-xl
                    p-4
                "
            >

                <div class="text-2xl mb-2">
                    📊
                </div>

                <p class="text-sm font-semibold">
                    No data yet
                </p>

                <p class="text-xs text-slate-500 mt-1">
                    Add some transactions to see financial insights.
                </p>

            </div>

        `;

        return;

    }


    let income = 0;

    let expenses = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            } else {

                expenses += amount;

            }

        }
    );


    const balance =
        income - expenses;


    const categories =
        getCategoryData();


    const categoryEntries =
        Object.entries(
            categories
        );


    categoryEntries.sort(
        (a, b) => b[1] - a[1]
    );


    if (
        categoryEntries.length > 0
    ) {

        const highest =
            categoryEntries[0];


        addInsight(
            "🏷️",
            "Highest spending category",
            `${highest[0]} — Rs. ${formatMoney(highest[1])}`
        );

    }


    if (income > 0) {

        const savingsRate =
            (balance / income) * 100;


        addInsight(
            "💰",
            "Savings rate",
            `${savingsRate.toFixed(1)}% of your income remains after expenses.`
        );

    }


    addInsight(
        "🧾",
        "Transactions recorded",
        `${transactions.length} transaction${
            transactions.length === 1
                ? ""
                : "s"
        } in MoneyMap.`
    );


    if (balance >= 0) {

        addInsight(
            "✅",
            "Current balance",
            `Your recorded income is Rs. ${formatMoney(balance)} higher than your recorded expenses.`
        );

    } else {

        addInsight(
            "⚠️",
            "Current balance",
            `Recorded expenses are Rs. ${formatMoney(Math.abs(balance))} higher than recorded income.`
        );

    }

}


function addInsight(
    icon,
    title,
    description
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "summary-item rounded-xl p-4";


    element.innerHTML = `

        <div class="flex items-start gap-3">

            <div
                class="
                    w-10
                    h-10
                    rounded-xl
                    bg-white/5
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                "
            >
                ${icon}
            </div>


            <div>

                <div
                    class="
                        text-sm
                        font-semibold
                    "
                >
                    ${title}
                </div>


                <div
                    class="
                        text-xs
                        text-slate-500
                        mt-1
                        leading-relaxed
                    "
                >
                    ${description}
                </div>

            </div>

        </div>

    `;


    insightsContainer.appendChild(
        element
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

        updateSummary();

        createMonthlyChart();

        createCategoryChart();

        renderMonthlySummary();

        renderInsights();

    }
);