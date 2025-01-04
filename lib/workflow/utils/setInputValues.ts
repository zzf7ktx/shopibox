import { Input } from "../types/input";
import { Parameter } from "../types/parameter";

export const setInputValues = (
  parameters: string,
  inputValues: string,
  key: string,
  value: any
) => {
  const currentInputList = JSON.parse(inputValues ?? "[]") as Input[];
  const parameterList = JSON.parse(parameters ?? "[]") as Parameter[];

  const inputList: Input[] = [];

  for (let i = 0; i < parameterList.length; i++) {
    const currentValue = currentInputList?.[i] ?? "";
    inputList.push({
      key: parameterList[i].name,
      value: parameterList[i].name === key ? value : currentValue,
    });
  }

  return JSON.stringify(inputList);
};
