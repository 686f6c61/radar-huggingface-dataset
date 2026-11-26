# thquangpc/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF

## Resumen

Este repositorio contiene una versión "decensored" (abliterated) del modelo `google/gemma-4-26B-A4B-it` de Google DeepMind, publicada por el usuario thquangpc. Se trata de un derivado del checkpoint QAT (Quantization-Aware Training) oficial de Gemma 4 en precisión Q4_0, al que se le ha aplicado la herramienta Heretic v2.0.0 para eliminar total o parcialmente la alineación de seguridad. El resultado es un modelo multimodal (texto e imagen de entrada, texto de salida) que, según la model card, reduce las negativas a peticiones de 100/100 en el original a 0/100 en esta versión, con una divergencia KL de 0.0101 respecto al modelo base.

El modelo base pertenece a la familia Gemma 4, que incluye arquitecturas densas y de mezcla de expertos (MoE), ventana de contexto de hasta 256K tokens y soporte para más de 140 idiomas. La variante 26B A4B es de tipo MoE, con aproximadamente 25.233 millones de parámetros totales (según los safetensors del repo base) y alrededor de 4.000 millones de parámetros activos por token, lo que la sitúa en un equilibrio entre capacidad y coste de inferencia.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de última generación de Google, una cuantización QAT de 4 bits que reduce drásticamente los requisitos de memoria, y una intervención de abliteración orientada a investigación de seguridad y red-teaming. No obstante, el propio autor advierte que no debe desplegarse en servicios públicos o de cara al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); variante 26B A4B de Gemma 4 |
| Parametros totales | 25.233.142.046 (según safetensors del modelo base) |
| Parametros activos | Aproximadamente 4B (designación A4B del modelo base; dato exacto no disponible) |
| Longitud de contexto | Hasta 256K tokens (heredado de Gemma 4; valor específico de esta variante no confirmado) |
| Tipos de cuantizacion | Q4_0 (GGUF) derivado de QAT; el repo base ofrece además wNa8o8 (móvil) y w4a16 (compressed-tensors) |
| Idiomas soportados | Más de 140 idiomas según Gemma 4; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | GGUF (repo de 16.3 GB); el base también en safetensors y compressed-tensors |
| Pipeline | image-text-to-text |
| Herramienta de abliteración | Heretic v2.0.0.dev0+custom |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B A4B es un transformer multimodal con arquitectura de mezcla de expertos. Procesa entradas de texto e imagen y genera texto; en las variantes E2B, E4B y 12B de la familia se añade soporte de audio, pero no se confirma para esta variante de 26B. La familia Gemma 4 se entrenó con Quantization-Aware Training (QAT), lo que permite obtener checkpoints Q4_0 con una calidad próxima a bfloat16 y una huella de memoria mucho menor. El contexto alcanza los 256K tokens y el soporte multilingüe supera los 140 idiomas. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Sobre ese checkpoint QAT se aplicó Heretic v2.0.0, una técnica de abliteración que modifica los pesos en un rango de capas (índices 12 a 20) mediante una transformación gaussiana de rango 4 con regularización ridge de 1e-06 y regularización de entropía de 0.1. Los componentes objetivo son `attn.o_proj` y `mlp.down_proj`, con un rango de LoRA de 128 y un cambio máximo de peso de 1.0. El objetivo declarado es preservar el comportamiento útil (peso 1.0) mientras se suprime el comportamiento de rechazo (peso 0.0001), con una corrección relativa de 1.0. El resultado reportado es una eliminación completa de las negativas en una muestra de 100 prompts, con una divergencia KL de 0.0101 frente al modelo original.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento configurable (thinking mode) según la documentación de Gemma 4.
- Comprensión de imágenes (image-text-to-text): descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Generación y análisis de código, además de resolución de problemas matemáticos.
- Soporte multilingüe en más de 140 idiomas.
- Compatibilidad con tool calling y function calling, según las capacidades de la familia Gemma 4 (no verificado específicamente en esta variante).
- Capacidad de operar como agente en flujos multi-turno gracias a la ventana de contexto extendida.
- Decodificación especulativa mediante modelos asistente (drafter), siempre que el asistente sea también un checkpoint QAT de la misma precisión.
- Reducción sustancial de rechazos: 0/100 negativas reportadas frente a 100/100 del modelo original.

## Casos de uso

- Investigación de seguridad y alineación: el modelo sirve para estudiar cómo responde un sistema sin alineación de seguridad, comparar comportamientos con el original y diseñar mejores mecanismos de filtrado y moderación.
- Red-teaming y pruebas de robustez: permite generar escenarios adversarios y evaluar la eficacia de clasificadores de contenido o guardarraíles externos antes de desplegar sistemas en producción.
- Evaluación de técnicas de abliteración: al estar documentados los parámetros de Heretic, se puede reproducir el proceso, medir el impacto en la calidad (KL de 0.0101) y comparar con otras variantes.
- Análisis de sesgos y contenido dañino: útil para construir datasets de entrenamiento de clasificadores de toxicidad y para auditar qué tipos de contenido emergen cuando se retira la alineación.
- Experimentación con modelos MoE cuantizados en 4 bits: sirve para medir latencia, throughput y calidad de un MoE de ~25B en hardware de consumo, comparándolo con el checkpoint QAT sin modificar.
- Docencia y divulgación técnica: permite ilustrar de forma práctica qué es la abliteración, cómo se mide la divergencia KL y por qué la alineación de seguridad es frágil frente a modificaciones de pesos.
- Prototipado interno de asistentes multimodales en entornos controlados y sin exposición al usuario final, siempre con revisión humana de las salidas.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de abliteración, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (google/gemma-4-26B-A4B-it-qat-q4_0-unquantized) |
|---|---|---|
| Negativas (refusals) | 0/100 | 100/100 |
| Divergencia KL | 0.0101 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF Q4_0 ocupa 16.3 GB, por lo que se necesitan al menos ~17-18 GB de VRAM o memoria unificada para cargar los pesos, más el espacio para el contexto y el estado de atención.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegues con contexto largo; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden cargar el modelo en Q4_0, con margen limitado para contextos extensos.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090, RTX 5090) y en equipos con memoria unificada de 32 GB o más (Apple Silicon de gama alta). En 16 GB no cabe con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el modelo base también está disponible en compressed-tensors para vLLM. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B parámetros activos, se espera un throughput superior al de un modelo denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| thquangpc/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF | ~25B totales, ~4B activos | Hasta 256K | MoE multimodal, Q4_0 GGUF, abliterated | Apache 2.0 | Derivado sin alineación de seguridad; solo investigación |
| google/gemma-4-26B-A4B-it (QAT Q4_0) | ~25B totales, ~4B activos | Hasta 256K | MoE multimodal, Q4_0 GGUF | Apache 2.0 | Modelo original alineado; referencia de calidad y seguridad |
| google/gemma-4-31B (QAT) | ~31B (denso, dato no confirmado) | Hasta 256K | Denso multimodal | Apache 2.0 | Mayor tamaño, mayor coste de memoria; alternativa si se prioriza calidad sobre eficiencia |
| google/gemma-4-12B (QAT) | ~12B (denso, dato no confirmado) | Hasta 256K | Denso multimodal con audio | Apache 2.0 | Más ligero, cabe en GPUs de 16 GB en Q4_0; menor capacidad de razonamiento |

No se dispone de comparativas con modelos de otros fabricantes (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Reducción sustancial de la alineación de seguridad: el propio autor advierte que el modelo es más propenso a generar contenido dañino, inexacto, sesgado u ofensivo que el original.
- Uso previsto exclusivamente para investigación, estudios de alineación y red-teaming; se desaconseja su despliegue en servicios públicos o de cara al usuario final.
- Riesgo elevado de alucinación y de respuestas no verificadas; todas las salidas deben tratarse como no confiables y verificarse de forma independiente.
- Sesgos heredados del modelo base y potencialmente amplificados por la eliminación de los mecanismos de rechazo.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia específica de Gemma 4; conviene revisar los términos concretos de uso comercial antes de cualquier explotación.
- Sin datos publicados sobre idiomas concretos, número de tokens de entrenamiento ni benchmarks de capacidad; la evaluación de calidad queda limitada a la métrica de rechazos y a la divergencia KL.
- La abliteración se aplicó en un rango limitado de capas (12-20) y sobre dos componentes específicos, por lo que el comportamiento puede ser inconsistente entre tipos de petición.
- Compatibilidad de decodificación especulativa restringida: el modelo asistente debe ser también un checkpoint QAT de la misma precisión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thquangpc/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint QAT sin cuantizar de referencia: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Heretic: https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
