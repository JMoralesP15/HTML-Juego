# Edición de prueba humana · 14 septiembre 2026

## Encargo técnico
Compilar el archivo editorial suministrado en una edición temporal y reproducible del juego. Admitir exclusivamente registros con hecho, texto y visual aprobados por una persona; publicar exactamente el texto editado y la visual seleccionada, incluida la selección manual y los reemplazos. Aplicar el conjunto autorizado a Hoy, Repaso, Ordenar, Colección y restauración de partidas. Mantener el banco maestro, consola y progreso normal. Comprobar arquitectura y teléfono antes de actualizar Pages.

## Revisión crítica y decisiones
Un filtro sobre el calendario de 300 eventos puede producir rondas vacías. Se requiere un calendario determinista propio de cinco eventos y una reserva corta que permita practicar. Un índice de candidata puede cambiar después de otra búsqueda: resolver por clave estable contra la versión de la consola usada en la revisión (ee1c579), nunca por posición. Aprobar el texto sin aplicar sus ediciones reintroduce el metadiscurso anterior: conservar summary/expanded explícitos y darles responsabilidades distintas en la presentación. Reanudar progreso antiguo o aplicar overrides locales puede eludir el filtro: usar un espacio de almacenamiento por edición y sanitizar importaciones. La imagen aprobada no certifica su disponibilidad futura ni sus derechos; conservar la declaración sin rotular automáticamente «imagen abierta».

## Prompt técnico final ejecutable
1. Validar schema, identidades, tres aprobaciones, texto explícito, ámbito del reemplazo y clave de imagen. Registrar SHA-256 del archivo original y exclusiones; no publicar notas privadas ni el export completo.
2. Generar una instantánea en la capa existente de curación, después de enriquecimientos y antes de storage. Conservar 300 eventos en los archivos fuente y filtrar conjuntamente array/map en tester. Rechazar un lote insuficiente en compilación. Activar en raíz mediante data-editorial-edition="human"; rollback con atributo o edición completa explícita ?edition=full.
3. Separar progreso por identificador de lote; impedir que partidas importadas contengan IDs externos y que overrides alteren el texto aprobado. El calendario normal queda intacto. La edición reducida no promete cuotas por dificultad ni 30 días sin repetición.
4. Mostrar summary completo una sola vez, expanded únicamente al profundizar; preservar fotografía aprobada y procedencia sin afirmar licencia verificada. No sustituir automáticamente imágenes fallidas.
5. Mantener controles móviles claros, respuesta accesible y movimiento reducido. Verificar anchos 375/390, ciclo de cinco preguntas, recarga, filtros y respuestas de un evento reemplazado.
6. Ejecutar pruebas de contratos, banco, arquitectura y navegador. Publicar una revisión verificable sólo tras resolver regresiones materiales. Mantener acceso a /review/ y su función Agregar imagen.

## Datos de entrada
300 registros; 63 con texto y visual aprobados (21%); 62 con las tres aprobaciones (20,67%). Apollo 11 está excluido por hecho pendiente. Las 62 selecciones se resuelven: 47 imágenes manuales, 9 candidatas automáticas elegidas por humano y 6 visuales actuales. Un reemplazo (usb) requiere también actualizar pregunta y año. Las licencias son declaraciones del export, no una auditoría jurídica.

## Revisión posterior del producto
La vista móvil publicada reproducía metadiscurso y no mostraba la selección humana. La edición nueva muestra la foto completa (sin recorte), créditos desplegables y un resumen único. Se conserva el indicador de distancia temporal y el botón Siguiente accesible. Se añadieron versiones a los recursos para evitar mezclar scripts antiguos con el nuevo HTML; los inventarios de arquitectura reconocen esos parámetros y mantienen el recuento real. Si falta la edición compilada o contiene IDs inválidos, se vacía el conjunto y se bloquea el juego: nunca se recurre al banco sin revisar.

Disponibilidad medida: 55 URLs respondieron con contenido de imagen, 6 archivos locales existen y 1 URL respondió 429 (allendelection). Es una comprobación puntual de cabeceras; no certifica disponibilidad permanente ni los derechos declarados.

