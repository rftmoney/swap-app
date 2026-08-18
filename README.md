# Swap

Instant crypto swap UI powered by [SideShift.ai](https://sideshift.ai), inspired by exchange product layouts like Bitsten.

## Setup

1. Copy env vars:

```bash
cp .env.example .env.local
```

2. Set your SideShift credentials in `.env.local`:

```env
SIDESHIFT_SECRET=your_private_key
SIDESHIFT_AFFILIATE_ID=your_account_id
```

`SIDESHIFT_SECRET` stays on the server only. Never put it in client code.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. Load supported coins from SideShift
2. Preview rate via `/pair`
3. Create a fixed quote + shift
4. Show deposit address / QR and poll shift status
