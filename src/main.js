// Vue imports
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

// Styles
import './style.css';
import './assets/main.css';

// Import pages
import App from './App.vue';
import toDoList from './pages/to-do-list.vue';
import About from './pages/About.vue';
import NotFound from './pages/NotFound.vue';

// Router 
const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Define the routes here
        { path: '/', name: 'toDoList', component: toDoList , meta: {
            title: 'MyToDoList - Home',
            description: 'Your personalized online to-do list. Manage your tasks efficiently and stay organized with our user-friendly application.'
        }
        },
        { path: '/not-found', name: 'NotFound', component: NotFound , meta: {
            title: '404 - Page Not Found',
            description: 'The page you are looking for does not exist. Please check the URL or return to the homepage.'
        }
    },
        { path: '/:catchAll(.*)', redirect: '/not-found' },
        { path: '/about', name: 'About', component: About , meta: {
            title: 'MyToDoList - About',
            description: 'Learn more about MyToDoList and its features.'
        }
        },
    ]
});

// Navigation guard to dynamically change the title and description
router.beforeEach((to) => {
    const { title, description } = to.meta;
    const defaultTitle = 'MyToDoList';
    const defaultDescription = 'Your personalized online to-do list. Manage your tasks efficiently and stay organized with our user-friendly application.';

    // Change the page title
    document.title = title || defaultTitle;

    // Change the meta description
    const descriptionElement = document.querySelector('head meta[name="description"]');
    
    if (descriptionElement) {
        descriptionElement.setAttribute('content', description || defaultDescription);
    } else {
        // Create the meta description element if it doesn't exist
        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = description || defaultDescription;
        document.head.appendChild(metaDescription);
    }
});

const app = createApp(App);

app.use(router);
app.mount('#app');