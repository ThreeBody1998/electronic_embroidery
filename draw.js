//灰色处理后的图片数据
var imgGridDataArray=new Array;
//正方形图片的每行的像素数量
var imgWidth;
//栅格化的步长
var step;
//栅格化后的每行的格子数量
var sideGridNumber;
//灰度平均矩阵
var grayMatrix;

//画圆
function drawCircle(context,centerX,centerY,radius){
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.stroke();
}
//在圆上画点,并将这些点放到数组中
function drawDotInCircle(context,centerX,centerY,n,dotRadius,array){
    var dotX;
    var dotY;
    //半径为3
    for(var i=0;i<n;i++){
        dotX=centerX+radius*Math.sin(Math.PI/n*(i+1)*2);
        dotY=centerY-radius*Math.cos(Math.PI/n*(i+1)*2);
        context.beginPath();
        context.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
        context.fill();
        var point={
            x:dotX,
            y:dotY
        };
        array.push(point);
    }
}
//画线
function drawLine(context,startIndex,endIndex){
    context.beginPath();
    context.moveTo(array[startIndex].x, array[startIndex].y); // 起始点坐标
    context.lineTo(array[endIndex].x, array[endIndex].y); // 结束点坐标
    context.strokeStyle = 'black'; // 线条颜色
    context.stroke(); // 绘制线条
}

//监听
function listenImgUpload(){
    //监听上传文件事件
    var fileInput = document.getElementById('fileInput');
    var preview = document.getElementById('preview');
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
function greyProcess(){
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = preview.width;
    canvas.height = preview.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(preview, 0, 0, preview.width, preview.height);
    imgWidth=preview.width;
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
        imgGridDataArray.push(gray);
    }
    // 将处理后的图像数据重新放回Canvas
    ctx.putImageData(imageData, 0, 0);
    // 将处理后的Canvas转换为Data URL并显示在页面上
    var grayScaleImg = new Image();
    grayScaleImg.src = canvas.toDataURL();
    grayScaleImg.id="greyImg";
    // 在页面上显示灰度处理后的图片
    var greyProcessDiv=document.getElementById('greyProcessDiv');
    greyProcessDiv.innerHTML = '';
    greyProcessDiv.appendChild(grayScaleImg);
}
/**
 * 栅格处理
 */
function gridProcess(){
    var progressValue=document.getElementById("gridNumber").value;
    document.getElementById("splitNumber").innerText="切割为"+progressValue+" X "+progressValue+"的栅格("+progressValue*progressValue+")";
    //根据滑动条的百分比获取对应的图片长度
    photoSplit2Grid(progressValue);
}
//控制栅格大小
function updateProgress(step){
    step=this.step;

    var greyImg=document.getElementById("greyImg");
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = greyImg.width;
    canvas.height = greyImg.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(greyImg, 0, 0, greyImg.width, greyImg.height);
    imgWidth=greyImg.width;
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
    gridScaleImg.id="gridImg";
    // 在页面上显示灰度处理后的图片
    var gridProcessDiv=document.getElementById('gridProcessDiv');
    gridProcessDiv.innerHTML = '';
    gridProcessDiv.appendChild(gridScaleImg);
}
/**
 * 将每块区域的灰度值计算平均值，放到灰度平均矩阵中
 * @param {划分的格子变长大小} number 
 */
function photoSplit2Grid(number){
    var greyImg=document.getElementById("greyImg");
    // 创建一个Canvas元素
    var canvas = document.createElement('canvas');
    canvas.width = greyImg.width;
    canvas.height = greyImg.height;
    // 在Canvas上绘制图片
    var ctx = canvas.getContext('2d');
    ctx.drawImage(greyImg, 0, 0, greyImg.width, greyImg.height);
    imgWidth=greyImg.width;
    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, greyImg.width, greyImg.height);
    var data = imageData.data;
    console.log(data);
    //将数据根据切割的大小计算每块平均的灰度值
    for(let i=0;i<number;i++){
        for(let j=0;j<number;j++){
            //根据i 和j 的下标获取需要计算的区域
            //x起始位置
            var startX=i*imgWidth/number;
            //x结束为止，结束的区域不能超过最大横坐标
            var endX=i*imgWidth/number+imgWidth/number;
            //y起始为止
            var startY=j*imgWidth/number;
            //y结束为止，结束的区域不能超过最大纵坐标
            var endY=j*imgWidth/number+imgWidth/number;
        }
    }
}


