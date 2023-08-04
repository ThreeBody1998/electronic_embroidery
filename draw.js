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