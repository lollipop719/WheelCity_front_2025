import { MaleMemojis } from ".";

export default {
  title: "Components/MaleMemojis",
  component: MaleMemojis,

  argTypes: {
    person: {
      options: ["mattew"],
      control: { type: "select" },
    },
    skinTone: {
      options: ["white"],
      control: { type: "select" },
    },
    posture: {
      options: ["one-happy"],
      control: { type: "select" },
    },
  },
};

export const Default = {
  args: {
    person: "mattew",
    skinTone: "white",
    posture: "one-happy",
    className: {},
  },
};
