<script setup lang="js">
defineProps({
    defaultImagePool: {
        type: Array,
        required: true
    },
    onSelectImage: {
        type: Function,
        required: true
    }
});

const imageSections = [
    {
        title: 'Colorful Backgrounds',
        startIndex: 0,
        count: 6,
        credit: 'Colorful',
        altText: 'Colorful background'
    },
    {
        title: 'Landscapes Backgrounds',
        startIndex: 6,
        count: 6,
        credit: 'Landscape',
        altText: 'Landscapes background'
    },
    {
        title: 'Cities Backgrounds',
        startIndex: 12,
        count: 6,
        credit: 'Cities',
        altText: 'Cities background'
    },
    {
        title: 'Streets Backgrounds',
        startIndex: 18,
        count: 6,
        credit: 'Streets',
        altText: 'Streets background'
    },
    {
        title: 'Art Backgrounds',
        startIndex: 24,
        count: 6,
        credit: 'Art',
        altText: 'Art background'
    },
    {
        title: 'Food Backgrounds',
        startIndex: 30,
        count: 6,
        credit: 'Food',
        altText: 'Food background'
    },
    {
        title: 'Technology & Coding Backgrounds',
        startIndex: 36,
        count: 6,
        credit: 'Tech & Code',
        altText: 'Technology and coding background'
    },
    {
        title: 'Space Backgrounds',
        startIndex: 42,
        count: 6,
        credit: 'Space',
        altText: 'Space background'
    },
    {
        title: 'Flowers & Plants Backgrounds',
        startIndex: 48,
        count: 6,
        credit: 'Flowers & Plants',
        altText: 'Flowers and plants background'
    },
    {
        title: 'Animals Backgrounds',
        startIndex: 54,
        count: 6,
        credit: 'Animals',
        altText: 'Animals background'
    },
    {
        title: 'Cartoons Backgrounds',
        startIndex: 60,
        count: 6,
        credit: 'Cartoons',
        altText: 'Cartoons background'
    },
    {
        title: 'Anime & Manga Backgrounds',
        startIndex: 66,
        count: 6,
        credit: 'Anime & Manga',
        altText: 'Anime and manga background'
    }
];
</script>

<template>
    <div class="unsplash-images">
        <!-- Loop through each image section -->
        <template v-for="section in imageSections" :key="section.title">
            <!-- Section title -->
            <div class="section-title">{{ section.title }}</div>

            <!-- Image grid for the section -->
            <div class="section-grid">
                <div v-for="(url, i) in defaultImagePool.slice(section.startIndex, section.startIndex + section.count)"
                    :key="section.startIndex + i" class="result" @click="onSelectImage(url)"
                    :title="section.title.toLowerCase()">
                    <img :src="url" :alt="section.altText" loading="lazy" />
                    <div class="credit">{{ section.credit }}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.unsplash-images {
    display: contents; // Allows inheriting the parent grid
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
        font-size: 13px;
        margin: 10px 0 4px 0;
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
        grid-template-columns: repeat(2, 1fr);
    }
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

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(0, 0, 0, .44);
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
    background: rgba(0, 0, 0, .45);
    border: 1px solid rgba(255, 255, 255, .12);
    border-radius: 999px;
    color: #e8f3ff;
}
</style>
