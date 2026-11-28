# zhangzhan394340606/openbind-bc1-method-report

## Resumen

OpenBind Blind Challenge 1 — Method Report es la documentación metodológica presentada por el usuario `zhangzhan394340606` en la primera edición del reto a ciegas organizado por OpenBind, centrado en la predicción de estructuras proteína-ligando para la proteasa NS2B-NS3 del virus del Zika con 400 compuestos ciegos. No se trata de un modelo de lenguaje ni de un modelo generativo entrenado por el autor: es un informe técnico que describe una metodología compuesta por co-folding con pesos públicos, transplantación de plantillas estructurales y reglas de consenso entre familias de modelos.

El pipeline combina Protenix con pesos públicos (inferencia multi-semilla en dos modos de condicionamiento), las poses del baseline oficial OpenBind-0 / OpenFold3 y la transplantación de poses desde estructuras públicas del complejo Zika NS2B-NS3 depositadas en el PDB (aproximadamente 294 entradas y 264 ligandos únicos). La selección de poses se realiza mediante reglas de consenso entre familias independientes, comparación con enumeración completa de simetría, y una puerta de validez física basada en PoseBusters junto con una comprobación de consistencia del ligando.

El interés del documento es metodológico y reproducible: ilustra cómo obtener resultados competitivos en un reto de predicción estructural sin datos propietarios ni información experimental oculta, apoyándose exclusivamente en datos públicos. Es relevante para investigadores en co-folding, docking molecular y evaluación de pipelines de predicción de complejos proteína-ligando, así como para quienes diseñan estrategias de consenso multi-modelo en entornos con restricciones de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (informe metodológico; el pipeline usa Protenix, OpenBind-0/OpenFold3 y transplantación de plantillas) |
| Parametros totales | No disponible |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | other (openbind-blind-challenge-1-method-report) |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

El artefacto publicado no contiene pesos ni código, sino un informe de método. La generación de poses se apoya en tres fuentes independientes: Protenix con pesos públicos en inferencia multi-semilla (un brazo sin sesgo y otro con sesgo de plantilla y bolsillo), las poses del baseline OpenBind-0 / OpenFold3 en configuración np10, y la transplantación de poses desde estructuras públicas del complejo Zika NS2B-NS3. Boltz-2 en modo zero-shot se evaluó como fuente auxiliar pero no se incluyó en la selección final. El autor declara explícitamente que no se emplearon Protenix-v2, AF3, HelixFold3 ni NeuralPLexer.

La selección y refinamiento de poses se organiza en torno a un pool de candidatos por compuesto, comparación con enumeración completa de simetría para evitar penalizaciones erróneas por flips equivalentes, reglas de consenso entre familias (se prefieren poses respaldadas por varias familias y por ligandos públicos estructuralmente análogos), y una puerta de validez física que exige un pase completo de PoseBusters más una comprobación de consistencia del ligando (número de átomos, composición elemental y órdenes de enlace). Para compuestos con series públicas conocidas se aplica reconstrucción por consenso de serie fijando el núcleo MCS y buscando el resto de grados de libertad por embedding de confórmeros. La transplantación de plantillas incorpora un mecanismo de alivio mínimo de cadenas laterales, retrayendo entre 1 y 6 átomos de cadena lateral conflictivos típicamente menos de 0,5 Å a lo largo del vector ligando-proteína, sin mover el esqueleto proteico ni la pose del ligando.

La validación incluye leave-one-out sobre complejos públicos de Zika, la observación de que el acuerdo de tres o más familias independientes dentro de aproximadamente 1,2 Å es un predictor fuerte de pose correcta, y un esquema de sondeo A/B sobre la mitad en vivo del leaderboard con conjuntos de cambios pre-registrados y reglas de decisión también pre-registradas para mantener, revertir o expandir cada mecanismo.

## Capacidades

- Predicción de complejos proteína-ligando mediante co-folding con pesos públicos (Protenix multi-semilla).
- Generación de poses candidatas a partir de múltiples familias de modelos independientes y del baseline oficial OpenBind-0 / OpenFold3.
- Transplantación de poses desde plantillas estructurales públicas con verificación geométrica.
- Reconstrucción por consenso de serie para compuestos con análogos públicos, usando enlaces de subestructura común máxima (MCS).
- Comparación de poses con enumeración completa de simetría para evitar errores por equivalencias especulares.
- Filtrado por validez física con PoseBusters y comprobación de consistencia del ligando.
- Alivio mínimo de cadenas laterales del bolsillo para resolver choques estéricos sin alterar el esqueleto.
- Sondeo controlado del leaderboard en vivo mediante cambios pre-registrados y reglas de decisión A/B.
- No incluye capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

- Predicción de poses en retos de estructura a ciegas: el método sirve como referencia reproducible para participar en competiciones de cofolding con restricción de datos públicos, combinando varias familias de modelos y una puerta de validez física.
- Diseño de pipelines de consenso multi-modelo: la regla de que el acuerdo de tres o más familias dentro de aproximadamente 1,2 Å predice poses correctas es directamente aplicable al diseño de sistemas de selección de poses en descubrimiento de fármacos.
- Reutilización de estructuras públicas del PDB: la estrategia de transplantación con cobertura MCS alta y alivio mínimo de cadenas laterales es trasladable a dianas con series estructurales bien caracterizadas, como proteasas virales.
- Validación de calidad de poses en producción: la combinación de PoseBusters con comprobaciones de consistencia del ligando (átomos, elementos, órdenes de enlace) puede integrarse como filtro automático en pipelines de docking o cofolding.
- Reconstrucción de series químicas: el método de consenso de serie con núcleo MCS fijo y búsqueda de confórmeros es útil para priorizar compuestos en programas de optimización de leads.
- Análisis de modos de fallo en predicción estructural: la documentación de fallos en compuestos tipo fragmento (≤18 átomos pesados) y en ligandos con baja cobertura MCS permite diseñar conjuntos de test específicos para evaluar modelos de cofolding.
- Estudio de estrategias de evaluación en vivo: el esquema de sondeo A/B con cambios pre-registrados sobre la mitad visible del leaderboard es un patrón reutilizable para experimentación controlada en competiciones con feedback parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe define los criterios de éxito del reto (BiSyRMSD < 1,5 Å, lDDT-PLI > 0,8 y pase completo de PoseBusters) pero no incluye tablas de resultados numéricos ni comparaciones cuantitativas con otros participantes.

## Requisitos de hardware

- El autor declara cómputo en una estación de trabajo local con GPU más GPU en la nube de forma limitada; no se especifican modelos de GPU ni VRAM.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica como modelo desplegable; los pesos no se han publicado y el código no se ha liberado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | OpenBind BC1 Method Report | OpenBind-0 / OpenFold3 (baseline) | Protenix (pesos públicos) |
|---|---|---|---|
| Tipo de artefacto | Informe metodológico | Modelo de cofolding | Modelo de cofolding |
| Pesos publicados | No | No disponible | Sí (pesos públicos) |
| Uso en el pipeline | Documentación del método | Fuente de poses (np10) | Fuente principal multi-semilla |
| Licencia | other (openbind-blind-challenge-1-method-report) | No disponible | No disponible |
| Contexto / parámetros | No aplica | No disponible | No disponible |

La comparación con Boltz-2 zero-shot queda limitada a su mención como fuente auxiliar descartada en la selección final; no se aportan métricas comparativas.

## Limitaciones y advertencias

- Los compuestos tipo fragmento (≤18 átomos pesados) y los ligandos con baja cobertura MCS frente a ligandos públicos son los modos de fallo dominantes según el propio autor.
- La reconstrucción por consenso de serie puede fijar un modo autoconsistente pero incorrecto si las poses compañeras de la serie son erróneas; el autor mitiga con comprobaciones cruzadas entre fuentes pero no elimina el riesgo.
- Los choques profundos de plantilla que requerirían movimiento del esqueleto proteico no son reparables mediante alivio de cadenas laterales y se dejan sin modificar.
- El techo de datos públicos es una restricción real del método: no se usaron datos propietarios ni información experimental oculta.
- Los pesos del modelo no se han publicado y el código no se ha liberado, lo que impide la reproducción directa del pipeline.
- La licencia es de tipo "other" con nombre `openbind-blind-challenge-1-method-report`; no se especifican términos de uso comercial, por lo que debe consultarse el texto completo antes de cualquier reutilización.
- El sondeo A/B se realizó sobre la mitad visible del leaderboard; las conclusiones extraídas de esa señal parcial pueden no generalizar al conjunto completo de compuestos.
- No hay paper asociado ni resultados de benchmarks publicados en la información disponible.

## Enlaces

- [Hugging Face: zhangzhan394340606/openbind-bc1-method-report](https://huggingface.co/zhangzhan394340606/openbind-bc1-method-report)
