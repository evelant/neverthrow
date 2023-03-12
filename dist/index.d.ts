declare class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
    private _promise;
    constructor(res: Promise<Result<T, E>>);
    static fromSafePromise<T, E>(promise: Promise<T>): ResultAsync<T, E>;
    static fromPromise<T, E>(promise: Promise<T>, errorFn: (e: unknown) => E): ResultAsync<T, E>;
    map<A>(f: (t: T) => A | Promise<A>): ResultAsync<A, E>;
    mapErr<U>(f: (e: E) => U | Promise<U>): ResultAsync<T, U>;
    andThen<R extends Result<unknown, unknown>>(f: (t: T) => R): ResultAsync<InferOkTypes<R>, InferErrTypes<R> | E>;
    andThen<R extends ResultAsync<unknown, unknown>>(f: (t: T) => R): ResultAsync<InferAsyncOkTypes<R>, InferAsyncErrTypes<R> | E>;
    andThen<U, F>(f: (t: T) => Result<U, F> | ResultAsync<U, F>): ResultAsync<U, E | F>;
    orElse<R extends Result<T, unknown>>(f: (e: E) => R): ResultAsync<T, InferErrTypes<R>>;
    orElse<R extends ResultAsync<T, unknown>>(f: (e: E) => R): ResultAsync<T, InferAsyncErrTypes<R>>;
    orElse<A>(f: (e: E) => Result<T, A> | ResultAsync<T, A>): ResultAsync<T, A>;
    match<A>(ok: (t: T) => A, _err: (e: E) => A): Promise<A>;
    unwrapOr<A>(t: A): Promise<T | A>;
    then<A, B>(successCallback?: (res: Result<T, E>) => A | PromiseLike<A>, failureCallback?: (reason: unknown) => B | PromiseLike<B>): PromiseLike<A | B>;
}
declare const okAsync: <T, E = never>(value: T) => ResultAsync<T, E>;
declare const errAsync: <T = never, E = unknown>(err: E) => ResultAsync<T, E>;
declare const fromPromise: typeof ResultAsync.fromPromise;
declare const fromSafePromise: typeof ResultAsync.fromSafePromise;

declare type ExtractOkTypes<T extends readonly Result<unknown, unknown>[]> = {
    [idx in keyof T]: T[idx] extends Result<infer U, unknown> ? U : never;
};
declare type ExtractOkAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
    [idx in keyof T]: T[idx] extends ResultAsync<infer U, unknown> ? U : never;
};
declare type ExtractErrTypes<T extends readonly Result<unknown, unknown>[]> = {
    [idx in keyof T]: T[idx] extends Result<unknown, infer E> ? E : never;
};
declare type ExtractErrAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
    [idx in keyof T]: T[idx] extends ResultAsync<unknown, infer E> ? E : never;
};
declare type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never;
declare type InferErrTypes<R> = R extends Result<unknown, infer E> ? E : never;
declare type InferAsyncOkTypes<R> = R extends ResultAsync<infer T, unknown> ? T : never;
declare type InferAsyncErrTypes<R> = R extends ResultAsync<unknown, infer E> ? E : never;
declare function combine<T extends readonly Result<unknown, unknown>[]>(resultList: T): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>;
declare function combineAsync<T extends readonly ResultAsync<unknown, unknown>[]>(asyncResultList: T): ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number]>;
declare function combineWithAllErrors<T extends readonly Result<unknown, unknown>[]>(resultList: T): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number][]>;
declare function combineWithAllErrorsAsync<T extends readonly ResultAsync<unknown, unknown>[]>(asyncResultList: T): ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number][]>;

interface ErrorConfig {
    withStackTrace: boolean;
}

declare namespace Result {
    /**
     * Wraps a function with a try catch, creating a new function with the same
     * arguments but returning `Ok` if successful, `Err` if the function throws
     *
     * @param fn function to wrap with ok on success or err on failure
     * @param errorFn when an error is thrown, this will wrap the error result if provided
     */
    function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(fn: Fn, errorFn?: (e: unknown) => E): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E>;
}
declare type Result<T, E> = Ok<T, E> | Err<T, E>;
declare const ok: <T, E = never>(value: T) => Ok<T, E>;
declare const err: <T = never, E = unknown>(err: E) => Err<T, E>;
interface IResult<T, E> {
    /**
     * Used to check if a `Result` is an `OK`
     *
     * @returns `true` if the result is an `OK` variant of Result
     */
    isOk(): this is Ok<T, E>;
    /**
     * Used to check if a `Result` is an `Err`
     *
     * @returns `true` if the result is an `Err` variant of Result
     */
    isErr(): this is Err<T, E>;
    /**
     * Maps a `Result<T, E>` to `Result<U, E>`
     * by applying a function to a contained `Ok` value, leaving an `Err` value
     * untouched.
     *
     * @param f The function to apply an `OK` value
     * @returns the result of applying `f` or an `Err` untouched
     */
    map<A>(f: (t: T) => A): Result<A, E>;
    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
     * contained `Err` value, leaving an `Ok` value untouched.
     *
     * This function can be used to pass through a successful result while
     * handling an error.
     *
     * @param f a function to apply to the error `Err` value
     */
    mapErr<U>(f: (e: E) => U): Result<T, U>;
    /**
     * Similar to `map` Except you must return a new `Result`.
     *
     * This is useful for when you need to do a subsequent computation using the
     * inner `T` value, but that computation might fail.
     * Additionally, `andThen` is really useful as a tool to flatten a
     * `Result<Result<A, E2>, E1>` into a `Result<A, E2>` (see example below).
     *
     * @param f The function to apply to the current value
     */
    andThen<R extends Result<unknown, unknown>>(f: (t: T) => R): Result<InferOkTypes<R>, InferErrTypes<R> | E>;
    andThen<U, F>(f: (t: T) => Result<U, F>): Result<U, E | F>;
    /**
     * Takes an `Err` value and maps it to a `Result<T, SomeNewType>`.
     *
     * This is useful for error recovery.
     *
     *
     * @param f  A function to apply to an `Err` value, leaving `Ok` values
     * untouched.
     */
    orElse<R extends Result<unknown, unknown>>(f: (e: E) => R): Result<T, InferErrTypes<R>>;
    orElse<A>(f: (e: E) => Result<T, A>): Result<T, A>;
    /**
     * Similar to `map` Except you must return a new `Result`.
     *
     * This is useful for when you need to do a subsequent async computation using
     * the inner `T` value, but that computation might fail. Must return a ResultAsync
     *
     * @param f The function that returns a `ResultAsync` to apply to the current
     * value
     */
    asyncAndThen<U, F>(f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F>;
    /**
     * Maps a `Result<T, E>` to `ResultAsync<U, E>`
     * by applying an async function to a contained `Ok` value, leaving an `Err`
     * value untouched.
     *
     * @param f An async function to apply an `OK` value
     */
    asyncMap<U>(f: (t: T) => Promise<U>): ResultAsync<U, E>;
    /**
     * Unwrap the `Ok` value, or return the default if there is an `Err`
     *
     * @param v the default value to return if there is an `Err`
     */
    unwrapOr<A>(v: A): T | A;
    /**
     *
     * Given 2 functions (one for the `Ok` variant and one for the `Err` variant)
     * execute the function that matches the `Result` variant.
     *
     * Match callbacks do not necessitate to return a `Result`, however you can
     * return a `Result` if you want to.
     *
     * `match` is like chaining `map` and `mapErr`, with the distinction that
     * with `match` both functions must have the same return type.
     *
     * @param ok
     * @param err
     */
    match<A>(ok: (t: T) => A, err: (e: E) => A): A;
    /**
     * **This method is unsafe, and should only be used in a test environments**
     *
     * Takes a `Result<T, E>` and returns a `T` when the result is an `Ok`, otherwise it throws a custom object.
     *
     * @param config
     */
    _unsafeUnwrap(config?: ErrorConfig): T;
    /**
     * **This method is unsafe, and should only be used in a test environments**
     *
     * takes a `Result<T, E>` and returns a `E` when the result is an `Err`,
     * otherwise it throws a custom object.
     *
     * @param config
     */
    _unsafeUnwrapErr(config?: ErrorConfig): E;
}
declare class Ok<T, E> implements IResult<T, E> {
    readonly value: T;
    constructor(value: T);
    isOk(): this is Ok<T, E>;
    isErr(): this is Err<T, E>;
    map<A>(f: (t: T) => A): Result<A, E>;
    mapErr<U>(_f: (e: E) => U): Result<T, U>;
    andThen<R extends Result<unknown, unknown>>(f: (t: T) => R): Result<InferOkTypes<R>, InferErrTypes<R> | E>;
    andThen<U, F>(f: (t: T) => Result<U, F>): Result<U, E | F>;
    orElse<R extends Result<unknown, unknown>>(_f: (e: E) => R): Result<T, InferErrTypes<R>>;
    orElse<A>(_f: (e: E) => Result<T, A>): Result<T, A>;
    asyncAndThen<U, F>(f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F>;
    asyncMap<U>(f: (t: T) => Promise<U>): ResultAsync<U, E>;
    unwrapOr<A>(_v: A): T | A;
    match<A>(ok: (t: T) => A, _err: (e: E) => A): A;
    _unsafeUnwrap(_?: ErrorConfig): T;
    _unsafeUnwrapErr(config?: ErrorConfig): E;
}
declare class Err<T, E> implements IResult<T, E> {
    readonly error: E;
    constructor(error: E);
    isOk(): this is Ok<T, E>;
    isErr(): this is Err<T, E>;
    map<A>(_f: (t: T) => A): Result<A, E>;
    mapErr<U>(f: (e: E) => U): Result<T, U>;
    andThen<R extends Result<unknown, unknown>>(_f: (t: T) => R): Result<InferOkTypes<R>, InferErrTypes<R> | E>;
    andThen<U, F>(_f: (t: T) => Result<U, F>): Result<U, E | F>;
    orElse<R extends Result<unknown, unknown>>(f: (e: E) => R): Result<T, InferErrTypes<R>>;
    orElse<A>(f: (e: E) => Result<T, A>): Result<T, A>;
    asyncAndThen<U, F>(_f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F>;
    asyncMap<U>(_f: (t: T) => Promise<U>): ResultAsync<U, E>;
    unwrapOr<A>(v: A): T | A;
    match<A>(_ok: (t: T) => A, err: (e: E) => A): A;
    _unsafeUnwrap(config?: ErrorConfig): T;
    _unsafeUnwrapErr(_?: ErrorConfig): E;
}
declare const fromThrowable: typeof Result.fromThrowable;

export { Err, Ok, Result, ResultAsync, combine, combineAsync, combineWithAllErrors, combineWithAllErrorsAsync, err, errAsync, fromPromise, fromSafePromise, fromThrowable, ok, okAsync };
