// The app-wide default page-transition, by name — must match a block
// defined in route-transitions.css ('fade', 'slide', 'none', ...).
// Change this one value to swap the animation everywhere at once.
export const ROUTE_TRANSITION_NAME = 'slide'

// Optional per-route override: in router/index.js, give a route
// `meta: { transition: 'slide' }` to use a different animation just for
// that route, without touching App.vue or this default.