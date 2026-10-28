
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const crypto = require("crypto");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Read submitted forms and JSON requests.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware must be registered before protected routes.
// MemoryStore is suitable for this local coursework project only.
app.use(session({
    name: "travel.sid",
    secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000
    }
}));

// Serve the existing website from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Connect to the existing MySQL database.
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306)
});

// A fixed catalog prevents clients from inventing destinations.
// These codes are the same ones used by destinations.js.
const DESTINATIONS = {
    "san-francisco": {
        name: "San Francisco",
        country: "United States",
        description: "Golden Gate Bridge, waterfront views, and iconic neighborhoods."
    },
    "new-york": {
        name: "New York City",
        country: "United States",
        description: "Famous skyline, Central Park, museums, and Broadway."
    },
    "paris": {
        name: "Paris",
        country: "France",
        description: "The Eiffel Tower, art museums, and charming streets."
    },
    "tokyo": {
        name: "Tokyo",
        country: "Japan",
        description: "Historic temples, modern technology, and incredible food."
    }
};

// Escape dynamic text before inserting it into server-rendered HTML.
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// Hash a password using a unique salt and PBKDF2.
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        64,
        "sha512"
    ).toString("hex");
}

// Reusable styled result page for registration/login errors.
function resultPage(title, message, linkText, link, success = true) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | Travel Adventures</title>
        <link rel="stylesheet" href="/auth.css">
        <link rel="stylesheet" href="/navigation.css">
        <script src="/navigation.js" defer></script>
    </head>
    <body>
        <header class="auth-site-header">
            <h1>Travel Adventures</h1>
            <p>Explore. Experience. Remember.</p>
        </header>

        <div id="site-navigation" class="auth-navigation-wrap"></div>

        <main class="page">
            <section class="visual-panel">
                <div class="logo">Travel Adventures.</div>

                <div class="visual-copy">
                    <h2>Every journey begins somewhere.</h2>
                    <p>
                        Beautiful destinations, unforgettable moments,
                        and new stories are waiting to be discovered.
                    </p>
                </div>

                <div class="visual-footer">
                    Explore · Experience · Remember
                </div>
            </section>

            <section class="form-panel">
                <div class="form-content result-content">
                    <div class="success-symbol ${success ? "" : "error-symbol"}">
                        ${success ? "✓" : "!"}
                    </div>

                    <div class="eyebrow">
                        ${success ? "Adventure awaits" : "Let's try again"}
                    </div>

                    <h1>${title}</h1>
                    <p class="subtitle">${message}</p>

                    <a class="primary-button" href="${link}">
                        ${linkText}
                    </a>
                </div>
            </section>
        </main>
    </body>
    </html>`;
}

// Homepage.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register a new user.
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !email.trim() ||
        !password ||
        username.trim().length > 50 ||
        email.trim().length > 100
    ) {
        return res.status(400).send(resultPage(
            "Missing or invalid details",
            "Please enter a valid username, email, and password.",
            "Back to registration",
            "/register.html",
            false
        ));
    }

    // Each account receives its own randomly generated salt.
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = hashPassword(password, salt);
    const storedPassword = salt + ":" + hashedPassword;

    const sql = `
        INSERT INTO registered_users
        (username, email, password_hash)
        VALUES (?, ?, ?)
    `;

    conn.query(
        sql,
        [username.trim(), email.trim(), storedPassword],
        (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).send(resultPage(
                        "Account already exists",
                        "That username or email is already registered.",
                        "Try registering again",
                        "/register.html",
                        false
                    ));
                }

                console.error("Registration error:", err.message);

                return res.status(500).send(resultPage(
                    "Something went wrong",
                    "We couldn't complete your registration.",
                    "Try again",
                    "/register.html",
                    false
                ));
            }

            res.send(resultPage(
                "You have successfully registered",
                "Your Travel Adventures account is ready. Let's begin your journey.",
                "Continue to login",
                "/login.html"
            ));
        }
    );
});

// Authenticate an existing user.
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const invalidLogin = () => res.status(401).send(resultPage(
        "The login credentials were incorrect",
        "The username or password doesn't match our records.",
        "Back to login",
        "/login.html",
        false
    ));

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username ||
        !password
    ) {
        return invalidLogin();
    }

    // Retrieve user_id as well as username for account-specific bookmarks.
    const sql = `
        SELECT user_id, username, password_hash
        FROM registered_users
        WHERE username = ?
    `;

    conn.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Login error:", err.message);

            return res.status(500).send(resultPage(
                "Something went wrong",
                "We couldn't process your login right now.",
                "Back to login",
                "/login.html",
                false
            ));
        }

        if (results.length === 0) {
            return invalidLogin();
        }

        const user = results[0];
        const parts = user.password_hash.split(":");

        if (parts.length !== 2) {
            return invalidLogin();
        }

        const [salt, savedHash] = parts;

        if (
            !/^[a-f0-9]{32}$/i.test(salt) ||
            !/^[a-f0-9]{128}$/i.test(savedHash)
        ) {
            return invalidLogin();
        }

        const enteredHash = hashPassword(password, salt);

        // Timing-safe comparison helps protect password verification.
        const passwordMatches = crypto.timingSafeEqual(
            Buffer.from(savedHash, "hex"),
            Buffer.from(enteredHash, "hex")
        );

        if (!passwordMatches) {
            return invalidLogin();
        }

        // Regenerate the session after a successful login.
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error("Session creation error:", sessionError);
                return res.status(500).send("Unable to start session.");
            }

            // Keep both account ID and username in the server-side session.
            req.session.user = {
                userId: user.user_id,
                username: user.username
            };

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError);
                    return res.status(500).send("Unable to save session.");
                }

                res.redirect("/profile");
            });
        });
    });
});

// Navigation uses this endpoint to check login status.
app.get("/api/session", (req, res) => {
    res.set("Cache-Control", "no-store");

    res.json(req.session.user
        ? {
            loggedIn: true,
            username: req.session.user.username
        }
        : { loggedIn: false }
    );
});

// Protect bookmark endpoints using the existing login session.
function requireLogin(req, res, next) {
    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).json({
            error: "Please log in to manage your saved destinations."
        });
    }

    next();
}

// GET: Return only the destinations saved by the logged-in user.
app.get("/api/saved-destinations", requireLogin, (req, res) => {
    const sql = `
        SELECT destination_code, saved_at
        FROM saved_destinations
        WHERE user_id = ?
        ORDER BY saved_at DESC, saved_id DESC
    `;

    conn.query(sql, [req.session.user.userId], (err, rows) => {
        if (err) {
            console.error("Loading saved destinations:", err.message);
            return res.status(500).json({
                error: "Unable to load saved destinations."
            });
        }

        const destinations = rows
            .filter(row => DESTINATIONS[row.destination_code])
            .map(row => ({
                code: row.destination_code,
                ...DESTINATIONS[row.destination_code],
                savedAt: row.saved_at
            }));

        res.set("Cache-Control", "no-store");
        res.json({ destinations });
    });
});

// POST: Save a destination for the currently logged-in account.
app.post("/api/saved-destinations", requireLogin, (req, res) => {
    const code = req.body.code;

    if (typeof code !== "string" || !DESTINATIONS[code]) {
        return res.status(400).json({
            error: "Please select a valid destination."
        });
    }

    const sql = `
        INSERT INTO saved_destinations (user_id, destination_code)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE destination_code = VALUES(destination_code)
    `;

    conn.query(
        sql,
        [req.session.user.userId, code],
        (err) => {
            if (err) {
                console.error("Saving destination:", err.message);
                return res.status(500).json({
                    error: "Unable to save this destination."
                });
            }

            res.json({
                success: true,
                message: `${DESTINATIONS[code].name} added to My Saved Places.`
            });
        }
    );
});

// DELETE: Remove one destination belonging to the logged-in account.
app.delete("/api/saved-destinations/:code", requireLogin, (req, res) => {
    const code = req.params.code;

    if (!DESTINATIONS[code]) {
        return res.status(400).json({
            error: "Invalid destination."
        });
    }

    const sql = `
        DELETE FROM saved_destinations
        WHERE user_id = ? AND destination_code = ?
    `;

    conn.query(
        sql,
        [req.session.user.userId, code],
        (err) => {
            if (err) {
                console.error("Removing destination:", err.message);
                return res.status(500).json({
                    error: "Unable to remove this destination."
                });
            }

            res.json({
                success: true,
                message: `${DESTINATIONS[code].name} removed from My Saved Places.`
            });
        }
    );
});

// Protected profile page.
// The username is taken from the active session, not the URL.
app.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    const username = escapeHtml(req.session.user.username);

    res.set("Cache-Control", "no-store");

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Profile | Travel Adventures</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="/navigation.css">
        <link rel="stylesheet" href="/destinations.css">
        <script src="/navigation.js" defer></script>
        <script src="/destinations.js" defer></script>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>Travel Adventures</h1>
                <p class="subtitle">Explore. Experience. Remember.</p>
            </header>

            <div id="site-navigation"></div>

            <main>
                <section class="content-card full-card profile-intro">
                    <p class="section-label">Explorer Profile</p>
                    <h2>Welcome back, ${username}!</h2>
                    <p>
                        You are logged in as <strong>${username}</strong>.
                        Your username is displayed from your active session.
                    </p>

                    <div class="profile-summary">
                        <div class="profile-stat">
                            <span id="saved-count">—</span>
                            <span>Saved destinations</span>
                        </div>
                        <a class="travel-button" href="/destinations.html">
                            Explore Destinations
                        </a>
                    </div>
                </section>

                <section class="content-card full-card saved-section">
                    <p class="section-label">Your Travel Wishlist</p>
                    <h2>My Saved Places</h2>
                    <p>Keep your favorite destinations together for future adventures.</p>

                    <p id="saved-message" class="destination-message"
                       role="status" aria-live="polite"></p>

                    <div id="saved-destinations" class="destination-grid">
                        <p>Loading your saved places...</p>
                    </div>
                </section>

                <section class="profile-actions">
                    <a class="profile-logout" href="/logout">
                        Log out of Travel Adventures
                    </a>
                </section>
            </main>

            <footer class="footer">
                Travel Adventures | Explore the world one journey at a time.
            </footer>
        </div>
    </body>
    </html>`);
});

// Destroy the session and remove its browser cookie.
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send(
                "Unable to log out. Please try again."
            );
        }

        res.clearCookie("travel.sid", { path: "/" });
        res.redirect("/login.html");
    });
});

// Start Express only after MySQL connects successfully.
conn.connect((err) => {
    if (err) {
        console.error("Could not connect to MySQL:", err.message);
        process.exit(1);
    }

    console.log("Database connection established successfully!");

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
