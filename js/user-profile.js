async function loadUserProfile() {
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

        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = userData?.username || 'User';
        }

        const avatarElement = document.querySelector('.avatar');
        if (avatarElement && userData?.logo) {
            avatarElement.innerHTML = `<img src="${userData.logo}" alt="User Logo" style="width: 100%; height: 100%; border-radius: 50%;">`;
        }

        // Setup sign out handler
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', handleSignOut);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function handleSignOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadUserProfile);
