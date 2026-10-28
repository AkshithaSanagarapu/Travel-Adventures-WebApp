# Travel Adventures WebApp

Travel Adventures is a travel-themed website that I developed as part of my Web Programming coursework. I originally created the travel pages and the login and registration system as separate assignments. For this project, I brought them together into one application and added session-based authentication.

I also wanted users to have something useful to do after logging in, rather than simply seeing a welcome message. To make the website more interactive, I added a feature that allows users to save destinations they are interested in visiting and manage their own travel wishlist.

## About the Website

The website is designed around my interest in traveling and exploring new places. It includes information about different destinations, travel tips, and a simple account system.

I tried to keep the design consistent throughout the website by using a teal, cream, and warm-sand color palette. I also retained the travel photographs, navigation, and layouts from my earlier assignments while incorporating the new functionality.

The website includes the following pages:

- **Home:** Introduces the website and its purpose.
- **About:** Explains why I created Travel Adventures.
- **Destinations:** Displays popular travel destinations and allows users to save their favorites.
- **Travel Tips:** Shares useful information for planning trips.
- **Register:** Allows new users to create an account.
- **Login:** Allows existing users to sign in.
- **My Profile:** Displays the logged-in user's username and saved destinations.

## Features

### User Registration and Login

Users can register by entering a username, email address, and password. Their account information is stored in a MySQL database.

Passwords are not stored directly. Instead, the application uses salted PBKDF2 password hashing to store them more securely.

When a user logs in, the application checks the entered credentials against the database. If the details are correct, the user is redirected to their profile.

### Session-Based Authentication

The main requirement of this assignment was to use session variables to store user information after login.

I implemented this using the `express-session` package in Node.js.

After a successful login, the application creates a session and stores the user's username and user ID. The username is then retrieved from the session and displayed on the My Profile page.

The navigation bar also changes depending on whether the user is logged in.

- Visitors who are not logged in see **Login** and **Register**.
- Logged-in users see **My Profile**, **Logout**, and a personalized greeting.

The My Profile page is protected, so users cannot access it without logging in.

### Logout Functionality

I added a logout route that destroys the active session and clears the session cookie.

After logging out, the user is redirected to the Login page. If they try to access My Profile again without logging in, they are redirected back to Login.

This helped me understand how sessions can be used to control access to different parts of a website.

### Save Destinations

Along with the session requirements, I added a personal travel wishlist feature.

The Destinations page currently includes four places:

- San Francisco
- New York City
- Paris
- Tokyo

Each destination has a card with a photograph, a short description, and a button to save it.

When a logged-in user clicks **Save to My Places**, the destination is added to their account. The button also changes to show that the place has already been saved.

Users can click the button again to remove a saved destination.

If someone tries to save a destination without logging in, they are redirected to the Login page.

### My Saved Places

The My Profile page includes a section called **My Saved Places**.

Here, users can view the destinations they have saved, see how many places are in their wishlist, and remove destinations they are no longer interested in.

The saved destinations are stored in MySQL and connected to each user's account through their user ID.

This means the wishlist is not lost when the user logs out. When they log back in, their previously saved destinations are still available.

It also ensures that users can only view and manage their own saved places.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Structure of the website |
| CSS | Styling, layouts, and responsive design |
| JavaScript | Navigation updates and destination interactions |
| Node.js | Running the backend application |
| Express.js | Handling routes and requests |
| express-session | Managing user sessions |
| MySQL | Storing user accounts and saved destinations |
| mysql2 | Connecting Node.js to MySQL |
| PBKDF2 | Password hashing |
| dotenv | Managing environment variables |

## Database

The application uses a MySQL database named `web_programming`.

It contains two tables.

**registered_users**

Stores account details, including the user ID, username, email, password hash, and account creation date.

**saved_destinations**

Stores the destinations saved by users. Each saved destination is associated with the corresponding user ID.

I used a separate table for saved destinations so that each account could have its own wishlist without affecting other users.

The database structure is included in `database.sql`.

## How to Run the Project

### 1. Install the Requirements

Make sure Node.js and MySQL are installed on your computer.

### 2. Set Up the Database

Start MySQL and run the SQL statements provided in `database.sql`.

This creates the database and the required tables.

### 3. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

Add the database connection details and a session secret.

The `.env` file should remain private and should not be uploaded to GitHub.

### 4. Install Dependencies

Open the project folder in a terminal and run:

```bash
npm install
```

### 5. Start the Server

Run:

```bash
npm start
```

Once the database connects successfully, the website will be available at:

`http://localhost:3000`

## Testing the Application

I tested the website by going through the complete registration, login, and logout process.

First, I logged in with an existing account and checked whether the username appeared on the My Profile page. I also verified that the navigation changed after login.

Next, I logged out and tried opening the profile directly. The application redirected me to the Login page, confirming that the protected route was working.

I also tested the saved destinations feature by adding places to my wishlist, viewing them on My Profile, and removing them. After logging out and logging back in, I checked that the remaining saved destinations were still available.

Finally, I tested what happens when a user tries to save a destination without being logged in.

These tests helped me verify that the session functionality and the destination wishlist were working together as expected.

## What I Learned

This project helped me understand how sessions work in a web application and how they can be used to maintain user information between different pages.

I also gained more practice connecting a Node.js application to MySQL, handling database queries, protecting routes, and using JavaScript to update the website without reloading the page.

One of the more interesting parts was connecting the saved destinations feature to individual user accounts. It helped me see how authentication and database relationships can work together to create a more personalized experience.

Overall, I was able to build on my previous assignments and turn them into a more complete and interactive website.

## Notes

This project was developed for coursework and is intended to run locally. It currently uses the default in-memory session store provided by `express-session`, which is not intended for production use.

The original Travel Adventures assignments have been kept separately, and this repository contains the combined and updated application.

Database credentials and other private environment variables are not included in the repository.