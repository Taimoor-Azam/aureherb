import {
  authenticate,
  defineMiddlewares,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/product-reviews",
      method: ["POST"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/product-reviews/me",
      method: ["GET"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
