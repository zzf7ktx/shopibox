import argon from "argon2";

export const compare = async (
  data: string,
  encrypted: string
): Promise<boolean> => {
  return await argon.verify(encrypted, data);
};

export const hash = async (data: string) => {
  return await argon.hash(data);
};

const hasher = { hash, compare };

export default hasher;
