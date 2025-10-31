const logoutBtn = document.querySelector('.dropdown-item--logout');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/v1/users/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Logged out successfully!');
        window.location.href = '/';
      } else {
        alert('Error logging out. Please try again.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error logging out. Please try again.');
    }
  });
}
