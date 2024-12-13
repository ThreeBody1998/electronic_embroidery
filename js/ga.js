//点的X坐标数组
let pointXArray = [];
//点的Y坐标数组
let pointYArray = [];
//已经连线的Map，以起点和终点的下标为key，透明度为value的map
let lineMap = new Map();
//默认矩形梯度下降值
let RECT_GRAY_GRADIENT_VALUE = 5;
//默认直线透明度
let LINE_ALPHA_DEFAULT_VALUE = 0.1;
//以画布划分的小方格的下标为key，rgb颜色为value的map
let rectColorMap=new Map();
//奖励分数
let rewardScore=6;
//惩罚分数
let penaltyScore=30;
//默认RGB的值
let RGB_DEFAULT_VALUE=245;
//种群
let populations=[];
//适应度map,以种群的下标为key,适应度为value
let fitnessMap=new Map();



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
    context.strokeStyle = 'rgba(0, 0, 0, ' +LINE_ALPHA_DEFAULT_VALUE+ ')'; // 线条颜色
    context.stroke(); // 绘制线条
}

/**
 * 画方块
 * @param context   画布
 * @param circleStartIndex    圆上起始点索引
 * @param circleEndIndex  圆上结束点索引
 */
function drawRect(context, circleStartIndex, circleEndIndex) {
    let rgbValue=RGB_DEFAULT_VALUE;
    context.beginPath();
    //获取直线经过的方格的下标
    //根据圆上点的下标获取该点所属的方格的下标
    let startIndex=getGrayArrayIndexByPointIndex(circleStartIndex);
    let endIndex=getGrayArrayIndexByPointIndex(circleEndIndex);
    let rectIndexArray = getRectIndex(startIndex, endIndex);
    for (const element of rectIndexArray) {
        let rectX = grayArray[element].startX;
        let rectY = grayArray[element].startY;
        //如果当前这个方块已经被画过，则颜色加深
        if(rectColorMap.has(element)){
            rgbValue=rectColorMap.get(element)-RECT_GRAY_GRADIENT_VALUE;
        }
        rectColorMap.set(element,rgbValue);
        context.fillStyle='rgba('+rgbValue+','+rgbValue+','+rgbValue+')';
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
function geneticAlgorithm(){
    //每个圆上的点向其他的点连线并进行结果评估
    let leftCanvas = document.getElementById("leftCanvas");
    let leftContext = leftCanvas.getContext("2d");
    let centerCanvas = document.getElementById('centerCanvas');
    let centerContext = centerCanvas.getContext('2d');
    for(let i=0;i<pointArray.length;i++){
        for(let j=i+1; j<pointArray.length; j++){
            let startIndex=getGrayArrayIndexByPointIndex(i);
            let endIndex=getGrayArrayIndexByPointIndex(j);
            let rectIndexArray = getRectIndex(startIndex, endIndex);
            //判断画线的结果是否大于0
            /*let result=1;
            while (result>0){
                result=assessment(rectIndexArray);
                if(result>0){
                    //画线
                    drawLine(leftContext,i,j);
                    drawRect(centerContext,i,j);
                    //修改透明度
                    updateAlpha(rectIndexArray);
                }else{
                    break;
                }
            }*/
            console.log("本次画线经过了"+rectIndexArray.length+"个方格");
            let result=assessment(rectIndexArray);
            if(result>0){
                drawLine(leftContext,i,j);
                drawRect(centerContext,i,j);
                updateRgb(rectIndexArray);
            }
        }
    }
    let populationNumber=document.getElementById("populationNumber").value;
    let randomLineNumber=document.getElementById("randomLineNumber").value;
    //初始化种群
    initPopulation(populationNumber,randomLineNumber);
    //遗传算法
    let iterationNumber=document.getElementById("iterationNumber").value;
    for(let i=0;i<iterationNumber;i++){
        //选择
        let parents=selection();
        //交叉
        let child=crossover(parents.father,parents.mother);
        //变异
        mutation(child);
    }


}


/**
 * 评估结果
 * @param rectIndexArray
 */
function assessment(rectIndexArray){
    let rgbValue=RGB_DEFAULT_VALUE;
    let result=0;
    let count1=0;
    let count2=0;
    for(const element of rectIndexArray) {
        //获取画出来的值
        let standardRgb = grayArray[element].r;
        if (rectColorMap.has(element)) {
            rgbValue = rectColorMap.get(element)+RECT_GRAY_GRADIENT_VALUE;
        }
        if(rgbValue>standardRgb){
            result+=rewardScore*(rgbValue-standardRgb);
            count1++;
        }else{
            result+=penaltyScore*(rgbValue-standardRgb);
            count2++;
        }
    }
    console.log("正向方格有："+count1+",反向方格有:"+count2+",评估的分数："+result);
    return result;
}

/**
 * 更新透明度
 * @param rectIndexArray    方格的下标数组
 */
function updateRgb(rectIndexArray){
    for(const element of rectIndexArray) {
        if (rectColorMap.has(element)) {
            let rgbValue = rectColorMap.get(element);
            rgbValue -= RECT_GRAY_GRADIENT_VALUE;
            rectColorMap.set(element, rgbValue);
        } else {
            rectColorMap.set(element,RECT_GRAY_GRADIENT_VALUE);
        }
    }
}

/**
 * 随机画线
 */
function randomDrawLine(){
    //每个圆上的点向其他的点连线并进行结果评估
    let leftCanvas = document.getElementById("leftCanvas");
    let leftContext = leftCanvas.getContext("2d");
    let centerCanvas = document.getElementById('centerCanvas');
    let centerContext = centerCanvas.getContext('2d');
    let randomLineNumber=document.getElementById("randomLineNumber").value;
    for(let i=0;i<randomLineNumber;i++){
        let startIndex=Math.floor(Math.random()*pointArray.length);
        let endIndex=Math.floor(Math.random()*pointArray.length);
        drawLine(leftContext,startIndex,endIndex);
        drawRect(centerContext,startIndex,endIndex);
    }
}

/**
 * 初始化种群
 * @param populationNumber  种群大小
 * @param randomLineNumber  每次随机画线的数量
 */
function initPopulation(populationNumber,randomLineNumber){
    //生成对应的初始种群数量
    for(let i=0;i<populationNumber;i++){
        let population=[];
        for(let j=0;j<randomLineNumber;j++){
            let startIndex=Math.floor(Math.random()*pointArray.length);
            let endIndex=Math.floor(Math.random()*pointArray.length);
            population.push({startIndex:startIndex,endIndex:endIndex});
        }
        let result=assessment(population);
        fitnessMap.set(i,result);
        populations.push(population);
    }
    console.log("初始化种群完成");
}