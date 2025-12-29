export const useTheme = () => {
    const isDark = useState('theme', () => true)

    const initTheme = () => {
        if (import.meta.client) {
            const theme = localStorage.getItem('theme')
            if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                isDark.value = false
                document.documentElement.classList.remove('dark')
            } else {
                isDark.value = true
                document.documentElement.classList.add('dark')
            }
        }
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        if (import.meta.client) {
            if (isDark.value) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
            } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
            }
        }
    }

    return {
        isDark,
        initTheme,
        toggleTheme
    }
}
