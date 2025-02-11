/**
 * Type which will replace the type property with the new type
 */
export type ReplaceProperty<T, K extends keyof T, V> = Omit<T, K> & {
  [P in K]: V;
};
