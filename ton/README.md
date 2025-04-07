# TON Integration for OpenMemePad

This directory contains the TON blockchain integration files for the OpenMemePad project.

## Structure

- `contracts/` - Contains TON smart contracts, including the FungibleToken template
- `config.json` - Configuration for TON API and network endpoints

## TON Integration

The OpenMemePad project uses the TON blockchain for:

1. **Token Creation**: Launch new meme tokens on TON
2. **Wallet Management**: Connect to TON wallets and view balances
3. **Transaction History**: Track TON transactions
4. **Token Exploration**: Browse trending and new tokens on TON

## API Key

The project uses the TON API key: `RU89wxRrzNX9EcRvmTrJwc0Mnn5XBuRj`

This key is configured in:
- `src/utils/ton.ts` 
- `src/services/api.ts`
- `ton/config.json`

## Development

To work with TON contracts:

1. Edit the contract templates in `contracts/`
2. Deploy using the tools in `src/utils/ton.ts`
3. Test with a TON wallet extension

## TON Resources

- [TON Documentation](https://ton.org/docs/)
- [TON API Reference](https://tonapi.io/) 