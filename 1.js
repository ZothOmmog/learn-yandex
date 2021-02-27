function get(obj, path, defaultValue) {
    // your code here
    if (obj == null) return defaultValue;
    if (path.length === 0) return obj;

    const pathArr = path.split('.');
    const nextObjKey = pathArr[0];

    const nextObj = obj[nextObjKey];
    const nextPath = pathArr.slice(1).join('.');

    return get(nextObj, nextPath, defaultValue);
}
