<script setup lang="js">
// Get the current year for the copyright
const year = new Date().getFullYear();
</script>

<template>
    <footer class="site-footer" aria-label="Footer">
        <div class="footer__container">
            <nav class="footer__grid" aria-label="Footer navigation">
                <section class="footer__col">
                    <h3 class="footer__title">Product</h3>
                    <ul>
                        <li>
                            <RouterLink to="/to-do-list-home">All tasks</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/to-do-list-home?view=today">Today</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/to-do-list-home?view=completed">Completed</RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/to-do-list-home?view=calendar">Calendar view</RouterLink>
                        </li>
                    </ul>
                </section>

                <section class="footer__col">
                    <h3 class="footer__title">App</h3>
                    <ul>
                        <li>
                            <RouterLink to="/about">About</RouterLink>
                        </li>
                        <li><a href="#" aria-disabled="true">Pricing</a></li>
                        <li><a href="#" aria-disabled="true">Roadmap</a></li>
                        <li><a href="#" aria-disabled="true">Changelog</a></li>
                    </ul>
                </section>

                <section class="footer__col">
                    <h3 class="footer__title">Resources</h3>
                    <ul>
                        <li><a href="#" aria-disabled="true">Docs</a></li>
                        <li><a href="#" aria-disabled="true">Templates</a></li>
                        <li><a href="#" aria-disabled="true">Keyboard shortcuts</a></li>
                        <li><a href="#" aria-disabled="true">Accessibility</a></li>
                    </ul>
                </section>

                <section class="footer__col">
                    <h3 class="footer__title">Integrations</h3>
                    <ul>
                        <li><a href="#" aria-disabled="true">Browser extension</a></li>
                        <li><a href="#" aria-disabled="true">Mobile app</a></li>
                        <li><a href="#" aria-disabled="true">Calendar sync</a></li>
                        <li><a href="#" aria-disabled="true">CLI</a></li>
                    </ul>
                </section>

                <section class="footer__col">
                    <h3 class="footer__title">Legal</h3>
                    <ul>
                        <li><a href="#" aria-disabled="true">Terms of Service</a></li>
                        <li><a href="#" aria-disabled="true">Privacy Policy</a></li>
                        <li><a href="#" aria-disabled="true">Security</a></li>
                    </ul>
                </section>

                <section class="footer__col">
                    <h3 class="footer__title">Social</h3>
                    <ul>
                        <li><a href="#" aria-disabled="true">Blog</a></li>
                        <li><a href="#" aria-disabled="true">Twitter</a></li>
                        <li><a href="#" aria-disabled="true">GitHub</a></li>
                    </ul>
                </section>
            </nav>

            <div class="footer__brand">
                <span class="footer__logo" aria-hidden="true">
                    <div class="footer__social">
                        <div class="social-icons" role="group" aria-label="Social links">
                            <a href="https://github.com/TheOnlyChou" class="icon-circle" target="_blank" rel="noopener">
                                <i class="fab fa-github" aria-hidden="true"></i>
                                <span class="sr-only">GitHub</span>
                            </a>
                            <a href="https://www.concordia.ca" class="icon-circle" target="_blank" rel="noopener">
                                <img src="https://www.concordia.ca/content/concordia/en/social/guidelines-conduct.img.png/1650398601839.png" alt="Concordia" class="concordia-icon-img" />
                            </a>
                            <a href="https://www.linkedin.com/in/alexandre-chou-a-wean-alias-lee-hung-hing-72565a291/"
                                class="icon-circle" target="_blank" rel="noopener">
                                <i class="fab fa-linkedin-in" aria-hidden="true"></i>
                                <span class="sr-only">LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </span>
                <p class="footer__tagline">MyToDoList helps you organize tasks efficiently and stay productive.</p>
                <p class="footer__legal">© {{ year }} MyToDoList, Inc.</p>
            </div>
        </div>
        <div class="footer__accent" aria-hidden="true"></div>
    </footer>
</template>

<style scoped lang="scss">
// Font import
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

// For the animated border
@property --fill {
    syntax: '<percentage>';
    inherits: true;
    initial-value: 0%;
}

.site-footer {
    position: relative;
    margin-top: clamp(3rem, 8vw, 6rem);
    padding: clamp(2rem, 4vw, 3rem) 0 0.5rem;
    background: linear-gradient(to bottom, var(--surface-2), #0b0f16);
    color: var(--muted);
    border-top: 1px solid var(--border-strong);
    font-family: 'Press Start 2P', monospace !important;
    font-size: 0.75rem;
    line-height: 1.6;
}

.footer__container {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: clamp(1rem, 4vw, 2rem);
}

.footer__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem 2rem;

    @media (min-width: 700px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 1000px) {
        grid-template-columns: repeat(6, 1fr);
    }
}

.footer__col {
    ul {
        display: grid;
        gap: 0.5rem;
        margin: 0.5rem 0 0;
        padding: 0;
        list-style: none;
    }

    a {
        color: var(--muted);
        text-decoration: none;
        border-bottom: 1px dashed transparent;
        transition: color 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    a:hover {
        color: var(--fg);
        border-color: var(--link-hover);
        transform: translateY(-1px);
    }

    a[aria-disabled="true"] {
        opacity: 0.7;
        cursor: not-allowed;
    }
}

.footer__title {
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.1px;
    color: var(--fg);
    margin-bottom: 0.75rem;
}

.footer__social {
    margin-top: clamp(1.5rem, 4vw, 2rem);
    display: grid;
    place-items: center;
    gap: 0.75rem;

    .footer__note {
        margin: 0.25rem 0 0;
        color: var(--muted);
    }

    .footer__contact {
        color: var(--fg);
        text-decoration: none;
        border-bottom: 1px dotted transparent;
    }

    .footer__contact:hover {
        border-bottom-color: var(--grid-color);
    }
}

// Social icons container
.social-icons {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.icon-circle {
    --fill: 0%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #222;
    color: white;
    text-decoration: none;
    z-index: 0;
    transition: transform 160ms ease;
}

.icon-circle::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: #222;
    z-index: 1;
}

.icon-circle::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    background: conic-gradient(white var(--fill), transparent 0%);
    z-index: 0;
    transition: --fill 0.5s ease-in-out;
}

.icon-circle:hover {
    --fill: 100%;
    transform: translateY(-1px);
}

.social-icons i {
    font-size: 1.5rem;
    z-index: 2;
    transition: color 0.3s ease-in-out;
}

/* Concordia logo */
.concordia-icon-img {
    width: 60%;
    height: 60%;
    object-fit: contain;
    z-index: 2;
    filter: none;
    transition: filter 0.3s ease-in-out;
}

.footer__brand {
    margin-top: clamp(2rem, 5vw, 3rem);
    padding-top: clamp(1.25rem, 3vw, 1.75rem);
    border-top: 1px dashed var(--border);
    display: grid;
    gap: 0.4rem;
    text-align: center;
}

.footer__logo {
    font-size: 1.25rem;
    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.6));
}

.footer__tagline {
    margin: 0.25rem 0 0;
    color: var(--muted);
}

.footer__legal {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
}

.footer__accent {
    height: 3px;
    width: 100%;
    margin-top: 1rem;
    background:
        linear-gradient(90deg,
            #f59e0b 0%,
            #f59e0b 8%,
            transparent 8%, transparent 92%,
            #22d3ee 92%, #22d3ee 100%);
    opacity: 0.9;
}

.sr-only {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
    border: 0;
    padding: 0;
    margin: -1px;
}
</style>