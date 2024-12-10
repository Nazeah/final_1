const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000; // Use dynamic port for Heroku

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URI;
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Define the meal schema and model
const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  category: String,
});

const Meal = mongoose.model("Meal", mealSchema);

// Routes

// Create a meal
app.post("/meals", async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).send(meal);
  } catch (error) {
    console.error("Error creating meal:", error);
    res.status(400).send({ error: "Error creating meal" });
  }
});

// Get all meals
app.get("/meals", async (req, res) => {
  const { category } = req.query;
  try {
    let meals;
    if (category) {
      meals = await Meal.find({ category });
    } else {
      meals = await Meal.find();
    }
    res.status(200).send(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).send({ error: "Error fetching meals" });
  }
});

// Delete a meal by ID
app.delete("/meals/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Log the ID being processed
    console.log(`Attempting to delete meal with ID: ${id}`);

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid ObjectId:", id);
      return res.status(400).send({ error: "Invalid meal ID" });
    }

    // Attempt to find and delete the meal
    const meal = await Meal.findByIdAndDelete(id);
    if (!meal) {
      console.error("Meal not found for ID:", id);
      return res.status(404).send({ error: "Meal not found" });
    }

    // Successfully deleted
    console.log(`Successfully deleted meal with ID: ${id}`);
    res.status(200).send(meal);
  } catch (error) {
    console.error("Error in DELETE request:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).send({ error: "Error deleting meal" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
