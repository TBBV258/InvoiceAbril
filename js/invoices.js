import supabase from './supabaseClient.js';

// Function to format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Function to fetch invoices from Supabase
async function fetchInvoices() {
    try {
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return invoices;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
}

// Function to update the invoice table
async function updateInvoiceTable() {
    const tbody = document.querySelector('#invoicesTable tbody');
    if (!tbody) return;

    const invoices = await fetchInvoices();
    tbody.innerHTML = '';

    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.setAttribute('data-invoice', invoice.invoice_number);
        row.setAttribute('data-status', invoice.status);
        row.setAttribute('data-date', invoice.created_at);
        row.setAttribute('data-amount', invoice.total_amount);

        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.client_name}</td>
            <td>${new Date(invoice.created_at).toLocaleDateString()}</td>
            <td>${formatCurrency(invoice.total_amount)}</td>
            <td><span class="status ${invoice.status}">${invoice.status}</span></td>
            <td>
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update the no results message visibility
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
        noResultsMessage.style.display = invoices.length === 0 ? 'block' : 'none';
    }
}

// Add event listeners for the table actions
document.addEventListener('click', async function(e) {
    if (e.target.closest('.action-btn')) {
        const button = e.target.closest('.action-btn');
        const row = button.closest('tr');
        const invoiceNumber = row.getAttribute('data-invoice');

        if (button.classList.contains('view-btn')) {
            // Handle view action
            window.location.href = `invoices.html?invoice=${invoiceNumber}`;
        } else if (button.classList.contains('edit-btn')) {
            // Handle edit action
            window.location.href = `edit-invoice.html?invoice=${invoiceNumber}`;
        } else if (button.classList.contains('delete-btn')) {
            // Handle delete action
            if (confirm('Are you sure you want to delete this invoice?')) {
                try {
                    const { error } = await supabase
                        .from('invoices')
                        .delete()
                        .eq('invoice_number', invoiceNumber);

                    if (error) throw error;
                    
                    // Remove the row from the table
                    row.remove();
                    
                    // Show success message
                    alert('Invoice deleted successfully');
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                    alert('Error deleting invoice. Please try again.');
                }
            }
        }
    }
});

// Export the updateInvoiceTable function
export { updateInvoiceTable };
