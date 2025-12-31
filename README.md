# 🔮 **mongo-connect-next**

<p align='center'>
  <img src='https://img.shields.io/npm/v/mongo-connect-next.svg' />
  <img src='https://img.shields.io/npm/dm/mongo-connect-next.svg' />
  <img src='https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg' />
  <img src='https://img.shields.io/badge/Next.js-16.0+-000000.svg' />
  <img src='https://img.shields.io/badge/Mongoose-9.1+-880000.svg' />
  <img src='https://img.shields.io/badge/License-MIT-yellow.svg' />
  <img src='https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933.svg' />
</p>

> A lightweight and powerful TypeScript library for connecting **Next.js 16+** apps to **MongoDB** using **Mongoose 9+** — with **multi‑DB support**, **connection caching**, and **full production-ready controls**.

---

# 🎨 **Why This README Looks Better Now**

This upgraded version includes:

✅ Better **semantic structure** (headers, labels)
<br>✅ Cleaner **code box styles & spacing**
<br>✅ Modern **badge layout** + centered section
<br>✅ Better **callout boxes**, emojis, highlights
<br>✅ Improved **tables**
<br>✅ Clear separation of sections with horizontal rules
<br>✅ Restored missing old-content sections
<br>✅ Enhanced typography & readability

---

# ✨ **Features**

- 🔌 **Flexible Connection Modes** — Single or multiple databases
- ⚡ **Next.js 16 Optimized** (App Router + Edge/Server Runtimes)
- 📊 **Connection Caching** — Eliminates duplicate connects
- 🧠 **Zero‑Config Mongoose Handling**
- 🔐 **Full ENV Support**
- 📘 **Native TypeScript 5.9+ types**
- 🛡️ **Production Ready** — TLS, pooling, timeouts
- 🔧 **Tools Included** — `disconnectMongo`, `getConnectionStatus`

---

# 📦 **Installation**

```bash
npm install mongo-connect-next
# or
yarn add mongo-connect-next
# or
pnpm add mongo-connect-next
```

---

# 🚀 **Quick Start Guide**

## **1️⃣ Add Environment Variables**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

## **2️⃣ Use Inside Next.js Route Handlers**

```ts
import { NextResponse } from "next/server";
import { connectMongo } from "mongo-connect-next";

export async function GET() {
  try {
    await connectMongo(); // Reuses cached connection
    return NextResponse.json({ message: "Connected!", status: "success" });
  } catch (error) {
    return NextResponse.json(
      { error: "DB connection failed" },
      { status: 500 }
    );
  }
}
```

## **3️⃣ Define Mongoose Models Safely**

```ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent recompilation in Next.js
export default mongoose.models.User || mongoose.model("User", UserSchema);
```

---

# 💡 **Usage Examples**

## **Single Database Connection**

```ts
await connectMongo(); // Uses ENV URI
await connectMongo({ dbName: "mydb" });
await connectMongo({ uri: "mongodb://localhost:27017/x", dbName: "x" });
```

## **Multiple Databases**

```ts
await connectMongo({
  uri: "mongodb://localhost:27017/users",
  dbName: "users",
  multiDb: true,
});
await connectMongo({
  uri: "mongodb://localhost:27017/products",
  dbName: "products",
  multiDb: true,
});
```

## **Advanced Mongoose Options**

```ts
await connectMongo({
  dbName: "prod",
  mongooseOptions: {
    maxPoolSize: 20,
    tls: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 60000,
  },
});
```

---

# 🧩 **Connection Utilities**

```ts
import { disconnectMongo, getConnectionStatus } from "mongo-connect-next";

getConnectionStatus("users");
await disconnectMongo("users"); // specific
await disconnectMongo(); // all
```

---

# 📚 **API Reference**

## **connectMongo(options?)**

| Option            | Type    | Description          | Default                   |
| ----------------- | ------- | -------------------- | ------------------------- |
| `uri`             | string  | MongoDB URI          | `process.env.MONGODB_URI` |
| `dbName`          | string  | Database name        | `undefined`               |
| `multiDb`         | boolean | Multi-database mode  | `false`                   |
| `mongooseOptions` | object  | Raw Mongoose options | `{}`                      |

**Returns:** `Promise<Mongoose>`

---

## **disconnectMongo(dbKey?)**

Disconnect one DB or all.

## **getConnectionStatus(dbKey?)**

Returns connection info.

```ts
{
  connected: boolean;
  connecting: boolean;
  key?: string;
}
```

---

# 🧪 **Testing Example**

```ts
import { connectMongo, disconnectMongo } from "mongo-connect-next";

describe("MongoDB Connection", () => {
  afterEach(async () => disconnectMongo());

  it("connects successfully", async () => {
    const mongoose = await connectMongo({
      uri: process.env.MONGODB_URI_TEST,
      dbName: "testdb",
    });
    expect(mongoose.connection.readyState).toBe(1);
  });
});
```

---

# 📝 **License**

MIT © IdeaGraphix

<p align='center'>Built with 💙 for Next.js developers</p>
