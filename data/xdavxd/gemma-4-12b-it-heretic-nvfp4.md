# xdavxd/gemma-4-12B-it-heretic-NVFP4

## Resumen

Este modelo es una variante cuantizada en formato NVFP4 del modelo `coder3101/gemma-4-12B-it-heretic`, una versión "abliterada" (con los filtros de censura eliminados mediante Arbitrary-Rank Ablation) del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind. La cuantización ha sido realizada por el usuario independiente `xdavxd` con la librería LLM Compressor, reduciendo los bits por parámetro de 16 a 4 y disminuyendo el tamaño en disco y los requisitos de memoria GPU en aproximadamente un 65%.

El modelo mantiene la arquitectura Gemma 4 unificada (gemma4_unified), con entrada de texto e imagen y salida de texto, y está preparado para inferencia eficiente con vLLM, incluyendo soporte para tool calling, razonamiento (thinking mode) y despliegue multimodal. Con 11.959.730.224 parámetros y una ventana de contexto de 32.768 tokens en su configuración recomendada, esta variante ofrece una alternativa de bajo consumo de memoria para entornos donde el modelo original no cabe o resulta demasiado costoso de servir.

Es importante señalar que, al tratarse de una versión abliterada, carece de las salvaguardas de seguridad del modelo oficial y puede generar contenido que el modelo original rechazaría. Además, la propia model card advierte que la transcripción de audio no es fiable en esta variante, por lo que su uso se limita principalmente a texto e imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (gemma4_unified), transformer multimodal texto-imagen |
| Parametros totales | 11.959.730.224 (≈11,96 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue recomendada; contexto nativo no disponible) |
| Tipos de cuantizacion | NVFP4 (pesos FP4 y activaciones FP4, group_size=16, escalado local por grupo) |
| Idiomas soportados | No disponible (el modelo base Gemma 4 es multilingüe, pero no se especifican los idiomas) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | Safetensors (compatible con vLLM y compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 unificada de Google DeepMind, un transformer multimodal que procesa texto e imagen y genera texto. El decodificador de lenguaje sigue el diseño estándar de transformers con atención causal, e incorpora capas dedicadas para el procesamiento de visión y audio. En esta variante, todos los operadores lineales del decodificador de lenguaje han sido cuantizados a FP4 (tanto pesos como activaciones) mediante LLM Compressor, utilizando un esquema NVFP4 con group_size=16 y escalado local por grupo. Las capas de visión, audio, embedding y la cabeza de salida se mantienen en su precisión original (BF16). El proceso de cuantización se realizó con el dataset `ultrachat_200k`, 512 muestras de calibración y una longitud de secuencia máxima de 2048 tokens, empleando redondeo al más cercano (round-to-nearest).

El modelo base `coder3101/gemma-4-12B-it-heretic` es una modificación abliterada del modelo original `google/gemma-4-12B-it`, obtenida mediante Arbitrary-Rank Ablation (ARA) para eliminar los mecanismos de rechazo de contenido. No se dispone de detalles adicionales sobre el proceso de entrenamiento del modelo heretic original.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" habilitado por defecto (`enable_thinking: true`), que permite al modelo razonar antes de responder.
- Soporte de tool calling y function calling, con parser específico `gemma4` y validado para tareas de tool-calling.
- Entrada multimodal de imagen: admite hasta 4 imágenes por prompt según la configuración de despliegue recomendada (`--limit-mm-per-prompt '{"image": 4, "audio": 1}'`).
- Entrada de audio declarada en la arquitectura, pero con una advertencia explícita de la model card: la transcripción de audio no es fiable y mistranscribe la mayoría de las palabras de contenido en material que el modelo sin cuantizar maneja correctamente.
- Capacidad de operar como agente con razonamiento multi-paso, combinando thinking mode y tool calling.
- Capacidades multilingües no especificadas en la documentación disponible.

## Casos de uso

- Despliegue de asistentes conversacionales en GPUs de consumo: gracias a la cuantización NVFP4, el modelo ocupa aproximadamente 8,3 GB en disco y requiere menos VRAM que el modelo original, lo que permite ejecutarlo en tarjetas como la RTX 4090 (24 GB) o incluso en configuraciones con 16 GB si se reduce la longitud de contexto.
- Asistente de programación con integración de herramientas: el soporte de tool calling permite conectarlo a entornos de desarrollo o pipelines de CI/CD para generar código, ejecutar funciones externas y automatizar tareas de desarrollo.
- Análisis de imágenes en aplicaciones de visión por computador: al aceptar entrada de imagen, puede generar descripciones, responder preguntas visuales o extraer información de capturas de pantalla, diagramas y fotografías.
- Investigación sobre alineación y desalineación de modelos: al ser una versión abliterada, es un artefacto útil para estudiar los efectos de la eliminación de filtros de seguridad en el comportamiento de modelos multimodales, comparando sus respuestas con las del modelo original.
- Prototipado rápido de agentes con razonamiento: el modo thinking y la capacidad de encadenar llamadas a herramientas permiten construir prototipos de agentes que planifican, ejecutan acciones y reflexionan sobre los resultados, con un coste de memoria reducido.
- Inferencia de baja latencia en servidores con vLLM: al estar optimizado para vLLM y ser cuantizado, puede servirse con alta concurrencia y menor uso de memoria que el modelo sin cuantizar, adecuado para entornos con varios usuarios simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo fue evaluado frente a benchmarks de RedHatAI y que se calculó la recuperación de precisión respecto al modelo original (combinando el efecto de la abliteración y la cuantización), pero no se incluyen los valores concretos en el README extraído. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a FP4 ocupan aproximadamente 6 GB (11,96 mil millones de parámetros × 0,5 bytes por parámetro), más el overhead de activaciones, KV cache y capas no cuantizadas. Con la configuración recomendada de 32.768 tokens de contexto, se estima que se necesitan al menos 16-20 GB de VRAM; para contextos más cortos podría caber en 12 GB.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) o cualquier GPU compatible con vLLM y con suficiente VRAM. No se especifica si se requiere soporte hardware específico para FP4.
- Opciones de despliegue: vLLM es la opción principal y recomendada (probado en vLLM 0.28.0 con transformers 5.16.1). También es compatible con la librería transformers, siempre que se use una versión 5.10 o posterior. No se mencionan opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-12B-it | 11,96B | Original (BF16) | No disponible | Apache 2.0 (licencia Gemma 4) | Modelo oficial de Google, con salvaguardas de seguridad |
| coder3101/gemma-4-12B-it-heretic | 11,96B | Original (BF16) | No disponible | Apache 2.0 | Versión abliterada (ARA) del modelo oficial |
| xdavxd/gemma-4-12B-it-heretic-NVFP4 | 11,96B | NVFP4 (FP4) | 32.768 (configuración recomendada) | Apache 2.0 | Este modelo; cuantización FP4 del heretic, con advertencias de audio |
| xdavxd/gemma-4-12B-it-heretic-v2-NVFP4 | 11,96B | NVFP4 (FP4) | No disponible | Apache 2.0 | Versión v2 con abliteración de TrevorJS y calibración GPTQ; mejor tasa de desbloqueo y menor daño de capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La transcripción de audio no es fiable: la model card advierte explícitamente que ni esta versión ni la v2 transcriben audio correctamente, mistranscribiendo la mayoría de las palabras de contenido. Si se necesita entrada de audio, se recomienda usar un modelo sin cuantizar.
- Al ser una versión abliterada, carece de las salvaguardas de seguridad del modelo oficial. Puede responder a prompts que el modelo original rechazaría, lo que implica un riesgo de generar contenido inapropiado, ofensivo o potencialmente dañino. No es adecuado para producción sin una evaluación exhaustiva de riesgos.
- La cuantización FP4 puede degradar ligeramente la precisión en tareas complejas, aunque la model card sugiere que la recuperación es buena; no se proporcionan cifras concretas.
- Esta versión (v1) está superada por la v2 (`xdavxd/gemma-4-12B-it-heretic-v2-NVFP4`), que utiliza una abliteración más efectiva y calibración GPTQ. La propia model card indica que "no hay razón para preferirla" sobre la v2.
- La licencia Apache 2.0 se indica en la ficha, pero el modelo base está sujeto a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales. Se recomienda revisar los términos antes de un uso comercial.
- No se especifican los idiomas soportados ni el contexto nativo del modelo, lo que limita la planificación de despliegues multilingües o con contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xdavxd/gemma-4-12B-it-heretic-NVFP4
- Modelo base (coder3101): https://huggingface.co/coder3101/gemma-4-12B-it-heretic
- Modelo original (google): https://huggingface.co/google/gemma-4-12B-it
- Versión v2 (superada): https://huggingface.co/xdavxd/gemma-4-12B-it-heretic-v2-NVFP4
- LLM Compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Guía de uso de Gemma 4 con vLLM: https://recipes.vllm.ai/Google/gemma-4-12B-it
- Página en FriendliAI: https://friendli.ai/models/xdavxd/gemma-4-12B-it-heretic-NVFP4
- Página en ThinkLLM: https://thinkllm.dev/models/gemma-4-12b-it-uncensored-heretic-nvfp4
- Referencia sobre abliteración (DreamFast): https://huggingface.co/DreamFast/Gemma4-12b-it-abliterlitics
