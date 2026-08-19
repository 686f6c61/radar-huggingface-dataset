# zerodigest/Qwen3.8-27B-YMQ-MTP-GGUF

## Resumen

El repositorio `zerodigest/Qwen3.8-27B-YMQ-MTP-GGUF` contiene cuantizaciones personalizadas del modelo base `Qwen/Qwen3.8-27B`, un modelo de 27.320 millones de parámetros desarrollado por Alibaba. Estas cuantizaciones, generadas con el framework propietario YMQ-Compiler v2.0, aplican una estrategia de precisión mixta consciente de la arquitectura, inspirada en técnicas como Intel AutoRound, para optimizar el equilibrio entre tamaño, velocidad y calidad en entornos de generación de código y agentes locales.

El modelo base combina arquitectura híbrida Transformer con bloques Mamba (SSM) y soporta predicción multi-token (MTP), lo que permite una decodificación especulativa más eficiente. Los archivos GGUF resultantes están diseñados para funcionar con motores de inferencia como llama.cpp, Ollama o vLLM, y se ofrecen en cinco presets de cuantización (XXS, XS, M, L, XL) que van desde aproximadamente 11 GB hasta 19 GB, adaptándose a diferentes presupuestos de VRAM.

La relevancia de este modelo radica en su enfoque de cuantización dirigida por capas, que promete mantener la estabilidad lógica y la fidelidad en contextos largos (hasta 50k tokens en los presets más pequeños, con degradación progresiva) mientras reduce el consumo de memoria. Es especialmente útil para desarrolladores que ejecutan asistentes de código como RooCode o Aider en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer + Mamba (SSM) con soporte MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no especificada oficialmente; se menciona optimización para contextos largos y degradación a partir de 50k tokens en el preset XXS |
| Tipos de cuantizacion | Mezcla de precisiones bajas (2-4 bits) en formato IQ4_XS, IQ4_NL, IQ3_XXS, entre otros, según el preset |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base en BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas Transformer con atención multi-cabeza y bloques Mamba de espacio de estados lineal (SSM). Esta combinación busca capturar dependencias de largo alcance de forma eficiente, reduciendo el coste cuadrático de la atención tradicional. Además, el modelo incorpora un mecanismo de predicción multi-token (MTP), que permite predecir varios tokens futuros en paralelo y acelera la inferencia mediante decodificación especulativa.

El proceso de cuantización YMQ-Compiler v2.0 no es un entrenamiento tradicional, sino una optimización de precisión mixta que analiza la importancia de cada capa en espacio logarítmico. Detecta "picos lógicos" en las capas de razonamiento y les asigna mayor precisión (p. ej., IQ4_XS), mientras que comprime capas de almacenamiento de hechos a formatos más agresivos (hasta 2 bits). También aplica un "tapering" en las capas iniciales para proteger los vectores de entrada, aísla las rutas de atención y SSM para evitar ruido, y protege la cabeza de clasificación final para evitar errores de formato. No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, dataset, RLHF, etc.).

## Capacidades

- Generación de texto y razonamiento de propósito general, con especial énfasis en tareas de programación y desarrollo de software.
- Soporte de predicción multi-token (MTP) para decodificación especulativa, lo que mejora el throughput en motores compatibles.
- Optimización para entornos de agentes y API de ejecución de código, como RooCode y Aider.
- Manejo de contextos largos (hasta 50k tokens en presets pequeños, con degradación progresiva; mejor estabilidad en presets mayores).
- Capacidades multilingües no especificadas; el modelo base Qwen suele soportar múltiples idiomas, pero no se confirma en esta información.
- No se menciona soporte explícito de tool calling o function calling, aunque la orientación a agentes sugiere compatibilidad indirecta.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en IDEs o herramientas CLI como Aider para generar, revisar y refactorizar código en tiempo real. La cuantización M (14 GB) ofrece un equilibrio óptimo entre calidad y VRAM, permitiendo ejecutarlo en GPUs de consumo con 16 GB.
- Agente autónomo de desarrollo: gracias al soporte MTP y la estabilidad en contextos largos, puede mantener conversaciones multi-turno con el historial del proyecto y ejecutar comandos de forma iterativa, útil en pipelines de CI/CD.
- Generación de documentación técnica: el modelo puede redactar comentarios, documentación de API y guías de usuario a partir de fragmentos de código, manteniendo coherencia en documentos extensos.
- Análisis de código legacy: con el preset XL (19 GB) y su alta fidelidad, puede analizar archivos grandes y múltiples módulos para identificar bugs, dependencias o mejoras de rendimiento.
- Chat técnico de soporte: puede responder consultas sobre lenguajes de programación, frameworks o algoritmos, manteniendo el contexto de la conversación durante largas sesiones.
- Prototipado rápido de scripts: el preset XXS (11 GB) permite ejecutar el modelo en GPUs con poca VRAM (p. ej., RTX 4060) para generar scripts cortos o fragmentos de código sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de perplejidad en el corpus WikiText-2, evaluadas con `llama-perplexity` sobre una ventana de 4096 tokens. Estos valores no son comparables directamente con benchmarks de razonamiento, pero indican la calidad de reconstrucción de cada preset:

| Preset | Tamano del archivo | Perplejidad (WikiText-2, menor es mejor) |
|---|---|---|
| XXS | ~11.0 GB | 7.2565 |
| XS | ~12.2 GB | 8.2557 |
| M | ~14.0 GB | 6.8413 |
| L | ~17.0 GB | 6.9791 |
| XL | ~19.0 GB | 6.8196 |

El preset M destaca por ofrecer una perplejidad casi idéntica al XL (6.8413 vs 6.8196) con 5 GB menos de VRAM, lo que lo convierte en la opción recomendada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (preset XXS) y 19 GB (preset XL), según el archivo GGUF elegido.
- GPU recomendadas: para el preset M (14 GB) se necesita una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, RTX 4090, A4000); para XXS y XS bastan GPUs de 12-16 GB (RTX 3060, RTX 4070); para L y XL se requieren 20 GB o más (RTX 4090, A6000, A100).
- Cabe en GPUs de consumo: sí, todos los presets caben en GPUs de gama alta de consumo (RTX 3090/4090 con 24 GB) y los más pequeños en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (incluye `llama-perplexity` y `llama-cli`), Ollama, vLLM con soporte GGUF, text-generation-inference (TGI) si se convierte a safetensors, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se proporcionan datos concretos; el soporte MTP puede acelerar la generación en motores que lo implementen, pero depende del hardware y del preset.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Este repositorio es una cuantización específica del modelo Qwen3.8-27B, por lo que una comparación directa con otras cuantizaciones estándar (p. ej., las de llama.cpp o AutoRound) requeriría ejecutar los mismos benchmarks sobre los mismos archivos. Se recomienda evaluar localmente con la herramienta `llama-perplexity` para contrastar la calidad de cada preset frente a cuantizaciones uniformes del mismo modelo base.

## Limitaciones y advertencias

- Los presets más pequeños (XXS, XS) presentan mayor ruido de compresión y pueden degradar la calidad de llamadas a API o el razonamiento en contextos largos (a partir de 50k tokens).
- La perplejidad del preset XS (8.2557) es notablemente peor que la del resto, lo que sugiere que ese punto de cuantización es especialmente agresivo en capas intermedias.
- No se especifican los idiomas soportados; aunque el modelo base Qwen suele ser multilingüe, no hay confirmación en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B (aunque el tag indica apache-2.0, es recomendable consultar la documentación oficial de Qwen).
- Al ser una cuantización de precisión mixta, el comportamiento puede variar entre presets; se recomienda probar el preset M como punto de partida.
- No hay garantía de soporte para tool calling o function calling explícito; la orientación a agentes se basa en la estabilidad del contexto, no en una API específica.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o poco validada por la comunidad; se aconseja verificar la reproducibilidad de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zerodigest/Qwen3.8-27B-YMQ-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
