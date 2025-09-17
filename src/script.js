       // W3Frontend Expense Tracker JavaScript
        class W3ExpenseTracker {
            constructor() {
                this.expenses = [];
                this.currentEditId = null;
                this.categoryChart = null;
                this.monthlyChart = null;
                this.filteredExpenses = [];
                
                this.initializeApp();
            }

            initializeApp() {
                this.setupEventListeners();
                this.initializeCharts();
                this.setCurrentDate();
                this.updateDisplay();
            }

            setupEventListeners() {
                // Form submission
                document.getElementById('w3ExpenseForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addExpense();
                });

                // Edit form submission
                document.getElementById('w3SaveEdit').addEventListener('click', () => {
                    this.saveEdit();
                });

                // Filter changes
                document.getElementById('w3FilterCategory').addEventListener('change', () => {
                    this.applyFilters();
                });
                
                document.getElementById('w3FilterDateFrom').addEventListener('change', () => {
                    this.applyFilters();
                });
                
                document.getElementById('w3FilterDateTo').addEventListener('change', () => {
                    this.applyFilters();
                });

                // Clear filters
                document.getElementById('w3ClearFilters').addEventListener('click', () => {
                    this.clearFilters();
                });
            }

            setCurrentDate() {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('w3Date').value = today;
            }

            addExpense() {
                const amount = parseFloat(document.getElementById('w3Amount').value);
                const category = document.getElementById('w3Category').value;
                const date = document.getElementById('w3Date').value;
                const description = document.getElementById('w3Description').value;

                const expense = {
                    id: Date.now(),
                    amount: amount,
                    category: category,
                    date: date,
                    description: description || 'No description'
                };

                this.expenses.push(expense);
                this.resetForm();
                this.updateDisplay();
                
                // Show success message
                this.showToast('Expense added successfully!', 'success');
            }

            resetForm() {
                document.getElementById('w3ExpenseForm').reset();
                this.setCurrentDate();
            }

            deleteExpense(id) {
                if (confirm('Are you sure you want to delete this expense?')) {
                    this.expenses = this.expenses.filter(expense => expense.id !== id);
                    this.updateDisplay();
                    this.showToast('Expense deleted successfully!', 'success');
                }
            }

            editExpense(id) {
                const expense = this.expenses.find(exp => exp.id === id);
                if (expense) {
                    this.currentEditId = id;
                    
                    document.getElementById('w3EditAmount').value = expense.amount;
                    document.getElementById('w3EditCategory').value = expense.category;
                    document.getElementById('w3EditDate').value = expense.date;
                    document.getElementById('w3EditDescription').value = expense.description;
                    
                    const modal = new bootstrap.Modal(document.getElementById('w3EditModal'));
                    modal.show();
                }
            }

            saveEdit() {
                const amount = parseFloat(document.getElementById('w3EditAmount').value);
                const category = document.getElementById('w3EditCategory').value;
                const date = document.getElementById('w3EditDate').value;
                const description = document.getElementById('w3EditDescription').value;

                const expenseIndex = this.expenses.findIndex(exp => exp.id === this.currentEditId);
                if (expenseIndex !== -1) {
                    this.expenses[expenseIndex] = {
                        ...this.expenses[expenseIndex],
                        amount: amount,
                        category: category,
                        date: date,
                        description: description || 'No description'
                    };
                    
                    this.updateDisplay();
                    
                    const modal = bootstrap.Modal.getInstance(document.getElementById('w3EditModal'));
                    modal.hide();
                    
                    this.showToast('Expense updated successfully!', 'success');
                }
            }

            applyFilters() {
                const categoryFilter = document.getElementById('w3FilterCategory').value;
                const dateFromFilter = document.getElementById('w3FilterDateFrom').value;
                const dateToFilter = document.getElementById('w3FilterDateTo').value;

                this.filteredExpenses = this.expenses.filter(expense => {
                    let matches = true;

                    if (categoryFilter && expense.category !== categoryFilter) {
                        matches = false;
                    }

                    if (dateFromFilter && expense.date < dateFromFilter) {
                        matches = false;
                    }

                    if (dateToFilter && expense.date > dateToFilter) {
                        matches = false;
                    }

                    return matches;
                });

                this.updateExpenseTable();
                this.updateCharts();
            }

            clearFilters() {
                document.getElementById('w3FilterCategory').value = '';
                document.getElementById('w3FilterDateFrom').value = '';
                document.getElementById('w3FilterDateTo').value = '';
                
                this.filteredExpenses = [];
                this.updateDisplay();
            }

            updateDisplay() {
                this.filteredExpenses = this.expenses.slice();
                this.updateStats();
                this.updateExpenseTable();
                this.updateCharts();
            }

            updateStats() {
                const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
                const count = this.expenses.length;
                
                // Calculate monthly average
                const months = new Set(this.expenses.map(expense => expense.date.substring(0, 7)));
                const monthlyAvg = months.size > 0 ? total / months.size : 0;

                document.getElementById('w3TotalExpenses').textContent = `$${total.toFixed(2)}`;
                document.getElementById('w3TotalCount').textContent = count;
                document.getElementById('w3MonthlyAvg').textContent = `$${monthlyAvg.toFixed(2)}`;
            }

            updateExpenseTable() {
                const tbody = document.getElementById('w3ExpensesTableBody');
                const expensesToShow = this.filteredExpenses.length > 0 ? this.filteredExpenses : this.expenses;
                
                document.getElementById('w3FilteredCount').textContent = expensesToShow.length;

                if (expensesToShow.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No expenses found</td></tr>';
                    return;
                }

                tbody.innerHTML = expensesToShow
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(expense => `
                        <tr>
                            <td>${new Date(expense.date).toLocaleDateString()}</td>
                            <td class="w3-expense-amount text-success">$${expense.amount.toFixed(2)}</td>
                            <td>
                                <span class="badge bg-primary">${expense.category}</span>
                            </td>
                            <td>${expense.description}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="w3Tracker.editExpense(${expense.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="w3Tracker.deleteExpense(${expense.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
            }

            initializeCharts() {
                // Category Pie Chart
                const categoryCtx = document.getElementById('w3CategoryChart').getContext('2d');
                this.categoryChart = new Chart(categoryCtx, {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: [
                                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });

                // Monthly Bar Chart
                const monthlyCtx = document.getElementById('w3MonthlyChart').getContext('2d');
                this.monthlyChart = new Chart(monthlyCtx, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Monthly Expenses',
                            data: [],
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toFixed(0);
                                    }
                                }
                            }
                        }
                    }
                });
            }

            updateCharts() {
                const expensesToShow = this.filteredExpenses.length > 0 ? this.filteredExpenses : this.expenses;
                
                this.updateCategoryChart(expensesToShow);
                this.updateMonthlyChart(expensesToShow);
            }

            updateCategoryChart(expenses) {
                const categoryData = {};
                
                expenses.forEach(expense => {
                    categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
                });

                const labels = Object.keys(categoryData);
                const data = Object.values(categoryData);

                this.categoryChart.data.labels = labels;
                this.categoryChart.data.datasets[0].data = data;
                this.categoryChart.update();
            }

            updateMonthlyChart(expenses) {
                const monthlyData = {};
                
                expenses.forEach(expense => {
                    const month = expense.date.substring(0, 7); // YYYY-MM format
                    monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
                });

                // Sort months and get last 6 months
                const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
                const data = sortedMonths.map(month => monthlyData[month]);
                
                // Format month labels
                const labels = sortedMonths.map(month => {
                    const date = new Date(month + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                });

                this.monthlyChart.data.labels = labels;
                this.monthlyChart.data.datasets[0].data = data;
                this.monthlyChart.update();
            }

            showToast(message, type) {
                // Create toast notification
                const toastId = 'toast-' + Date.now();
                const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
                
                const toastHtml = `
                    <div class="toast ${bgClass} text-white" id="${toastId}" role="alert">
                        <div class="toast-body">
                            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation'}"></i>
                            ${message}
                        </div>
                    </div>
                `;
                
                // Add to page
                let toastContainer = document.getElementById('w3ToastContainer');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.id = 'w3ToastContainer';
                    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
                    toastContainer.style.zIndex = '9999';
                    document.body.appendChild(toastContainer);
                }
                
                toastContainer.insertAdjacentHTML('beforeend', toastHtml);
                
                const toastElement = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
                toast.show();
                
                // Remove after showing
                toastElement.addEventListener('hidden.bs.toast', () => {
                    toastElement.remove();
                });
            }
        }

        // Initialize the expense tracker when the page loads
        let w3Tracker;
        document.addEventListener('DOMContentLoaded', () => {
            w3Tracker = new W3ExpenseTracker();
        });