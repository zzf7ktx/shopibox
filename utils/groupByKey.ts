export const groupByKey = (array: { key: string; value: string }[]) => {
  const result: { name: string; values: string[] }[] = [];
  const map: { [key: string]: any } = {};

  array.forEach((item) => {
    if (!map[item.key]) {
      map[item.key] = {
        name: item.key,
        values: [item.value],
      };
    } else {
      map[item.key].values.push(item.value);
    }
  });

  for (const key in map) {
    result.push(map[key]);
  }

  return result;
};
