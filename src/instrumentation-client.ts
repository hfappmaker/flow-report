import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/auth/login", method: "POST" },
    { path: "/auth/register", method: "POST" },
    { path: "/auth/reset", method: "POST" },
    { path: "/auth/new-password", method: "POST" },
  ],
});
