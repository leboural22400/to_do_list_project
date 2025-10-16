<script setup lang="js">
// Leaflet map showing distance to a reference point
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Reference location of our Montréal office
const reference = {
    name: "Evo Montreal, Canada",
    lat: 45.4999,
    lon: -73.56244
};

const mapEl = ref(null);
let map, lineLayer, refMarker, youMarker;
let ro; // ResizeObserver instance

const message = ref("Calculating... try not to move.");

/**
 * Haversine formula to calculate the great-circle distance between two points
 * on the Earth surface given their latitude and longitude in decimal degrees.
 * Returns the distance in kilometers.
 */
function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Update the message displayed to the user based on the distance in kilometers.
 * @param km 
 */
function updateMessage(km) {
    message.value = `Hi folk. We're based in ${reference.name}, roughly ${km.toFixed(1)} km from your current location.`;
}

/**
 * Handle window resize events to ensure the map resizes correctly.
 */
function handleResize() {
    if (map) map.invalidateSize();
}

/**
 * Set up the map and geolocation on component mount. Clean up on unmount.
 */
onMounted(async () => {
    // Init map
    map = L.map(mapEl.value, { zoomControl: true });
    const refLatLng = [reference.lat, reference.lon];
    map.setView(refLatLng, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Personalize icon 
    refMarker = L.marker(refLatLng, {
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [32, 32], 
            iconAnchor: [16, 32], 
            popupAnchor: [0, -32] 
        })
    }).addTo(map);

    // Ensure DOM/layout is stable before Leaflet measures the container
    await nextTick();
    map.invalidateSize();

    // Browser geolocation
    if (!navigator.geolocation) {
        message.value = "Your browser doesn't support geolocation. Charming.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const you = { lat: pos.coords.latitude, lon: pos.coords.longitude };

            // User marker
            youMarker = L.circleMarker([you.lat, you.lon], {
                radius: 8,
                weight: 2,
                opacity: 1,
                color: "#f87171",
                fillOpacity: 0.9
            }).addTo(map);

            // Dashed line
            const coords = [
                [you.lat, you.lon],
                [reference.lat, reference.lon]
            ];
            lineLayer = L.polyline(coords, {
                color: "#f87171",
                weight: 2,
                dashArray: "4,6"
            }).addTo(map);

            // Fit view then immediately re-measure
            const group = L.featureGroup([youMarker, refMarker, lineLayer]);
            map.fitBounds(group.getBounds().pad(0.2));
            setTimeout(() => map.invalidateSize(), 0);

            updateMessage(haversineKm(you, reference));
        },
        err => {
            const code = err && err.code;
            if (code === 1) message.value = "Permission denied. No worries, we respect that.";
            else if (code === 2) message.value = "Position unavailable. The GPS went on strike.";
            else if (code === 3) message.value = "Timed out. Patience has limits.";
            else message.value = "Couldn't locate you. Mysterious, isn't it.";
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    // Observe container resizes and window resizes
    ro = new ResizeObserver(() => map && map.invalidateSize());
    ro.observe(mapEl.value);
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    if (map) map.remove();
    if (ro) ro.disconnect();
    window.removeEventListener("resize", handleResize);
});
</script>

<template>
    <div class="card">
        <div ref="mapEl" class="map"></div>
        <p class="msg" v-text="message" />
    </div>
</template>

<style scoped lang="scss">
.card {
    max-width: 960px;
    margin: 1rem auto;
    padding: 0.75rem;
    border-radius: 16px;
    background: #0b1220;
    color: #e5e7eb;
    box-shadow: 0 10px 25px rgba(0, 0, 0, .3);
    z-index: 1;
}

.map {
    height: 60vh;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: .75rem;
    z-index: 1;
}

:deep(.leaflet-container img) {
    max-width: none !important;
    z-index: 1;
}

.msg {
    font-size: 1.05rem;
    line-height: 1.6;

    .km {
        color: #f43f5e;
        font-weight: 700;
    }
}

:deep(.leaflet-control-attribution) {
    font-size: 12px;
}
</style>