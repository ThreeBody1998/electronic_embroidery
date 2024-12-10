//点的X坐标数组
let pointXArray = [];
//点的Y坐标数组
let pointYArray = [];
//已经连线的数组
let lineArray = [];

let alpha = 0.1;

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

    //画一条线
    let leftCanvas = document.getElementById("leftCanvas");
    let leftContext = leftCanvas.getContext("2d");
    let startIndex = Math.floor(Math.random() * pointArray.length);
    let endIndex = Math.floor(Math.random() * pointArray.length);
    drawLine(leftContext, startIndex, endIndex, 0.1);
    //画方块
    let centerCanvas = document.createElement("canvas");
    centerCanvas.width = imgWidth;
    centerCanvas.height = imgWidth;
    centerCanvas.id = "centerCanvas";
    let centerContext = centerCanvas.getContext("2d");
    drawRect(centerContext, startIndex, endIndex, 0.1);
    document.getElementById("centerDiv").appendChild(centerCanvas);
    // let centerCanvas=document.getElementById("centerCanvas");
    // let centerContext=centerCanvas.getContext("2d");
    // //随机生成对应数量的线
    // drawLine(centerContext,1,35,alpha);
    // //画方块
    // let rightCanvas=document.getElementById("rightCanvas");
    // let rightContext=rightCanvas.getContext("2d");
    // drawRect(rightContext,1,35,alpha);
    // alpha+=0.1;
    // for (let i=0;i<randomNumber;i++){
    //     let startIndex=Math.floor(Math.random()*pointArray.length);
    //     let endIndex=Math.floor(Math.random()*pointArray.length);
    //     drawLine(context,startIndex,endIndex,0.1);
    //     lineArray.push([startIndex,endIndex]);
    // }
    //随机连线

}

/**
 * 画线
 * @param context   画布
 * @param startIndex    起始点索引
 * @param endIndex  结束点索引
 * @param alpha  透明度
 */
function drawLine(context, startIndex, endIndex, alpha) {
    context.beginPath();
    context.moveTo(pointXArray[startIndex], pointYArray[startIndex]); // 起始点坐标
    context.lineTo(pointXArray[endIndex], pointYArray[endIndex]); // 结束点坐标
    context.strokeStyle = 'rgba(0, 0, 0, ' + alpha + ')'; // 线条颜色
    context.stroke(); // 绘制线条
}

/**
 * 画方块
 * @param context   画布
 * @param circleStartIndex    圆上起始点索引
 * @param circleEndIndex  圆上结束点索引
 * @param alpha 透明度
 */
function drawRect(context, circleStartIndex, circleEndIndex, alpha) {
    context.beginPath();
    //获取直线经过的方格的下标
    //根据圆上点的下标获取该点所属的方格的下标
    let startIndex=getGrayArrayIndexByPointIndex(circleStartIndex);
    let endIndex=getGrayArrayIndexByPointIndex(circleEndIndex);
    let rectIndexArray = getRectIndex(startIndex, endIndex);
    //根据下标绘制直线经过的方格
    for (const element of rectIndexArray) {
        let rectX = grayArray[element].startX;
        let rectY = grayArray[element].startY;
        context.fillRect(rectX, rectY, rectWidth, rectWidth);
    }
    context.strokeStyle = 'rgba(0, 0, 0, ' + alpha + ')'; // 线条颜色
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