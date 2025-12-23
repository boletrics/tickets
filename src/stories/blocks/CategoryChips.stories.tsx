import type { Meta, StoryObj } from "@storybook/react";
import { CategoryChips } from "@/components/category-chips";

const meta: Meta<typeof CategoryChips> = {
	title: "Blocks/CategoryChips",
	component: CategoryChips,
	parameters: {
		layout: "padded",
		nextjs: {
			appDirectory: true,
		},
	},
};

export default meta;

type Story = StoryObj<typeof CategoryChips>;

export const Default: Story = {};

export const NarrowContainer: Story = {
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
};

export const WideContainer: Story = {
	decorators: [
		(Story) => (
			<div className="max-w-4xl">
				<Story />
			</div>
		),
	],
};
