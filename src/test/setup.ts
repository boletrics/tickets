import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock window.location
Object.defineProperty(window, "location", {
	value: {
		href: "http://localhost:3000",
		origin: "http://localhost:3000",
		pathname: "/",
		search: "",
		hash: "",
		assign: vi.fn(),
		replace: vi.fn(),
		reload: vi.fn(),
	},
	writable: true,
});

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(() => null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn(() => null),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(() => null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn(() => null),
};
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// Mock ResizeObserver
class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
	}
	callback: IntersectionObserverCallback;
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
	root = null;
	rootMargin = "";
	thresholds = [];
	takeRecords = () => [];
}
global.IntersectionObserver =
	IntersectionObserverMock as unknown as typeof IntersectionObserver;
