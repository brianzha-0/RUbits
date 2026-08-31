import {
    type RouteConfig,
    index,
    route
} from "@react-router/dev/routes";

export default [
    index("../welcome.tsx"),

    route(
        "cube",
        "../cube.tsx"
    ),

    route(
        "api/solve-cube",
        "../api.solve-cube.ts"
    )
] satisfies RouteConfig;