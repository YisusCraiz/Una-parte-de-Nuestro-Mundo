const fs = require('fs');
const path = require('path');
// Cada cruce plantea una situación concreta: diez decisiones y diez contextos
// por público y nivel. Los tres juegos exploran experiencia, hipótesis y voto.
const specs = {
  amigos: {
    normal: {
      contexts: ['al organizar una excursión sin señal de teléfono', 'durante una noche de juegos de mesa', 'en un viaje con presupuesto compartido', 'al preparar una fiesta sorpresa', 'en una competencia de cocina entre amigos', 'durante una tarde de karaoke', 'en una acampada con lluvia inesperada', 'al colaborar en un cortometraje casero', 'en una búsqueda del tesoro por el barrio', 'al organizar una venta para recaudar fondos'],
      actions: ['improvisar un plan cuando nadie entiende las instrucciones', 'asumir el liderazgo aunque normalmente prefiera seguir al grupo', 'reconocer que olvidó traer algo imprescindible', 'cambiar una regla para incluir a alguien que acaba de llegar', 'pedir ayuda después de asegurar que podía hacerlo sin apoyo', 'renunciar a su primera opción para llegar a un acuerdo', 'inventar una solución usando objetos que tenía a mano', 'defender una idea que todos consideraban demasiado extraña', 'confesar que entendió mal la hora de encuentro', 'hacer reír al grupo cuando el plan empieza a salir mal']
    },
    intimo: {
      contexts: ['cuando un amigo se muda a otra ciudad', 'después de una discusión que dejó al grupo dividido', 'al reencontrarse con una amistad de la infancia', 'cuando alguien del grupo consigue una oportunidad soñada', 'durante una conversación sobre sentirse fuera de lugar', 'después de cancelar varios planes por agotamiento', 'al descubrir que un amigo atraviesa una etapa difícil', 'cuando dos amigos empiezan a pasar más tiempo por separado', 'al revisar recuerdos de una época que ya terminó', 'cuando una nueva persona cambia la dinámica del grupo'],
      actions: ['explicar qué necesita para sentirse acompañado sin exigir atención constante', 'admitir que sintió envidia y hablarlo sin culpar a nadie', 'pedir disculpas por un comentario que parecía una broma', 'contar un miedo que suele esconder detrás del humor', 'preguntar si ha hecho sentir ignorada a otra persona', 'poner un límite aunque tema decepcionar al grupo', 'reconocer que necesita apoyo en vez de desaparecer', 'agradecer una ayuda que en su momento dio por sentada', 'decir que extraña cómo era antes una amistad', 'escuchar una crítica sin responder de inmediato a la defensiva']
    },
    intenso: {
      contexts: ['si un amigo comparte una confidencia sin permiso', 'si el grupo excluye a alguien por una diferencia de dinero', 'si una amistad solo aparece para pedir favores', 'si descubre una mentira que perjudicó a otra persona', 'si recibe presión para participar en una burla', 'si un amigo exige elegir entre dos personas del grupo', 'si un proyecto compartido acaba con una deuda inesperada', 'si alguien usa una inseguridad personal para ganar una discusión', 'si una persona se atribuye el trabajo de todo el grupo', 'si una amistad quiere retomar el contacto tras una traición'],
      actions: ['pedir una conversación privada antes de tomar una decisión', 'marcar una distancia temporal y explicar el motivo', 'defender a la persona afectada aunque pierda popularidad', 'revisar su propia responsabilidad antes de señalar culpables', 'rechazar una reconciliación inmediata sin caer en insultos', 'proponer una reparación concreta en vez de aceptar solo una disculpa', 'buscar la opinión de alguien ajeno al conflicto sin revelar confidencias', 'aceptar que una amistad importante quizá termine', 'mantener un límite aunque varias personas lo cuestionen', 'distinguir entre perdonar y volver a confiar como antes']
    }
  },
  familia: {
    normal: {
      contexts: ['durante una comida con tres generaciones', 'al preparar una receta familiar sin instrucciones escritas', 'en un paseo donde todos quieren visitar lugares distintos', 'al montar un mueble siguiendo un manual confuso', 'durante una sesión de fotos familiares', 'al elegir una película para edades muy diferentes', 'en una celebración con invitados que no se conocen', 'al organizar los recuerdos de un álbum antiguo', 'durante un juego de pistas dentro de casa', 'al cuidar juntos un pequeño huerto'],
      actions: ['inventar una actividad para que nadie se quede fuera', 'preguntar el origen de una costumbre que siempre ha seguido', 'enseñar con paciencia algo que sabe hacer bien', 'admitir que confundió dos nombres y convertirlo en una anécdota', 'repartir las tareas según lo que cada persona puede hacer', 'descubrir una habilidad inesperada de otro familiar', 'sugerir una alternativa cuando el plan original falla', 'ayudar a alguien a entender una regla sin jugar por esa persona', 'ceder su turno para que participe quien ha hablado menos', 'guardar un recuerdo de un momento que parecía cotidiano']
    },
    intimo: {
      contexts: ['al hablar de una tradición que está cambiando', 'cuando un familiar empieza una etapa en otra ciudad', 'al recordar a una persona que ya no participa en las reuniones', 'cuando alguien pide más espacio personal en casa', 'al conversar sobre expectativas distintas entre generaciones', 'cuando un familiar reconoce que se siente poco escuchado', 'al recibir noticias de un logro que costó mucho esfuerzo', 'cuando una persona nueva se integra en la familia', 'al descubrir una historia desconocida de la infancia de un familiar', 'cuando las responsabilidades de casa se reparten de nuevo'],
      actions: ['preguntar qué recuerdo le gustaría conservar a cada persona', 'explicar una emoción sin comparar quién lo ha pasado peor', 'agradecer un cuidado que antes no sabía reconocer', 'admitir que una costumbre le resulta difícil de seguir', 'pedir que le escuchen antes de ofrecer consejos', 'reconocer que ha cambiado de opinión con los años', 'ofrecer ayuda concreta sin decidir por otra persona', 'hablar de una expectativa que no sabe cómo cumplir', 'escuchar una versión de la historia diferente a la suya', 'decir qué le hace sentirse parte de la familia']
    },
    intenso: {
      contexts: ['si una discusión se repite en cada reunión', 'si alguien compara constantemente los logros de dos familiares', 'si una decisión de casa se toma sin escuchar a todos', 'si una broma familiar hace sentir mal a una persona', 'si una responsabilidad termina siempre en las mismas manos', 'si un rumor provoca un malentendido entre familiares', 'si alguien lee un mensaje privado sin permiso', 'si un familiar insiste en hablar de un tema que incomoda', 'si dos generaciones discrepan sobre una norma de convivencia', 'si un familiar quiere cambiar una celebración muy arraigada'],
      actions: ['pedir una pausa para que la conversación pueda continuar con calma', 'explicar un límite personal sin descalificar a nadie', 'proponer que cada persona tenga un turno para hablar', 'reconocer un error propio delante de quienes resultaron afectados', 'buscar un acuerdo que se pueda revisar después de probarlo', 'defender el derecho de otra persona a pensar diferente', 'pedir una disculpa que reconozca el daño concreto', 'rechazar la presión de tomar partido en una disputa ajena', 'separar el cariño familiar de la obligación de estar de acuerdo', 'proponer una nueva forma de convivir sin exigir que todos cambien de golpe']
    }
  },
  solteros: {
    normal: {
      contexts: ['al probar una afición sin conocer a nadie', 'durante una salida organizada por una aplicación de eventos', 'en un viaje corto por su cuenta', 'al empezar un curso después del trabajo o de clase', 'en una fiesta donde solo conoce a quien invita', 'al apuntarse a una actividad de voluntariado', 'durante un intercambio de idiomas', 'al explorar un barrio nuevo', 'en una cita para tomar café', 'al organizar un fin de semana sin depender de otros planes'],
      actions: ['iniciar una conversación usando una observación inesperada', 'cambiar de plan porque descubre algo que le interesa más', 'reírse de un pequeño error sin fingir que fue intencional', 'preguntar por una recomendación y acabar descubriendo una afición', 'decir con claridad qué le apetece hacer', 'atreverse a presentar una idea delante de desconocidos', 'invitar a alguien a una actividad sin darle un significado romántico', 'disfrutar de un rato a solas aunque haya más gente alrededor', 'rechazar amablemente un plan que no le interesa', 'salir de su rutina sin gastar más de lo previsto']
    },
    intimo: {
      contexts: ['al volver a conocer gente después de una ruptura', 'cuando todos sus amigos parecen estar en pareja', 'al descubrir que disfruta más de su independencia de lo esperado', 'cuando una cita pregunta qué busca en una relación', 'al notar que sigue comparando a nuevas personas con alguien del pasado', 'cuando recibe atención de alguien que no le interesa', 'al sentir ilusión por alguien que todavía conoce poco', 'cuando un plan romántico no avanza como esperaba', 'al decidir cuánto de su vida compartir con alguien nuevo', 'cuando la soledad aparece incluso después de un día acompañado'],
      actions: ['admitir que necesita tiempo antes de comprometerse', 'distinguir entre buscar compañía y sentir interés por una persona concreta', 'explicar una inseguridad sin pedir que otra persona la resuelva', 'reconocer un patrón de sus relaciones anteriores', 'decir que está a gusto sin tener que justificar su situación sentimental', 'preguntarse qué deseo es propio y cuál viene de la presión social', 'hablar de un límite que antes le costaba expresar', 'aceptar un rechazo sin convertirlo en una medida de su valor', 'reconocer qué tipo de atención le hace sentirse comprendido', 'pedir claridad aunque le dé miedo escuchar la respuesta']
    },
    intenso: {
      contexts: ['si alguien quiere una relación distinta a la que busca', 'si descubre que una cita ocultó un dato importante sobre su situación sentimental', 'si una persona reaparece tras desaparecer sin explicación', 'si siente presión por formalizar antes de estar preparado', 'si alguien interpreta su amabilidad como una promesa romántica', 'si una amistad empieza a expresar interés que no comparte', 'si una persona que le gusta no respeta un primer límite', 'si recibe mensajes contradictorios durante varias semanas', 'si una antigua pareja pide otra oportunidad', 'si empieza a abandonar sus proyectos para agradar a alguien'],
      actions: ['pedir una respuesta clara y aceptar que quizá no sea la que desea', 'terminar el contacto de manera respetuosa cuando no hay compatibilidad', 'mantener sus planes personales aunque tema perder una oportunidad romántica', 'explicar qué conductas no está dispuesto a aceptar', 'dar prioridad a sus valores frente a la intensidad del momento', 'rechazar la idea de que debe ganarse el afecto haciendo favores', 'reconocer que la ilusión no basta para construir confianza', 'tomar distancia antes de repetir un patrón que ya identificó', 'hablar con honestidad aunque la conversación resulte incómoda', 'defender su ritmo sin pedir permiso para ir más despacio']
    }
  },
  parejas: {
    normal: {
      contexts: ['al cocinar juntos una receta desconocida', 'al organizar una escapada con poco presupuesto', 'durante un juego cooperativo que empieza a complicarse', 'al elegir la decoración de un espacio compartido', 'en una tarde sin internet', 'al preparar un regalo hecho a mano', 'durante una caminata por un lugar nuevo', 'al escoger una serie para ver juntos', 'al planear una sorpresa que requiere coordinación', 'durante una compra donde cada quien lleva una lista distinta'],
      actions: ['proponer una solución absurda que termina funcionando', 'dejar que la otra persona enseñe algo que domina', 'negociar una preferencia sin convertirla en competencia', 'reconocer que olvidó un detalle del plan', 'inventar una pequeña tradición para repetir otro día', 'hacer una pausa para disfrutar del momento sin sacar fotos', 'pedir ayuda después de intentar resolverlo todo a solas', 'cambiar de opinión al escuchar una buena razón', 'celebrar un logro pequeño como si fuera una gran victoria', 'convertir un contratiempo en una anécdota compartida']
    },
    intimo: {
      contexts: ['cuando sus horarios apenas les permiten coincidir', 'al hablar de cómo les gusta recibir cariño', 'después de una semana de mucho estrés', 'cuando una fecha importante pasa casi desapercibida', 'al recordar el inicio de la relación', 'cuando uno necesita más tiempo a solas que el otro', 'al conversar sobre un proyecto que ilusiona solo a uno', 'cuando cambian sus necesidades de apoyo emocional', 'al descubrir una inseguridad que nunca habían mencionado', 'cuando una conversación pendiente lleva días posponiéndose'],
      actions: ['explicar qué gesto le hace sentirse querido sin exigir adivinaciones', 'pedir compañía aclarando si necesita escucha o soluciones', 'reconocer que dio por sentado un esfuerzo de su pareja', 'hablar de un miedo sin acusar a la otra persona', 'preguntar cómo ha cambiado la forma de vivir la relación', 'decir qué espacio personal necesita para estar bien', 'agradecer una forma de cuidado que antes no entendía', 'admitir que algo le dolió aunque en el momento dijo que estaba bien', 'proponer un hábito para reconectar que ambos puedan mantener', 'escuchar una necesidad distinta sin interpretarla como falta de amor']
    },
    intenso: {
      contexts: ['si sus planes de vivir en otra ciudad no coinciden', 'si una decisión económica afecta a ambos y se toma unilateralmente', 'si una promesa importante se incumple varias veces', 'si aparecen celos por una amistad cercana', 'si una discusión termina siempre con días de silencio', 'si uno quiere convivir y el otro todavía no', 'si sus proyectos a largo plazo dejan de coincidir', 'si un límite de privacidad se cruza sin consentimiento', 'si las tareas compartidas se vuelven una fuente constante de resentimiento', 'si una reconciliación exige cambios que aún no se han demostrado'],
      actions: ['expresar sus condiciones para continuar sin recurrir a amenazas', 'aceptar que amar a alguien no elimina todas las incompatibilidades', 'pedir acuerdos concretos que puedan revisar juntos', 'reconocer su responsabilidad sin usar los errores de la otra persona como excusa', 'proponer una pausa acordada para hablar con más claridad', 'mantener un límite aunque tema que cambie la relación', 'diferenciar una disculpa de una reparación sostenida', 'escuchar una respuesta dolorosa sin intentar imponer otra', 'buscar apoyo externo de mutuo acuerdo cuando no logran entenderse', 'decidir qué está dispuesto a cambiar y qué pertenece a sus valores esenciales']
    }
  }
};
// Cambios por frase, no conjugador automático: las formas de otras personas
// (por ejemplo «qué recuerdo le gustaría a cada persona») se conservan.
const actionForms = [
  ['en su momento', 'en aquel momento', 'en aquel momento'],
  ['que no le interesa', 'que no me interesa', 'que no te interesa'],
  ['ambos puedan mantener', 'ambos podamos mantener', 'tú y tu pareja puedan mantener'],
  ['que puedan revisar juntos', 'que podamos revisar juntos', 'que tú y tu pareja puedan revisar juntos'],
  ['cuando no logran entenderse', 'cuando no logramos entendernos', 'cuando no logras entenderte con tu pareja'],
  ['normalmente prefiera', 'normalmente prefiera', 'normalmente prefieras'],
  ['que olvidó', 'que olvidé', 'que olvidaste'],
  ['que podía hacerlo', 'que podía hacerlo', 'que podías hacerlo'],
  ['que tenía a mano', 'que tenía a mano', 'que tenías a mano'],
  ['que entendió', 'que entendí', 'que entendiste'],
  ['qué necesita', 'qué necesito', 'qué necesitas'],
  ['sentirse', 'sentirme', 'sentirte'],
  ['que sintió', 'que sentí', 'que sentiste'],
  ['que suele esconder', 'que suelo esconder', 'que sueles esconder'],
  ['si ha hecho', 'si he hecho', 'si has hecho'],
  ['aunque tema', 'aunque tema', 'aunque temas'],
  ['que necesita', 'que necesito', 'que necesitas'],
  ['dio por sentada', 'di por sentada', 'diste por sentada'],
  ['que extraña', 'que extraño', 'que extrañas'],
  ['aunque pierda', 'aunque pierda', 'aunque pierdas'],
  ['siempre ha seguido', 'siempre he seguido', 'siempre has seguido'],
  ['que sabe hacer', 'que sé hacer', 'que sabes hacer'],
  ['que confundió', 'que confundí', 'que confundiste'],
  ['no sabía reconocer', 'no sabía reconocer', 'no sabías reconocer'],
  ['le resulta difícil', 'me resulta difícil', 'te resulta difícil'],
  ['que le escuchen', 'que me escuchen', 'que te escuchen'],
  ['que ha cambiado de opinión', 'que he cambiado de opinión', 'que has cambiado de opinión'],
  ['que no sabe cómo', 'que no sé cómo', 'que no sabes cómo'],
  ['a la suya', 'a la mía', 'a la tuya'],
  ['qué le hace', 'qué me hace', 'qué te hace'],
  ['porque descubre', 'porque descubro', 'porque descubres'],
  ['que le interesa', 'que me interesa', 'que te interesa'],
  ['reírse', 'reírme', 'reírte'],
  ['qué le apetece', 'qué me apetece', 'qué te apetece'],
  ['atreverse', 'atreverme', 'atreverte'],
  ['antes de comprometerse', 'antes de comprometerme', 'antes de comprometerte'],
  ['que está a gusto', 'que estoy a gusto', 'que estás a gusto'],
  ['preguntarse', 'preguntarme', 'preguntarte'],
  ['qué deseo es propio', 'qué deseo es mío', 'qué deseo es tuyo'],
  ['le costaba expresar', 'me costaba expresar', 'te costaba expresar'],
  ['de atención le hace', 'de atención me hace', 'de atención te hace'],
  ['aunque le dé miedo', 'aunque me dé miedo', 'aunque te dé miedo'],
  ['que desea', 'que deseo', 'que deseas'],
  ['no está dispuesto', 'no estoy dispuesto', 'no estás dispuesto'],
  ['que debe ganarse', 'que debo ganarme', 'que debes ganarte'],
  ['que ya identificó', 'que ya identifiqué', 'que ya identificaste'],
  ['qué gesto le hace', 'qué gesto me hace', 'qué gesto te hace'],
  ['si necesita escucha', 'si necesito escucha', 'si necesitas escucha'],
  ['que dio por sentado', 'que di por sentado', 'que diste por sentado'],
  ['personal necesita', 'personal necesito', 'personal necesitas'],
  ['antes no entendía', 'antes no entendía', 'antes no entendías'],
  ['algo le dolió', 'algo me dolió', 'algo te dolió'],
  ['el momento dijo', 'el momento dije', 'el momento dijiste'],
  ['que estaba bien', 'que estaba bien', 'que estabas bien'],
  ['qué está dispuesto', 'qué estoy dispuesto', 'qué estás dispuesto']
];
function actionFor(text, person) {
  let result = text;
  for (const [original, first, second] of actionForms) result = result.replaceAll(original, person === 1 ? first : second);
  // En las acciones, todos los posesivos remiten a quien juega.
  return result.replace(/\bsus\b/g, person === 1 ? 'mis' : 'tus').replace(/\bsu\b/g, person === 1 ? 'mi' : 'tu')
    .replaceAll('me hace sentirme', 'me hace sentir').replaceAll('te hace sentirte', 'te hace sentir');
}
const contextForms = [
  ['al reencontrarse', 'al reencontrarme', 'al reencontrarte'],
  ['si descubre una mentira', 'si descubro una mentira', 'si descubres una mentira'],
  ['si recibe presión', 'si recibo presión', 'si recibes presión'],
  ['por su cuenta', 'por mi cuenta', 'por tu cuenta'],
  ['solo conoce', 'solo conozco', 'solo conoces'],
  ['al apuntarse', 'al apuntarme', 'al apuntarte'],
  ['todos sus amigos', 'todos mis amigos', 'todos tus amigos'],
  ['descubrir que disfruta más de su independencia', 'descubrir que disfruto más de mi independencia', 'descubrir que disfrutas más de tu independencia'],
  ['pregunta qué busca', 'pregunta qué busco', 'pregunta qué buscas'],
  ['notar que sigue comparando', 'notar que sigo comparando', 'notar que sigues comparando'],
  ['cuando recibe atención de alguien que no le interesa', 'cuando recibo atención de alguien que no me interesa', 'cuando recibes atención de alguien que no te interesa'],
  ['que todavía conoce poco', 'que todavía conozco poco', 'que todavía conoces poco'],
  ['como esperaba', 'como esperaba', 'como esperabas'],
  ['de su vida compartir', 'de mi vida compartir', 'de tu vida compartir'],
  ['a la que busca', 'a la que busco', 'a la que buscas'],
  ['si descubre que una cita', 'si descubro que una cita', 'si descubres que una cita'],
  ['si siente presión', 'si siento presión', 'si sientes presión'],
  ['su amabilidad', 'mi amabilidad', 'tu amabilidad'],
  ['que no comparte', 'que no comparto', 'que no compartes'],
  ['que le gusta', 'que me gusta', 'que te gusta'],
  ['si recibe mensajes', 'si recibo mensajes', 'si recibes mensajes'],
  ['si empieza a abandonar sus proyectos', 'si empiezo a abandonar mis proyectos', 'si empiezas a abandonar tus proyectos'],
  ['sus horarios apenas les permiten', 'nuestros horarios apenas nos permiten', 'sus horarios apenas les permiten'],
  ['cómo les gusta', 'cómo nos gusta', 'cómo les gusta'],
  ['cambian sus necesidades', 'cambian nuestras necesidades', 'cambian sus necesidades'],
  ['nunca habían mencionado', 'nunca habíamos mencionado', 'nunca habían mencionado'],
  ['sus planes de vivir', 'nuestros planes de vivir', 'sus planes de vivir'],
  ['sus proyectos a largo', 'nuestros proyectos a largo', 'sus proyectos a largo']
];
function contextFor(text, person) {
  let result = text;
  for (const [original, first, second] of contextForms) result = result.replaceAll(original, person === 1 ? first : second);
  if (person === 2) result = result.replaceAll('sus horarios apenas les permiten', 'los horarios de tu pareja y los tuyos apenas les permiten').replaceAll('sus necesidades', 'las necesidades de tu pareja o las tuyas').replaceAll('sus planes de vivir en otra ciudad', 'tus planes de mudanza y los de tu pareja').replaceAll('sus proyectos', 'los proyectos de tu pareja y los tuyos');
  return result.replace(/^si /, 'cuando ');
}
function personalExperience(action) {
  const firstSpace = action.indexOf(' ');
  const infinitive = action.slice(0, firstSpace);
  const rest = action.slice(firstSpace)
    .replace('y hablarlo', 'y he hablado de ello')
    .replace('y convertirlo', 'y lo he convertido')
    .replace('y acabar descubriendo', 'y he acabado descubriendo')
    .replace('y aceptar que', 'y he aceptado que');
  const irregular = { hacer: 'hecho', decir: 'dicho', poner: 'puesto', proponer: 'propuesto', descubrir: 'descubierto', volver: 'vuelto', resolver: 'resuelto' };
  const reflexive = infinitive.endsWith('me');
  const verb = reflexive ? infinitive.slice(0, -2) : infinitive;
  const participle = verb === 'reír' ? 'reído' : irregular[verb] || verb.slice(0, -2) + (verb.endsWith('ar') ? 'ado' : 'ido');
  return `Nunca nunca ${reflexive ? 'me he' : 'he'} ${participle}${rest}`;
}
const bank = { never: {}, whatif: {}, likely: {} };
for (const [audience, levels] of Object.entries(specs)) {
  for (const game of Object.keys(bank)) bank[game][audience] = {};
  for (const [level, { contexts, actions }] of Object.entries(levels)) {
    const situations = actions.flatMap(action => contexts.map(context => `${action} ${context}`));
    bank.never[audience][level] = actions.flatMap(action => contexts.map(context => `${personalExperience(actionFor(action, 1))}, ${contextFor(context, 1)}.`));
    bank.whatif[audience][level] = actions.flatMap(action => contexts.map(context => `¿Qué pasaría si tuvieras que ${actionFor(action, 2)} ${contextFor(context, 2)}? ¿Cómo actuarías?`));
    bank.likely[audience][level] = situations.map(s => `¿Quién es más probable que decida ${s}?`);
  }
}
const all = [];
for (const [game, audiences] of Object.entries(bank)) for (const [audience, levels] of Object.entries(audiences)) for (const [level, items] of Object.entries(levels)) {
  if (items.length !== 100 || new Set(items).size !== 100) throw new Error(`Banco incorrecto: ${game}/${audience}/${level}`);
  all.push(...items);
}
if (all.length !== 3600 || new Set(all).size !== 3600) throw new Error('Conteo o duplicados globales incorrectos');
if (all.some(q => /he presenciado|una persona de este grupo tuviera|en mi momento|en tu momento|he ponido|he proponido|he descubrido/.test(q))) throw new Error('Regresión de redacción');
const output = '// Banco en español. 3 juegos × 4 públicos × 3 niveles × 100 situaciones.\n// Se puede omitir cualquier pregunta; «intenso» aumenta el conflicto emocional, no implica contenido explícito.\nexport const QUESTION_BANK = ' + JSON.stringify(bank, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'questions.js'), output, 'utf8');
console.log(JSON.stringify({ total: all.length, unique: new Set(all).size, combinations: 36, perCombination: 100 }));
