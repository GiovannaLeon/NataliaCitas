export type LookingForOption = 'Hombre busca mujeres' | 'Mujer busca hombres' | 'Hombre busca hombres' | 'Mujer busca mujeres';

export type CandidateProfile = {
  slug: string;
  name: string;
  age: number;
  city: string;
  district: string;
  status: string;
  intro: string;
  accent: string;
  headline: string;
  lookingFor: string;
  discretionStyle: string;
  occupation: string;
  height: string;
  responseTime: string;
  lastSeen: string;
  about: string[];
  interests: string[];
  idealPlan: string[];
  boundaries: string[];
  prompts: Array<{ question: string; answer: string }>;
};

export type ChatMessage = {
  from: 'candidate' | 'me';
  text: string;
  time: string;
};

export const FEMALE_CANDIDATES: CandidateProfile[] = [
  {
    slug: 'valeria',
    name: 'Valeria',
    age: 29,
    city: 'Lima',
    district: 'Miraflores',
    status: 'Disponible ahora',
    intro: 'Le gustan las conversaciones discretas con chispa y humor.',
    accent: 'sunset',
    headline: 'Sutil, elegante y directa cuando siente quimica.',
    lookingFor: 'Conversaciones privadas con tension real y cero drama.',
    discretionStyle: 'Cuida mucho su privacidad y avanza solo si hay confianza.',
    occupation: 'Direccion creativa freelance',
    height: '1.67 m',
    responseTime: 'Responde en menos de 15 minutos por la noche.',
    lastSeen: 'Activa hoy, 21:12',
    about: [
      'Le atraen los perfiles que saben conversar sin exagerar y que entienden el valor de la discrecion.',
      'Prefiere empezar por mensajes con ritmo, humor y curiosidad antes de decidir si quiere verse en persona.',
    ],
    interests: ['Cocteles tranquilos', 'Hoteles boutique', 'Humor inteligente', 'Arte contemporaneo'],
    idealPlan: ['Romper el hielo por chat', 'Elegir un lugar sobrio', 'Mantener siempre el control del ritmo'],
    boundaries: ['No comparte datos personales al inicio', 'No acepta presion', 'No tolera groserias'],
    prompts: [
      { question: 'La mejor primera impresion para mi es...', answer: 'una persona segura, breve y con intencion.' },
      { question: 'Si conectamos, lo primero que notaras es...', answer: 'que se escuchar y responder con picardia.' },
    ],
  },
  {
    slug: 'camila',
    name: 'Camila',
    age: 32,
    city: 'Lima',
    district: 'San Isidro',
    status: 'Responde en minutos',
    intro: 'Prefiere planes elegantes, cenas largas y mensajes directos.',
    accent: 'wine',
    headline: 'Refinada, clara y con gusto por la tension bien llevada.',
    lookingFor: 'Una conexion adulta, reservada y sin juegos confusos.',
    discretionStyle: 'Valora la transparencia y el respeto desde el primer mensaje.',
    occupation: 'Consultoria financiera',
    height: '1.70 m',
    responseTime: 'Muy activa de 7 p.m. a 11 p.m.',
    lastSeen: 'En linea hace 3 minutos',
    about: [
      'Disfruta los mensajes concretos y las personas que saben sostener una conversacion con estilo.',
      'No busca ruido ni promesas vacias; le importa la coherencia entre lo que se dice y lo que se hace.',
    ],
    interests: ['Vino tinto', 'Jazz suave', 'Cenas tardias', 'Viajes espontaneos'],
    idealPlan: ['Un primer chat breve', 'Una cena sin interrupciones', 'Quimica por encima de apariencias'],
    boundaries: ['No acepta insistencia invasiva', 'No envía fotos sensibles', 'No tolera mentiras evidentes'],
    prompts: [
      { question: 'Mi tipo de mensaje favorito es...', answer: 'directo, elegante y con una propuesta clara.' },
      { question: 'Lo que me hace perder interes rapido es...', answer: 'la urgencia sin contexto y la falta de educacion.' },
    ],
  },
  {
    slug: 'luciana',
    name: 'Luciana',
    age: 27,
    city: 'Lima',
    district: 'Barranco',
    status: 'Nueva coincidencia',
    intro: 'Busca una conexion intensa sin perder la discrecion.',
    accent: 'forest',
    headline: 'Intensa, curiosa y con energia dificil de ignorar.',
    lookingFor: 'Quimica inmediata con conversaciones que no se sientan vacias.',
    discretionStyle: 'Reserva sus detalles personales hasta sentir una señal clara.',
    occupation: 'Fotografia y contenido editorial',
    height: '1.64 m',
    responseTime: 'Mas activa los fines de semana.',
    lastSeen: 'Nueva hoy',
    about: [
      'Le gustan las personas observadoras, con iniciativa y capaces de proponer algo distinto.',
      'Puede ser juguetona en el chat, pero aprecia los limites y el cuidado mutuo.',
    ],
    interests: ['Fotografia nocturna', 'Bares pequenos', 'Moda', 'Escapadas urbanas'],
    idealPlan: ['Mensajes con chispa', 'Cita breve para medir energia', 'Mantener siempre discrecion'],
    boundaries: ['Nada de insistir por redes personales', 'No acepta faltas de respeto', 'No improvisa encuentros'],
    prompts: [
      { question: 'Una senal de quimica para mi es...', answer: 'cuando la conversacion se vuelve inevitable.' },
      { question: 'Lo mas atractivo en alguien es...', answer: 'que sepa leer el ambiente y no fuerce nada.' },
    ],
  },
  {
    slug: 'renata',
    name: 'Renata',
    age: 30,
    city: 'Lima',
    district: 'La Molina',
    status: 'Le interesa chatear',
    intro: 'Disfruta empezar por chat antes de pasar a una cita privada.',
    accent: 'midnight',
    headline: 'Serena al inicio, muy intensa cuando se siente segura.',
    lookingFor: 'Una conversacion privada con ritmo, humor y respeto.',
    discretionStyle: 'Necesita confianza antes de moverse fuera de la plataforma.',
    occupation: 'Arquitectura interior',
    height: '1.68 m',
    responseTime: 'Responde mejor por las tardes.',
    lastSeen: 'Activa hace 20 minutos',
    about: [
      'Prefiere construir una conexion por mensajes antes de cualquier encuentro.',
      'Le atrae la constancia y una energia tranquila, sin necesidad de exagerar.',
    ],
    interests: ['Diseno', 'Cafes silenciosos', 'Series thriller', 'Escapadas de fin de semana'],
    idealPlan: ['Hablar con calma', 'Conocer intenciones', 'Pasar a una cita privada solo si todo fluye'],
    boundaries: ['No responde a mensajes agresivos', 'No comparte ubicacion temprano', 'No acepta presion emocional'],
    prompts: [
      { question: 'Lo que mas me gusta de un buen chat es...', answer: 'sentir que hay tension sin perder elegancia.' },
      { question: 'Mi ritmo ideal es...', answer: 'sin apuro, pero con interes claro.' },
    ],
  },
];

export const MALE_CANDIDATES: CandidateProfile[] = [
  {
    slug: 'sebastian',
    name: 'Sebastian',
    age: 31,
    city: 'Lima',
    district: 'Miraflores',
    status: 'Disponible ahora',
    intro: 'Le interesan las conversaciones discretas y los encuentros sin drama.',
    accent: 'sunset',
    headline: 'Seguro, reservado y con una calma que engancha.',
    lookingFor: 'Una conexion privada con quimica desde el primer intercambio.',
    discretionStyle: 'Mantiene todo dentro de la plataforma hasta sentir verdadera compatibilidad.',
    occupation: 'Estrategia comercial',
    height: '1.82 m',
    responseTime: 'Responde rapido por las noches.',
    lastSeen: 'En linea ahora',
    about: [
      'Valora una conversacion que empiece con curiosidad y no con prisa.',
      'Le interesan los perfiles que entienden la discrecion como parte del atractivo.',
    ],
    interests: ['Lounges discretos', 'Whisky', 'Hoteles urbanos', 'Arte'],
    idealPlan: ['Conectar por chat', 'Crear complicidad', 'Definir una cita con total reserva'],
    boundaries: ['No comparte numeros de inmediato', 'No tolera mentiras', 'No entra en dinamicas invasivas'],
    prompts: [
      { question: 'Lo que me hace responder al instante es...', answer: 'una mezcla de misterio y claridad.' },
      { question: 'Mi punto debil es...', answer: 'la inteligencia emocional bien usada.' },
    ],
  },
  {
    slug: 'mateo',
    name: 'Mateo',
    age: 34,
    city: 'Lima',
    district: 'San Isidro',
    status: 'Responde en minutos',
    intro: 'Prefiere planes elegantes, humor afinado y mucha quimica por chat.',
    accent: 'wine',
    headline: 'Sobrio, interesante y con gusto por los buenos detalles.',
    lookingFor: 'Alguien que disfrute lo selecto sin volverlo complicado.',
    discretionStyle: 'Muy cuidadoso con el contexto y los tiempos de cada paso.',
    occupation: 'Abogacia corporativa',
    height: '1.80 m',
    responseTime: 'Activa las notificaciones privadas por la noche.',
    lastSeen: 'Activo hace 6 minutos',
    about: [
      'Le atraen las conversaciones donde hay estilo, ironia y una intencion bien puesta.',
      'No busca cantidad, sino una conexion precisa y muy bien llevada.',
    ],
    interests: ['Cocina de autor', 'Bossa nova', 'Vinos', 'Viajes breves'],
    idealPlan: ['Chat breve y directo', 'Encuentro en lugar sobrio', 'Mantener todo con perfil bajo'],
    boundaries: ['No acepta agresividad', 'No improvisa encuentros', 'No comparte informacion sensible'],
    prompts: [
      { question: 'Un mensaje que siempre funciona conmigo es...', answer: 'uno breve, seguro y sin poses.' },
      { question: 'Si hay quimica, se nota porque...', answer: 'la conversacion se vuelve natural desde el inicio.' },
    ],
  },
  {
    slug: 'adrian',
    name: 'Adrian',
    age: 28,
    city: 'Lima',
    district: 'Barranco',
    status: 'Nueva coincidencia',
    intro: 'Busca una conexion intensa, reservada y sin vueltas innecesarias.',
    accent: 'forest',
    headline: 'Magnetico, curioso y con energia muy presente.',
    lookingFor: 'Quimica rapida con libertad para ir ajustando el ritmo.',
    discretionStyle: 'No mezcla esta vida con su circulo personal.',
    occupation: 'Produccion audiovisual',
    height: '1.78 m',
    responseTime: 'Mas activo entre jueves y domingo.',
    lastSeen: 'Nueva coincidencia de hoy',
    about: [
      'Le gusta sentir tension desde el primer intercambio, pero sin teatralidad.',
      'Aprecia la naturalidad y la autenticidad antes que cualquier pose.',
    ],
    interests: ['Conciertos pequenos', 'Cocteles', 'Moda', 'Cine'],
    idealPlan: ['Coquetear por chat', 'Proponer algo simple', 'Dejar que la energia marque el ritmo'],
    boundaries: ['No comparte su rutina', 'No acepta grabaciones ni capturas', 'No fuerza encuentros'],
    prompts: [
      { question: 'Lo que mas me despierta interes es...', answer: 'una persona que no necesita exagerar para provocar.' },
      { question: 'Mi estilo de conexion es...', answer: 'intenso, pero siempre consciente del limite.' },
    ],
  },
  {
    slug: 'thiago',
    name: 'Thiago',
    age: 33,
    city: 'Lima',
    district: 'La Molina',
    status: 'Le interesa chatear',
    intro: 'Disfruta empezar por mensajes antes de pasar a una cita privada.',
    accent: 'midnight',
    headline: 'Paciente, elegante y muy atento a las senales.',
    lookingFor: 'Una conversacion con profundidad, deseo y cero exposicion innecesaria.',
    discretionStyle: 'Necesita construir confianza antes de avanzar.',
    occupation: 'Tecnologia y producto digital',
    height: '1.84 m',
    responseTime: 'Mas activo por las tardes y madrugadas.',
    lastSeen: 'Activo hace 18 minutos',
    about: [
      'Le gustan los chats que progresan sin brusquedad y con bastante lectura emocional.',
      'Prefiere conocer intenciones y limites antes de sugerir un encuentro.',
    ],
    interests: ['Arquitectura', 'Series oscuras', 'Cafe', 'Escapadas de carretera'],
    idealPlan: ['Hablar varios dias', 'Compartir intereses', 'Decidir una cita muy cuidada'],
    boundaries: ['No cruza limites sin acuerdo', 'No mezcla vida laboral', 'No tolera perfiles falsos'],
    prompts: [
      { question: 'Lo que me hace quedarme en un chat es...', answer: 'sentir una combinacion de inteligencia y deseo.' },
      { question: 'Mi regla mas importante es...', answer: 'la discrecion siempre va primero.' },
    ],
  },
];

export const ALL_CANDIDATES = [...FEMALE_CANDIDATES, ...MALE_CANDIDATES];

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  valeria: [
    { from: 'candidate', text: 'Hola, me gusto tu perfil. Prefieres conversar aqui o por privado mas tarde?', time: '19:08' },
    { from: 'me', text: 'Podemos empezar aqui. Me interesa conocerte con calma.', time: '19:10' },
    { from: 'candidate', text: 'Perfecto. Yo tambien busco una conexion discreta pero real.', time: '19:11' },
  ],
  camila: [
    { from: 'candidate', text: 'Me gustan las conversaciones claras. Que tipo de plan te atrae mas?', time: '18:42' },
    { from: 'me', text: 'Algo elegante, relajado y sin demasiado ruido.', time: '18:46' },
  ],
  luciana: [{ from: 'candidate', text: 'Estoy libre esta noche para hablar un rato. Te animas?', time: '20:03' }],
  renata: [
    { from: 'candidate', text: 'Prefiero conocerte primero por aqui antes de pasar a otra cosa.', time: '17:55' },
    { from: 'me', text: 'Me parece bien. Vamos con calma.', time: '17:57' },
  ],
  sebastian: [
    { from: 'candidate', text: 'Hola. Vi tu perfil y me dio curiosidad conocerte mejor. Como te gusta empezar una conversacion?', time: '19:06' },
    { from: 'me', text: 'Con calma y con un poco de misterio. Me gusta cuando hay tension desde el inicio.', time: '19:09' },
  ],
  mateo: [{ from: 'candidate', text: 'Si te gustan los planes discretos, creo que podemos entendernos muy bien.', time: '18:44' }],
  adrian: [{ from: 'candidate', text: 'Estoy libre esta noche. Si quieres, empezamos por aqui y vemos si fluye.', time: '20:02' }],
  thiago: [
    { from: 'candidate', text: 'Me gusta ir despacio, pero cuando conecto de verdad, se nota.', time: '17:54' },
    { from: 'me', text: 'Entonces vamos bien. Yo tambien prefiero sentir la conexion primero.', time: '17:58' },
  ],
};

export function getCandidatesForLookingFor(lookingFor: LookingForOption): CandidateProfile[] {
  return lookingFor === 'Mujer busca hombres' || lookingFor === 'Hombre busca hombres' ? MALE_CANDIDATES : FEMALE_CANDIDATES;
}

export function getMatchListLabel(lookingFor: LookingForOption): 'Candidatos' | 'Candidatas' {
  return lookingFor === 'Mujer busca hombres' || lookingFor === 'Hombre busca hombres' ? 'Candidatos' : 'Candidatas';
}

export function getCandidateBySlug(slug: string): CandidateProfile | undefined {
  return ALL_CANDIDATES.find((candidate) => candidate.slug === slug);
}

export function inferLookingForFromSlug(slug: string): LookingForOption {
  if (MALE_CANDIDATES.some((candidate) => candidate.slug === slug)) {
    return 'Mujer busca hombres';
  }

  return 'Hombre busca mujeres';
}
