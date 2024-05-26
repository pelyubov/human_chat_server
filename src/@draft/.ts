// Check<C, T>

type Check<
    C extends T,
    T
> = keyof Omit<C, keyof T> extends never ? C : never

interface A {
  a: string
  b: number
}
let a: Check<A, { a: string, b: number }> = { a: 'a', b: 2 };

