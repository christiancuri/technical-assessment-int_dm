export const clone = <T = any>(obj: T): T => JSON.parse(JSON.stringify(obj));
