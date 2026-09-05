# yessssssssssssssssss/gemma-4-E4B-it-qat-w4a16-ct

## Resumen

Gemma 4 E4B It QAT w4a16 es una versión cuantizada del modelo multimodal de Google DeepMind, publicada en Hugging Face por el usuario yessssssssssssssssss. El modelo original, Gemma 4 E4B It, es un transformer denso que procesa texto, imagen y audio y genera texto, con una ventana de contexto de 128K tokens y soporte para más de 140 idiomas. Esta variante utiliza cuantización consciente del entrenamiento (QAT) y se serializa en formato compressed-tensors con pesos de 4 bits y activaciones de 16 bits (w4a16), lo que reduce significativamente la memoria necesaria para cargar el modelo manteniendo una calidad similar a bfloat16.

El modelo está diseñado para entornos de despliegue que van desde teléfonos de gama alta y portátiles hasta servidores. Incorpora capacidades de razonamiento con modos de pensamiento configurables, soporte nativo de function calling y una atención híbrida que combina ventanas deslizantes locales con capas globales, optimizada para contextos largos. La variante w4a16 está pensada para una inferencia nativa y optimizada con vLLM mediante el formato compressed-tensors.

Este checkpoint deriva del modelo base google/gemma-4-E4B-it-qat-q4_0-unquantized, que corresponde a la variante unquantizada del pipeline QAT. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window + global) y Per-Layer Embeddings (PLE) |
| Parámetros totales | 8.612.189.514 (8,6 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | w4a16 (pesos de 4 bits, activaciones de 16 bits) en formato compressed-tensors; QAT |
| Idiomas soportados | Más de 140 idiomas (según model card) |
| Licencia | Apache 2.0 (con términos adicionales de Gemma) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal que acepta texto, imagen y audio como entrada y genera texto. Emplea una atención híbrida que intercala ventanas deslizantes locales de 512 tokens con capas de atención global, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE). Además, incorpora Per-Layer Embeddings (PLE) para reducir el número de parámetros efectivos en despliegue on-device.

El entrenamiento incluye cuantización consciente (QAT), lo que permite que los pesos de 4 bits mantengan una calidad similar a la precisión bfloat16. En el caso de este repositorio, el checkpoint se serializa en formato compressed-tensors con pesos w4a16 para una inferencia nativa y optimizada con vLLM. Según la model card, todos los modelos Gemma 4 están diseñados como razonadores potentes con modos de pensamiento configurables y soporte nativo de system prompt. No se proporcionan detalles sobre el dataset de entrenamiento, RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto multimodal: acepta texto, imágenes (con soporte de resolución y relación de aspecto variable) y audio (de forma nativa en los modelos E2B, E4B y 12B), y genera texto como salida.
- Razonamiento con modos de pensamiento configurables (thinking modes).
- Soporte nativo de function calling / tool calling para agentes autónomos.
- Capacidades de agente y razonamiento multi-paso.
- Multilingüe: soporta más de 140 idiomas.
- Contexto largo de hasta 128K tokens en los modelos pequeños.
- Soporte nativo del rol de sistema (system prompt) para conversaciones estructuradas y controlables.
- Generación de código y habilidades de agentes mejoradas.
- Compatibilidad con decodificación especulativa: cuando se usa un modelo asistente, este debe ser también un checkpoint QAT de la misma precisión.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: gracias a su tamaño reducido (8,6B de parámetros totales) y a la cuantización w4a16, el modelo puede ejecutarse en smartphones de gama alta y portátiles, gestionando conversaciones multimodales con imagen y audio.
- Agentes autónomos de apoyo al desarrollo: el soporte nativo de tool calling permite integrar el modelo en pipelines de CI/CD para generar código, ejecutar pruebas y corregir errores de forma automática.
- Análisis de documentos con imágenes: al aceptar entrada de imagen con resolución variable, se puede utilizar para extraer información de capturas, diagramas o documentos escaneados en entornos de atención al cliente.
- Sistemas de transcripción y resumen de audio: el modelo procesa audio de forma nativa, lo que permite transcribir reuniones y generar resúmenes ejecutables con contextos largos de hasta 128K tokens.
- Razonamiento en entornos de investigación: los modos de pensamiento configurables y el contexto largo permiten abordar problemas matemáticos o de razonamiento complejo en tareas de análisis de datos.
- Traducción multilingüe en aplicaciones empresariales: con más de 140 idiomas, el modelo puede desplegarse como servicio de traducción automática con memoria de conversación, aprovechando el soporte de system prompt para fijar el estilo y el tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de pesos de 4 bits, la carga de pesos se reduce drásticamente frente a bfloat16, pero no se ofrecen cifras oficiales.
- GPU recomendadas: no disponible. La model card indica que los modelos E2B/E4B están optimizados para despliegue on-device (móviles y portátiles) y también para servidores.
- Despliegue en consumer GPU: no disponible en la información proporcionada.
- Opciones de despliegue: vLLM (formato compressed-tensors). La model card no menciona explícitamente llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B It QAT w4a16 (este repo) | 8,6B totales (4,5B efectivos) | 128K | w4a16 (compressed-tensors) | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | 8,6B totales | 128K | Q4_0 (unquantized QAT, half-precision) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it-qat-w4a16-ct | ~5,1B totales | 128K | w4a16 | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it-qat-w4a16-ct | ~11,95B totales | 256K | w4a16 | Apache 2.0 | Hugging Face |

No se dispone de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Sesgos y alucinación: la model card no detalla sesgos específicos, pero, como en cualquier modelo generativo, existe riesgo de alucinación y de reflejar sesgos presentes en los datos de entrenamiento.
- Compatibilidad con decodificación especulativa: al usar un modelo asistente (drafter), este debe ser un checkpoint QAT de la misma precisión; de lo contrario, la decodificación especulativa puede fallar o degradar el rendimiento.
- Restricciones de licencia: aunque la licencia declarada es Apache 2.0, el uso de Gemma está sujeto a términos adicionales disponibles en https://ai.google.dev/gemma/docs/gemma_4_license. Es necesario revisarlos antes de un despliegue comercial.
- Limitaciones de contexto: el contexto de 128K tokens es amplio, pero no se especifica cómo se comporta la calidad en los tramos finales de la ventana. Para contextos muy largos, se recomienda validar el rendimiento con casos reales.
- Idiomas: aunque se declara soporte para más de 140 idiomas, el rendimiento puede variar significativamente entre idiomas, especialmente en lenguas de bajos recursos.

## Enlaces

- Repositorio de Hugging Face del autor: https://huggingface.co/yessssssssssssssssss/gemma-4-E4B-it-qat-w4a16-ct
- Repositorio de Hugging Face original (Google): https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Colección de modelos Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia de Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
