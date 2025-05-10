async function saveInvoiceToSupabase(invoiceData, pdfBlob) {
    try {
        // First upload the PDF to storage
        const pdfFileName = `${invoiceData.invoiceNumber.replace(/\s+/g, '_')}.pdf`;
        const { data: fileData, error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(pdfFileName, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded PDF
        const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(pdfFileName);

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
                total_tax: invoiceData.totalVat,
                total: invoiceData.total,
                pdf_url: publicUrl
            }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, pdf_url: publicUrl };
    } catch (error) {
        console.error('Error saving invoice:', error);
        throw error;
    }
}

async function downloadInvoicePDF(pdfUrl) {
    try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading invoice:', error);
        throw error;
    }
}
