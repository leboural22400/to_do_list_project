import { createRouter, createWebHistory } from 'vue-router';
// Import pages

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

export default router;