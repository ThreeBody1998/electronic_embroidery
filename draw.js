var imgGridDataArray=new Array;
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
    grayScaleImg.id="gridImg";
    // 在页面上显示灰度处理后的图片
    var greyProcessDiv=document.getElementById('greyProcessDiv');
    greyProcessDiv.innerHTML = '';
    greyProcessDiv.appendChild(grayScaleImg);
    // 获取灰度值（平均灰度值）
    // var totalGray = 0;
    // for (var j = 0; j < data.length; j += 4) {
    //     totalGray += data[j];
    // }
    

}

//控制栅格大小
function updateProgress(step){
    //计算每个栅格的大小
    //上传图片边长
    var imgSize=preview.width;
    //栅格后每个格子的大小
    var gridSize=imgSize/100*step;
    //计算单边数量并取整
    var sigleGridNumber=Math.floor(imgSize/gridSize);
    //计算栅格后的总格子数量大小，剩余不足步长的按1个计算
    var gridNumber=Math.pow(imgSize%gridSize==0?sigleGridNumber:sigleGridNumber+1,2);
    //计算每个格子的平均灰度并填充至数据里面
    for(var i=0;i<gridNumber;i++){
        //根据下标获取对应方格子的下标存入数组
        var partImgDataArray=getImgDataIndexByNumber(i,step,gridNumber);
        //计算平均灰度值
        var partAverageGray=calculateAverageByArray(partImgDataArray);
        //将灰度值填充至对应的区域
        fillGrayByIndex(partImgDataArray);
    }
    //预览区域反显
    // 将处理后的Canvas转换为Data URL并显示在页面上
    var gridScaleImg = new Image();
    gridScaleImg.src = canvas.toDataURL();
    gridScaleImg.id="gridProgressImg";
    // 在页面上显示灰度处理后的图片
    var gridProcessDiv=document.getElementById('gridProcessDiv');
    gridProcessDiv.innerHTML = '';
    gridProcessDiv.appendChild(gridScaleImg);
    
}

/**
 * 根据方格子的下标获取对应的图片数组的下标
 * @param {*} index 开始下标
 * @param {*} step 步长
 * @param {*} totalNumber   总数 
 * @returns 数组
 */
function getImgDataIndexByNumber(index,step,totalNumber){
    var returnArray=[];
    
    var singleNumber=Math.sqrt(totalNumber);
    //计算选中的范围内的第一个下标是在第几行第几列
    var row=index/singleNumber;
    var col=index-row*singleNumber;
    //计算开始下标 行数*每行最大数量+列数*步长
    var startIndex=row*singleNumber+col*step;
    for(var i=0;i<step*step;i++){
        returnArray.push(startIndex);
        
    }
    return returnArray;   
}
