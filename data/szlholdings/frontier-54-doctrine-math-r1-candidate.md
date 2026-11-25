# SZLHOLDINGS/frontier-54-doctrine-math-r1-candidate

## Resumen

`SZLHOLDINGS/frontier-54-doctrine-math-r1-candidate` es un artefacto de modelo publicado por la organización SZL Holdings dentro de su "governed-AI estate", una colección de modelos, datasets y Spaces con trazabilidad declarada hacia repositorios fuente. Por el nombre y la ruta canónica (`szl-frontier`) se presenta como un candidato orientado a matemáticas y razonamiento ("math-r1"), presumiblemente derivado de la familia R1 de DeepSeek, aunque la model card no lo confirma en ningún momento.

La información técnica disponible es extremadamente escasa. El repositorio ocupa 998 GB en formato safetensors, lo que sugiere un modelo de gran tamaño (probablemente en el rango de centenares de miles de millones de parámetros o un MoE de gran escala), pero no se documentan arquitectura, número de parámetros, longitud de contexto, idiomas ni proceso de entrenamiento. La propia model card declara explícitamente que cualquier afirmación no incluida en sus ficheros de recibos ("receipts") debe considerarse UNKNOWN, y confirma que los recibos estándar de evaluación y entrenamiento no se encontraron en el artefacto.

Su relevancia actual es limitada para uso en producción: se trata de un candidato sin métricas publicadas, sin evaluación verificable y con un tamaño que exige infraestructura de centro de datos. Resulta útil únicamente como objeto de estudio de las prácticas de gobernanza y trazabilidad del ecosistema SZL Holdings, no como modelo listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El nombre ("r1") y la etiqueta "math" sugieren una posible relación con modelos de razonamiento matemático de tipo reasoning, pero la model card no lo confirma ni detalla si se trata de un transformer denso, un Mixture of Experts o una arquitectura híbrida. El tamaño del repositorio (998 GB en safetensors) es el único indicio cuantitativo: apunta a un modelo de gran escala, probablemente por encima de los 100 000 millones de parámetros en precisión completa o bfloat16, aunque esta estimación no puede confirmarse sin inspeccionar los ficheros de pesos.

Tampoco se documentan datos de entrenamiento (número de tokens, composición del corpus), ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo con verificación (RLVR) típicas de los modelos matemáticos de razonamiento. La model card indica que las afirmaciones de entrenamiento y evaluación viven en ficheros de recibos del "estate mesh", pero que en este artefacto concreto los recibos estándar (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`) no se encontraron, con estado `UNKNOWN_NO_EVAL_RECEIPT`.

## Capacidades

- Generación de texto: no confirmada explícitamente, pero esperable en un artefacto de tipo modelo de lenguaje.
- Razonamiento matemático: el nombre del modelo lo sugiere, aunque no hay evidencia documentada en la model card.
- Razonamiento multi-paso / modo "thinking": no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Visión, audio u otras modalidades: no disponible.
- Cualquier capacidad especial: no documentada.

## Casos de uso

- Evaluación comparativa interna de modelos de razonamiento matemático: el artefacto puede descargarse e inspeccionarse para verificar su arquitectura real y contrastarla con las afirmaciones del autor, dado que la model card no ofrece métricas.
- Investigación sobre gobernanza de modelos: útil como caso de estudio de un "estate" que etiqueta explícitamente sus datos como MEASURED, REPORTED o UNKNOWN, y que documenta la ausencia de recibos de evaluación.
- Auditoría de licencias y procedencia: la nota de licencia indica que la etiqueta apache-2.0 se fijó por decisión operativa del estate sin evidencia por fichero del upstream, lo que lo convierte en un ejemplo práctico para estudiar riesgos de compliance.
- Reproducción de pipelines de evaluación: si se dispone de infraestructura, puede servir para probar harnesses de evaluación matemática sobre un modelo de gran tamaño sin resultados publicados.
- Benchmarking de infraestructura de inferencia: con 998 GB de pesos, es un caso útil para medir throughput y latencia de sistemas como vLLM o TGI en configuraciones multi-GPU.
- Docencia sobre model cards: ejemplo de documentación que prioriza la honestidad epistémica (declarar UNKNOWN) frente a la promesa comercial, útil para formar a equipos en evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que el estado del artefacto es `UNKNOWN_NO_EVAL_RECEIPT`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero el repositorio de 998 GB implica que en bfloat16 se necesitan del orden de 1 TB de memoria agregada; en cuantización de 8 bits, aproximadamente 500 GB; en 4 bits, unos 250 GB (estimaciones derivadas del tamaño del repo, no de especificaciones confirmadas).
- GPU recomendadas: no disponibles; por el tamaño, se requeriría un clúster multi-GPU (por ejemplo, varios nodos con H100 80 GB o A100 80 GB) o GPUs con memoria unificada de gran capacidad.
- ¿Cabe en GPU de consumo? No, en ningún escenario razonable con el tamaño actual del repositorio.
- Opciones de despliegue: no documentadas por el autor; por formato safetensors, sería compatible con vLLM, TGI o SGLang si la arquitectura es estándar, y con llama.cpp solo tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica la arquitectura ni la familia de la que deriva, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría (por ejemplo, modelos de razonamiento matemático de gran escala). Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluación verificable: el propio autor declara `UNKNOWN_NO_EVAL_RECEIPT`; no hay garantía de calidad.
- Model card generada automáticamente por un "weaver" del estate, con gráficos SVG deterministas y sin datos técnicos sustantivos.
- La licencia apache-2.0 fue asignada por decisión operativa del estate ("CTO lap W45Z rights-call") sin evidencia de licencia upstream por fichero, lo que introduce riesgo legal para uso comercial.
- Tamaño de 998 GB: inviable para la mayoría de entornos; requiere infraestructura de centro de datos.
- Idiomas, contexto y arquitectura no declarados: imposible planificar el despliegue sin inspección previa de los pesos.
- Riesgo de alucinación: no evaluado; sin datos de entrenamiento ni de alignment, no puede descartarse.
- Sesgos: no documentados ni medidos.
- Nombre que sugiere capacidades matemáticas ("math-r1") sin respaldo documental: posible expectativa inflada.
- Fecha de creación futura (2026-11-17) en los metadatos de Hugging Face, lo que puede indicar artefactos de prueba o entradas sintéticas en el catálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/frontier-54-doctrine-math-r1-candidate
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio fuente canónico: https://github.com/szl-holdings/szl-frontier
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
- Bundle de recibos citado en la card: SZLHOLDINGS/wave-logs (ruta `mesh/2026-11-22/model-receipts/pass1-frontier/`)
- Ledger de bloqueo citado: szl-holdings/szl-eval-harness (`ledger/blocking_ledger_v1.json`)
