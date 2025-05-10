// Handle invoice status updates
async function updateInvoiceStatus(invoiceNumber, newStatus) {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .update({ status: newStatus })
            .eq('invoice_number', invoiceNumber)
            .select()
            .single();

        if (error) throw error;

        // Show success message
        showNotification(`Invoice ${invoiceNumber} status updated to ${newStatus}`);
        
        // Update UI
        const statusCell = document.querySelector(`tr[data-invoice="${invoiceNumber}"] .status`);
        if (statusCell) {
            statusCell.className = `status ${newStatus}`;
            statusCell.textContent = newStatus;
        }

        return data;
    } catch (error) {
        console.error('Error updating invoice status:', error);
        showNotification('Error updating invoice status', 'error');
        throw error;
    }
}

// Handle invoice deletion
async function deleteInvoice(invoiceNumber) {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
        return;
    }

    try {
        // First delete the PDF from storage
        const { error: storageError } = await supabase.storage
            .from('invoices')
            .remove([`${invoiceNumber}.pdf`]);

        if (storageError) {
            console.warn('Error deleting PDF file:', storageError);
        }

        // Then delete the invoice record
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('invoice_number', invoiceNumber);

        if (error) throw error;

        showNotification(`Invoice ${invoiceNumber} deleted successfully`);
        
        // Remove the row from the table
        const row = document.querySelector(`tr[data-invoice="${invoiceNumber}"]`);
        if (row) {
            row.remove();
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification('Error deleting invoice', 'error');
    }
}

// Show notification function
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
