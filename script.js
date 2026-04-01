// ---------------- DASHBOARD ------------------
function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    "Time: " + now.toLocaleTimeString('en-US', { hour12: true });
}
setInterval(updateTime, 1000);

navigator.geolocation.getCurrentPosition(pos => {
  document.getElementById("location").innerText =
    `Location: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
});

// ---------------- COLOR MODE ------------------
document.getElementById("toggleColor").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// ---------------- PAUSE / PLAY ------------------
let isPaused = false;
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").innerText = isPaused ? "Play" : "Pause";
});

// ---------------- GAME ------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const grid = 25; // bigger grid
let snake = [{x: 10, y: 10}];
let dx = 1, dy = 0;
let reward = {x: 15, y: 10};
let score = 0;
const speed = 150;

// ---------------- BACKGROUND ------------------
let mountains = [];
for(let i=0;i<5;i++){
  mountains.push({x:i*200, y:300 + Math.random()*50, width:300, height:150 + Math.random()*50, color:`rgba(40,40,60,0.6)`});
}

let fog = [];
for(let i=0;i<10;i++){
  fog.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height/2, size: 50+Math.random()*50, speed: 0.2 + Math.random()*0.3});
}

function drawBackground(){
  ctx.fillStyle = "#0f0f1f";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // mountains
  mountains.forEach(m=>{
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x + m.width/2, m.y - m.height);
    ctx.lineTo(m.x + m.width, m.y);
    ctx.closePath();
    ctx.fill();
    m.x -= 0.5;
    if(m.x + m.width < 0) m.x = canvas.width;
  });

  // fog
  fog.forEach(f=>{
    ctx.fillStyle = `rgba(255,255,255,0.05)`;
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.size,0,Math.PI*2);
    ctx.fill();
    f.x -= f.speed;
    if(f.x+f.size < 0) f.x = canvas.width+f.size;
  });
}

// ---------------- CONTROLS ------------------
// PC keyboard
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dy === 0) { dx=0; dy=-1; }
  if (e.key === "ArrowDown" && dy === 0) { dx=0; dy=1; }
  if (e.key === "ArrowLeft" && dx === 0) { dx=-1; dy=0; }
  if (e.key === "ArrowRight" && dx === 0) { dx=1; dy=0; }
});

// Mobile swipe
let touchStartX=0, touchStartY=0;
canvas.addEventListener("touchstart", e=>{touchStartX=e.touches[0].clientX; touchStartY=e.touches[0].clientY;},{passive:true});
canvas.addEventListener("touchend", e=>{
  let touchEndX = e.changedTouches[0].clientX;
  let touchEndY = e.changedTouches[0].clientY;
  let dxSwipe = touchEndX - touchStartX;
  let dySwipe = touchEndY - touchStartY;
  if(Math.abs(dxSwipe) > Math.abs(dySwipe)){
    if(dxSwipe>0 && dx!==-1){ dx=1; dy=0;}
    if(dxSwipe<0 && dx!==1){ dx=-1; dy=0;}
  }else{
    if(dySwipe>0 && dy!==-1){ dx=0; dy=1;}
    if(dySwipe<0 && dy!==1){ dx=0; dy=-1;}
  }
},{passive:true});

// ---------------- DRAW SNAKE & REWARD ------------------
function drawReward(){
  ctx.fillStyle = "#ff4500";
  ctx.beginPath();
  ctx.arc(reward.x*grid+grid/2, reward.y*grid+grid/2, grid/1.5, 0, Math.PI*2);
  ctx.fill();
}

function drawSnake(){
  snake.forEach((seg,i)=>{
    if(i===0){ // dragon head
      ctx.fillStyle="#ff0000";
      ctx.fillRect(seg.x*grid, seg.y*grid, grid*1.5, grid*1.5);
      // horns
      ctx.fillStyle="#800000";
      ctx.beginPath();
      ctx.moveTo(seg.x*grid, seg.y*grid);
      ctx.lineTo(seg.x*grid+10, seg.y*grid-15);
      ctx.lineTo(seg.x*grid+20, seg.y*grid);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(seg.x*grid+grid*1.5-20, seg.y*grid);
      ctx.lineTo(seg.x*grid+grid*1.5-10, seg.y*grid-15);
      ctx.lineTo(seg.x*grid+grid*1.5, seg.y*grid);
      ctx.fill();
      // eyes
      ctx.fillStyle="#fff";
      ctx.fillRect(seg.x*grid+6, seg.y*grid+6, 6,6);
      ctx.fillRect(seg.x*grid+grid, seg.y*grid+6, 6,6);
      // MHJ text
      ctx.fillStyle="#000";
      ctx.font="14px monospace";
      ctx.fillText("MHJ", seg.x*grid+4, seg.y*grid+20);
    }else{
      ctx.fillStyle="#00ff00";
      ctx.fillRect(seg.x*grid, seg.y*grid, grid, grid);
    }
  });
}

// ---------------- COLLISIONS ------------------
function checkCollisions(){
  const head = snake[0];
  if(head.x<0 || head.x>=canvas.width/grid || head.y<0 || head.y>=canvas.height/grid) return true;
  for(let i=1;i<snake.length;i++){ if(head.x===snake[i].x && head.y===snake[i].y) return true; }
  if(head.x===reward.x && head.y===reward.y){
    score+=10;
    document.getElementById("score").innerText="Score: "+score;
    snake.push({});
    reward.x=Math.floor(Math.random()*canvas.width/grid);
    reward.y=Math.floor(Math.random()*canvas.height/grid);
  }
  return false;
}

// ---------------- GAME LOOP ------------------
function update(){
  if(!isPaused){
    drawBackground();
    const head={x:snake[0].x+dx, y:snake[0].y+dy};
    snake.unshift(head);
    if(checkCollisions()){ alert("💀 GAME OVER! Score: "+score); location.reload();}
    if(snake.length>1) snake.pop();
    drawReward();
    drawSnake();
  }
  setTimeout(update,speed);
}

update();