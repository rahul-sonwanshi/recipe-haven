const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
/* login */
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const secretKey = "qM0wVxU96z";

/* Mongodb */
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
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

  const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (authHeader) {
      const token = authHeader.split(" ")[1]; // Bearer <token>
      jwt.verify(token, secretKey, (err, user) => {
        if (err) {
          return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401); // Unauthorized
    }
  };

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
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "30d",
      });

      res.json({ token });
    } catch (error) {
      console.error("Error signing in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/recipes", verifyToken, async (req, res) => {
    try {
      const recipes = await recipesCollection.find().toArray();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", verifyToken, async (req, res) => {
    try {
      const newRecipe = req.body;
      newRecipe.createdAt = new Date();
      newRecipe.updatedAt = new Date();
      newRecipe.ratings = [];
      newRecipe.averageRating = 0;
      const result = await recipesCollection.insertOne(newRecipe);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ error: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", verifyToken, async (req, res) => {
    try {
      const recipeId = new ObjectId(req.params.id);
      const updatedRecipe = req.body;
      updatedRecipe.updatedAt = new Date();
      const result = await recipesCollection.updateOne(
        { _id: recipeId },
        { $set: updatedRecipe }
      );
      console.log(result);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json({ message: "Recipe updated" });
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ error: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", verifyToken, async (req, res) => {
    try {
      const recipeId = new ObjectId(req.params.id);
      const result = await recipesCollection.deleteOne({ _id: recipeId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json({ message: "Recipe deleted" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  app.get("/api/recipes/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const regexQuery = { $regex: query, $options: "i" };
      const recipes = await recipesCollection
        .find({
          $or: [{ title: regexQuery }, { "ingredients.name": regexQuery }],
        })
        .toArray();
      res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ error: "Failed to search recipes" });
    }
  });

  app.post("/api/recipes/:id/rate", verifyToken, async (req, res) => {
    try {
      const recipeId = new ObjectId(req.params.id);
      const { userId, rating } = req.body;
      const updatedRecipe = await recipesCollection.findOneAndUpdate(
        { _id: recipeId },
        { $push: { ratings: { userId: new ObjectId(userId), rating } } },
        { returnDocument: "after" }
      );

      if (!updatedRecipe.value) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      const averageRating =
        updatedRecipe.value.ratings.reduce((sum, r) => sum + r.rating, 0) /
        updatedRecipe.value.ratings.length;
      await recipesCollection.updateOne(
        { _id: recipeId },
        { $set: { averageRating } }
      );
      res.json(updatedRecipe.value);
    } catch (error) {
      console.error("Error rating recipe:", error);
      res.status(500).json({ error: "Failed to rate recipe" });
    }
  });

  app.listen(port, () => {
    console.log(`running on port ${3000}`);
  });
});
