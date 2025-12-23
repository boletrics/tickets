import type { Meta, StoryObj } from "@storybook/react";
import { RegionSelector } from "@/components/region-selector";

const meta: Meta<typeof RegionSelector> = {
	title: "Blocks/RegionSelector",
	component: RegionSelector,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof RegionSelector>;

export const Default: Story = {};
