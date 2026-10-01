# tielmane/decider-12b-NPU-LPBQ-X-Elite

## Resumen

decider-12b-NPU-LPBQ-X-Elite es una conversión optimizada del modelo Mapika/decider-12b v2 (a su vez un fine-tune de Gemma-4-12B-it con un LoRA de seguimiento de estado fusionado, orientado a decisiones tipadas) para ejecutarse íntegramente en la NPU Hexagon de un portátil con Snapdragon X Elite. Lo publica el usuario tielmane y utiliza ONNX Runtime con el execution provider QNN, sin necesidad de test-signing ni de modificar Secure Boot. El pipeline declarado es text-classification, ya que el modelo original responde preguntas tipadas (elección múltiple, sí/no, puntuación) en lugar de generar texto libre.

El interés de esta ficha radica en que demuestra inferencia local de un modelo de 12 000 millones de parámetros en hardware ARM de consumo, cuantizado a 4 bits (LPBQ, bloque 32) y con un grafo ONNX estático de 576 tokens empaquetado en 12 trozos de 4 capas cada uno (capas 0 a 47). Según el autor, consigue aproximadamente 2,2 segundos por petición con unos 6 GB de pesos de 4 bits mapeados en la NPU, a costa de limitar cada pasada a 576 tokens, muy por debajo de la ventana de contexto de 32 000 tokens del modelo base.

Es relevante ahora porque combina tres piezas que están madurando a la vez: cuantización de 4 bits de bajo error para aceleradores heterogéneos, compilación de grafos para NPU Qualcomm mediante ONNX Runtime QNN y despliegue de modelos de tamaño medio en portátiles Windows on ARM sin GPU dedicada. El repositorio ocupa 11,9 GB, tiene licencia Apache-2.0 y, en el momento de la consulta, registra 0 descargas y 2 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Gemma 4 12B); grafo ONNX estático dividido en 12 chunks de 4 capas, con opset-23 RMSNormalization y Gelu |
| Parametros totales | 12 000 millones (heredados de Gemma-4-12B-it) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 576 tokens por pasada (grafo estático); el modelo base soporta 32 000 tokens |
| Tipos de cuantizacion | Pesos int4 LPBQ con bloque de 32, clipping minimizador de error y escalas por bloque (1..15); activaciones uint16 con QDQ; GGUF Q8_0 para las piezas del lado CPU |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (repo derivado); modelo base Mapika/decider-12b bajo Apache-2.0, construido sobre Gemma 4 12B de Google |
| Formato de pesos | ONNX (.onnx + .data), binario de contexto QNN compilado (.bin), GGUF Q8_0 (lado CPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma-4-12B-it, un transformer decoder denso de la familia Gemma 4, con 48 capas (los 12 chunks de 4 capas cubren las capas 0 a 47). Sobre él, Mapika aplicó un LoRA de seguimiento de estado que se fusionó en los pesos, especializando el modelo para decisiones tipadas en lugar de generación abierta. Esta conversión concreta no entrena nada: parte de un GGUF Q8_0 generado con el convertidor de llama.cpp (arquitectura `gemma4`, 667 tensores, 12,7 GB) y lo transforma en grafos ONNX y en un contexto compilado para la HTP v73 del Snapdragon X Elite.

El proceso de construcción consta de cinco etapas documentadas por el autor. Primero, la conversión a GGUF Q8_0 desde Mapika/decider-12b (commit 8ac1efa), fijando llama.cpp al commit 911f6cdc. Segundo, la generación de 12 grafos ONNX estáticos de 4 capas con operadores de opset-23. Tercero, la calibración de las activaciones uint16 usando 32 secuencias de un conjunto sintético público (`harness/items/suite-v1.jsonl`) renderizadas en el formato de prompt de Decider, sin datos privados. Cuarto, la cuantización de pesos a int4 LPBQ con bloque 32. Y quinto, el empaquetado de todas las filas de una petición en una sola pasada detrás de un prefijo compartido, con las tablas RoPE y las máscaras como entradas del grafo.

La peculiaridad de diseño es que solo los pesos del decodificador viven en la NPU; el prompt, los embeddings de tokens, la normalización final y la cabeza de respuesta se ejecutan en CPU. La cabeza de respuesta aplica soft-cap a los logits de la letra de respuesta y los divide por las temperaturas de Decider según el tipo de pregunta.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de elección múltiple, sí/no y puntuación, devolviendo probabilidades en el mismo formato de cable que TypeSafe/Jev.
- Seguimiento de estado conversacional: el LoRA fusionado permite mantener el estado de la conversación a lo largo de preguntas encadenadas.
- Procesamiento por lotes en una sola pasada: todas las filas de una petición se empaquetan en un único pase tras un prefijo compartido.
- Servicio compatible con Jev: expone un endpoint `POST /v1/systemone` mediante `decider-npu/npu_decider_serve.py`.
- Ejecución íntegra en NPU Hexagon (HTP v73) mediante ONNX Runtime QNN, sin GPU dedicada.
- Autotest en el arranque y servidor deliberadamente mono-hilo por limitaciones del proveedor QNN.
- Capacidades multimodales de audio y vídeo del Gemma 4 12B original: no confirmadas en esta conversión, que maneja únicamente texto.

## Casos de uso

- Clasificación de intenciones en asistentes locales: el modelo puede etiquetar consultas de usuario en categorías predefinidas en una sola pasada de 576 tokens, con 2,2 segundos por petición, lo que resulta adecuado para asistentes personales en portátiles ARM sin GPU.
- Enrutado de peticiones en pipelines de agentes: dado que emite decisiones tipadas con probabilidades, sirve como router que decide qué herramienta o subagente invocar antes de llamar a un modelo generativo mayor.
- Moderación de contenido por categorías: formular cada regla como pregunta de sí/no permite obtener una puntuación de riesgo por regla, aprovechando el empaquetado por lotes para evaluar varias reglas en un solo pase.
- Extracción de decisiones estructuradas: convierte texto libre en campos tipados (sí/no/elección/score) para alimentar bases de datos o formularios, sin necesidad de parsear texto generado.
- Triaje de tickets de soporte: clasifica incidencias entrantes por urgencia y tipo, ejecutándose localmente en el portátil del técnico y evitando enviar datos a la nube.
- Validación rápida en CI de sistemas de decisión: con un endpoint HTTP estable, se usa como oráculo de comparación frente a la versión en CPU o a versiones anteriores del modelo.
- Investigación en cuantización para NPU: como referencia reproducible para medir la degradación de int4 LPBQ frente a un modelo de referencia fp32 en CPU.

## Benchmarks y rendimiento

Los resultados publicados por el autor se obtuvieron con el arnés público de JevBench sin modificar, sobre un Snapdragon X Elite X1E80100. La verificación cruzada frente a una referencia PyTorch en fp32 sobre CPU da la misma respuesta en 6 de 6 filas de prueba, con una diferencia mediana de logits de 1,15 atribuida al redondeo de 4 bits.

| Modelo | Easy (48) | Standard (72) | Hard (50 ítems que caben en el prompt largo de Winnow) |
|---|---|---|---|
| Este modelo (NPU, 4 bits) | 1.000 | 0.986 | 0.700 |
| Jev 1.13.0 (TypeSafe API) | 1.000 | 0.986 | 0.760 |
| Winnow-12B, NPU 4 bits | 1.000 | 0.972 | 0.680 |
| decider-2b v11, CPU | 1.000 | 0.889 | 0.680 |

Datos adicionales aportados por el autor: de los 111 ítems del nivel Hard, 53 caben en 576 tokens con el formato de prompt de Decider y sobre esos 53 el modelo obtiene 0.717. Mapika reporta 0.712 en el nivel Hard completo a precisión total, pero cubre ítems distintos y no es directamente comparable.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Snapdragon X Elite (X1E80100), NPU Hexagon HTP v73, Windows 11 ARM64. Probado en octubre de 2026.
- Memoria: aproximadamente 6 GB de pesos de 4 bits mapeados en la NPU.
- Pesos del lado CPU: requieren generar un GGUF Q8_0 de 12,7 GB a partir del modelo base.
- Entorno: Python 3.12 arm64 con decider-ai 1.8.1, onnxruntime 1.30.0, onnxruntime-qnn 2.6.0, onnx, transformers, fastapi, uvicorn y torch desde el índice CPU de PyTorch (PyPI no ofrece torch para Windows ARM64).
- Despliegue: servidor propio `decider-npu/npu_decider_serve.py` con endpoint `POST /v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión concreta.
- Compilación del contexto: en un X Elite con la misma versión de QNN, los ficheros `*_ctx.onnx` cargan directamente; en cualquier otro hardware hay que borrarlos y ejecutar `winnow-npu/scripts/compile_chain.py`.
- Latencia: aproximadamente 2,2 segundos por petición con todas las preguntas empaquetadas en un solo pase, según el autor. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto efectivo | JevBench Hard | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-12b-NPU-LPBQ-X-Elite | 12B | 576 tokens por pasada | 0.700 (50 ítems) | Apache-2.0 | Hugging Face, ONNX/QNN, 0 descargas |
| Winnow-12B-NPU-LPBQ-X-Elite | 12B | No disponible | 0.680 | Apache-2.0 | Hugging Face, mismo pipeline |
| Jev 1.13.0 (TypeSafe API) | No disponible | No disponible | 0.760 | No disponible | API gestionada |
| decider-2b v11 | 2B | No disponible | 0.680 | No disponible | Ejecución en CPU |
| Mapika/decider-12b (referencia) | 12B | 32 000 tokens | 0.712 (nivel completo, ítems distintos) | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Ventana efectiva de 576 tokens por pasada, frente a los 32 000 tokens del modelo base; las peticiones más largas se rechazan.
- La cuantización a 4 bits altera decisiones ajustadas: el autor advierte de pérdida esperable en razonamiento de varios pasos frente a bf16.
- Solo se ha probado en un Snapdragon X Elite (HTP v73) con Windows 11 ARM64 en octubre de 2026; no hay validación en otros SoC ni versiones de QNN sin recompilar.
- El servidor es mono-hilo por una limitación conocida del proveedor QNN, lo que restringe la concurrencia.
- La cabeza de respuesta, los embeddings y la normalización final dependen de una implementación en CPU concreta, lo que añade superficie de fallo fuera de la NPU.
- No es una publicación oficial de Mapika; el soporte y la mantenibilidad recaen en el autor del repositorio.
- Aunque el repositorio declara Apache-2.0, el modelo base deriva de Gemma 4 12B de Google, por lo que conviene revisar los términos de la licencia Gemma original antes de un uso comercial.
- No se dispone de información sobre idiomas soportados ni sobre sesgos específicos de este fine-tune.
- Riesgo de alucinación en la formulación de decisiones: aunque la salida es tipada, el modelo puede asignar alta probabilidad a una opción incorrecta en ítems ambiguos.
- El repositorio presenta 0 descargas y 2 likes, por lo que hay poca validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tielmane/decider-12b-NPU-LPBQ-X-Elite
- Modelo base: https://huggingface.co/Mapika/decider-12b
- Conversión hermana (Winnow-12B): https://huggingface.co/tielmane/Winnow-12B-NPU-LPBQ-X-Elite
- Repositorio con el código y la documentación completa: https://github.com/esterhuizen/system-one-on-snapdragon
- Guía de despliegue en la NPU: https://github.com/esterhuizen/system-one-on-snapdragon/blob/main/docs/WINNOW-NPU.md
- Arnés de evaluación JevBench: https://github.com/fstandhartinger/jevbench
- Incidencia de onnxruntime-qnn sobre el servidor mono-hilo: https://github.com/onnxruntime/onnxruntime-qnn/issues/892
- Incidencia de onnxruntime-qnn sobre la cuantización LPBQ: https://github.com/onnxruntime/onnxruntime-qnn/issues/893
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Gemma 4 12B en Ollama: https://ollama.com/library/gemma4:12b
