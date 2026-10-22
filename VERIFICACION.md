# Verificación de la versión inicial

- Análisis de sintaxis de los módulos JavaScript: correcto.
- Motores de cartas: reparto de 2–6 personas, 108/52 cartas sin pérdidas, penalizaciones, +4 restringido, reversa con dos personas, ganador, reciclado de mazo y 50 partidas automatizadas completas.
- Billar: saque en ocho direcciones, posiciones finitas, conservación de bolas, cambio de turno por falta y colocación legal de la blanca.
- Bombitas: creación del tablero, colocación de bomba, explosión y ganador.
- SQL en PGlite: instalación completa, separación de perfiles/saldos, rechazo de escritura directa en cartera, regalo diario único, cambio de moneda, fondos insuficientes, rechazo de avatares reservados, transacción idempotente de ruleta, gachapón, límite de foro, sala privada por miembros, ocupación máxima y turnos/revisiones de Gato.
- Contenido: 3,600 enunciados, 36 grupos de 100 y ausencia de duplicados literales. Revisión de muestras; límite editorial y método de composición documentados en README.
- Navegador: inicio, catálogo/buscador, Nunca nunca familiares intenso, avance de pregunta, Última carta con seis nombres y ocultación de mano al pasar turno, apertura y saque de billar. Sin errores de consola observados en esas rutas.
- Vista estrecha de 319 px: corregidas órbitas decorativas que causaban desplazamiento horizontal; no se observó desbordamiento después de corregirlo.

## Límites de esta comprobación

No se configuró el servicio de Supabase del usuario ni se probaron cuentas/salas reales contra él. En pruebas SQL se sustituye Auth y el generador de bytes; el esquema de producción conserva pgcrypto. No se completó una auditoría visual de cada juego en todos los tamaños ni una prueba con seis dispositivos. No hay salas de piano ni de los demás juegos, salvo la implementación preparada de Gato. La publicación en GitHub Pages debe confirmarse por separado.
