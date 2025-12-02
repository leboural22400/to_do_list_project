<script setup lang="js">
import { defineProps, defineEmits, ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['selectDefault', 'selectImage', 'close']);

// Internal state for search functionality
const gallery = ref({
    query: "",
    orientation: "",
    imageLink: "",
    results: []
});

const loading = ref(false);
const useDefaults = ref(true);

// Quota management
const QUOTA_LIMIT = 50;
const QUOTA_KEY = "unsplash-quota-v1";
const UNSPLASH_BASE = "https://api.unsplash.com";
const memoryCache = new Map();

const quota = ref({ remaining: QUOTA_LIMIT, limit: QUOTA_LIMIT });

const syncQuota = () => {
    const raw = JSON.parse(localStorage.getItem(QUOTA_KEY) || '{}');
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    let { windowStart = now, count = 0 } = raw;
    if (now - windowStart >= hour) { windowStart = now; count = 0; }
    quota.value = { remaining: QUOTA_LIMIT - count, limit: QUOTA_LIMIT };
};

const spendQuota = (n = 1) => {
    const raw = JSON.parse(localStorage.getItem(QUOTA_KEY) || '{}');
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    let { windowStart = now, count = 0 } = raw;
    if (now - windowStart >= hour) { windowStart = now; count = 0; }
    count += n;
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ windowStart, count }));
    syncQuota();
};

const canSpend = () => quota.value.remaining > 0;

// Initialize quota
onMounted(() => {
    syncQuota();
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});

// Handle ESC key to close modal
const handleKeydown = (event) => {
    if (event.key === 'Escape' && props.open) {
        handleClose();
    }
};

// Unsplash API
const searchUnsplash = async () => {
    if (!canSpend()) {
        toast.error('Quota exhausted. Try again in an hour.');
        return;
    }

    const q = gallery.value.query?.trim();
    if (!q) {
        toast.error('Please enter a search term.');
        return;
    }

    const orientation = gallery.value.orientation || "";
    const cacheKey = `search:${q}:${orientation}`;

    if (memoryCache.has(cacheKey)) {
        gallery.value.results = memoryCache.get(cacheKey);
        useDefaults.value = false;
        return;
    }

    loading.value = true;
    try {
        let url = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(q)}&per_page=24`;
        if (orientation) url += `&orientation=${orientation}`;

        const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        spendQuota();
        memoryCache.set(cacheKey, data.results);
        gallery.value.results = data.results;
        useDefaults.value = false;

        toast.success(`Found ${data.results.length} images for "${q}"`);
    } catch (err) {
        console.error('Unsplash search error:', err);
        toast.error('Search failed. Please try again.');
    } finally {
        loading.value = false;
    }
};

const randomUnsplash = async () => {
    if (!canSpend()) {
        toast.error('Quota exhausted. Try again in an hour.');
        return;
    }

    const orientation = gallery.value.orientation || "";
    const cacheKey = `random:${orientation}:${Date.now()}`;

    loading.value = true;
    try {
        let url = `${UNSPLASH_BASE}/photos/random?count=24`;
        if (orientation) url += `&orientation=${orientation}`;

        const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        spendQuota();
        memoryCache.set(cacheKey, data);
        gallery.value.results = data;
        useDefaults.value = false;

        toast.success('Random images loaded!');
    } catch (err) {
        console.error('Unsplash random error:', err);
        toast.error('Failed to load random images. Please try again.');
    } finally {
        loading.value = false;
    }
};

const copyLink = async () => {
    const imageLink = gallery.value.imageLink;

    if (!imageLink) {
        toast.error('No image URL entered.');
        return;
    }

    try {
        new URL(imageLink);
    } catch {
        toast.error('Please enter a valid image URL (e.g., https://example.com/image.jpg)');
        return;
    }

    try {
        await fetch(imageLink, { method: 'HEAD', mode: 'no-cors' });
    } catch {
        toast.error('Unable to reach this image URL.');
        return;
    }

    handleSelectImage(imageLink);
    toast.success('Custom background image applied!');
};

const uploadImage = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = false;

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            toast.error('No file selected.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('Image file too large. Please choose a file smaller than 5MB.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageLink = e.target.result;
                handleSelectImage(imageLink);
                toast.success('Custom background image applied!');
            };

            reader.onerror = () => {
                toast.error('Error reading the image file.');
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            toast.error('Error uploading the image. Please try again.');
        }
    };

    fileInput.click();
};

const handleClose = () => {
    emit('close');
};

const handleSelectDefault = (url) => {
    emit('selectDefault', url);
};

const handleSelectImage = (photo) => {
    emit('selectImage', photo);
};

// Default images (we only have 50 free requests per hour)
const defaultImagePool = [
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
];

// Image categories configuration
const imageCategories = [
    { title: 'Colorful Backgrounds', credit: 'Colorful', start: 0, end: 6 },
    { title: 'Landscapes Backgrounds', credit: 'Landscape', start: 6, end: 12 },
    { title: 'Cities Backgrounds', credit: 'Cities', start: 12, end: 18 },
    { title: 'Streets Backgrounds', credit: 'Streets', start: 18, end: 24 },
    { title: 'Art Backgrounds', credit: 'Art', start: 24, end: 30 },
    { title: 'Food Backgrounds', credit: 'Food', start: 30, end: 36 },
    { title: 'Technology & Coding Backgrounds', credit: 'Tech & Code', start: 36, end: 42 },
    { title: 'Space Backgrounds', credit: 'Space', start: 42, end: 48 },
    { title: 'Flowers & Plants Backgrounds', credit: 'Flowers & Plants', start: 48, end: 54 },
    { title: 'Animals Backgrounds', credit: 'Animals', start: 54, end: 60 },
    { title: 'Cartoons Backgrounds', credit: 'Cartoons', start: 60, end: 66 },
    { title: 'Anime & Manga Backgrounds', credit: 'Anime & Manga', start: 66, end: 72 }
];
</script>

<template>
  <!-- Modal Backdrop -->
  <div v-if="open" class="modal-backdrop" @click.self="handleClose">
    <div class="modal">
      <header class="modal-head">
        <h2>Unsplash</h2>
        <button class="close" @click="handleClose">✕</button>
      </header>

      <div class="toolbar">
        <div class="toolbar-row">
          <input
            type="text"
            v-model.trim="gallery.imageLink"
            placeholder="Paste image URL"
            @keyup.enter="copyLink"
          />
          <button @click="copyLink" :disabled="loading || !canSpend()">
            Link
          </button>
          <button @click="uploadImage" :disabled="loading || !canSpend()">
            Upload
          </button>
        </div>
      </div>

      <!-- Default images: zero API calls -->
      <div class="results" :class="{ loading }" v-if="useDefaults">
        <template v-for="category in imageCategories" :key="category.title">
          <div class="section-title">{{ category.title }}</div>
          <div class="section-grid">
            <div
              v-for="(url, i) in defaultImagePool.slice(
                category.start,
                category.end
              )"
              :key="i + category.start"
              class="result"
              @click="handleSelectDefault(url)"
              :title="category.title.toLowerCase()"
            >
              <img
                :src="url"
                :alt="category.title.toLowerCase()"
                loading="lazy"
              />
              <div class="credit">{{ category.credit }}</div>
            </div>
          </div>
        </template>
      </div>

      <!-- Unsplash results: only after explicit action -->
      <div class="results" :class="{ loading }" v-else>
        <div
          v-for="photo in gallery.results"
          :key="photo.id"
          class="result"
          @click="handleSelectImage(photo)"
          :title="`Photo by ${photo.user?.name || 'Unknown'}`"
        >
          <img
            :src="photo.urls.small"
            :alt="photo.alt_description || 'Unsplash photo'"
            loading="lazy"
          />
          <div class="credit">{{ photo.user?.name || "Unknown" }}</div>
        </div>
        <p v-if="!loading && gallery.results.length === 0" class="empty">
          No results for now.
        </p>
      </div>

      <footer class="modal-foot">
        <small>Photos come from Unsplash.</small>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Modal */
.modal-backdrop {
  width: 100%;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  place-items: center;
  z-index: 1000;
  padding: 8px;
}

.modal {
  position: relative;
  width: min(960px, 95vw);
  max-height: 90vh;
  background: #14192b;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;

  // Reponsive for mobile
  @media (max-width: 768px) {
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.toolbar {
  padding: 8px 12px;
  background: #1a2137;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar input {
  flex: 1;
  min-width: 140px;
  padding: 6px 10px;
  background: #0f1525;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #e9edf8;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: rgba(0, 180, 255, 0.4);
  }

  &::placeholder {
    color: #7a8ba0;
  }
}

.toolbar button {
  padding: 6px 12px;
  background: rgba(0, 180, 255, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  border-radius: 6px;
  color: #00b4ff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(0, 180, 255, 0.25);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.opt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #a8b3d4;

  span {
    white-space: nowrap;
  }

  select {
    padding: 4px 6px;
    background: #0f1525;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    color: #e9edf8;
    font-size: 12px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: rgba(0, 180, 255, 0.4);
    }
  }
}

.quota-info {
  font-size: 11px;
  color: #7a8ba0;
  margin-left: auto;
  white-space: nowrap;
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
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  /* Custom scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(15, 21, 37, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #2b4a6b, #1a3552);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #3a5a7b, #2a4562);
  }

  &::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, #4a6a8b, #3a5572);
  }

  /* For Firefox */
  scrollbar-width: thin;
  scrollbar-color: #2b4a6b rgba(15, 21, 37, 0.6);
}

.results.loading {
  opacity: 0.7;
  filter: saturate(0.7);
  pointer-events: none;
}

.result {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #0e1426;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  @media (max-width: 768px) {
    border-radius: 6px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.44);
  }

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;

    @media (max-width: 768px) {
      height: 80px;
    }
  }
}

.credit {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 6px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: #e8f3ff;
}

.modal-foot {
  padding: 10px 12px;
  font-size: 12px;
  color: #9fb4ff;
  opacity: 0.9;
}

.section-title {
  grid-column: 1 / -1;
  font-size: 14px;
  font-weight: 600;
  color: #cfe9ff;
  margin: 12px 0 6px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: 12px;
    margin: 8px 0 4px 0;
  }

  &:first-child {
    margin-top: 0;
  }
}

.section-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 6px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #9fb4ff;
  opacity: 0.7;
  padding: 40px 20px;
  font-style: italic;
}
</style>
