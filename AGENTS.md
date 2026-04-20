# AGENTS.md - Project Guidelines

This document outlines the coding standards and practices for the `@coinsamba/js-exchanges-connector` project.

## Core Principles

1. **Always use TypeScript** - All new code must be written in TypeScript with strict type checking enabled.
2. **Always use ESM modules** - Use ES modules exclusively (`import`/`export`), never CommonJS.
3. **Always use Node.js assertions** - Use `node:assert` for assertions in tests and validation.
4. **Never commit temporary files** - Do not commit files created for testing, debugging, or explanation purposes.
5. **Follow project structure** - Maintain consistency with existing patterns and conventions.

## TypeScript Configuration

- Target: ES2022
- Module: NodeNext
- Module Resolution: NodeNext
- Strict mode enabled
- Declaration files generated

## File Structure

```
src/
├── connectors/     # Exchange connector implementations
├── interfaces/     # TypeScript interfaces
├── utils/         # Shared utilities
└── index.ts       # Main entry point
```

## Coding Standards

### Imports

- Use ES module imports with `.js` extensions for TypeScript files
- Import from `node:` namespace for Node.js built-ins
- Example:
  ```typescript
  import { describe, it } from "node:test";
  import assert from "node:assert";
  import { IExchange } from "../dist/utils/DTOs.js";
  ```

### Exports

- Use named exports for all public APIs
- Export types and interfaces explicitly
- Example:
  ```typescript
  export interface IExchange { ... }
  export class ExchangeConnector { ... }
  ```

### Assertions

- Use `node:assert` for all assertions
- Prefer `assert.strictEqual()` over `assert.equal()`
- Example:

  ```typescript
  import assert from "node:assert";

  it("should return correct value", () => {
    const result = someFunction();
    assert.strictEqual(result, expectedValue);
  });
  ```

### Testing

- Use Node.js built-in test runner (`node:test`)
- Follow existing test patterns in `test/` directory
- Tests should be self-contained and independent
- Example test structure:

  ```typescript
  import { describe, it, beforeEach } from "node:test";
  import assert from "node:assert";

  describe("Component", () => {
    let instance: SomeClass;

    beforeEach(() => {
      instance = new SomeClass();
    });

    it("should work correctly", async () => {
      const result = await instance.method();
      assert.ok(result);
    });
  });
  ```

## Build and Development Commands

```bash
# Build the project
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Run all checks (tests + lint)
yarn checks

# Clean and rebuild
yarn refresh
```

## Git Guidelines

### Do NOT commit:

- `dist/` directory (built artifacts)
- `node_modules/`
- `.eslintcache`
- `*.tsbuildinfo`
- `.env` files
- Any temporary files created during development
- Test files created for debugging purposes

### Do commit:

- Source TypeScript files (`*.ts`)
- Test files in `test/` directory
- Configuration files
- Documentation updates

## Node.js Version

- Minimum: Node.js 22.0.0
- Use features available in ES2022

## Package Management

- Use Yarn 1.x
- Dependencies are managed in `package.json`
- No runtime dependencies, only dev dependencies

## Code Quality

- ESLint with TypeScript support
- Prettier for code formatting
- Strict TypeScript compiler options
- No implicit any types

## Exchange Connector Development

When adding a new exchange connector:

1. Create file in `src/connectors/` with `.ts` extension
2. Implement the `IExchange` interface from `src/interfaces/exchange.ts`
3. Export the connector class as default or named export
4. Add corresponding test file in `test/` directory
5. Update `src/exchanges.ts` to include the new connector
6. Ensure all public methods are properly typed
7. Handle errors using `ConnectorError` utilities

Example connector structure:

```typescript
import { IExchange, ITicker, IOrderbook } from "../interfaces/exchange.js";

export class NewExchange implements IExchange {
  async getTicker(base: string, quote: string): Promise<ITicker> {
    // Implementation
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    // Implementation
  }

  async getAllTickers(): Promise<ITicker[]> {
    // Implementation
  }
}
```

## Error Handling

- Use `ConnectorError` class for exchange-specific errors
- Include meaningful error messages
- Preserve original error information when wrapping

## Performance Considerations

- Implement rate limiting where necessary
- Cache responses when appropriate
- Use efficient data structures
- Avoid unnecessary API calls

## Security

- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all input data
- Sanitize API responses

## Documentation

- Document public APIs with JSDoc comments
- Update README.md for significant changes
- Include usage examples
- Document any breaking changes

## Versioning

- Follow semantic versioning
- Update version in `package.json`
- Create appropriate git tags
- Update CHANGELOG.md for releases

## Continuous Integration

- GitHub Actions workflows in `.github/workflows/`
- Automated testing on push
- Automated releases on version tags
- Code quality checks
