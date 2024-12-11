//点的X坐标数组
let pointXArray = [];
//点的Y坐标数组
let pointYArray = [];
//已经连线的数组
let lineArray = [];
//默认矩形透明度
let RECT_ALPHA_DEFAULT_VALUE = 0.01;
//默认直线透明度
let LINE_ALPHA_DEFAULT_VALUE = 0.1;
//以画布划分的小方格的下标为key，不透明度为value的map
let alphaMap=new Map();

/**
 * 随机生成线
 */
function randomDrawLine() {
    // let randomNumber=document.getElementById("randomLineNumber").value;
    pointXArray = pointArray.map(function (item) {
        return item.x;
    });
    pointYArray = pointArray.map(function (item) {
        return item.y;
    });
    //随机画指定数量的线，并且绘制对应的矩形
    let randomLineNumber=document.getElementById("randomLineNumber").value;
    let leftCanvas = document.getElementById("leftCanvas");
    let leftContext = leftCanvas.getContext("2d");
    let centerCanvas = document.getElementById('centerCanvas');
    let centerContext = centerCanvas.getContext('2d');
    for(let i=0;i<randomLineNumber;i++){
        let startIndex=Math.floor(Math.random()*pointArray.length);
        let endIndex=Math.floor(Math.random()*pointArray.length);
        lineArray.push([startIndex,endIndex]);
        drawLine(leftContext,startIndex,endIndex);
        drawRect(centerContext,startIndex,endIndex,);
    }
}

/**
 * 画线
 * @param context   画布
 * @param startIndex    起始点索引
 * @param endIndex  结束点索引
 */
function drawLine(context, startIndex, endIndex) {
    context.beginPath();
    context.moveTo(pointXArray[startIndex], pointYArray[startIndex]); // 起始点坐标
    context.lineTo(pointXArray[endIndex], pointYArray[endIndex]); // 结束点坐标
    context.strokeStyle = 'rgba(0, 0, 0, ' + LINE_ALPHA_DEFAULT_VALUE + ')'; // 线条颜色
    context.stroke(); // 绘制线条
}

/**
 * 画方块
 * @param context   画布
 * @param circleStartIndex    圆上起始点索引
 * @param circleEndIndex  圆上结束点索引
 */
function drawRect(context, circleStartIndex, circleEndIndex) {
    context.beginPath();
    //获取直线经过的方格的下标
    //根据圆上点的下标获取该点所属的方格的下标
    let startIndex=getGrayArrayIndexByPointIndex(circleStartIndex);
    let endIndex=getGrayArrayIndexByPointIndex(circleEndIndex);
    let rectIndexArray = getRectIndex(startIndex, endIndex);
    //根据下标绘制直线经过的方格
    context.strokeStyle = 'rgba(0, 0, 0, ' + RECT_ALPHA_DEFAULT_VALUE + ')'; // 线条颜色
    for (const element of rectIndexArray) {
        let rectX = grayArray[element].startX;
        let rectY = grayArray[element].startY;
        //如果当前这个方块已经被画过，则不透明度加0.1
        if(alphaMap.has(element)){
            let alphaValue=alphaMap.get(element);
            alphaValue+=RECT_ALPHA_DEFAULT_VALUE;
            alphaMap.set(element,alphaValue);
        }else{
            alphaMap.set(element,RECT_ALPHA_DEFAULT_VALUE);
        }
        context.fillStyle='rgba(0,0,0,'+RECT_ALPHA_DEFAULT_VALUE+')';
        context.fillRect(rectX, rectY, rectWidth, rectWidth);
    }
    context.stroke();
}

/**
 * 根据开始点和结束点获取这条直线经过的方块的下标
 * @param startIndex    开始下标
 * @param endIndex  结束下标
 */
function getRectIndex(startIndex, endIndex) {
    let indices = [];

    // 将一维索引转换为二维坐标
    function indexToCoord(index) {
        return { x: index % gridNumber, y: Math.floor(index / gridNumber) };
    }

    // 将二维坐标转换回一维索引
    function coordToIndex(coord) {
        return coord.x + coord.y * gridNumber;
    }

    let startCoord = indexToCoord(startIndex);
    let endCoord = indexToCoord(endIndex);

    let dx = Math.abs(endCoord.x - startCoord.x);
    let dy = Math.abs(endCoord.y - startCoord.y);
    let sx = startCoord.x < endCoord.x ? 1 : -1;
    let sy = startCoord.y < endCoord.y ? 1 : -1;
    let err = dx - dy;

    let x = startCoord.x;
    let y = startCoord.y;

    while (true) {
        indices.push(coordToIndex({ x, y }));

        if (x === endCoord.x && y === endCoord.y) break;

        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
    //去除大于gridNumber*gridNumber的下标
    indices=indices.filter(function (item) {
        return item < gridNumber*gridNumber
    })
    return indices;
}

/**
 * 根据圆上点的下标获取这个点所在的方格的下标
 * @param pointIndex    圆上点的下标
 */
function getGrayArrayIndexByPointIndex(pointIndex){
    let x=pointArray[pointIndex].x;
    let y=pointArray[pointIndex].y;
    let row=Math.floor(y/rectWidth);
    let col=Math.floor(x/rectWidth);
    return row*gridNumber+col;
}

/**
 * 算法
 * @constructor
 */
function algorithm(){
    //每个圆上的点向其他的点连线并进行结果评估
    for(let i=0;i<pointArray.length;i++){

    }


}
function  drawLine(start,end){
    let leftCanvas = document.getElementById("leftCanvas");
    let leftContext = leftCanvas.getContext("2d");
    leftContext.beginPath();
    leftContext.moveTo(pointArray[start].x, pointArray[start].y);
    leftContext.lineTo(pointArray[end].x, pointArray[end].y);
    leftContext.strokeStyle = 'rgba(0, 0, 0, '+LINE_ALPHA_DEFAULT_VALUE+')';
    leftContext.stroke();
}