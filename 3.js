function mobileRemote(text) {
    const buttons = [
        ['1', '2abc', '3def'],
        ['4ghi', '5jkl', '6mno'],
        ['7pqrs', '8tuv', '9wxyz'],
        ['*', '0', '#'],
    ];

    let currentPosition = { horizontal: 0, vertical: 0 };
    let countPress = 0;

    const normalizedText = normalizeText(text);
    const normalizedTextArr = normalizedText.split('');

    normalizedTextArr.forEach((char) => {
        const nextPosition = getNextPosition(char);
        const horizontalWay = { from: currentPosition.horizontal, to: nextPosition.horizontal };
        const verticalWay = { from: currentPosition.vertical, to: nextPosition.vertical };

        const countPressSelectChar = getCountPressSelectChar(char, nextPosition);
        const countPressHorizontal = getCountPressHorizontal(horizontalWay);
        const countPressVertical = getCountPressVertical(verticalWay);

        countPress += countPressSelectChar + countPressHorizontal + countPressVertical;

        currentPosition = nextPosition;
    });

    return countPress;

    function normalizeText(text) {
        const preNormText = text.replace(/[A-Z]+/g, '*$&*').toLowerCase();
        const result = preNormText.slice(-1) === '*' ? preNormText.slice(0, -1) : preNormText;
        console.log(result);
        return result;
    }

    function getNextPosition(char) {
        for (let i = 0; i < buttons.length; i++) {
            for (let j = 0; j < buttons[i].length; j++) {
                //Здесь горизонталь, чтобы не искать заного потом символ при рассчете нажатий для выбора
                if (buttons[i][j].includes(char)) return { vertical: i, horizontal: j };
            }
        }
    }

    function getCountPressSelectChar(char, position) {
        const str = buttons[position.vertical][position.horizontal];

        const countPressSelect = str.indexOf(char);
        const countPressConfirm = 2; //Выбираем кнопку, подтверждаем выбор символа

        return countPressSelect + countPressConfirm;
    }

    function getCountPressHorizontal(way) {
        const diff = Math.abs(way.to - way.from);
        return diff === 2 ? 1 : diff;
    }

    function getCountPressVertical(way) {
        const diff = Math.abs(way.to - way.from);
        return diff === 3 ? 1 : diff;
    }
}
