import AuthService from "@/services/authService.js";

export const requireAuth = (to, from, next) => {
  if (AuthService.isAuthenticated.value) {
    if (AuthService.isTokenExpired.value) {
      AuthService.refreshAuthToken()
        .then(() => {
          next();
        })
        .catch(() => {
          next({
            name: "Account",
            query: {
              redirect: to.fullPath,
              message: "Session expired. Please login again.",
            },
          });
        });
    } else {
      next();
    }
  } else {
    next({
      name: "Account",
      query: {
        redirect: to.fullPath,
        message: "Please login to access this page.",
      },
    });
  }
};

export const requireGuest = (to, from, next) => {
  if (AuthService.isAuthenticated.value && !AuthService.isTokenExpired.value) {
    const redirectTo = to.query.redirect || "/";
    next(redirectTo);
  } else {
    next();
  }
};

export default {
  requireAuth,
  requireGuest,
};
