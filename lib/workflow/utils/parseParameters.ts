import { Parameter } from "../types/parameter";

export const parseParameters = (parameters: string) => {
  return JSON.parse(parameters) as Parameter[];
};
