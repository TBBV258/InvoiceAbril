document.addEventListener('DOMContentLoaded', function() {
    // Drilldown functionality
    document.querySelectorAll('.drilldown-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            this.querySelector('i').classList.toggle('fa-chevron-up');
            this.querySelector('i').classList.toggle('fa-chevron-down');
            
            if (content) {
                content.style.display = isExpanded ? 'none' : 'block';
            }
        });
    });

    // Tab switching functionality
    document.querySelectorAll('.drilldown-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            const parent = this.closest('.drilldown-actions');
            
            parent.querySelectorAll('.drilldown-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
});
