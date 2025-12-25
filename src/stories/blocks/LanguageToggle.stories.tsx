import type { Meta, StoryObj } from "@storybook/react";
import { LanguageToggle } from "@/components/language-toggle";

const meta: Meta<typeof LanguageToggle> = {
	title: "Blocks/LanguageToggle",
	component: LanguageToggle,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {};
