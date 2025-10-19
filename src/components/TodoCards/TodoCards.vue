<script>
// Toast notification
import { useToast } from 'vue-toastification';
import ToDoList from '../ToDoList/ToDoList.vue';
import UnsplashImages from '../UnsplashImages/UnsplashImages.vue';

const UNSPLASH_BASE = "https://api.unsplash.com";

const memoryCache = new Map();
// Client-side rate limit: 50/h
// Short in money (my fridge is empty)
const QUOTA_LIMIT = 50;
const QUOTA_KEY = "unsplash-quota-v1";

export default {
    name: "TodoCards",
    components: {
        UnsplashImages
    },
    setup() {
        const toast = useToast();
        return { toast };
    },
    data() {
        return {
            items: [
                { id: 1, title: "Use Git and GitHub", tag: "Version Control", due: "Fri", priority: "medium", done: false, imageUrl: "https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1443", imagePosition: { x: 50, y: 50 } },
                { id: 2, title: "Submit C Lab", tag: "EFREI", due: "Tomorrow", priority: "high", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 3, title: "Review binary systems", tag: "Digital Systems", due: "Fri", priority: "medium", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 4, title: "Fix linked list", tag: "C Project", due: "Today", priority: "high", done: true, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 5, title: "Prepare democracy slides", tag: "Humanities", due: "Mon", priority: "low", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 6, title: "Probability exercises", tag: "Maths", due: "Wed", priority: "medium", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 7, title: "Dockerize mini-app", tag: "Tooling", due: "Tue", priority: "high", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 8, title: "Read about REST APIs", tag: "Web", due: "Next week", priority: "low", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 9, title: "Review algorithms", tag: "Computer Science", due: "Next week", priority: "medium", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
                { id: 10, title: "Practice coding problems", tag: "Programming", due: "Tomorrow", priority: "high", done: false, imageUrl: "", imagePosition: { x: 50, y: 50 } },
            ],
            gallery: {
                open: false,
                forItemId: null,
                query: "",
                orientation: "",
                imageLink: "",
                results: []
            },
            loading: false,
            editingImageId: null,

            // Task creation/editing modal
            taskModal: {
                open: false,
                mode: 'create', // 'create' or 'edit'
                editingId: null,
                form: {
                    title: '',
                    tag: '',
                    due: '',
                    priority: 'medium'
                }
            },

            // Delete confirmation modal
            deleteModal: {
                open: false,
                taskToDelete: null
            },

            // Read key from .env (Vite)
            accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "",

            // Client quota tracking
            quota: { limit: QUOTA_LIMIT, remaining: QUOTA_LIMIT },

            // Default images (we only have 50 free requests per hour)
            defaultImagePool: [
                // Colorful backgrounds
                "https://images.unsplash.com/photo-1633785927858-02e19ae694ca?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1508615121316-fe792af62a63?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1650803318792-6781b4884a20?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                // Landscapes backgrounds
                "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?q=80&w=1517&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1496614932623-0a3a9743552e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                // Cities backgrounds
                "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?q=80&w=1526&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1620015092538-e33c665fc181?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1519178251-5390a0fb6a3f?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1583996829982-823143cc975a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                // Streets backgrounds
                "https://images.unsplash.com/photo-1695391006461-28a81653e409?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332",
                "https://images.unsplash.com/photo-1532236204992-f5e85c024202?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1195",
                "https://images.unsplash.com/photo-1532876688342-a79b7fa5c473?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1113",
                "https://images.unsplash.com/photo-1525762867061-21c9fb70b15a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                "https://images.unsplash.com/photo-1638437591997-ec57dcbcd70f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                "https://images.unsplash.com/photo-1653671184411-5e0041642e68?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=742",
                // Art backgrounds
                "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1549289524-06cf8837ace5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1576495169018-bd2414046c6b?q=80&w=1404&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1384&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?q=80&w=1456&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1599894019794-50339c9ad89c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
                // Food backgrounds
                "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1623747912232-a5ba7a3db7de?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1602273660127-a0000560a4c1?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://plus.unsplash.com/premium_photo-1667115807254-d32224e57382?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
                // Technology and coding backgrounds
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1374",
                "https://images.unsplash.com/photo-1735825764457-ffdf0b5aa5dd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1583339793403-3d9b001b6008?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1443",
                "https://images.unsplash.com/photo-1639755507638-e34150b56db2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
                // Space backgrounds
                "https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1478",
                "https://images.unsplash.com/photo-1487640228478-7a32e30a9e40?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1648823035205-ce1096d8eaca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1932",
                "https://images.unsplash.com/photo-1723067553070-e51e0a7fb469?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1932",
                "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
                "https://images.unsplash.com/photo-1605441319085-0a36e0809874?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
                // Flowers and plants backgrounds
                "https://images.unsplash.com/photo-1529420972496-b5119438ba73?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
                "https://images.unsplash.com/photo-1528539054466-ccb019c0862c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
                "https://images.unsplash.com/photo-1462834366666-a6fc4db3fb0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1473",
                "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1622003874000-c9541292651c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1475",
                "https://images.unsplash.com/photo-1650518920989-878b781f35b2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
                // Animals backgrounds
                "https://images.unsplash.com/photo-1697009425951-ba0c8ac067d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1511044568932-338cba0ad803?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1514855333255-65e03dd92cdc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1532",
                "https://images.unsplash.com/photo-1543782248-03e2c5a93e18?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1471",
                "https://plus.unsplash.com/premium_photo-1692895424097-a195cfa8a0c6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
                "https://images.unsplash.com/photo-1600521605615-a8d3a23d8262?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1474",
                // Cartoons backgrounds
                "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1642370324100-324b21fab3a9?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
                "https://images.unsplash.com/photo-1579718619873-d82333054124?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
                "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
                // Anime/manga backgrounds
                "https://images.unsplash.com/photo-1709675577966-6231e5a2ac43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1625189659340-887baac3ea32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1373",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1374",
                "https://images.unsplash.com/photo-1757743320198-321fb0d6ebaa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
                "https://images.unsplash.com/photo-1695747000284-4dba6bc2e975?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
            ],

            // Show defaults first
            useDefaults: true
        };
    },
    created() {
        this.syncQuota();
    },
    mounted() {
        // Add the listener for the ESC key
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        // Clean up the listener when the component is destroyed
        document.removeEventListener('keydown', this.handleKeydown);
    },
    methods: {
        toggle(id) {
            const it = this.items.find(i => i.id === id);
            if (it) it.done = !it.done;
        },

        // ---------- Quota ----------
        syncQuota() {
            const now = Date.now();
            const hour = 3600_000;
            const raw = localStorage.getItem(QUOTA_KEY);
            let windowStart = now, count = 0;
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    windowStart = parsed.windowStart;
                    count = parsed.count;
                    if (now - windowStart >= hour) {
                        windowStart = now; count = 0;
                    }
                } catch { /* reset */ }
            }
            this.quota.remaining = Math.max(0, QUOTA_LIMIT - count);
            localStorage.setItem(QUOTA_KEY, JSON.stringify({ windowStart, count }));
        },
        canSpend(n = 1) {
            this.syncQuota();
            return this.quota.remaining >= n;
        },
        spend(n = 1) {
            const raw = JSON.parse(localStorage.getItem(QUOTA_KEY) || "{}");
            const now = Date.now();
            const hour = 3600_000;
            let { windowStart = now, count = 0 } = raw;
            if (now - windowStart >= hour) { windowStart = now; count = 0; }
            count += n;
            localStorage.setItem(QUOTA_KEY, JSON.stringify({ windowStart, count }));
            this.syncQuota();
        },

        openGallery(item) {
            this.gallery.open = true;
            this.gallery.forItemId = item.id;
            this.gallery.results = [];
            this.gallery.query = "";
            this.useDefaults = true;
        },
        closeGallery() {
            this.gallery.open = false;
            this.gallery.forItemId = null;
            this.gallery.results = [];
            this.gallery.query = "";
            this.useDefaults = true;
        },

        // ---------- Pick a default image (zero API calls) ----------
        selectDefault(url) {
            const it = this.items.find(i => i.id === this.gallery.forItemId);
            if (it) it.imageUrl = url;
            this.toast.success('Default background image applied!');
            this.closeGallery();
        },

        // ---------- Unsplash search with cache + quota ----------
        async searchUnsplash() {
            const q = (this.gallery.query || "").trim();
            if (!q) { this.useDefaults = true; return; }

            const key = JSON.stringify({ q, orientation: this.gallery.orientation });
            const localKey = "unsplash-cache-" + btoa(key);

            const hit = memoryCache.get(key) || JSON.parse(localStorage.getItem(localKey) || "null");
            if (hit && Array.isArray(hit)) {
                this.useDefaults = false;
                this.gallery.results = hit;
                return; // 0 new request
            }

            if (!this.canSpend()) {
                this.$nextTick(() => alert("Hourly quota reached. Use default images or try again later."));
                return;
            }

            this.loading = true;
            try {
                const url = new URL(`${UNSPLASH_BASE}/search/photos`);
                url.searchParams.set("query", q);
                url.searchParams.set("per_page", "24");
                if (this.gallery.orientation) url.searchParams.set("orientation", this.gallery.orientation);

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Client-ID ${this.accessKey}`,
                        "Accept-Version": "v1"
                    }
                });
                if (!res.ok) throw new Error(`Unsplash search failed: ${res.status}`);
                const data = await res.json();
                const results = Array.isArray(data.results) ? data.results : [];
                this.gallery.results = results;
                this.useDefaults = false;

                memoryCache.set(key, results);
                localStorage.setItem(localKey, JSON.stringify(results));
                this.spend(1);
            } catch (e) {
                console.error(e);
                this.gallery.results = [];
                this.useDefaults = true;
            } finally {
                this.loading = false;
            }
        },

        // ---------- Unsplash random with quota ----------
        async randomUnsplash() {
            if (!this.canSpend()) {
                this.toast.warning("Hourly quota reached. Use default images or try again later.", {
                    timeout: 3000
                });
                return;
            }
            this.loading = true;
            try {
                const url = new URL(`${UNSPLASH_BASE}/photos/random`);
                url.searchParams.set("count", "24");
                if (this.gallery.orientation) url.searchParams.set("orientation", this.gallery.orientation);

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Client-ID ${this.accessKey}`,
                        "Accept-Version": "v1"
                    }
                });
                if (!res.ok) throw new Error(`Unsplash random failed: ${res.status}`);
                const data = await res.json();
                const arr = Array.isArray(data) ? data : [data];
                this.gallery.results = arr;
                this.useDefaults = false;
                this.spend(1);
            } catch (e) {
                console.error(e);
                this.gallery.results = [];
                this.useDefaults = true;
            } finally {
                this.loading = false;
            }
        },

        async selectImage(photo) {
            // Ping Unsplash download_location only if provided
            try {
                if (photo?.links?.download_location && this.accessKey) {
                    await fetch(photo.links.download_location, {
                        headers: {
                            Authorization: `Client-ID ${this.accessKey}`,
                            "Accept-Version": "v1"
                        }
                    });
                    this.toast.success('Image downloaded successfully!');
                }
            } catch { /* non-blocking */ }

            const it = this.items.find(i => i.id === this.gallery.forItemId);
            if (it) {
                it.imageUrl = photo?.urls?.regular || photo?.urls?.small || "";
            }
            this.closeGallery();
        },
        removeImage(item) {
            item.imageUrl = "";
            this.toast.info('Background image removed.');
        },
        // ---------- Copy link ----------
        async copyLink() {
            // The user-provided link
            const imageLink = this.gallery.imageLink;

            if (!imageLink) {
                this.toast.error('No image URL entered.');
                return;
            }

            // Validate the URL format
            try {
                new URL(imageLink);
            } catch {
                this.toast.error('Please enter a valid image URL (e.g., https://example.com/image.jpg)');
                return;
            }

            // Verify that the URL really points to an image
            try {
                const res = await fetch(imageLink, { method: 'HEAD', mode: 'no-cors' });
                const contentType = res.headers.get('content-type');

            } catch {
                this.toast.error('Unable to reach this image URL.');
                return;
            }

            // Aply the image as background to the selected task
            const currentTask = this.items.find(i => i.id === this.gallery.forItemId);
            if (currentTask) {
                currentTask.imageUrl = imageLink;
                this.toast.success('Custom background image applied!');
                this.closeGallery();
            } else {
                this.toast.error('No task selected.');
            }
        },
        // ---------- Upload image ----------
        async uploadImage() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.multiple = false;

            fileInput.onchange = async (event) => {
                const file = event.target.files[0];

                if (!file) {
                    this.toast.error('No file selected.');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    this.toast.error('Please select an image file.');
                    return;
                }

                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    this.toast.error('Image file too large. Please choose a file smaller than 5MB.');
                    return;
                }

                try {
                    const reader = new FileReader();
                    // Apply the image
                    reader.onload = (e) => {
                        const imageLink = e.target.result;

                        const currentTask = this.items.find(i => i.id === this.gallery.forItemId);
                        if (currentTask) {
                            currentTask.imageUrl = imageLink;
                            this.toast.success('Custom background image applied!');
                            this.closeGallery();
                        } else {
                            this.toast.error('No task selected.');
                        }
                    };

                    reader.onerror = () => {
                        this.toast.error('Error reading the image file.');
                    };

                    reader.readAsDataURL(file);

                } catch (error) {
                    console.error(error);
                    this.toast.error('Error uploading the image. Please try again.');
                }
            }
            fileInput.click();
        },
        handleKeydown(event) {
            if (event.key === 'Escape' && this.gallery.open) {
                this.closeGallery();
            }

            if(event.key === 'Escape' && this.taskModal.open) {
                this.closeTaskModal();
            }

            if(event.key === 'Escape' && this.deleteModal.open) {
                this.closeDeleteModal();
            }
        },

        startImageEdit(item, event) {
            event.stopPropagation();
            this.editingImageId = item.id;

            // Initialize position if not set
            if (!item.imagePosition) {
                item.imagePosition = { x: 50, y: 50 };
            }
        },

        finishImageEdit() {
            this.editingImageId = null;
            this.toast.success('Image position updated.');
        },

        updateImagePosition(item, event) {
            if (this.editingImageId !== item.id) return;

            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            // Clamp values between 0 and 100
            item.imagePosition.x = Math.max(0, Math.min(100, x));
            item.imagePosition.y = Math.max(0, Math.min(100, y));
        },

        // ---------- Task Modal Management ----------
        openTaskModal(mode = 'create', item = null) {
            this.taskModal.mode = mode;
            this.taskModal.open = true;
            
            if (mode === 'edit' && item) {
                this.taskModal.editingId = item.id;
                this.taskModal.form = {
                    title: item.title,
                    tag: item.tag,
                    due: item.due,
                    priority: item.priority
                };
            } else {
                this.taskModal.editingId = null;
                this.taskModal.form = {
                    title: '',
                    tag: '',
                    due: '',
                    priority: 'medium'
                };
            }
        },

        closeTaskModal() {
            this.taskModal.open = false;
            this.taskModal.editingId = null;
            this.taskModal.form = {
                title: '',
                tag: '',
                due: '',
                priority: 'medium'
            };
        },

        submitTask() {
            const form = this.taskModal.form;
            
            // Validation
            if (!form.title.trim()) {
                this.toast.error('Task title is required.');
                return;
            }

            if (this.taskModal.mode === 'create') {
                this.createTask(form);
            } else if (this.taskModal.mode === 'edit') {
                this.updateTask(form);
            }

            this.closeTaskModal();
        },

        createTask(form) {
            // Generate new ID
            const maxId = Math.max(...this.items.map(item => item.id));
            const newId = maxId + 1;

            const newTodo = {
                id: newId,
                title: form.title.trim(),
                tag: form.tag.trim() || 'General',
                due: form.due.trim() || 'TBD',
                priority: form.priority,
                done: false,
                imageUrl: "",
                imagePosition: { x: 50, y: 50 }
            };

            this.items.push(newTodo);
            this.toast.success(`Task "${form.title}" created successfully!`);
        },

        updateTask(form) {
            const item = this.items.find(i => i.id === this.taskModal.editingId);
            if (item) {
                item.title = form.title.trim();
                item.tag = form.tag.trim() || 'General';
                item.due = form.due.trim() || 'TBD';
                item.priority = form.priority;
                this.toast.success('Task updated successfully!');
            }
        },

        deleteTodo(item, event) {
            event.stopPropagation();

            // Open confirmation modal instead of confirm()
            this.deleteModal.open = true;
            this.deleteModal.taskToDelete = item;
        },

        confirmDelete() {
            const item = this.deleteModal.taskToDelete;
            if (!item) return;

            const index = this.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.toast.success(`Task "${item.title}" deleted successfully!`);
            }
            
            this.closeDeleteModal();
        },

        closeDeleteModal() {
            this.deleteModal.open = false;
            this.deleteModal.taskToDelete = null;
        },

        // Detail view methods
        openTaskDetail(item, event) {
            // Prevent navigation if clicking on controls
            if (event.target.closest('.card-control') || 
                event.target.closest('.check') || 
                event.target.closest('.image-controls') ||
                event.target.closest('.img-btn')) {
                return;
            }
            
            // Naviguer vers la page de détail de la tâche
            this.$router.push({
                name: 'TaskDetail',
                params: { id: item.id },
                query: { task: encodeURIComponent(JSON.stringify(item)) }
            });
        },



        duplicateTodo(item, event) {
            event.stopPropagation();
            
            const maxId = Math.max(...this.items.map(i => i.id));
            const duplicatedTodo = {
                ...item,
                id: maxId + 1,
                title: `${item.title} (Copy)`,
                done: false
            };

            const originalIndex = this.items.findIndex(i => i.id === item.id);
            this.items.splice(originalIndex + 1, 0, duplicatedTodo);
            
            this.toast.success(`Task duplicated successfully!`);
        }
    }
};
</script>

<template>
    <section class="page">
        <div class="header-controls">
            <h1 class="neon-title">MY TO-DOs</h1>
            <button class="create-btn" @click="openTaskModal('create')" title="Create new task">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                New Task
            </button>
        </div>

        <div class="grid">
            <article v-for="item in items" :key="item.id" class="card" :aria-pressed="item.done ? 'true' : 'false'">
                <!-- Card controls -->
                <div class="card-controls">
                    <button class="card-control edit" @click="openTaskModal('edit', item)" title="Edit task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="m18.5 2.5-8 8v4h4l8-8a2 2 0 0 0 0-3z" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                    <button class="card-control duplicate" @click="duplicateTodo(item, $event)" title="Duplicate task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                    <button class="card-control delete" @click="deleteTodo(item, $event)" title="Delete task">
                        <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                </div>

                <div class="thumb" :style="item.imageUrl ? {
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${item.imagePosition?.x || 50}% ${item.imagePosition?.y || 50}%`
                } : {}" @click="editingImageId === item.id ? finishImageEdit() : openGallery(item)"
                    @mousemove="updateImagePosition(item, $event)"
                    :class="{ 'editing-image': editingImageId === item.id }" role="button"
                    :aria-label="`Choose an image for ${item.title}`" tabindex="0">
                    <span class="chip" :data-priority="item.priority">{{ item.priority }}</span>
                    <span class="due">Due: {{ item.due }}</span>

                    <button class="check" :class="{ on: item.done }" aria-label="Mark done"
                        @click.stop="toggle(item.id)">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>

                    <!-- Image Control Toolbar -->
                    <div class="image-controls" v-if="editingImageId !== item.id">
                        <button class="img-btn add-img" title="Add/Change image" @click.stop="openGallery(item)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>

                        <button v-if="item.imageUrl" class="img-btn remove-img" title="Remove image" @click.stop="removeImage(item)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        
                        <button v-if="item.imageUrl" class="img-btn reposition-img" title="Adjust position" @click.stop="startImageEdit(item, $event)">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M12 2l3 3-3 3M2 12l3-3 3 3M12 22l-3-3 3-3M22 12l-3 3-3-3" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Editing overlay -->
                    <div v-if="editingImageId === item.id" class="edit-overlay">
                        <span class="edit-hint">Move cursor to reposition • Click to finish</span>
                        <div class="crosshair"></div>
                    </div>
                </div>

                <div class="label">
                    <div class="title" :class="{ done: item.done }">{{ item.title }}</div>
                    <div class="tag">{{ item.tag }}</div>
                </div>
            </article>
        </div>

        <!-- Image Gallery Modal -->
        <div v-if="gallery.open" class="modal-backdrop" @click.self="closeGallery">
            <div class="modal">
                <header class="modal-head">
                    <h2>Unsplash</h2>
                    <button class="close" @click="closeGallery">✕</button>
                </header>

                <div class="toolbar">
                    <div class="toolbar-row">
                        <input type="text" v-model.trim="gallery.query" placeholder="Search (e.g.: city, cats, neon)"
                            @keyup.enter="searchUnsplash" />
                        <button @click="searchUnsplash" :disabled="loading || !canSpend()">Search</button>
                        <button @click="randomUnsplash" :disabled="loading || !canSpend()">Random</button>
                    </div>

                    <div class="toolbar-row">
                        <input type="text" v-model.trim="gallery.imageLink" placeholder="Paste image URL"
                            @keyup.enter="copyLink" />
                        <button @click="copyLink" :disabled="loading || !canSpend()">Link</button>
                        <button @click="uploadImage" :disabled="loading || !canSpend()">Upload</button>
                    </div>

                    <div class="toolbar-row">
                        <label class="opt">
                            <span>Orientation</span>
                            <select v-model="gallery.orientation">
                                <option value="">Any</option>
                                <option value="landscape">Landscape</option>
                                <option value="portrait">Portrait</option>
                                <option value="squarish">Squarish</option>
                            </select>
                        </label>

                        <small class="quota-info">
                            Quota: {{ quota.remaining }}/{{ quota.limit }} / h
                        </small>
                    </div>
                </div>

                <!-- Default images: zero API calls -->
                <div class="results" :class="{ loading }" v-if="useDefaults">
                    <UnsplashImages 
                        :default-image-pool="defaultImagePool"
                        :on-select-image="selectDefault"
                    />
                </div>

                <!-- Unsplash results: only after explicit action -->
                <div class="results" :class="{ loading }" v-else>
                    <div v-for="photo in gallery.results" :key="photo.id" class="result" @click="selectImage(photo)"
                        :title="`Photo by ${photo.user?.name || 'Unknown'}`">
                        <img :src="photo.urls.small" :alt="photo.alt_description || 'Unsplash photo'" loading="lazy" />
                        <div class="credit">{{ photo.user?.name || 'Unknown' }}</div>
                    </div>
                    <p v-if="!loading && gallery.results.length === 0" class="empty">No results for now.</p>
                </div>

                <footer class="modal-foot">
                    <small>Photos come from Unsplash.</small>
                </footer>
            </div>
        </div>

        <!-- Task Creation/Editing Modal -->
        <div v-if="taskModal.open" class="modal-backdrop" @click.self="closeTaskModal">
            <div class="task-modal">
                <header class="modal-head">
                    <h2>{{ taskModal.mode === 'create' ? 'Create New Task' : 'Edit Task' }}</h2>
                    <button class="close" @click="closeTaskModal" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <form @submit.prevent="submitTask" class="task-form">
                    <div class="form-group">
                        <label for="taskTitle">Task Title *</label>
                        <input 
                            id="taskTitle"
                            type="text" 
                            v-model="taskModal.form.title" 
                            placeholder="Enter task title..."
                            required
                            autofocus>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskTag">Category</label>
                            <input 
                                id="taskTag"
                                type="text" 
                                v-model="taskModal.form.tag" 
                                placeholder="e.g., Work, School, Personal">
                        </div>

                        <div class="form-group">
                            <label for="taskDue">Due Date</label>
                            <input 
                                id="taskDue"
                                type="text" 
                                v-model="taskModal.form.due" 
                                placeholder="e.g., Tomorrow, Friday, Dec 25">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" v-model="taskModal.form.priority">
                            <option value="low">🟢 Low Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="high">🔴 High Priority</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" @click="closeTaskModal">
                            Cancel
                        </button>
                        <button type="submit" class="btn-submit">
                            {{ taskModal.mode === 'create' ? 'Create Task' : 'Update Task' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteModal.open" class="modal-backdrop" @click.self="closeDeleteModal">
            <div class="delete-modal">
                <header class="modal-head danger">
                    <h2><i class="fa-solid fa-trash-arrow-up"></i> Delete Task</h2>
                    <button class="close" @click="closeDeleteModal" aria-label="Close modal">
                        ✕
                    </button>
                </header>

                <div class="delete-content">
                    <div class="delete-warning">
                        <div class="warning-icon"><i class="fa-solid fa-circle-xmark"></i></div>
                        <h3>Are you sure?</h3>
                        <p>You are about to permanently delete:</p>
                        <div class="task-preview">
                            <div class="task-title">{{ deleteModal.taskToDelete?.title }}</div>
                            <div class="task-info">
                                <span class="task-tag">{{ deleteModal.taskToDelete?.tag }}</span>
                                <span class="task-due">Due: {{ deleteModal.taskToDelete?.due }}</span>
                                <span class="task-priority" :data-priority="deleteModal.taskToDelete?.priority">
                                    {{ deleteModal.taskToDelete?.priority }}
                                </span>
                            </div>
                        </div>
                        <p class="warning-text">This action cannot be undone.</p>
                    </div>

                    <div class="delete-actions">
                        <button type="button" class="btn-cancel" @click="closeDeleteModal">
                            Cancel
                        </button>
                        <button type="button" class="btn-delete" @click="confirmDelete">
                            Delete Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.page {
    min-height: 100dvh;
    background: #0f1525 radial-gradient(1200px 400px at 50% -10%, rgba(0, 180, 255, 0.08), transparent 60%);
    color: #e9edf8;
    padding: 32px 24px 56px;
}

.neon-title {
    text-align: center;
    font-size: clamp(28px, 6vw, 64px);
    font-weight: 800;
    letter-spacing: .04em;
    color: #6ae8ff;
    text-shadow: 0 0 8px rgba(0, 240, 255, .35), 0 0 26px rgba(0, 180, 255, .25);
    margin: 8px 0 20px;
}

.grid {
    display: grid;
    gap: 22px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    align-items: start;
}

.card {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    background: #1a2035;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06), 0 14px 40px rgba(0, 0, 0, .45);
    transition: transform .18s ease, box-shadow .18s ease;
    isolation: isolate;
}

.card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 60%, rgba(255, 255, 255, .06) 70%, transparent 78%);
    transform: translateX(-8%);
    pointer-events: none;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08),
        0 18px 50px rgba(0, 0, 0, .55),
        0 0 22px rgba(0, 220, 255, .06);
}

.thumb {
    position: relative;
    height: 160px;
    background: radial-gradient(200px 80px at 30% 20%, rgba(0, 255, 255, .18), transparent 60%),
        linear-gradient(180deg, #232a46, #161b2d 65%);
    cursor: pointer;
}

.chip {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .06em;
    border-radius: 999px;
    background: rgba(0, 0, 0, .35);
    border: 1px solid rgba(255, 255, 255, .14);
    backdrop-filter: blur(6px);
}

.chip[data-priority="high"] {
    color: #ffd5d5;
    box-shadow: 0 0 12px rgba(255, 86, 86, .25) inset;
}

.chip[data-priority="medium"] {
    color: #ffeec2;
    box-shadow: 0 0 12px rgba(255, 195, 0, .18) inset;
}

.chip[data-priority="low"] {
    color: #d2ffe9;
    box-shadow: 0 0 12px rgba(0, 255, 170, .18) inset;
}

.card:hover .chip[data-priority] {
    opacity: 0;
    visibility: hidden;
}

.due {
    position: absolute;
    bottom: 12px;
    left: 12px;
    font-size: 12px;
    opacity: .85;
    color: #c8d4ff;
}

.check {
    position: absolute;
    top: 10px;
    right: 10px;
    height: 28px;
    width: 28px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: #93fbff;
    background: linear-gradient(180deg, #1e2a3d, #12192a);
    border: 1px solid rgba(255, 255, 255, .18);
    box-shadow: 0 6px 14px rgba(0, 0, 0, .35);
    transition: transform .15s ease, box-shadow .15s ease, background-color .2s ease;
}

.check:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, .4);
}

.check.on {
    color: #b7ffd9;
    background: linear-gradient(180deg, #203b2b, #13281c);
}

.label {
    background: linear-gradient(180deg, #2b2f4d, #242743);
    padding: 16px 16px 18px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, .06);
    box-shadow: 0 -1px 0 rgba(255, 255, 255, .04) inset, 0 8px 24px rgba(0, 0, 0, .35);
}

.title {
    font-weight: 700;
    font-size: 16px;
    color: #eef3ff;
    text-shadow: 0 0 14px rgba(0, 220, 255, .15);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.title.done {
    color: #a9ffcf;
    text-decoration: line-through;
    text-decoration-thickness: 2px;
}

.tag {
    margin-top: 6px;
    font-size: 12px;
    color: #98a3d4;
    opacity: .9;
}

/* Image Controls Toolbar */
.image-controls {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform: translateY(10px);
}

.card:hover .image-controls {
    opacity: 1;
    transform: translateY(0);
}

.img-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 6px;
    background: rgba(0, 0, 0, .6);
    border: 1px solid rgba(255, 255, 255, .18);
    color: #e9edf8;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(6px);
    white-space: nowrap;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    span {
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    &.add-img:hover {
        background: rgba(0, 180, 255, 0.3);
        border-color: rgba(0, 180, 255, 0.5);
        color: #00b4ff;
    }

    &.reposition-img:hover {
        background: rgba(255, 200, 0, 0.3);
        border-color: rgba(255, 200, 0, 0.5);
        color: #ffc800;
    }

    &.remove-img:hover {
        background: rgba(255, 86, 86, 0.3);
        border-color: rgba(255, 86, 86, 0.5);
        color: #ff5656;
    }
}

/* Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .55);
    display: grid;
    place-items: center;
    z-index: 1000;
    padding: 8px;
}

.modal {
    width: min(960px, 95vw);
    max-height: 90vh;
    background: #14192b;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, .08);
    box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    overflow: hidden;

    // Reponsive for mobile
    @media(max-width: 768px) {
        width: 100%;
        max-width: none;
        max-height: 95dvh;
        margin: 0;
        border-radius: 12px;
    }
}

.modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: #1b2240;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
}

.modal-head h2 {
    margin: 0;
    font-size: 16px;
    color: #cfe9ff;
}

.close {
    background: transparent;
    border: none;
    color: #cfe9ff;
    font-size: 18px;
    cursor: pointer;
    min-height: 40px;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toolbar {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: #161c34;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 6px;
        padding: 8px;
        flex-direction: column;
        align-items: stretch;
    }
}

.toolbar input {
    flex: 1;
    min-width: 120px;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, .12);
    background: #0f1525;
    color: #e9edf8;
    font-size: 14px;

    @media (max-width: 768px) {
        font-size: 16px;
        padding: 8px 10px;
    }
}

.toolbar button,
.toolbar select {
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, .12);
    background: #0f1525;
    color: #e9edf8;
    cursor: pointer;
    font-size: 13px;
    white-space: nowrap;

    @media (max-width: 768px) {
        font-size: 14px;
        padding: 8px 12px;
        min-height: 40px;
    }
}

.toolbar .quota-info {
    margin-left: auto;
    opacity: .8;
    font-size: 11px;
    white-space: nowrap;

    @media (max-width: 768px) {
        margin-left: 0;
        order: 10;
        text-align: center;
        padding: 4px 0;
        border-top: 1px solid rgba(255, 255, 255, .06);
        margin-top: 4px;
    }
}

.toolbar .toolbar-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;

    @media (max-width: 768px) {
        gap: 6px;
        width: 100%;
    }

    &:not(:last-child) {
        @media (max-width: 768px) {
            margin-bottom: 6px;
        }
    }
}

.opt {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    @media (max-width: 768px) {
        flex: 1;
        min-width: 100px;
    }
}

.results {
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
    overflow: auto;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 6px;
        padding: 6px;
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
    }

    /* Custom scrollbar for WebKit browsers */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(15, 21, 37, 0.6);
        border-radius: 8px;
        margin: 4px 0;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #2b4a6b, #1a3550);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: background-color 0.2s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #3a5d82, #225066);
        box-shadow:
            0 2px 12px rgba(0, 0, 0, 0.4),
            0 0 8px rgba(0, 180, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb:active {
        background: linear-gradient(180deg, #4a7aa3, #2a6080);
    }

    /* For Firefox */
    scrollbar-width: thin;
    scrollbar-color: #2b4a6b rgba(15, 21, 37, 0.6);
}

.results.loading {
    opacity: .7;
    filter: saturate(.7);
    pointer-events: none;
}

.result {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .06);
    background: #0e1426;
    cursor: pointer;
    transition: transform .12s ease, box-shadow .12s ease;

    @media (max-width: 768px) {
        border-radius: 6px;
    }
}

.result:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, .44);
}

.result img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;

    @media (max-width: 768px) {
        height: 80px;
    }
}

.credit {
    position: absolute;
    left: 8px;
    bottom: 8px;
    padding: 2px 6px;
    font-size: 11px;
    background: rgba(0, 0, 0, .45);
    border: 1px solid rgba(255, 255, 255, .12);
    border-radius: 999px;
    color: #e8f3ff;
}

.modal-foot {
    padding: 10px 12px;
    font-size: 12px;
    color: #9fb4ff;
    opacity: .9;
}



.thumb.editing-image {
    cursor: crosshair;
    box-shadow: 0 0 0 2px #00b4ff, 0 0 20px rgba(0, 180, 255, 0.3);

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 180, 255, 0.1);
        pointer-events: none;
    }
}

.edit-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: none;
}

.edit-hint {
    background: rgba(0, 0, 0, 0.8);
    color: #00b4ff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    text-align: center;
    border: 1px solid rgba(0, 180, 255, 0.3);
}

.crosshair {
    position: absolute;
    width: 20px;
    height: 20px;

    &::before,
    &::after {
        content: "";
        position: absolute;
        background: #00b4ff;
        box-shadow: 0 0 4px rgba(0, 180, 255, 0.6);
    }

    &::before {
        width: 20px;
        height: 1px;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
    }

    &::after {
        width: 1px;
        height: 20px;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
    }
}

/* Header Controls */
.header-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    gap: 16px;
    position: relative;

    .neon-title {
        margin: 0;
    }

    .create-btn {
        position: absolute;
        right: 0;

        @media (max-width: 768px) {
            position: static;
            margin-top: 12px;
        }
    }

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.15), rgba(0, 140, 255, 0.1));
    border: 1px solid rgba(0, 180, 255, 0.3);
    color: #00b4ff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 180, 255, 0.1);

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.25), rgba(0, 140, 255, 0.15));
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 180, 255, 0.2);
    }
}

/* Card Controls */
.card-controls {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
}

.card:hover .card-controls {
    opacity: 1;
}

.card-control {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(0, 0, 0, 0.4);
    color: #e9edf8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(6px);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    &.edit:hover {
        background: rgba(0, 180, 255, 0.2);
        border-color: rgba(0, 180, 255, 0.4);
        color: #00b4ff;
    }

    &.duplicate:hover {
        background: rgba(255, 200, 0, 0.2);
        border-color: rgba(255, 200, 0, 0.4);
        color: #ffc800;
    }

    &.delete:hover {
        background: rgba(255, 86, 86, 0.2);
        border-color: rgba(255, 86, 86, 0.4);
        color: #ff5656;
    }
}

/* Task Modal */
.task-modal {
    width: min(500px, 90vw);
    background: #14192b;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, .08);
    box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
    overflow: hidden;
}

.task-form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
}

.form-group label {
    font-size: 13px;
    font-weight: 600;
    color: #cfe9ff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-group input,
.form-group select {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, .12);
    background: #0f1525;
    color: #e9edf8;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: rgba(0, 180, 255, 0.4);
        box-shadow: 0 0 0 3px rgba(0, 180, 255, 0.1);
    }

    &::placeholder {
        color: #7a8ba0;
        opacity: 0.8;
    }
}

.form-group select {
    cursor: pointer;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-cancel,
.btn-submit {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, .12);
}

.btn-cancel {
    background: transparent;
    color: #e9edf8;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }
}

.btn-submit {
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 140, 255, 0.15));
    border-color: rgba(0, 180, 255, 0.3);
    color: #00b4ff;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(0, 140, 255, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 180, 255, 0.2);
    }
}

/* Delete Modal Styles */
.delete-modal {
    width: min(450px, 90vw);
    background: #14192b;
    border-radius: 14px;
    border: 1px solid rgba(255, 86, 86, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
    overflow: hidden;
}

.modal-head.danger {
    background: linear-gradient(135deg, rgba(255, 86, 86, 0.15), rgba(200, 60, 60, 0.1));
    border-bottom: 1px solid rgba(255, 86, 86, 0.2);

    h2 {
        color: #ff9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
    }
}

.delete-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.delete-warning {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.warning-icon {
    font-size: 48px;
    margin-bottom: 8px;
}

.delete-warning h3 {
    color: #ff9999;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.delete-warning p {
    color: #c8d4ff;
    margin: 0;
    font-size: 14px;
}

.warning-text {
    color: #ff9999 !important;
    font-weight: 600;
    font-size: 13px !important;
}

.task-preview {
    background: rgba(255, 86, 86, 0.05);
    border: 1px solid rgba(255, 86, 86, 0.2);
    border-radius: 10px;
    padding: 16px;
    margin: 8px 0;
}

.task-title {
    font-size: 16px;
    font-weight: 600;
    color: #eef3ff;
    margin-bottom: 8px;
}

.task-info {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 12px;
}

.task-tag,
.task-due {
    color: #98a3d4;
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.task-priority {
    padding: 2px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    font-weight: 600;
    
    &[data-priority="high"] {
        background: rgba(255, 86, 86, 0.2);
        color: #ffd5d5;
        border: 1px solid rgba(255, 86, 86, 0.3);
    }
    
    &[data-priority="medium"] {
        background: rgba(255, 195, 0, 0.2);
        color: #ffeec2;
        border: 1px solid rgba(255, 195, 0, 0.3);
    }
    
    &[data-priority="low"] {
        background: rgba(0, 255, 170, 0.2);
        color: #d2ffe9;
        border: 1px solid rgba(0, 255, 170, 0.3);
    }
}

.delete-actions {
    display: flex;
    gap: 12px;
}

.btn-delete {
    flex: 1;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 86, 86, 0.3);
    background: linear-gradient(135deg, rgba(255, 86, 86, 0.2), rgba(200, 60, 60, 0.15));
    color: #ff9999;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 86, 86, 0.3), rgba(200, 60, 60, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 86, 86, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
}
</style>