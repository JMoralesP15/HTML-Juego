# Tech Debt Map v1.8.3

## P0 — contrato de producto

- **Learning feedback**: v1.6 sigue mostrando categorías editoriales internas (`Qué fue`, `Por qué importa`, `Dato para recordar`) pese a que el contrato vigente exige una narración breve natural. Riesgo: producto visible inconsistente con la decisión editorial más reciente.

## P1 — arquitectura y release

- **Render**: Atlas es constructor efectivo, pero engine/Archivo Nocturno y decoradores posteriores intervienen. Riesgo: regresiones ocultas por shadowing.
- **Timer/scoring**: Atlas + v1.5 + normalización de storage. Riesgo: retirar un patch puede cambiar puntos o expiración.
- **Media**: v1.8 curada convive con Commons asíncrono v1.4. Riesgo: precedencia final no demostrada estáticamente.
- **CSS**: cinco hojas activas y múltiples generaciones en cascade. Riesgo: especificidad accidental.
- **QA visual**: el workflow base regenera snapshots antes de comparar. Riesgo: baseline autoaceptada.
- **Reviewer**: consola general y asistida mantienen stores/decisiones diferentes. Riesgo: revisión humana fragmentada.
- **Trazabilidad PR**: estado de PR no representa la genealogía real. Riesgo: decisiones difíciles de reconstruir.

## P2 — coherencia/identidad

- **Audio**: sonido funcional, ambiente generativo y reubicación v1.5 reparten propiedad.
- **Navegación**: símbolos Unicode son deuda visual/semántica, no fallo funcional.

## Métricas

`ownership_ratio = 6/18 = 33.3%`. No mide cantidad de archivos: mide contratos con un solo owner efectivo sin competidor cargado conocido.

`test_protection_ratio = 14/18 = 77.8%`. Sólo cuenta protección DIRECT identificable; tests indirectos no inflan el numerador.

## OBSOLETE CANDIDATES

Los símbolos shadowed que el scanner encuentre pasan a `OBSOLETE_CANDIDATE`; no se propone borrar archivos completos. La unidad de retirada es responsabilidad demostrablemente reemplazada, no “archivo viejo”.

## NEXT MIGRATION CANDIDATES

1. Corregir el contrato visible de Learning Feedback con test de pantalla/DOM que prohíba la taxonomía interna.
2. Congelar contrato del timer/scoring y trasladarlo a un owner único.
3. Reproducir la carrera Commons/v1.8 en navegador y fijar precedencia.
4. Crear renderer canónico y retirar, una a una, definiciones shadowed con tests de paridad.
5. Reducir cascade CSS sólo después de congelar baselines visuales y sin `--update-snapshots`.
6. Unificar stores/decisiones de `/review/` antes de ampliar nuevos lotes editoriales.

Ninguno de estos pasos se ejecuta en v1.8.3.
