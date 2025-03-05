# 🔮 mongo-connect-next

[![npm version](https://img.shields.io/npm/v/mongo-connect-next.svg)](https://www.npmjs.com/package/mongo-connect-next)
[![npm downloads](https://img.shields.io/npm/dm/mongo-connect-next.svg)](https://www.npmjs.com/package/mongo-connect-next)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-12.0+-000000.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A lightweight TypeScript package for easily connecting Next.js applications to MongoDB using Mongoose. Supports both single and multiple database connections!

## ✨ Features

- 🔌 **Flexible Connection** - Support for single and multiple database connections
- 📊 **Connection Caching** - Prevents multiple connections in serverless environments
- ⚡ **Next.js Optimized** - Perfect for API routes
- 🔐 **Environment Variables** - Uses `.env` for secure connection string storage
- 📘 **TypeScript Support** - Full type definitions included
- 🧩 **Minimal Setup** - Get connected with just a few lines of code

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

### Single Database Connection (Default Mode)

```typescript
// Uses MONGODB_URI from .env by default
await connectMongo();

// Specify a different database name
await connectMongo({ dbName: "my_database" });
```

### Multiple Database Connections

```typescript
// Enable multi-database mode
await connectMongo({
  uri: "mongodb://localhost:27017/users_db",
  dbName: "users_db",
  multiDb: true, // Enables multiple database connection support
});

// Connect to another database
await connectMongo({
  uri: "mongodb://localhost:27017/products_db",
  dbName: "products_db",
  multiDb: true,
});
```

## 📚 API Reference

### `connectMongo(options?)`

Connects to MongoDB using Mongoose and caches the connection for reuse.

#### Parameters

| Parameter         | Type    | Description               | Required                                   |
| ----------------- | ------- | ------------------------- | ------------------------------------------ |
| `options`         | Object  | Connection options        | No                                         |
| `options.uri`     | String  | MongoDB connection string | No (defaults to `process.env.MONGODB_URI`) |
| `options.dbName`  | String  | Database name to use      | No                                         |
| `options.multiDb` | Boolean | Enable multiple DB mode   | No (default: false)                        |

#### Returns

- `Promise<typeof mongoose>` - Promise that resolves to a Mongoose instance

## 🚨 Important Notes

### Model Definition in Next.js

When defining models in Next.js, always check if the model already exists:

```typescript
// ✅ Correct way to define models
const MyModel =
  mongoose.models.ModelName || mongoose.model("ModelName", schema);
```

## 🧠 How It Works

- Efficiently manages MongoDB connections in Next.js
- Supports both single and multiple database connections
- Caches connections to prevent redundant connections
- Automatically handles disconnecting and creating new connections

## 📋 Complete Example

Here's a comprehensive example demonstrating multiple use cases:

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

// Prevent model recompilation
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

// models/Product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;

// lib/mongodb.ts
import { connectMongo } from "mongo-connect-next";

export { connectMongo };

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
      // Connect to users database
      await connectMongo({
        dbName: "users_db",
        multiDb: true,
      });

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

// pages/api/products/index.ts - Get all products
import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../../lib/mongodb";
import Product from "../../../models/Product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Connect to products database
      await connectMongo({
        dbName: "products_db",
        multiDb: true,
      });

      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
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
      // Connect to users database
      await connectMongo({
        dbName: "users_db",
        multiDb: true,
      });

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
