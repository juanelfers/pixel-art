const storage = () => {
    return Object.keys(localStorage)
        .filter(key => !isNaN(key))
        .toSorted((a, b) => a > b ? -1 : 1)
        .map(key =>
            JSON.parse(localStorage.getItem(key))
        )
}

const emptyCanvas = () => [...Array(size)].map(() => [...Array(16)]);
const canvas = document.getElementById("pixelCanvas");
const context = canvas.getContext("2d");
const pixelSize = 20;

let size = 16;
let pixels = storage()?.[0] || emptyCanvas();
let color = 'black';
let hover = [];
let mousedown = false;

const getPos = event => {
    const x = Math.floor(event.offsetX / pixelSize);
    const y = Math.floor(event.offsetY / pixelSize);
    return { x, y };
}

const updateColor = (event, color) => {
    const { x, y } = getPos(event);
    pixels[x][y] = color;

    if (event.ctrlKey) {
        const x2 = size - 1 - x;
        pixels[x2][y] = color;
    }

    if (event.altKey) {
        const y2 = size - 1 - y;
        pixels[x][y2] = color;
    }
}


const clear = () => {
    context.clearRect(0, 0, 320, 320);
}

const draw = (ctx = context, px = pixels) => {
    clear();

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const newColor = hover.find(([h]) => h === x) && hover.find(([_, h]) => h === y)
                ? color
                : px[x][y];

            if (newColor) {
                ctx.fillStyle = newColor;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

canvas.addEventListener("mousedown", function (event) {
    mousedown = true;
})
canvas.addEventListener("mouseup", function (event) {
    mousedown = false;
})

canvas.addEventListener("click", function (event) {
    updateColor(event, color);
    draw();
});

canvas.addEventListener("mouseout", function (event) {
    hover = [];
    draw();
});

canvas.addEventListener("mousemove", function (event) {
    if (!mousedown) {
        const x = Math.floor(event.offsetX / pixelSize);
        const y = Math.floor(event.offsetY / pixelSize);
        hover = [[x, y]];

        if (event.ctrlKey) {
            const x2 = size - 1 - x;
            hover.push([x2, y]);
        }

        if (event.altKey) {
            const y2 = size - 1 - y;
            hover.push([x, y2]);
        }
    } else {
        updateColor(event, color);
    }

    draw();
});

canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    updateColor(event);
});

document.querySelector('input').addEventListener('change', (event) => {
    color = event.target.value;
});

document.querySelector('#clear').addEventListener('click', (event) => {
    pixels = emptyCanvas();
    clear();
});

document.querySelector('#save').addEventListener('click', (event) => {
    localStorage.setItem(new Date().valueOf(), JSON.stringify(pixels))
    window.location.reload();
});

storage().forEach(c => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = '320';
    canvas.height = '320';
    document.querySelector('#saved').appendChild(canvas);
    draw(context, c);
})

draw();