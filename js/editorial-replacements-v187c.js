/* QUÉ AÑO v1.8.7-c — human-review replacement proposals. Review-only: never auto-publish. */
(function(){
'use strict';
const w=(title,prompt,fact,year,category,region,entity,source,rationale,preservesCategory=true,duplicateRisk=[])=>({title,prompt,fact,year,category,region,entity,sourceLabel:'Referencia inicial para revisión',source,rationale,preservesYear:true,preservesCategory,duplicateRisk,reviewRequired:true});
const R={
  estallido2019:[
    w('Acuerdo por la Paz y la Nueva Constitución','¿En qué año se firmó en Chile el Acuerdo por la Paz y la Nueva Constitución?','El acuerdo político que abrió un proceso constituyente fue firmado en noviembre de 2019.',2019,'Chile','Chile','acuerdo-paz-nueva-constitucion','https://es.wikipedia.org/wiki/Acuerdo_por_la_Paz_Social_y_la_Nueva_Constituci%C3%B3n','Es un hito chileno concreto y fechable, directamente reconocible por sus consecuencias institucionales.'),
    w('Inauguración de la Línea 3 del Metro de Santiago','¿En qué año comenzó a operar la Línea 3 del Metro de Santiago?','La Línea 3 del Metro de Santiago fue inaugurada en enero de 2019.',2019,'Chile','Chile','linea-3-metro-santiago','https://es.wikipedia.org/wiki/L%C3%ADnea_3_del_Metro_de_Santiago','Es un cambio urbano tangible y cotidiano, menos ambiguo como pregunta de año.')
  ],
  usb:[
    w('Hotmail','¿En qué año se lanzó Hotmail?','Hotmail se lanzó en 1996 y ayudó a popularizar el correo electrónico accesible desde la Web.',1996,'Tecnología','Estados Unidos','hotmail','https://es.wikipedia.org/wiki/Outlook.com','Es más reconocible para cultura digital general que la fecha de una especificación técnica.'),
    w('Tamagotchi','¿En qué año apareció el Tamagotchi original en Japón?','Bandai lanzó el Tamagotchi en Japón en 1996 y convirtió la mascota virtual en un fenómeno mundial.',1996,'Cultura','Japón','tamagotchi','https://es.wikipedia.org/wiki/Tamagotchi','Tiene alta memorabilidad generacional y una fecha sencilla.',false,['tamagotchi'])
  ],
  mpesa:[
    w('Google Street View','¿En qué año Google lanzó Street View?','Google lanzó Street View en 2007 con imágenes panorámicas de calles navegables desde Google Maps.',2007,'Tecnología','Estados Unidos','google-street-view','https://es.wikipedia.org/wiki/Google_Street_View','Es una experiencia digital globalmente reconocible y fácil de asociar con un cambio de hábitos.'),
    w('Netflix comienza el streaming','¿En qué año Netflix comenzó a ofrecer streaming de video?','Netflix comenzó a ofrecer video por streaming en 2007, antes de transformarse en una plataforma global.',2007,'Tecnología','Estados Unidos','netflix-streaming','https://es.wikipedia.org/wiki/Netflix','Es muy reconocible, aunque existe riesgo de solapamiento con otro registro del banco.',true,['netflixstream'])
  ],
  upiindia:[
    w('Pokémon GO','¿En qué año se lanzó Pokémon GO?','Pokémon GO se lanzó en 2016 y llevó la realidad aumentada a una audiencia masiva mediante teléfonos móviles.',2016,'Videojuegos','Global','pokemon-go','https://es.wikipedia.org/wiki/Pok%C3%A9mon_GO','Fue un fenómeno global de calle y cultura pop, mucho más reconocible que una infraestructura de pagos.',false),
    w('Instagram Stories','¿En qué año Instagram lanzó Stories?','Instagram lanzó Stories en 2016, popularizando dentro de la plataforma las publicaciones que desaparecen después de 24 horas.',2016,'Tecnología','Global','instagram-stories','https://es.wikipedia.org/wiki/Instagram','Hito de uso cotidiano con alta familiaridad para público general.')
  ],
  fourhundredblows:[
    w('Some Like It Hot','¿En qué año se estrenó Some Like It Hot?','La comedia de Billy Wilder se estrenó en 1959 y se convirtió en un clásico del cine estadounidense.',1959,'Cine','Estados Unidos','some-like-it-hot','https://es.wikipedia.org/wiki/Some_Like_It_Hot','Clásico ampliamente reconocido fuera de circuitos cinéfilos especializados.'),
    w('Ben-Hur','¿En qué año se estrenó Ben-Hur, protagonizada por Charlton Heston?','Ben-Hur se estrenó en 1959 y ganó once premios Oscar.',1959,'Cine','Estados Unidos','ben-hur-1959','https://es.wikipedia.org/wiki/Ben-Hur_(pel%C3%ADcula_de_1959)','Su escala, premios y presencia en cultura popular la vuelven una referencia histórica más transversal.')
  ],
  battlealgiers:[
    w('El bueno, el malo y el feo','¿En qué año se estrenó El bueno, el malo y el feo?','El western de Sergio Leone se estrenó en 1966 y se convirtió en uno de los títulos más reconocibles del género.',1966,'Cine','Europa','good-bad-ugly','https://es.wikipedia.org/wiki/Il_buono,_il_brutto,_il_cattivo','Más transversal para cultura cinematográfica general.'),
    w('Star Trek llega a televisión','¿En qué año se estrenó la serie original de Star Trek?','Star Trek se estrenó en televisión en 1966 y dio origen a una de las franquicias de ciencia ficción más duraderas.',1966,'Cultura','Estados Unidos','star-trek-tv','https://es.wikipedia.org/wiki/Star_Trek:_The_Original_Series','Amplía el banco hacia televisión y cultura pop, con alto reconocimiento.',false)
  ],
  chungkingexpress:[
    w('Forrest Gump','¿En qué año se estrenó Forrest Gump?','Forrest Gump se estrenó en 1994 y se convirtió en uno de los mayores éxitos cinematográficos de la década.',1994,'Cine','Estados Unidos','forrest-gump','https://es.wikipedia.org/wiki/Forrest_Gump','Película de altísimo reconocimiento intergeneracional.'),
    w('The Shawshank Redemption','¿En qué año se estrenó The Shawshank Redemption?','The Shawshank Redemption se estrenó en 1994 y con el tiempo se convirtió en uno de los dramas más populares del cine estadounidense.',1994,'Cine','Estados Unidos','shawshank-redemption','https://es.wikipedia.org/wiki/The_Shawshank_Redemption','Referencia muy extendida en cultura popular y rankings de cine.')
  ],
  ytumama:[
    w('Shrek','¿En qué año se estrenó Shrek?','Shrek se estrenó en 2001 y convirtió la parodia de los cuentos de hadas en una franquicia mundial.',2001,'Cine','Estados Unidos','shrek','https://es.wikipedia.org/wiki/Shrek','Fenómeno masivo y altamente reconocible para varias generaciones.'),
    w('Harry Potter llega al cine','¿En qué año se estrenó la primera película de Harry Potter?','Harry Potter y la piedra filosofal llegó a los cines en 2001 y abrió una de las franquicias cinematográficas más grandes de su época.',2001,'Cine','Reino Unido','harry-potter-film','https://es.wikipedia.org/wiki/Harry_Potter_y_la_piedra_filosofal_(pel%C3%ADcula)','Amplia cultura pop occidental; revisar posible cercanía con el registro del libro.')
  ],
  roma:[
    w('Avengers: Infinity War','¿En qué año se estrenó Avengers: Infinity War?','Avengers: Infinity War se estrenó en 2018 y reunió a gran parte del universo cinematográfico de Marvel en un único evento.',2018,'Cine','Estados Unidos','avengers-infinity-war','https://es.wikipedia.org/wiki/Avengers:_Infinity_War','Fenómeno global de cultura pop con reconocimiento inmediato.'),
    w('Bohemian Rhapsody','¿En qué año se estrenó la película Bohemian Rhapsody?','Bohemian Rhapsody se estrenó en 2018 y volvió a llevar la música de Queen al centro de la cultura popular.',2018,'Cine','Reino Unido','bohemian-rhapsody-film','https://es.wikipedia.org/wiki/Bohemian_Rhapsody_(pel%C3%ADcula)','Cruza cine y música con alto reconocimiento general.')
  ],
  portraitladyfire:[
    w('Avengers: Endgame','¿En qué año se estrenó Avengers: Endgame?','Avengers: Endgame se estrenó en 2019 y se convirtió en un fenómeno mundial de taquilla.',2019,'Cine','Estados Unidos','avengers-endgame','https://es.wikipedia.org/wiki/Avengers:_Endgame','Uno de los hitos de cine comercial más reconocibles de la década.'),
    w('Joker','¿En qué año se estrenó Joker, protagonizada por Joaquin Phoenix?','Joker se estrenó en 2019 y se convirtió en un éxito global con una interpretación premiada de Joaquin Phoenix.',2019,'Cine','Estados Unidos','joker-2019','https://es.wikipedia.org/wiki/Joker_(pel%C3%ADcula)','Muy reconocible y fácil de asociar a su año.')
  ],
  rrr:[
    w('Top Gun: Maverick','¿En qué año se estrenó Top Gun: Maverick?','Top Gun: Maverick se estrenó en 2022 y se convirtió en uno de los grandes éxitos cinematográficos posteriores a la pandemia.',2022,'Cine','Estados Unidos','top-gun-maverick','https://es.wikipedia.org/wiki/Top_Gun:_Maverick','Secuela de enorme alcance popular y reconocimiento transversal.'),
    w('Everything Everywhere All at Once','¿En qué año se estrenó Everything Everywhere All at Once?','Everything Everywhere All at Once se estrenó en 2022 y luego ganó el Oscar a mejor película.',2022,'Cine','Estados Unidos','everything-everywhere','https://es.wikipedia.org/wiki/Everything_Everywhere_All_at_Once','Combina notoriedad crítica y popular sin depender de conocimiento especializado.')
  ],
  clubedaesquina:[
    w('The Rise and Fall of Ziggy Stardust','¿En qué año David Bowie publicó The Rise and Fall of Ziggy Stardust and the Spiders from Mars?','David Bowie publicó Ziggy Stardust en 1972 y consolidó a su personaje más famoso.',1972,'Música','Reino Unido','ziggy-stardust','https://es.wikipedia.org/wiki/The_Rise_and_Fall_of_Ziggy_Stardust_and_the_Spiders_from_Mars','Álbum canónico de rock con presencia amplia en cultura visual y musical.'),
    w('Exile on Main St.','¿En qué año The Rolling Stones publicaron Exile on Main St.?','The Rolling Stones publicaron Exile on Main St. en 1972, uno de los discos más celebrados de su carrera.',1972,'Música','Reino Unido','exile-main-st','https://es.wikipedia.org/wiki/Exile_on_Main_St.','Referencia de rock clásico más reconocible para cultura general occidental.')
  ],
  transeurope:[
    w('Saturday Night Fever','¿En qué año se publicó la banda sonora de Saturday Night Fever?','La banda sonora de Saturday Night Fever apareció en 1977 y ayudó a convertir la música disco en un fenómeno global.',1977,'Música','Estados Unidos','saturday-night-fever-soundtrack','https://es.wikipedia.org/wiki/Saturday_Night_Fever_(banda_sonora)','Hito musical y cinematográfico inmediatamente asociado a una época.'),
    w('Bat Out of Hell','¿En qué año Meat Loaf publicó Bat Out of Hell?','Bat Out of Hell fue publicado en 1977 y terminó convirtiéndose en uno de los álbumes más vendidos de la historia.',1977,'Música','Estados Unidos','bat-out-of-hell','https://es.wikipedia.org/wiki/Bat_Out_of_Hell','Dato de cultura musical masiva, menos especializado que el original.')
  ],
  recatacanes:[
    w('Amor prohibido','¿En qué año Selena publicó Amor prohibido?','Selena publicó Amor prohibido en 1994 y el álbum se convirtió en una referencia central de la música tejana y latina.',1994,'Música','Estados Unidos / México','amor-prohibido-selena','https://es.wikipedia.org/wiki/Amor_prohibido','Aumenta representación latina con una figura ampliamente reconocible.'),
    w('Dookie','¿En qué año Green Day publicó Dookie?','Green Day publicó Dookie en 1994 y llevó el punk rock californiano a una audiencia masiva.',1994,'Música','Estados Unidos','dookie','https://es.wikipedia.org/wiki/Dookie','Álbum muy reconocible de los años noventa y de mayor alcance general.')
  ],
  buenavista:[
    w('Homework','¿En qué año Daft Punk publicó Homework?','Daft Punk publicó Homework en 1997 y ayudó a llevar el house francés a una audiencia internacional.',1997,'Música','Francia','daft-punk-homework','https://es.wikipedia.org/wiki/Homework_(%C3%A1lbum)','Referencia electrónica de gran reconocimiento y fácil asociación temporal.'),
    w('Urban Hymns','¿En qué año The Verve publicó Urban Hymns?','The Verve publicó Urban Hymns en 1997, impulsado por el éxito mundial de Bitter Sweet Symphony.',1997,'Música','Reino Unido','urban-hymns','https://es.wikipedia.org/wiki/Urban_Hymns','Conecta un álbum con una canción ampliamente reconocible.')
  ],
  journeygame:[
    w('Candy Crush Saga','¿En qué año se lanzó Candy Crush Saga?','Candy Crush Saga se lanzó en 2012 y se convirtió en uno de los juegos móviles más masivos de la década.',2012,'Videojuegos','Global','candy-crush','https://es.wikipedia.org/wiki/Candy_Crush_Saga','Fenómeno móvil de enorme reconocimiento fuera del público gamer.'),
    w('Diablo III','¿En qué año se lanzó Diablo III?','Diablo III se lanzó en 2012 y fue uno de los mayores estrenos de videojuegos de ese año.',2012,'Videojuegos','Global','diablo-iii','https://es.wikipedia.org/wiki/Diablo_III','Franquicia de alcance masivo y hito fácil de fechar.')
  ],
  celeste:[
    w('Red Dead Redemption 2','¿En qué año se lanzó Red Dead Redemption 2?','Red Dead Redemption 2 se lanzó en 2018 y se convirtió en uno de los videojuegos más exitosos y comentados de su generación.',2018,'Videojuegos','Global','red-dead-redemption-2','https://es.wikipedia.org/wiki/Red_Dead_Redemption_2','Mayor reconocimiento general y comercial.'),
    w('God of War','¿En qué año se lanzó la nueva etapa de God of War ambientada en la mitología nórdica?','God of War se lanzó en 2018 y relanzó la serie con una nueva ambientación y una relación central entre Kratos y Atreus.',2018,'Videojuegos','Global','god-of-war-2018','https://es.wikipedia.org/wiki/God_of_War_(videojuego_de_2018)','Franquicia muy conocida y asociada con claridad a 2018.')
  ],
  hades:[
    w('Animal Crossing: New Horizons','¿En qué año se lanzó Animal Crossing: New Horizons?','Animal Crossing: New Horizons se lanzó en 2020 y se convirtió en un fenómeno cultural durante los primeros meses de la pandemia.',2020,'Videojuegos','Global','animal-crossing-new-horizons','https://es.wikipedia.org/wiki/Animal_Crossing:_New_Horizons','Cruza videojuegos y cultura cotidiana con una asociación temporal muy fuerte.'),
    w('Fall Guys','¿En qué año se lanzó Fall Guys?','Fall Guys se lanzó en 2020 y popularizó un formato de pruebas breves y multitudinarias con estética de programa de concursos.',2020,'Videojuegos','Global','fall-guys','https://es.wikipedia.org/wiki/Fall_Guys','Fenómeno accesible y reconocible incluso fuera del público especializado.')
  ],
  lotrbook:[
    w('El señor de las moscas','¿En qué año se publicó El señor de las moscas?','La novela El señor de las moscas, de William Golding, se publicó en 1954.',1954,'Cultura','Reino Unido','lord-of-the-flies','https://es.wikipedia.org/wiki/El_se%C3%B1or_de_las_moscas','Clásico escolar y cultural más compacto como hito de publicación.'),
    w('Godzilla','¿En qué año se estrenó la película original de Godzilla en Japón?','La película original de Godzilla se estrenó en Japón en 1954 y convirtió al monstruo en un icono mundial.',1954,'Cine','Japón','godzilla-1954','https://es.wikipedia.org/wiki/Godzilla_(pel%C3%ADcula_de_1954)','Icono global de cultura pop; cambia categoría de forma explícita.',false)
  ],
  pokemonanime:[
    w('South Park','¿En qué año se estrenó South Park?','South Park se estrenó en 1997 y se convirtió en una de las series animadas para adultos más duraderas de la televisión.',1997,'Cultura','Estados Unidos','south-park','https://es.wikipedia.org/wiki/South_Park','Referencia televisiva occidental de reconocimiento amplio.'),
    w('Teletubbies','¿En qué año se estrenó Teletubbies?','Teletubbies se estrenó en 1997 y se convirtió en un fenómeno infantil internacional.',1997,'Cultura','Reino Unido','teletubbies','https://es.wikipedia.org/wiki/Teletubbies','Muy reconocible, aunque existe un registro separado en el banco.',true,['teletubbies'])
  ],
  hamilton:[
    w('El vestido azul y negro / blanco y dorado','¿En qué año se volvió viral en Internet la discusión sobre el color de “The Dress”?','La fotografía conocida como The Dress se volvió viral en 2015 porque distintas personas percibían colores diferentes en la misma imagen.',2015,'Cultura','Global','the-dress-viral','https://es.wikipedia.org/wiki/El_vestido','Fenómeno de Internet masivo, fácil de recordar y útil para una categoría miscelánea.'),
    w('Star Wars: The Force Awakens','¿En qué año se estrenó Star Wars: The Force Awakens?','Star Wars volvió a los cines con The Force Awakens en 2015, iniciando una nueva trilogía.',2015,'Cine','Estados Unidos','force-awakens','https://es.wikipedia.org/wiki/Star_Wars:_Episodio_VII_-_El_despertar_de_la_Fuerza','Altísima notoriedad de cultura pop; cambia categoría de forma visible.',false)
  ],
  isszarya:[
    w('Viagra','¿En qué año fue aprobado Viagra en Estados Unidos?','La FDA aprobó Viagra en 1998, convirtiéndolo rápidamente en uno de los medicamentos más reconocibles del mundo.',1998,'Ciencia','Estados Unidos','viagra-approval','https://es.wikipedia.org/wiki/Sildenafilo','Hito científico y social de alta notoriedad, menos especializado que un módulo orbital.'),
    w('La expansión del universo se acelera','¿En qué año se publicaron las observaciones que mostraron que la expansión del universo se está acelerando?','En 1998 dos equipos de astrónomos presentaron evidencia de que la expansión del universo se acelera.',1998,'Ciencia','Global','accelerating-universe','https://es.wikipedia.org/wiki/Expansi%C3%B3n_acelerada_del_universo','Hito científico mayor; algo más abstracto, pero de gran importancia histórica.')
  ],
  change4:[
    w('Eclipse solar total en Chile y Argentina','¿En qué año un eclipse solar total cruzó Chile y Argentina el 2 de julio?','Un eclipse solar total atravesó zonas de Chile y Argentina el 2 de julio de 2019 y congregó a miles de observadores.',2019,'Ciencia','Chile / Argentina','eclipse-solar-2019','https://es.wikipedia.org/wiki/Eclipse_solar_del_2_de_julio_de_2019','Fenómeno científico visible y masivo, con fuerte relevancia regional.'),
    w('Primera caminata espacial sólo de mujeres','¿En qué año se realizó la primera caminata espacial integrada exclusivamente por mujeres?','Christina Koch y Jessica Meir realizaron en 2019 la primera caminata espacial compuesta sólo por mujeres.',2019,'Ciencia','Espacio','first-all-female-spacewalk','https://en.wikipedia.org/wiki/Christina_Koch','Hito claro, humano y fácil de comunicar sin tecnicismo excesivo.')
  ],
  sarscov2genome:[
    w('Crew Dragon lleva astronautas a órbita','¿En qué año SpaceX realizó su primer vuelo tripulado a la Estación Espacial Internacional?','La misión Crew Dragon Demo-2 despegó en 2020 y devolvió a Estados Unidos la capacidad de lanzar astronautas desde su territorio.',2020,'Ciencia','Estados Unidos','crew-dragon-demo-2','https://es.wikipedia.org/wiki/Crew_Dragon_Demo-2','Hito espacial visible y ampliamente cubierto, menos técnico que una secuencia genética.'),
    w('Nobel de Química por CRISPR','¿En qué año Emmanuelle Charpentier y Jennifer Doudna recibieron el Nobel de Química por CRISPR?','Charpentier y Doudna recibieron el Nobel de Química en 2020 por el desarrollo de la edición genética CRISPR-Cas9.',2020,'Ciencia','Global','crispr-nobel-2020','https://www.nobelprize.org/prizes/chemistry/2020/summary/','Reconoce una tecnología que ya tiene otro hito en el banco, pero con un momento público muy claro.',true,['crispr2012'])
  ],
  mrnavaccine:[
    w('Nobel de Química por CRISPR','¿En qué año Emmanuelle Charpentier y Jennifer Doudna recibieron el Nobel de Química?','El Nobel de Química de 2020 reconoció el desarrollo de un método de edición genética basado en CRISPR-Cas9.',2020,'Ciencia','Global','crispr-nobel-2020','https://www.nobelprize.org/prizes/chemistry/2020/summary/','Hito científico de alta visibilidad y fácil fecha.',true,['crispr2012']),
    w('Crew Dragon Demo-2','¿En qué año despegó la primera misión tripulada Crew Dragon?','Crew Dragon Demo-2 despegó en mayo de 2020 con dos astronautas rumbo a la Estación Espacial Internacional.',2020,'Ciencia','Estados Unidos','crew-dragon-demo-2','https://es.wikipedia.org/wiki/Crew_Dragon_Demo-2','Evento espacial de fuerte cobertura global y lectura simple.')
  ],
  chandrayaan3:[
    w('Fin de la emergencia sanitaria mundial por COVID-19','¿En qué año la OMS puso fin a la emergencia de salud pública internacional por COVID-19?','La OMS declaró en mayo de 2023 que la COVID-19 dejaba de constituir una emergencia de salud pública de importancia internacional.',2023,'Ciencia','Global','covid-emergency-end','https://www.who.int/news/item/05-05-2023-statement-on-the-fifteenth-meeting-of-the-international-health-regulations-(2005)-emergency-committee-regarding-the-coronavirus-disease-(covid-19)-pandemic','Hito mundial de salud pública con consecuencias directas para la vida cotidiana.'),
    w('GPT-4','¿En qué año se presentó GPT-4?','OpenAI presentó GPT-4 en 2023, consolidando el salto de la IA generativa hacia herramientas multimodales de uso masivo.',2023,'Tecnología','Global','gpt-4','https://es.wikipedia.org/wiki/GPT-4','Altísima notoriedad contemporánea; cambia categoría de forma explícita.',false)
  ],
  osirisrex:[
    w('GPT-4','¿En qué año se lanzó GPT-4?','GPT-4 fue presentado en 2023 y amplió el interés mundial por los modelos de inteligencia artificial generativa.',2023,'Tecnología','Global','gpt-4','https://es.wikipedia.org/wiki/GPT-4','Evento tecnológico ampliamente reconocido; cambia categoría.',false),
    w('La OMS termina la emergencia global por COVID-19','¿En qué año la OMS declaró el fin de la emergencia sanitaria global por COVID-19?','La OMS levantó en 2023 la emergencia de salud pública internacional asociada a la COVID-19.',2023,'Ciencia','Global','covid-emergency-end','https://www.who.int/news/item/05-05-2023-statement-on-the-fifteenth-meeting-of-the-international-health-regulations-(2005)-emergency-committee-regarding-the-coronavirus-disease-(covid-19)-pandemic','Hito de salud pública mundial de mayor familiaridad para público general.')
  ],
  tlcue:[
    w('TLC entre Chile y Estados Unidos','¿En qué año Chile y Estados Unidos firmaron su tratado de libre comercio?','Chile y Estados Unidos firmaron un tratado de libre comercio en 2003; entró en vigor al año siguiente.',2003,'Chile','Chile / Estados Unidos','tlc-chile-estados-unidos','https://es.wikipedia.org/wiki/Tratado_de_Libre_Comercio_entre_Chile_y_Estados_Unidos','Mantiene el eje económico internacional, pero con un socio más reconocible para el público chileno.'),
    w('31 Minutos','¿En qué año se estrenó 31 Minutos en la televisión chilena?','31 Minutos se estrenó en TVN en 2003 y se convirtió en una de las series chilenas más reconocibles de su generación.',2003,'Cultura','Chile','31-minutos','https://es.wikipedia.org/wiki/31_minutos','Alternativa de cultura pop chilena mucho más reconocible y miscelánea.',false)
  ],
  eclipsechile:[
    w('60 años del Festival de Viña del Mar','¿En qué año el Festival de Viña del Mar celebró su 60.ª edición?','El Festival de Viña del Mar celebró su 60.ª edición en 2019.',2019,'Chile','Chile','vina-60','https://es.wikipedia.org/wiki/LX_Festival_Internacional_de_la_Canci%C3%B3n_de_Vi%C3%B1a_del_Mar','Hito chileno de cultura popular con asociación directa al año.'),
    w('Línea 3 del Metro de Santiago','¿En qué año se inauguró la Línea 3 del Metro de Santiago?','La Línea 3 del Metro de Santiago comenzó a operar en enero de 2019.',2019,'Chile','Chile','linea-3-metro-santiago','https://es.wikipedia.org/wiki/L%C3%ADnea_3_del_Metro_de_Santiago','Evento urbano de alta familiaridad para Chile central.')
  ],
  solidaritypoland:[
    w('Asesinato de John Lennon','¿En qué año fue asesinado John Lennon en Nueva York?','John Lennon fue asesinado frente al edificio Dakota de Nueva York en diciembre de 1980.',1980,'Historia','Estados Unidos','john-lennon-assassination','https://es.wikipedia.org/wiki/Asesinato_de_John_Lennon','Hito histórico y cultural de reconocimiento mundial.',false),
    w('Comienza la guerra Irán-Irak','¿En qué año comenzó la guerra entre Irán e Irak?','La guerra Irán-Irak comenzó en 1980 y se prolongó durante ocho años.',1980,'Historia','Medio Oriente','iran-iraq-war','https://es.wikipedia.org/wiki/Guerra_Ir%C3%A1n-Irak','Evento geopolítico mayor, más generalizable que una organización sindical específica.')
  ]
};
const REF={
  everest:{title:'Primera ascensión confirmada al Everest',prompt:'¿En qué año se consiguió por primera vez una ascensión confirmada a la cima del Everest?',fact:'La primera ascensión confirmada a la cima del Everest se logró en 1953.',sourceLabel:'Encyclopaedia Britannica · Mount Everest',source:'https://www.britannica.com/place/Mount-Everest',reason:'El hito es la primera ascensión; los nombres pueden aparecer después como contexto, no en el título principal.'},
  gravwaves:{title:'Primera detección directa de ondas gravitacionales',prompt:'¿En qué año se anunció la primera detección directa de ondas gravitacionales?',fact:'LIGO anunció en 2016 la primera detección directa de ondas gravitacionales, registrada el año anterior.',sourceLabel:'LIGO · GW150914',source:'https://www.ligo.org/science/Publication-GW150914/index.php',reason:'El título debe centrarse en el descubrimiento y distinguir el año de detección del año del anuncio.'}
};
window.__QA_EDITORIAL_REPLACEMENTS_V187C__={version:'1.8.7-c',items:R,sourceReframes:REF};
})();
