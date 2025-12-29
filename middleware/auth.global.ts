
export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // DEBUG AUTH
    if (process.client) {
        console.log('Auth Middleware:', to.path)
        console.log('User State:', user.value ? 'Logged In' : 'Logged Out', user.value?.id)
    }

    // Public routes that don't require auth
    const publicRoutes = ['/login']

    // If user is NOT logged in and tries to access a restricted page
    if (!user.value && !publicRoutes.includes(to.path)) {
        console.log('Redirecting to login (No User)')
        return navigateTo('/login')
    }

    // If user IS logged in and tries to access login page
    if (user.value && publicRoutes.includes(to.path)) {
        console.log('Redirecting to home (Already Logged In)')
        return navigateTo('/')
    }
})
