const mongoose = require("mongoose");
const express = require("express");
const argon2 = require("argon2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("No JWT_SECRET defined in .env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("No JWT_SECRET defined in .env");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
  console.log("Connected to wanderlusters database");
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  registeredTo: {
    type: Array,
    default: [],
  }
});

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
  venue: {
    type: String,
  },
  registrations: {
    type: Array,
    default: [],
  }
});

const User = mongoose.model("users", UserSchema);
const Event = mongoose.model("events", EventSchema);

app.use(express.json());
app.use(cors());
app.use(cookieParser())

app.get("/", (req, resp) => {
  resp.send("App is Working");
});

// app.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await argon2.hash(password);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();
//     const payload = { email, name };

//     const token = jwt.sign(payload, JWT_SECRET, {
//       expiresIn: 30 * 24 * 60 * 60 // 30 days
//     });
//     res.cookie("access_token", token).status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists. Please use another email." });
    }

    // If the email doesn't exist, proceed with user creation
    const hashedPassword = await argon2.hash(password);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { email, name };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: 30 * 24 * 60 * 60 // 30 days
    });

    res.cookie("access_token", token).status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const passwordMatch = await argon2.verify(user.password, password);
      if (passwordMatch) {
        const payload = { email, name: user.name };

        const token = jwt.sign(payload, JWT_SECRET, {
          expiresIn: 30 * 24 * 60 * 60 // 30 days
        });
        res.cookie("access_token", token).status(201).json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/getRegisteredEvents', async (req, res) => {
  try {
    const { email } = req.body;

    // Find all events where the user's email is present in registrations
    const events = await Event.find({ registrations: email }, 'name');
    // Extract event IDs and send them to the frontend
    const eventIds = events.map(event => event.name);
    console.log(eventIds)

    res.status(200).json({ eventIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, message: 'Internal server error' });
  }
});


// app.post("/create-event", async (req, res) => {
const createEvent = async (name) => {
  try {
    if (!name) throw new Error("Invalid body: no name defined");
    const newEvent = await Event.create({ name });
    console.log("Event created:", newEvent);
  } catch (err) {
    console.error(err);
  }
};

app.post("/create-event", async (req, res) => {
  try {
    const { name } = req.body;
    await createEvent(name); // Call the createEvent function with the provided name
    res.status(200).json({ message: "Created event successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, message: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, eventId } = req.body;
    console.log(email);
    if (!eventId) throw new Error("No event id passed");

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    let event = await Event.findOne({ name: eventId });

    if (!event) {
      // If the event does not exist, create it and add the user to its registrations
      event = await Event.create({
        name: eventId,
        registrations: [email], // Add the user's email to the registrations array
      });

      // Update user's registeredTo
      user.registeredTo.push(eventId);
      await user.save(); // Save changes to the user in the database

      return res.status(200).json({ message: "Registered Successfully" });
    }

    // If event exists, check if user is already registered
    if (event.registrations.includes(email)) {
      return res.status(200).json({ message: "User is already registered for this event" });
    }

    // Add user to the event's registrations
    event.registrations.push(email);
    await event.save(); // Save changes to the event in the database

    // Update user's registeredTo
    user.registeredTo.push(eventId);
    await user.save(); // Save changes to the user in the database

    return res.status(200).json({ message: "Registered Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, message: "Internal server error" });
  }
});


app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
