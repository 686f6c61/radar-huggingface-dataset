# vblanco/pplx-decider-flash-v1.3-GGUF

## Resumen

pplx-decider-flash-v1.3-GGUF es la conversión a formato GGUF del modelo de decisión pplx-decider-flash-v1.3 desarrollado por Perplexity AI, publicada por el usuario vblanco. No es un modelo generativo al uso: se trata de un modelo de decisión ("decision model") de 4.841.450.496 parámetros (aproximadamente 5B) construido sobre un backbone Qwen3.5-4B que responde preguntas de tipo `noul` (sí/no), `choice` (elección entre opciones) y `score` en un único forward pass, sin generar tokens de forma autoregresiva.

La relevancia de esta ficha reside en que el modelo base pertenece a la categoría de modelos "system-one" o de decisión rápida: en lugar de producir texto, lee un estado, opcionalmente imágenes, y un conjunto de preguntas, y devuelve directamente las probabilidades o elecciones asociadas. Esta conversión GGUF permite ejecutar el modelo en llama.cpp, pero requiere una rama específica del runtime (no funciona con llama.cpp estándar) porque el protocolo v4 emplea atención no causal en las capas de atención completa y lee la respuesta en un marcador `<|fim_suffix|>`.

El paquete incluye cuantizaciones desde BF16 hasta IQ2_XS, además de la torre de visión (`mmproj`) necesaria para preguntas sobre imágenes, y un parche que reproduce los cambios de la rama de llama.cpp utilizada. El modelo está publicado bajo licencia Apache 2.0 y soporta entrada image-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) con atención no causal en capas de atención completa; modelo de decisión, no generativo |
| Parámetros totales | 4.841.450.496 (~5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | configurable en llama.cpp; ejemplo de la model card con `-c 32768` (32.768 tokens por slot) y hasta `-c 65536` con menos slots |
| Tipos de cuantización | BF16, Q8_0, Q6_K, MACaQ-IQ4_XS, MACaQ-IQ2_XS (esta última no recomendada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + `mmproj` BF16 para la torre de visión |
| Modelo base | perplexity-ai/pplx-decider-flash-v1.3 |
| Pipeline | image-text-to-text |
| Tamaño del repo | 27,0 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone Qwen3.5-4B y se especializa como modelo de decisión: en lugar de generar texto token a token, procesa en un solo batch (atención no causal en las capas de atención completa) un estado opcional, imágenes opcionales y un conjunto de preguntas tipadas (`noul`, `choice`, `score`), devolviendo directamente las probabilidades o la elección para cada pregunta. El protocolo v4 lee la respuesta en un marcador `<|fim_suffix|>` tras un separador `<|fim_middle|>`, y una secuencia corresponde a una pregunta.

La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esa información correspondería a la model card del modelo base de Perplexity, no incluida en la información proporcionada. La innovación técnica destacable es el propio paradigma de decisión en un único forward pass (sin decodificación autoregresiva) y, en el lado de la cuantización, el uso del runtime MACaQ (vectores `pre_scale` por capa lineal y bloque Hadamard `macaq.hadamard_block`) sobre la ruta de pesos con Hadamard plegado de llama.cpp, necesario para los dos ficheros MACaQ.

## Capacidades

- Respuesta a preguntas de decisión de tres tipos: `noul` (sí/no), `choice` (selección entre criterios con etiquetas) y `score` (puntuación).
- Procesamiento conjunto de texto e imágenes (pipeline image-text-to-text); la torre de visión admite imágenes de 65.536 a 1.638.400 píxeles.
- Entrada de estado estructurado, incluido JSON, con escape de texto que contenga tokens especiales.
- Evaluación de múltiples preguntas en una sola petición sobre el mismo estado e imágenes.
- Inferencia en un único forward pass por pregunta, sin generación de tokens (paradigma "system-one").
- Servicio HTTP mediante el endpoint `/v1/systemone` de la rama de llama.cpp `pplx-decider-v4-macaq`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni cadenas de razonamiento).
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación y clasificación de imágenes: enviar una imagen y varias preguntas `noul` (por ejemplo, "¿está pixelada?") o `choice` (material, tipo de contenido) en una sola petición, aprovechando que el modelo devuelve la decisión sin generar texto y con baja latencia.
- Enrutamiento de peticiones en pipelines: usar preguntas `choice` para decidir a qué rama de un sistema debe ir una entrada (idioma, dominio, tipo de documento), integrándolo en el servidor llama.cpp mediante `/v1/systemone`.
- Etiquetado automático de datasets: procesar lotes de imágenes con preguntas de `score` o `choice` para asignar metadatos (material, calidad, presencia de objetos) de forma consistente y verificable contra la implementación de referencia.
- Control de calidad de contenido visual: detectar artefactos como pixelación o texturas anómalas con preguntas `noul` antes de publicar imágenes en una plataforma.
- Filtrado previo en sistemas RAG o de atención al cliente: dado un estado textual (JSON) y una pregunta de `choice`, decidir la categoría o la acción a tomar antes de invocar un modelo generativo mayor, reduciendo coste y latencia.
- Evaluación de decisiones en investigación: comparar las probabilidades del modelo con la implementación de referencia de Perplexity para estudiar calibración y estabilidad de modelos de decisión, usando los ficheros BF16 y Q8_0 como base de comparación.

## Benchmarks y rendimiento

La model card incluye una validación frente a la implementación de referencia de Perplexity (paquete `pplx_decider`, Transformers, BF16, CUDA) sobre 11 peticiones, 74 respuestas en total (10 imágenes de 256 a 512 px con 7 preguntas cada una, más una petición de texto con estado JSON, texto con tokens especiales, instrucciones por defecto y criterios `noul`):

| Fichero | Misma elección | Brecha mediana de probabilidad | Brecha media | Respuestas con desvío > 0,05 | Brecha máxima |
|---|---|---|---|---|---|
| BF16 | 72/74 | 0,0035 | 0,0064 | 0 | 0,037 |
| Q8_0 | 71/74 | 0,0047 | 0,0081 | 0 | 0,044 |
| Q6_K | 73/74 | 0,0065 | 0,0111 | 1 | 0,069 |
| MACaQ-IQ4_XS | 67/74 | 0,0151 | 0,0243 | 8 | 0,192 |
| IQ4_XS (plano, no incluido en el repo) | 70/74 | 0,0209 | 0,0277 | 10 | 0,150 |
| MACaQ-IQ2_XS | 68/74 | 0,0582 | 0,0778 | 40 | 0,395 |

La model card menciona además benchmarks de precisión sobre el conjunto público de texto de Decision Index 0.3 (600 peticiones estratificadas sobre 46 benchmarks, 4.484 preguntas, 3.664 con respuesta esperada) y compara con tres modelos de decisión Liquid d1 (Q8_0, mismo servidor), pero los valores numéricos de esa tabla no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada según fichero: BF16 9,70 GB; Q8_0 5,16 GB; Q6_K 3,99 GB; MACaQ-IQ4_XS 2,79 GB; MACaQ-IQ2_XS 1,93 GB; torre de visión (`mmproj` BF16) 0,68 GB adicionales.
- El fichero Q8_0 (5,16 GB) más el `mmproj` (0,68 GB) caben en GPUs de consumo con 8 GB o más de VRAM; Q6_K y las cuantizaciones MACaQ caben en GPUs de 4-8 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la rama de llama.cpp se compila con `-DGGML_CUDA=ON` y la validación de referencia se ejecutó en CUDA.
- Opciones de despliegue: exclusivamente la rama `pplx-decider-v4-macaq` de llama.cpp (basada en b12359, commit `b1b770d`, más 4 commits) o el parche `llama.cpp-pplx-decider-v4-macaq.patch` aplicado sobre ese commit. llama.cpp estándar no ejecuta estos ficheros correctamente. No hay soporte indicado para vLLM, Ollama ni TGI.
- Configuración de referencia: `llama-server -m ...-Q8_0.gguf --mmproj mmproj-...-BF16.gguf -ngl 99 -np 8 -c 32768 -b 4096 -ub 4096`; para documentos largos, `-np 2 -c 65536 -b 32768 -ub 32768`. `-b`/`-ub` deben cubrir el prompt más largo porque la pregunta se lee en un solo batch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3 (este, GGUF) | ~5B | configurable (hasta 65.536 en ejemplos) | Decisión en un forward pass, texto e imagen | Apache 2.0 | GGUF en HF; requiere rama de llama.cpp |
| Liquid d1 (Q8_0) | no disponible | no disponible | Modelo de decisión | no disponible | Mencionado como referencia en los benchmarks de la model card |
| pplx-decider-flash-v1.3 (original de Perplexity) | ~5B | no disponible | Decisión, texto e imagen | Apache 2.0 | Pesos originales en HF (referencia BF16/CUDA) |

Los tres modelos Liquid d1 se incluyen en la model card como contexto comparativo, pero sus especificaciones y resultados numéricos no están detallados en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por Perplexity; los resultados pueden diferir de la implementación de referencia.
- No funciona con llama.cpp estándar: requiere la rama `pplx-decider-v4-macaq` o aplicar el parche sobre el commit `b1b770d`; el tipo de decisión antiguo de llama.cpp corresponde a checkpoints v1 y no es compatible con el protocolo v4.
- La cuantización MACaQ-IQ2_XS no se recomienda: pierde aproximadamente 7 puntos en texto y 4 en visión, con 40 de 74 respuestas desviadas más de 0,05 respecto a la referencia.
- El modelo no genera texto ni razonamiento multi-paso; no es adecuado para tareas generativas, de agente o de tool calling.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un clasificador de decisión, los errores se manifiestan como elecciones o puntuaciones incorrectas, no como texto inventado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y de los datos de entrenamiento debe verificarse en la model card de Perplexity.
- En producción, `-b`/`-ub` deben dimensionarse para el prompt más largo (estado, imágenes y pregunta), lo que condiciona el uso de contexto largo con muchos slots.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vblanco/pplx-decider-flash-v1.3-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Rama de llama.cpp: https://github.com/vblanco20-1/llama.cpp/tree/pplx-decider-v4-macaq
- Release de llama.cpp b12359: https://github.com/ggml-org/llama.cpp/releases/tag/b12359
- MACaQ: https://github.com/huawei-csl/MACaQ
- Decision Index: https://github.com/apolinario/decision-index
