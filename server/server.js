const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

/* Mongodb */
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch {
    console.error("Error connecting to MongoDB", error);
  }
}

connectToDatabase().then(() => {
  app.get("/", (req, res) => {
    res.send("This is just a test");
  });

  app.listen(port, () => {
    console.log(`running on port ${3000}`);
  });
});
