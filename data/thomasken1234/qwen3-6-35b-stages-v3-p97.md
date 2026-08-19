# thomasken1234/qwen3.6-35b-stages-v3-p97

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, presentado como la primera variante de pesos abiertos de la serie Qwen3.6. Este modelo continúa la línea de Qwen3.5 y se centra en ofrecer una experiencia de codificación más estable y orientada a la utilidad real, incorporando mejoras en razonamiento agéntico y preservación del contexto de pensamiento. Está diseñado para tareas de programación a nivel de repositorio, desarrollo frontend y flujos de trabajo agénticos, con un enfoque en la productividad del desarrollador.

Arquitectónicamente, es un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, con una ventana de contexto nativa de 262 144 tokens ampliable hasta aproximadamente 1 010 000. Incluye un codificador de visión, lo que lo habilita para tareas de imagen-texto. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y los pesos están disponibles en formato Transformers, compatibles con vLLM, SGLang y KTransformers, entre otros.

La relevancia actual de este modelo radica en su capacidad para abordar tareas de codificación agéntica y razonamiento a nivel de repositorio, un área de creciente demanda en el desarrollo de software asistido por IA. Su diseño híbrido con capas de atención lineal y atención clásica, junto con la predicción multi-token, lo posiciona como una opción competitiva frente a otros modelos abiertos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, mezcla de expertos (MoE) híbrida con Gated DeltaNet y Gated Attention |
| Parametros totales | 35 951 822 704 (35,95 B) |
| Parametros activos | 3 B (8 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262 144 tokens nativa, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors; se esperan cuantizaciones de la comunidad) |
| Idiomas soportados | No disponibles (se asume multilingüe por la familia Qwen, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura híbrida de mezcla de expertos que combina dos tipos de capas: Gated DeltaNet (atención lineal) y Gated Attention (atención clásica). El modelo tiene 40 capas organizadas en un patrón de 10 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de una capa de Gated Attention, todas intercaladas con capas MoE. La dimensión oculta es de 2048, con 32 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), y 16 cabezas de atención clásica para Q con 2 para KV (dimensión de cabeza 256, con rotación posicional de 64 dimensiones). El MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con una dimensión intermedia de 512 por experto. El embedding de tokens tiene un tamaño de 248 320 (con padding).

El entrenamiento comprende una fase de pre-entrenamiento y otra de post-entrenamiento. El modelo incluye un módulo de predicción multi-token (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo. No se han proporcionado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El codificador de visión permite procesar entradas de imagen junto con texto, aunque no se especifican sus características internas.

## Capacidades

- Generación de texto y razonamiento: capaz de mantener conversaciones multi-turno y resolver tareas complejas de razonamiento, con soporte nativo de modo de pensamiento (thinking) y preservación del contexto de razonamiento histórico.
- Codificación agéntica: maneja flujos de trabajo frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión, según las mejoras declaradas en Qwen3.6.
- Tool calling y function calling: compatible con invocación de herramientas, lo que permite integrarse en pipelines de agentes y automatización.
- Capacidades multimodales: al incluir un codificador de visión, puede procesar imágenes como entrada junto con texto (pipeline image-text-to-text).
- Multilingüismo: aunque no se especifican los idiomas exactos, la familia Qwen es conocida por su soporte multilingüe, incluyendo español, inglés, chino y otros.
- Decodificación eficiente: gracias a la arquitectura MoE con solo 3 B parámetros activos y la predicción multi-token, ofrece un buen equilibrio entre rendimiento y coste computacional.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede actuar como motor de un agente que navega por repositorios, lee archivos, modifica código y ejecuta pruebas, aprovechando su ventana de contexto de 262 K tokens para manejar proyectos completos sin perder el hilo. Su rendimiento en SWE-bench Verified (73,4) lo hace adecuado para tareas de resolución de issues reales.
- Asistente de programación en IDE: integrable en editores como VS Code o JetBrains para proporcionar autocompletado, refactorización y explicación de código, con la ventaja de mantener el contexto de conversación histórica para iteraciones largas.
- Automatización de flujos de trabajo frontend: puede generar componentes de interfaz, maquetar páginas completas y ajustar estilos a partir de descripciones en lenguaje natural o capturas de imagen, gracias a su capacidad multimodal.
- Generación y revisión de código en pipelines de CI/CD: soporta tool calling, por lo que puede conectarse a sistemas de control de versiones y gestores de tareas para revisar pull requests, sugerir correcciones y validar cambios de forma automática.
- Chatbots de soporte técnico con contexto largo: su ventana de contexto ampliable permite mantener conversaciones extensas con historial completo de interacción, útil para atención al cliente en entornos técnicos o documentación de productos.
- Análisis de documentación técnica y extracción de información: puede procesar manuales, guías y repositorios de conocimiento para responder preguntas específicas, resumir contenido y generar documentación a partir de código fuente.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks en la categoría "Coding Agent" comparando Qwen3.6-35B-A3B con otros modelos. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados para otros benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores indican que Qwen3.6-35B-A3B supera a su predecesor Qwen3.5-35BA3B en SWE-bench Multilingual y Pro, aunque queda ligeramente por debajo en SWE-bench Verified. Comparado con Gemma4-31B, obtiene una ventaja significativa en todas las métricas de codificación agéntica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35 B parámetros totales, en FP16 se necesitan aproximadamente 72 GB de VRAM (el repositorio ocupa 71,9 GB). Con cuantización Q4_K_M (común en GGUF) se estima un consumo de unos 20-22 GB, y con Q8 alrededor de 38-40 GB. Estas cifras son orientativas y dependen de la implementación.
- GPU recomendadas: para ejecutar el modelo completo en FP16 se requieren GPUs de centro de datos como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, con cuantización). Con cuantización de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente para inferencia, aunque con limitaciones de velocidad.
- Si cabe en consumer GPU: sí, con cuantización agresiva (Q4_K_M) es posible ejecutarlo en GPUs de 24 GB, aunque el rendimiento puede ser limitado para uso interactivo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y Ollama (según la búsqueda web). También se espera soporte en llama.cpp para formatos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un MoE con solo 3 B parámetros activos, la velocidad de generación debería ser considerablemente mayor que la de un modelo denso de 35 B, pero los valores concretos dependen del hardware y la implementación.

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos de la model card y la información pública disponible:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35 B | 3 B | 262 K (ext. 1 M) | Apache 2.0 | 73,4 |
| Qwen3.5-35B-A3B | 35 B | 3 B | no disponible | Apache 2.0 | 70,0 |
| Qwen3.5-27B (dense) | 27 B | 27 B | no disponible | Apache 2.0 | 75,0 |
| Gemma4-31B | 31 B | no disponible | no disponible | no disponible | 52,0 |

Qwen3.6-35B-A3B se posiciona como una mejora incremental sobre Qwen3.5-35B-A3B, con mejores resultados en tareas de codificación agéntica multilingüe y pro, aunque ligeramente inferior en SWE-bench Verified. Frente a Gemma4-31B, ofrece una ventaja clara en rendimiento de codificación. La comparativa con Qwen3.5-27B (dense) muestra que el modelo denso supera al MoE en SWE-bench Verified, pero el MoE es más eficiente en cómputo al activar solo 3 B parámetros por token.

## Limitaciones y advertencias

- La información sobre sesgos y alucinaciones no está disponible en la documentación proporcionada; como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios especializados.
- La ventana de contexto de 262 K tokens es amplia, pero la extensión a 1 M tokens puede degradar el rendimiento en tareas que requieren precisión posicional extrema; se recomienda validar en el caso de uso concreto.
- No se especifican los idiomas soportados oficialmente; aunque la familia Qwen es multilingüe, la calidad en idiomas distintos del inglés y chino puede variar.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribución, pero se debe verificar que los pesos del modelo no incluyan componentes con licencias adicionales (por ejemplo, el codificador de visión podría tener términos propios).
- El modelo está pensado principalmente para tareas de codificación y razonamiento agéntico; su rendimiento en otras tareas generales (escritura creativa, traducción, etc.) no está documentado en los benchmarks disponibles.
- Al ser una versión post-entrenada, puede presentar comportamientos inesperados en entornos de producción si no se realizan pruebas exhaustivas de robustez y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thomasken1234/qwen3.6-35b-stages-v3-p97
- Repositorio oficial de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía completa de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
- Informe técnico de Qwen3 (arXiv, referencia general): https://arxiv.org/html/2505.09388v1
