import { IncomingMessage, ServerResponse } from "http";
import { getDB } from "./db";
import { User, Post, Comment } from "./types";

export async function loadHandler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users").then((res) =>
        res.json()
      ),
      fetch("https://jsonplaceholder.typicode.com/posts").then((res) =>
        res.json()
      ),
      fetch("https://jsonplaceholder.typicode.com/comments").then((res) =>
        res.json()
      ),
    ]);

    const db = await getDB();
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("comments").deleteMany({});

    await db.collection("users").insertMany(users);
    await db.collection("posts").insertMany(posts);
    await db.collection("comments").insertMany(comments);

    res.writeHead(200);
    res.end();
  } catch (err) {
    res.writeHead(500);
    res.end("Error loading data");
  }
}

export async function deleteAllUsers(
  _req: IncomingMessage,
  res: ServerResponse
) {
  const db = await getDB();
  await db.collection("users").deleteMany({});
  res.writeHead(200);
  res.end("All users deleted");
}

export async function deleteUserById(
  _req: IncomingMessage,
  res: ServerResponse,
  userId: number
) {
  const db = await getDB();
  const result = await db.collection("users").deleteOne({ id: userId });
  if (result.deletedCount === 0) {
    res.writeHead(404);
    res.end("User not found");
  } else {
    res.writeHead(200);
    res.end("User deleted");
  }
}

export async function getUserById(
  _req: IncomingMessage,
  res: ServerResponse,
  userId: number
) {
  const db = await getDB();
  const user = await db.collection<User>("users").findOne({ id: userId });

  if (!user) {
    res.writeHead(404);
    res.end("User not found");
    return;
  }

  const posts = await db.collection<Post>("posts").find({ userId }).toArray();
  for (const post of posts) {
    const comments = await db
      .collection<Comment>("comments")
      .find({ postId: post.id })
      .toArray();
    (post as any).comments = comments;
  }

  const result = { ...user, posts };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result));
}

export async function putUser(req: IncomingMessage, res: ServerResponse) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const user: User = JSON.parse(body);
      const db = await getDB();
      const existing = await db.collection("users").findOne({ id: user.id });

      if (existing) {
        res.writeHead(409);
        res.end("User already exists");
        return;
      }

      await db.collection("users").insertOne(user);
      res.writeHead(201, {
        "Content-Type": "application/json",
        Location: `/users/${user.id}`,
      });
      res.end(JSON.stringify(user));
    } catch (err) {
      res.writeHead(400);
      res.end("Invalid user data");
    }
  });
}
