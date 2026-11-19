# StrandsAgents/strands-decider-E2B-gemma4-v2-2611

## Resumen

strands-decider-E2B-gemma4-v2 es un modelo de clasificación y toma de decisiones desarrollado por StrandsAgents, afinado a partir de google/gemma-4-E2B-it mediante la librería propia `strands-decider`. No es un modelo generativo de propósito general: su función es leer un estado (texto o JSON, opcionalmente con hasta cuatro imágenes) y responder preguntas tipadas sobre él —elección entre 1 y 255 opciones, sí/no o puntuación— devolviendo probabilidades calibradas por opción.

La innovación principal respecto a su predecesor (v1, que añadía una cabeza de puntero como adaptador) es que v2 sustituye la cabeza LM de Gemma 4 por una capa de lectura de tokens de 255 filas, inicializada desde las filas de los códigos de respuesta (A, B, C…) y entrenada junto con el resto del modelo. El estado se codifica una sola vez en ambas direcciones y cada pregunta lo consulta de forma aislada, de modo que responder varias preguntas sobre el mismo estado cuesta poco más que responder una, sin contaminación cruzada entre preguntas.

El checkpoint se distribuye como modelo completo fusionado (decoder afinado dentro del checkpoint de Gemma 4 E2B), con la temperatura en `decision_config.json`. Está pensado para enrutamiento, triaje y decisiones estructuradas en pipelines de agentes, y su licencia Apache-2.0 facilita el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4 E2B) con cabeza de lectura de tokens de 255 filas en lugar de la LM head |
| Parametros totales | 5.123.178.051 (5,1B con embeddings; 2,3B efectivos según el autor) |
| Parametros activos | no disponible (el autor no declara configuración MoE) |
| Longitud de contexto | 32.768 tokens validados (por defecto); hasta 131.072 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (10,3 GB en bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer decoder con 2,3B parámetros efectivos (5,1B contando embeddings). La modificación estructural clave es la sustitución de la LM head: en lugar de generar texto, una capa de 255 filas —inicializada desde las filas de la LM head correspondientes a los códigos de respuesta (A, B, C…)— se entrena para leer la probabilidad de cada opción en el último token del prompt. El resto de la LM head se descarta. La temperatura de decisión se guarda en `decision_config.json` y el checkpoint publicado es el modelo completo con el decoder afinado fusionado.

El entrenamiento se realizó sobre prompts de hasta 16.384 tokens, con validación hasta 32.768 (límite por defecto) y soporte de ejecución hasta 131.072. El estado se codifica una vez en ambas direcciones y cada pregunta lo consulta de forma independiente, lo que permite responder múltiples preguntas sobre el mismo estado con coste marginal bajo y sin que una pregunta vea las respuestas de otra. Las imágenes pasan por el codificador visual original de Gemma 4 sin modificar; v2 se entrenó solo con texto. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación de decisión con elección entre 1 y 255 opciones, devolviendo probabilidad por opción.
- Decisiones binarias sí/no (`noul`) con probabilidad calibrada.
- Decisiones de puntuación ordenada (`score`) sobre criterios definidos.
- Procesamiento de entradas en texto plano o JSON estructurado.
- Procesamiento de hasta 4 imágenes por consulta mediante el codificador visual de Gemma 4 (sin reentrenar).
- Respuesta a múltiples preguntas tipadas sobre un mismo estado con codificación compartida.
- Contexto largo: validado a 32.768 tokens, ejecutable hasta 131.072.
- Servicio HTTP mediante `POST /v1/systemone` con `strands-decider serve`.
- Uso programático en Python mediante `load_decision_engine`.
- No dispone de tool calling, razonamiento multi-paso generativo ni modo thinking: es un modelo de clasificación, no un generador de texto.

## Casos de uso

- Triaje de tickets de soporte: se envía el texto del ticket como estado y se pregunta por el equipo responsable (elección entre facturación, soporte, ventas, retail) y por la urgencia (sí/no), obteniendo probabilidades calibradas para umbralizar el enrutamiento automático.
- Enrutamiento en pipelines de agentes: el modelo actúa como "decisor" que selecciona la siguiente acción o herramienta entre un conjunto acotado de opciones, aprovechando la lectura por códigos de respuesta para obtener una distribución sobre las alternativas.
- Moderación y clasificación de contenido: decisiones sí/no o por categorías sobre textos o JSON, con la ventaja de que varias preguntas sobre el mismo contenido se resuelven con una sola codificación del estado.
- Evaluación de imágenes en flujos de revisión: hasta cuatro imágenes por consulta a través del codificador visual de Gemma 4, útil para clasificar capturas, documentos o fotos adjuntas a una incidencia.
- Análisis de decisiones cotidianas y calibración: los benchmarks OpenDecisions y BEV apuntan a escenarios de decisión del día a día y a decisiones de elección, sí/no y puntuación ordenada en 18 dominios, adecuados para sistemas de recomendación o priorización.
- Detección de ambigüedad o casos límite: con DecisionPivot midiendo pares que difieren en un detalle decisivo, el modelo puede emplearse para señalar cuándo dos formulaciones casi idénticas producen decisiones distintas y requieren revisión humana.
- Servicio interno de decisión: despliegue con `strands-decider serve` en una GPU de 24 GB para exponer decisiones estructuradas vía HTTP a otros servicios, teniendo en cuenta que el servidor escucha en 127.0.0.1 y no tiene autenticación.

## Benchmarks y rendimiento

Resultados declarados por el autor (escala 0–100; la fila del modelo v2 está a la temperatura de envío T = 1,5456; v1 a T = 1):

| Modelo | Decision Index 0.3 (público) | JevBench | OpenDecisions | DecisionPivot | BEV |
|---|---:|---:|---:|---:|---:|
| strands-decider-E2B-gemma4-v2 (este modelo) | 57,1 | 87,4 | 77,7 | 23,3 | 74,0 |
| strands-decider-E2B-gemma4-v1-2610 | 29,3 | 77,5 | 56,8 | 7,3 | 63,9 |

Notas del autor: de estos benchmarks solo OpenDecisions depende de la temperatura (76,2 a T = 1, como en el leaderboard de Jev). Decision Index 0.3 (público) consta de 41 tareas en cinco áreas; JevBench mide el porcentaje de acierto sobre 231 ítems públicos; OpenDecisions evalúa decisiones cotidianas con calidad de respuesta y calibración; DecisionPivot mide precisión por pares en ítems que difieren en un detalle decisivo; BEV cubre decisiones de elección, sí/no y puntuación ordenada en 18 dominios. Ningún resultado está verificado de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada: 10,3 GB de pesos en bf16; el autor recomienda una GPU con 24 GB de memoria.
- GPU recomendadas: cualquier GPU con 24 GB o más (por ejemplo, RTX 4090, A100 40/80 GB, H100); el autor cita explícitamente "one GPU with 24 GB of memory".
- Consumer GPU: cabe en tarjetas de 24 GB; no se documenta soporte para GPUs de 16 GB o menos ni versiones cuantizadas.
- Alternativas de ejecución: Apple silicon con `--device mps` y CPU (más lento), según el autor.
- Despliegue: librería `strands-decider` (pip), servidor HTTP con `strands-decider serve ... --port 8000` (escucha en 127.0.0.1, sin autenticación) y API Python `load_decision_engine` con parámetros como `device` y `max_length`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | JevBench | OpenDecisions | DecisionPivot | BEV | Licencia |
|---|---|---|---|---|---|---|---|---|
| strands-decider-E2B-gemma4-v2 | 5,1B (2,3B efectivos) | 32.768 (hasta 131.072) | 57,1 | 87,4 | 77,7 | 23,3 | 74,0 | Apache-2.0 |
| strands-decider-E2B-gemma4-v1-2610 | mismo backbone Gemma 4 E2B | no disponible | 29,3 | 77,5 | 56,8 | 7,3 | 63,9 | Apache-2.0 (según repo) |
| google/gemma-4-E2B-it (base) | 5,1B (2,3B efectivos) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa publicada por el autor es contra v1, sobre el mismo backbone: v2 mejora en las cinco métricas, con el salto más pronunciado en DecisionPivot (7,3 a 23,3) y Decision Index 0.3 (29,3 a 57,1). No se han publicado comparaciones con otros modelos de decisión o clasificación de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El rendimiento en DecisionPivot es bajo en términos absolutos (23,3 sobre 100): el modelo falla con frecuencia ante pares de ítems que difieren en un único detalle decisivo.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`); además, solo OpenDecisions depende de la temperatura, lo que complica la comparación entre configuraciones.
- El modelo está entrenado solo con texto; las imágenes pasan por el codificador visual de Gemma 4 sin ajuste, por lo que su comportamiento en decisiones basadas en imágenes no está validado por el autor.
- No se documentan los idiomas soportados; al heredar el backbone Gemma 4, el comportamiento multilingüe no está garantizado ni evaluado para esta tarea.
- Es un modelo de clasificación, no un generador: no admite tool calling, razonamiento multi-paso ni generación libre de texto.
- El servidor HTTP se enlaza a 127.0.0.1 y no tiene autenticación; no debe exponerse directamente en producción sin una capa de seguridad.
- No se publican datos sobre sesgos, tasa de alucinación (en el sentido de calibración errónea), composición del dataset de entrenamiento ni procesos de alineación.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base google/gemma-4-E2B-it, ya que la información disponible no detalla su licencia.
- El checkpoint ocupa 10,3 GB en bf16 y requiere una GPU de 24 GB; no hay versiones cuantizadas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v2-2611
- Versión anterior (v1): https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v1-2610
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Código (GitHub): https://github.com/strands-labs/strands-decider
- Decision Index 0.3 (Space público): https://huggingface.co/spaces/multimodalart/jev-decision-index
- JevBench: https://benchmarkheaven.com/jev-models
- OpenDecisions (dataset): https://huggingface.co/datasets/jgeuter/OpenDecisions
- DecisionPivot (dataset): https://huggingface.co/datasets/startlux-models/DecisionPivot
- BEV (dataset): https://huggingface.co/datasets/avbiswas/bev-decision
