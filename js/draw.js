//正方形图片的每行的像素数量
var imgWidth;
//预览的图片
let preview;
//栅格化后的图片
var gridImg;
//图片数据
var imageData;

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

/**
 * 灰度处理
 */
function greyProcess() {
    imgWidth = preview.width;
    //获取画布
    let canvas=getCanvas(preview);
    // 获取图像对象
    let ctx = canvas.getContext('2d');
    imageData=ctx.getImageData(0, 0, preview.width, preview.height);
    //获取像素数据
    let imgArrayData = imageData.data;
    // 对像素数据进行灰度处理
    for (let i = 0; i < imgArrayData.length; i += 4) {
        let r = imgArrayData[i];
        let g = imgArrayData[i + 1];
        let b = imgArrayData[i + 2];
        let gray = 0.299 * r + 0.587 * g + 0.114 * b; // 根据灰度处理公式计算灰度值
        imgArrayData[i] = imgArrayData[i + 1] = imgArrayData[i + 2] = gray; // 将RGB值设置为灰度值
    }
    //反显图像
    showPicture('greyProcessDiv','greyImg',canvas);
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
    let grayImg = document.getElementById("greyImg");
    //获取画布
    let canvas=getCanvas(grayImg);
    // 获取图像对象
    let ctx = canvas.getContext('2d');
    imageData=ctx.getImageData(0, 0, grayImg.width, grayImg.height);
    //获取像素数据
    let imgArrayData = imageData.data;
    //方块数量
    for(let i=0;i<number*number;i++){
        //根据方块的序号获取每个方块所有下标的数组
        let indexArray=getArrayIndex(i,imgArrayData,number);
        //计算每个方块的平均像素值
        avgPixelValue(indexArray,imgArrayData);
    }
    //反显图像
    showPicture('gridProcessDiv','gridImg',canvas);
}

/**
 * 根据方块的序号获取每个方块所有下标的数组
 * @param blockIndex    方块的序号
 * @param data      图片数据
 * @param number    方块的数量
 * @returns {*[]}
 */
function getArrayIndex(blockIndex,data,number){
    let indexArray=[];
    let blockWidth=imgWidth/number;
    let blockHeight=imgWidth/number;
    let row=Math.floor(blockIndex/number);
    let col=blockIndex%number;
    for(let i=row*blockHeight;i<(row+1)*blockHeight;i++){
        for(let j=col*blockWidth;j<(col+1)*blockWidth;j++){
            let index=(i*imgWidth+j)*4;
            indexArray.push(index);
        }
    }
    return indexArray;

}

/**
 * 计算每个方块的平均像素值
 * @param indexArray    方块的下标数组
 * @param data        图片数据
 */
function avgPixelValue(indexArray,data){
    let r=0;
    let g=0;
    let b=0;
    for(const element of indexArray) {
        r += data[element];
        g += data[element + 1];
        b += data[element+2];
    }
    let number=indexArray.length;
    r = r/number;
    g = g/number;
    b = b/number;
    for(const element of indexArray) {
        data[element] = r;
        data[element + 1] = g;
        data[element+2]=b;
    }
}

/**
 * 获取图片数据
 * @param img   图片对象
 * @returns {HTMLCanvasElement}   图片数据
 */
function  getCanvas(img){
    // 创建一个Canvas元素
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    // 在Canvas上绘制图片
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return canvas;
}

/**
 * 显示图片
 * @param divName   显示的div的id
 * @param id    图片的id
 * @param canvas    画布
 */
function showPicture(divName,id,canvas){
    // 将处理后的图像数据重新放回Canvas
    let ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    // 将处理后的Canvas转换为Data URL并显示在页面上
    let img = new Image();
    img.src = canvas.toDataURL();
    img.id = id;
    // 在页面上显示灰度处理后的图片
    let greyProcessDiv = document.getElementById(divName);
    greyProcessDiv.innerHTML = '';
    greyProcessDiv.appendChild(img);
}


