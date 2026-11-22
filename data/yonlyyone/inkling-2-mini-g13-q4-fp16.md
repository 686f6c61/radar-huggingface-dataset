# yonlyyone/Inkling-2-Mini-g13-q4-fp16

## Resumen

Inkling-2-Mini-g13-q4-fp16 es una conversión cuantizada a 4 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone y orientada específicamente a la inferencia en GPUs de Apple Silicon (arquitecturas G13/G14 de las familias M1 y M2). El modelo conserva la arquitectura Mixture-of-Experts (MoE) del original, con aproximadamente 6.896 millones de parámetros totales, y procesa entradas de imagen y texto (pipeline `image-text-to-text`).

La particularidad de esta conversión es el uso de `float16` en lugar de `bfloat16` para todos los tensores no cuantizados (normalizaciones, convoluciones cortas, puertas de mensaje, escalas y sesgos afines, torre de visión). Según el autor, en las GPUs M1 y M2 el tipo `bfloat16` impone una penalización de rendimiento de aproximadamente el 28 % en la fase de prefill respecto a `float16` nativo, por lo que este checkpoint busca maximizar el throughput en hardware Apple previo a NAX.

El resultado es un artefacto de unos 17,3 GB pensado para Macs con 24, 32, 64 o 128 GB de memoria unificada, ejecutable con el motor de inferencia `g13`. Es relevante para desarrolladores que quieran desplegar localmente un modelo multimodal MoE en portátiles y equipos de sobremesa de Apple sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con torre de visión; etiqueta `inkling2_loop` |
| Parametros totales | 6.896.142.848 (~6,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido rendimientos hasta 150k tokens, pero no se declara la ventana máxima oficial) |
| Tipos de cuantizacion | 4 bits: expertos enrutados con cuantización original (NVFP4 capas 0-19, MXFP8 capas 20-23); proyecciones densas en 4-bit affine con `group_size=64`; escalas y sesgos en `float16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y capacidad multimodal de entrada imagen-texto, identificado en el repositorio con la etiqueta `inkling2_loop`. Esta conversión no reentrena el modelo: mantiene intactos los pesos cuantizados de los expertos enrutados (capas 0-19 en NVFP4 y capas 20-23 en MXFP8, según la cuantización original de Thinking Machines) y recastea a `float16` todos los tensores no cuantizados, incluidas las proyecciones densas de atención, los embeddings, la `lm_head`, las normalizaciones, las convoluciones cortas, las puertas de mensaje y la torre de visión. El autor indica que verificó que los valores en `float16` son finitos y sin desbordamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO. La innovación técnica destacable de esta ficha es la sustitución de `bfloat16` por `float16` para eliminar la penalización de prefill en GPUs M1/M2, junto con el uso de caché KV cuantizada a Q8 (con huellas de 72 MB a 4k de contexto y 2,2 GB a 120k).

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Procesamiento de entradas mixtas imagen-texto (`image-text-to-text`): el modelo incluye torre de visión en `float16`.
- Razonamiento y respuesta sobre contexto largo: se han medido ejecuciones con agentes en vivo a 120k tokens y pruebas de hasta 150k.
- Uso en flujos de agente de múltiples pasos (el autor cita un "live agent" a 120k de contexto).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno en un Mac con 24-128 GB de memoria unificada, con decodificación de 25,1 t/s a 4k de contexto en un M1 Max de 64 GB, suficiente para interacción en tiempo real.
- Análisis de documentos e imágenes en local: al ser `image-text-to-text`, permite adjuntar capturas, diagramas o páginas escaneadas y consultar su contenido sin enviar datos a la nube, algo relevante por privacidad.
- Agentes autónomos de contexto largo: con 214 t/s de prefill y 17,3 t/s de decode a 120k tokens (caché KV Q8 de 2,2 GB), es viable ejecutar bucles de agente que arrastren historial extenso de herramientas y observaciones.
- Prototipado de pipelines multimodales en Apple Silicon: desarrolladores que trabajen con MLX pueden validar flujos imagen-texto en M1/M2 antes de migrar a hardware con GPU dedicada.
- Resumen y extracción de información de conversaciones largas: el rendimiento sostenido a 60k-150k tokens permite procesar transcripciones o hilos de soporte completos en una sola pasada.
- Inferencia de bajo consumo en portátiles: con 17,3 GB en disco y memoria unificada compartida, un MacBook con 32 GB puede servir el modelo sin GPU externa, útil para demos y entornos de desarrollo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de rendimiento de inferencia medidas en un Apple M1 Max de 64 GB (GPU de 24 núcleos) con el motor `g13`:

| Contexto | Prefill (chunk 2048) | Decode | Huella de caché KV Q8 |
|---:|---:|---:|---:|
| 4k | 420 t/s | 25,1 t/s | 72 MB |
| 60k | ~285 t/s | ~20 t/s | 1,1 GB |
| 120k (agente en vivo) | 214 t/s (~200 t/s neto) | 17,3 t/s | 2,2 GB |
| 150k | ~190 t/s | ~16 t/s | 2,7 GB |

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa ~17,3 GB en disco; el autor lo recomienda para Macs con 24, 32, 64 o 128 GB de memoria unificada.
- GPU objetivo: Apple Silicon M1 y M2 (arquitecturas G13/G14, previas a NAX). No se declara soporte para M3 o posteriores más allá de la etiqueta `m3` del repositorio.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el formato es MLX y no se indica conversión para CUDA.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Apple Silicon de gama consumer con 24 GB o más de memoria unificada.
- Despliegue: motor `g13` (`g13 pull q4`, `g13 serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; medidos en M1 Max 64 GB con 24 núcleos de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q4-fp16 (este) | ~6,9 B (MoE) | no disponible | Apache 2.0 | MLX, Apple Silicon | FP16 tuning para M1/M2, 17,3 GB |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base multimodal MoE |
| mlx-community/Inkling-2-Mini-4bit | no disponible | no disponible | Apache 2.0 | MLX | Conversión 4-bit de referencia, presumiblemente en bfloat16 |

No se dispone de datos de rendimiento de calidad para comparar con alternativas de otros fabricantes; la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es una conversión de un tercero, no una publicación oficial de Thinking Machines.
- No hay benchmarks de calidad publicados para esta conversión; el impacto de la cuantización 4-bit en tareas de razonamiento, código o matemáticas no está documentado.
- La cuantización mixta (NVFP4, MXFP8 y affine 4-bit) puede introducir degradación no medida respecto al modelo base en `bfloat16`.
- La ventana de contexto oficial no se declara; las pruebas a 150k no garantizan que el modelo base haya sido entrenado para esa longitud.
- Idiomas soportados no disponibles; riesgo de comportamiento degradado fuera de los idiomas del entrenamiento original.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluación publicada al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base y de la conversión de referencia de mlx-community.
- Dependencia del motor `g13`, que no es un runtime estándar del ecosistema; la portabilidad a otros stacks MLX no está garantizada.
- Rendimiento medido solo en M1 Max 64 GB; en Macs de 24 GB la ventana de contexto práctica quedará limitada por la memoria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q4-fp16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión 4-bit de referencia: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Issue de MLX-LM citada por el autor: `ml-explore/mlx-lm#2086`
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
