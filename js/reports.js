
const STORAGE_KEY = "moneymap_transactions";

function getTransactions() {

    try {

        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        const transactions = JSON.parse(data);

        return Array.isArray(transactions)
            ? transactions
            : [];

    } catch (error) {

        console.error(
            "Could not load transactions:",
            error
        );

        return [];
    }
}


function formatMoney(amount) {

    const number = Number(amount) || 0;

    return "Rs. " + number.toLocaleString("en-LK", {
        maximumFractionDigits: 0
    });
}


function calculateSummary(transactions) {

    let income = 0;

    let expenses = 0;


    transactions.forEach(transaction => {

        const amount =
            Number(transaction.amount) || 0;


        if (transaction.type === "income") {

            income += amount;

        } else if (transaction.type === "expense") {

            expenses += amount;

        }

    });


    const balance =
        income - expenses;


    const savingsRate =
        income > 0
            ? (balance / income) * 100
            : 0;


    return {
        income,
        expenses,
        balance,
        savingsRate
    };
}


function updateSummary(transactions) {

    const summary =
        calculateSummary(transactions);


    const incomeElement =
        document.getElementById("reportIncome");

    const expenseElement =
        document.getElementById("reportExpenses");

    const balanceElement =
        document.getElementById("reportBalance");

    const savingsElement =
        document.getElementById("reportSavings");


    if (incomeElement) {

        incomeElement.textContent =
            formatMoney(summary.income);

    }


    if (expenseElement) {

        expenseElement.textContent =
            formatMoney(summary.expenses);

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(summary.balance);

    }


    if (savingsElement) {

        savingsElement.textContent =
            summary.savingsRate.toFixed(1) + "%";

    }

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function sortTransactions(transactions) {

    return [...transactions].sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date || 0
                ).getTime();

            const dateB =
                new Date(
                    b.date || 0
                ).getTime();


            return dateB - dateA;

        }
    );
}


function renderReportTable(transactions) {

    const container =
        document.getElementById(
            "reportTableContainer"
        );


    if (!container) {
        return;
    }


    if (transactions.length === 0) {

        container.innerHTML = `

            <div class="report-empty">

                <div class="report-empty-icon">
                    📭
                </div>

                <h3>
                    No transactions yet
                </h3>

                <p>
                    Add income or expenses to generate your report.
                </p>

            </div>

        `;

        return;
    }


    const sorted =
        sortTransactions(transactions);


    let rows = "";


    sorted.forEach(transaction => {

        const type =
            transaction.type === "income"
                ? "Income"
                : "Expense";


        const badgeClass =
            transaction.type === "income"
                ? "report-income-badge"
                : "report-expense-badge";


        const amountClass =
            transaction.type === "income"
                ? "report-amount-income"
                : "report-amount-expense";


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        const title =
            transaction.title ||
            transaction.name ||
            "Untitled";


        const category =
            transaction.category ||
            "General";


        const date =
            formatDate(
                transaction.date
            );


        const note =
            transaction.note ||
            "-";


        rows += `

            <tr>

                <td>
                    ${escapeHtml(date)}
                </td>

                <td>

                    <span class="${badgeClass}">
                        ${type}
                    </span>

                </td>

                <td>
                    ${escapeHtml(title)}
                </td>

                <td>
                    ${escapeHtml(category)}
                </td>

                <td class="${amountClass}">
                    ${sign} ${formatMoney(transaction.amount)}
                </td>

                <td>
                    ${escapeHtml(note)}
                </td>

            </tr>

        `;

    });


    container.innerHTML = `

        <table class="report-table">

            <thead>

                <tr>

                    <th>Date</th>

                    <th>Type</th>

                    <th>Title</th>

                    <th>Category</th>

                    <th>Amount</th>

                    <th>Note</th>

                </tr>

            </thead>


            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


function updateReportInformation(transactions) {

    const now =
        new Date();


    const reportDate =
        document.getElementById(
            "reportDate"
        );


    const transactionCount =
        document.getElementById(
            "reportTransactionCount"
        );


    const incomeCount =
        document.getElementById(
            "reportIncomeCount"
        );


    const expenseCount =
        document.getElementById(
            "reportExpenseCount"
        );


    if (reportDate) {

        reportDate.textContent =
            now.toLocaleDateString(
                "en-LK",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    }


    if (transactionCount) {

        transactionCount.textContent =
            transactions.length;

    }


    const incomeTransactions =
        transactions.filter(
            transaction =>
                transaction.type === "income"
        );


    const expenseTransactions =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    if (incomeCount) {

        incomeCount.textContent =
            incomeTransactions.length;

    }


    if (expenseCount) {

        expenseCount.textContent =
            expenseTransactions.length;

    }

}


function downloadPDF() {

    const transactions =
        sortTransactions(
            getTransactions()
        );


    const summary =
        calculateSummary(
            transactions
        );


    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "PDF library could not be loaded. Please check your internet connection."
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF();


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(22);

    doc.setTextColor(
        16,
        185,
        129
    );

    doc.text(
        "MoneyMap",
        20,
        22
    );


    doc.setFontSize(11);

    doc.setTextColor(
        100,
        116,
        139
    );

    doc.text(
        "Personal Finance Report",
        20,
        30
    );


    const currentDate =
        new Date().toLocaleDateString(
            "en-LK"
        );


    doc.text(
        `Generated: ${currentDate}`,
        145,
        22
    );


    doc.setFontSize(14);

    doc.setTextColor(
        15,
        23,
        42
    );

    doc.text(
        "Financial Summary",
        20,
        45
    );


    doc.setFontSize(11);


    doc.text(
        `Total Income: ${formatMoney(summary.income)}`,
        20,
        55
    );


    doc.text(
        `Total Expenses: ${formatMoney(summary.expenses)}`,
        20,
        63
    );


    doc.text(
        `Balance: ${formatMoney(summary.balance)}`,
        20,
        71
    );


    doc.text(
        `Savings Rate: ${summary.savingsRate.toFixed(1)}%`,
        20,
        79
    );


    const tableRows =
        transactions.map(
            transaction => {

                const type =
                    transaction.type === "income"
                        ? "Income"
                        : "Expense";


                const title =
                    transaction.title ||
                    transaction.name ||
                    "Untitled";


                const category =
                    transaction.category ||
                    "General";


                const note =
                    transaction.note ||
                    "-";


                const amount =
                    `${transaction.type === "income" ? "+" : "-"} ${formatMoney(transaction.amount)}`;


                return [
                    formatDate(transaction.date),
                    type,
                    title,
                    category,
                    amount,
                    note
                ];

            }
        );


    if (
        typeof doc.autoTable === "function"
    ) {

        doc.autoTable({

            startY: 90,

            head: [[
                "Date",
                "Type",
                "Title",
                "Category",
                "Amount",
                "Note"
            ]],

            body: tableRows,

            theme: "grid",

            styles: {
                fontSize: 8,
                cellPadding: 3
            },

            headStyles: {
                fillColor: [
                    15,
                    23,
                    42
                ],

                textColor: [
                    255,
                    255,
                    255
                ],

                fontStyle: "bold"
            },

            alternateRowStyles: {
                fillColor: [
                    248,
                    250,
                    252
                ]
            }

        });

    } else {

        let y = 95;


        transactions.forEach(
            transaction => {

                doc.setFontSize(9);

                doc.text(
                    `${formatDate(transaction.date)} - ${transaction.title || "Transaction"} - ${formatMoney(transaction.amount)}`,
                    20,
                    y
                );

                y += 7;


                if (y > 280) {

                    doc.addPage();

                    y = 20;

                }

            }
        );

    }


    const pageCount =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        doc.setPage(page);

        const pageHeight =
            doc.internal.pageSize.height;


        doc.setFontSize(8);

        doc.setTextColor(
            100,
            116,
            139
        );


        doc.text(
            `MoneyMap • Page ${page} of ${pageCount}`,
            20,
            pageHeight - 10
        );

    }


    doc.save(
        "MoneyMap-Financial-Report.pdf"
    );

}



function printReport() {

    window.print();

}


function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuBtn"
        );


    const menu =
        document.getElementById(
            "mobileMenu"
        );


    if (!button || !menu) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            menu.classList.toggle(
                "hidden"
            );


            if (
                menu.classList.contains(
                    "hidden"
                )
            ) {

                button.textContent =
                    "☰";

            } else {

                button.textContent =
                    "✕";

            }

        }
    );


    const links =
        menu.querySelectorAll(
            "a"
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                menu.classList.add(
                    "hidden"
                );

                button.textContent =
                    "☰";

            }
        );

    });

}


function updateYear() {

    const year =
        document.getElementById(
            "reportsYear"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const transactions =
            getTransactions();


        updateSummary(
            transactions
        );


        renderReportTable(
            transactions
        );


        updateReportInformation(
            transactions
        );


        updateYear();


        setupMobileMenu();

        const pdfButton =
            document.getElementById(
                "downloadPdf"
            );


        if (pdfButton) {

            pdfButton.addEventListener(
                "click",
                downloadPDF
            );

        }


        /* Print */

        const printButton =
            document.getElementById(
                "printReport"
            );


        if (printButton) {

            printButton.addEventListener(
                "click",
                printReport
            );

        }

    }
);