const gpu = new GPU(); //   Initialize library

const resWidth = 900;
const resHeight = resWidth;
var maxIterations = 30;


gpu.addFunction(function computePower(num, exponent) {
    var expCounter = Math.abs(exponent);
    var result = 1;
    for (var i = 0; i < expCounter; i++) {
        result *= num;
    }
    if (exponent < 0) {
        result = 1 / result;
    }
    return result;
});

//  create the kernel 
const render = gpu.createKernel(function(minReal, minImaginary, realFactor, imaginaryFactor, power, juliaSet, xMouse, yMouse, redInVal, greenInVal, blueInVal, redOutVal, blueOutVal, greenOutVal) {
    let cReal = minReal + this.thread.x * realFactor;
    let cImag = minImaginary + this.thread.y * imaginaryFactor;

    let zReal = cReal;
    let zImag = cImag;
    
    if (juliaSet == 1){
        cReal = minReal + xMouse * realFactor;
        cImag = minImaginary + yMouse * imaginaryFactor;
    }
    
    let zTemp = 0;
    let inSet = 1;
    let distance = 0;
    let zRealOld = zReal;
    let zImagOld = zImag;

    for (let i = 0; i < maxIte; i++){
        let zRealSquare = zReal * zReal;
        let zImagSquare = zImag * zImag;

        // check if trending to infinity
        if ((zRealSquare + zImagSquare) > 4){
            inSet = 0;
            break;
        }

        // Pre computation
        let compPow = computePower((zRealSquare + zImagSquare), power/2);
        let compAtan = power * Math.atan(zImag, zReal);

        let zTemp = compPow * Math.cos(compAtan) + cReal;
        zImag = compPow * Math.sin(compAtan) + cImag;
        zReal = zTemp;

        distance += Math.sqrt(computePower((zRealOld - zReal), 2) + computePower((zImagOld - zImag), 2));
        zRealOld = zReal;
        zImagOld = zImag;
    }
    
    var red = 0;
    var green = 0;
    var blue = 0;
    var disVal = distance / 4;

    if (inSet == 1){
        //disVal = Math.floor(disVal);
        red = disVal / redInVal;
        blue = disVal / blueInVal;
        green = disVal / greenInVal;
        
    } else {
        red = disVal /  redOutVal;
        blue = disVal / blueOutVal;
        green = disVal / greenOutVal;
    }

    this.color(red, blue, green);
}, {
    constants:{
        maxIte: 1000
    }
})
  .setOutput([resWidth, resHeight])
  .setGraphical(true);

let mousePos = {x:0, y:0};
let size = 0;

function getInput(){
    var input = {};
    input.xCord =  parseFloat(document.getElementById("xCord").value);
    input.yCord =  parseFloat(document.getElementById("yCord").value);
    input.zoom = 1 + (document.getElementById("zoomSlider").value / 100);
    input.size = parseFloat(document.getElementById("zoomBox").value);
    input.trackMouse = document.getElementById("mouseTrack").checked ? 1 : 0;
    input.power =  parseFloat(document.getElementById("power").value);

    input.redIn = parseFloat(document.getElementById("redSliderIn").value);
    input.blueIn = parseFloat(document.getElementById("greenSliderIn").value);
    input.greenIn = parseFloat(document.getElementById("blueSliderIn").value);

    input.redOut = parseFloat(document.getElementById("redSliderOut").value);
    input.blueOut = parseFloat(document.getElementById("greenSliderOut").value);
    input.greenOut = parseFloat(document.getElementById("blueSliderOut").value);
    return input;
}

let oldInput;

function display(){
    input = getInput();
    if (JSON.stringify(oldInput) !== JSON.stringify(input) || input.trackMouse){
        size = input.size / input.zoom;
        box = bindBox(input.xCord, input.yCord, size);
        realFactor = (box.maxReal - box.minReal) / (resHeight - 1);
        imaginaryFactor = (box.maxImaginary - box.minImaginary) / (resWidth - 1);

        render(box.minReal, box.minImaginary, realFactor, imaginaryFactor, input.power, input.trackMouse, mousePos.x, mousePos.y, 
            input.redIn, input.blueIn, input.greenIn,
            input.redOut, input.blueOut, input.greenOut);


            
        var canvas = render.getCanvas();
        canvas.addEventListener('mousemove', function(evt) {
            mousePos = getMousePos(canvas, evt);
        });

        document.getElementById("fractal").appendChild(canvas);
    }

    oldInput = input;
    requestAnimationFrame(display);
}

function bindBox(x, y, width, height = width){
    return {
        minReal: x - (width/2),
        maxReal: x + (width/2),
        minImaginary: y - (height/2),
        maxImaginary: y + (height/2)
    };
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function load(){
    size = parseFloat(document.getElementById("size").value);
    //maxIterations =  parseFloat(document.getElementById("maxIterations").value);
    requestAnimationFrame(display);
}
