const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET = "supersecretkey";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        content TEXT,
        images TEXT,
        created_at TEXT
    )`);
});

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashed],
        function (err) {
            if (err) return res.status(400).json({ error: "User exists" });
            res.json({ message: "Registered" });
        }
    );
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (!user) return res.status(400).json({ error: "Invalid login" });

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ error: "Invalid login" });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                SECRET,
                { expiresIn: "1h" }
            );

            res.json({ token });
        }
    );
});

app.post("/notes", authMiddleware, upload.array("images", 5), (req, res) => {
    const images = req.files.map(f => f.filename).join(",");
    const { title, content } = req.body;

    db.run(
        "INSERT INTO notes (user_id, title, content, images, created_at) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, title, content, images, new Date().toISOString()],
        () => res.json({ message: "Note saved" })
    );
});

app.get("/notes", authMiddleware, (req, res) => {
    db.all(
        "SELECT * FROM notes WHERE user_id = ?",
        [req.user.id],
        (err, rows) => res.json(rows)
    );
});

app.listen(PORT, () => console.log("Server running on port", PORT));
