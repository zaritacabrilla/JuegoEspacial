class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }
  clear() {
    this.listeners = {};
  }
}

class GameObject {
  constructor(x, y) {
    //El constructor se encarga de inicializar las propiedades básicas de un objeto en el juego.
    this.x = x; //Establece la posición x
    this.y = y; //Establece la posición y
    this.dead = false; //Establece si está muerto
    this.type = ""; //Establece el tipo de objeto
    this.width = 0; //Establece el ancho
    this.height = 0; //Establece el alto
    this.img = undefined; //Establece la imagen asociada
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  } //Función que se dedica a dibujar la imagen de las vidas del héroe

  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
}

//Clase para el héroe
class Hero extends GameObject {
  constructor(x, y) {
    //Propiedades específicas del héroe
    super(x, y);
    (this.width = 99), (this.height = 75);
    this.type = "Hero"; //El tipo de objeto es el heroe
    this.speed = { x: 0, y: 0 }; //Velocidad del héroe
    this.cooldown = 0; //Tiempo de los disparos
    this.life = 3; //Número de vidad del héroe
    this.points = 0; //Puntuación inicial del héroe
  }

  //Método que permite al héroe disparar el láser y establece su tiempo
  fire() {
    //Crea una instancia de la clase Laser en la posición adecuada
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    //Establece el tiempo de espera antes de poder disparar nuevamente el láser
    this.cooldown = 400;

    // Establece un temporizador para reducir el tiempo de espera cada 100 milisegundos
    let id = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
        if (this.cooldown === 0) {
          clearInterval(id); //Limpia el temporizador cuando el tiempo de espera alcanza cero
        }
      }
    }, 200);
  }
  //Verifica si el héroe puede volver a disparar
  canFire() {
    return this.cooldown === 0;
  }
  //Disminuye el número de vidas
  decrementLife() {
    if(this.life > 0){
      this.life--;
    }
    if (this.life === 0) {
      this.dead = true; //Marca la muerte del héroe si las vidas son igual a 0
    }
  }
  // Método que aumenta la puntuación del héroe al matar enemigos (incrementa en 100 puntos)
  incrementPoints() {
    this.points += 100;
  }
}

//Clase que extiende GameObject para mover los enemigos hacia abajo en un determinado intervalo de tiempo
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 98), (this.height = 50);
    this.type = "Enemy";
    let id = setInterval(() => {
      // Comprueba si la posición vertical del objeto es menor que la altura del lienzo menos su altura
      if (this.y < canvas.height - this.height) {
        // Incrementa la posición vertical del objeto en 5 unidades si no ha alcanzado la parte inferior del lienzo
        this.y += 5;
      } else {
        // Si la posición vertical del objeto alcanza la parte inferior del lienzo, detiene el intervalo y muestra un mensaje en la consola
        console.log("Stopped at", this.y);
        clearInterval(id);
      }
    }, 300); //El objeto enemigo se mueve hacia abajo cada 5 unidades a intervalos de 300 milisegundos
  }
}

//Clase que extiende GameObject para mover hacia arriba el láser en tiempo determinado y que salga de la pantalla
class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 9), (this.height = 33);
    this.type = "Laser";
    this.img = laserImg; //Asigna la imagen del láser
    let id = setInterval(() => {
      if (this.y > 0) {
        //Si la posición vertical del láser es mayor que 0
        this.y -= 15; //Mueve el láser hacia arriba cada 15 unidades
      } else {
        this.dead = true;
        clearInterval(id); //Si es menor o igual que 0, se detiene el láser, desaparece
      }
    }, 100); //Mueve el láser cada 100 milisegundos
  }
}

//Función para cargar imagenes
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image(); //Crea una nueva instancia de la clase Image de JavaScript, que se utiliza para representar imágenes en el navegador
    img.src = path; //Establece la fuente de la imagen como la ruta proporcionada
    img.onload = () => {
      resolve(img); //Cuando la imagen se carga con éxito, se resuelve la promesa con la imagen como valor
    };
  });
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

//Enumera diferentes mensajes/eventos utilizados en el juego
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};

//Variables
let heroImg, //Imagen del héroe
  enemyImg, //Imagen del enemigo
  laserImg, //Imagen del láser
  lifeImg, //Imagen que representa las vidas
  canvas, //Elemento del lienzo
  ctx, //Contexto del lienzo
  gameObjects = [], //Matriz que almacena todos los objetos del juego
  hero, //Objeto que representa al héroe
  eventEmitter = new EventEmitter(); //Instancia de EventEmitter para manejar eventos

//Evita el comportamiento predeterminado para ciertas teclas
let onKeyDown = function (e) {
  switch (e.keyCode) {
    case 37:
    case 39:
    case 38:
    case 40:
    case 32:
      e.preventDefault();
      break;
    default:
      break;
  }
};

window.addEventListener("keydown", onKeyDown);

window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (evt.key === "Enter") {
    eventEmitter.emit(Messages.KEY_EVENT_ENTER);
  } else if (evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
});

//Función para crear a los enemigos
function createEnemies() {
  const MONSTER_TOTAL = 5; //Se define la totalidad de enemigos que habrán por fila ( * * * * * )
  const MONSTER_WIDTH = MONSTER_TOTAL * 98; // Se calcula el ancho total de los enemigos multiplicando el número total por el ancho individual
  const START_X = (canvas.width - MONSTER_WIDTH) / 2; //Se calcula para posicionar a los enemigos en el centro del lienzo horizontalmente
  const STOP_X = START_X + MONSTER_WIDTH; //Se calcula la posición final en el eje x

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg; //Se asigna la imagen del enemigo "enemyImg" al objeto "Enemy"
      gameObjects.push(enemy); //Se agrega el objeto "Enemy" al array de GameObjects que contiene todos los objetos del juego
    }
  }
}

//Función que crea el héroe
function createHero() {
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4); //Posicionamiento del héroe
  hero.img = heroImg; // Se utiliza para definir qué imagen se debe dibujar para representar al héroe en la pantalla
  gameObjects.push(hero); //Agrega la instancia del héroe al array gameObjects
}

function updateGameObjects() {
  // Filtra los objetos del juego por tipo
  const enemies = gameObjects.filter((go) => go.type === "Enemy"); //Filtra los objetos del juego para obtener solo aquellos cuyo tipo es 'Enemy' (enemigos).
  const lasers = gameObjects.filter((go) => go.type === "Laser"); //Filtra los objetos del juego para obtener solo aquellos cuyo tipo es 'Laser' (láseres).

  // Verifica colisiones con el héroe y emite eventos en caso de colisión
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  });

  // Verifica colisiones entre láseres y enemigos y emite eventos en caso de colisión
  lasers.forEach((l) => {
    enemies.forEach((m) => {
      if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
    });
  });

// Filtra los objetos muertos y actualiza el array de objetos del juego
  gameObjects = gameObjects.filter((go) => !go.dead);
}

// Esta función se encarga de dibujar cada objeto en la posición correspondiente en el lienzo
function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

//Esta función prepara el juego para su ejecución
function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
    resetGame();
  });

  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 15;
  });

  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 15;
  });

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 15;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 15;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();

    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();

    if (isHeroeDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return; //perder antes de la victoria
    }
    if (isEnemiesDead()) {
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });

  eventEmitter.on(Messages.GAME_END_WIN, () => {
    endGame(true);
  });
  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    endGame(false);
  });
}

//Dibuja los iconos de vida del héroe.
function drawLife() {
  const START_POS = canvas.width - 180;
  for (let i = 0; i < hero.life; i++) {
    ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), 10);
  }
}

//Dibuja la puntuación del héroe en la parte superior izquierda.
function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Puntos: " + hero.points, 10, 30);
}

//Función auxiliar para dibujar texto en el lienzo.
function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

function resetGame() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    gameLoopId = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawPoints();
      drawLife();
      updateGameObjects();
      drawGameObjects(ctx);
    }, 100);
  }
}

window.onload = async () => {
  canvas = document.getElementById("canvas"); //Se llama el canvas en una variable
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laserRed.png");
  lifeImg = await loadTexture("assets/life.png");

  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black"; //Color del contexto del fillRect
    ctx.fillRect(0, 0, canvas.width, canvas.height); //fillRect dibuja la figura de acuerdo a las medidas, rellanada de un color específico
    drawPoints();
    drawLife();
    updateGameObjects();
    drawGameObjects(ctx);
  }, 100);
};

//Función de seguimiento sobre las vidas del héroe para saber cuando ya está muerto
function isHeroeDead() {
  return hero.life <= 0;
}

//Función de seguimiento sobre el número de enemigos que hay
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

//Función de mensaje sobre victoria al destruir todas las naves enemigas
function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";

  const maxWidth = canvas.width - 40; // Definir un ancho máximo para el texto

  let words = message.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    let testLine = currentLine + ' ' + words[i];
    let testWidth = ctx.measureText(testLine).width;

    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  lines.push(currentLine);

  const lineHeight = 30; // Altura de línea
  const totalHeight = lines.length * lineHeight;
  let startY = (canvas.height - totalHeight) / 2;

  lines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, startY);
    startY += lineHeight;
  });
}

//Función EndGame
function endGame(win) {
  clearInterval(gameLoopId);

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (win) {
      displayMessage(
        "¡Victoria! Presiona [Enter] para volver a jugar o presiona [Regresar] para volver al menu",
        "green"
      );
    } else {
      displayMessage(
        "¡Auch, te han derrotado las naves enemigas! Presiona [Enter] para volver a jugar o presiona [Regresar] para volver al menu",
        "red"
      );
    }
    showModal();
  }, 200);
}

function showModal() {
  const canvasContainer = document.getElementById("canvas");
  const modal = document.getElementById("contenedor-modal");
  const mensajePuntuacion = document.getElementById("mensaje-puntuacion");
  const vidasRestantes = document.getElementById("vidas-restantes");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const buttonReturnMenu = document.getElementById("boton-regresar-menu");

  canvasContainer.style.display = "none";

  mensajePuntuacion.textContent = "Puntos totales: " + hero.points;
  vidasRestantes.textContent = "Vidas restantes: " + hero.life;

  modal.style.display = "block";

  cerrarModalBtn.addEventListener("click", () => {
    canvasContainer.style.display = "block";
    modal.style.display = "none";
    buttonReturnMenu.style.display = "block";
  });
}

