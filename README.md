# Una parte de Nuestro Mundo

Un portal de juegos de Jesús y Julissa, con una identidad lila y rosa, ilustración de bienvenida, animación de palmaditas y créditos dedicados a Julissa. Versión inicial **0.1.0**.

## Qué puedes probar ahora

Sin cuenta y en el mismo dispositivo:

- Nunca nunca, ¿Qué pasaría si…? y ¿Quién es más probable?: amigos, familiares, solteros y parejas; normal, más íntimo e intenso. **100 preguntas por combinación, 3,600 textos en total**, mezclados sin repetirse dentro de una ronda. Siempre se puede saltar.
- Última carta tipo UNO: 2–6 jugadores, 5/7/10 cartas iniciales, manos ocultas entre turnos, reversas y penalizaciones. Las reglas de esta variante aparecen antes de empezar.
- Baraja inglesa: Ochos locos, Carta alta y Veintiuno en duelo, de 2 a 6 personas. Es una baraja, no un juego para aprender inglés.
- Gato para dos, lotería original para 2–6 y dibujo con adivinanzas en voz alta para 2–6.
- Bombitas para dos, con el motor del VS original, teclado y controles táctiles.
- Billar de bola 8 para dos, con adaptación de la física y reglas del original; reglas de la casa visibles antes de empezar.
- Varitas: secuencia de reflejos para 2–6 por turnos.
- Puzle cooperativo con imagen propia o cielo original; las imágenes elegidas permanecen en el dispositivo.
- Shooter cooperativo de dos naves contra meteoritos. Es un minijuego original sencillo; **no es una adaptación de Soul Knight**.
- Torneo de reflejos, memoria y cálculo para 2–6.
- Verdad o reto de convivencia y piano de práctica con audio local, duración y dificultad configurables.

Estos modos locales no conectan dispositivos, no ocultan información a quien mire físicamente la pantalla y no pagan monedas por resultados calculados en el navegador.

## Preparado, pendiente de activar Supabase

El propietario confirmó que todavía no tiene el proyecto nuevo. **`config.js` está vacío intencionalmente.** No se ha conectado el proyecto privado de la pareja.

El esquema y las pantallas incluyen:

- Registro e inicio de sesión por usuario y contraseña; contraseñas gestionadas por Supabase Auth.
- Perfil persistente con nombre visible, avatar, color y biografía. Reserva de los avatares de Jesús y Julissa mediante asignación administrativa a sus cuentas.
- 100 JJV2 de regalo una vez al día (fecha UTC), registrados en el servidor.
- Cambio de **2 JJV2 → 1 JXJV2**, sin cambio inverso.
- Gachapón de 500 JJV2: cinco criaturas, probabilidades visibles, colección y duplicados.
- Ruleta con un cero y monedas virtuales; resultados y movimientos validados en servidor, con identificador de operación para evitar cobrar dos veces un reintento.
- Rankings voluntarios de JJV2 disponibles, JJV2 gastadas en colección y JXJV2 perdidas en el casino.
- Foro de ideas, con eliminación de publicaciones propias y límite de frecuencia. Moderación administrativa desde la base de datos.
- Salas de Gato para dos con código, turnos comprobados en servidor, control de revisiones, actualización cada dos segundos y caducidad de 24 horas.

Las pruebas de la base de datos se ejecutaron en PostgreSQL local emulado con PGlite, con Auth y la función aleatoria sustituidas **solo en el entorno de pruebas**. Falta la comprobación de extremo a extremo contra el proyecto real de Supabase.

## Activación de cuentas

1. Crear un proyecto nuevo en [Supabase](https://supabase.com/dashboard). No usar la base de datos de Nuestro-Universos.
2. Abrir SQL Editor y ejecutar `supabase/schema.sql` una sola vez en ese proyecto vacío. Este esquema no es una migración idempotente.
3. En Authentication, habilitar acceso por correo/contraseña y desactivar la confirmación por correo **solo en este proyecto nuevo**: esta app usa alias internos como `usuario@players.jj.invalid`, no direcciones de correo reales. Ajustar la longitud mínima de contraseña a 10 caracteres. El alias no permite recuperación por correo; una futura recuperación requerirá un correo real verificado o intervención administrativa.
4. Completar `config.js` con la URL del proyecto y la clave **publishable/anon**. Nunca publicar `service_role`, claves secretas ni la contraseña de la base.
5. Crear las cuentas de Jesús y Julissa desde la web. Asignar cada skin desde SQL Editor usando el usuario real de cada uno:

```sql
-- Sustituir los dos nombres por los usuarios creados; no usar estas líneas sin revisarlos.
update public.profiles set skin='jesus' where username='usuario_real_de_jesus';
update public.profiles set skin='julissa' where username='usuario_real_de_julissa';
```

Solo el administrador puede asignar esas skins. Ningún cliente puede actualizar saldos, inventario, roles o skins directamente.

6. Probar dos cuentas en dispositivos distintos: registro, regalo único, perfil, cambio, cápsula, foro y sala de Gato. Revisar Authentication / rate limits antes de abrir registros a un público amplio.

## Publicación en GitHub Pages

La web no necesita compilación ni dependencias de producción. En este repositorio: **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Cuando GitHub termine, la dirección esperada será:

`https://yisuscraiz.github.io/Una-parte-de-Nuestro-Mundo/`

No dar esa dirección por publicada hasta que GitHub Pages confirme su despliegue. La configuración de Pages no está activada mediante este código.

## Vista local y pruebas

Con Node.js instalado:

```text
node tools/serve.cjs
```

Abrir `http://127.0.0.1:4173`. No abrir directamente el HTML con `file://`, porque usa módulos.

Para todas las pruebas, instalar la dependencia de desarrollo y ejecutar:

```text
npm install
npm test
```

Pruebas: reparto y partidas completas de cartas con 2–6 jugadores; comodines, penalizaciones y reversa; simulación de billar y Bombitas; instalación SQL, permisos, fondos insuficientes, recompensa diaria, skins reservadas, ruleta idempotente, colección, foro y salas; 36 bancos de preguntas de 100 sin duplicados literales. `contenido-check.cjs` regenera y valida `questions.js` a partir de sus fuentes editoriales.

## Lo que todavía falta

- Activación de Supabase y pruebas reales de cuentas/salas entre dispositivos.
- Salas por internet para el resto de juegos. **Conectar Supabase no añade automáticamente estos modos**: requieren implementación adicional.
- Piano competitivo en sala, almacenamiento y distribución de audio, reloj compartido y sincronización de partidas. El piano actual usa patrones de práctica y no analiza la canción.
- Skins ilustradas completas para Jesús y Julissa dentro de cada juego; los avatares reservados actuales son símbolos de perfil. Los personajes locales de Bombitas y el shooter son genéricos.
- Más decoraciones equipables y tienda de fondos/marcos. Actualmente hay color/avatar/biografía y colección de criaturas representadas con emojis.
- Revisión editorial más amplia de preguntas: hay 3,600 enunciados distintos, pero proceden de 10 decisiones × 10 contextos por público y nivel, reutilizando temas entre los tres juegos; no son 3,600 situaciones independientes redactadas a mano. Intenso significa mayor profundidad emocional, sin contenido sexual explícito.
- Confirmar a qué juego se refería «soulnight» antes de diseñar esa adaptación.
- Ampliar los ajustes y equilibrar los nuevos minijuegos con pruebas de personas reales.

## Procedencia

Referencia original: [YisusCraiz/Nuestro-Universos](https://github.com/YisusCraiz/Nuestro-Universos), commit `8664c623894f785e290c140772f6bf096be17523`.

`vendor/bombitas-engine.js` conserva el motor original con una exportación ES añadida. `pool-engine.js` adapta `jj_pool_rack` y `jj_pool_shot` de `supabase/33-billar.sql`. El resto de la interfaz y los modos locales se implementaron para este repositorio. No se copiaron las credenciales, datos de cuentas ni fotografías privadas de los puzles del original. Las ilustraciones SVG de bienvenida y carga son originales. La imagen adjunta completa se conserva solo en local y se excluyó de la subida al repositorio público tras el rechazo de la revisión automática.
