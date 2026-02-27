import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/calculation-chat", "routes/api.calculation-chat.ts"),
] satisfies RouteConfig;
