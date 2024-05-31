// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user'); // Assuming you have a User model set up

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).send();
    }

    res.send(updatedUser);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
