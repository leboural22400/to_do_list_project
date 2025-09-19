<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch, computed } from 'vue';

/**
 * Represents a single item in the masonry grid.
 */
type MasonryItem = {
    id?: string | number;
    src: string;
    alt?: string;
    text?: string;
    width?: number;
    height?: number;
}

/**
 * Props accepted by the masonry component.
 */
const props = withDefaults(defineProps<{
    /** List of items to display in the masonry grid */
    items: MasonryItem[]
    /** Gap between grid items (px or CSS string) */
    gap?: number | string
    /** Number of columns or responsive array [desktop, tablet, mobile] */
    columns?: number | [number, number, number]
    /** Enable/disable interactivity (click to select) */
    interactive?: boolean
    /** Display captions as overlays on hover */
    showOverlayCaptions?: boolean
}>(), {
    gap: 12,
    columns: 4,
    interactive: true,
    showOverlayCaptions: false
});

/**
 * Events emitted by the component.
 */
const emit = defineEmits<{
    /**
     * Emitted when an item is selected (clicked).
     * @param e - Event name
     * @param payload - Object containing the item and its index
     */
    (e: 'select', payload: { item: MasonryItem; index: number }): void
}>();

/** Reference to the masonry container element */
const container = ref<HTMLElement | null>(null);
/** Record of visible items by index */
const visible = reactive<Record<number, boolean>>({});
/** Track if we're on mobile */
const isMobile = ref(false);

/**
 * Computed CSS value for the gap between items.
 * Converts numeric values to `px`.
 */
const gapCSS = computed(
    () => typeof props.gap === 'number' ? `${props.gap}px` : props.gap
);

/**
 * For mobile responsiveness, we only display 3 images of the Masonry component
 * when the screen width is less than 600px.
 */
const displayedItems = computed(() => {
    return isMobile.value ? props.items.slice(0, 3) : props.items;
});

/**
 * Handles selection of an item.
 * @param item - The selected item
 * @param index - Index of the selected item
 */
function onSelect(item: MasonryItem, index: number) {
    if (!props.interactive) return;
    emit('select', { item, index });
}

/**
 * Computes inline styles for an item based on its aspect ratio.
 * @param item - The item to style
 * @returns CSS custom property with aspect ratio percentage
 */
function itemStyle(item: MasonryItem) {
    if (item.width && item.height) {
        const ratio = (item.height / item.width) * 100;
        return { '--ratio': `${ratio}%` } as Record<string, string>;
    }
    return {};
}

/** Intersection observer for lazy-loading visible items */
let io: IntersectionObserver | null = null;
/** Media query for mobile detection */
let mediaQuery: MediaQueryList | null = null;

/**
 * Updates the mobile state based on screen width
 */
function updateMobileState() {
    isMobile.value = window.innerWidth < 450;
}

onMounted(() => {
    if (!container.value) return;
    
    // Setup mobile detection
    updateMobileState();
    mediaQuery = window.matchMedia('(max-width: 599px)');
    mediaQuery.addEventListener('change', (e) => {
        isMobile.value = e.matches;
    });
    
    io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                const idx = Number((e.target as HTMLElement).dataset.index);
                visible[idx] = true;
                io?.unobserve(e.target);
            }
        }
    }, { rootMargin: '200px' });

    container.value.querySelectorAll('.thumb').forEach((el, idx) => {
        ; (el as HTMLElement).dataset.index = String(idx);
        io?.observe(el);
    });
});

onBeforeUnmount(() => {
    io?.disconnect();
    mediaQuery?.removeEventListener('change', updateMobileState);
});

/**
 * For mobile responsiveness, we only display 3 images of the Masonry component
 * when the screen width is less than 600px.
 */
</script>

<template>
    <div class="masonry" :style="{ columnGap: gapCSS }" ref="container" role="list" aria-label="Galerie en maçonnerie">
        <figure v-for="(item, i) in displayedItems" :key="item.id ?? i" class="masonry-item" role="listitem"
            :style="itemStyle(item)" :tabindex="interactive ? 0 : -1" @click="onSelect(item, i)"
            @keydown.enter.space.prevent="interactive && onSelect(item, i)">
            <div class="thumb" :class="{ 'is-visible': visible[i] }">
                <img :src="item.src" :alt="item.alt || ''" loading="lazy" decoding="async" :width="item.width"
                    :height="item.height" />
                <div v-if="showOverlayCaptions" class="overlay">
                    <slot name="caption" :item="item">
                        <figcaption class="caption">{{ item.text }}</figcaption>
                    </slot>
                </div>
            </div>
            <template v-if="!showOverlayCaptions">
                <slot name="caption" :item="item">
                    <figcaption class="caption below">{{ item.text }}</figcaption>
                </slot>
            </template>
        </figure>
    </div>
</template>

<style scoped>
/* Responsive column counts */
.masonry {
    column-fill: balance;
}

@media (min-width: 0px) {
    .masonry {
        column-count: 1;
    }
}

@media (min-width: 520px) {
    .masonry {
        column-count: 2;
    }
}

@media (min-width: 900px) {
    .masonry {
        column-count: 3;
    }
}

@media (min-width: 1200px) {
    .masonry {
        column-count: 4;
    }
}

/* Item card */
.masonry-item {
    break-inside: avoid;
    margin-bottom: var(--gap, 12px);
}

/* Keep gap consistent across themes otherwise it will be hard to maintain */
:host,
:root {
    --gap: 12px;
}

.thumb {
    position: relative;
    display: block;
    border-radius: 12px;
    overflow: hidden;
    background: hsl(0 0% 92%);
    box-shadow: 0 1px 6px hsl(0 0% 0% / 0.08);
    transform: translateY(6px);
    opacity: 0;
    transition: opacity .35s ease, transform .35s ease;
}

.thumb.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* For intrinsic ratio */
.thumb::before {
    content: "";
    display: block;
    padding-top: var(--ratio, 66%);
}

.thumb>img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Overlay caption (hover/focus) */
.overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: end start;
    padding: 10px;
    background: linear-gradient(to top, hsl(0 0% 0% / .45), transparent 55%);
    color: white;
    opacity: 0;
    transition: opacity .25s ease;
}

.masonry-item:focus .overlay,
.thumb:hover .overlay {
    opacity: 1;
}

.caption {
    font-size: .9rem;
    line-height: 1.3;
}

/* White color for now, could be improved (but don't use dark colors) */
.caption.below {
    margin-top: 6px;
    color: #ffffff;
    text-align: center;
}

/* Pointer cursor for interactive items */
.masonry-item {
    cursor: pointer;
}

/* Blue focus when the user selects an item */
.masonry-item:focus {
    outline: 2px solid hsl(220 90% 60%);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .thumb {
        transition: none;
    }
}
</style>