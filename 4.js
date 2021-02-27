(function () {
    class Templator {
        constructor(template) {
            this._template = template;
            this._templateKeys = this._getTemplateKeys();
        }

        compile(ctx) {
            this._ctx = ctx;

            let hydratedTemplate = '<p>Моя разметка живет тут</p>';
            try {
                const keys = this._getKeys();
                const dict = this._getDict(keys);
                hydratedTemplate = this._hydrate(dict);

                return hydratedTemplate;
            } finally {
                this._ctx = null;
            }
        }

        _getTemplateKeys() {
            return this._template.match(/(?<=\{\{).+?(?=\}\})/g).map((key) => key.trim());
        }

        _getKeys() {
            const ctxKeys = this._getCtxKeys();
            const neededKeys = this._getNeededKeys(ctxKeys);

            return neededKeys;
        }

        _getDict(keys) {
            const dict = {};

            keys.forEach((key) => {
                const value = this._getValueForKey(key, this._ctx);

                if (typeof value === 'object') {
                    const paths = Object.keys(value);
                    paths.forEach((path) => {
                        dict[path] = value[path];
                    });
                } else {
                    dict[key] = value;
                }
            });

            return dict;
        }

        _hydrate(dict) {
            let result = this._template;

            const keys = Object.keys(dict);
            keys.forEach((key) => {
                const regEx = new RegExp(`{{\\s*${key}\\s*}}`);
                result = result.replace(regEx, dict[key]);
            });

            return result;
        }

        _getCtxKeys() {
            const preKeys = Object.keys(this._ctx);

            return preKeys.reduce((acc, key) => {
                let valueType = typeof this._ctx[key];
                
                if (valueType === 'number') valueType = 'string';

                switch (valueType) {
                    case 'string':
                        acc.push(key);
                        break;
                    case 'function':
                        acc.push(key);
                        break;
                    case 'object':
                        const objKeys = this._getObjKeys(this._ctx, key, []);
                        acc.push(objKeys);
                        break;
                    default:
                        throw Error(
                            `Unexpected type of ctx value. key=${key}; valueType=${valueType};`
                        );
                }

                return acc;
            }, []);
        }

        _getNeededKeys(ctxKeys) {
            const neededKeys = ctxKeys.reduce(
                (acc, ctxKey) =>
                    ctxKey instanceof Array
                        ? [...acc, ctxKey.filter((objKey) => this._isNeededKey(objKey))]
                        : this._isNeededKey(ctxKey)
                        ? [...acc, ctxKey]
                        : acc,
                []
            );
            return neededKeys;
        }

        _getValueForKey(key, obj) {
            let value;

            if (key instanceof Array) {
                value = {};

                key.forEach((path) => {
                    const pathKeys = path.split('.');
                    value[path] = pathKeys.reduce(
                        (obj, key) => this._getValueForKey(key, obj),
                        obj
                    );
                });
            } else if (typeof obj[key] === 'function') {
                try {
                    //for testing in node.js
                    window[key] = obj[key];
                } catch (_) {}
                value = `window.${key}()`;
            } else if (typeof obj[key] === 'string' || typeof obj[key] === 'number') {
                value = obj[key];
            } else if (typeof obj[key] === 'object') {
                value = obj[key];
            } else {
                throw Error(
                    `Unexpected type of ctx prop. prop=${obj[key]}; type=${typeof obj[key]}`
                );
            }

            return value;
        }

        _getObjKeys(prevObj, prevKey, objKeys) {
            const currentObj = prevObj[prevKey.split('.').slice(-1)[0]];

            //Условие выхода при достижении листа
            const valueType = typeof currentObj;
            if (valueType !== 'object') {
                return [...objKeys, prevKey];
            }

            const currentKeys = Object.keys(currentObj);

            const currentObjKeys = currentKeys
                .map((key) => {
                    const currentKey = prevKey.concat(`.${key}`);
                    return this._getObjKeys(currentObj, currentKey, objKeys);
                })
                .reduce(
                    (acc, key) => (key instanceof Array ? [...acc, ...key] : [...acc, key]),
                    objKeys
                );

            //Условие выхода при окончании прохода в ширину
            return currentObjKeys;
        }

        _isNeededKey(key) {
            return this._templateKeys.some((tmpKey) => key === tmpKey);
        }
    }

    tests(Templator);

    try {
        //for testing in node.js
        window.Templator = Templator;
    } catch (_) {}
})();

function tests(Templator) {
    const templator = new Templator(
        `<ul class="{{ className }}" data-chat-id="{{chat.id}}" onClick="{{handleClick}}">{{ items }}</ul>`
    );

    const ctx = {
        handleClick() {},
        chat: {
            id: 'id',
            one: {
                oneOne: 'oneOne',
                oneTwo: { oneTwoOne: 'oneTwoOne', oneTwoTwo: 'oneTwoTwo' },
            },
        },
        missKey: 'missKey',
        className: 'className',
    };

    //====================_getObjKeys====================
    const objKeys = templator._getObjKeys(ctx, 'chat', []);
    if (
        objKeys.length !== 4 ||
        objKeys[0] !== 'chat.id' ||
        objKeys[1] !== 'chat.one.oneOne' ||
        objKeys[2] !== 'chat.one.oneTwo.oneTwoOne' ||
        objKeys[3] !== 'chat.one.oneTwo.oneTwoTwo'
    ) {
        console.log(`_getObjKeys test filed`);
    } else {
        console.log(`_getObjKeys test success`);
    }
    //===================================================

    //==================_getTemplateKeys=================
    const templateKeys = templator._getTemplateKeys();
    if (
        templateKeys.length !== 4 ||
        templateKeys[0] !== 'className' ||
        templateKeys[1] !== 'chat.id' ||
        templateKeys[2] !== 'handleClick' ||
        templateKeys[3] !== 'items'
    ) {
        console.console.log(`_getTemplateKeys test filed`);
    } else {
        console.log(`_getTemplateKeys test success`);
    }
    //===================================================

    //==================_getNeededKeys===================
    const neededKeys = templator._getNeededKeys([['chat.id', 'chat.miss'], 'missKey', 'items']);
    if (
        neededKeys.length !== 2 ||
        neededKeys[0].length !== 1 ||
        neededKeys[0][0] !== 'chat.id' ||
        neededKeys[1] !== 'items'
    ) {
        console.log(`_getNeededKeys test filed`);
    } else {
        console.log(`_getNeededKeys test success`);
    }
    //===================================================

    //====================_isNeededKey===================
    const isNeedKeyFalse = templator._isNeededKey('chat.miss');
    const isNeedKeyTrue = templator._isNeededKey('handleClick');
    if (isNeedKeyFalse !== false || isNeedKeyTrue !== true) {
        console.log(`_isNeededKey test filed`);
    } else {
        console.log(`_isNeededKey test success`);
    }
    //===================================================

    //====================_getCtxKeys====================
    templator._ctx = ctx;
    ctxKeys = templator._getCtxKeys();
    templator._ctx = null;
    if (
        ctxKeys.length !== 4 ||
        ctxKeys[0] !== 'handleClick' ||
        ctxKeys[1][0] !== 'chat.id' ||
        ctxKeys[1][1] !== 'chat.one.oneOne' ||
        ctxKeys[1][2] !== 'chat.one.oneTwo.oneTwoOne' ||
        ctxKeys[1][3] !== 'chat.one.oneTwo.oneTwoTwo' ||
        ctxKeys[2] !== 'missKey' ||
        ctxKeys[3] !== 'className'
    ) {
        console.log(`_getCtxKeys test filed`);
    } else {
        console.log(`_getCtxKeys test success`);
    }
    //===================================================

    //====================_getKeys=======================
    templator._ctx = ctx;
    const resultKeys = templator._getKeys();
    templator._ctx = null;
    if (
        resultKeys.length !== 3 ||
        resultKeys[0] !== 'handleClick' ||
        resultKeys[1].length !== 1 ||
        resultKeys[1][0] !== 'chat.id' ||
        resultKeys[2] !== 'className'
    ) {
        console.log(`_getKeys test filed`);
    } else {
        console.log(`_getKeys test success`);
    }
    //===================================================

    //====================_getDict=======================
    templator._ctx = ctx;
    const dict = templator._getDict(['handleClick', ['chat.id'], 'className']);
    templator._ctx = null;
    if (
        Object.keys(dict).length !== 3 ||
        dict.handleClick !== 'window.handleClick()' ||
        dict['chat.id'] !== 'id' ||
        dict['className'] !== 'className'
    ) {
        console.log(`_getDict test filed`);
    } else {
        console.log(`_getDict test success`);
    }
    //===================================================

    //================_getValueForKey====================
    const valueFunc = templator._getValueForKey('handleClick', ctx);
    const valueObj = templator._getValueForKey(['chat.id'], ctx);
    const valueString = templator._getValueForKey('className', ctx);
    if (
        valueFunc !== 'window.handleClick()' ||
        valueObj['chat.id'] !== 'id' ||
        valueString !== 'className'
    ) {
        console.log(`_getValueForKey test filed`);
    } else {
        console.log(`_getValueForKey test success`);
    }
    //===================================================

    //====================_hydrate=======================
    templator._ctx = ctx;
    const htmlStr = templator._hydrate({
        handleClick: 'window.handleClick()',
        'chat.id': 'id',
        className: 'className',
    });
    templator._ctx = null;
    if (
        htmlStr !== '<ul class="className" data-chat-id="id" onClick="window.handleClick()">{{ items }}</ul>'
    ) {
        console.log(`_hydrate test filed`);
    } else {
        console.log(`_hydrate test success`);
    }
    //===================================================
};
