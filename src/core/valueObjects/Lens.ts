export type LensGetter<S,A> = (whole: S) => A;
export type LensSetter<S,A> = (whole: S) => (part: A) => S;
export interface Lens<S,A> {
    get: LensGetter<S,A>;
    set: LensSetter<S,A>;
}
export const Lens = <S,A>(getter: LensGetter<S, A>, setter: LensSetter<S,A>) => ({get: getter, set: setter});