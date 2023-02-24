import { createSwappableProxy } from '.';

describe('createSwappableProxy', () => {
  it('proxies properties to the target, even when it is switched', () => {
    const original = { value: 1 };
    const next = { value: 2 };
    const proxy = createSwappableProxy(original);

    expect(proxy.value).toBe(1);

    proxy.setTarget(next);
    expect(proxy.value).toBe(2);
  });

  it('allows the target to be switched more than once', () => {
    const original = { value: 0 };
    const one = { value: 1 };
    const two = { value: 2 };
    const proxy = createSwappableProxy(original);

    expect(proxy.value).toBe(0);

    proxy.setTarget(one);
    expect(proxy.value).toBe(1);

    proxy.setTarget(two);
    expect(proxy.value).toBe(2);
  });

  it('proxies methods to the target', () => {
    const underlying = {
      foo() {
        return this.bar();
      },
      bar() {
        return 42;
      },
    };
    const proxy = createSwappableProxy(underlying);

    expect(proxy.foo()).toBe(42);
  });

  it('proxies a method on an instance of a class that references a private field', () => {
    class ExampleClass {
      #qux = false;

      bar() {
        this.#qux = true;
        return this.#baz();
      }

      #baz() {
        return [this.#qux, 42];
      }
    }
    const underlying = new ExampleClass();
    const proxy = createSwappableProxy(underlying);

    expect(proxy.bar()).toStrictEqual([true, 42]);
  });
});
