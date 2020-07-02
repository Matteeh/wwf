export function removeUndefinedProperties(object: {}) {
  const obj = { ...object };
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return obj;
}
