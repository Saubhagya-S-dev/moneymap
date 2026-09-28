
const STORAGE_KEY = "moneymap_transactions";


const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

const openAddTransaction =
    document.getElementById("openAddTransaction");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");

const transactionModal =
    document.getElementById("transactionModal");

const closeModal =
    document.getElementById("closeModal");

const cancelModal =
    document.getElementById("cancelModal");

const transactionForm =
    document.getElementById("transactionForm");

const modalTitle =
    document.getElementById("modalTitle");

const transactionId =
    document.getElementById("transactionId");

const transactionTitle =
    document.getElementById("transactionTitle");

const transactionCategory =
    document.getElementById("transactionCategory");

const transactionAmount =
    document.getElementById("transactionAmount");

const transactionDate =
    document.getElementById("transactionDate");

const transactionNote =
    document.getElementById("transactionNote");

const transactionsList =
    document.getElementById("transactionsList");

const emptyState =
    document.getElementById("emptyState");

const searchTransactions =
    document.getElementById("searchTransactions");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const dateFilter =
    document.getElementById("dateFilter");

const clearFilters =
    document.getElementById("clearFilters");

const transactionCount =
    document.getElementById("transactionCount");

const totalIncome =
    document.getElementById("totalIncome");

const totalExpenses =
    document.getElementById("totalExpenses");

const totalBalance =
    document.getElementById("totalBalance");

function getTransactions() {

    const savedTransactions =
        localStorage.getItem(STORAGE_KEY);

    if (!savedTransactions) {
        return [];
    }

    try {

        return JSON.parse(savedTransactions);

    } catch (error) {

        console.error(
            "Unable to read transactions:",
            error
        );

        return [];

    }

}



function saveTransactions(transactions) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

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

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-LK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

function getTodayString() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function openModal(transaction = null) {

    transactionModal.classList.remove("hidden");

    document.body.classList.add("overflow-hidden");

    if (transaction) {

        modalTitle.textContent =
            "Edit Transaction";

        transactionId.value =
            transaction.id;

        transactionTitle.value =
            transaction.title;

        transactionCategory.value =
            transaction.category;

        transactionAmount.value =
            transaction.amount;

        transactionDate.value =
            transaction.date;

        transactionNote.value =
            transaction.note || "";

        const selectedType =
            document.querySelector(
                `input[name="transactionType"][value="${transaction.type}"]`
            );

        if (selectedType) {
            selectedType.checked = true;
        }

    } else {

        modalTitle.textContent =
            "Add Transaction";

        transactionForm.reset();

        transactionId.value = "";

        transactionDate.value =
            getTodayString();

        document.querySelector(
            'input[name="transactionType"][value="income"]'
        ).checked = true;

    }

}

function closeTransactionModal() {

    transactionModal.classList.add("hidden");

    document.body.classList.remove(
        "overflow-hidden"
    );

    transactionForm.reset();

    transactionId.value = "";

}

openAddTransaction.addEventListener(
    "click",
    () => openModal()
);

emptyAddBtn.addEventListener(
    "click",
    () => openModal()
);

closeModal.addEventListener(
    "click",
    closeTransactionModal
);

cancelModal.addEventListener(
    "click",
    closeTransactionModal
);


transactionModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            transactionModal
        ) {

            closeTransactionModal();

        }

    }
);


transactionForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const selectedType =
            document.querySelector(
                'input[name="transactionType"]:checked'
            );

        const type =
            selectedType
                ? selectedType.value
                : "expense";

        const title =
            transactionTitle.value.trim();

        const category =
            transactionCategory.value;

        const amount =
            Number(transactionAmount.value);

        const date =
            transactionDate.value;

        const note =
            transactionNote.value.trim();

        if (
            !title ||
            !category ||
            !amount ||
            amount <= 0 ||
            !date
        ) {

            alert(
                "Please fill in all required fields."
            );

            return;

        }


        let transactions =
            getTransactions();


        if (transactionId.value) {

            const id =
                Number(transactionId.value);

            transactions =
                transactions.map(
                    (transaction) => {

                        if (
                            Number(transaction.id) === id
                        ) {

                            return {
                                ...transaction,
                                type,
                                title,
                                category,
                                amount,
                                date,
                                note
                            };

                        }

                        return transaction;

                    }
                );

        }


        else {

            const newTransaction = {

                id: Date.now(),

                type,

                title,

                category,

                amount,

                date,

                note

            };

            transactions.unshift(
                newTransaction
            );

        }


        saveTransactions(
            transactions
        );

        closeTransactionModal();

        renderTransactions();

        updateSummary();

    }
);


function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );

    if (!confirmed) {
        return;
    }

    let transactions =
        getTransactions();

    transactions =
        transactions.filter(
            (transaction) =>
                Number(transaction.id) !==
                Number(id)
        );

    saveTransactions(
        transactions
    );

    renderTransactions();

    updateSummary();

}


function editTransaction(id) {

    const transactions =
        getTransactions();

    const transaction =
        transactions.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );

    if (!transaction) {
        return;
    }

    openModal(transaction);

}


function getFilteredTransactions() {

    const transactions =
        getTransactions();

    const search =
        searchTransactions.value
            .trim()
            .toLowerCase();

    const selectedType =
        typeFilter.value;

    const selectedCategory =
        categoryFilter.value;

    const selectedDate =
        dateFilter.value;


    return transactions.filter(
        (transaction) => {

            // Search
            const matchesSearch =
                !search ||
                transaction.title
                    .toLowerCase()
                    .includes(search) ||
                transaction.category
                    .toLowerCase()
                    .includes(search) ||
                (transaction.note || "")
                    .toLowerCase()
                    .includes(search);


            // Type
            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;


            // Category
            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category ===
                    selectedCategory;


            // Date
            let matchesDate = true;

            const transactionDateValue =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );

            const today =
                new Date();

            if (
                selectedDate ===
                "today"
            ) {

                matchesDate =
                    transaction.date ===
                    getTodayString();

            }


            if (
                selectedDate ===
                "week"
            ) {

                const startOfWeek =
                    new Date(today);

                const day =
                    startOfWeek.getDay();

                const difference =
                    day === 0
                        ? 6
                        : day - 1;

                startOfWeek.setDate(
                    today.getDate() -
                    difference
                );

                startOfWeek.setHours(
                    0,
                    0,
                    0,
                    0
                );

                matchesDate =
                    transactionDateValue >=
                    startOfWeek &&
                    transactionDateValue <=
                    today;

            }


            if (
                selectedDate ===
                "month"
            ) {

                matchesDate =
                    transactionDateValue
                        .getMonth() ===
                        today.getMonth() &&
                    transactionDateValue
                        .getFullYear() ===
                        today.getFullYear();

            }


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory &&
                matchesDate
            );

        }
    );

}



function renderTransactions() {

    const transactions =
        getFilteredTransactions();

    transactionsList.innerHTML = "";

    if (transactions.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

    } else {

        emptyState.classList.add(
            "hidden"
        );

    }


    transactionCount.textContent =
        `${transactions.length} ${
            transactions.length === 1
                ? "transaction"
                : "transactions"
        }`;


    transactions.forEach(
        (transaction) => {

            const isIncome =
                transaction.type ===
                "income";


            const amountClass =
                isIncome
                    ? "text-emerald-400"
                    : "text-red-400";


            const sign =
                isIncome
                    ? "+"
                    : "-";


            const icon =
                getCategoryIcon(
                    transaction.category
                );


            const typeBadge =
                isIncome
                    ? `
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                            Income
                        </span>
                    `
                    : `
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                            Expense
                        </span>
                    `;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "border-b border-white/5 last:border-b-0";


            row.innerHTML = `

                <!-- Desktop -->
                <div class="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center px-6 py-5">

                    <div class="flex items-center gap-3 min-w-0">

                        <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                            ${icon}
                        </div>

                        <div class="min-w-0">

                            <div class="font-semibold truncate">
                                ${escapeHTML(transaction.title)}
                            </div>

                            <div class="text-xs text-slate-500 truncate">
                                ${escapeHTML(transaction.category)}
                            </div>

                        </div>

                    </div>

                    <div>
                        ${typeBadge}
                    </div>

                    <div class="text-sm text-slate-400">
                        ${formatDate(transaction.date)}
                    </div>

                    <div class="${amountClass} font-bold">
                        ${sign} Rs. ${formatMoney(transaction.amount)}
                    </div>

                    <div class="flex justify-end gap-2">

                        <button
                            onclick="editTransaction(${transaction.id})"
                            class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition"
                            title="Edit"
                        >
                            ✏️
                        </button>

                        <button
                            onclick="deleteTransaction(${transaction.id})"
                            class="w-9 h-9 rounded-lg bg-white/5 hover:bg-red-500/10 transition"
                            title="Delete"
                        >
                            🗑️
                        </button>

                    </div>

                </div>


                <!-- Mobile -->
                <div class="md:hidden p-4">

                    <div class="flex items-start justify-between gap-3">

                        <div class="flex items-center gap-3 min-w-0">

                            <div class="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                ${icon}
                            </div>

                            <div class="min-w-0">

                                <div class="font-semibold truncate">
                                    ${escapeHTML(transaction.title)}
                                </div>

                                <div class="text-xs text-slate-500 mt-1">
                                    ${escapeHTML(transaction.category)}
                                </div>

                            </div>

                        </div>

                        <div class="${amountClass} font-bold whitespace-nowrap">
                            ${sign} Rs. ${formatMoney(transaction.amount)}
                        </div>

                    </div>


                    <div class="flex items-center justify-between mt-4 pt-3 border-t border-white/5">

                        <div class="flex items-center gap-2">

                            ${typeBadge}

                            <span class="text-xs text-slate-500">
                                ${formatDate(transaction.date)}
                            </span>

                        </div>


                        <div class="flex gap-2">

                            <button
                                onclick="editTransaction(${transaction.id})"
                                class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                ✏️
                            </button>

                            <button
                                onclick="deleteTransaction(${transaction.id})"
                                class="w-9 h-9 rounded-lg bg-white/5 hover:bg-red-500/10"
                            >
                                🗑️
                            </button>

                        </div>

                    </div>


                    ${
                        transaction.note
                            ? `
                                <div class="mt-3 text-xs text-slate-500 bg-white/[0.03] rounded-lg p-3">
                                    ${escapeHTML(transaction.note)}
                                </div>
                            `
                            : ""
                    }

                </div>

            `;


            transactionsList.appendChild(
                row
            );

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

function updateSummary() {

    const transactions =
        getTransactions();


    let income = 0;

    let expenses = 0;


    transactions.forEach(
        (transaction) => {

            if (
                transaction.type ===
                "income"
            ) {

                income +=
                    Number(
                        transaction.amount
                    );

            } else {

                expenses +=
                    Number(
                        transaction.amount
                    );

            }

        }
    );


    const balance =
        income - expenses;


    totalIncome.textContent =
        `Rs. ${formatMoney(income)}`;


    totalExpenses.textContent =
        `Rs. ${formatMoney(expenses)}`;


    totalBalance.textContent =
        `Rs. ${formatMoney(balance)}`;


    if (balance < 0) {

        totalBalance.classList.remove(
            "text-white",
            "text-emerald-400"
        );

        totalBalance.classList.add(
            "text-red-400"
        );

    } else {

        totalBalance.classList.remove(
            "text-red-400"
        );

        totalBalance.classList.add(
            "text-emerald-400"
        );

    }

}

searchTransactions.addEventListener(
    "input",
    renderTransactions
);

typeFilter.addEventListener(
    "change",
    renderTransactions
);

categoryFilter.addEventListener(
    "change",
    renderTransactions
);

dateFilter.addEventListener(
    "change",
    renderTransactions
);


clearFilters.addEventListener(
    "click",
    () => {

        searchTransactions.value =
            "";

        typeFilter.value =
            "all";

        categoryFilter.value =
            "all";

        dateFilter.value =
            "all";

        renderTransactions();

    }
);


mobileMenuBtn.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "hidden"
        );


        if (
            mobileMenu.classList.contains(
                "hidden"
            )
        ) {

            mobileMenuBtn.textContent =
                "☰";

        } else {

            mobileMenuBtn.textContent =
                "✕";

        }

    }
);

document
    .querySelectorAll(
        "#mobileMenu a"
    )
    .forEach(
        (link) => {

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


function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        transactionDate.value =
            getTodayString();

        renderTransactions();

        updateSummary();

    }
);