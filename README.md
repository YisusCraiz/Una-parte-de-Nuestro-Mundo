# Una parte de Nuestro Mundo

Portal de Jesús y Julissa. Versión **0.2.0**, conectado al proyecto Supabase **Una parte de nuestro universo**.

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

Cada participante necesita su cuenta y entra con un código. El anfitrión configura la sala antes de empezar.

| Juego | Participantes | Implementación |
| --- | --- | --- |
| Última carta tipo UNO | 2–6 | Mano privada, turnos, colores, reversas y penalizaciones en servidor |
| Baraja inglesa: Ochos locos | 2–6 | Mano privada y validación de jugadas |
| Baraja inglesa: Veintiuno | 2–6 | Pedir/plantarse por turnos, revelado al finalizar |
| Baraja inglesa: Carta alta | 2–6 | Cartas ocultas hasta que cada persona las destapa |
| Nunca nunca | 2–6 | Pregunta compartida, avance controlado por anfitrión |
| ¿Qué pasaría si…? | 2–6 | Pregunta compartida |
| ¿Quién es más probable? | 2–6 | Votos sincronizados |
| Piano estelar | 2–6 | Audio privado compartido, preparación de sonido, reloj y patrón comunes |
| Gato | 2 | Validación de turnos, casillas y revisión de estado |

Las salas caducan a las 24 horas. Las cartas ajenas y el mazo no se envían a los otros jugadores. La función de salas verifica el token con Supabase Auth antes de usar operaciones internas. El cliente no puede elegir otro actor ni escribir el estado de una sala directamente.

El piano acepta audio de hasta 30 MB y partidas de 30/60/120 segundos. La canción queda en un bucket privado, accesible solo a miembros de la sala mediante enlaces temporales; el propietario conserva permiso para eliminar su archivo. Todos juegan el mismo patrón, que **no analiza ni transcribe la canción**. Una canción corta se repite hasta completar la duración elegida. La puntuación es recreativa, sin monedas ni garantías contra trampas sofisticadas. El servidor comprueba índices, duplicados, carriles y ventanas temporales; no puede demostrar que una pulsación proceda de una persona.

## Modos en el mismo dispositivo

Siguen disponibles sin cuenta: los tres juegos de preguntas, Última carta, las tres variantes de baraja inglesa, Gato, lotería, dibujo y adivinanzas, Bombitas, billar de bola 8, varitas, puzle con imagen propia, shooter cooperativo, torneo de reflejos/memoria/cálculo, verdad o reto y práctica de piano.

Bombitas, billar y shooter admiten dos personas. Los modos indicados para 2–6 se juegan por turnos o cooperativamente en la misma pantalla. Las etiquetas del catálogo distinguen cada modalidad.

Los tres juegos de preguntas tienen cuatro públicos —amigos, familiares, solteros y parejas— y tres niveles —normal, más íntimo e intenso—: **100 preguntas por combinación, 3,600 textos**. El banco combina diez decisiones y diez contextos por público/nivel; hay temas comunes entre juegos y algunas frases largas. No son 3,600 situaciones independientes redactadas a mano. Intenso aumenta la profundidad emocional; no contiene contenido sexual explícito. Se puede saltar sin penalización.

## Instalación y mantenimiento

El proyecto de Supabase ya está instalado. **No volver a ejecutar schema.sql sobre esta base existente.**

Para reproducirlo en un proyecto vacío, el orden de fuentes SQL es:

1. supabase/schema.sql
2. supabase/multiplayer.sql
3. supabase/profile-style.sql
4. supabase/owner-reservations.sql

Los registros privados de reserva se crean por administración, guardando solo el hash del enlace; los tokens originales nunca se añaden al repositorio.

Desplegar la función **mundo-room** con index.js, deno.json y sus dependencias engines.js, questions.js y piano-chart.js. Las importaciones relativas deben conservarse o adaptarse al empaquetado. La función usa variables de entorno estándar de Supabase. No incluir claves secretas en la web. La verificación JWT de la puerta de entrada está desactivada porque la función realiza su propia autenticación contra Auth /user en cada solicitud; esto no permite acceso anónimo a salas.

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
