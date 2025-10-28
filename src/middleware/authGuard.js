import AuthService from '@/services/authService.js';

export const requireAuth = (to, from, next) => {
    // Debug log
    console.log('requireAuth check:', {
        isAuthenticated: AuthService.isAuthenticated.value,
        isTokenExpired: AuthService.isTokenExpired.value,
        user: AuthService.user.value
    });

    if (AuthService.isAuthenticated.value) {
        if (AuthService.isTokenExpired.value) {
            AuthService.refreshAuthToken()
                .then(() => {
                    next();
                })
                .catch(() => {
                    next({
                        name: 'Account',
                        query: { redirect: to.fullPath, message: 'Session expired. Please login again.' }
                    });
                });
        } else {
            next();
        }
    } else {
        next({
            name: 'Account',
            query: { redirect: to.fullPath, message: 'Please login to access this page.' }
        });
    }
};

export const requireGuest = (to, from, next) => {
    if (AuthService.isAuthenticated.value && !AuthService.isTokenExpired.value) {
        const redirectTo = to.query.redirect || '/';
        next(redirectTo);
    } else {
        next();
    }
};

export const requireAdmin = (to, from, next) => {
    if (AuthService.isAuthenticated.value && !AuthService.isTokenExpired.value) {
        const user = AuthService.user.value;
        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
            next();
        } else {
            next({
                name: 'Home',
                query: { message: 'Access denied. Admin privileges required.' }
            });
        }
    } else {
        next({
            name: 'Account',
            query: { redirect: to.fullPath, message: 'Please login with admin credentials.' }
        });
    }
};

export default {
    requireAuth,
    requireGuest,
    requireAdmin
};