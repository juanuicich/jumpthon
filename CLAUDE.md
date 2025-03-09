# Development Guidelines for Jumpthon

## Build & Development Commands
- `pnpm dev` - Run development server with Next.js and Trigger.dev
- `pnpm build` - Build the Next.js app
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run both lint and typecheck
- `pnpm format:check` - Check code formatting with Prettier
- `pnpm format:write` - Fix formatting issues with Prettier

## Code Style
- **Imports**: Use path aliases (`~/components`, `~/lib`, etc.)
- **Formatting**: Prettier with tailwindcss plugin
- **Types**: Use TypeScript with strict mode
- **React**: Use function components and hooks
- **State Management**: Zustand for global state
- **Naming**: camelCase for variables and functions, PascalCase for components
- **Error Handling**: Use try/catch with explicit error types
- **Styling**: Tailwind CSS with shadcn/ui components

## Browser Compatibility
- Check for browser APIs with `typeof window !== "undefined"` for SSR compatibility