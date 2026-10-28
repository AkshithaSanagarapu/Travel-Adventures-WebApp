# Travel Adventures WebApp

Travel Adventures is a travel-themed website that I developed as part of my Web Programming coursework. I originally created the travel pages and the login and registration system as separate assignments. For this project, I brought them together into one application and added session-based authentication.

The main goal of this assignment was to use session variables to keep track of logged-in users, display their username on another page, and allow them to log out securely.

I also extended the website with a **My Saved Places** feature, where users can save destinations they would like to visit. These selections are stored in MySQL and linked to individual user accounts.

## Features

### 1. Travel Website

The website includes several pages that introduce visitors to different destinations and provide basic travel information.

- **Home:** The main landing page of Travel Adventures.
- **About:** Information about the website and its purpose.
- **Destinations:** Featured destinations with descriptions and images.
- **Travel Tips:** Useful tips for planning trips and traveling.

The original travel-themed design has been maintained throughout the application, with consistent navigation and styling across pages.

### 2. User Registration and Login

Users can create an account using a username, email address, and password.

Registration information is stored in a MySQL database. Passwords are protected using PBKDF2 hashing with a randomly generated salt rather than being stored as plain text.

Registered users can log in using their username and password. The server verifies their credentials before creating a session.

### 3. Session-Based Authentication

Session management is implemented using the `express-session` package.

After a successful login, the application stores the user's ID and username in a server-side session:

```javascript
req.session.user = {
    userId: user.user_id,
    username: user.username
};
```

This allows the application to recognize the logged-in user when they navigate between pages without requiring them to log in again.

The website also includes an `/api/session` endpoint, which the navigation system uses to check whether a user is currently logged in.

Based on the session status, the navigation displays the appropriate links for guests or logged-in users.

### 4. User Profile Page

After logging in, users are redirected to the `/profile` page.

The profile page displays a personalized welcome message using the username stored in the active session.

For example, a user who logs in with the username `traveler123` will see:

**Welcome back, traveler123!**

The username is retrieved from the session rather than being passed through the URL.

The profile page is protected, meaning that users who are not logged in are redirected to the login page.

### 5. Logout Functionality

A `/logout` endpoint allows users to end their session.

When a user clicks the Logout link, the application destroys the active session, clears the session cookie, and redirects them to the login page.

After logging out, the user can no longer access the protected profile page unless they log in again.

### 6. My Saved Places

I added a destination-saving feature to make the website more interactive and personalized.

Logged-in users can save destinations they are interested in visiting by clicking the heart-shaped Save button on a destination card.

The available destinations include:

- San Francisco, United States
- New York City, United States
- Paris, France
- Tokyo, Japan

Saved destinations appear under **My Saved Places** on the user's profile page.

Users can also remove destinations from their saved list. The profile displays the total number of saved destinations.

Each saved destination is associated with the user's account in MySQL, so users only see and manage their own selections.

Visitors who are not logged in are prompted to log in before saving destinations.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the website |
| CSS3 | Page layouts, styling, and responsive design |
| JavaScript | Navigation updates and destination interactions |
| Node.js | Server-side JavaScript runtime |
| Express.js | Routing and backend functionality |
| express-session | User session management |
| MySQL | Storage of registered users and saved destinations |
| mysql2 | Communication between Node.js and MySQL |
| dotenv | Loading environment variables |
| Node.js Crypto | Password hashing and verification |

## Project Structure

```text
Travel-Adventures-WebApp/
│
├── public/
│   ├── index.html
│   ├── about.html
│   ├── destinations.html
│   ├── tips.html
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   ├── auth.css
│   ├── navigation.css
│   ├── navigation.js
│   ├── destinations.css
│   └── destinations.js
│
├── server.js
├── database.sql
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

The `.env` file is created locally and excluded from GitHub because it contains database credentials and the session secret.

## Database Design

The application uses a MySQL database named `web_programming`.

The `database.sql` file contains the SQL statements needed to create the required database tables.

### registered_users

This table stores information about registered users.

| Column | Description |
|---|---|
| user_id | Unique ID for each registered user |
| username | Username used for login |
| email | Registered email address |
| password_hash | Salted and hashed password |
| created_at | Account creation timestamp |

### saved_destinations

This table stores the destinations saved by individual users.

| Column | Description |
|---|---|
| saved_id | Unique ID for each saved record |
| user_id | ID of the user who saved the destination |
| destination_code | Code identifying the destination |
| saved_at | Date and time the destination was saved |

The `user_id` column creates a relationship between `saved_destinations` and `registered_users`.

A unique constraint prevents the same user from saving the same destination multiple times.

## How to Run the Project Locally

### Step 1: Install the Required Software

Make sure Node.js and MySQL are installed on your computer.

You will also need a code editor, such as Visual Studio Code, to view or modify the project files.

### Step 2: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/AkshithaSanagarapu/Travel-Adventures-WebApp.git
```

Navigate into the project folder:

```bash
cd Travel-Adventures-WebApp
```

### Step 3: Set Up the Database

Start your local MySQL server.

Run the SQL statements provided in `database.sql` to create the `web_programming` database and its required tables.

For example, from the project directory:

```bash
mysql -u root -p < database.sql
```

Enter your MySQL password when prompted.

### Step 4: Configure Environment Variables

Create a file named `.env` in the root directory of the project, alongside `server.js`.

Add the following configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=web_programming
DB_PORT=3306
SESSION_SECRET=replace_with_a_long_random_secret
```

Replace `your_mysql_password` with your actual MySQL password.

Replace the `SESSION_SECRET` placeholder with a long, randomly generated secret.

The `.env` file is included in `.gitignore` so that sensitive credentials are not uploaded to GitHub.

### Step 5: Install Dependencies

Run:

```bash
npm install
```

This installs the packages required by the application.

### Step 6: Start the Server

Run:

```bash
npm start
```

If the database connection is successful, the terminal should display:

```text
Database connection established successfully!
Server running at http://localhost:3000
```

### Step 7: Open the Website

Open a web browser and visit:

http://localhost:3000

You can now explore the website, register an account, log in, and try the saved destinations feature.

## Testing the Session Variables

The following steps demonstrate the main requirements of the assignment.

**Test 1: User Login and Session Creation**

1. Open `/register.html` and create a new account, or use an existing registered account.
2. Navigate to `/login.html`.
3. Enter the registered username and password.
4. Submit the login form.
5. After successful authentication, the application creates a session and redirects the user to `/profile`.

**Expected Result:** The user is successfully logged in, and their username and user ID are stored in the session.

**Test 2: Displaying the Username on Another Page**

1. Log in to the application.
2. Open `/profile`.
3. Check the welcome message displayed on the page.

**Expected Result:** The profile displays the username retrieved from the active session.

**Test 3: Session-Aware Navigation**

1. Open the website without logging in.
2. Observe the navigation menu.
3. Log in and return to the website.
4. Observe how the navigation changes.

**Expected Result:** The navigation displays the appropriate login or profile options depending on the user's session status.

**Test 4: Logout and Session Destruction**

1. Log in to the website.
2. Open the profile page.
3. Click the Logout link.
4. Try accessing `/profile` again.

**Expected Result:** The session is destroyed, the user is redirected to the login page, and the protected profile is no longer accessible.

**Test 5: Saving Destinations**

1. Log in to the application.
2. Open the Destinations page.
3. Click Save on one or more destination cards.
4. Navigate to the profile page.
5. Check the My Saved Places section.
6. Remove a destination and verify that the saved list updates.

**Expected Result:** Saved destinations appear on the user's profile and are stored in the database. Removing a destination updates the user's saved list.

## Important Backend Routes

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Displays the homepage |
| `/register` | POST | Registers a new user |
| `/login` | POST | Authenticates a user and creates a session |
| `/profile` | GET | Displays the protected profile page |
| `/logout` | GET | Destroys the session and logs out the user |
| `/api/session` | GET | Returns the current login status |
| `/api/saved-destinations` | GET | Retrieves the user's saved destinations |
| `/api/saved-destinations` | POST | Saves a destination |
| `/api/saved-destinations/:code` | DELETE | Removes a saved destination |

## Code Comments and Organization

The source code includes comments explaining important parts of the application, particularly the backend logic and session management.

In `server.js`, comments identify the session middleware, authentication process, session creation, protected routes, database operations, and logout functionality.

The frontend JavaScript handles navigation and destination interactions, while the HTML and CSS files are organized around the website's pages and visual components.

This separation makes the project easier to understand, maintain, and extend.

## Additional Notes

- The application uses Express's default in-memory session store, which is suitable for this local coursework project but is not intended for production deployment.
- Passwords are stored using salted PBKDF2 hashes rather than plain text.
- Database queries use parameter placeholders when handling user-supplied values.
- Session information is maintained on the server, while the browser stores a session cookie.
- Saved destinations are associated with individual accounts through their user IDs.
- The `.env` file and `node_modules` directory are excluded from GitHub.

## Assignment Information

**Course:** Web Programming — Fall 2026

**Assignment:** Using Session Variables for User Data

**GitHub Repository:** https://github.com/AkshithaSanagarapu/Travel-Adventures-WebApp

## Conclusion

Through this assignment, I learned how session variables can be used to maintain user information across different pages of a website.

By combining the existing login and registration system with Express sessions, I was able to create a personalized profile page, display the logged-in user's username, and implement logout functionality that ends the session.

I also used the session information to connect the saved destinations feature to individual user accounts. This helped me understand how session management, backend routes, and database operations work together in a web application.
