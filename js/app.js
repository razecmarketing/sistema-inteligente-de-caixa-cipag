let totalNetWorth = 0;
let transactions = [];
let currentTransactionType = 'income';
let distributionChart, dailyProjectionChart, monthlyChart;

const distributionConfig = {
    capital: { percentage: 35, amount: 0, dailyValues: [] },
    dolar: { percentage: 20, amount: 0 },
    gold: { percentage: 20, amount: 0 },
    rent: { percentage: 25, amount: 0 },
    expenses: { percentage: 0, amount: 0 }
};

function formatBRL(input) {
    // Remove non-numeric characters
    let value = input.value.replace(/\D/g, '');
    
    // Convert to decimal
    value = (value / 100).toFixed(2);
    
    // Format as BRL
    input.value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function parseBRLToFloat(value) {
    // Remove currency symbol and replace comma with dot
    return parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.').trim());
}

function addTransaction() {
    const description = document.getElementById('transactionDescription').value.trim();
    const amountInput = document.getElementById('transactionAmount');
    const amount = parseBRLToFloat(amountInput.value);

    if (!description || isNaN(amount) || amount <= 0) {
        return;
    }

    const transaction = {
        date: new Date().toLocaleDateString('pt-BR'),
        type: currentTransactionType,
        description: description,
        amount: amount,
        distribution: {
            capital: 0,
            dolar: 0,
            gold: 0,
            rent: 0,
            expenses: 0
        }
    };

    if (currentTransactionType === 'income') {
        totalNetWorth += amount;
        distributeIncome(transaction);
        
        // Update daily values for capital
        distributionConfig.capital.dailyValues.push(distributionConfig.capital.amount);
        if (distributionConfig.capital.dailyValues.length > 7) {
            distributionConfig.capital.dailyValues.shift();
        }
    } else {
        if (amount > totalNetWorth) {
            return;
        }
        
        totalNetWorth -= amount;

        let remainingExpense = amount;

        // First allocate to expenses
        transaction.distribution.expenses = remainingExpense;
        distributionConfig.expenses.amount += remainingExpense;

        for (let key in distributionConfig) {
            if (key !== 'expenses' && distributionConfig[key].amount > 0) {
                if (distributionConfig[key].amount >= remainingExpense) {
                    transaction.distribution[key] = remainingExpense;
                    distributionConfig[key].amount -= remainingExpense;
                    remainingExpense = 0;
                    break;
                } else {
                    transaction.distribution[key] = distributionConfig[key].amount;
                    remainingExpense -= distributionConfig[key].amount;
                    distributionConfig[key].amount = 0;
                }
            }
        }
    }

    transactions.push(transaction);
    updateUI();
    clearInputs();
    updateCharts();
}

function distributeIncome(transaction) {
    transaction.distribution.capital = transaction.amount * (distributionConfig.capital.percentage / 100);
    transaction.distribution.dolar = transaction.amount * (distributionConfig.dolar.percentage / 100);
    transaction.distribution.gold = transaction.amount * (distributionConfig.gold.percentage / 100);
    transaction.distribution.rent = transaction.amount * (distributionConfig.rent.percentage / 100);

    distributionConfig.capital.amount += transaction.distribution.capital;
    distributionConfig.dolar.amount += transaction.distribution.dolar;
    distributionConfig.gold.amount += transaction.distribution.gold;
    distributionConfig.rent.amount += transaction.distribution.rent;
}

function updateUI() {
    document.getElementById('totalNetWorth').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(totalNetWorth);
    
    document.getElementById('capitalAmount').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(distributionConfig.capital.amount);

    document.getElementById('dolarAmount').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(distributionConfig.dolar.amount);

    document.getElementById('goldAmount').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(distributionConfig.gold.amount);

    document.getElementById('rentAmount').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(distributionConfig.rent.amount);

    document.getElementById('expensesAmount').textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(distributionConfig.expenses.amount);

    updateHistoryTable();
}

function updateHistoryTable() {
    const historyTableBody = document.getElementById('historyTableBody');
    historyTableBody.innerHTML = '';

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
            <td>${transaction.description}</td>
            <td>${currencyFormatter.format(transaction.amount)}</td>
            <td>${currencyFormatter.format(transaction.distribution.capital)}</td>
            <td>${currencyFormatter.format(transaction.distribution.dolar)}</td>
            <td>${currencyFormatter.format(transaction.distribution.gold)}</td>
            <td>${currencyFormatter.format(transaction.distribution.rent)}</td>
            <td>${currencyFormatter.format(transaction.distribution.expenses)}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

function updateDistribution() {
    distributionConfig.capital.percentage = parseFloat(document.getElementById('capitalPercentage').value);
    distributionConfig.dolar.percentage = parseFloat(document.getElementById('dolarPercentage').value);
    distributionConfig.gold.percentage = parseFloat(document.getElementById('goldPercentage').value);
    distributionConfig.rent.percentage = parseFloat(document.getElementById('rentPercentage').value);

    updateUI();
}

function resetAll() {
    totalNetWorth = 0;
    transactions = [];
    
    for (let key in distributionConfig) {
        distributionConfig[key].amount = 0;
        if (key === 'capital') {
            distributionConfig[key].dailyValues = [];
        }
    }

    updateUI();
    updateCharts();
}

function updateCharts() {
    if (distributionChart) {
        distributionChart.destroy();
        dailyProjectionChart.destroy();
        monthlyChart.destroy();
    }

    // Distribution Chart (Pie Chart)
    distributionChart = new Chart(document.getElementById('distributionChart'), {
        type: 'pie',
        data: {
            labels: ['Capital', 'Dólar', 'Ouro'],
            datasets: [{
                data: [
                    distributionConfig.capital.amount,
                    distributionConfig.dolar.amount,
                    distributionConfig.gold.amount
                ],
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12']
            }]
        },
        options: { responsive: true, title: { display: true, text: 'Distribuição de Recursos' } }
    });

    // Daily Projection Chart (Line Chart for C+I+P)
    const today = new Date();
    const lastSevenDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' });
    }).reverse();

    // Calculate daily values for Capital, Investments, and Passive Income
    const capitalValues = distributionConfig.capital.dailyValues.length > 0 
        ? distributionConfig.capital.dailyValues 
        : lastSevenDays.map(() => distributionConfig.capital.amount / 7);

    dailyProjectionChart = new Chart(document.getElementById('candlesChart'), {
        type: 'line',
        data: {
            labels: lastSevenDays,
            datasets: [{
                label: 'C+I+P (Capital + Investimentos + Renda Passiva)',
                data: capitalValues,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { 
            responsive: true, 
            title: { 
                display: true, 
                text: 'Projeção Diária de C+I+P' 
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    }
                }
            }
        }
    });

    // Monthly Chart (existing implementation)
    monthlyChart = new Chart(document.getElementById('monthlyChart'), {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas', 'Saldo'],
            datasets: [{
                data: [1000, 600, 400],
                backgroundColor: ['#2ecc71', '#e74c3c', '#3498db']
            }]
        },
        options: { responsive: true, title: { display: true, text: 'Resumo Mensal' } }
    });
}

function clearInputs() {
    document.getElementById('transactionDescription').value = '';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionDescription').focus();
}

function switchTransactionType(type) {
    currentTransactionType = type;
    const incomeBtn = document.querySelector('.tab-btn:nth-child(1)');
    const expenseBtn = document.querySelector('.tab-btn:nth-child(2)');
    
    if (type === 'income') {
        incomeBtn.classList.add('active');
        expenseBtn.classList.remove('active');
    } else {
        incomeBtn.classList.remove('active');
        expenseBtn.classList.add('active');
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTransaction();
    }
}

window.onload = function() {
    updateCharts();
}

document.addEventListener('keydown', handleKeyPress);