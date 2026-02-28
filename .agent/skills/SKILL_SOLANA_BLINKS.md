---
name: Solana Web3 & Blinks Integration
description: Manages cryptographic polyfills, wallet connections, Solana Actions/Blinks rendering, and token operations for the Oasis app.
---

## When to use this skill

Whenever interacting with blockchain state, rendering checkout UIs, handling gig-worker tipping, managing wallet connections, or implementing token burn/mint mechanics.

## How to use it

### Crypto Polyfill Injection (Critical — Must be first import)
- `react-native-quick-crypto` MUST be imported at the very top of the app entry point (`index.js`) before ANY other imports.
- This polyfill provides the `crypto.getRandomValues` and other Node.js crypto primitives that `@solana/web3.js` requires.
- Pattern:
  ```javascript
  import 'react-native-quick-crypto';
  // ... all other imports below
  ```

### SolanaProvider Root Wrapping
- The root `App` layout MUST be wrapped in a `<SolanaProvider>` context component.
- Provider must configure:
  - `cluster`: Use `'devnet'` for development, `'mainnet-beta'` for production.
  - `endpoint`: `clusterApiUrl('devnet')` from `@solana/web3.js`.
- The provider must expose wallet connection state and transaction signing methods to all child components via React Context.

### Mobile Wallet Adapter (MWA) Protocol
- Use `@solana-mobile/mobile-wallet-adapter-protocol` for wallet connections.
- Support Phantom and Backpack wallets.
- Wallet connection flow: `authorize()` → receive `publicKey` → store in context.
- All transaction signing must go through `signTransaction()` or `signAllTransactions()`.

### Solana Actions & Blinks
- Use `@dialectlabs/blinks-react-native` to parse and render Blink URLs.
- Blink lifecycle:
  1. **GET** request to action URL → receive metadata (icon, title, description, label).
  2. Display metadata in an interactive `<BlinkButton>` component.
  3. **POST** request with user's `publicKey` → receive base64-encoded `transaction`.
  4. Deserialize transaction → prompt wallet to `signTransaction()` → send to network.
- Action URL format: `solana-action://domain.com/api/action?param=value`

### Token Operations
- SPL token transfers: use `@solana/spl-token` for creating transfer instructions.
- Token burn: create `burnChecked` instruction, wrap in Transaction, sign via MWA.
- All transactions must include recent blockhash and fee payer.

### Security Rules
- NEVER generate or store private keys in the application.
- NEVER attempt raw cryptographic signing outside the wallet adapter.
- All transaction construction must use `@solana/web3.js` Transaction/VersionedTransaction builders.
