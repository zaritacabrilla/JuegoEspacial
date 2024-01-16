document.addEventListener("DOMContentLoaded", function () {
  const musica = document.getElementById("musica");
  const reproducirMusicaImagen = document.getElementById(
    "imagen-reproducir-musica"
  );

  let musicaReproduciendo = false;

  reproducirMusicaImagen.addEventListener("click", function () {
    if (musica.paused) {
      reproducirMusica();
    } else {
      pausarMusica();
    }
  });

  function reproducirMusica() {
    musica.play();
    reproducirMusicaImagen.querySelector('img').src = "./assets/con-sonido.png";
    musicaReproduciendo = true
  }

  function pausarMusica() {
    musica.pause();
    reproducirMusicaImagen.querySelector('img').src = "./assets/sin-sonido.png";
    musicaReproduciendo = false;
  }
});
