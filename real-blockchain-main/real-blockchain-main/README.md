# One-Time Secure File Sharing Website

Full-stack implementation of a one-time file sharing platform:

- React + Vite + Tailwind frontend
- Express + MongoDB backend
- JWT authentication
- Multer-based local file uploads
- 16-digit access codes that expire after the first successful access
- Optional EVM smart-contract anchoring for upload, claim, and delete events

## Project Structure

```text
client/   React frontend
server/   Express API + MongoDB models
```

## Setup

1. Create a server env file from [server/.env.example](/c:/Users/It%20Computer%20Point/Downloads/block%20chain%20technology/server/.env.example).
2. Add your MongoDB connection string and a JWT secret to `server/.env`.
3. Optional: create `client/.env` from [client/.env.example](/c:/Users/It%20Computer%20Point/Downloads/block%20chain%20technology/client/.env.example) if your API will not run on the same host.
4. Install dependencies:

```bash
npm install
```

5. Start both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

Backend runs on `http://localhost:4000`.

## Main Features

- Register and login with JWT-based auth
- Upload a file from the dashboard
- Generate a unique 16-digit access code per upload
- Let anyone access the file from the home page without logging in
- Mark the file as used after the first successful access
- Show file status as `unused`, `used`, or `expired`
- Delete uploaded files from the dashboard
- Optional time-based expiry using `CODE_EXPIRY_HOURS`
- Optional on-chain event anchoring using `contracts/OneTimeShareLedger.sol`

## Environment Variables

Server variables:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `MAX_FILE_SIZE_MB`
- `CODE_EXPIRY_HOURS`
- `UPLOAD_DIR`
- `BLOCKCHAIN_RPC_URL`
- `BLOCKCHAIN_PRIVATE_KEY`
- `BLOCKCHAIN_CONTRACT_ADDRESS`
- `BLOCKCHAIN_CHAIN_ID`
- `BLOCKCHAIN_NETWORK_NAME`
- `BLOCKCHAIN_EXPLORER_BASE_URL`

Client variables:

- `VITE_API_URL`

## Real Blockchain Setup

The app can run in two modes:

- `Simulated`: no blockchain env vars configured
- `On-chain`: upload, claim, and delete events are written to an EVM contract

### Deploy the contract

1. Add `BLOCKCHAIN_RPC_URL` and `BLOCKCHAIN_PRIVATE_KEY` to `server/.env`.
2. Deploy the ledger contract:

```bash
npm run deploy:contract --workspace server
```

3. Copy the deployed `contractAddress` into `BLOCKCHAIN_CONTRACT_ADDRESS`.
4. Restart the server.

### Recommended free-chain setup

- Network: Base Sepolia or another free EVM testnet
- RPC URL: a public or free provider endpoint
- Explorer: set `BLOCKCHAIN_EXPLORER_BASE_URL` so transaction links appear in the blockchain dashboard

## Build Validation

```bash
npm run build
```

This builds the frontend and validates the server source tree.

## Deploy On Render

This repo includes a [render.yaml](/c:/Users/It%20Computer%20Point/Downloads/block%20chain%20technology/render.yaml) Blueprint for Render.

### Recommended setup

- Frontend: Render Static Site from `client/`
- Backend: Render Web Service from `server/`
- Database: MongoDB Atlas or another hosted MongoDB instance
- File storage: Render persistent disk mounted for the backend uploads directory

### Steps

1. Push this project to GitHub.
2. In Render, choose `New` -> `Blueprint` and connect the repo.
3. Render will detect [render.yaml](/c:/Users/It%20Computer%20Point/Downloads/block%20chain%20technology/render.yaml) and create:
   - `block-chain-technology-api`
   - `block-chain-technology-web`
4. During setup, provide these environment variables:

Backend:

- `MONGO_URI`: your MongoDB connection string
- `CLIENT_URLS`: your frontend Render URL, for example `https://block-chain-technology-web.onrender.com`

Frontend:

- `VITE_API_URL`: your backend Render URL plus `/api`, for example `https://block-chain-technology-api.onrender.com/api`

### Important notes

- The backend service uses a persistent disk because uploaded files are stored on the local filesystem.
- The Blueprint mounts that disk at `/opt/render/project/src/server/uploads`, which matches the server's `UPLOAD_DIR=../uploads` setting.
- The static frontend includes a rewrite from `/*` to `/index.html` so React Router works on refresh and direct links.
- If you change either Render URL later, update both `CLIENT_URLS` and `VITE_API_URL` and redeploy.
- name: Generate Snake

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: Platane/snk@v3
        with:
          github_user_name: your-username
          outputs: |
            dist/github-contribution-grid-snake.svg

      - uses: crazy-max/ghaction-github-pages@v3
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}



TEAM MEMBER
ABHIJEET SABUT
ABHISEK SABUT
DEEPAK KUMAR DAS
BISWAJIT PANIGRAHI 
AYUSH PRADHAN
