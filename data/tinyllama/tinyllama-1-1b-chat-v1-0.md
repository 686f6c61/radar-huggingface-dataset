# TinyLlama/TinyLlama-1.1B-Chat-v1.0

## Resumen

TinyLlama-1.1B-Chat-v1.0 es un modelo de lenguaje de 1.100 millones de parámetros desarrollado por el proyecto TinyLlama, una iniciativa open source que busca preentrenar un modelo compacto de arquitectura Llama sobre 3 billones de tokens. El proyecto está liderado por jzhang38 y forma parte del ecosistema de modelos abiertos que democratizan el acceso a IA generativa en entornos con recursos limitados. Este checkpoint concreto es la versión afinada para conversación, construida sobre el modelo intermedio TinyLlama-1.1B-intermediate-step-1431k-3T, que ya había visto 3 billones de tokens durante el preentrenamiento.

La relevancia de este modelo radica en su combinación de tamaño reducido (1.1B parámetros) con una arquitectura idéntica a Llama 2, lo que permite su integración directa en proyectos que ya soportan Llama. Además, su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su huella de memoria lo hace apto para despliegue en dispositivos con recursos limitados, como edge devices o GPUs de consumo. El modelo está entrenado exclusivamente en inglés y su contexto de trabajo no está documentado explícitamente en la ficha, aunque por su arquitectura Llama 2 se espera una ventana de 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 2, misma arquitectura y tokenizador) |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se espera 4096 tokens por arquitectura Llama 2) |
| Tipos de cuantizacion | No disponible (soporta cuantizacion estándar de transformers: bf16, fp16, int8, int4) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TinyLlama-1.1B-Chat-v1.0 usa una arquitectura transformer densa basada en Llama 2, con el mismo tokenizador y estructura de capas. El preentrenamiento se realizó sobre 3 billones de tokens combinando SlimPajama (627B tokens) y Starcoderdata (para código), completado en 90 días con 16 GPUs A100-40G. El proceso de preentrenamiento se dividió en pasos intermedios, y este checkpoint parte del paso 1431k con 3 billones de tokens procesados.

El ajuste fino sigue la receta de entrenamiento de Zephyr: primero un fine-tuning supervisado sobre un subconjunto de UltraChat (diálogos sintéticos generados con ChatGPT), y posteriormente una alineación mediante DPO (Direct Preference Optimization) con el dataset UltraFeedback, que contiene 64k prompts con completados rankeados por GPT-4. Esta combinación de SFT + DPO es una innovación notable en modelos de este tamaño, ya que permite mejorar la calidad de las respuestas conversacionales sin necesidad de RLHF completo.

## Capacidades

- Generación de texto conversacional con formato de chat mediante plantilla de chat de transformers (roles system, user, assistant).
- Generación de código básico, gracias al entrenamiento sobre Starcoderdata, aunque limitado por el tamaño del modelo.
- Razonamiento lógico básico y resolución de problemas simples, aunque con limitaciones propias de un modelo de 1.1B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés, sin soporte documentado para otros idiomas.
- Capacidades de agentes y multi-step reasoning: limitadas, el modelo no está diseñado explícitamente para ello, aunque puede funcionar en pipelines simples.
- No incluye capacidades de visión ni audio; es exclusivamente texto.
- Compatible con el ecosistema Llama (misma arquitectura), lo que permite su uso en herramientas como vLLM, llama.cpp, Ollama, etc.

## Casos de uso

- **Chatbots de atención al cliente en inglés**: el modelo puede gestionar conversaciones de soporte de baja complejidad, con respuestas coherentes y alineadas con el tono del usuario. Su tamaño pequeño reduce costes de inferencia en entornos con alto volumen de consultas.
- **Generación de código en entornos de desarrollo asistido**: puede completar fragmentos de código, explicar funciones o sugerir implementaciones simples, integrándose en editores o pipelines de CI/CD para tareas de autocompletado.
- **Clasificación y extracción de información**: al ser un modelo de texto, puede usarse para tareas de clasificación de documentos, detección de entidades o resumen de texto en inglés, mediante técnicas de fine-tuning sobre el modelo base.
- **Prototipado rápido de aplicaciones de IA**: gracias a su tamaño reducido y licencia permisiva, es ideal para validar ideas en entornos de desarrollo con recursos limitados, antes de escalar a modelos mayores.
- **Asistentes de escritura en inglés**: puede generar borradores de correos, artículos o contenido de marketing, aunque con calidad inferior a modelos de mayor tamaño, pero suficiente para tareas sencillas.
- **Despliegue en edge devices o dispositivos embebidos**: con una huella de memoria de ~2.3GB en fp16, puede ejecutarse en Raspberry Pi 5 con 8GB, o en smartphones mediante frameworks como llama.cpp, permitiendo asistentes locales sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo y los resultados de búsqueda no incluyen métricas como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en tareas específicas antes de su uso en producción, dado que su tamaño limitado puede afectar a tareas complejas.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - fp32: ~4.4 GB (no recomendado)
  - fp16/bf16: ~2.2 GB
  - int8: ~1.1 GB
  - int4: ~0.6 GB (aproximado, no documentado)
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Se recomienda una RTX 3060 (12 GB) o superior para mayor velocidad y espacio para batch.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo como RTX 3050, RTX 3060, RTX 4060, o incluso en iGPUs con suficiente VRAM compartida (en cuantización int4).
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), y el pipeline de transformers de Hugging Face.
- **Latencia y throughput**: no disponible, pero al ser un modelo de 1.1B, la inferencia es rápida en GPUs modernas (típicamente >50 tokens/s en una RTX 4090, estimación no documentada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato de pesos |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 | 1.1B | No disponible (4K esperado) | Apache 2.0 | Inglés | safetensors |
| Llama-2-7B-Chat | 7B | 4096 | Llama 2 Community License | Multilingüe (inglés principal) | safetensors |
| Qwen1.5-1.8B-Chat | 1.8B | 32K | Apache 2.0 | Multilingüe | safetensors |
| OpenLLaMA-3B | 3B | 2048 | Apache 2.0 | Inglés | safetensors |

Nota: los modelos comparables varían en tamaño y licencia. TinyLlama destaca por su tamaño compacto y licencia Apache 2.0, pero no hay datos de rendimiento comparativos en la información disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo hereda sesgos del dataset SlimPajama y de los datos sintéticos de UltraChat, que pueden reflejar estereotipos o sesgos de género, raza o ideología.
- **Riesgo de alucinación**: alto, especialmente en tareas de conocimiento factual, dado su tamaño pequeño y entrenamiento limitado en comparación con modelos mayores.
- **Limitaciones de contexto**: la longitud de contexto no está documentada, pero se estima en 4096 tokens por la arquitectura Llama 2; esto limita la gestión de conversaciones largas o documentos extensos.
- **Limitaciones de idioma**: solo soporta inglés; no se recomienda su uso en otros idiomas sin adaptación adicional.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se debe incluir la atribución correspondiente y no usar marcas registradas del proyecto.
- **Caveats para producción**: no es apto para tareas que requieran precisión elevada (diagnóstico médico, asesoría legal, etc.); requiere evaluación previa y puede necesitar fine-tuning adicional para dominios específicos. No soporta tool calling ni agentes complejos de forma nativa.

## Enlaces

- [Hugging Face: TinyLlama-1.1B-Chat-v1.0](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [Repositorio GitHub del proyecto TinyLlama](https://github.com/jzhang38/TinyLlama)
- [Modelo base: TinyLlama-1.1B-intermediate-step-1431k-3T](https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T)
- [Repositorio de despliegue de inferless](https://github.com/inferless/tinyllama-1-1b-chat-v1-0)
