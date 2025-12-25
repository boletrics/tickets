"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import { defaultSwrConfig } from "./client";

interface SwrProviderProps {
	children: ReactNode;
}

/**
 * SWR Provider with default configuration.
 * Wrap your app or specific parts that need SWR functionality.
 */
export function SwrProvider({ children }: SwrProviderProps) {
	return <SWRConfig value={defaultSwrConfig}>{children}</SWRConfig>;
}
