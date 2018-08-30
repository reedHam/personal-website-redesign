const gpu = new GPU(); //   Initialize library

// native pow function was not available in gpu.js
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

// this function draws a new image when the input has changed 
let oldInput;
function display(){
    input = getInput();

    if (JSON.stringify(oldInput) !== JSON.stringify(input) || input.trackMouse){
        Cookies.set("params", input);

        size = input.zoom != 0 ? input.size / input.zoom : input.size;
        box = bindBox(input.xCord, input.yCord, size);

        // create complex number factors 
        realFactor = (box.maxReal - box.minReal) / (resHeight - 1);
        imaginaryFactor = (box.maxImaginary - box.minImaginary) / (resWidth - 1);

        render(box.minReal, box.minImaginary, realFactor, imaginaryFactor, input.power, input.trackMouse, mousePos.x, mousePos.y, 
            input.redIn, input.greenIn, input.blueIn,
            input.redOut, input.greenOut, input.blueOut,  
            input.smoothingIn, input.smoothingOut);

        let canvas = render.getCanvas();
        canvas.addEventListener('mousemove', function(evt) {
            mousePos = getMousePos(canvas, evt);
        });

        document.getElementById("fractal").appendChild(canvas);
    }

    oldInput = input;
    requestAnimationFrame(display);
}

var render;
var resWidth = 0;
var resHeight = 0;
var maxIterations = 0;
var mousePos = {x:0, y:0};
var size = 4;
var colorIn; 
var colorOut; 



// this function initializes all of the user controlled settings based on a cookie
function load(){
    let paramsCookie = Cookies.getJSON('params');

    if (paramsCookie == undefined){
        resWidth = resHeight = 720;
        maxIterations =  30;
        colorIn = {red: 0, blue: 0, green: 0};
        colorOut = {red: 0, blue: 0, green: 0};
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

    const inColourSelector = colorjoe.rgb("innerColorSelector", "rgb(" + Math.floor(paramsCookie.redIn * 256) + ", " + Math.floor(paramsCookie.greenOut * 256) + ", " + Math.floor(paramsCookie.blueOut * 256) +")");
    inColourSelector.on("change", color => {
        colorIn.red = color.red();
        colorIn.blue = color.blue();
        colorIn.green = color.green();});
    
    colorIn = {red: paramsCookie.redIn, blue: paramsCookie.blueIn, green: paramsCookie.greenIn};
    

    const outColourSelector = colorjoe.rgb("outerColorSelector", "rgb(" + Math.floor(paramsCookie.redOut * 256) + ", " + Math.floor(paramsCookie.greenOut * 256) + ", " + Math.floor(paramsCookie.blueOut * 256) +")");
    outColourSelector.on("change", color => {
        colorOut.red = color.red();
        colorOut.blue = color.blue();
        colorOut.green = color.green();});

    colorOut = {red: paramsCookie.redOut, blue: paramsCookie.blueOut, green: paramsCookie.greenOut};

    document.getElementById("smoothingInToggle").checked = paramsCookie.smoothingIn == 1 ? true : false;
    document.getElementById("smoothingOutToggle").checked = paramsCookie.smoothingOut == 1 ? true : false;

    //  create the kernel 
    render = gpu.createKernel(function(minReal, minImaginary, realFactor, imaginaryFactor, power, juliaSet, xMouse, yMouse, 
        redInVal, greenInVal, blueInVal, redOutVal, greenOutVal, blueOutVal, 
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
            red = disVal * redInVal;
            green = disVal * greenInVal;
            blue = disVal * blueInVal;
            
        } else {
            if (smoothingOut == 0){
                disVal = Math.ceil(disVal);
            }
            red = disVal * redOutVal;
            green = disVal * greenOutVal;
            blue = disVal * blueOutVal;
        }

        this.color(red, green, blue);
    }, {constants:{ maxIte: maxIterations }}).setOutput([resWidth, resHeight]).setGraphical(true);

    
    requestAnimationFrame(display);
}

// creates the binding box to render relative to the complex plane
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

function reload(){
    Cookies.set("params", getInput());
    location.reload();
}

// displays the reload to apply label
function reloadToApply(){
    document.getElementById("reloadLbl").style.visibility = "visible";
}

function resetToDefault(){
    document.getElementById("resolution").value = 480;
    document.getElementById("maxIterations").value = 30;

    document.getElementById("xCord").value = 0;
    document.getElementById("yCord").value = 0;

    document.getElementById("sizeText").value = 4;
    document.getElementById("zoomSlider").value = 0;
    
    document.getElementById("mouseTrack").checked = false;
    document.getElementById("power").value = 2;

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

        redIn: colorIn.red,
        blueIn: colorIn.blue,
        greenIn: colorIn.green,

        redOut: colorOut.red,
        blueOut: colorOut.blue,
        greenOut: colorOut.green,

        smoothingIn: document.getElementById("smoothingInToggle").checked ? 1 : 0,
        smoothingOut: document.getElementById("smoothingOutToggle").checked ? 1 : 0
    };
}

