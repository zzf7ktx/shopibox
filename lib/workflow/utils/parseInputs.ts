import { Input } from "../types/input";

export const parseInputs = (inputs: string) => {
  return JSON.parse(inputs) as Input[];
};
