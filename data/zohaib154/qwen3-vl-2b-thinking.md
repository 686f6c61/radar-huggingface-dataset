# Zohaib154/Qwen3-VL-2B-Thinking

## Resumen

Qwen3-VL-2B-Thinking es la variante compacta de 2.127 millones de parámetros de la familia Qwen3-VL, el modelo de visión-lenguaje desarrollado por el equipo Qwen de Alibaba. Esta edición "Thinking" incorpora razonamiento explícito antes de responder, orientada a tareas que requieren análisis causal, matemáticas y comprensión visual profunda. El repositorio alojado por el usuario Zohaib154 replica los pesos oficiales de `Qwen/Qwen3-VL-2B-Thinking` bajo licencia Apache 2.0.

El modelo combina un codificador visual ViT con un decoder de lenguaje basado en transformer denso, e introduce innovaciones arquitectónicas como Interleaved-MRoPE, DeepStack y alineación texto-marca temporal para mejorar el razonamiento sobre vídeo de larga duración y la percepción espacial. Su contexto nativo de 256K tokens, ampliable a 1M, lo sitúa en un rango poco habitual para un modelo de este tamaño.

Su relevancia actual radica en ofrecer capacidades de agente visual, OCR multilingüe en 32 idiomas y comprensión de vídeo en un formato que cabe en GPUs de consumo, lo que facilita el despliegue en entornos de borde y prototipado rápido sin renunciar a las mejoras de la generación Qwen3-VL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (ViT + decoder de lenguaje) con Interleaved-MRoPE, DeepStack y alineación texto-marca temporal |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; se asume compatibilidad con cuantización estándar vía transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | no disponible (la model card menciona OCR en 32 idiomas, sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de los modelos visión-lenguaje de Qwen: un codificador visual tipo ViT que extrae características de imágenes y vídeo, acoplado a un decoder de lenguaje transformer denso. La model card destaca tres actualizaciones técnicas: Interleaved-MRoPE, que distribuye frecuencias posicionales sobre tiempo, anchura y altura para mejorar el razonamiento en vídeo de horizonte largo; DeepStack, que fusiona características ViT de múltiples niveles para afinar el alineamiento imagen-texto; y una alineación texto-marca temporal que sustituye a T-RoPE para localizar eventos con precisión temporal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante concreta. La model card únicamente indica que el preentrenamiento visual se amplió en cobertura y calidad para reconocer un espectro más amplio de entidades (personajes, productos, monumentos, flora y fauna). La variante Thinking está diseñada para generar cadenas de razonamiento antes de la respuesta final, con hiperparámetros de generación recomendados distintos para texto y visión.

## Capacidades

- Generación de texto y razonamiento multimodal con modo "thinking" explícito antes de responder.
- Comprensión de imágenes: descripción, OCR, grounding 2D y 3D, juicio de posiciones, puntos de vista y oclusiones.
- Comprensión de vídeo, incluyendo vídeos de varias horas con indexación a nivel de segundo.
- OCR en 32 idiomas, robusto ante baja iluminación, desenfoque e inclinación, con mejor manejo de caracteres raros o antiguos y jerga técnica.
- Generación de código visual: diagramas Draw.io, HTML/CSS/JS a partir de imágenes o vídeos.
- Operación como agente visual: reconocimiento de elementos de GUI en PC y móvil, invocación de herramientas y ejecución de tareas.
- Razonamiento STEM y matemático con análisis causal y respuestas basadas en evidencia.
- Comprensión de texto equiparable a modelos de lenguaje puros, según la model card.
- Soporte de tool calling y flujos de múltiples pasos (implícito en las capacidades de agente descritas).
- Capacidades multilingües: no hay listado oficial de idiomas, solo la referencia al OCR en 32 lenguas.

## Casos de uso

- Automatización de atención al cliente con soporte visual: el modelo puede procesar capturas de pantalla o fotos enviadas por el usuario junto con texto, manteniendo conversaciones multi-turno gracias al contexto de 256K tokens.
- Agente de escritorio o móvil: reconocimiento de elementos de interfaz e invocación de herramientas para completar tareas guiadas por el usuario, adecuado para prototipos de RPA visual en hardware de consumo.
- Extracción de datos de documentos: OCR en 32 idiomas con parsing de estructura de documentos largos, útil para digitalización de facturas, contratos o archivos históricos con caracteres poco frecuentes.
- Generación de interfaces a partir de mockups: conversión de imágenes o vídeos en HTML/CSS/JS o diagramas Draw.io, integrable en flujos de diseño a código.
- Análisis de vídeo de vigilancia o deportivo: indexación temporal a nivel de segundo y comprensión de dinámicas espaciales para resúmenes o búsqueda de eventos concretos.
- Tutoría STEM con soporte visual: resolución de problemas de matemáticas o física a partir de fotos de pizarras o enunciados, con razonamiento paso a paso en modo thinking.
- Asistencia en robótica o IA encarnada: grounding 3D y percepción espacial para tareas de manipulación o navegación en entornos simulados.

## Benchmarks y rendimiento

La model card incluye dos gráficas comparativas (rendimiento multimodal y rendimiento en texto puro) entre las variantes de 2B y 32B en modo thinking, pero no se proporcionan los valores numéricos en el texto disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- En cuantización de 8 bits: en torno a 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5 GB, aunque la disponibilidad de GGUF para esta variante no está confirmada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para contextos largos o vídeo, se recomienda 16-24 GB (RTX 4090, A100 40GB, H100).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16; en 4 bits podría ejecutarse en GPUs de 6 GB.
- Opciones de despliegue: transformers (versión de desarrollo o 4.57.0 cuando esté disponible), con soporte recomendado de FlashAttention 2; vLLM, TGI, llama.cpp y Ollama no están confirmados para esta variante concreta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-2B-Thinking | 2,13B | 256K (1M ampliable) | Apache 2.0 | Hugging Face (repo oficial y réplica) |
| Qwen3-VL-2B-Instruct | 2,13B | 256K (1M ampliable) | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-3B | ~3B | no disponible en la información | Apache 2.0 | Hugging Face |
| Qwen3-VL-32B-Thinking | ~32B | 256K (1M ampliable) | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Qwen porque no se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada. La variante Instruct sacrifica el razonamiento explícito por menor latencia; la variante de 32B ofrece mayor capacidad a costa de requisitos de hardware muy superiores.

## Limitaciones y advertencias

- El repositorio es una réplica de terceros (Zohaib154) de los pesos oficiales; conviene verificar la integridad y procedencia frente al repo oficial `Qwen/Qwen3-VL-2B-Thinking`.
- El modo thinking incrementa la latencia y el consumo de tokens de salida; la model card recomienda hasta 40.960 tokens de salida en visión y 32.768 en texto (81.920 en benchmarks como AIME, LCB y GPQA).
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en OCR de documentos degradados o en razonamiento espacial 3D.
- No se detalla la lista de idiomas soportados más allá del OCR en 32 lenguas; el rendimiento fuera de los idiomas principales puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la réplica no ofrece garantías sobre los pesos.
- El tamaño de 2B limita la profundidad de razonamiento frente a las variantes de 32B, especialmente en tareas STEM complejas.
- Requiere una versión de transformers en desarrollo (4.57.0 no publicada en el momento de la model card), lo que puede complicar despliegues en producción con versiones estables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zohaib154/Qwen3-VL-2B-Thinking
- Repo oficial del modelo: https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking
- Qwen Chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report: https://arxiv.org/abs/2502.13923
- Referencia adicional citada: https://arxiv.org/abs/2409.12191
- Referencia adicional citada: https://arxiv.org/abs/2308.12966
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
