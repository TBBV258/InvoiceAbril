// Invoice Management Module JavaScript


//const supabase = supabase.createClient('https://qvmtozjvjflygbkjecyj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXRvemp2amZseWdia2plY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjc2MjMsImV4cCI6MjA2MTcwMzYyM30.DJMC1eM5_EouM1oc07JaoXsMX_bSLn2AVCozAcdfHmo');
 
/*const supabase = createClient(
    'https://qvmtozjvjflygbkjecyj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXRvemp2amZseWdia2plY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjc2MjMsImV4cCI6MjA2MTcwMzYyM30.DJMC1eM5_EouM1oc07JaoXsMX_bSLn2AVCozAcdfHmo'
  );*/


document.addEventListener('DOMContentLoaded', function() {
    initializeInvoiceModule();
    setupEventListeners();
    setupCharts();
//    fetchClients();
//    displayClients();
});

function initializeInvoiceModule() {
    console.log('Invoice Management Module initialized');
    
    // Setup invoice item calculations
    setupItemCalculations();
    
    // Initialize date fields with appropriate values
    initializeDateFields();
}

function setupEventListeners() {
    // Create Invoice Button
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    if (createInvoiceBtn) {
        createInvoiceBtn.addEventListener('click', function() {
            openModal('invoiceModal');
        });
    }
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal, #closeInvoiceBtn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Modal overlay click to close
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function() {
            closeAllModals();
        });
    }
    
    // Prevent closing when clicking inside modal content
    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addInvoiceItem);
    }
    
    // Remove item buttons (for dynamically added items)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const button = e.target.classList.contains('remove-item-btn') ? e.target : e.target.closest('.remove-item-btn');
            const row = button.closest('.item-row');
            
            // Don't remove if it's the last row
            const rows = document.querySelectorAll('.item-row');
            if (rows.length > 1) {
                row.remove();
                updateInvoiceTotals();
            } else {
                // Clear the fields instead of removing
                const inputs = row.querySelectorAll('input');
                inputs.forEach(input => input.value = input.type === 'number' ? '0' : '');
                updateInvoiceTotals();
            }
        }
    });
    
    // View Invoice buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const invoiceNumber = this.getAttribute('data-invoice');
            openViewInvoiceModal(invoiceNumber);
        });
    });
    
    // Setup invoice item calculations
    setupItemCalculations();
    
    // Payment terms dropdown
    const paymentTermsSelect = document.getElementById('paymentTerms');
    if (paymentTermsSelect) {
        paymentTermsSelect.addEventListener('change', function() {
            updateDueDate();
        });
    }
    
    // Issue date field
    const issueDateField = document.getElementById('issueDate');
    if (issueDateField) {
        issueDateField.addEventListener('change', function() {
            updateDueDate();
        });
    }
    
    // Form submission
    const invoiceForm = document.getElementById('invoiceForm');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveInvoice();
        });
    }

    // Preview button
    const previewInvoiceBtn = document.getElementById('previewInvoiceBtn');
    if (previewInvoiceBtn) {
        previewInvoiceBtn.addEventListener('click', function() {
            previewInvoice();
        });
    }
    
    // Template selector
    const templateSelector = document.getElementById('templateSelector');
    if (templateSelector) {
        templateSelector.addEventListener('change', function() {
            updateInvoiceTemplate(this.value);
        });
    }
    
    // Chart period buttons
    setupChartPeriodControls();
    
    // Table filters
    setupTableFilters();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal && overlay) {
        modal.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Initialize or reset form if it's the invoice creation modal
        if (modalId === 'invoiceModal') {
            resetInvoiceForm();
        }
    }
}

function closeAllModals() {
    const viewInvoiceModal = document.getElementById('viewInvoiceModal');
    const invoiceModal = document.getElementById('invoiceModal');
    const overlay = document.querySelector('.modal-overlay');
    
    // If we're in preview mode, just close the preview
    if (viewInvoiceModal && viewInvoiceModal.style.display === 'block' 
        && invoiceModal.style.display === 'none') {
        viewInvoiceModal.style.display = 'none';
        invoiceModal.style.display = 'block';
        return;
    }
    
    // Otherwise close everything
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    document.body.style.overflow = ''; // Re-enable scrolling
}

function setupItemCalculations() {
    // Add event listeners for quantity and price changes
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
            const row = e.target.closest('.item-row');
            if (row) {
                calculateRowTotal(row);
                updateInvoiceTotals();
            }
        }
    });
}

function calculateRowTotal(row) {
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    
    const subtotal = quantity * price;
    const vat = subtotal * 0.16; // 16% VAT
    
    // Format currency display
    const formatter = new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: document.getElementById('currency').value || 'MZN'
    });
    
    row.querySelector('.item-vat').textContent = formatter.format(vat);
    row.querySelector('.item-total').textContent = formatter.format(subtotal + vat);
}

function updateInvoiceTotals() {
    const rows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    let totalVat = 0;
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const rowSubtotal = quantity * price;
        const rowVat = rowSubtotal * 0.16; // 16% VAT
        subtotal += rowSubtotal;
        totalVat += rowVat;
    });
    
    const grandTotal = subtotal + totalVat;
    const currency = document.getElementById('currency').value || 'MZN';
    const formatter = new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Update totals with formatted values
    document.getElementById('subtotal').textContent = formatter.format(subtotal);
    document.getElementById('totalVat').textContent = formatter.format(totalVat);
    document.getElementById('invoiceTotal').textContent = formatter.format(grandTotal);
}

// Call updateInvoiceTotals whenever an item changes
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
        const row = e.target.closest('.item-row');
        if (row) {
            calculateRowTotal(row);
            updateInvoiceTotals();
        }
    }
});

function addInvoiceItem() {
    const itemsTableBody = document.querySelector('#itemsTable tbody');
    const newRowHTML = `
        <tr class="item-row">
            <td>
                <input type="text" class="item-description" placeholder="Enter item description">
            </td>
            <td>
                <input type="number" class="item-quantity" value="1" min="1" step="1">
            </td>
            <td>
                <input type="number" class="item-price" value="0.00" min="0" step="0.01">
            </td>
            <td>
                <span class="item-vat">0.00</span>
            </td>
            <td>
                <span class="item-total">0.00</span>
            </td>
            <td>
                <button type="button" class="remove-item-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    
    itemsTableBody.insertAdjacentHTML('beforeend', newRowHTML);
    
    // Initialize the new row
    const newRow = itemsTableBody.lastElementChild;
    calculateRowTotal(newRow);
    updateInvoiceTotals();
}

function initializeDateFields() {
    const issueDate = document.getElementById('issueDate');
    const dueDate = document.getElementById('dueDate');
    
    if (issueDate && dueDate) {
        // Set issue date to today's date if not already set
        if (!issueDate.value) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
            issueDate.value = formattedDate;
        }
        
        // Set due date based on payment terms
        updateDueDate();
    }
}

function updateDueDate() {
    const issueDate = document.getElementById('issueDate');
    const dueDate = document.getElementById('dueDate');
    const paymentTerms = document.getElementById('paymentTerms');
    
    if (issueDate && dueDate && paymentTerms) {
        const selectedDate = new Date(issueDate.value);
        
        if (isNaN(selectedDate.getTime())) {
            return; // Invalid date
        }
        
        let daysToAdd = 30; // Default to Net-30
        
        switch (paymentTerms.value) {
            case 'net15':
                daysToAdd = 15;
                break;
            case 'net30':
                daysToAdd = 30;
                break;
            case 'net60':
                daysToAdd = 60;
                break;
            // For 'custom', let the user enter manually
            case 'custom':
                return;
        }
        
        const newDueDate = new Date(selectedDate);
        newDueDate.setDate(newDueDate.getDate() + daysToAdd);
        
        const formattedDueDate = newDueDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        dueDate.value = formattedDueDate;
    }
}

function resetInvoiceForm() {
    const form = document.getElementById('invoiceForm');
    if (form) {
        form.reset();
        
        // Set currency to MZN by default
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.value = 'MZN';
        }
        
        // Clear all invoice items except the first row
        const itemsTableBody = document.querySelector('#itemsTable tbody');
        const rows = itemsTableBody.querySelectorAll('.item-row');
        
        // Remove all rows except the first one
        for (let i = 1; i < rows.length; i++) {
            rows[i].remove();
        }
        
        // Reset the first row
        const firstRow = itemsTableBody.querySelector('.item-row');
        if (firstRow) {
            const inputs = firstRow.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.classList.contains('item-quantity')) {
                    input.value = '1';
                } else if (input.classList.contains('item-price')) {
                    input.value = '0.00';
                } else {
                    input.value = '';
                }
            });
            
            // Reset calculated values
            firstRow.querySelector('.item-vat').textContent = '0.00';
            firstRow.querySelector('.item-total').textContent = '0.00';
        }
        
        // Reset totals
        document.getElementById('subtotal').textContent = '0.00';
        document.getElementById('totalVat').textContent = '0.00';
        document.getElementById('invoiceTotal').textContent = '0.00';
        
        // Initialize date fields with fresh values
        initializeDateFields();
        
        // Generate a new invoice number
        const invoiceNumberField = document.getElementById('invoiceNumber');
        if (invoiceNumberField) {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            // In a real app, we would get the next sequence number from the server
            const nextNumber = Math.floor(Math.random() * 1000) + 1;
            invoiceNumberField.value = `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
        }
    }
}

async function saveInvoice() {
    const invoiceData = collectInvoiceData();
    const invoiceNumber = invoiceData.invoiceNumber;
    
    try {
        // First generate and get the PDF content
        const invoiceHTML = await generateInvoiceHTML(invoiceData);
        const pdfBlob = await html2pdf().from(invoiceHTML).outputPdf('blob');
        
        // Upload PDF to Supabase Storage
        const { data: fileData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(`${invoiceNumber}.pdf`, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded PDF
        const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(`${invoiceNumber}.pdf`);

        // Save invoice data to Supabase table
        const { data, error } = await supabase
            .from('invoices')
            .insert([{
                invoice_number: invoiceData.invoiceNumber,
                client_name: invoiceData.clientName,
                client_email: invoiceData.clientEmail,
                client_address: invoiceData.clientAddress,
                client_tax_id: invoiceData.clientTaxId,
                issue_date: invoiceData.issueDate,
                due_date: invoiceData.dueDate,
                currency: invoiceData.currency,
                payment_terms: invoiceData.paymentTerms,
                notes: invoiceData.notes,
                status: 'pending',
                items: invoiceData.items,
                subtotal: invoiceData.subtotal,
                total_tax: invoiceData.totalTax,
                total: invoiceData.total,
                pdf_url: publicUrl
            }])
            .select()
            .single();

        if (error) throw error;

        showNotification('Invoice saved successfully!');
        closeAllModals();
        
        // Refresh the invoices list
        await fetchInvoices();
        
    } catch (error) {
        console.error('Error saving invoice:', error);
        showNotification('Error saving invoice. Please try again.');
    }
}

// Update the event listener for the finalize button
document.getElementById('finalizeInvoiceBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (validateInvoiceForm()) {
        saveInvoice();
    }
});

function validateInvoiceForm() {
    // Basic form validation
    const requiredFields = {
        'client-name': 'Client Name',
        'clientEmail': 'Client Email',
        'clientAddress': 'Client Address',
        'clientTaxId': 'Client Tax ID'
    };
    
    for (const [id, label] of Object.entries(requiredFields)) {
        const field = document.getElementById(id);
        if (!field || !field.value.trim()) {
            showNotification(`${label} is required`);
            field?.focus();
            return false;
        }
    }
    
    // Validate items
    const items = document.querySelectorAll('.item-row');
    let hasValidItem = false;
    
    items.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = row.querySelector('.item-quantity').value;
        const price = row.querySelector('.item-price').value;
        
        if (description && quantity > 0 && price > 0) {
            hasValidItem = true;
        }
    });
    
    if (!hasValidItem) {
        showNotification('At least one valid item is required');
        return false;
    }
    
    return true;
}

function showNotification(message) {
    // Replace with your preferred notification system
    alert(message);
}

function fetchInvoices() {
    // Implement fetching and displaying invoices from Supabase
}

function setupCharts() {
    // Invoice Distribution Chart
    const invoiceDistributionCtx = document.getElementById('invoiceDistributionChart');
    if (invoiceDistributionCtx) {
        const invoiceDistributionChart = new Chart(invoiceDistributionCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Invoices Created',
                    data: [5, 7, 10, 8, 12, 3, 1],
                    borderColor: '#007ec7',
                    backgroundColor: 'rgba(0, 126, 199, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Store the chart instance for later updates
        window.invoiceDistributionChart = invoiceDistributionChart;
    }
    
    // Revenue by Status Chart
    const revenueByStatusCtx = document.getElementById('revenueByStatusChart');
    if (revenueByStatusCtx) {
        const revenueByStatusChart = new Chart(revenueByStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue', 'Draft'],
                datasets: [{
                    data: [65, 15, 12, 8],
                    backgroundColor: [
                        '#3bb077', // Paid - green
                        '#f0ad4e', // Pending - amber
                        '#e55353', // Overdue - red
                        '#6c757d'  // Draft - gray
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                cutout: '70%'
            }
        });
        
        // Store the chart instance for later updates
        window.revenueByStatusChart = revenueByStatusChart;
    }
}

function setupChartPeriodControls() {
    // Invoice Distribution Chart period controls
    const weeklyBtn = document.getElementById('weeklyBtn');
    const monthlyBtn = document.getElementById('monthlyBtn');
    const quarterlyBtn = document.getElementById('quarterlyBtn');
    
    if (weeklyBtn && monthlyBtn && quarterlyBtn) {
        weeklyBtn.addEventListener('click', function() {
            updateChartPeriodButtons(this, [monthlyBtn, quarterlyBtn]);
            updateInvoiceDistributionChart('weekly');
        });
        
        monthlyBtn.addEventListener('click', function() {
            updateChartPeriodButtons(this, [weeklyBtn, quarterlyBtn]);
            updateInvoiceDistributionChart('monthly');
        });
        
        quarterlyBtn.addEventListener('click', function() {
            updateChartPeriodButtons(this, [weeklyBtn, monthlyBtn]);
            updateInvoiceDistributionChart('quarterly');
        });
    }
    
    // Revenue by Status Chart period controls
    const revenueMonthlyBtn = document.getElementById('revenueMonthlyBtn');
    const revenueYearlyBtn = document.getElementById('revenueYearlyBtn');
    
    if (revenueMonthlyBtn && revenueYearlyBtn) {
        revenueMonthlyBtn.addEventListener('click', function() {
            updateChartPeriodButtons(this, [revenueYearlyBtn]);
            updateRevenueByStatusChart('monthly');
        });
        
        revenueYearlyBtn.addEventListener('click', function() {
            updateChartPeriodButtons(this, [revenueMonthlyBtn]);
            updateRevenueByStatusChart('yearly');
        });
    }
}

function updateChartPeriodButtons(activeButton, inactiveButtons) {
    activeButton.classList.add('active');
    inactiveButtons.forEach(button => button.classList.remove('active'));
}

function updateInvoiceDistributionChart(period) {
    const chart = window.invoiceDistributionChart;
    if (!chart) return;
    
    let labels = [];
    let data = [];
    
    switch (period) {
        case 'weekly':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [5, 7, 10, 8, 12, 3, 1];
            break;
        case 'monthly':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = [25, 38, 42, 35];
            break;
        case 'quarterly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = [42, 38, 55, 40, 45, 42, 38, 35, 42, 48, 50, 65];
            break;
    }
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function updateRevenueByStatusChart(period) {
    const chart = window.revenueByStatusChart;
    if (!chart) return;
    
    // Just update the data (percentage distribution) based on the period
    if (period === 'monthly') {
        chart.data.datasets[0].data = [65, 15, 12, 8];
    } else { // yearly
        chart.data.datasets[0].data = [78, 10, 8, 4];
    }
    
    chart.update();
}

function setupTableFilters() {
    // Get filter elements
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clientFilter = document.getElementById('clientFilter');
    const searchInput = document.getElementById('searchInvoices');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const resetFiltersLink = document.getElementById('resetFiltersLink');
    
    // Get table elements
    const table = document.getElementById('invoicesTable');
    const rows = table ? Array.from(table.querySelectorAll('tbody tr')) : [];
    
    if (!table || rows.length === 0) return;
    
    // Function to apply all filters
    function applyFilters() {
        const status = statusFilter ? statusFilter.value : 'all';
        const date = dateFilter ? dateFilter.value : 'all';
        const client = clientFilter ? clientFilter.value : 'all';
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            const rowStatus = row.getAttribute('data-status');
            const rowDate = new Date(row.getAttribute('data-date'));
            const rowClient = row.getAttribute('data-client').toLowerCase();
            const rowInvoice = row.querySelector('td:first-child').textContent.toLowerCase();
            
            // Match status
            const statusMatch = status === 'all' || rowStatus === status;
            
            // Match date range
            let dateMatch = true;
            
            if (date !== 'all') {
                const today = new Date();
                const oneWeek = new Date(today);
                oneWeek.setDate(today.getDate() - 7);
                
                const oneMonth = new Date(today);
                oneMonth.setMonth(today.getMonth() - 1);
                
                const oneQuarter = new Date(today);
                oneQuarter.setMonth(today.getMonth() - 3);
                
                const oneYear = new Date(today);
                oneYear.setFullYear(today.getFullYear() - 1);
                
                switch (date) {
                    case 'today':
                        dateMatch = rowDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        dateMatch = rowDate >= oneWeek;
                        break;
                    case 'month':
                        dateMatch = rowDate >= oneMonth;
                        break;
                    case 'quarter':
                        dateMatch = rowDate >= oneQuarter;
                        break;
                    case 'year':
                        dateMatch = rowDate >= oneYear;
                        break;
                }
            }
            
            // Match client
            const clientMatch = client === 'all' || rowClient.includes(client.toLowerCase());
            
            // Match search text
            const searchMatch = !searchText || 
                                rowInvoice.includes(searchText) || 
                                rowClient.includes(searchText);
            
            // Apply all filters
            const shouldShow = statusMatch && dateMatch && clientMatch && searchMatch;
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) visibleCount++;
        });
        
        // Show/hide "No results" message
        const noResultsMessage = document.getElementById('noResultsMessage');
        if (noResultsMessage) {
            if (visibleCount === 0) {
                table.style.display = 'none';
                noResultsMessage.style.display = 'block';
            } else {
                table.style.display = '';
                noResultsMessage.style.display = 'none';
            }
        }
        
        // Update page info
        const pageInfo = document.querySelector('.page-info');
        if (pageInfo) {
            pageInfo.textContent = `Showing ${visibleCount} of ${rows.length} invoices`;
        }
    }
    
    // Add event listeners to filters
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    if (clientFilter) {
        clientFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Debounce search for better performance
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(applyFilters, 300);
        });
    }
    
    // Reset filters function
    function resetFilters() {
        if (statusFilter) statusFilter.value = 'all';
        if (dateFilter) dateFilter.value = 'month';
        if (clientFilter) clientFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        
        applyFilters();
    }
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Reset filters link (in no results message)
    if (resetFiltersLink) {
        resetFiltersLink.addEventListener('click', function(e) {
            e.preventDefault();
            resetFilters();
        });
    }
    
    // Initialize sorting
    setupTableSorting(table, rows);
}

function setupTableSorting(table, rows) {
    const sortIcons = table ? table.querySelectorAll('.sort-icon') : [];
    
    sortIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const sortKey = this.getAttribute('data-sort');
            const ascending = !this.classList.contains('ascending');
            
            // Reset all icons
            sortIcons.forEach(i => {
                i.classList.remove('ascending', 'descending');
            });
            
            // Set this icon's state
            this.classList.add(ascending ? 'ascending' : 'descending');
            
            // Sort rows
            rows.sort((a, b) => {
                let aVal, bVal;
                
                // Get appropriate values based on sort key
                switch (sortKey) {
                    case 'invoice':
                        aVal = a.querySelector('td:nth-child(1)').textContent.trim();
                        bVal = b.querySelector('td:nth-child(1)').textContent.trim();
                        break;
                    case 'client':
                        aVal = a.querySelector('td:nth-child(2)').textContent.trim();
                        bVal = b.querySelector('td:nth-child(2)').textContent.trim();
                        break;
                    case 'date':
                        aVal = new Date(a.getAttribute('data-date'));
                        bVal = new Date(b.getAttribute('data-date'));
                        return ascending ? aVal - bVal : bVal - aVal;
                    case 'dueDate':
                        aVal = new Date(a.getAttribute('data-duedate'));
                        bVal = new Date(b.getAttribute('data-duedate'));
                        return ascending ? aVal - bVal : bVal - aVal;
                    case 'amount':
                        aVal = parseFloat(a.getAttribute('data-amount'));
                        bVal = parseFloat(b.getAttribute('data-amount'));
                        return ascending ? aVal - bVal : bVal - aVal;
                    case 'status':
                        aVal = a.getAttribute('data-status');
                        bVal = b.getAttribute('data-status');
                        break;
                }
                
                // String comparison for non-numeric fields
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                
                return 0;
            });
            
            // Reattach rows in new sorted order
            const tbody = table.querySelector('tbody');
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

function showNotification(message) {
    // In a real application, you would use a proper notification system
    alert(message);
}

document.getElementById('invoiceForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect data from the form
    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientTaxId = document.getElementById('clientTaxId').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const issueDate = document.getElementById('issueDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    const issuerName = document.getElementById('issuerName').value;
    const issuerNuit = document.getElementById('issuerNuit').value;
    const issuerAddress = document.getElementById('issuerAddress').value;
    const description = document.getElementById('description').value;
    const totalWithoutTaxes = document.getElementById('totalWithoutTaxes').value;
    const vatRate = document.getElementById('vatRate').value;
    const vatAmount = document.getElementById('vatAmount').value;
    const totalAmountPayable = document.getElementById('totalAmountPayable').value;
    const paymentConditions = document.getElementById('paymentConditions').value;
    const legalInfo = document.getElementById('legalInfo').value;
});

// Generate Invoice HTML
async function generateInvoiceHTML(invoiceData) {
    const response = await fetch('/templates/invoice-template.html');
    let template = await response.text();
    
    // Generate items rows
    const itemsRows = invoiceData.items.map(item => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${invoiceData.currency} ${parseFloat(item.price).toFixed(2)}</td>
            <td>${invoiceData.currency} ${parseFloat(item.vat).toFixed(2)}</td>
            <td>${invoiceData.currency} ${parseFloat(item.total).toFixed(2)}</td>
        </tr>
    `).join('');

    // Replace all placeholders
    return template
        .replace('{{companyAddress}}', 'Your Company Address')
        .replace('{{companyContact}}', 'contact@company.com')
        .replace('{{invoiceNumber}}', invoiceData.invoiceNumber)
        .replace('{{issueDate}}', invoiceData.issueDate)
        .replace('{{dueDate}}', invoiceData.dueDate)
        .replace('{{clientName}}', invoiceData.clientName)
        .replace('{{clientAddress}}', invoiceData.clientAddress)
        .replace('{{clientTaxId}}', invoiceData.clientTaxId)
        .replace('{{itemsRows}}', itemsRows)
        .replace('{{currency}}', invoiceData.currency)
        .replace('{{subtotal}}', parseFloat(invoiceData.subtotal).toFixed(2))
        .replace('{{totalVat}}', parseFloat(invoiceData.totalVat).toFixed(2))
        .replace('{{total}}', parseFloat(invoiceData.total).toFixed(2))
        .replace('{{notes}}', invoiceData.notes || '');
}

function getInvoiceData() {
    const form = document.getElementById('invoiceForm');
    const itemRows = document.querySelectorAll('.item-row');
    
    return {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        issueDate: document.getElementById('issueDate').value,
        dueDate: document.getElementById('dueDate').value,
        currency: document.getElementById('currency').value,
        clientName: document.getElementById('client-list').options[document.getElementById('client-list').selectedIndex].text,
        clientAddress: document.getElementById('clientAddress').value,
        clientTaxId: document.getElementById('clientTaxId').value,
        items: Array.from(itemRows).map(row => ({
            description: row.querySelector('.item-description').value,
            quantity: row.querySelector('.item-quantity').value,
            price: row.querySelector('.item-price').value,
            vat: row.querySelector('.item-vat').textContent,
            total: row.querySelector('.item-total').textContent
        })),
        subtotal: document.getElementById('subtotal').textContent,
        totalVat: document.getElementById('totalVat').textContent,
        total: document.getElementById('invoiceTotal').textContent,
        notes: document.getElementById('notes').value
    };
}

// Preview functionality
document.getElementById('previewInvoiceBtn').addEventListener('click', async function() {
    const invoiceData = getInvoiceData();
    const invoiceHTML = await generateInvoiceHTML(invoiceData);
    
    const frame = document.getElementById('invoicePreviewFrame');
    frame.contentWindow.document.open();
    frame.contentWindow.document.write(invoiceHTML);
    frame.contentWindow.document.close();
    
    document.getElementById('viewInvoiceModal').style.display = 'block';
});

// Add functionality for Finalize & Share buttons

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const invoiceData = getInvoiceData();
        generateInvoiceHTML(invoiceData).then(invoiceHTML => {
            const element = document.createElement('div');
            element.innerHTML = invoiceHTML;
            const opt = {
                margin: 1,
                filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    });
}

const emailBtn = document.getElementById('emailBtn');
if (emailBtn) {
    emailBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const invoiceData = getInvoiceData();
        sendInvoiceEmail(invoiceData);
    });
}

const whatsappBtn = document.getElementById('whatsappBtn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const invoiceData = getInvoiceData();
        const message = `Invoice ${invoiceData.invoiceNumber} with Total ${invoiceData.total}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    });
}

function sendInvoiceEmail(invoiceData) {
    // For demo, simulate email sending. In a real app, integrate with an email API.
    alert(`Sending invoice ${invoiceData.invoiceNumber} via email to ${invoiceData.clientEmail}`);
}

