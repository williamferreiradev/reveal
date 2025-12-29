
export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Public routes that don't require auth
    const publicRoutes = ['/login']

    // If user is NOT logged in and tries to access a restricted page
    if (!user.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    // If user IS logged in and tries to access login page
    if (user.value && publicRoutes.includes(to.path)) {
        return navigateTo('/')
    }
})
