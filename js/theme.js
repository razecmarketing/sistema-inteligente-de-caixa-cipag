document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Function to apply dark mode
    function applyDarkMode() {
        body.classList.add('dark-mode');
        themeToggle.querySelector('.theme-toggle-icon').textContent = '☀️'; // Sun icon for light mode
    }

    // Function to remove dark mode
    function removeDarkMode() {
        body.classList.remove('dark-mode');
        themeToggle.querySelector('.theme-toggle-icon').textContent = '🌓'; // Moon icon for dark mode
    }

    // Initial theme setup
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
        applyDarkMode();
    } else {
        removeDarkMode();
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            removeDarkMode();
            localStorage.setItem('theme', 'light');
        } else {
            applyDarkMode();
            localStorage.setItem('theme', 'dark');
        }
    });
});