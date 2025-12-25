import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { UserAvatar } from "@/components/user-avatar";
import {
	sessionStore,
	setSession,
	clearSession,
} from "@/lib/auth/sessionStore";

const meta: Meta<typeof UserAvatar> = {
	title: "Blocks/UserAvatar",
	component: UserAvatar,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {};

export const LoggedIn: Story = {
	decorators: [
		(Story) => {
			useEffect(() => {
				// Set the session with mock user data
				setSession({
					user: {
						id: "1",
						name: "John Doe",
						email: "john@example.com",
						image: null,
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					session: {
						id: "session-1",
						expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
						createdAt: new Date(),
						updatedAt: new Date(),
						ipAddress: undefined,
						userAgent: undefined,
						userId: "1",
						token: "mock-token",
					},
				});

				// Cleanup on unmount
				return () => {
					clearSession();
				};
			}, []);

			return <Story />;
		},
	],
};
