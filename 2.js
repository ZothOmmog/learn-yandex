function flatten(list) {
    if (list.every((item) => !(item instanceof Array))) return list;

    const nextList = list.reduce(
        (acc, item) => (item instanceof Array ? [...acc, ...item] : [...acc, item]),
        []
    );

    return flatten(nextList);
}
