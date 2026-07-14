import {
    type RouteConfig,
    index,
    route,
} from "@react-router/dev/routes";

export default [
    index("welcome/welcome.tsx"),
    route("cube", "routes/cube.tsx"),
] satisfies RouteConfig;