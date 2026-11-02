import { getThemeVersion } from './colors';

/**
 * Wraps a StyleSheet factory so styles are rebuilt whenever the theme changes.
 * Usage: const styles = themedStyles(() => StyleSheet.create({ ... colors.x ... }));
 * The returned object behaves exactly like a StyleSheet (styles.card, ...styles.card, etc.).
 */
export const themedStyles = <T extends object>(factory: () => T): T => {
  let cached: T | null = null;
  let cachedVersion = -1;

  const resolve = (): T => {
    const v = getThemeVersion();
    if (cached === null || cachedVersion !== v) {
      cached = factory();
      cachedVersion = v;
    }
    return cached;
  };

  return new Proxy({} as T, {
    get: (_target, key) => (resolve() as any)[key],
    ownKeys: () => Reflect.ownKeys(resolve()),
    getOwnPropertyDescriptor: (_target, key) => ({ enumerable: true, configurable: true, value: (resolve() as any)[key] }),
    has: (_target, key) => key in resolve(),
  });
};
