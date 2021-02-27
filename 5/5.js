'use strict';

const CANVAS_ID = 'canvas';

const COLOR_LOGO = 'rgb(255, 255, 255)';

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;

const VERTICAL_LINE_HEIGHT = 150;
const VERTICAL_LINE_WIDTH = 16;

const HORIZONTAL_LINE_HEIGHT = 16;
const HORIZONTAL_LINE_WIDTH = 100;

const OFFSET_X = 22;
const OFFSET_Y = 22;

const ANIMATION_STEP = 25;

const currentPointerPosition = { x: 0, y: 0 };

main();

function main() {
    window.onkeydown = (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                move(ctx, moveLogoToLeft);
                break;
            case 'ArrowRight':
                move(ctx, moveLogoToRight);
                break;
            case 'ArrowUp':
                move(ctx, moveLogoToUp);
                break;
            case 'ArrowDown':
                move(ctx, moveLogoToDown);
                break;
            default:
                console.error('unknow key: ', e.key);
                break;
        }
    };

    const ctx = initCanvas();
    printCenterLogo(ctx);
}

function move(ctx, fn) {
    fn(ctx);
    checkRightCopy(ctx);
    checkLeftCopy(ctx);
    checkDownCopy(ctx);
    checkUpCopy(ctx);
}

function moveLogoToLeft(ctx) {
    clear(ctx);
    fillBackground(ctx);
    printLogoWithTransalte(ctx, { x: -ANIMATION_STEP, y: 0 });
}
function moveLogoToRight(ctx) {
    clear(ctx);
    fillBackground(ctx);
    printLogoWithTransalte(ctx, { x: ANIMATION_STEP, y: 0 });
}
function moveLogoToUp(ctx) {
    clear(ctx);
    fillBackground(ctx);
    printLogoWithTransalte(ctx, { x: 0, y: -ANIMATION_STEP });
}
function moveLogoToDown(ctx) {
    clear(ctx);
    fillBackground(ctx);
    printLogoWithTransalte(ctx, { x: 0, y: ANIMATION_STEP });
}

function checkRightCopy(ctx) {
    if (currentPointerPosition.x < 0) {
        printLogoWithTransalte(
            ctx,
            {
                x: CANVAS_WIDTH,
                y: 0
            },
            false
        );
    }
}

function checkLeftCopy(ctx) {
    const width = VERTICAL_LINE_WIDTH * 2 + OFFSET_X * 2 + HORIZONTAL_LINE_WIDTH;
    if (currentPointerPosition.x + width > CANVAS_WIDTH) {
        printLogoWithTransalte(
            ctx,
            {
                x: -CANVAS_WIDTH,
                y: 0
            },
            false
        );
    }
}

function checkDownCopy(ctx) {
    if (currentPointerPosition.y < 0) {
        printLogoWithTransalte(
            ctx,
            {
                x: 0,
                y: CANVAS_HEIGHT
            },
            false
        );
    }
}

function checkUpCopy(ctx) {
    const height = VERTICAL_LINE_HEIGHT + OFFSET_Y + HORIZONTAL_LINE_HEIGHT;
    if (currentPointerPosition.y + height > CANVAS_HEIGHT) {
        printLogoWithTransalte(
            ctx,
            {
                x: 0,
                y: -CANVAS_HEIGHT
            },
            false
        );
    }
}

function clear(ctx) {
    ctx.clearRect(
        -currentPointerPosition.x, 
        -currentPointerPosition.y,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );
    ctx.fillStyle = 'rgb(0, 0, 0)';
}

function initCanvas() {
    const canvas = document.getElementById(CANVAS_ID);
    canvas.height = CANVAS_HEIGHT;
    canvas.width = CANVAS_WIDTH;
    
    const ctx = canvas.getContext('2d');
    fillBackground(ctx);

    return ctx;
}

function fillBackground(ctx) {
    ctx.fillRect(
        -currentPointerPosition.x,
        -currentPointerPosition.y,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );
}

function printCenterLogo(ctx) {
    printLogoWithTransalte(
        ctx,
        getLogoOffsetForCenter()
    );
}

function printLogoWithTransalte(ctx, offset, withChangeCurrentPosition = true) {
    if (!withChangeCurrentPosition) {
        ctx.save();
        ctx.translate(offset.x, offset.y);
        printLogo(ctx);
        ctx.restore();
        return;
    }

    translate(ctx, offset.x, offset.y);
    printLogo(ctx);
}

function printLogo(ctx) {
    ctx.beginPath();
    ctx.fillStyle = COLOR_LOGO;

    printVerticalLine(ctx, 'left');
    printVerticalLine(ctx, 'right');
    printHorizontalLine(ctx);
    
    ctx.fill();
}

function getLogoOffsetForCenter() {
    const x = (CANVAS_WIDTH - VERTICAL_LINE_WIDTH * 2 - OFFSET_X * 2 - HORIZONTAL_LINE_WIDTH) / 2;
    const y = (CANVAS_HEIGHT - HORIZONTAL_LINE_HEIGHT - OFFSET_Y - VERTICAL_LINE_HEIGHT) / 2;
    return { x, y };
}

function printVerticalLine(ctx, type) {
    let lineX = null;
    const lineY = OFFSET_Y + HORIZONTAL_LINE_HEIGHT;
    const lineWidth = VERTICAL_LINE_WIDTH;
    const lineHeight = VERTICAL_LINE_HEIGHT;

    switch(type) {
        case 'left':
            lineX = 0;
            break;
        case 'right':
            lineX = VERTICAL_LINE_WIDTH + OFFSET_X * 2 + HORIZONTAL_LINE_WIDTH;
            break;
        default:
            throw Error(`Неизвестный тип вертикальной линии: ${type}`);
    }

    ctx.rect(
        lineX,
        lineY,
        lineWidth,
        lineHeight
    );
}

function printHorizontalLine(ctx) {
    const lineX = OFFSET_X + VERTICAL_LINE_WIDTH;
    const lineY = 0;
    const lineWidth = HORIZONTAL_LINE_WIDTH;
    const lineHeight = HORIZONTAL_LINE_HEIGHT;

    ctx.rect(
        lineX,
        lineY,
        lineWidth,
        lineHeight
    );
}

function translate(ctx, x, y) {
    currentPointerPosition.x = currentPointerPosition.x + x;
    currentPointerPosition.y = currentPointerPosition.y + y;
    ctx.translate(x, y);
}