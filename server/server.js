const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

/* Mongodb */
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

app.use(cors());
app.use(bodyParser.json());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch {
    console.error("Error connecting to MongoDB", error);
  }
}

connectToDatabase().then(() => {
  const db = client.db();
  const usersCollection = db.collection("users");
  const recipesCollection = db.collection("recipes");

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      const newUser = { username, password: hashedPassword };
      const result = await usersCollection.insertOne(newUser);

      res.status(201).json({ message: "User created" });
    } catch (error) {
      console.error("Error signing up:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await usersCollection.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ message: "Login successful" });
    } catch (error) {
      console.error("Error signing in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await recipesCollection.find().toArray();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const newRecipe = req.body;
      const result = await recipesCollection.insertOne(newRecipe);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ error: "Failed to create recipe" });
    }
  });

  app.listen(port, () => {
    console.log(`running on port ${3000}`);
  });
});
