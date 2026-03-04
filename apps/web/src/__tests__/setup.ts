import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for @dnd-kit in jsdom
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
