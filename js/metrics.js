// Metrics data handling

async function updateMetrics() {
    try {
        // Total Invoices
        const { data: totalInvoices, error: totalError } = await supabase
            .from('invoices')
            .select('count');

        if (!totalError) {
            document.querySelector('#totalInvoicesCard .metric-value').textContent = totalInvoices[0].count;
        }

        // Paid Invoices
        const { data: paidInvoices, error: paidError } = await supabase
            .from('invoices')
            .select('count, sum(total)')
            .eq('status', 'paid');

        if (!paidError && paidInvoices[0].count > 0) {
            document.querySelector('#paidInvoicesCard .metric-value').textContent = paidInvoices[0].count;
            const percentage = ((paidInvoices[0].count / totalInvoices[0].count) * 100).toFixed(1);
            document.querySelector('#paidInvoicesCard .metric-label').textContent = `${percentage}% of Total`;
        }

        // Pending Invoices
        const { data: pendingInvoices, error: pendingError } = await supabase
            .from('invoices')
            .select('count')
            .eq('status', 'pending');

        if (!pendingError) {
            document.querySelector('#pendingInvoicesCard .metric-value').textContent = pendingInvoices[0].count;
            const percentage = ((pendingInvoices[0].count / totalInvoices[0].count) * 100).toFixed(1);
            document.querySelector('#pendingInvoicesCard .metric-label').textContent = `${percentage}% of Total`;
        }

        // Overdue Invoices
        const { data: overdueInvoices, error: overdueError } = await supabase
            .from('invoices')
            .select('count')
            .eq('status', 'overdue');

        if (!overdueError) {
            document.querySelector('#overdueInvoicesCard .metric-value').textContent = overdueInvoices[0].count;
            const percentage = ((overdueInvoices[0].count / totalInvoices[0].count) * 100).toFixed(1);
            document.querySelector('#overdueInvoicesCard .metric-label').textContent = `${percentage}% of Total`;
        }

    } catch (error) {
        console.error('Error updating metrics:', error);
        document.querySelectorAll('.metric-value').forEach(el => {
            el.textContent = 'Error';
        });
    }
}

// Setup real-time subscription
function setupMetricsSubscription() {
    const subscription = supabase
        .channel('metrics-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'invoices' },
            () => {
                updateMetrics();
            }
        )
        .subscribe();

    return subscription;
}

// Initialize metrics
document.addEventListener('DOMContentLoaded', () => {
    updateMetrics();
    setupMetricsSubscription();
    
    // Refresh metrics every 5 minutes as fallback
    setInterval(updateMetrics, 300000);
});
