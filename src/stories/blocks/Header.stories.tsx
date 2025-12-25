import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@/components/header";

const meta: Meta<typeof Header> = {
	title: "Blocks/Header",
	component: Header,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			appDirectory: true,
			navigation: {
				pathname: "/",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="min-h-[200px]">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Header>;

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
