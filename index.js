const express = require('express');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { resolve } = require('path');
const User = require("./models/User")

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.static('static'));
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

const mongoDB = async()=>{
  await mongoose.connect(MONGO_URI)
  .then(()=>{
    console.log("Connected Successfully !")
  })
  .catch((error)=>{
    console.log("Unable to Connect to MongoDB",error)
  })
}

mongoDB();

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", user.password);

    if (!user.password) {
      return res.status(500).json({ error: 'User password is missing in database' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user: { email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
