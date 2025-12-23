import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "@/components/user-avatar";

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
	parameters: {
		mockData: {
			user: {
				id: "1",
				firstName: "John",
				lastName: "Doe",
				email: "john@example.com",
			},
		},
	},
};
