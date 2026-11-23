# Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF

## Resumen

Inkling 2 Mini ML-Knowledge-SWE es una edición comunitaria de los pesos del modelo Inkling 2 Mini de Thinking Machines, publicada por el usuario Tdamre en formato GGUF. No se trata de un modelo entrenado desde cero, sino de una modificación quirúrgica de la proyección de salida y de las proyecciones *down* de los expertos de la última capa, orientada a mejorar el rendimiento en depuración de machine learning, conocimiento factual y tareas de ingeniería de software (SWE). El modelo parte de la cuantización UD-Q4_K_XL de Unsloth del modelo original.

El modelo original es un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 26.070 millones de parámetros totales. Esta edición conserva esa arquitectura y solo altera un subconjunto reducido de filas de la matriz de salida (688 filas Q8_0 en la primera edición) y las proyecciones de los expertos de la capa 23 en la variante *expert*. Se distribuye en dos checkpoints principales de 17,63 GB cada uno: uno acumulativo (recomendado para uso general) y uno experto (orientado a Python ejecutable y kernels Triton).

La relevancia de esta ficha es doble: por un lado, documenta un caso de edición de pesos a bajo nivel sobre un MoE cuantizado en GGUF, una técnica poco habitual en el ecosistema; por otro, ofrece métricas locales comparativas entre las variantes y el modelo original, lo que permite evaluar de forma empírica el impacto real de los ajustes. La licencia Apache 2.0 y el formato GGUF lo hacen desplegable en llama.cpp sin infraestructura especializada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parámetros totales | 26.070.390.272 (~26,07 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q4_K_XL (GGUF); pesos de salida en Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con checksums SHA-256 publicados |
| Modelo base | unsloth/Inkling-2-Mini-GGUF (original: thinkingmachines/Inkling-2-Mini) |
| Tamaño del repositorio | 88,1 GB (cinco archivos GGUF más metadatos) |
| Tamaño por checkpoint | 17,63 GB (UD-Q4_K_XL) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos de ~26 mil millones de parámetros totales, cuantizado a UD-Q4_K_XL por Unsloth. Sobre esa base, el autor aplica ediciones de bajo rango directamente sobre los pesos: una actualización de rango 24 ajustada sobre 4.866 posiciones de respuesta de 465 ejemplos en la proyección de salida final, que modifica 688 filas Q8_0; y una actualización de rango 24 adicional para código, ajustada sobre 56 ejemplos, que cambia 224 filas. La variante *expert* pliega una actualización de rango 32 en las proyecciones *down* de los expertos del bloque físico final (`blk.23.ffn_down_exps.weight`), entrenada con 69.890 posiciones de entrenamiento y 11.419 de validación.

No se trata de un reentrenamiento ni de un ajuste fino convencional: no hay datos sobre el corpus de preentrenamiento original, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el método de edición: ajuste de bajo rango sobre matrices cuantizadas, preservación byte a byte de las filas no modificadas (1.126.163 bytes intactos en el checkpoint acumulativo) y empaquetado con 263.104 bytes de metadatos adicionales para enrutamiento de atención experimental, con los 734 tensores byte-idénticos al checkpoint acumulativo previo.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y conocimiento factual (evaluado con subconjuntos de TriviaQA y glosarios de conceptos).
- Generación de código Python, parches Git y pipelines de shell.
- Reparación de repositorios y tareas de edición multiarchivo.
- Escritura de kernels Triton fusionados con verificación numérica en GPU.
- Depuración de incidentes numéricos y comprobaciones de kernels GPU.
- Decisiones de abstención y de siguiente herramienta (next-tool decisions).
- Recuperación de información en entradas largas (verificado en el checkpoint acumulativo empaquetado).
- Soporte de tool calling: no confirmado explícitamente; la model card menciona "tool decisions" en la evaluación, lo que sugiere cierta capacidad, pero no se documenta una interfaz de function calling.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Depuración de código de machine learning: el checkpoint acumulativo sube de 3/8 a 7/8 en reparaciones verificadas de incidentes numéricos frescos, por lo que es adecuado para diagnosticar y corregir errores en pipelines de entrenamiento e inferencia.
- Generación de kernels Triton: la variante *expert* pasa 4/10 kernels fusionados nuevos (12/30 en tres semillas) frente a 0/10 del acumulativo, lo que la hace útil para escribir y verificar kernels GPU con comprobación numérica.
- Resolución de problemas de programación tipo MBPP: el modelo experto alcanza 94/128 soluciones que pasan tests, frente a 91/128 del original, adecuado para asistentes de código en entornos de evaluación automatizada.
- Reparación de repositorios históricos: el acumulativo pasa 20/82 correcciones históricas con los tests del proyecto, útil para tareas de mantenimiento y corrección de bugs en bases de código existentes.
- Edición multiarchivo y tareas de shell: el experto resuelve 10/16 tareas de reparación de dos archivos y shell, apropiado para agentes de ingeniería de software que operan sobre varios ficheros.
- Agentes de terminal: en Terminal-Bench 4.0, el experto pasa 5/7 comprobaciones en `session-window-debug` con un editor de 20 turnos, y el acumulativo logra 7/7 con mini-SWE-agent, lo que lo hace viable para automatización de tareas en terminal.
- Asistente de conocimiento factual con abstención: el modelo acumulativo acierta 36 respuestas, falla 20 y se abstiene en 30 sobre prompts locales, lo que permite desplegarlo en escenarios donde es preferible abstenerse antes que alucinar.

## Benchmarks y rendimiento

Resultados de evaluaciones locales emparejadas reportados por el autor. La columna "upstream" corresponde a la cuantización original de Unsloth.

| Evaluación | Upstream | Acumulativo | Experto |
|---|---:|---:|---:|
| MBPP (subconjunto Python saneado), soluciones que pasan tests | 91/128 | 90/128 | 94/128 |
| Kernels Triton fusionados nuevos (greedy, RTX 4090) | — | 0/10 | 4/10 |
| Mismos 10 kernels, tres semillas emparejadas | — | 0/30 | 12/30 |
| Tareas cortas de Python, parche Git y shell | — | 13/18 | 15/18 |
| Tareas de edición de un solo repositorio | — | 4/12 | 6/12 |
| Reparación de dos archivos y tareas de shell | — | 7/16 | 10/16 |
| Correcciones históricas upstream que pasan tests del proyecto | — | 20/82 | 17/82 |
| TriviaQA (subconjunto), respuestas correctas | 154/320 | 151/320 | 151/320 |
| Prompts factuales locales: correcto / incorrecto / abstención | 34 / 23 / 29 | 36 / 20 / 30 | 39 / 20 / 27 |
| Conceptos de glosario no vistos: correcto / incorrecto / abstención | 33 / 27 / 0 | 32 / 22 / 6 | 31 / 29 / 0 |

En benchmarks públicos de agentes: Terminal-Bench 4.0 (`session-window-debug`, editor de 20 turnos) da 3/7 al acumulativo y 5/7 al experto, ambos con recompensa de tarea completa cero; con mini-SWE-agent el acumulativo pasa 7/7 con recompensa completa. En DeepSWE v1.1 (`textual-richlog-follow-state`), ambos modelos pasan 0/20 comprobaciones de características solicitadas con el editor emparejado. La diferencia pareada en reparaciones históricas del experto frente al acumulativo es de −3,7 puntos porcentuales, con intervalo bootstrap del 95 % de −13,4 a +6,1.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo UD-Q4_K_XL pesa 17,63 GB, por lo que se necesita al menos ~18 GB de VRAM para cargarlo completo en GPU; con offload parcial a CPU puede ejecutarse con menos.
- GPU recomendadas: RTX 4090 (24 GB) para carga completa en una sola GPU; A100 o H100 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 20 GB o más; en tarjetas de 16 GB requeriría descarga parcial de capas a RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI); vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles. Las evaluaciones se realizaron en una RTX 4090, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini ML-Knowledge-SWE (esta ficha) | ~26,07 B (MoE) | no disponible | Apache 2.0 | GGUF UD-Q4_K_XL | Edición comunitaria con métricas locales |
| Inkling 2 Mini (original, Thinking Machines) | ~26,07 B (MoE) | no disponible | Apache 2.0 | safetensors / GGUF | Base sin editar; 91/128 en MBPP |
| Inkling 2 Mini GGUF (Unsloth) | ~26,07 B (MoE) | no disponible | Apache 2.0 | GGUF UD-Q4_K_XL | Cuantización de referencia del upstream |

No se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- El modelo solo está etiquetado para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación documentado: en prompts factuales locales, el experto da 20 respuestas incorrectas y el acumulativo 20, frente a 34 correctas en el upstream; en conceptos de glosario no vistos, el experto no se abstiene nunca (0 abstenciones, 29 incorrectas).
- El experto empeora en reparaciones históricas (17/82 frente a 20/82 del acumulativo), con una diferencia pareada de −3,7 puntos y un intervalo que cruza cero; la elección debe hacerse por carga de trabajo.
- En DeepSWE v1.1 ambos modelos obtienen 0/20 comprobaciones y recompensa cero; en Terminal-Bench 4.0 ambos obtienen recompensa de tarea completa cero con el editor de 20 turnos.
- La primera edición reduce las decisiones de siguiente herramienta de 30/30 a 29/30 y las reducciones de filas independientes de 4/6 a 3/6.
- El método de edición modifica directamente pesos cuantizados; no hay garantía de que el comportamiento se preserve fuera de las evaluaciones reportadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.
- Licencia Apache 2.0 permite uso comercial, pero al ser una edición comunitaria no auditada, conviene validar el comportamiento en el dominio de producción antes de desplegarlo.
- La longitud de contexto no está documentada; no se debe asumir una ventana grande sin verificarla empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF
- Modelo original (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Checkpoint acumulativo: https://huggingface.co/Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF/blob/main/Inkling-2-Mini-UD-Q4_K_XL-ML-Knowledge-SWE-ZHA.gguf
- Checkpoint experto: https://huggingface.co/Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF/blob/main/Inkling-2-Mini-UD-Q4_K_XL-ML-Knowledge-SWE-ZHA-expert-shell32-1350-1.35.gguf
- Checksums SHA-256: https://huggingface.co/Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/Tdamre/Inkling-2-Mini-ML-Knowledge-SWE-GGUF/blob/main/LICENSE
- Tarea Terminal-Bench 4.0: https://github.com/harbor-framework/terminal-bench/tree/452bf305c6daa62fc59061d22133a7cbc7c1572e/tasks/session-window-debug
