// Vue imports
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

// Toast notification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Styles
import "./style.css";

// Import pages
import App from "./App.vue";
import ToDoListHome from "./pages/ToDoListHome.vue";
import About from "./pages/About.vue";
import NotFound from "./pages/NotFound.vue";
import Account from "./pages/Account.vue";
import Home from "./pages/Home.vue";

// Router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Define the routes here
        {
            path: "/",
            name: "Home",
            component: Home,
            meta: {
                title: "MyToDoList - Home",
                description:
                    "Your personalized online to-do list. Manage your tasks efficiently and stay organized with our user-friendly application.",
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
        {
            path: "/to-do-list-home",
            name: "ToDoListHome",
            component: ToDoListHome,
            meta: {
                title: "MyToDoList - To-Do List Home",
                description:
                    "Welcome to MyToDoList! Start managing your tasks efficiently and stay organized with our user-friendly application.",
            },
        },
        {
            path: "/account",
            name: "Account",
            component: Account,
            meta: {
                title: "MyToDoList - Account",
                description:
                    "Log in to your account or create a new one to start managing your tasks.",
            },
        },
        {
            path: "/about",
            name: "About",
            component: About,
            meta: {
                title: "MyToDoList - About",
                description: "Learn more about MyToDoList and its features.",
            },
        },
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

const app = createApp(App);

app.use(router);

// Toast notification
app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    toastClassName: "my-toast",
    containerClassName: "custom-toast-container",
    bodyClassName: "my-toast-body",
    maxToasts: 1,
    newestOnTop: true
});

app.mount("#app");