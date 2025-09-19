<template>
    <section class="page">
        <h1 class="neon-title">MY TO-DOs</h1>

        <div class="grid">
            <article v-for="item in items" :key="item.id" class="card" :aria-pressed="item.done ? 'true' : 'false'">
                <div class="thumb">
                    <span class="chip" :data-priority="item.priority">
                        {{ item.priority }}
                    </span>
                    <span class="due">Due: {{ item.due }}</span>

                    <button class="check" :class="{ on: item.done }" aria-label="Mark done" @click="toggle(item.id)">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>

                <!-- Label band  -->
                <div class="label">
                    <div class="title" :class="{ done: item.done }">{{ item.title }}</div>
                    <div class="tag">{{ item.tag }}</div>
                </div>
            </article>
        </div>
    </section>
</template>

<script>
export default {
    name: "TodoCards",
    data() {
        return {
            // Example of to-do items we could have
            // Fetch from an API or local storage later
            items: [
                { id: 1, title: "Submit C Lab", tag: "EFREI", due: "Tomorrow", priority: "high", done: false },
                { id: 2, title: "Review binary systems", tag: "Digital Systems", due: "Fri", priority: "medium", done: false },
                { id: 3, title: "Fix linked list", tag: "C Project", due: "Today", priority: "high", done: true },
                { id: 4, title: "Prepare democracy slides", tag: "Humanities", due: "Mon", priority: "low", done: false },
                { id: 5, title: "Probability exercises", tag: "Maths", due: "Wed", priority: "medium", done: false },
                { id: 6, title: "Dockerize mini-app", tag: "Tooling", due: "Tue", priority: "high", done: false }
            ]
        };
    },
    methods: {
        toggle(id) {
            const it = this.items.find(i => i.id === id);
            if (it) it.done = !it.done;
        }
    }
};
</script>

<style scoped>
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
</style>