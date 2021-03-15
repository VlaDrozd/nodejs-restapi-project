const express = require("express");
const port = process.env.PORT ?? 3000;
const secretKey = process.env.SECRET ?? "secret";
const app = express();
const boolParser = require('express-query-boolean');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { execSync } = require("child_process");
const User = require("./db/models/User.model");
const Token = require("./db/models/Tokens.model");
const database = require("./db/database");

const isExpired = (time) => {
  return time.getTime() < new Date().getTime();
};

const getExpiretion = () => {
  const minutes = 5;
  return new Date(new Date().getTime() + minutes * 60000);
};

app.use(express.json({ extended: true }));
app.use(boolParser());

// /signup
app.post("/signup", async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ error: "Incorrect data" });
    }
    const id_type = user_id.includes("@") ? "email" : "phone";
    const hashedPass = await bcrypt.hash(password, 10);

    await database.sync();
    await User.findOrCreate({
      where: {
        user_id,
      },
      defaults: {
        user_id,
        id_type,
        password: hashedPass,
      },
    });

    const token = await jwt.sign({ user_id }, secretKey);

    await Token.create({
      user_id: user_id,
      token: `Bearer ${token}`,
      expires_in: getExpiretion(),
    });

    res.status(200).json({ token: `Bearer ${token}` });
  } catch (error) {
    console.log(error);
  }
});

// /ligin
app.post("/login", async (req, res) => {
  try {
    const { user_id, password } = req.body;
    if (!user_id || !password) {
      return res.status(400).json({ error: "Incorrect data" });
    }

    await database.sync();

    const user = await User.findOne({
      where: { user_id },
    });
    if (!user) {
      return res.status(404).json({ error: "Not found" });
    }

    const checkPass = await bcrypt.compare(password, user.password);
    if (!checkPass) {
      return res.status(404).json({ error: "Incorrect passord" });
    }

    const token = await jwt.sign({ user_id }, secretKey);
    await Token.create({
      user_id: user.user_id,
      token: `Bearer ${token}`,
      expires_in: getExpiretion(),
    });

    res.status(200).json({ token: `Bearer ${token}` });
  } catch (error) {
    console.log(error);
  }
});

// /info
app.get("/info", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ error: "No Auth" });
    }

    const checkToken = await Token.findOne({
      where: { token },
    });
    if (!checkToken || isExpired(checkToken.expires_in)) {
      return res.status(400).json({ error: "No Auth" });
    }

    const user = await User.findOne({
      where: { user_id: checkToken.user_id },
    });
    if (!user) {
      return res.status(500).json({ error: "Server error" });
    }

    checkToken.expires_in = getExpiretion();

    await checkToken.save();

    res.status(200).json({ user_id: user.user_id, id_type: user.id_type });
  } catch (error) {
    console.log(error);
  }
});

// /latency
app.get("/latency", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ error: "No Auth" });
    }

    const checkToken = await Token.findOne({
      where: { token },
    });
    console.log(checkToken);
    if (!checkToken || isExpired(checkToken.expires_in)) {
      return res.status(400).json({ error: "No Auth" });
    }
    checkToken.expires_in = getExpiretion();
    await checkToken.save();

    const latency = execSync("ping -n 1 www.google.com").toString("utf8");

    res.status(200).json({ latency });
  } catch (error) {
    console.log(error);
  }
});

// /logout
app.get("/logout", async (req, res) => {
  try {
    const full = req.query.full ?? false;
    console.log(typeof full);
    const token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({ error: "No Auth" });
    }

    if (full) {
      const user_id = jwt.decode(token.split(" ")[1]).user_id;
      await Token.destroy({
        where: { user_id },
      });
    } else {
      await Token.destroy({
        where: { token },
      });
    }

    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
