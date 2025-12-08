# n8n-nodes-seggwat

This is an n8n community node package for [SeggWat](https://seggwat.com) - a feedback collection platform for product teams.

## Features

This package provides a unified **SeggWat** node for managing all SeggWat data within n8n workflows:

### Feedback Resource

Manage feedback in your SeggWat projects:

- **Submit** - Create new feedback entries
- **List** - Get paginated feedback with filters (status, type, search)
- **Get** - Retrieve a single feedback item by ID
- **Update** - Modify feedback message, type, or status
- **Delete** - Soft-delete feedback items

### Rating Resource

Manage page ratings (thumbs up/down) in your SeggWat projects:

- **Submit** - Create new rating entries
- **List** - Get paginated ratings with filters (value, path)
- **Get** - Retrieve a single rating by ID
- **Get Statistics** - Get rating statistics (total, helpful, not helpful, percentage)
- **Delete** - Soft-delete rating items

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-seggwat` in the **npm package name** field
4. Accept the risks and click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-seggwat
```

Then restart n8n.

## Credentials

To use this node, you need to set up SeggWat API credentials:

1. Log into your [SeggWat dashboard](https://seggwat.com)
2. Navigate to **Settings** > **API Keys**
3. Create a new Organization Access Token
4. In n8n, go to **Credentials** > **New Credential** > **SeggWat API**
5. Enter your API Key and API URL (default: `https://seggwat.com`)

## Usage Examples

### Example 1: Auto-Triage Feedback

Automatically categorize incoming feedback based on keywords:

```
Webhook (new feedback) → SeggWat (Get Feedback) → Switch (keywords) → SeggWat (Update Feedback) → Slack
```

### Example 2: Low Rating Alert

Monitor for negative rating spikes:

```
Schedule (hourly) → SeggWat (List Ratings, value=false) → IF (count > 10) → SeggWat (Get Statistics) → Email Alert
```

### Example 3: Weekly Feedback Report

Generate weekly summary reports:

```
Schedule (Monday 9am) → SeggWat (List Feedback, return all) → Code (aggregate) → SeggWat (Get Statistics) → Email Report
```

## Operations Reference

### Feedback Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Submit | `POST /api/v1/projects/{id}/feedback` | Create feedback |
| List | `GET /api/v1/projects/{id}/feedback` | List with pagination |
| Get | `GET /api/v1/projects/{id}/feedback/{id}` | Get single item |
| Update | `PATCH /api/v1/projects/{id}/feedback/{id}` | Update fields |
| Delete | `DELETE /api/v1/projects/{id}/feedback/{id}` | Soft-delete |

### Rating Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Submit | `POST /api/v1/projects/{id}/ratings` | Create rating |
| List | `GET /api/v1/projects/{id}/ratings` | List with pagination |
| Get | `GET /api/v1/projects/{id}/ratings/{id}` | Get single item |
| Get Statistics | `GET /api/v1/projects/{id}/ratings/stats` | Get stats |
| Delete | `DELETE /api/v1/projects/{id}/ratings/{id}` | Soft-delete |

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/seggwat/n8n-nodes-seggwat.git
cd n8n-nodes-seggwat

# Install dependencies
pnpm install

# Build
pnpm build

# Link for local n8n development
pnpm link
```

### Testing Locally

1. Build the package: `pnpm build`
2. Link to n8n: `cd ~/.n8n/nodes && pnpm link n8n-nodes-seggwat`
3. Restart n8n
4. The SeggWat node should appear in the nodes panel

### Publishing

```bash
pnpm version patch  # or minor/major
pnpm publish
```

## Feedback Types

- `Bug` - Bug report
- `Feature` - Feature request
- `Praise` - Positive feedback
- `Question` - User question
- `Improvement` - Improvement suggestion
- `Other` - General feedback

## Feedback Statuses

- `New` - Newly submitted (default)
- `Active` - Being worked on
- `Assigned` - Assigned to team member
- `Hold` - On hold
- `Closed` - Closed without resolution
- `Resolved` - Completed/resolved

## Resources

- [SeggWat Documentation](https://seggwat.com/docs)
- [API Reference](https://seggwat.com/docs/api-reference)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/seggwat/n8n-nodes-seggwat/issues)
- **Questions**: [SeggWat Discord](https://discord.gg/seggwat)
- **Email**: support@seggwat.com