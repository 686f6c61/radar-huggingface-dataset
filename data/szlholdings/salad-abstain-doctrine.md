# SZLHOLDINGS/salad-abstain-doctrine

## Resumen

`salad-abstain-doctrine` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face, dentro de lo que el autor denomina "governed-AI estate": una colección de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo). El repositorio tiene un tamaño de 1,2 GB y contiene pesos en formato safetensors, pero no se especifica en la información disponible ni la arquitectura, ni el número de parámetros, ni la longitud de contexto, ni los datos de entrenamiento.

La model card es fundamentalmente un documento de gobernanza y trazabilidad, no una ficha técnica convencional. El autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación debe residir en ficheros de recibo ("receipt files") del ecosistema del autor, y que lo no documentado se etiqueta como UNKNOWN. De hecho, el propio escaneo de recibos incluido en la card (tranche-6, chunk-1, 2026-11-22) clasifica el repo como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con estado MEASURED y `eval_rc=0`, por lo que la evidencia de evaluación se marca como UNKNOWN.

Por tanto, esta ficha se redacta con información muy limitada: no hay benchmark, no hay arquitectura declarada, no hay licencia indicada y no hay idiomas soportados. El interés del artefacto, a fecha de la información disponible, es más metodológico (un ejemplo de publicación con trazabilidad estricta y etiquetado explícito de incertidumbre) que técnico. Cualquier evaluación de capacidades requeriría inspeccionar los pesos y los recibos en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repo) |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-16 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card ni en los metadatos del repositorio. No se indica si se trata de un transformer, un modelo MoE, una arquitectura híbrida o un SSM, ni se detalla el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La card sí establece un marco de honestidad explícito: las afirmaciones sobre entrenamiento y evaluación deben constar en ficheros de recibo del "estate mesh" del autor, y lo que no está recibido se etiqueta como UNKNOWN. El escaneo de recibos incluido en la propia card (2026-11-22) clasifica el repo como RECEIPT_FILES_NO_DONE, es decir, presencia de ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) sin un `DONE.json` estricto con estado MEASURED. En consecuencia, no hay evidencia de entrenamiento validada en la información disponible.

## Capacidades

- Generación de texto: no confirmada; no hay información sobre la tarea o pipeline del modelo.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Trazabilidad y gobernanza: el artefacto se presenta dentro de un marco de publicación con recibos y etiquetado MEASURED/REPORTED/UNKNOWN, pero esta es una propiedad del proceso de publicación, no una capacidad inferencial del modelo.

## Casos de uso

- Auditoría de artefactos publicados: el repositorio sirve como ejemplo de publicación con etiquetado explícito de incertidumbre (MEASURED/REPORTED/UNKNOWN), útil para equipos que diseñan procesos internos de model governance y quieren ver un formato de card con secciones de evidencia y recibos.
- Verificación de la cadena de custodia de pesos: dado que el repo incluye safetensors y referencias a un "estate mesh" de recibos, puede emplearse para probar herramientas de verificación de artefactos y de comprobación de integridad en pipelines de MLOps.
- Docencia sobre comunicación de limitaciones: la card es un caso práctico de cómo declarar UNKNOWN en lugar de inventar cifras, apropiado para formar a equipos en documentación técnica rigurosa.
- Pruebas de carga de repositorios de 1,2 GB: útil para validar flujos de descarga, cacheo y despliegue con artefactos de tamaño medio en entornos de CI.
- Integración en catálogos internos de modelos: como entrada de prueba en un registro de modelos que exija campos de licencia, idioma y benchmark, y que deba manejar valores ausentes de forma controlada.
- Evaluación de riesgos de licencia: dado que la licencia no está declarada, el repo puede usarse como caso de prueba para políticas internas que bloqueen el uso comercial de artefactos sin licencia explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos incluido marca la evidencia de evaluación como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de un número de parámetros que no se declara. Con un repo de 1,2 GB en safetensors, el tamaño de los pesos en precisión original es del orden de 1,2 GB, lo que en fp16 equivaldría a aproximadamente 600 millones de parámetros, pero esta estimación es especulativa y no está confirmada por el autor.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; si la estimación anterior fuese correcta, cabría en GPUs de consumo con 8-12 GB de VRAM en cuantizaciones de 8 o 4 bits, pero no hay datos que lo respalden.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara arquitectura ni pipeline, por lo que no puede confirmarse compatibilidad con ningún runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha declarado la tarea, el tamaño ni la arquitectura del artefacto, y no hay benchmarks publicados que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni idiomas declarados, no es posible evaluar su idoneidad para ninguna tarea concreta.
- Licencia no declarada: no puede asumirse uso comercial; en la práctica, la ausencia de licencia implica riesgo legal para cualquier despliegue en producción.
- Evidencia de evaluación inexistente: el propio escaneo del autor clasifica el repo como RECEIPT_FILES_NO_DONE y marca la evidencia como UNKNOWN.
- Riesgo de alucinación: no evaluable sin benchmarks ni datos de entrenamiento.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de uso comunitario ni de validación externa.
- La model card contiene enlaces con sintaxis potencialmente malformada (por ejemplo, el enlace a la organización en GitHub aparece como `https://github.com/szl-holdings (org)`), lo que dificulta la verificación de la fuente canónica.
- Cualquier uso en producción requeriría primero inspeccionar los pesos, obtener la licencia del autor y generar recibos de evaluación propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-abstain-doctrine
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la card, enlace malformado): https://github.com/szl-holdings
- Herramienta de generación de cards citada: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo: no disponible
