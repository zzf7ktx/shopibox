import { Input } from "../types/input";
import { Parameter, ParameterType } from "../types/parameter";

export const getInput = (parameter: Parameter, input: Input) => {
  switch (parameter.type) {
    case ParameterType.Text:
      return input.value as string;
    case ParameterType.Number:
      return input.value as number;
    case ParameterType.Bool:
      return input.value as boolean;
    case ParameterType.Shop:
      return input.value as string;
  }
};

export const getInputs = (parameters: Parameter[], inputs: Input[]) => {
  var inputValues: { [key: string]: any } = {};

  for (let i = 0; i < parameters.length - 1; i++) {
    const key = parameters[i].name;
    const value = getInput(parameters[i], inputs[i]);
    inputValues[key] = value;
  }

  return inputValues;
};
