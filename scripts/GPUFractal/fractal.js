const gpu = new GPU(); //   Initialize library

// native pow function was available in gpu.js
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

function reload(){
    Cookies.set("params", getInput());
    location.reload();
}

function reloadToApply(){
    document.getElementById("reloadLbl").style.visibility = "visible";
}


function resetToDefault(){
    document.getElementById("resolution").value = 720;
    document.getElementById("maxIterations").value = 30;

    document.getElementById("xCord").value = 0;
    document.getElementById("yCord").value = 0;

    document.getElementById("sizeText").value = 4;
    document.getElementById("zoomSlider").value = 0;
    
    document.getElementById("mouseTrack").checked = false;
    document.getElementById("power").value = 2;

    document.getElementById("redSliderIn").value = 20;
    document.getElementById("greenSliderIn").value = 20;
    document.getElementById("blueSliderIn").value = 20;

    document.getElementById("redSliderOut").value = 20;
    document.getElementById("greenSliderOut").value = 20;
    document.getElementById("blueSliderOut").value = 20;
    reload();
}


function getInput(){
    return {
        resolution: parseInt(document.getElementById("resolution").value),
        maxIterations: parseInt(document.getElementById("maxIterations").value),

        xCord: parseFloat(document.getElementById("xCord").value),
        yCord: parseFloat(document.getElementById("yCord").value),
        
        size: parseFloat(document.getElementById("sizeText").value),
        zoom: parseFloat(document.getElementById("zoomSlider").value),
        trackMouse: document.getElementById("mouseTrack").checked ? 1 : 0, // conversion of boolean to 1/0 due to gpu.js restrictions 
        power: parseInt(document.getElementById("power").value),

        redIn: parseFloat(document.getElementById("redSliderIn").value),
        blueIn: parseFloat(document.getElementById("blueSliderIn").value),
        greenIn: parseFloat(document.getElementById("greenSliderIn").value),

        redOut: parseFloat(document.getElementById("redSliderOut").value),
        blueOut: parseFloat(document.getElementById("blueSliderOut").value),
        greenOut: parseFloat(document.getElementById("greenSliderOut").value),

        smoothingIn: document.getElementById("smoothingInToggle").checked ? 1 : 0,
        smoothingOut: document.getElementById("smoothingOutToggle").checked ? 1 : 0
    };
}


// this function draws a new image when the input has changed 
let oldInput;
let mouseCordFreeze = false;
function display(){
    input = getInput();
    if (JSON.stringify(oldInput) !== JSON.stringify(input) || input.trackMouse){
        Cookies.set("params", input);
        size = input.zoom != 0 ? input.size / input.zoom : input.size;
        box = bindBox(input.xCord, input.yCord, size);
        realFactor = (box.maxReal - box.minReal) / (resHeight - 1);
        imaginaryFactor = (box.maxImaginary - box.minImaginary) / (resWidth - 1);

        render(box.minReal, box.minImaginary, realFactor, imaginaryFactor, input.power, input.trackMouse, mousePos.x, mousePos.y, 
            input.redIn, input.blueIn, input.greenIn,
            input.redOut, input.blueOut, input.greenOut, 
            input.smoothingIn, input.smoothingOut);

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

var render;
var resWidth = 0;
var resHeight = 0;
var maxIterations = 0;
var mousePos = {x:0, y:0};
var size = 4;

// this function initializes all of the user controlled settings based on a cookie
function load(){
    let paramsCookie = Cookies.getJSON('params');

    if (paramsCookie == undefined){
        resWidth = resHeight = 720;
        maxIterations =  30;
        Cookies.set('params', getInput(), { expires: 365 });
        paramsCookie = Cookies.getJSON('params');
    } else {
        resWidth = resHeight = paramsCookie.resolution;
        maxIterations = paramsCookie.maxIterations;
    }

    document.getElementById("resolution").value = paramsCookie.resolution;
    document.getElementById("maxIterations").value = paramsCookie.maxIterations;

    document.getElementById("xCord").value = paramsCookie.xCord;
    document.getElementById("yCord").value = paramsCookie.yCord;

    document.getElementById("sizeText").value = paramsCookie.size;
    document.getElementById("zoomSlider").value = paramsCookie.zoom;

    document.getElementById("mouseTrack").checked = paramsCookie.trackMouse == 1 ? true : false;
    document.getElementById("power").value = paramsCookie.power;

    document.getElementById("redSliderIn").value = paramsCookie.redIn;
    document.getElementById("greenSliderIn").value = paramsCookie.greenIn;
    document.getElementById("blueSliderIn").value = paramsCookie.blueIn;

    document.getElementById("redSliderOut").value = paramsCookie.redOut;
    document.getElementById("greenSliderOut").value = paramsCookie.greenOut;
    document.getElementById("blueSliderOut").value = paramsCookie.blueOut;

    document.getElementById("smoothingInToggle").checked = paramsCookie.smoothingIn == 1 ? true : false;
    document.getElementById("smoothingOutToggle").checked = paramsCookie.smoothingOut == 1 ? true : false;

    //  create the kernel 
    render = gpu.createKernel(function(minReal, minImaginary, realFactor, imaginaryFactor, power, juliaSet, xMouse, yMouse, 
        redInVal, greenInVal, blueInVal, redOutVal, blueOutVal, greenOutVal, 
        smoothingIn, smoothingOut) {
        let cReal = minReal + this.thread.x * realFactor;
        let cImag = minImaginary + this.thread.y * imaginaryFactor;

        let zReal = cReal;
        let zImag = cImag;
        
        // calculate the julia set if mouse tracking is enabled
        if (juliaSet == 1){
            cReal = minReal + xMouse * realFactor;
            cImag = minImaginary + yMouse * imaginaryFactor;
        }
        
        let zTemp = 0;
        let inSet = 1;
        let distance = 0;
        let zRealOld = zReal;
        let zImagOld = zImag;

        for (let i = 0; i < this.constants.maxIte; i++){
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
        
        // calculate pixel colour
        var red = 0;
        var green = 0;
        var blue = 0;
        var disVal = distance / 4;

        if (inSet == 1){
            if (smoothingIn == 0){
                disVal = Math.ceil(disVal);
            } 
            red = disVal / redInVal;
            blue = disVal / blueInVal;
            green = disVal / greenInVal;
            
        } else {
            if (smoothingOut == 0){
                disVal = Math.ceil(disVal);
            }
            red = disVal /  redOutVal;
            blue = disVal / blueOutVal;
            green = disVal / greenOutVal;
        }

        this.color(red, blue, green);
    }, {constants:{ maxIte: maxIterations }}).setOutput([resWidth, resHeight]).setGraphical(true);

    
    requestAnimationFrame(display);
}
