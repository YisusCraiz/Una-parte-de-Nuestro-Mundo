# Una parte de Nuestro Mundo

Portal de Jesús y Julissa. Versión **0.5.2**, conectado al proyecto Supabase **Una parte de nuestro universo**.

## Mejora de presentación e interacción

- Un escenario y color de acento para cada uno de los 16 juegos; fondos, tableros, cartas y controles táctiles con más profundidad.
- Transiciones al mostrar preguntas, resultados, manos y cambios de turno; las manos permanecen ocultas al pasar el dispositivo.
- Piezas del puzle que viajan a su nueva posición al intercambiarse, en local y sala.
- Piano con carriles luminosos y respuesta al tocar o pulsar D/F/J/K.
- Billar con paño degradado, marco de madera y luces y sombras en las bolas; Bombitas con llamas y mecha luminosa; expedición con fondo espacial, disparos luminosos y propulsores animados.
- Sonidos de botones opcionales, apagados inicialmente, sin archivos ni peticiones externas. Movimiento reducido respetado en las nuevas transiciones de interfaz.
- Actualización de la caché PWA para descargar los nuevos recursos.

Esta mejora parte del estado de este repositorio y no incorpora el Álbum JJ ni versiones de otros proyectos. No modifica reglas, monedas, autenticación ni protocolos de salas.

## Preguntas reescritas

Nunca nunca y ¿Quién es más probable? tienen 2,400 frases escritas individualmente: 100 por juego, público y nivel. Normales: humor y anécdotas; íntimas: crushes, recuerdos y sentimientos; intensas: confesiones, vergüenzas o coqueteo según el público. Familia mantiene contenido apto entre generaciones. Se permite saltar siempre. No se generan cruces automáticos para rellenar cantidad. Fuente editable: tools/preguntas-editoriales.txt; compilación explícita: node tools/build-questions.mjs. contenido-check.cjs solo valida y nunca sobrescribe el banco. Web y función de salas comparten questions.js.

## Sarai en nuestro mundo

Sarai tiene un personaje chibi propio basado en la ilustración adjunta por el usuario. Las portadas de Última carta, Lotería y Dibuja y adivina muestran a Jesús, Julissa y Sarai jugando juntos. Las portadas anteriores se conservan como archivos separados. El retrato WebP mantiene transparencia; prompts completos en assets/art/GENERACION-SARAI.json.

## Novedades visuales y casino

- 16 portadas originales con Jesús y Julissa en cada juego, conservando violeta, lavanda y rosa.
- Carga con cuatro fotogramas de palmaditas basados en la referencia adjunta; respeta movimiento reducido. Guías de tres pasos antes de cada minijuego y votación local por persona con recuento final.
- Ruleta animada de rojo/negro (×2), ruleta numérica de 0 a 36 (×36), carrera de cuatro peluches equiprobables (×3) y póker individual de cinco cartas con un cambio. Las devoluciones incluyen la apuesta. Cada juego muestra reglas y pagos.
- Práctica sin cuenta ni monedas. Modo JXJV2 autenticado, saldo calculado en servidor y solicitudes recuperables sin duplicar cobros. Las animaciones representan el resultado del servidor, no modifican las probabilidades.
- Póker: una mano pendiente por cuenta, mazo privado, selección de cartas conservadas, pago único y recuperación tras salir. No es una mesa de póker multijugador.

Arte generado con la herramienta integrada image_gen; archivos en assets/art/headpat-strip.webp y assets/art/covers/. Prompts y referencia documentados en assets/art/GENERACION.json.

## Cuentas, monedas y personalización

- Registro e inicio con nombre de usuario y contraseña. Supabase Auth gestiona las contraseñas; no se guardan en el código.
- Perfiles persistentes: avatar, nombre visible, biografía, color, fondos, marcos y peluche acompañante.
- Yisus y Julissa están reservados con sus skins originales. Se activan mediante enlaces privados de un solo uso y una contraseña elegida por cada titular. Los tokens de activación no se guardan en este repositorio.
- Regalo automático de 100 JJV2 una vez por día UTC. Reconectar no lo duplica.
- Cambio: **2 JJV2 → 1 JXJV2**. Sin cambio inverso ni dinero real.
- Gachapón de 500 JJV2, probabilidades visibles y duplicados coleccionables.
- Fondos de 1,500–2,500 JJV2 y marcos de 1,000–1,800 JJV2. Solo se pueden equipar artículos adquiridos.
- Ruleta con un cero: resultados y transacciones en servidor, sin depósitos, retiros ni premios de dinero real.
- Rankings voluntarios: saldo JJV2, gasto en colección y pérdidas acumuladas JXJV2.
- Foro de ideas con límite de frecuencia y eliminación de publicaciones propias.

La ilustración adjunta de ustedes está incluida con la autorización expresa del propietario. La animación SVG de palmaditas continúa en las transiciones. El atlas de personajes original se reutiliza para las skins reservadas y el personaje del titular en Bombitas local.

## Salas en línea

Cada participante necesita su cuenta y entra con un código. El anfitrión configura las reglas antes de comenzar; todos pueden leerlas en la sala. Se puede preparar una revancha al finalizar. Las salas caducan a las 24 horas.

| Juego | Personas | Ajustes y funcionamiento |
| --- | --- | --- |
| Última carta / baraja inglesa | 2–6 | Manos privadas, turnos y validación en servidor |
| Nunca nunca / ¿Qué pasaría si…? / ¿Quién es más probable? | 2–6 | Público, profundidad, preguntas y votos compartidos |
| Piano estelar | 2–6 | Audio privado y reloj/patrón compartidos |
| Gato | 2 | Turnos y casillas validados |
| Lotería | 2–6 | Cada quien compone su tablero de 9 o 16 figuras; baraja de nombres/emojis propia; fila/columna/diagonal, esquinas o tablero completo; canto manual o cada 5/10/15 s |
| Dibuja y adivina | 2–6 | Palabras propias, 1–3 vueltas, 45–120 s por dibujo, pista de longitud opcional; lienzo y respuestas compartidas, palabra visible solo para quien dibuja |
| Verdad o reto | 2–6 | Grupo, profundidad, listas propias, 10/20/30 turnos, tiempo opcional y derecho a pasar |
| Billar | 2 | Física validada por el servidor, animación del tiro, fuerza máxima, ayuda de puntería, saque y repetición de turno configurables |
| Bombitas | 2 | Controles desde cada dispositivo; duración, alcance, bombas, mecha, mejoras y cierre del mapa |
| Duelo de varitas | 2–6 | Secuencia y reloj comunes; 10/20/40 flechas, ritmo y errores; resultados comprobados al final |
| Puzle compartido | 2–6 | 9/16/25 piezas, cooperativo libre o turnos, referencia opcional y subida privada de imagen |
| Expedición del universo | 2–4 | Cooperativo en tiempo real; duración, escudos y dificultad |

Dibujo, lotería, billar y puzle se guardan con revisión del servidor; las jugadas de un estado antiguo se rechazan o se recuperan según la acción. El dibujo sincroniza trazos al soltarlos o por segmentos; no es transmisión de vídeo. El límite por lienzo es de 160 trazos de hasta 60 puntos; limpiar libera espacio.

Bombitas y Expedición usan canales privados de Supabase Realtime. Cada cuenta solo puede enviar por su propio canal; los miembros escuchan los de su sala y solo el canal del anfitrión determina la simulación. El anfitrión debe mantener la pestaña activa; la arena espera si faltan controles durante más de 2.5 s. Hay puntos de recuperación cada seis segundos: una recarga del anfitrión puede recuperar con unos segundos de diferencia. No hay migración automática del anfitrión ni premios de monedas. Varitas conserva las pulsaciones locales durante la ronda y valida índices, tiempos, duplicados y puntuación al enviarlas; no demuestra que sean pulsaciones humanas. Estos modos son recreativos, sin protección competitiva contra un anfitrión o cliente modificado.

Las imágenes propias del puzle se reducen a 1200 px y se suben a un bucket privado de hasta 5 MB por imagen. Se accede con enlaces temporales para miembros; no entran al caché de la PWA. Las tablas de lotería se personalizan con figuras de texto y emojis; esta entrega no incluye cargar fotografías para cada casilla.

El piano acepta audio de hasta 30 MB y partidas de 30/60/120 segundos. La canción queda privada para miembros. Todos juegan el mismo patrón, que no analiza ni transcribe la canción. La puntuación es recreativa y no reparte monedas.

## Modos en el mismo dispositivo

Siguen disponibles sin cuenta: los tres juegos de preguntas, Última carta, las tres variantes de baraja inglesa, Gato, lotería, dibujo y adivinanzas, Bombitas, billar de bola 8, varitas, puzle con imagen propia, shooter cooperativo, torneo de reflejos/memoria/cálculo, verdad o reto y práctica de piano.

Bombitas, billar y shooter admiten dos personas. Los modos indicados para 2–6 se juegan por turnos o cooperativamente en la misma pantalla. Las etiquetas del catálogo distinguen cada modalidad.

Los tres juegos de preguntas tienen cuatro públicos —amigos, familiares, solteros y parejas— y tres niveles —normal, más íntimo e intenso—: **100 preguntas por combinación, 3,600 textos**. Las 2,400 frases de Nunca nunca y ¿Quién es más probable? fueron reescritas sin combinaciones de plantillas. Las 1,200 de ¿Qué pasaría si? se conservan del banco anterior y todavía combinan acciones y contextos. Hay temas compartidos entre públicos, pero no frases idénticas dentro de cada juego reescrito. Iniciar una partida nueva vuelve a mezclar el banco; no existe historial entre partidas. Se puede saltar sin penalización.

## Instalar en el teléfono

Abre la web publicada y usa **Instalar app** al pie de la página. En Android, Chrome permite instalar desde su menú; en iPhone, abre Safari y elige Compartir → Añadir a pantalla de inicio y, si aparece, Abrir como app web.

Incluye iconos propios y apertura independiente. Después de la primera carga completa, los juegos locales pueden abrirse sin conexión. Las cuentas, monedas y salas necesitan internet. El caché solo conserva archivos públicos de la aplicación; no guarda respuestas de Supabase ni audio privado. Una pérdida de conexión no borra la sesión.

Las nuevas versiones muestran un botón para actualizar; no se recarga automáticamente una partida abierta. Al modificar archivos publicados, cambiar también la versión del caché en sw.js. Los iconos se regeneran con npm run build:icons.

## Instalación y mantenimiento

El proyecto de Supabase ya está instalado. **No volver a ejecutar schema.sql sobre esta base existente.**

Para reproducirlo en un proyecto vacío, el orden de fuentes SQL es:

1. supabase/schema.sql
2. supabase/multiplayer.sql
3. supabase/profile-style.sql
4. supabase/owner-reservations.sql
5. supabase/casino.sql
6. supabase/party-online.sql

Los registros privados de reserva se crean por administración, guardando solo el hash del enlace; los tokens originales nunca se añaden al repositorio.

Desplegar la función **mundo-room** con index.js, deno.json y sus dependencias engines.js, questions.js, piano-chart.js, party-engine.js y pool-engine.js. Las importaciones relativas deben conservarse o adaptarse al empaquetado. La función usa variables de entorno estándar de Supabase. No incluir claves secretas en la web. La verificación JWT de la puerta de entrada está desactivada porque la función realiza su propia autenticación contra Auth /user en cada solicitud; esto no permite acceso anónimo a salas.

config.js contiene únicamente URL y clave publicable del proyecto nuevo. Authentication tiene registro por contraseña habilitado y confirmación de correo desactivada para los alias internos usuario@players.jj.invalid. No hay recuperación por correo con estos alias: una recuperación requerirá intervención administrativa o incorporar un correo real verificado.

GitHub Pages sirve la rama main desde la raíz. Dirección del proyecto:

https://yisuscraiz.github.io/Una-parte-de-Nuestro-Mundo/

## Pruebas y vista local

    node tools/serve.cjs

Abrir http://127.0.0.1:4173. No abrir index.html con file://, porque usa módulos.

    npm install
    npm test

Hay pruebas de motores de cartas para 2–6, simulación de billar/Bombitas, patrón/puntuación de piano, permisos y operaciones del esquema base, y validación del banco de preguntas.

Se realizaron pruebas reales contra Supabase con dos cuentas temporales autorizadas: registro, login, recompensa diaria única, cambio 2:1, aislamiento de saldos, perfil, foro, Gato, siete modos adicionales de salas y audio privado de piano. Se eliminaron las cuentas, sus datos y el audio, y se retiró el endpoint temporal de limpieza. Las compras de decoraciones y reservas de skins se comprobaron en transacciones revertidas.

## Seguridad revisada y límites

Todas las tablas tienen RLS. Saldos, inventario, identidades reservadas y estados de partida no admiten escritura directa de clientes. Las funciones internas de sesiones solo las puede ejecutar service_role; la función Edge valida el usuario antes de llamarlas.

Los asesores de Supabase señalan como intencionales las funciones SECURITY DEFINER que constituyen operaciones limitadas por cuenta, el ranking público con participación voluntaria y tres tablas sin políticas de acceso directo: public.rooms y las tablas privadas de sesiones y reservas. No se debe eliminar sus comprobaciones de actor o conceder acceso directo a esas tablas para silenciar avisos. Referencias: [funciones autenticadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [ranking público](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [RLS sin política directa](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Lo que todavía queda

- Prueba presencial de seis dispositivos, sonido simultáneo en distintos navegadores y ajustes de latencia.
- Automatizar la limpieza de audio de salas caducadas; actualmente el anfitrión tiene permiso para borrarlo y el administrador puede gestionarlo desde Storage.
- Salas en línea para Bombitas, billar, dibujo, lotería, varitas, puzle, shooter y torneo; actualmente son locales.
- Pulir animaciones, ampliar personajes absurdos y sustituir más representaciones emoji por arte propio.
- Revisión editorial completa del banco de preguntas y ampliación de contenido.
- Confirmar qué título significa «soulnight». El shooter actual es un minijuego original y no una adaptación de Soul Knight.
- Recuperación de cuenta con un medio verificable y controles de comunidad más amplios.

## Procedencia

Referencia: [YisusCraiz/Nuestro-Universos](https://github.com/YisusCraiz/Nuestro-Universos), commit 8664c623894f785e290c140772f6bf096be17523.

vendor/bombitas-engine.js conserva el motor original con exportación ES. pool-engine.js adapta jj_pool_rack y jj_pool_shot. assets/characters/jj-original.png reutiliza el atlas original. No se copiaron las credenciales, cuentas ni fotografías privadas de los puzles de la web de pareja.

El casino nuevo usa envolturas SECURITY INVOKER en public y operaciones privilegiadas en jj_casino, fuera de los esquemas expuestos. Estas validan auth.uid(), bloquean la cartera por operación y deniegan leer/escribir la tabla del mazo. La tabla tiene RLS sin políticas a propósito: solo las operaciones internas pueden acceder. Aviso informativo correspondiente: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy . Los avisos anteriores de funciones públicas y protección de contraseñas no fueron modificados por esta entrega.

Realtime sigue el protocolo documentado en https://supabase.com/docs/guides/realtime/protocol y su autorización por canal en https://supabase.com/docs/guides/realtime/authorization . Las políticas consultan pertenencia, emisor, estado y caducidad en un esquema privado; el navegador no puede leer sesiones completas ni reservas de propietarios.
