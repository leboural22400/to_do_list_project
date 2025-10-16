<script setup lang="ts">
import { computed } from "vue";

type Size = "sm" | "md" | "lg";
type Align = "left" | "center";

/**
 * A styled quote component with optional author details and customization options.
 */
interface Props {
    quote: string;
    author?: string;
    authorImg?: string;
    authorAlt?: string;
    authorStatus?: string;
    size?: Size;
    align?: Align;
    showIcon?: boolean;
    glow?: boolean;
    class?: string;
}

/**
 * Component props with default values.
 */
const props = withDefaults(defineProps<Props>(), {
    size: "md",
    align: "center",
    showIcon: true,
    glow: false,
});

/**
 * Computed properties for dynamic classes and content based on props.
 * Size classes for the quote text based on the `size` prop.
 * Defaults to "md" size.
 * @returns A string with the appropriate text size classes.
 */
const quoteSizeClass = computed(() => {
    switch (props.size) {
        case "sm":
            return "text-lg md:text-xl";
        case "lg":
            return "text-3xl md:text-4xl";
        default:
            return "text-2xl";
    }
});

/**
 * Alignment classes based on the `align` prop.
 * "left" aligns text to the left, "center" centers the text.
 * Defaults to "center".
 * @returns An object with classes for figure and caption justification.
 */
const alignment = computed(() => ({
    figure: props.align === "left" ? "text-left" : "text-center",
    captionJustify: props.align === "left" ? "justify-start" : "justify-center",
}));

/**
 * Boolean indicating if author information is provided.
 */
const hasAuthor = computed(() => Boolean(props.author));

/**
 * Computed initials from the author's name.
 * Takes the first letter of the first two words in the author's name.
 * If no author is provided, returns an empty string.
 * @returns A string with the author's initials.
 */
const authorInitials = computed(() => {
    if (!props.author) return "";
    return (
        props.author
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("") || ""
    );
});

/**
 * Computed alt text for the author's image.
 * Uses `authorAlt` prop if provided, otherwise generates a default description.
 * If no author is provided, defaults to "Author's picture".
 * @returns A string with the alt text for the author's image.
 */
const altText = computed(
    () =>
        props.authorAlt ||
        (props.author ? `Picture of ${props.author}` : "Author's picture")
);
</script>

<template>
    <figure class="mx-auto max-w-screen-md" :class="[alignment.figure, props.class]">
        <!-- Default icon -->
        <div v-if="showIcon" class="mb-4 flex items-center justify-center" :class="alignment.captionJustify">
            <slot name="icon">
                <svg class="h-10 w-10 text-gray-400 dark:text-gray-600" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
                    <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 
                1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 
                0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
            </slot>
        </div>

        <!-- Quote -->
        <!-- Inspired by https://flowbite.com/docs/typography/blockquote -->
        <blockquote class="relative" :class="glow &&
            'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:blur-xl before:opacity-70 before:bg-gradient-to-r before:from-gray-100 before:to-transparent dark:before:from-gray-800'
            ">
            <p class="font-medium italic text-gray-900 dark:text-white" :class="quoteSizeClass">
                <span aria-hidden="true" class="select-none pr-1">“</span>
                <slot>
                    {{ quote }}
                </slot>
                <span aria-hidden="true" class="select-none pl-1">”</span>
            </p>
        </blockquote>

        <!-- Author -->
        <figcaption v-if="hasAuthor" class="mt-6 flex items-center space-x-3 rtl:space-x-reverse"
            :class="alignment.captionJustify">
            <template v-if="authorImg">
                <img class="h-9 w-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700" :src="authorImg"
                    :alt="altText" loading="lazy" decoding="async" />
            </template>
            <template v-else>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 ring-2 ring-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-700"
                    aria-hidden="true">
                    {{ authorInitials }}
                </div>
            </template>

            <div class="flex items-center divide-x-2 divide-gray-400/60 rtl:divide-x-reverse dark:divide-gray-600">
                <cite class="pe-3 font-medium not-italic text-gray-900 dark:text-white">
                    {{ author }}
                </cite>
                <cite v-if="authorStatus" class="ps-3 text-sm not-italic text-gray-600 dark:text-gray-400">
                    {{ authorStatus }}
                </cite>

                <slot name="author-extra" />
            </div>
        </figcaption>

        <div v-if="$slots.footer" class="mt-4 text-sm text-gray-600 dark:text-gray-400" :class="alignment.figure">
            <slot name="footer" />
        </div>
    </figure>
</template>
