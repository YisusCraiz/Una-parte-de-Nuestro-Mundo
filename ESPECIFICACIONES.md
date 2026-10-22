# Una parte de nuestro universo

Estado: requisitos originales recopilados. Repositorios identificados y versión inicial implementada; consultar README.md para el estado real y las funciones pendientes. Este documento describe el alcance deseado, no una lista de funciones terminadas.

Origen: https://github.com/YisusCraiz/Nuestro-Universos
Destino autorizado: https://github.com/YisusCraiz/Una-parte-de-Nuestro-Mundo

## Idea y estilo

Portal intuitivo y adaptable a teléfono y computadora para jugar con dos o más personas, probar juegos nuevos y recoger opiniones. Julissa podrá jugar con sus amigos. Conservar la identidad romántica de Jesús y Julissa usando la imagen adjunta como referencia visual.

## Cuenta y perfil

- Registro con nombre de usuario y contraseña, seguido de inicio de sesión.
- Perfiles persistentes y personalizables: avatar, colores, marcos, decoraciones y colección de peluches.
- Las skins personales de Jesús y Julissa estarán reservadas a sus respectivas cuentas; esta restricción deberá verificarse en servidor.
- Otros personajes con diseños divertidos y absurdos.
- Autenticación real y almacenamiento compartido para cuentas, saldos y partidas. No presentar un registro local del navegador como cuenta en línea.

## Preguntas y convivencia

Juegos: Nunca nunca, ¿Qué pasaría si…? y ¿Quién es más probable que…?

Cada juego tendrá cuatro modos: amigos, familiares, solteros y parejas. Cada modo tendrá tres dificultades: normal, más íntimo e intenso, con 100 preguntas propias por combinación. Total: 3,600 preguntas distintas y revisadas, evitando completar el banco mediante simples variaciones repetidas.

El contenido familiar será adecuado para convivencia familiar incluso al aumentar su profundidad. En modos íntimos se podrá saltar cualquier pregunta sin penalización. La intensidad y la intimidad se adaptarán al público de cada modo.

## Catálogo de juegos solicitado

- Revisar y trasladar la mayoría de los juegos del apartado VS de Nuestro Mundo cuando se reciba el enlace.
- Juego tipo UNO y juego de inglés: estudiar las reglas existentes y permitir de 2 a 6 participantes cuando el modo lo admita, con ajustes de partida visibles antes de empezar.
- Lotería.
- Dibujo y adivinanzas tipo Pinturillo.
- Juego inspirado en la referencia escrita como «soulnight»; confirmar con el usuario el título exacto antes de definir sus mecánicas.
- Shooter con personajes originales.
- Torneos de minijuegos inspirados en la dinámica de 1, 2, 3, 4 Player Games.
- Piano de ritmo competitivo: salas, música subida por un participante y compartida con los demás, dificultad y duración configurables. Requiere sincronización entre dispositivos y gestión de archivos de audio.
- Casino ampliado, con monedas virtuales.

## Monedas y colección

- JJV2: moneda general para la tienda, decoraciones y gachapón de peluches coleccionables.
- JXJV2: moneda del casino.
- Cambio solicitado: 2 JJV2 compran 1 JXJV2. No se ha pedido cambio inverso.
- Recompensa propuesta: 100 JJV2 al primer inicio de sesión de cada día; pendiente de confirmar si el usuario quiere otra frecuencia.
- Precios altos según lo solicitado, con importes por definir.
- Saldos y transacciones validados en servidor para evitar duplicaciones o modificaciones desde el navegador.
- Rankings separados por saldo acumulado, gasto en compras y pérdidas acumuladas en el casino. Mostrar claramente el significado de cada clasificación.
- No se ha solicitado dinero real, depósitos, retiros ni premios canjeables.

## Comunidad

Foro para sugerir juegos, mejoras y reportar problemas. Vincular publicaciones con cuentas y contemplar controles de moderación.

## Carga, navegación y créditos

- Pantalla breve al iniciar sesión y al entrar en acciones importantes.
- Jesús dando palmaditas en la cabeza de Julissa mientras ella sonríe, usando la referencia adjunta para su apariencia.
- La carga acompañará el estado real de la operación, con transición corta y respeto a la preferencia de movimiento reducido.
- Pie de página con botón Actualizar y crédito propuesto: «Hecho por Jesús, el novio de Julissa. Un universo para todos; su corazón, solo para ella.»

## Pendientes para continuar

1. Catálogo VS identificado: Bombitas, Última carta, baraja inglesa, billar, gato, varitas, puzle y verdad o reto. Sus adaptaciones locales están en la versión inicial.
2. El usuario proporcionó un repositorio nuevo para la web. GitHub Pages requiere activación en sus ajustes.
3. Confirmar la referencia «soulnight» y la frecuencia de la recompensa si difieren de las interpretaciones anotadas.
4. El usuario confirmó que aún no tiene el proyecto nuevo de Supabase y lo facilitará después. El esquema y los clientes están preparados; falta activar y comprobar el servicio real, y desarrollar las salas adicionales. No describir la plataforma como multijugador en línea completa.

## Comprobaciones de entrega

Verificar registro e inicio de sesión, aislamiento entre perfiles, reserva de skins, recompensa sin duplicados, conversión de monedas, reconexión a salas, límites de jugadores, sincronización de audio, banco de preguntas completo y navegación móvil. Distinguir explícitamente las funciones listas de cualquier función pendiente.
