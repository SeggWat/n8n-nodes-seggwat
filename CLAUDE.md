# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for SeggWat, a feedback collection platform. It provides a single unified custom n8n node:
- **SeggWat**: Manage feedback and ratings with all operations under one node
  - **Feedback Resource**: Submit, list, get, update, delete feedback
  - **Rating Resource**: Submit, list, get, statistics, delete ratings

## Build & Development Commands

### Essential Commands
```bash
# Build the package (TypeScript compilation + icon copy)
pnpm build

# Watch mode for development
pnpm dev

# Format code
pnpm format

# Lint and auto-fix
pnpm lint

# Lint without fixing
pnpm lintcheck
```

### Local Testing with n8n
```bash
# Build and link locally
pnpm build
pnpm link

# In n8n directory
cd ~/.n8n/nodes
pnpm link n8n-nodes-seggwat

# Restart n8n to see changes
```

### Publishing
```bash
pnpm version patch  # or minor/major
pnpm publish
```

## Architecture

### Directory Structure

```
credentials/
  SeggwatApi.credentials.ts    # API credential configuration (apiKey, apiUrl)

nodes/
  Seggwat/
    Seggwat.node.ts            # Unified node with Feedback & Rating resources
    seggwat.svg                # Node icon

shared/
  api.ts                       # Shared API utilities and constants

scripts/
  copy-icons.js                # Build script to copy SVG icons to dist
```

### Shared API Module (`shared/api.ts`)

This is the central module that the node depends on. It contains:

**Core Functions:**
- `seggwatApiRequest()` - Makes authenticated HTTP requests to SeggWat API
- `seggwatApiRequestAllItems()` - Handles pagination to fetch all items
- `getProjects()` - Loads project list (ID + name) for dropdowns
- `getCredentials()` - Retrieves and validates API credentials

**Constants:**
- `FEEDBACK_TYPES` - Bug, Feature, Praise, Question, Improvement, Other
- `FEEDBACK_STATUSES` - New, Active, Assigned, Hold, Closed, Resolved
- `FEEDBACK_SOURCES` - Widget, Manual, Mintlify, Stripe

### Node Implementation Pattern

The unified node uses a Resource/Operation pattern:

1. **Resource Selector** - First dropdown to choose Feedback or Rating
2. **Operation Selector** - Context-sensitive operations based on selected resource
3. **Operation Fields** - Fields shown based on both resource and operation using `displayOptions`
4. **Execute Method** - Main execution logic that:
   - Reads resource and operation parameters
   - Switches on resource, then operation
   - Calls shared API functions
   - Returns formatted results

**Key Architectural Notes:**
- All operations use `projectId` (UUID) in the URL path
- Pagination uses `page` and `limit` query params
- API returns data in wrapper objects (e.g., `{feedback: [...], pagination: {...}}`)
- Node handles both single items and arrays in responses

### API Endpoint Pattern

Base URL: `{apiUrl}/api/v1`

**Feedback Endpoints:**
- `POST /projects/{id}/feedback` - Submit feedback to a project
- `GET /projects/{id}/feedback` - List with filters
- `GET /projects/{id}/feedback/{id}` - Get single
- `PATCH /projects/{id}/feedback/{id}` - Update
- `DELETE /projects/{id}/feedback/{id}` - Delete

**Rating Endpoints:**
- `POST /projects/{id}/ratings` - Submit rating to a project
- `GET /projects/{id}/ratings` - List with filters
- `GET /projects/{id}/ratings/{id}` - Get single
- `GET /projects/{id}/ratings/stats` - Statistics
- `DELETE /projects/{id}/ratings/{id}` - Delete

## TypeScript Configuration

- Target: ES2019, Module: CommonJS
- Strict mode enabled with all strict flags
- Output: `dist/` directory
- Includes: `credentials/`, `nodes/`, `shared/`
- Build generates `.js`, `.d.ts`, and source maps

## Build Process

1. `tsc` - TypeScript compilation to `dist/`
2. `node scripts/copy-icons.js` - Copies `.svg` files from `nodes/**/*.svg` to `dist/nodes/`

The package exports from `dist/index.js` and includes only the `dist/` folder in npm package.

**Note:** We use a custom Node.js script instead of gulp to avoid the `util._extend` deprecation warning (DEP0060).

## Package Requirements

- Node.js: >=18.10
- Package Manager: pnpm >=9.1
- Peer Dependency: n8n-workflow (any version)

## Testing Changes

When modifying the node:
1. Run `pnpm build` to compile
2. Changes to node properties require n8n restart
3. Changes to execute logic may work with workflow re-execution
4. Always test with actual SeggWat API credentials

## Common Patterns

### Adding a New Operation

1. Add operation to the appropriate resource's `options` array in node description
2. Add operation-specific fields with `displayOptions.show.resource: ['resource'], operation: ['newOp']`
3. Add operation handler in execute method under the correct resource branch
4. Call `seggwatApiRequest()` with appropriate method/endpoint
5. Format response data correctly (array vs object)

### Adding a New Resource

1. Add resource option to the `resource` property options
2. Create a new Operation selector with `displayOptions.show.resource: ['newResource']`
3. Add all operation-specific fields with proper displayOptions
4. Add resource handler branch in execute method

### Working with Filters

Filters are collected as `IDataObject` and converted to query params. Clean undefined values before passing to API:

```typescript
const filters = this.getNodeParameter('filters', i) as IDataObject;
const query: IDataObject = { ...filters };
// API utility automatically cleans undefined/null/empty values
```

### Error Handling

The node supports `continueOnFail()` mode which catches errors and returns them as data instead of throwing.