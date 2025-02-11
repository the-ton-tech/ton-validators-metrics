/**
 * Type which will remove the 'optional' modifier from the type property
 */
export type RequiredProperty<T, K extends keyof T> = T & Required<Pick<T, K>>;
