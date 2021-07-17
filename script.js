
var config = {
    heightByWidth : 1.5,
    lineWidth : 0.01,
    ballSize : 0.03,
    ballSpeed : 2.0,
    paddleYPos : 0.85,
    paddleHeightByWidth : 0.3,
    blockNumX : 10,
    blockNumY : 5,
    blockHeightByWidth : 0.5,
    
}

var host = {
    ballIsLanded : 1,
    wallT : [], // y, sx, ex
    wallB : [], // y, sx, ex
    wallL : [], // x, sy, ey
    wallR : [], // x, sy, ey
    blocks : [[]],
    paddleWallAddress : -1,
}

var ball = {
    x : 0,
    y : 0,
    vx: 1,
    vy: -1,
}

var paddle = {
    sx : 0,
    sy : 0,
    ex : 0,
    ey : 0,
    y : 0,
    width : 0,
    
}

function setBall(canvas, x, y){
    if(x >= 0) ball.x = x;
    else ball.x = (paddle.sx+paddle.ex)/2;

    if(y >= 0) ball.y = y;
    else ball.y = canvas.width*config.heightByWidth*config.paddleYPos;
}

function setPaddle(x){
    paddle.sx = x-paddle.width/2;
    paddle.ex = x+paddle.width/2;
    paddle.sy = paddle.y-paddle.width*config.paddleHeightByWidth/2;
    paddle.ey = paddle.y+paddle.width*config.paddleHeightByWidth/2;

    host.wallT[host.paddleWallAddress] = [paddle.ey, paddle.sx, paddle.ex, 1];
    host.wallB[host.paddleWallAddress] = [paddle.sy, paddle.sx, paddle.ex, 1];
    host.wallL[host.paddleWallAddress] = [paddle.ex, paddle.sy, paddle.ey, 1];
    host.wallR[host.paddleWallAddress] = [paddle.sx, paddle.sy, paddle.ey, 1];
}

function processBlock(canvas, process){
    for(var y = 0; y< config.blockNumY; y++){
        for(var x = 0; x< config.blockNumX; x++){
            var ux = canvas.width/config.blockNumX;
            var uy = ux*config.blockHeightByWidth;
            process(x, y, ux, uy)
        }
    }
}

function init(canvas){
    setBall(canvas, canvas.width*0.5, -1);
    paddle.width = canvas.width*0.1;
    paddle.y = ball.y + canvas.width*config.ballSize;
    

    for(var y = 0; y< config.blockNumY; y++){
        host.blocks.push([]);
        for(var x = 0; x< config.blockNumX; x++){
            host.blocks[y].push(1);
        }
    }

    processBlock(canvas, function(x, y, ux, uy){
        host.wallT.push([(y+1)*uy, x*ux, (x+1)*ux, 1]);
        host.wallB.push([y*uy, x*ux, (x+1)*ux, 1]);
        host.wallR.push([x*ux, y*uy, (y+1)*uy, 1]);
        host.wallL.push([(x+1)*ux, y*uy, (y+1)*uy, 1]);
    });

    // stage端
    host.wallT.push([0, 0, canvas.width, 1]);
    host.wallB.push([canvas.width*config.heightByWidth, 0, canvas.width, 1]);
    host.wallR.push([canvas.width, 0, canvas.width*config.heightByWidth, 1]);
    host.wallL.push([0, 0, canvas.width*config.heightByWidth, 1]);

    host.paddleWallAddress = host.wallT.length;


    host.wallT.push([0, 0, 0, 1]);
    host.wallB.push([0, 0, 0, 1]);
    host.wallR.push([0, 0, 0, 1]);
    host.wallL.push([0, 0, 0, 1]);

    setPaddle(ball.x);

}

function landBall(){
    host.ballIsLanded = 1;
    ball.vx = 1;
    ball.vy = -1;
}

function physics(canvas){
    
    if(host.ballIsLanded == 1){
        return;
    }
    nbx = ball.x + ball.vx*config.ballSpeed;
    nby = ball.y + ball.vy*config.ballSpeed;

    var ballwidth = canvas.width*config.ballSize/2;

    var check = function(i){
        if(i >= config.blockNumX*config.blockNumY) return;
        var x = i%config.blockNumX;
        var y = Math.floor(i/config.blockNumX);
        host.blocks[y][x] = 0;
        host.wallT[i][3] = 0;
        host.wallB[i][3] = 0;
        host.wallL[i][3] = 0;
        host.wallR[i][3] = 0;
    }

    for(var i = 0; i<host.wallR.length; i++){
        if(ball.vx >= 0 && host.wallR[i][3] != 0 &&
           ball.x+ballwidth < host.wallR[i][0] &&
           nbx+ballwidth >= host.wallR[i][0] &&
           nby >= host.wallR[i][1] &&
           nby <= host.wallR[i][2]){
            ball.vx = -ball.vx;
            check(i);
        }
    }

    for(var i = 0; i<host.wallL.length; i++){
        if(ball.vx <= 0 && host.wallL[i][3] != 0 &&
           ball.x+ballwidth > host.wallL[i][0] &&
           nbx-ballwidth <= host.wallL[i][0] &&
           nby >= host.wallL[i][1] &&
           nby <= host.wallL[i][2]){
            ball.vx = -ball.vx;
            check(i);
        }
    }

    for(var i = 0; i<host.wallT.length; i++){
        if(ball.vy <= 0 && host.wallT[i][3] != 0 &&
           ball.y+ballwidth > host.wallT[i][0] &&
           nby-ballwidth <= host.wallT[i][0] &&
           nbx >= host.wallT[i][1] &&
           nbx <= host.wallT[i][2]){
            ball.vy = -ball.vy;
            check(i);
        }
    }

    for(var i = 0; i<host.wallB.length; i++){
        if(ball.vy >= 0 && host.wallB[i][3] != 0 &&
           ball.y+ballwidth < host.wallB[i][0] &&
           nby+ballwidth >= host.wallB[i][0] &&
           nbx >= host.wallB[i][1] &&
           nbx <= host.wallB[i][2]){
            ball.vy = -ball.vy;
            check(i);
        }
    }

    if(nby >= paddle.ey+(canvas.width*config.heightByWidth-paddle.ey)/2){
        landBall();
        setBall(canvas, -1, -1);

    } else {
        setBall(canvas, nbx, nby);
    }

    
}

function draw(canvas, ctx){
    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'gray';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, canvas.width*config.ballSize/2, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.strokeRect(0, 0, canvas.width, canvas.width*config.heightByWidth);
    ctx.fillRect(paddle.sx, paddle.sy, paddle.ex-paddle.sx, paddle.ey-paddle.sy);
    processBlock(canvas, function(x, y, ux, uy){
        if(host.blocks[y][x] == 0)return;
        ctx.fillRect(x*ux, y*uy, ux, uy);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x*ux, y*uy, ux, uy);
    });

}

function main(){
    var canvas = document.getElementById("canvas_src");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext("2d");
    ctx.lineWidth = canvas.width*config.lineWidth;

    canvas.addEventListener('mousemove', e => {
        setPaddle(e.x);
        if(host.ballIsLanded == 1){
            setBall(canvas, e.x, -1);
        }
        draw(canvas, ctx);
    });

    canvas.addEventListener('mouseup', e => {
        if(host.ballIsLanded == 1){
            host.ballIsLanded = 0;
        }
    });

    init(canvas);

    physics(canvas);

    setInterval(function(){physics(canvas);draw(canvas,ctx);}, 10);
    
    //setInterval(draw(canvas, ctx), 100);
}

