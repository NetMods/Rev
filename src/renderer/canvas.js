const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext("2d");
c.fillStyle = "red";

const colors = [
  "#282828", // dark0
  "#3c3836", // dark1
  "#504945", // dark2
  "#665c54", // dark3
  "#b8bb26", // green
  "#fabd2f", // yellow
  "#fe8019", // orange
  "#fb4934", // red
  "#d3869b", // purple
  "#83a598", // blue
  "#8ec07c", // aqua
  "#ebdbb2", // light1
  "#fbf1c7", // light0
];

let maxRadius = 40;
let mindRadius = 1;

const mouse = {
  x: undefined,
  y: undefined,
};

document.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

function Circle(r) {
  this.x = Math.random() * innerWidth;
  this.y = Math.random() * innerHeight;
  this.dx = Math.random() * 8;
  this.dy = Math.random() * 8;
  this.r = r;
  this.color = colors[Math.floor(Math.random() * colors.length)];

  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    c.stroke();
    c.fillStyle = this.color;
    c.fill();
  };

  this.update = function() {
    if (this.x + this.r >= innerWidth || this.x - this.r <= 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.r >= innerHeight || this.y - this.r <= 0) {
      this.dy = -this.dy;
    }
    this.x += this.dx;
    this.y += this.dy;

    if (
      mouse.x - this.x < 50 &&
      mouse.x - this.x > -50 &&
      mouse.y - this.y < 50 &&
      mouse.y - this.y > -50 &&
      this.r < maxRadius
    ) {
      this.r += 1;
    } else if (this.r > 2) {
      this.r -= 1;
    }

    this.draw();
  };
}

let circleArray = [];

for (let i = 0; i < 1000; i++) {
  const newCircle = new Circle(mindRadius);
  newCircle.draw();
  circleArray.push(newCircle);
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < circleArray.length; i++) {
    let circle = circleArray[i];
    circle.update();
  }
}

animate();




// const canvas = document.querySelector("canvas");
// canvas.height = window.innerHeight;
// canvas.width = window.innerWidth;
// const c = canvas.getContext("2d");
//
// const mouse = {
//   x: undefined,
//   y: undefined,
// };
//
// let startAnnotating = false;
// let cordsArray = [];
//
// const handleMove = (event) => {
//   mouse.x = event.x;
//   mouse.y = event.y;
//
//   if (startAnnotating) {
//     cordsArray.push({
//       x: mouse.x,
//       y: mouse.y,
//     });
//   }
// };
//
// const handleMouseDown = () => {
//   startAnnotating = true;
// };
//
// const handleMouseUp = () => {
//   startAnnotating = false;
//   setTimeout(() => {
//     cordsArray = [];
//   }, 2000)
// };
//
// document.addEventListener("mousemove", handleMove);
// document.addEventListener("mousedown", handleMouseDown);
// document.addEventListener("mouseup", handleMouseUp);
//
// function Circle(x, y, r) {
//   this.x = x;
//   this.y = y;
//   this.r = r;
//
//   this.draw = function() {
//     c.beginPath();
//     c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
//     c.fillStyle = "red";
//     c.fill();
//     // c.stroke();
//   };
// }
//
// function animate() {
//   requestAnimationFrame(animate);
//   c.clearRect(0, 0, innerWidth, innerHeight);
//   for (let i = 0; i < cordsArray.length; i++) {
//     const pos = cordsArray[i];
//     const circle = new Circle(pos.x, pos.y, 8);
//     circle.draw();
//   }
//   if (mouse.x && mouse.y) {
//     const circle = new Circle(mouse.x, mouse.y, 15);
//     circle.draw();
//   }
// }
//
// animate();
