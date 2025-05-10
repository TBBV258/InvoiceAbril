// Initialize Supabase client
const supabase = window.supabase.createClient(
    'https://qvmtozjvjflygbkjecyj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bXRvemp2amZseWdia2plY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjc2MjMsImV4cCI6MjA2MTcwMzYyM30.DJMC1eM5_EouM1oc07JaoXsMX_bSLn2AVCozAcdfHmo'
);

// Load and inject sidebar
async function loadSidebar() {
    try {
        const response = await fetch('/components/sidebar.html');
        const sidebarHtml = await response.text();
        document.querySelector('.sidebar').innerHTML = sidebarHtml;
        
        // Set active menu item based on current page
        const currentPath = window.location.pathname;
        document.querySelector(`.nav-item[href="${currentPath}"]`)?.classList.add('active');
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

// Update user profile display
async function updateUserDisplay() {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
            console.error('No user session found');
            return;
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username, logo')
            .eq('id', session.user.id)
            .single();

        if (userError) throw userError;

        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.textContent = userData?.username || 'User';
        }

        const userAvatar = document.querySelector('.avatar');
        if (userAvatar && userData?.logo) {
            userAvatar.innerHTML = `<img src="${userData.logo}" alt="User Logo" style="width: 100%; height: 100%; border-radius: 50%;">`;
        }
    } catch (error) {
        console.error('Error updating user display:', error);
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    updateUserDisplay();
    
    // Add sign out handler
    document.getElementById('sign-out-btn')?.addEventListener('click', handleSignOut);
});
