inc = x => x + 1
double = x => x + x
square = x => x * x

compose = (f, g) => x => f(g(x))

flip = f => (x, y) => f(y, x)

id = x => x

force = f => f()

cons = (x, y) => f => f(x, y)

car = cons => cons((x, y) => x)

cdr = cons => cons((x, y) => y)

nil = () => nil

nilP = x => x == nil

list = (a, ...args) => args.length ? cons(a, list.apply(null, args)) : cons(a, nil)

printList = lst => nilP(lst) || (console.log(car(lst)), printList(cdr(lst)))

tap = f => (...args) => (console.log(args, f.apply(null, args)), f.apply(null, args))

map = (fn, lst) => nilP(lst) ? nil : cons(fn(car(lst)), map(fn, cdr(lst)))

Y = rec => (f => f(f))(f => rec(x => (f(f))(x)))

reduce = Y(r => c => i => l => nilP(l) ? i : c(car(l), r(c)(i)(cdr(l))))
// map = (fn, l) => reduce((h, t) => cons(fn(h), t))(nil)(l)
filter = p => reduce((h, t) => p(h) ? cons(h, t) : t)(nil)

foldr = reduce

// foldl :: (a -> b -> a) -> a -> [b] -> a
foldl = Y(f => c => i => l => nilP(l) ? i : f(c)(c(i, car(l)))(cdr(l)))

reverse = foldl(flip(cons))(nil)

len = reduce((h, t) => t + 1)(0)

zeroP = (x) => x === 0

// zeros = () => cons(0, zeros)
// 0, 0, 0, ...
zeros = Y (z => () => cons(0, z))

// o, o, o, ...
cycle = o => Y(c => () => cons(o, c))

ones = cycle(1)

// take_lazy = n => l => n == 0 ? nil : cons(car(l), take_lazy(n-1)(force(cdr(l))))
take_lazy = Y(t => n => l => zeroP(n) ? nil : cons(car(l), t(n - 1)(force(cdr(l)))))

// n, n + 1, n + 1 + 1, ...
ints = Y(i => n => cons(n, () => i(n + 1)))

range = (off, from = 0) => take_lazy(off)(ints(from))

// n, f(n), f(f(n)), ...
iterate = f => Y(i => n => cons(n, () => i(f(n))))
// ints = iterate(inc)

// g(n), g(f(n)), g(f(f(n))), ...
generate = (g, f) => Y(i => n => cons(g(n), () => i(f(n))))
// iterates = generate(id)
// ints = generate(id, inc)
// map = (fn, l) => take_lazy(len(l))(generate(compose(fn, car), cdr)(l))

squares = (from = 1) => generate(square, inc)(from)

stream = Y(s => l => nilP(l) ? nil : cons(car(l), () => s(cdr(l))))

map_lazy = (f, s) => generate(compose(f, car), compose(force, cdr))(s)


// Section 2

isArray = a => Object.prototype.toString.apply(a).includes("Array")

wrap = a => list.apply(null, a.map(i => isArray(i) ? wrap(i) : i))

match = (o, failover = nil) => a => (a instanceof Function) && o[car(a)] ? o[car(a)](a) : failover(a)

nth = (n, l) => n <= 0 || nilP(l) ? nil : (n == 1 ? car(l) : nth(n-1, cdr(l)))

first = l => nth(1, l)
second = l => nth(2, l)
third = l => nth(3, l)
forth = l => nth(4, l)
fifth = l => nth(5, l)
sixth = l => nth(6, l)
seventh = l => nth(7, l)
eighth = l => nth(8, l)
nineth = l => nth(9, l)
tenth = l => nth(10, l)

// calc(wrap(['add', ['sub', ['mul', 10, 10], 99], 15]))
calc = Y (c => match({
    "add": e => c(second(e)) + c(third(e)),
    "sub": e => c(second(e)) - c(third(e)),
    "mul": e => c(second(e)) * c(third(e)),
    "div": e => c(second(e)) / c(third(e)),
    "pow": e => Math.pow(c(second(e), c(third(e))))
}, id))

concat = (l, r) => nilP(l) ? r : cons(car(l), concat(cdr(l), r))

find = (k, l) => first(filter(i => car(i) == k)(l))
/**
 *
 * let a = 1
 *     b = 2
 *     c = 3
 * in c - b * (let a = a + b + c
 *             in a + (if a > 6 then 10 else a - 2))
 *
 * expr(nil)(wrap([
 *  "let", [["a", 1], ["b", 2], ["c", 3]],
 *  ["add",
 *      ["sub",
 *       "c",
 *       ["mul",
 *          "b",
 *          ["let", [["a",
 *                      ["add",
 *                          "a",
 *                          ["add", "b", "c"]]]],
 *              ["add", "a",
 *                      ["if", ["gt", "a", 6],
 *                          10,
 *                          ["sub", "a", 2]]]]]],
 *   "a"]
 * ]))
 * => -16
 *
 */
expr = Y(x => env => match({
    "let": e => x(concat(map(b => list(car(b), x(env)(second(b))), second(e)), env))(third(e)),
    "add": e => x(env)(second(e)) + x(env)(third(e)),
    "sub": e => x(env)(second(e)) - x(env)(third(e)),
    "mul": e => x(env)(second(e)) * x(env)(third(e)),
    "div": e => x(env)(second(e)) / x(env)(third(e)),
    "pow": e => Math.pow(x(env)(second(e), x(env)(third(e)))),
    "eq": e => x(env)(second(e)) == x(env)(third(e)),
    "gt": e => x(env)(second(e)) > x(env)(third(e)),
    "and": e => x(env)(second(e)) && x(env)(third(e)),
    "not": e => !x(env)(second(e)),
    "if": e => x(env)(second(e)) ? x(env)(third(e)) : x(env)(forth(e))
},e => typeof(e) == "string" ?  second(find(e, env)) : e))