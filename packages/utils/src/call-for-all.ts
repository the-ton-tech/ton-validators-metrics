export function callForAll<T, R>(
  fn: (item: T) => Promise<R>,
): (items: T[]) => Promise<R[]> {
  return (items: T[]): Promise<R[]> => Promise.all(items.map(fn));
}
