# Verificación 0.4.0

- Pruebas del casino en PGlite: rangos, pagos, manos sin duplicados, conservación, clasificación de once manos conocidas, selección inválida, aislamiento por cuenta, acceso anónimo rechazado y reintentos sin cobro doble.
- Base real: ruleta numérica, carrera y póker ejecutados en una transacción revertida. No quedaron usuarios ni fondos de prueba. Tabla de mazos no accesible a authenticated; RPC de póker no accesible a anon.
- Asesor de seguridad: ninguna función privilegiada nueva expuesta en public. jj_casino.poker tiene RLS sin políticas por diseño y acceso directo revocado. Los avisos previos de funciones y contraseñas siguen documentados en README.
- Navegador: giro de práctica, carrera, conservar/cambiar cartas, guías, portadas y recuento de votos locales. Revisión visual a 390 px de ancho; no sustituye pruebas en teléfonos físicos.
- Pruebas de PWA y sesión, motores de cartas y piano correctas. Nuevos recursos incluidos en caché 0.4.0.

# Verificación 0.3.0

- Manifest: alcance relativo compatible con GitHub Pages, iconos de 192/512 píxeles y formato maskable.
- Caché sin conexión: archivos presentes, navegación local, exclusión de API y audio privado; actualización voluntaria y limpieza limitada al caché propio.
- Sesión: fallos de red y límites de solicitudes conservan la sesión; credenciales de refresco inválidas sí la eliminan.
- Navegador: carga inicial y preparación sin conexión completadas. No se ha instalado en teléfonos físicos durante esta comprobación.

# Verificación 0.2.0

## Automatizada local

- Motores de cartas: reparto 2–6, mazos conservados, penalizaciones, comodín +4 restringido, reversa de dos, victoria y 50 partidas completas.
- Billar: ocho direcciones de saque, coordenadas finitas, faltas y bola en mano.
- Bombitas: bomba, explosión y ganador.
- Piano: patrón determinista entre clientes, ventanas de acierto, rechazo de duplicados y datos inválidos.
- PGlite: instalación y permisos del esquema base, recompensa diaria, economía, perfiles, skins restringidas, foro y Gato.
- Banco: 36 grupos de 100 enunciados, sin duplicados literales. Límite editorial descrito en README.

## Proyecto real de Supabase

- Proyecto nuevo conectado; no se utilizó la base privada de Nuestro-Universos.
- Registro sin confirmación de correo configurado con autorización expresa del usuario.
- Dos cuentas temporales autorizadas: registro, login, regalo único, cambio 2:1, aislamiento de cartera, perfil y foro.
- Sala de Gato entre ambas cuentas.
- Salas de Última carta, Ochos locos, Carta alta, Veintiuno y los tres juegos de preguntas.
- Comprobación de privacidad de manos: sin mazo ni manos ajenas en respuestas.
- Piano: subida WAV temporal, acceso firmado desde la segunda cuenta, preparación de ambos, inicio con reloj común y rechazo de resultado antes de tiempo.
- Eliminación del audio, cuentas y datos de prueba. Endpoint temporal de limpieza retirado.
- Compra/equipamiento de fondos y marcos, rechazo de artículos no adquiridos y rechazo de skin ajena: transacción revertida.
- Activación de reservas Yisus/Julissa, asignación correcta de skin y eliminación del token de metadata: transacción revertida. Las dos reservas definitivas siguen sin reclamar hasta que sus titulares elijan contraseña.

## Navegador y límites

Inicio, imagen adjunta, catálogo, buscador, ajustes, preguntas y partidas locales revisados en pantalla estrecha; sin errores de consola observados en las rutas comprobadas. La vista no sustituye una auditoría completa de cada tamaño de pantalla.

No se probaron seis dispositivos físicos ni reproducción simultánea real en varios navegadores. Las puntuaciones del piano son recreativas y no reparten monedas. Los modos arcade adicionales continúan locales. Los asesores de seguridad mantienen avisos por funciones privilegiadas intencionales; sus límites y referencias están documentados en README.
