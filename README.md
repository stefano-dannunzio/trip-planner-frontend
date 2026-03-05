# Trip Planner Frontend

A modern, responsive React application built with Vite and Tailwind CSS. This frontend provides the user interface for the Trip Planner platform, allowing users to visually plan and manage their travel itineraries.

## Architecture

This repository contains the frontend component of a decoupled web application. It is designed as a Single Page Application (SPA) that communicates with a separate Django REST API.

## Tech Stack

- **React:** For building a dynamic user interface.
- **Vite:** As a fast and modern build tool.
- **Tailwind CSS:** For efficient, utility-first styling.
- **React Leaflet:** For interactive map visualizations.
- **Hello Pangea DND:** For smooth drag-and-drop itinerary reordering.
- **Axios:** For handling API communication.

## Setup Instructions

1. Navigate to this directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file (see `.env.example`).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features

- **GitHub OAuth Integration:** Secure login using GitHub accounts.
- **Interactive Map:** Add locations to your itinerary by clicking on a map.
- **Drag-and-Drop Itinerary:** Reorder your travel plans with an intuitive interface.
- **Trip Dashboard:** Create and manage multiple trips.
- **Protected Routes:** Secure access to user-specific trip data.
- **Automatic Token Refresh:** Seamless handling of JWT expiration.
