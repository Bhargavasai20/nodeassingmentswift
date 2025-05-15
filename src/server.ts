import http from "http";
import { router } from "./routes";

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
