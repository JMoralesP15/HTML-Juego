/* QUÉ AÑO v1.8 — revisión factual manual, lote 1.
 * Estas seis entradas se revisaron contra fuentes institucionales/primarias específicas.
 * El objetivo es aclarar qué fecha pregunta el juego, no rellenar campos por cobertura.
 */
const V18_MANUAL_FACTS={
  qrcode:{
    fact:'DENSO WAVE desarrolló el QR Code en 1994 para responder a necesidades de control y lectura rápida en manufactura.',
    context:'El proyecto había comenzado en 1992. Masahiro Hara lideró un pequeño equipo que buscaba un código compacto, capaz de almacenar más información que un código de barras y de localizarse rápidamente mediante patrones de posición.',
    significance:'La fecha de 1994 corresponde al desarrollo y lanzamiento del sistema original; su estandarización internacional llegó después.',
    sourceLabel:'DENSO WAVE · Historia del QR Code',
    source:'https://www.denso-wave.com/en/technology/vol1.html'
  },
  alphago:{
    fact:'AlphaGo derrotó a Lee Sedol por 4 partidas a 1 en Seúl en marzo de 2016.',
    context:'Lee Sedol había ganado 18 títulos mundiales. La serie fue seguida por más de 200 millones de personas; en la segunda partida, la llamada jugada 37 de AlphaGo destacó por ser una elección extremadamente improbable en partidas humanas.',
    significance:'La pregunta se refiere a la serie contra Lee Sedol, no a victorias anteriores de AlphaGo ni a sus sucesores AlphaZero y MuZero.',
    sourceLabel:'Google DeepMind · AlphaGo',
    source:'https://deepmind.google/research/alphago/'
  },
  platetectonics:{
    fact:'En 1967 trabajos como el de Dan McKenzie y Robert Parker ayudaron a formalizar el movimiento de áreas rígidas como placas sobre una esfera.',
    context:'McKenzie y Parker publicaron en Nature el 30 de diciembre de 1967 un modelo en que regiones asísmicas se desplazaban como placas rígidas sobre la superficie terrestre, integrando observaciones oceánicas y movimientos relativos en una formulación geométrica coherente.',
    significance:'1967 no es el año de una única “invención” de la tectónica de placas: es un punto de consolidación de una teoría construida a partir de deriva continental, expansión del fondo oceánico y nueva geofísica.',
    sourceLabel:'Nature · McKenzie y Parker (1967)',
    source:'https://www.nature.com/articles/2161276a0'
  },
  pcr:{
    fact:'Kary Mullis concibió el principio de la PCR en 1983 y realizó sus primeros experimentos ese mismo año.',
    context:'Mullis situó su primer ensayo en septiembre de 1983 y recordó un primer resultado exitoso en diciembre. Los trabajos que difundieron la técnica aparecieron después, en 1985, por lo que 1983 responde a la concepción y desarrollo inicial, no a su primera publicación.',
    significance:'La distinción entre concepción, primer experimento y publicación evita fechar la PCR en 1985 cuando la pregunta pide específicamente cuándo Mullis concibió la idea.',
    sourceLabel:'Nobel Prize · Kary Mullis, Nobel Lecture',
    source:'https://www.nobelprize.org/prizes/chemistry/1993/mullis/lecture/'
  },
  firstexoplanet:{
    fact:'Aleksander Wolszczan anunció en 1992 dos planetas alrededor del púlsar PSR B1257+12.',
    context:'Esos mundos orbitaban una estrella de neutrones, no una estrella similar al Sol. NASA distingue este hallazgo de 51 Pegasi b, anunciado en 1995 y ampliamente reconocido como el primer exoplaneta descubierto alrededor de una estrella normal.',
    significance:'La pregunta usa 1992 para los primeros planetas extrasolares confirmados alrededor de un púlsar; 1995 corresponde al hito distinto de un planeta alrededor de una estrella de tipo solar.',
    sourceLabel:'NASA Science · Los primeros exoplanetas',
    source:'https://science.nasa.gov/universe/exoplanets/will-the-real-first-exoplanet-please-stand-up/'
  },
  homonaledi:{
    fact:'Homo naledi fue descrito y anunciado como una nueva especie en 2015 a partir del conjunto fósil de la cueva Rising Star, en Sudáfrica.',
    context:'Los primeros fósiles de la cámara Dinaledi se localizaron en 2013 y se recuperaron más de 1.550 especímenes de al menos 15 individuos. El anuncio científico de la nueva especie se realizó el 10 de septiembre de 2015; la datación de los restos entre unos 335.000 y 236.000 años llegó en 2017.',
    significance:'2015 corresponde a la descripción y anuncio de Homo naledi como nueva especie, no al primer hallazgo físico de los fósiles, que comenzó dos años antes.',
    sourceLabel:'Smithsonian Human Origins · Homo naledi',
    source:'https://humanorigins.si.edu/research/whats-hot-human-origins/welcome-new-member-our-family-tree'
  }
};
for(const q of QUESTIONS){
  const patch=V18_MANUAL_FACTS[q.id];
  if(!patch)continue;
  Object.assign(q,patch);
  q.editorialVerified=true;
  q.editorialReviewState='verified';
  q.editorialVerificationVersion='v1.8-manual-batch-1';
}
window.__QA_V18_MANUAL_FACTS__=Object.freeze({version:'1.8.0-beta.1',ids:Object.freeze(Object.keys(V18_MANUAL_FACTS))});
