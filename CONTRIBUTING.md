# Contributing to giqhub

Thank you for your interest in contributing! This document provides guidelines to help you get started with development and contributions.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Yarn](https://yarnpkg.com/) (Package manager)

## Setup

1. Fork the repository and clone it to your local machine:

   ```sh
   git clone https://github.com/eycjur/giqhub.git
   cd giqhub
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

## Development Workflow

### Start Development Server

Run the development server with:

```sh
yarn run dev
# open http://http://localhost:5173/home
```

This starts the Vite development server.

### Debugging with VS Code

You can debug the application using VS Code.

To start debugging:

1. Start the development server (`yarn run dev`).
2. Open the Debug panel in VS Code and select "Launch Chrome against localhost", or simply press F5 to start debugging immediately.
3. You can now set breakpoints and debug the application.

## Code Quality and Formatting

### Checking TypeScript and Svelte Types

Ensure the project is in sync and check for type errors:

```sh
yarn check
```

For continuous checking in watch mode:

```sh
yarn check:watch
```

### Code Formatting

We use Prettier for code formatting. To format all files:

```sh
yarn format
```

### Linting

Lint and automatically fix issues using:

```sh
yarn lint
```

## Architecture

For details on the architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Submitting Contributions

1. **Create a branch**:
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. **Make changes and commit**:
   ```sh
   git commit -m "feat: describe your change"
   ```
3. **Push your branch**:
   ```sh
   git push origin feature/your-feature-name
   ```
4. **Create a pull request**: Open a pull request (PR) on GitHub.

## Need Help?

If you encounter any issues or need assistance, feel free to open an issue in the repository.

Happy coding! 🚀
