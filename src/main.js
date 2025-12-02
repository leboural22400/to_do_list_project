// Vue imports
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

// Authentication middleware (for the front-end)
import { isAuth, requireAuth, requireGuest } from "./middleware/authGuard.js";
import { AuthService } from "./services/authService.js";

// Styles
import "./style.css";

// Import pages
import App from "./App.vue";
import ToDoListHome from "./pages/ToDoListHome.vue";
import NotFound from "./pages/NotFound.vue";
import Account from "./pages/Account.vue";
import Home from "./pages/Home.vue";
import Profile from "./pages/Profile.vue";

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Define the routes here
    {
      path: "/",
      name: "Home",
      component: Home,
      beforeEnter: isAuth,
      meta: {
        title: "MyToDoList - Home",
        description:
          "Your personalized online to-do list. Manage your tasks efficiently and stay organized with our user-friendly application.",
      },
    },
    {
      path: "/to-do-list",
      name: "ToDoList",
      component: ToDoListHome,
      beforeEnter: requireAuth,
      meta: {
        title: "MyToDoList - To-Do List",
        description:
          "Welcome to MyToDoList! Start managing your tasks efficiently and stay organized with our user-friendly application.",
      },
    },
    {
      path: "/task/:id",
      name: "TaskDetail",
      component: () => import("./pages/TaskDetail.vue"),
      beforeEnter: requireAuth,
      meta: {
        title: "MyToDoList - Task Detail",
        description: "View and manage the details of your task.",
      },
    },
    {
      path: "/account",
      name: "Account",
      component: Account,
      beforeEnter: requireGuest,
      meta: {
        title: "MyToDoList - Account",
        description:
          "Log in to your account or create a new one to start managing your tasks.",
      },
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      beforeEnter: requireAuth,
      meta: {
        title: "MyToDoList - Profile",
        description: "Manage your profile, account settings, and preferences.",
      },
    },
    {
      path: "/not-found",
      name: "NotFound",
      component: NotFound,
      meta: {
        title: "404 - Page Not Found",
        description:
          "The page you are looking for does not exist. Please check the URL or return to the homepage.",
      },
    },
    { path: "/:catchAll(.*)", redirect: "/not-found" },
  ],
});

// Navigation guard to dynamically change the title and description
// Based on https://dev.to/jacobandrewsky/dynamic-page-title-and-description-with-vue-router-4oni
router.beforeEach((to) => {
  const { title, description } = to.meta;
  const defaultTitle = "MyToDoList";
  const defaultDescription =
    "Your personalized online to-do list. Manage your tasks efficiently and stay organized with our user-friendly application.";

  // Change the page title
  document.title = title || defaultTitle;

  // Change the meta description
  const descriptionElement = document.querySelector(
    'head meta[name="description"]'
  );

  if (descriptionElement) {
    descriptionElement.setAttribute(
      "content",
      description || defaultDescription
    );
  } else {
    // Create the meta description element if it doesn't exist
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = description || defaultDescription;
    document.head.appendChild(metaDescription);
  }
});

// Initialize AuthService before creating the app
AuthService.init();

const app = createApp(App);

app.use(router);

app.mount("#app");
