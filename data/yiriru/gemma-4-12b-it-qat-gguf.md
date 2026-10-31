# Yiriru/gemma-4-12B-it-qat-GGUF

## Resumen

Gemma 4 12B (QAT, GGUF) es una conversión a formato GGUF del modelo multimodal Gemma 4 12B instruction-tuned de Google DeepMind, optimizado mediante Quantization-Aware Training (QAT) con cuantización Q4_0. La conversión ha sido realizada por el usuario Yiriru y publicada en Hugging Face, siguiendo la referencia oficial de Unsloth para Gemma 4 QAT. El objetivo de esta variante es ofrecer la calidad del modelo en bfloat16 con requisitos de memoria drásticamente reducidos, permitiendo su ejecución en hardware de consumo mediante runtimes como llama.cpp u Ollama.

Gemma 4 es una familia de modelos abiertos multimodales (texto e imagen como entrada, texto como salida, con soporte de audio en el 12B) que presenta una ventana de contexto de hasta 256K tokens, soporte multilingüe en más de 140 idiomas y modos de razonamiento configurables. La variante 12B es un modelo denso de 11,95B de parámetros orientado a GPUs de consumo y estaciones de trabajo.

La relevancia de esta versión QAT radica en que la cuantización se aplica durante el propio entrenamiento, de modo que el modelo cuantizado a 4 bits conserva una calidad muy cercana al original en precisión completa. El autor de la conversión documenta una concordancia de pesos del 99,80 % frente al original en BF16, con un error máximo absoluto de 0,0023, lo que indica una conversión fiel al checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window + atención global), multimodal (texto, imagen, audio) |
| Parametros totales | 11,95B (según la model card de la familia Gemma 4 12B; el metadato de safetensors del repo indica 422.857.220, lo que parece un error de metadatos del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (familia Gemma 4 12B); ventana deslizante de 1024 tokens en capas locales |
| Tipos de cuantizacion | Q4_0 (QAT, quantization-aware training); el checkpoint base sin cuantizar está en BF16 |
| Idiomas soportados | Más de 140 idiomas (familia Gemma 4); lista concreta no disponible en la ficha del repo |
| Licencia | apache-2.0 (etiquetado en el repo; la model card enlaza la Gemma 4 License de Google) |
| Formato de pesos | GGUF (Q4_0); el modelo base original está disponible en safetensors, GGUF, compressed-tensors (w4a16) y formato móvil (wNa8o8) |

## Arquitectura y entrenamiento

Gemma 4 12B emplea una arquitectura transformer densa con un mecanismo de atención híbrido que intercala capas de atención local por ventana deslizante (1024 tokens en el 12B) con capas de atención global completa, garantizando que la última capa sea siempre global. Este diseño combina la velocidad y el bajo consumo de memoria de los modelos ligeros con la conciencia de contexto largo necesaria para tareas complejas. Para optimizar la memoria en contextos largos, las capas globales comparten claves y valores (unified KV) y aplican Proportional RoPE (p-RoPE).

La variante QAT (Quantization-Aware Training) se entrena simulando la cuantización durante el proceso, de forma que los pesos se adaptan a la precisión reducida y el modelo cuantizado a 4 bits (Q4_0) mantiene una calidad similar a la del modelo en bfloat16. Google publica cuatro tipos de checkpoints QAT: sin cuantizar (Q4_0 en BF16, para investigación y compilación personalizada), GGUF para despliegue general, formato móvil wNa8o8 (con capas de decodificación a 2 bits y cachés KV optimizadas) y compressed-tensors w4a16 para vLLM. Los detalles del dataset de entrenamiento, el número de tokens y el uso de RLHF/DPO no están disponibles en la información proporcionada; el informe técnico oficial está referenciado en arXiv (2607.02770).

Esta conversión GGUF concreta fue reproducida por el autor del repositorio con Codex CLI tomando como referencia la documentación de Unsloth, y verifica una concordancia del 99,80 % de pesos frente al original en BF16 (11.883.056.610 de 11.906.580.480 coincidencias), con un RMSE de 2,04e-05.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system`, lo que permite conversaciones más estructuradas y controlables.
- Razonamiento con modos de "thinking" configurables en toda la familia Gemma 4.
- Comprensión multimodal: entrada de texto e imagen (con soporte de relación de aspecto y resolución variables) y entrada de audio de forma nativa en el 12B; también soporta vídeo según la model card de la familia.
- Generación de código, con mejoras destacadas en benchmarks de programación respecto a generaciones anteriores.
- Soporte nativo de function calling / tool calling, orientado a flujos agénticos y razonamiento multi-paso.
- Contexto largo de hasta 256K tokens para procesar documentos extensos.
- Soporte multilingüe en más de 140 idiomas.
- Decodificación especulativa compatible con modelos "drafter", siempre que el asistente sea también un checkpoint QAT con la misma precisión.

## Casos de uso

- Chatbots y asistentes conversacionales: el soporte nativo del rol `system` y el contexto de 256K tokens permiten gestionar conversaciones multi-turno con instrucciones persistentes y documentos extensos adjuntos.
- Análisis de documentos largos: con 256K tokens de ventana de contexto, puede resumir, extraer datos y responder preguntas sobre contratos, informes o bases de código completas sin fragmentación.
- Asistentes multimodales con imágenes: al aceptar entrada de imagen con resolución y relación de aspecto variables, es adecuado para descripción de imágenes, OCR asistido y análisis de capturas o documentos escaneados.
- Procesamiento de audio local: el 12B soporta audio de forma nativa, lo que habilita transcripción, análisis de audio y asistentes de voz en local sin modelos adicionales.
- Agentes autónomos y automatización: el function calling nativo y las mejoras en benchmarks de código lo hacen idóneo para pipelines agénticos que ejecutan herramientas, consultan APIs o realizan razonamiento multi-paso.
- Ejecución en local con hardware de consumo: gracias a la cuantización QAT Q4_0 en GGUF, el modelo puede ejecutarse en GPUs de gama alta de consumo y estaciones de trabajo mediante llama.cpp u Ollama, sin el coste de calidad típico de la cuantización posterior al entrenamiento.
- Generación y revisión de código en entornos de desarrollo: integrable en editores y flujos de CI para generación de código, revisión de pull requests y refactorizaciones asistidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión concreta. La model card de la familia indica mejoras notables en benchmarks de código y razonamiento respecto a generaciones anteriores, pero no proporciona cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,1 GB en total (posiblemente incluye varias variantes o archivos auxiliares); un GGUF Q4_0 de un modelo de 11,95B de parámetros requiere en torno a 7-9 GB solo de pesos, más la KV cache y overhead del runtime. Cifra exacta no disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño cuantizado, es plausible su ejecución en GPUs de consumo con 12-16 GB de VRAM (por ejemplo RTX 4090) y en GPUs de centro de datos sin problema; se trata de una estimación, no de un dato publicado.
- Consumer GPU: el objetivo declarado de la variante QAT es la ejecución en portátiles, estaciones de trabajo y GPUs de consumo; con Q4_0 el modelo 12B debería caber en una GPU de 12-16 GB de VRAM (estimación).
- Opciones de despliegue: llama.cpp y Ollama de forma nativa (formato GGUF); la familia Gemma 4 también ofrece checkpoints compressed-tensors w4a16 para vLLM, y el ecosistema estándar de Google (Hugging Face, GitHub) para otros runtimes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | Gemma 4 12B (QAT Q4_0, GGUF) | Gemma 4 26B A4B | Qwen3 8B (referencia de categoria) |
|---|---|---|---|
| Arquitectura | Denso, atención híbrida | MoE | Denso |
| Parametros totales | 11,95B | 26B (4B activos, según denominación) | 8B |
| Contexto | 256K | 256K (no disponible en la ficha, dato de familia) | No disponible en la informacion proporcionada |
| Multimodal | Texto, imagen, audio | Según model card de familia | No disponible en la informacion proporcionada |
| Licencia | apache-2.0 (etiquetado) / Gemma 4 License | Gemma 4 License | No disponible en la informacion proporcionada |
| Formato | GGUF Q4_0 (QAT) | GGUF Q4_0 (QAT) | GGUF, safetensors |

Nota: la comparativa se limita a la familia Gemma 4, ya que para modelos de terceros no se dispone de datos verificados en la información proporcionada. La alternativa densa de mayor tamaño de la misma familia es el Gemma 4 31B, y las alternativas más ligeras son E2B y E4B (orientados a móvil y portátil, con contexto de 128K).

## Limitaciones y advertencias

- Discrepancia en metadatos: el campo de parámetros de safetensors del repositorio (422,86M) no coincide con los 11,95B declarados para Gemma 4 12B; conviene verificar los archivos descargados antes de usar en producción.
- La conversión no es oficial de Google: es una reproducción comunitaria (autor Yiriru) basada en la documentación de Unsloth, con una verificación de pesos del 99,80 % frente al original; existe un pequeño porcentaje de bloques con desviaciones.
- Alucinaciones: como todo LLM, puede generar contenido incorrecto o inventado, especialmente en datos factuales y fechas; se recomienda verificación o grounding en producción.
- Sesgos: los modelos Gemma pueden reflejar sesgos presentes en los datos de entrenamiento; no se documentan sesgos específicos en la información disponible.
- Idiomas: se declara soporte de más de 140 idiomas, pero la calidad por idioma no está detallada en la ficha del repositorio.
- Licencia: el repositorio está etiquetado como apache-2.0, pero la model card enlaza la Gemma 4 License de Google, que incluye términos de uso propios (restricciones de uso, política de uso aceptable). Es imprescindible revisar la licencia efectiva antes de uso comercial.
- Decodificación especulativa: el modelo asistente (drafter) debe ser también un checkpoint QAT con la misma precisión; usar un drafter no QAT provocará incompatibilidad.
- Contexto: aunque se declara 256K, el rendimiento efectivo en contexto muy largo con cuantización Q4_0 no está documentado en esta conversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yiriru/gemma-4-12B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección oficial Gemma 4 QAT en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Referencia de conversión (Unsloth, Gemma 4 QAT): https://unsloth.ai/docs/models/gemma-4/qat
- Página de Google DeepMind sobre Gemma: https://deepmind.google/models/gemma/
