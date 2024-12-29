export const cartesian = (...args: any) => {
  let r: any[] = [];
  let max = args.length - 1;

  if (args.length === 0) {
    return r;
  }

  const helper = (arr: any[], i: number) => {
    for (var j = 0, l = args[i].length; j < l; j++) {
      var a = arr.slice(0);
      a.push(args[i][j]);
      if (i == max) r.push(a);
      else helper(a, i + 1);
    }
  };

  helper([], 0);
  return r;
};
