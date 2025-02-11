# TON Validators Metrics

A comprehensive monitoring and metrics collection system for TON (The Open Network) validators. This project provides tools and infrastructure for tracking validator performance, health, and various network metrics.

> **Note:** Currently supports only specific validator contracts:
> - ✅ [Nominator Pool](https://github.com/ton-blockchain/nominator-pool)
> - ❌ [Single Nominator Pool](https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool)
> - ❌ [Liquid Staking Contracts](https://github.com/ton-blockchain/liquid-staking-contract)
> - ❌ [Restricted Wallet](https://github.com/EmelyanenkoK/nomination-contract/blob/master/restricted-wallet/wallet.fc)
> - ❌ [Simple Hot Wallet](https://github.com/ton-blockchain/ton/blob/master/crypto/smartcont/wallet3-code.fc)

## Table of Contents

- [Project Overview](#project-overview)
  - [Apps](#apps)
  - [Packages](#packages)
- [Available Metrics](#available-metrics)
  - [Validator Status](#validator-status)
  - [Pool Status](#pool-status)
  - [Validation Cycle](#validation-cycle)
  - [Update Tracking](#update-tracking)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Environment Configuration](#environment-configuration)
  - [Docker Deployment](#docker-deployment)
- [License](#license)

## Project Overview

This is a monorepo project built with TypeScript that consists of several packages and applications designed to monitor and collect metrics from TON validators.

### Apps

| Application | Description |
|---------|-------------|
| `apps/monitoring` | Core service that collects and exposes validator metrics via Prometheus. Tracks balances, staking pools, elections, and performance metrics with real-time monitoring capabilities. |

### Packages

| Package | Description |
|---------|-------------|
| `packages/client` | TON blockchain interaction layer with connection pooling, automatic retries, and high-level contract abstractions. |
| `packages/config` | Type-safe configuration system for validator addresses, network selection, and service parameters. |
| `packages/logger` | Structured logging with contextual information and performance tracking for production monitoring. |
| `packages/types` | Shared TypeScript type definitions and protocol-specific implementations. |
| `packages/utils` | Infrastructure components for scheduled tasks, network operations, and background processing. |

## Available Metrics

> For implementation details, see [metrics.ts](apps/monitoring/src/metrics.ts)

### Validator Status

| Metric | Description | Alert Threshold | Labels |
|--------|-------------|-----------------|--------|
| `validator_balance` | Balance for operational expenses | < 50 TON (top up to 150 TON) | network, validator |
| `validator_efficiency` | Performance metric (expected blocks) | < 95% at round end | network, validator |
| `validator_participation_status` | Election participation (0: not participating, 1: participating) | Should be 1 | network, validator |
| `validator_participation_position` | Position in validator list (-1: not found, ≥0: position) | >100 and ≤400 | network, validator |
| `validator_new_stake_message` | Last stake message timestamp | Must be within election window (20m) | network, validator |
| `validator_recover_stake_request` | Last stake recovery timestamp | Required after round end (20m) | network, validator |

### Pool Status

| Metric | Description | Alert Threshold | Labels |
|--------|-------------|-----------------|--------|
| `pool_state` | Pool validation cycle status (0: not participating, 1: new stake request, 2: participating) | Should be 2 during validation | network, validator, pool |
| `pool_nominators_count` | Number of active nominators in the pool | - | network, validator, pool |
| `pool_balance` | Current balance on the nominator pool contract | - | network, validator, pool |
| `pool_elector_balance` | Current balance in elector contract | - | network, validator, pool |
| `pool_stake_amount_sent` | Amount of stake sent for validation | Should match expected stake | network, validator, pool |
| `pool_validator_amount` | Validator's stake (activation deposit) | Should be > minimum stake | network, validator, pool |

### Validation Cycle

| Metric | Description | Alert Threshold | Labels |
|--------|-------------|-----------------|--------|
| `validation_cycle_id` | Current validation cycle ID | - | network |
| `validation_unfreeze_at` | Timestamp when staked funds will be unlocked | - | network |
| `validators_elected_for` | Validation round duration (~18h 12m 16s) | = 65535 seconds | network |
| `stake_held_for` | Time funds are held in elector after validation (~9h 6m 8s) | = 32768 seconds | network |
| `elections_start_before` | Time before validation when elections start (~9h 6m 8s) | = 32768 seconds | network |
| `elections_end_before` | Time before validation when elections end (~2h 16m 32s) | = 8192 seconds | network |

### Update Tracking

| Metric | Description | Alert Threshold | Labels |
|--------|-------------|-----------------|--------|
| `validator_balance_updated_at` | Last successful update timestamp for validator balance | > 5 min delay | network, validator |
| `validator_messages_updated_at` | Last successful update timestamp for validator messages | > 5 min delay | network, validator |
| `validator_efficiency_updated_at` | Last successful update timestamp for validator efficiency | > 5 min delay | network, validator |
| `pool_update_at` | Last successful update timestamp for pool status | > 5 min delay | network, validator, pool |
| `pool_balance_updated_at` | Last successful update timestamp for pool balance | > 5 min delay | network, validator, pool |
| `pool_elector_balance_updated_at` | Last successful update timestamp for elector balance | > 5 min delay | network, validator, pool |
| `elections_data_updated_at` | Last successful update timestamp for elections data | > 5 min delay | network |
| `validator_balance_updated_seqno` | Last blockchain seqno for validator balance update | Should increase | network, validator |
| `validator_messages_updated_seqno` | Last blockchain seqno for validator messages update | Should increase | network, validator |
| `validator_efficiency_updated_seqno` | Last blockchain seqno for validator efficiency update | Should increase | network, validator |
| `pool_update_seqno` | Last blockchain seqno for pool status update | Should increase | network, validator, pool |
| `pool_balance_updated_seqno` | Last blockchain seqno for pool balance update | Should increase | network, validator, pool |
| `pool_elector_balance_updated_seqno` | Last blockchain seqno for elector balance update | Should increase | network, validator, pool |
| `elections_data_updated_seqno` | Last blockchain seqno for elections data update | Should increase | network |

> **Note:** Update tracking metrics help monitor data freshness and verify blockchain sync status.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 8.15.1 (installed via corepack)
- Docker (optional, for containerized deployment)

### Installation

1. Enable corepack and prepare pnpm:
   ```bash
   corepack enable
   corepack prepare pnpm@8.15.1 --activate
   ```

2. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```

### Development

```bash
# Build all packages
pnpm build

# Start development mode
pnpm dev

# Run tests
pnpm test

# Check code style
pnpm check-style

# Fix code style
pnpm style
```

### Environment Configuration

Create `.env` file in the root directory with the following parameters:

```bash
# Required parameters

# Network: possible values are "mainnet" or "testnet"
NETWORK="mainnet"

# Validators: comma-separated list of validator wallet addresses in user-friendly format
VALIDATORS="Uf_0oUVsAhKbI_B2ygqFyJgetvDGfWhjkxVJeYT-UsGl-zrb,Uf-UOz9gjgJGFL8SjZt6HCOt0S0EXeHLiIalVxwIPzX-pn11"

# Metrics endpoint port
PORT=8000
```

### Docker Deployment

The project includes multi-stage Docker build for optimized deployment:

```bash
# Build Docker image
docker build -t ton-validators-metrics .

# Run container with environment variables
docker run -p 8000:8000 \
  -e NETWORK="mainnet" \
  -e VALIDATORS="Uf_0oUVsAhKbI_B2ygqFyJgetvDGfWhjkxVJeYT-UsGl-zrb,Uf-UOz9gjgJGFL8SjZt6HCOt0S0EXeHLiIalVxwIPzX-pn11" \
  -e PORT=8000 \
  ton-validators-metrics
```

## License

MIT
