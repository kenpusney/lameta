// Programming without IF

$true = (c, a) => c()

$false = (c, a) => a()

$b = (x) => x && $true || $false

fact = (x) => $b(x <= 0)(() => 1, () => fact(x-1) * x)

$c = (g) => (v, o = null) => $b(v[g])(v[g], () => $b(o)(o, () => null))

fact2 = x => $c(x)({
    0: () => 1
}, () => x * fact2(x-1));