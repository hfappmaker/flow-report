import { Prisma } from "@prisma/client";

// プリミティブ型
type Primitive = string | number | boolean | null | undefined;

// プリミティブ型の型ガード関数
export function isPrimitive(value: unknown): value is Primitive {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  );
}

// JavaScriptの標準組み込みオブジェクト
type StandardBuiltInObject = Date | RegExp | Error;

// JavaScriptの標準組み込みオブジェクトの型ガード関数
export function isStandardBuiltInObject(
  value: unknown,
): value is StandardBuiltInObject {
  const standardObjects = [Date, RegExp, Error] as const;
  return standardObjects.some(
    (StandardObject) => value instanceof StandardObject,
  );
}

// Prismaの組み込みオブジェクト
type PrismaBuiltInObject = Prisma.Decimal;

// Prismaの組み込みオブジェクトの型ガード関数
export function isPrismaBuiltInObject(
  value: unknown,
): value is PrismaBuiltInObject {
  const prismaObjects = [Prisma.Decimal] as const;
  return prismaObjects.some((PrismaObject) => value instanceof PrismaObject);
}

// 型変数Tがundefinedか、undefinedを含むUnion型かどうかを判定する
type IsUndefinedUnion<T> = [T] extends [undefined]
  ? true
  : [undefined] extends [T]
    ? true
    : false;

// シリアライズされた型
export type SerializedType<T, UseBranded = true> = T extends null
  ? null
  : T extends Primitive
    ? T
    : T extends StandardBuiltInObject
      ? T
      : T extends PrismaBuiltInObject
        ? UseBranded extends true
          ? string & { readonly __brand: string & T }
          : string
        : T extends (infer U)[]
          ? SerializedType<U, UseBranded>[]
          : T extends object
            ? {
                readonly [K in keyof T as IsUndefinedUnion<
                  SerializedType<T[K], UseBranded>
                > extends true
                  ? never
                  : string & K]: SerializedType<T[K], UseBranded>;
              } & {
                readonly [K in keyof T as IsUndefinedUnion<
                  SerializedType<T[K], UseBranded>
                > extends true
                  ? string & K
                  : never]?: SerializedType<T[K], UseBranded>;
              }
            : never;

// シリアライズ
export function Serialize<T, UseBranded extends boolean = true>(
  value: T,
): SerializedType<T, UseBranded> {
  if (value === null) {
    return null as SerializedType<T, UseBranded>;
  }

  if (isPrimitive(value) || isStandardBuiltInObject(value)) {
    return value as SerializedType<T, UseBranded>;
  }

  if (isPrismaBuiltInObject(value)) {
    return value.toString() as SerializedType<T, UseBranded>;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => Serialize(item)) as SerializedType<
      T,
      UseBranded
    >;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return Object.fromEntries(
      entries.map(([key, val]) => [key, Serialize(val)]),
    ) as SerializedType<T, UseBranded>;
  }

  throw new Error(`Cannot serialize value of type ${typeof value}`);
}

// 組み込みオブジェクトのデシリアライズ
export function DeserializeBuiltInObject<T extends PrismaBuiltInObject>(
  value: string & { readonly __brand: string & T },
  constructor: new (value: string) => T,
): T {
  return new constructor(value);
}
