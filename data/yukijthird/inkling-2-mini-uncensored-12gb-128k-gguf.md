# YukijThird/Inkling-2-Mini-Uncensored-12GB-128K-GGUF

## Resumen

Inkling-2-Mini-Uncensored-12GB-128K-GGUF es una cuantización GGUF publicada por YukijThird del modelo OpenUncensored/Inkling-2-Mini-Uncensored, un transformer con mezcla de expertos (MoE) de tipo "looped" (con bloque central reutilizado) de aproximadamente 26,4 mil millones de parámetros según la model card del autor de la cuantización, aunque los safetensors del modelo base declaran 28.788.294.144 parámetros. El objetivo declarado es conseguir que un modelo de este tamaño quepa, junto con una ventana de contexto de 128.000 tokens, en una única GPU de 12 GB de VRAM, en concreto una Intel Arc B580 con llama.cpp y backend Vulkan.

La aportación técnica principal no es el modelo en sí, sino el proceso de cuantización: el autor rellena con ceros la anchura intermedia de los expertos de 1152 a 1280 (múltiplo de 256) para que las matrices `down` puedan usar los formatos K/IQ de llama.cpp de baja precisión, evitando que toda la pérdida se concentre en `gate_up`. El resultado es un fichero de 9.743 MiB con una divergencia KL media de 0,0369 frente a la referencia NVFP4/Q8_0, un 94,24 % de coincidencia en el token superior y un 77,28 % en MMLU (1.140 preguntas).

El modelo está afinado para uso en código y flujos agénticos, según declara el autor, y no para calidad de conversación. Es un modelo "abliterated" (sin censura) con capacidades de imagen-a-texto según el pipeline declarado, soporte únicamente de inglés y ruso, y licencia Apache 2.0. Es relevante porque demuestra que es posible ejecutar un MoE de ~26B con contexto de 128K en hardware de consumo medio mediante una receta de cuantización cuidadosamente diseñada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de tipo looped; 128 expertos por capa; núcleo de bucle en bloques 6–17 |
| Parametros totales | 28.788.294.144 (safetensors del modelo base); la model card indica 26,4B |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | GGUF: mezcla de IQ2_XS, IQ2_S, IQ3_XXS para expertos; Q6_K para atención, capa de salida y embeddings; precisión original para controladores de bucle y tensores pequeños |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-Uncensored-pad1280-IQ2S-9.5G.gguf`, 9.743 MiB / 10,23 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 128 expertos por capa y arquitectura "looped", en la que un núcleo de bloques (6–17 en la numeración del fichero) se reutiliza. El autor de la cuantización no documenta los datos de entrenamiento del modelo original ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada. El modelo base es un "abliterated" (sin censura) de OpenUncensored/Inkling-2-Mini-Uncensored.

La innovación destacable de esta publicación es el relleno de la anchura de los expertos: las matrices `down` originales tienen 1152 columnas, que no es múltiplo de 256, lo que impide usar los formatos K e IQ de llama.cpp y fuerza a mantenerlas en 4,25–4,5 bits por peso o a degradarlas a formatos de 2 bits muy gruesos, desplazando toda la pérdida a `gate_up` (que acababa en 1 bit o 2 bits bajos). El autor añade filas y columnas de ceros hasta 1280 (5 × 256) antes de cuantizar, de modo que la salida no cambia (una unidad rellenada calcula `act(0) · 0 = 0`), fija `expert_feed_forward_length = 1280` y consigue que las tres matrices de expertos usen la misma tasa de bits. El coste es un 11 % más de elementos almacenados; el beneficio, que ningún tensor de experto caiga en formatos de 1 bit.

La matriz de importancia se calculó en la Arc B580 sobre 120 fragmentos de 2.048 tokens: trayectorias de SWE-agent, conversaciones nativas con tool calls renderizadas con la plantilla de chat del modelo, código en diez lenguajes e instrucciones en ruso. Se mezcló con una matriz de propósito general publicada para este modelo (un tercio de la masa) para no submuestrear expertos poco enrutados. La receta por bloques: bloques 0–5 en IQ2_XS (2,31 bits por peso), bloques 6–19 (incluido el núcleo de bucle 6–17) en IQ2_S (2,56 bits) y bloques 20–23 en IQ3_XXS (3,06 bits).

## Capacidades

- Generación de texto y razonamiento general, con calidad orientada a código y uso agéntico según el autor.
- Capacidades de imagen-a-texto (pipeline declarado `image-text-to-text`).
- Soporte de tool calling / function calling: la matriz de importancia se calibró con conversaciones nativas de tool calls y trayectorias de SWE-agent.
- Uso agéntico multi-paso: el autor menciona explícitamente trayectorias de SWE-agent en el corpus de calibración.
- Capacidades multilingües limitadas a inglés y ruso.
- Modo "thinking" con esfuerzo configurable: la medición de MMLU se hizo con "thinking effort 0", lo que implica que existe un parámetro de esfuerzo de razonamiento.
- Modelo "abliterated": sin las restricciones de rechazo del modelo original.
- Compatible con endpoints (tag `endpoints_compatible`) y conversacional.

## Casos de uso

- Agente de código autónomo en local: con 128K de contexto y calibración específica en trayectorias de SWE-agent, puede mantener el estado de una tarea de reparación de bugs a lo largo de muchas iteraciones de edición y ejecución de tests sin salir de una GPU de 12 GB.
- Asistente de programación en IDE con tool calling: el modelo puede invocar funciones (leer ficheros, ejecutar comandos, consultar documentación) dentro de un bucle agéntico, aprovechando que la cuantización preserva especialmente bien los tensores relevantes para código.
- Automatización de pipelines de CI/CD: integrado vía llama.cpp o un servidor compatible con la API de OpenAI, puede revisar diffs, generar parches y clasificar fallos de test en un nodo con una sola GPU de consumo.
- Procesamiento de documentación técnica larga: la ventana de 128K permite ingerir especificaciones, manuales o bases de código completas en una sola pasada para tareas de resumen, extracción o preguntas y respuestas.
- Análisis de imágenes con texto (OCR, descripción, extracción de datos): el pipeline image-text-to-text permite procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Despliegue en hardware de gama media para investigación: útil para investigadores que necesitan un MoE grande sin censura en una estación de trabajo con Intel Arc, RTX 3060 de 12 GB o similar, con contexto largo y sin depender de la nube.
- Experimentación con modelos sin censura: para estudios de alineación, red-teaming o evaluación de sesgos, al estar "abliterated" y bajo licencia Apache 2.0.

## Benchmarks y rendimiento

Mediciones del autor de la cuantización sobre Intel Arc B580 12 GB, Linux, llama.cpp build 12648, backend Vulkan. La divergencia KL se calculó con `llama-perplexity --kl-divergence` sobre 30 fragmentos de 1.024 tokens de texto reservado (código, trayectorias de agente, tool calls, ruso), disjunto del conjunto de calibración. La referencia es el mismo modelo con expertos en NVFP4 original (bloques 0–19) y el resto en Q8_0.

| Metrica | Este fichero | Referencia / comparacion |
|---|---|---|
| Tamano | 9.743 MiB (10,23 GB) | — |
| KLD media | 0,0369 ± 0,0010 | — |
| KLD mediana | 0,0026 | — |
| Coincidencia token superior | 94,24 % | — |
| Perplejidad | 2,180 | 2,133 (referencia NVFP4/Q8_0) |
| MMLU (1.140 preguntas, thinking effort 0) | 77,28 % (881/1.140) | 79,47 % (modelo sin cuantizar, según la model card original) |

Comparación directa del autor con otra cuantización de los mismos pesos, mismo texto y misma referencia:

| Fichero | Tamano | KLD media | KLD mediana | Token superior | PPL |
|---|---|---|---|---|---|
| Este fichero | 9.743 MiB | 0,0369 ± 0,0010 | 0,0026 | 94,24 % | 2,180 |
| mudler APEX-I-Nano | 10.815 MiB | 0,0430 ± 0,0011 | 0,0035 | 93,86 % | 2,172 |

Cifras reportadas por otros publicadores para el modelo base (textos y referencias distintos, orientativas y no comparables directamente):

| Fichero | Tamano (GB) | KLD media | Token superior |
|---|---|---|---|
| unsloth UD-Q2_K_XL | 9,14 | 0,0595 | 91,6 % |
| SC117 FIT-BALANCED | 9,79 | 0,0895 | 88,5 % |
| Este fichero | 10,23 | 0,0369 | 94,2 % |
| AtomicChat AD-IQ2_XXS | 10,43 | 0,084 | 88,5 % |
| Strata SQ-10 (motor propio) | 10,47 | 0,050 | 92,4 % |
| AtomicChat AD-IQ2_S | 11,56 | 0,047 | 91,3 % |
| unsloth UD-IQ3_XXS | 11,66 | 0,0269 | 94,7 % |

Variante descartada por el autor (eliminación de 24 de los 128 expertos por capa con mayor precisión): 9.660 MiB, KLD 0,0428, token superior 94,54 %, MMLU 68,95 %. El autor concluye que eliminar expertos degrada MMLU en más de 8 puntos, por lo que la estrategia de relleno es superior.

## Requisitos de hardware

- VRAM estimada: 12.018 de 12.216 MiB con contexto de 128K en una Intel Arc B580 de 12 GB (medición del autor). El fichero pesa 9.743 MiB; el resto es caché KV y buffers de cómputo para 128K tokens.
- GPU recomendadas: Intel Arc B580 12 GB (medida), y por capacidad cualquier GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, A100, H100); el autor solo documenta la B580.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más, siempre que se use el contexto completo de 128K con cuidado; con contextos menores el margen de VRAM aumenta.
- Opciones de despliegue: llama.cpp (build 12648 o posterior, backend Vulkan documentado; el fichero carga sin cambios en llama.cpp estándar), y por extensión cualquier herramienta basada en llama.cpp como Ollama o servidores compatibles con la API de OpenAI. vLLM y TGI no están documentados para este fichero.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este fichero (Inkling-2-Mini-Uncensored GGUF) | ~26,4B (MoE, 128 expertos) | 128K | Apache 2.0 | GGUF, 0 descargas, 0 likes en el momento de la consulta |
| mudler Inkling-2-Mini-Uncensored-APEX-I-Nano | mismo modelo base | no disponible | Apache 2.0 (heredada del base) | GGUF, 10.815 MiB |
| unsloth UD-IQ3_XXS (mismo base) | mismo modelo base | no disponible | Apache 2.0 | GGUF, 11,66 GB |
| unsloth UD-Q2_K_XL (mismo base) | mismo modelo base | no disponible | Apache 2.0 | GGUF, 9,14 GB |

Las tres alternativas son cuantizaciones del mismo modelo base, por lo que la comparación relevante es de fidelidad y tamaño: este fichero ofrece la menor KLD media (0,0369) entre las cuantizaciones de ~10 GB medidas con la misma referencia, a costa de ser algo mayor que UD-Q2_K_XL (10,23 frente a 9,14 GB). UD-IQ3_XXS logra mejor fidelidad (KLD 0,0269) pero ocupa 11,66 GB y no cabe con 128K de contexto en 12 GB. No se dispone de comparación con modelos de otros linajes.

## Limitaciones y advertencias

- Modelo "abliterated" y sin censura: puede generar contenido que otros modelos rechazarían; requiere filtros y políticas de uso propios en producción.
- Riesgo de alucinación no evaluado: no se han publicado mediciones de factualidad ni de tasa de alucinación.
- Idiomas limitados a inglés y ruso; el rendimiento fuera de esos idiomas no está documentado y probablemente sea deficiente.
- La cuantización IQ2 introduce pérdida medible: KLD media 0,0369 y 94,24 % de coincidencia en el token superior frente a la referencia; en tareas sensibles a la precisión puede degradarse más que en la evaluación agregada.
- El autor declara explícitamente que la calidad de conversación no era un objetivo; el modelo está afinado para código y uso agéntico.
- La evaluación se realizó sobre un corpus mayoritariamente de código, que es más predecible que el texto general y tiende a dar KLD más baja; las cifras pueden no trasladarse a otros dominios.
- La MMLU se midió con un arnés propio (1.140 preguntas, probabilidades de A/B/C/D, thinking effort 0) y difiere de la reportada por el modelo original (77,28 % frente a 79,47 %); el error de muestreo es de aproximadamente ± 1,2 puntos.
- El relleno de expertos a 1280 aumenta un 11 % los elementos almacenados y depende de que `expert_feed_forward_length = 1280` se respete; herramientas que no lean ese campo correctamente podrían fallar al cargar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un "uncensored" y el usuario asume la responsabilidad del contenido generado.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, y se creó el 24 de noviembre de 2026; no hay validación independiente de las mediciones del autor.
- Solo se documenta el backend Vulkan en Intel Arc; el comportamiento en CUDA u otros backends no está verificado por el autor.

## Enlaces

- Hugging Face (este fichero): https://huggingface.co/YukijThird/Inkling-2-Mini-Uncensored-12GB-128K-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Cuantización alternativa mudler APEX-I-Nano: no disponible como enlace directo en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
