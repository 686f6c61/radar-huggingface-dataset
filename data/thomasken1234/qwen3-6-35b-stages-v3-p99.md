# thomasken1234/qwen3.6-35b-stages-v3-p99

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con encoder de visión, desarrollado por Alibaba Qwen como la primera variante open-weight de la serie Qwen3.6. Se trata de un modelo de arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención clásica Gated Attention, junto con un mecanismo de mezcla de expertos (MoE) disperso. En total acumula 35.951 millones de parámetros, de los cuales solo 3.000 millones se activan por token, lo que lo hace especialmente eficiente en inferencia para su tamaño.

El modelo está orientado a la estabilidad y la utilidad real en entornos de producción, con un énfasis particular en el desarrollo de software agéntico: manejo de flujos de trabajo frontend, razonamiento a nivel de repositorio y preservación del contexto de razonamiento en conversaciones iterativas. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens, y admite entrada multimodal (texto e imagen). Publicado bajo licencia Apache-2.0, es compatible con Transformers, vLLM, SGLang y KTransformers.

El repositorio de HuggingFace analizado (thomasken1234/qwen3.6-35b-stages-v3-p99) es una copia del modelo original de Qwen, con pesos en formato safetensors y un tamaño de 71,9 GB. La model card incluida corresponde a la oficial de Qwen, por lo que los datos técnicos y benchmarks aquí recogidos son los publicados por el propio equipo desarrollador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention con MoE disperso |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en FP16; se pueden generar cuantizaciones GGUF/AWQ) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido de 40 capas con dimensión oculta de 2048 y un embedding de 248.320 tokens (con padding). La disposición interna es de 10 bloques, cada uno compuesto por 3 sub-bloques de `Gated DeltaNet → MoE` seguidos de 1 sub-bloque de `Gated Attention → MoE`. La Gated DeltaNet emplea 32 cabezas de atención lineal para la matriz V y 16 para QK, con dimensión de cabeza 128. La Gated Attention utiliza 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y una dimensión de incrustación posicional rotatoria (RoPE) de 64.

El componente MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 experto compartido por token, con una dimensión intermedia de 512 por experto. El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, e incorpora la técnica de predicción multi-token (MTP) con múltiples pasos. No se han publicado datos sobre el número total de tokens de entrenamiento ni la composición del dataset. La model card menciona que se priorizó la estabilidad y la utilidad real, con mejoras específicas en codificación agéntica y preservación del razonamiento histórico.

## Capacidades

- Generación de texto y razonamiento complejo multi-paso, con modo de pensamiento (thinking mode) integrable en flujos conversacionales.
- Codificación agéntica: manejo de flujos de trabajo frontend, razonamiento a nivel de repositorio y resolución de tareas de ingeniería de software (SWE-bench).
- Preservación del contexto de razonamiento: opción de retener el razonamiento de mensajes históricos para desarrollo iterativo sin perder el hilo.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), lo que permite interpretar capturas de pantalla, diagramas y documentos visuales.
- Soporte de tool calling y function calling, orientado a la construcción de agentes autónomos (inferido por su diseño agéntico, aunque no se documenta explícitamente en la model card).
- Capacidades multilingües no especificadas, pero la familia Qwen suele cubrir un amplio rango de idiomas.
- Compatible con múltiples motores de inferencia: Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede actuar como agente autónomo que navega por un repositorio, comprende issues y genera pull requests, aprovechando su razonamiento a nivel de repositorio y su contexto de 262K tokens para manejar proyectos completos.
- Asistente de programación en IDE: con su ventana de contexto nativa, puede analizar archivos extensos, refactorizar código y sugerir cambios coherentes en múltiples ficheros, manteniendo el hilo de la conversación gracias a la preservación del razonamiento.
- Automatización de tareas de mantenimiento de código: revisión de código legacy, detección de bugs, generación de tests y documentación técnica, con la capacidad de procesar repositorios enteros en una sola pasada.
- Generación de interfaces frontend: el modelo está específicamente entrenado para manejar flujos de trabajo frontend, por lo que puede convertir descripciones en lenguaje natural en componentes HTML/CSS/JavaScript funcionales.
- Análisis de documentación visual: gracias al encoder de visión, puede interpretar capturas de pantalla de interfaces, diagramas de arquitectura o esquemas de bases de datos y generar código o explicaciones a partir de ellos.
- Soporte técnico y atención al cliente con contexto largo: puede gestionar conversaciones multi-turno con historial extenso, manteniendo el contexto de razonamiento previo para ofrecer respuestas coherentes y precisas en dominios técnicos.
- Investigación y experimentación en IA: al ser open-weight con licencia Apache-2.0, es adecuado para fine-tuning y evaluación en entornos académicos o de I+D, con la ventaja de requerir menos recursos que un modelo denso de 35B gracias a sus 3B activos.

## Benchmarks y rendimiento

La model card publica resultados de benchmarks de agente de codificación comparando Qwen3.6-35B-A3B con modelos similares. Los valores son los siguientes:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks generales de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros totales en FP16 se necesitan aproximadamente 72 GB de VRAM. Con cuantización a 8 bits se reduce a unos 36 GB, y a 4 bits a unos 18 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no en datos oficiales.
- GPU recomendadas: para FP16 se requieren GPU de datacenter como A100 80GB, H100 80GB o A6000 48GB (con cuantización). Para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente, aunque el contexto máximo exigirá más memoria.
- El modelo es compatible con vLLM, SGLang, KTransformers y Transformers, lo que permite desplegarlo en infraestructura estándar de servidores.
- No se han publicado datos de latencia ni throughput en la información disponible.
- Para uso local en consumer GPU, se recomienda cuantizar a 4 bits o 8 bits y limitar la longitud de contexto según la memoria disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache-2.0 | 73,4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache-2.0 | 70,0 |
| Qwen3.5-27B | 27B | 27B (denso) | 262K (ext. 1M) | Apache-2.0 | 75,0 |
| Gemma4-31B | 31B | No disponible | No disponible | Gemma | 52,0 |
| Gemma4-26B-A4B | 26B | 4B | No disponible | Gemma | 17,4 |

Qwen3.6-35B-A3B mejora ligeramente a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified y Pro, aunque queda por debajo del modelo denso Qwen3.5-27B en el benchmark Verified. Supera ampliamente a las alternativas de Gemma en todas las métricas de codificación agéntica.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información disponible, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales comunes en LLMs.
- Riesgo de alucinación en tareas de razonamiento complejo o cuando se le pide información factual no presente en su contexto; se recomienda verificación externa en entornos de producción.
- La extensión de contexto hasta 1.010.000 tokens puede degradar la calidad de la atención en rangos extremos; se recomienda validar el rendimiento en el caso de uso concreto.
- Los idiomas soportados no están especificados; aunque Qwen suele cubrir múltiples idiomas, no hay garantía de un rendimiento uniforme en todos ellos.
- El repositorio de HuggingFace analizado (thomasken1234/qwen3.6-35b-stages-v3-p99) es una copia de un usuario no oficial, no un repositorio verificado por Qwen. Se recomienda descargar los pesos desde el repositorio oficial de Qwen para evitar problemas de integridad.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los términos completos y cualquier restricción adicional que pueda aplicar el equipo de Qwen.
- No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO), lo que limita la evaluación de su comportamiento en escenarios sensibles.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/thomasken1234/qwen3.6-35b-stages-v3-p99
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Guía práctica de Qwen 3.6 en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de ejecución local en Dev.to: https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
