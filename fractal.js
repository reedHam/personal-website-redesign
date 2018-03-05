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
const render = gpu.createKernel(function(minReal, minImaginary, realFactor, imaginaryFactor, power, juliaSet, xMouse, yMouse) {
    let cReal = minReal + this.thread.x * realFactor;
    let cImaginary = minImaginary + this.thread.y * imaginaryFactor;

    

    let zReal = cReal;
    let zImaginary = cImaginary;
    
    if (juliaSet == 1){
        cReal = minReal + xMouse * realFactor;
        cImaginary = minImaginary + yMouse * imaginaryFactor;
    }
    
    let zTemp = 0;
    let inSet = 1;
    var heat = 0;
    let distance = 0;
    let zROld = zReal;
    let zIOld = zImaginary;
    for(var i = 0; i <= maxIte; i++){
        let zReal2 = zReal * zReal;
        let zImaginary2 = zImaginary * zImaginary;
        let tempReal = zReal;
        let tempImaginary = zImaginary;
        //(zReal*zReal + zImaginary*zImaginary) this is the absolute value^2 of the complex number z if this number is > 4 then it trends to infinity
        if ((zReal2 + zImaginary2) > 4){ // f(z) is trending towards infinity and as such it is not part of the Mandelbrot set
            inSet = 0;
            break;
        }
        
        // calculate z^2 + c
        zTemp = computePower((zReal2 + zImaginary2), power/2) * Math.cos(power * Math.atan(zImaginary, zReal)) + cReal;
        zImaginary = computePower((zReal2 + zImaginary2), power/2) * Math.sin(power * Math.atan(zImaginary, zReal)) + cImaginary;
        zReal = zTemp;

        // basic formula
        // zImaginary = 2 * zReal * zImaginary + cImaginary;
        // zReal = zReal2 - zImaginary2 + cReal;
        distance += Math.sqrt(computePower((zROld - zReal), 2) + computePower(zIOld- zImaginary, 2));
        zROld = zReal;
        zIOld = zImaginary;
        heat = i;
    }
    heat = heat / maxIte;
    

    
    var red = 0;
    var green = 0;
    var blue = 0;
    if (inSet != 1){
        red = heat;
        green = heat / 2;
        blue = (1 - heat) / 2;
    } else {
        if (distance < 1){
            red = 0.25;
            green = 0.25;
            blue = 0.25; 
        } else if (distance < 2){
            red = 0.5;
            green = 0.5;
            blue = 0.5; 
        } else if (distance < 3){
            red = 0.75;
            green = 0.75;
            blue = 0.75; 
        } else if (distance < 3.5) {
            red = 0.85;
            green = 0.85;
            blue = 0.85; 
        } else if (distance < 3.75) {
            red = 0.95;
            green = 0.95;
            blue = 0.95; 
        } else {
            red = 1;
            green = 1;
            blue = 1; 
        }
    }
    /*if (inSet != 1){
        var disVal = distance / 4;
        red = disVal / 2;
        green = disVal / 8;
        blue = (1 - disVal) / 2;
    } else {
        if (distance < 1){
            red = 0.25;
            green = 0.25;
            blue = 0.25; 
        } else if (distance < 2){
            red = 0.5;
            green = 0.5;
            blue = 0.5; 
        } else if (distance < 3){
            red = 0.75;
            green = 0.75;
            blue = 0.75; 
        } else if (distance < 3.5) {
            red = 0.85;
            green = 0.85;
            blue = 0.85; 
        } else if (distance < 3.75) {
            red = 0.95;
            green = 0.95;
            blue = 0.95; 
        } else {
            red = 1;
            green = 1;
            blue = 1; 
        }
    }*/
    this.color(red, green, blue);
}, {
    constants:{
        maxIte: maxIterations
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
    input.zoomSpeed = 1 + (document.getElementById("zoomSlider").value / 100);
    input.size = parseFloat(document.getElementById("zoomBox").value);
    input.trackMouse = document.getElementById("mouseTrack").checked ? 1 : 0;
    input.power =  parseFloat(document.getElementById("power").value);
    return input;
}

let oldInput;

function display(){
    input = getInput();
    if (JSON.stringify(oldInput) !== JSON.stringify(input) || input.trackMouse){
        size = input.size / input.zoomSpeed;
        box = bindBox(input.xCord, input.yCord, size);
        realFactor = (box.maxReal - box.minReal) / (resHeight - 1);
        imaginaryFactor = (box.maxImaginary - box.minImaginary) / (resWidth - 1);
        render(box.minReal, box.minImaginary, realFactor, imaginaryFactor, input.power, input.trackMouse, mousePos.x, mousePos.y);
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
