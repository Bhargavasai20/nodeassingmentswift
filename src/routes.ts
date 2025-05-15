import { IncomingMessage, ServerResponse } from "http";
import {
  loadHandler,
  deleteAllUsers,
  deleteUserById,
  getUserById,
  putUser,
} from "./handlers";

export async function router(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || "";
  const method = req.method || "";

  if (method === "GET" && url === "/load") return loadHandler(req, res);
  if (method === "DELETE" && url === "/users") return deleteAllUsers(req, res);
  if (method === "DELETE" && url.startsWith("/users/")) {
    const id = parseInt(url.split("/")[2]);
    return deleteUserById(req, res, id);
  }
  if (method === "GET" && url.startsWith("/users/")) {
    const id = parseInt(url.split("/")[2]);
    return getUserById(req, res, id);
  }
  if (method === "PUT" && url === "/users") return putUser(req, res);

  res.writeHead(404);
  res.end("Not Found");
}
