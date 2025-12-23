// Configuration
export { getTicketsSvcUrl } from "./config";

// Types
export * from "./types";

// Client-side utilities
export {
	ApiError,
	apiFetch,
	swrFetcher,
	defaultSwrConfig,
	useApiQuery,
	useApiMutation,
	revalidate,
	optimisticUpdate,
	buildQueryString,
} from "./client";

// Server-side utilities
export {
	ServerApiError,
	serverFetch,
	serverGet,
	serverPost,
	serverPut,
	serverDelete,
	buildQueryString as serverBuildQueryString,
} from "./server";

// SWR Provider
export { SwrProvider } from "./swr-provider";

// Hooks
export * from "./hooks";
