# 🔮 mongo-connect-next

[![npm version](https://img.shields.io/npm/v/mongo-connect-next.svg)](https://www.npmjs.com/package/mongo-connect-next)
[![npm downloads](https://img.shields.io/npm/dm/mongo-connect-next.svg)](https://www.npmjs.com/package/mongo-connect-next)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-12.0+-000000.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A lightweight TypeScript package for easily connecting Next.js applications to MongoDB using Mongoose. Perfect for API routes and serverless functions!

## ✨ Features

- 🔌 **Simple Connection** - One-function approach to connect to MongoDB
- 📊 **Connection Caching** - Prevents multiple connections in serverless environments
- ⚡ **Next.js Optimized** - Perfect for API routes
- 🔐 **Environment Variables** - Uses `.env` for secure connection string storage
- 📘 **TypeScript Support** - Full type definitions included
- 🧩 **Minimal Setup** - Get connected with just a few lines of code
- 🗄️ **Database Selection** - Optionally specify which database to use

## 📦 Installation

```bash
# Using npm
npm install mongo-connect-next

# Using yarn
yarn add mongo-connect-next

# Using pnpm
pnpm add mongo-connect-next
```

## 🚦 Quick Start

### Step 1: Set up your environment variables

Create a `.env` file in your project root:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### Step 2: Create a MongoDB utility

```typescript
// lib/mongodb.ts
import { connectMongo } from "mongo-connect-next";

export { connectMongo };
```

### Step 3: Use in your API routes

```typescript
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // ✅ Connect to MongoDB - will reuse existing connection
    await connectMongo();

    res.status(200).json({ message: "Connected to MongoDB!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to database" });
  }
}
```

## 💡 Usage Examples

### Specifying Database Name

```typescript
await connectMongo({ dbName: "my_database" });
```

### Overriding Connection String

```typescript
await connectMongo({
  uri: "mongodb://localhost:27017/my_local_db",
  dbName: "custom_db_name", // Optional
});
```

## 📚 API Reference

### `connectMongo(options?)`

Connects to MongoDB using Mongoose and caches the connection for reuse.

#### Parameters

| Parameter        | Type   | Description               | Required                                   |
| ---------------- | ------ | ------------------------- | ------------------------------------------ |
| `options`        | Object | Connection options        | No                                         |
| `options.uri`    | String | MongoDB connection string | No (defaults to `process.env.MONGODB_URI`) |
| `options.dbName` | String | Database name to use      | No                                         |

#### Returns

- `Promise<typeof mongoose>` - Promise that resolves to a Mongoose instance

## 🧠 How It Works

This package uses a global singleton pattern to:

1. 💾 Cache the MongoDB connection across API route invocations
2. 🔄 Prevent redundant connections during development hot reloads
3. ⚡ Ensure efficient connection management in serverless environments

## 🚨 Important Note for Next.js

When defining models in Next.js, always check if the model already exists before creating it to prevent errors during hot reloading:

```typescript
// ✅ Correct way to define models in Next.js
const MyModel =
  mongoose.models.ModelName || mongoose.model("ModelName", schema);

// ❌ Incorrect - may cause errors in development
const MyModel = mongoose.model("ModelName", schema);
```

## 📋 Complete Example

Here's a more complete example including model definition and API routes:

```typescript
// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model exists before defining it
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

// pages/api/users/index.ts - Get all users
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectMongo();
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// pages/api/users/create.ts - Create a user
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await connectMongo();
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
```

## 📝 License

MIT © Your Name

---

<p align="center">Built with 💙 for Next.js and MongoDB developers</p>
