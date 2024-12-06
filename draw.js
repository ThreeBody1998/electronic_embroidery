//灰色处理后的图片数据
var imgGridDataArray = new Array;
//正方形图片的每行的像素数量
var imgWidth;
//栅格化的步长
var step;
//栅格化后的每行的格子数量
var sideGridNumber;
//灰度平均矩阵
var grayMatrix;
//预览的图片
var preview;
//灰度处理的图片
var grayImg;
//栅格化后的图片
var gridImg;
//像素对象
var pixel={
    r:0,
    g:0,
    b:0,
    a:0
}

//画圆
function drawCircle(context, centerX, centerY, radius) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();
}

//在圆上画点,并将这些点放到数组中
function drawDotInCircle(context, centerX, centerY, n, dotRadius, array) {
    var dotX;
    var dotY;
    //半径为3
    for (var i = 0; i < n; i++) {
        dotX = centerX + radius * Math.sin(Math.PI / n * (i + 1) * 2);
        dotY = centerY - radius * Math.cos(Math.PI / n * (i + 1) * 2);
        context.beginPath();
        context.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
        context.fill();
        var point = {
            x: dotX,
            y: dotY
        };
        array.push(point);
    }
}

//画线
function drawLine(context, startIndex, endIndex) {
    context.beginPath();
    context.moveTo(array[startIndex].x, array[startIndex].y); // 起始点坐标
    context.lineTo(array[endIndex].x, array[endIndex].y); // 结束点坐标
    context.strokeStyle = 'black'; // 线条颜色
    context.stroke(); // 绘制线条
}

//监听
function listenImgUpload() {
    //监听上传文件事件
    var fileInput = document.getElementById('fileInput');
    preview = document.getElementById('preview');
    // 监听文件选择框的change事件
    fileInput.addEventListener('change', function () {
        var file = fileInput.files[0]; // 获取用户选择的文件

        // 检查文件类型是否为PNG
        if (file.type.match('image/png')) {
            // 使用FileReader读取文件内容，并将读取到的内容设置为图片预览的src
            var reader = new FileReader();
            reader.onload = function (e) {

                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('请上传PNG文件！');
        }
    });
}

//灰度处理
function greyProcess() {
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = preview.width;
    canvas.height = preview.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(preview, 0, 0, preview.width, preview.height);
    imgWidth = preview.width;
    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, preview.width, preview.height);
    var data = imageData.data;

    // 对图像数据进行灰度处理
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var gray = 0.299 * r + 0.587 * g + 0.114 * b; // 根据灰度处理公式计算灰度值
        data[i] = data[i + 1] = data[i + 2] = gray; // 将RGB值设置为灰度值
    }
    // 将处理后的图像数据重新放回Canvas
    ctx.putImageData(imageData, 0, 0);
    // 将处理后的Canvas转换为Data URL并显示在页面上
    grayImg = new Image();
    grayImg.src = canvas.toDataURL();
    grayImg.id = "greyImg";
    // 在页面上显示灰度处理后的图片
    var greyProcessDiv = document.getElementById('greyProcessDiv');
    greyProcessDiv.innerHTML = '';
    greyProcessDiv.appendChild(grayImg);
}

/**
 * 栅格处理
 */
function gridProcess() {
    //读取格子数量
    var progressValue = document.getElementById("gridNumber").value;
    document.getElementById("splitNumber").innerText = "切割为" + progressValue + " X " + progressValue + "的栅格(" + progressValue * progressValue + ")";
    //根据滑动条的百分比获取对应的图片长度
    photoSplit2Grid(progressValue);
}

//控制栅格大小
function updateProgress(step) {
    step = this.step;

    var greyImg = document.getElementById("greyImg");
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = greyImg.width;
    canvas.height = greyImg.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(greyImg, 0, 0, greyImg.width, greyImg.height);
    imgWidth = greyImg.width;
    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, greyImg.width, greyImg.height);
    var data = imageData.data;
    //数据处理
    for (var y = 0; y < canvas.height; y += step) {
        for (var x = 0; x < canvas.width; x += step) {
            var r = 0,
                g = 0,
                b = 0,
                a = 0;
            for (var offsetY = 0; offsetY < step; offsetY++) {
                for (var offsetX = 0; offsetX < step; offsetX++) {
                    var pixelIndex = ((y + offsetY) * canvas.width + (x + offsetX)) * 4;

                    r += data[pixelIndex];
                    g += data[pixelIndex + 1];
                    b += data[pixelIndex + 2];
                    a += data[pixelIndex + 3];
                }
            }
            var blockSize = step * step;
            r = Math.round(r / blockSize);
            g = Math.round(g / blockSize);
            b = Math.round(b / blockSize);
            a = Math.round(a / blockSize);

            for (var offsetY = 0; offsetY < step; offsetY++) {
                for (var offsetX = 0; offsetX < step; offsetX++) {
                    var pixelIndex = ((y + offsetY) * canvas.width + (x + offsetX)) * 4;

                    data[pixelIndex] = r;
                    data[pixelIndex + 1] = g;
                    data[pixelIndex + 2] = b;
                    data[pixelIndex + 3] = a;
                }
            }
        }
    }
    // 将处理后的图像数据重新放回Canvas
    ctx.putImageData(imageData, 0, 0);
    // 将处理后的Canvas转换为Data URL并显示在页面上
    var gridScaleImg = new Image();
    gridScaleImg.src = canvas.toDataURL();
    gridScaleImg.id = "gridImg";
    // 在页面上显示灰度处理后的图片
    var gridProcessDiv = document.getElementById('gridProcessDiv');
    gridProcessDiv.innerHTML = '';
    gridProcessDiv.appendChild(gridScaleImg);
}

/**
 * 将每块区域的灰度值计算平均值，放到灰度平均矩阵中
 * @param {划分的格子变长大小} number
 */
function photoSplit2Grid(number) {
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = grayImg.width;
    canvas.height = grayImg.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(grayImg, 0, 0, grayImg.width, grayImg.height);
    imgWidth = grayImg.width;
    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, grayImg.width, grayImg.height);
    var data = imageData.data;
    //方块数量
    for(let i=0;i<number*number;i++){
        //根据方块的数量获取每个方块所有下标的数组
        let indexArray=getArrayIndexByBlockIndex(i);
        //计算每个方块的平均像素值
        avgPixelValue(indexArray,data);
    }








    // //将数据根据切割的大小计算每块平均的灰度值
    // var pixelArray = new Array();
    // //将数据放入像素对象数组
    // for(var i=0;i<data.length;i+=4){
    //     pixel.r = data[i];
    //     pixel.g = data[i+1];
    //     pixel.b = data[i+2];
    //     pixel.a = data[i+3];
    //     pixelArray.push(pixel);
    // }
    // let ROW_NUMBER = grayImg.width/number;
    // let COL_NUMBER = grayImg.height/number;
    // //创建以数字为key,像素对象为value的map
    // let pixelMap = new Map();
    // //遍历像素对象数组，计算每块的平均灰度值
    // for(let i=0;i<pixelArray.length;i++){
    //     //计算当前像素对象在第几行，第几列
    //     let row = Math.floor(i/ROW_NUMBER);
    //     let col = i%COL_NUMBER;
    //     //每个像素块ROW_NUMBER*COL_NUMBER个像素，根据当前的像素对象计算出在第几个像素块
    //     let relativeRow = Math.floor(row/number);
    //     let relativeCol = Math.floor(col/number);
    //     let key=relativeRow*number+relativeCol;
    //     if(pixelMap.has(key)){
    //         let value = pixelMap.get(key);
    //         value.push(pixelArray[i]);
    //         pixelMap.set(key,value);
    //     }else{
    //         let value = new Array();
    //         value.push(pixelArray[i]);
    //         pixelMap.set(key,value);
    //     }
    // }
    // //计算平均RGB的值
    // pixelMap.forEach((value,key)=>{
    //     let r = 0;
    //     let g = 0;
    //     let b = 0;
    //     for(const element of value) {
    //         r += element.r;
    //         g += element.g;
    //         b += element.b;
    //     }
    //     let pixel = {
    //         r:Math.round(r/value.length),
    //         g:Math.round(g/value.length),
    //         b:Math.round(b/value.length),
    //     }
    //     //替换原来的像素对象
    //     pixelMap.set(key,pixel);
    // });
    // //将值放回到data中
    // pixelMap.forEach((value,key)=>{
    //     for(let i=0;i<data.length;i++){
    //         //计算当前像素对象在第几行，第几列
    //         let row = Math.floor(i/ROW_NUMBER);
    //         let col = i%COL_NUMBER;
    //         //每个像素块ROW_NUMBER*COL_NUMBER个像素，根据当前的像素对象计算出在第几个像素块
    //         let relativeRow = Math.floor(row/number);
    //         let relativeCol = Math.floor(col/number);
    //         if(relativeRow*number+relativeCol == key){
    //             data[i] = value.r;
    //             data[i+1] = value.g;
    //             data[i+2] = value.b;
    //         }
    //     }
    //
    // });
    // ctx.putImageData(imageData, 0, 0);
    // gridImg = new Image();
    // gridImg.src = canvas.toDataURL();
    // gridImg.id = "gridImg";
    // //将灰度值返显到页面上
    // var gridProcessDiv = document.getElementById('gridProcessDiv');
    // gridProcessDiv.innerHTML = '';
    // gridProcessDiv.appendChild(gridImg);

}

/**
 * 根据方块的数量获取每个方块所有下标的数组
 * @param blockIndex    方块的下标
 */
function getArrayIndexByBlockIndex(blockIndex){

}

/**
 * 计算每个方块的平均像素值
 * @param indexArray    方块的下标数组
 * @param data        图片数据
 */
function avgPixelValue(indexArray,data){
    let r=g=b=a=0;
    for(let i=0;i<indexArray.length;i++){
        let r = data[indexArray[i]];
        let g = data[indexArray[i]+1];
        let b = data[indexArray[i]+2];
        let a = data[indexArray[i]+3];
    }
}


