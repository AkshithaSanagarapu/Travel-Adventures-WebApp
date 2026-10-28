
// Travel Adventures: saved destination interactions.
// The server owns the saved data; the browser only displays it.

document.addEventListener("DOMContentLoaded", async () => {
    const saveButtons = document.querySelectorAll(".save-button");
    const savedContainer = document.getElementById("saved-destinations");
    const savedCount = document.getElementById("saved-count");

    const destinationMessage = document.getElementById("destination-message");
    const savedMessage = document.getElementById("saved-message");

    let loggedIn = false;
    let savedCodes = new Set();

    // Display a message without injecting HTML.
    function showMessage(element, message, isError = false) {
        if (!element) return;

        element.textContent = message;
        element.classList.toggle("message-error", isError);
    }

    // Send requests to the Express bookmark API.
    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            cache: "no-store",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || "Something went wrong.");
            error.status = response.status;
            throw error;
        }

        return data;
    }

    // Determine whether the current visitor is signed in.
    async function checkSession() {
        try {
            const response = await fetch("/api/session", {
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!response.ok) return;

            const data = await response.json();
            loggedIn = data.loggedIn === true;
        } catch (error) {
            console.error("Unable to check session:", error);
        }
    }

    // Change button labels to match the user's saved places.
    function updateSaveButtons() {
        saveButtons.forEach(button => {
            const code = button.dataset.destination;
            const isSaved = savedCodes.has(code);

            button.textContent = isSaved
                ? "♥ Saved to My Places"
                : "♡ Save to My Places";

            button.classList.toggle("is-saved", isSaved);
            button.setAttribute("aria-pressed", String(isSaved));
        });
    }

    // Load the logged-in user's bookmarks from MySQL.
    async function loadSavedDestinations() {
        if (!loggedIn) {
            savedCodes = new Set();
            updateSaveButtons();
            return [];
        }

        const data = await apiRequest("/api/saved-destinations");

        savedCodes = new Set(
            data.destinations.map(destination => destination.code)
        );

        updateSaveButtons();

        return data.destinations;
    }

    // Create a saved destination card using safe DOM methods.
    function createSavedCard(destination) {
        const card = document.createElement("article");
        card.className = "destination-card saved-place-card";

        const image = document.createElement("div");
        image.className = `destination-photo ${destination.code}-photo`;
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", destination.name);

        const content = document.createElement("div");
        content.className = "destination-card-content";

        const country = document.createElement("p");
        country.className = "destination-country";
        country.textContent = destination.country;

        const heading = document.createElement("h3");
        heading.textContent = destination.name;

        const description = document.createElement("p");
        description.textContent = destination.description;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove from Saved Places";

        // Only the current user's bookmark is removed.
        removeButton.addEventListener("click", async () => {
            removeButton.disabled = true;

            try {
                const data = await apiRequest(
                    `/api/saved-destinations/${encodeURIComponent(destination.code)}`,
                    { method: "DELETE" }
                );

                showMessage(savedMessage, data.message);
                await renderProfile();
            } catch (error) {
                showMessage(savedMessage, error.message, true);
                removeButton.disabled = false;
            }
        });

        content.append(country, heading, description, removeButton);
        card.append(image, content);

        return card;
    }

    // Render the Profile page's saved places and bookmark count.
    async function renderProfile() {
        if (!savedContainer) return;

        try {
            const destinations = await loadSavedDestinations();

            if (savedCount) {
                savedCount.textContent = destinations.length;
            }

            savedContainer.replaceChildren();

            if (destinations.length === 0) {
                const empty = document.createElement("div");
                empty.className = "empty-wishlist";

                const heading = document.createElement("h3");
                heading.textContent = "Your travel wishlist is waiting!";

                const message = document.createElement("p");
                message.textContent =
                    "Explore destinations and save places you'd love to visit.";

                const link = document.createElement("a");
                link.href = "/destinations.html";
                link.className = "travel-button";
                link.textContent = "Discover Destinations";

                empty.append(heading, message, link);
                savedContainer.appendChild(empty);
                return;
            }

            destinations.forEach(destination => {
                savedContainer.appendChild(createSavedCard(destination));
            });
        } catch (error) {
            savedContainer.replaceChildren();

            const message = document.createElement("p");
            message.textContent = "Unable to load your saved places.";
            savedContainer.appendChild(message);

            showMessage(savedMessage, error.message, true);
        }
    }

    // Save or unsave a destination when its button is clicked.
    async function handleSaveClick(button) {
        if (!loggedIn) {
            showMessage(
                destinationMessage,
                "Please sign in to save destinations. Redirecting to login..."
            );

            window.location.href = "/login.html";
            return;
        }

        const code = button.dataset.destination;
        const alreadySaved = savedCodes.has(code);

        button.disabled = true;

        try {
            const data = alreadySaved
                ? await apiRequest(
                    `/api/saved-destinations/${encodeURIComponent(code)}`,
                    { method: "DELETE" }
                )
                : await apiRequest("/api/saved-destinations", {
                    method: "POST",
                    body: JSON.stringify({ code })
                });

            showMessage(destinationMessage, data.message);

            // Refresh saved status using the authoritative database data.
            await loadSavedDestinations();
        } catch (error) {
            if (error.status === 401) {
                window.location.href = "/login.html";
                return;
            }

            showMessage(destinationMessage, error.message, true);
        } finally {
            button.disabled = false;
        }
    }

    // Initialize the page.
    await checkSession();

    if (saveButtons.length > 0) {
        if (loggedIn) {
            try {
                await loadSavedDestinations();
            } catch (error) {
                showMessage(destinationMessage, error.message, true);
            }
        }

        saveButtons.forEach(button => {
            button.addEventListener("click", () => handleSaveClick(button));
        });
    }

    if (savedContainer) {
        await renderProfile();
    }
});
