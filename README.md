# Website Generator Implementation

**Created and designed by Satya Roshan Tholeti.**

This project uses [Convex](https://convex.dev) as its backend.

This project is connected to the Convex deployment named [`robust-dachshund-865`](https://dashboard.convex.dev/d/robust-dachshund-865).

## Project Structure

- The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
- The backend code is in the `convex` directory.

Run `npm run dev` to start the frontend and backend servers.

## App Authentication

This app uses [Convex Auth](https://auth.convex.dev/) with Anonymous authentication for easy sign in. You may want to update this before deploying your app.

## Developing and Deploying Your App

Check out the [Convex docs](https://docs.convex.dev/) for more information on developing with Convex.

- If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a great place to start.
- Learn about [Hosting and Deployment](https://docs.convex.dev/production/).
- Follow the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide to improve your app further.

## HTTP API

User-defined HTTP routes are defined in the `convex/router.ts` file. These routes are split from `convex/http.ts` to prevent the LLM from modifying authentication routes.
