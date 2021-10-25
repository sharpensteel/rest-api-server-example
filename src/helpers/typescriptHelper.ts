
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/** copy from typeorm */
export interface ObjectLiteral {
  [key: string]: any;
}

export interface Class<T = ObjectLiteral> {
  name: string;

  new(...args: any[]): T;
}

/** from https://medium.com/@KevinBGreene/typescript-modeling-required-fields-with-mapped-types-f7bf17688786 */
export type RequirePart<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]: T[X]
} & {
  [P in K]-?: T[P]
}

/**
 *
 * enum TestEnum {
 *   SomeKey = 'some-key',
 * }
 *
 * enumStringsGetValues(TestEnum) => ['some-key']
 */
export function enumStringsGetValues<T=Record<string, string>>(myEnum: T): T[keyof T][] {
  return Object.values(myEnum) as unknown as T[keyof T][];
}
