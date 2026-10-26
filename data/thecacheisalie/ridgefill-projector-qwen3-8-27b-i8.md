# TheCacheIsALie/RidgeFill-Projector-Qwen3.8-27B-i8

## Resumen

RidgeFill-Projector-Qwen3.8-27B-i8 no es un modelo de lenguaje: es un conjunto de mapas lineales por capa (un "proyector") que acelera la fase de prefill de Qwen3.8-27B cuando se ejecuta en el fork de llama.cpp `Approximate-Science/llama.cpp-ridgefill`. Lo publica el repositorio TheCacheIsALie, con autoría de la técnica a cargo de Dylan Johnston y tcclaviger, y se distribuye como un único GGUF de 1.452.188.032 bytes (1,5 GB) en INT8. El archivo contiene 1.287.096.832 parámetros propios, independientes de los del modelo base.

El problema que ataca es el coste de tiempo hasta el primer token (TTFT) en contextos largos, donde el prefill domina la latencia. RidgeFill es un acelerador de prefill sin entrenamiento: las capas 0–15 se ejecutan para todas las filas del prompt, mientras que, para el resto de filas (salvo una cola exacta y un conjunto seleccionado de filas exactas), el proyector predice las entradas de las capas 16–63 a partir del estado oculto de la capa 15. La generación posterior al prompt es exacta.

Su relevancia es doble: por un lado, ofrece ganancias medidas de entre 1,25× y 1,31× en TTFT para contextos de 16K a 120K tokens sobre 4× A100 PCIe 40 GB; por otro, cuantifica el coste en calidad, con degradaciones de 1,2 a 1,4 puntos en RULER y LongBench v2. Es material para quien ya sirve Qwen3.8-27B en llama.cpp y quiere reducir latencia de prefill aceptando una salida no idéntica a la del motor original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mapas lineales ridge por capa (proyector de estados ocultos) más correcciones de estado Gated-DeltaNet por capa; no es un modelo de lenguaje, se carga junto a Qwen3.8-27B |
| Parámetros totales | 1.287.096.832 (proyector); parámetros del modelo base: no disponible en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Depende del modelo base (no disponible); el proyector tiene medidas publicadas hasta 120.000 tokens y no interviene con prompts de menos de 8.192 tokens |
| Tipos de cuantización | INT8 (i8) para el proyector, con split 16; el modelo base se ejecuta en GGUF (medido con `Qwen3.8-27B-UD-Q4_K_XL.gguf`) |
| Idiomas soportados | No disponible (los hereda del modelo base) |
| Licencia | Apache-2.0 (aplicada también a los metadatos GGUF) |
| Formato de pesos | GGUF (un único archivo: `ridgefill-projector-qwen3.8-27b-i8-S16.gguf`) |
| Tamaño del archivo | 1.452.188.032 bytes (1,5 GB) |
| SHA256 | 8646d41a5a28d60ef53cc5e1fee4b2bfb20d0775db88d3f89d0731ad9f6b629d |
| Modelo base | Qwen/Qwen3.8-27B |
| Motor compatible | Fork `Approximate-Science/llama.cpp-ridgefill` (flag `--ridgefill`); línea base comparada: llama.cpp upstream 1242be66f |
| DOI de la técnica | 10.5281/zenodo.23179168 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-26 |

## Arquitectura y entrenamiento

RidgeFill se apoya en un conjunto de transformaciones lineales ajustadas por capa ("ridge maps") más correcciones de estado para las capas Gated-DeltaNet del modelo base. La segmentación es explícita: split 16, es decir, las capas 0–15 se calculan de forma exacta para todas las filas del prompt y el proyector estima las entradas de las capas 16–63 a partir del estado oculto de la capa 15. Para preservar la fidelidad se mantienen exactas una cola final del prompt y un conjunto seleccionado de filas, de modo que la generación posterior al prompt es exacta y solo el procesamiento del contexto largo pasa por la aproximación.

La técnica es training-free: no se describe un entrenamiento con descenso de gradiente, ni datos de preentrenamiento, ni fases de RLHF/DPO. El ajuste se realizó específicamente para Qwen3.8-27B y se midió contra la revisión `4ca7207` de `unsloth/Qwen3.8-27B-GGUF` (`Qwen3.8-27B-UD-Q4_K_XL.gguf`), un detalle relevante porque los mapas están calibrados contra una cuantización concreta del modelo base. Mientras RidgeFill está activo, el fork rechaza modelos draft y MTP, por lo que no es combinable con decodificación especulativa en la configuración publicada. No se detalla en la información disponible la composición exacta de capas del modelo base ni el número de tokens usado para el ajuste.

## Capacidades

- Aceleración de prefill en contextos largos: reduce el TTFT entre 1,25× y 1,31× en los puntos medidos (16K, 32K, 65K y 120K tokens) sobre 4× A100 PCIe 40 GB.
- Ejecución exacta para prompts cortos: por debajo de 8.192 tokens no se aplica la aproximación y el resultado coincide con el motor sin RidgeFill.
- Generación exacta posterior al prompt: la aproximación se limita al procesamiento del contexto; la decodificación token a token no pasa por el proyector.
- Modo de bajo consumo de VRAM: el proyector puede residir en VRAM o transmitirse desde el host, con 268 MiB a 1.732 MiB de VRAM extra según contexto.
- Integración con llama.cpp: se carga mediante `--ridgefill` junto a un GGUF de Qwen3.8-27B sin modificar.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo propios: todas esas funciones las aporta el modelo base.
- No dispone de modo thinking, audio ni procesamiento multimodal propio.

## Casos de uso

- RAG sobre documentación extensa: con prompts de 16K a 120K tokens, el proyector recorta el tiempo hasta el primer token entre un 25 % y un 31 %, lo que se traduce directamente en menor latencia percibida al inyectar muchos fragmentos recuperados en cada consulta.
- Análisis de contratos o expedientes largos: para documentos que superan los 8.192 tokens, el pipeline mantiene la calidad de generación exacta y solo aproxima la lectura del contexto, aceptando una caída medida de 1,39 puntos en LongBench v2 con CoT.
- Asistentes con historial de conversación extenso: al reenviar contexto acumulado en cada turno, el coste de prefill crece de forma no lineal; RidgeFill amortigua ese coste en despliegues con `llama-server` del fork.
- Preguntas sobre bases de código en un servidor on-premise: útil cuando el repositorio se inyecta como contexto largo y el cuello de botella es la latencia de entrada, no la decodificación.
- Procesamiento por lotes de resúmenes largos: en trabajos donde el TTFT domina el tiempo total por documento, el 1,31× a 65K tokens reduce el tiempo de pared de la flota sin cambiar el modelo.
- Evaluación de contextos largos con RULER o LongBench: se puede reconstruir el mismo protocolo publicado para comprobar la degradación en el hardware propio antes de adoptar la técnica en producción.
- Inferencia en servidores con VRAM justa: el modo "streamed from host" añade solo 268 MiB a 16K tokens (frente a 1.592 MiB en VRAM), lo que permite usarlo en despliegues donde no cabe el proyector completo en GPU.

## Benchmarks y rendimiento

Medidas sobre 4× A100 PCIe 40 GB con CUDA. Línea base: llama.cpp upstream 1242be66f, mismos flags salvo RidgeFill.

| Contexto | Aceleración TTFT (proyector en VRAM) | Aceleración TTFT (proyector desde host) | VRAM extra (VRAM / host) |
|---|---|---|---|
| 16.384 | 1,25× | 1,19× | 1.592 / 268 MiB |
| 32.768 | 1,30× | 1,27× | 1.802 / 478 MiB |
| 65.536 | 1,31× | 1,30× | 2.270 / 944 MiB |
| 120.000 | 1,28× | 1,29× | 3.014 / 1.732 MiB |

| Benchmark | Sin RidgeFill | Con RidgeFill | Δ [IC 95 %] |
|---|---|---|---|
| RULER 16K (13 tareas × 20) | 85,69 | 84,51 | −1,19 [−3,13, +0,79] |
| RULER 32K (13 tareas × 20) | 87,85 | 86,42 | −1,42 [−3,21, +0,35] |
| LongBench v2, CoT oficial, longitud completa (503 ítems) | 38,57 | 37,18 | −1,39 [−5,17, +2,19] |

Concordancia posterior al prompt con el motor original, sobre 100 documentos de LongBench por longitud: top-1 del 94,6 % a 16K y del 93,6 % a 32K; KL mediana de 0,0040 y 0,0042 nats por token respectivamente. El autor advierte de que la salida no es idéntica a la de llama.cpp sin RidgeFill.

## Requisitos de hardware

- VRAM del proyector: 1.592 MiB a 16K, 1.802 MiB a 32K, 2.270 MiB a 65K y 3.014 MiB a 120K si reside en VRAM; 268, 478, 944 y 1.732 MiB respectivamente si se transmite desde el host.
- Hardware de referencia: 4× A100 PCIe 40 GB fue la configuración usada para todas las medidas publicadas; no hay datos para otras GPU.
- VRAM del modelo base: no publicada. Como estimación a partir del nivel de cuantización empleado (Q4_K_XL sobre un modelo de 27B), los pesos rondarían los 16–17 GB, a los que habría que sumar caché KV, cuyo tamaño depende de detalles arquitectónicos del modelo base no disponibles.
- GPU de consumo: una RTX 4090 de 24 GB podría alojar los pesos cuantizados, pero no hay medidas de este escenario ni garantía de que quepa la caché KV a 120K tokens; el proyector añadiría entre 1,5 y 3 GB en modo VRAM.
- Despliegue: exclusivamente `llama-server` del fork `Approximate-Science/llama.cpp-ridgefill` con el flag `--ridgefill`; en la información disponible no se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Limitación operativa: los modelos draft y MTP se rechazan mientras RidgeFill está activo, así que no se puede sumar decodificación especulativa.
- Throughput y latencia de decodificación: no disponibles; las cifras publicadas cubren únicamente TTFT.

## Comparativa con modelos similares

| Alternativa | Mecanismo | Aceleración de prefill | Impacto en calidad | Combinable con RidgeFill |
|---|---|---|---|---|
| Este proyector (RidgeFill, split 16, INT8) | Predicción lineal de estados de las capas 16–63 desde la capa 15 | 1,25×–1,31× en TTFT | −1,19 a −1,42 puntos en RULER; −1,39 en LongBench v2 | No aplica |
| llama.cpp upstream (sin RidgeFill) | Prefill exacto | 1,00× (referencia) | Ninguno | No aplica |
| Modelos draft / MTP en llama.cpp | Decodificación especulativa | Acelera decodificación, no prefill | Depende del draft | No: el fork los rechaza con RidgeFill activo |
| Otras variantes de proyector RidgeFill (otro split, otra cuantización) | Igual, con otros parámetros | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada proyectos equivalentes de aceleración de prefill sin entrenamiento para Qwen3.8-27B con los que comparar parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí solo y requiere un GGUF de Qwen3.8-27B y un fork concreto de llama.cpp; sin ambos no es utilizable.
- La salida no es idéntica a la del motor original: la concordancia top-1 es del 94,6 % a 16K y del 93,6 % a 32K, con KL mediana de 0,0040 y 0,0042 nats por token. Cualquier flujo que dependa de reproducibilidad bit a bit se rompe.
- Degradación de calidad medible aunque con intervalos de confianza amplios: las caídas de 1,19 a 1,42 puntos quedan cerca del ruido estadístico, pero la de LongBench v2 presenta un IC de [−5,17, +2,19], lo que exige validación propia antes de adoptarlo.
- Los mapas están ajustados para Qwen3.8-27B y calibrados contra `Qwen3.8-27B-UD-Q4_K_XL.gguf` (revisión 4ca7207); usar otra cuantización del modelo base puede degradar la fidelidad sin que el autor publique medidas.
- Sin ganancia por debajo de 8.192 tokens: los prompts cortos se ejecutan de forma exacta y no se benefician del proyector.
- Incompatibilidad con decodificación especulativa y MTP mientras el flag está activo.
- Dependencia de un fork no upstream de llama.cpp: implica mantenimiento propio, riesgo de divergencia con el proyecto principal y ausencia de soporte en herramientas estándar.
- Coste en VRAM no despreciable en modo residente (hasta 3.014 MiB a 120K tokens).
- Sesgos, comportamiento multilingüe y riesgos de alucinación: no documentados en la información disponible; los hereda del modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar aparte la licencia efectiva del modelo base Qwen3.8-27B.
- Madurez: 0 descargas y 0 likes, publicación creada y actualizada el mismo día; sin validación de la comunidad ni datos de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/TheCacheIsALie/RidgeFill-Projector-Qwen3.8-27B-i8
- Fork de llama.cpp: https://github.com/Approximate-Science/llama.cpp-ridgefill
- Guía de uso (quick start, Qwen3.8-27B): https://github.com/Approximate-Science/llama.cpp-ridgefill/blob/main/RIDGEFILL.md
- DOI de la técnica: https://doi.org/10.5281/zenodo.23179168
- GGUF del modelo base usado en las medidas: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
