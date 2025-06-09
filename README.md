# 🌐 Website

My personal website powered by [Astro](https://astro.build), with a focus on performance, scalability, and expressive UI animation using GSAP and Three.js.
It runs on an [Express](https://expressjs.com/) server with security middleware like Helmet and supports compression out of the box.

---

## 🚀 Features

- ⚡ Built with **Astro 5**
- 🧱 Runs on **Express** with Helmet + Compression
- 💨 CSS with **TailwindCSS**
- 🎞️ Animations via **GSAP**
- 🌌 WebGL experiences powered by **Three.js**
- 📦 Uses **pnpm** and `corepack`
- 🐳 Built for **Docker** with minimal final image (`node:slim`)
- 🧼 Linting & formatting with **ESLint** and **Prettier**

---

## 📦 Installation

> This project uses **pnpm**. `npm` and `yarn` are explicitly disallowed.

```bash
pnpm install
```

---

## 📜 Scripts

| Script           | Description                               |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the Astro development server        |
| `pnpm build`     | Build the site for production             |
| `pnpm start`     | Start the Express server (serves `dist/`) |
| `pnpm lint`      | Fix lint issues using ESLint              |
| `pnpm format`    | Format code with Prettier                 |
| `pnpm test:unit` | Run unit tests (placeholder)              |
| `pnpm test:e2e`  | Run E2E tests (placeholder)               |

---

## 🧪 Lint, Format & Test

These commands are meant to be run as part of CI:

```bash
pnpm lint
pnpm format
pnpm test:unit
pnpm test:e2e
```

---

## 🐳 Docker

This project is containerized with a multi-stage Dockerfile for optimal performance.

### 🛠️ Build the Docker image

```bash
docker build -t website .
```

### ▶️ Run the container

```bash
docker run -p 8000:8000 website
```

> The site will be accessible at: [http://localhost:8000](http://localhost:8000)

---

## 🔁 CI/CD Pipeline (Recommended)

This repository is designed to be used with a CI/CD pipeline that performs:

1. ✅ Lint and format checks
2. 🧪 Run tests

(if staging or production)

3. 🏗️ Build the Docker image
4. 📤 Push the image to Docker registry
5. 🚀 Deploy on infrastructure

---

## 🗂 Project Structure

```
.
├── public/           # Static assets
├── src/              # Astro pages, components, styles
├── server.mjs        # Express entry point
├── Dockerfile
├── astro.config.mjs
├── package.json
└── pnpm-lock.yaml
```

---

## 📄 License

MIT © Guillaume CATEL
