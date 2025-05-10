async function saveInvoice(invoiceData, pdfBlob) {
    try {
        // 1. Upload PDF to storage
        const fileName = `${invoiceData.invoiceNumber.replace(/\s+/g, '_')}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 2. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(fileName);

        // 3. Save to invoices table
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
                items: invoiceData.items,
                subtotal: invoiceData.subtotal,
                total_vat: invoiceData.totalVat,
                total: invoiceData.total,
                currency: invoiceData.currency,
                status: 'pending',
                pdf_url: publicUrl
            }])
            .select();

        if (error) throw error;

        return { success: true, data, pdfUrl: publicUrl };
    } catch (error) {
        console.error('Error saving invoice:', error);
        throw error;
    }
}

window.saveInvoice = saveInvoice;
