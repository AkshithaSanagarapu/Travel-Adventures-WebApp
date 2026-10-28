
CREATE DATABASE IF NOT EXISTS web_programming;

USE web_programming;

-- Stores registered Travel Adventures accounts.
CREATE TABLE IF NOT EXISTS registered_users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Each saved destination belongs to one registered user.
-- The unique constraint prevents saving the same place twice.
CREATE TABLE IF NOT EXISTS saved_destinations (
    saved_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_code VARCHAR(50) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_destination (user_id, destination_code),

    CONSTRAINT fk_saved_destinations_user
        FOREIGN KEY (user_id)
        REFERENCES registered_users(user_id)
        ON DELETE CASCADE
);
