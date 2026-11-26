# Xylolabs/Qwen3.8-27B-Uncensored-MLX-8bit

## Resumen

Qwen3.8-27B-Uncensored-MLX-8bit es una conversión al formato MLX de Apple Silicon del modelo Qwen3.8-27B de Alibaba, publicada por Xylolabs. Sobre los pesos originales se ha aplicado una edición de tipo "abliterated" que elimina la dirección de rechazo (refusal direction) de los pesos, de modo que el modelo responde a peticiones que el original declina. Posteriormente, los pesos se han convertido a MLX para su uso con `mlx-lm` y se han cuantizado a 8 bits con cuantización afín y tamaño de grupo 64.

El modelo conserva la arquitectura del Qwen3.8-27B original, con 26.895.993.856 parámetros (aproximadamente 26,9 mil millones), pero la conversión es solo de texto: se han eliminado la torre de visión y la capa MTP (multi-token prediction). El resultado es un modelo de generación de texto y conversación pensado para ejecutarse en hardware Apple Silicon con memoria unificada, con un tamaño de pesos de 28,58 GB.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de ~27B, una edición sin censura y una cuantización MLX de 8 bits con métricas de fidelidad publicadas frente a los pesos BF16 de referencia (KL de 0,000354 en WikiText-2 y 99,26 % de acuerdo top-1). Está pensado para desarrolladores que trabajan en Mac con memoria unificada suficiente y necesitan un modelo local de gran tamaño sin las restricciones de rechazo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5`); sin torre de visión ni capa MTP en esta conversión |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens según memoria unificada disponible (80K con 48 GB, 121K con 36 GB y variante 4-bit, 256K con 64 GB o más) |
| Tipos de cuantizacion | 8 bits (esta versión) y 4 bits (versión hermana `Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx-lm`), cuantización afín con grupo 64, escalas y sesgos en float16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B de Qwen (Alibaba), un transformer decoder-only de aproximadamente 26,9 mil millones de parámetros. Esta conversión concreta elimina dos componentes del modelo original: la torre de visión y la capa MTP, por lo que el artefacto resultante es exclusivamente de texto. La cuantización es afín (affine) con tamaño de grupo 64; se cuantizan a 8 bits todas las capas lineales, el embedding de tokens y la LM head, mientras que las normas y el resto de tensores no cuantizados quedan en float16, salvo `A_log`, que se mantiene en bfloat16.

El proceso de edición parte de los pesos publicados en `Xylolabs/Qwen3.8-27B-Uncensored-GGUF`, que se reaplican sobre `Qwen/Qwen3.8-27B` y después se cuantizan. El autor declara que, frente a los pesos BF16 de esa edición, los 10 tensores comprobados (embedding de tokens, LM head y proyecciones de salida en las capas 0, 3, 38 y 63) son idénticos bit a bit. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información no está disponible en la documentación consultada.

## Capacidades

- Generación de texto y conversación multi-turno, con modo de razonamiento activado por defecto (thinking mode) y posibilidad de desactivarlo.
- Respuesta directa sin cadena de pensamiento mediante `--chat-template-config '{"enable_thinking": false}'`.
- Reducción de rechazos: el modelo responde a muchas peticiones que el Qwen3.8-27B original declina, según declara el autor.
- Solo texto: no hay capacidades de visión en esta conversión, ya que la torre visual se ha eliminado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de texto creativo sin restricciones de contenido: el modelo está pensado para escritura de ficción, guiones o narrativa donde el modelo base aplicaría rechazos; su ventana de hasta 256K tokens permite mantener coherencia en obras largas.
- Asistente conversacional local en Mac: con `mlx_lm.chat` se puede desplegar un asistente privado en un Mac Studio con 64 GB o más de memoria unificada, sin enviar datos a la nube.
- Procesamiento de documentos extensos: la ventana de 256K tokens (con memoria suficiente) permite resumir o extraer información de contratos, informes o bases de código completas en una sola pasada.
- Investigación sobre alineación y seguridad: la edición abliterated permite estudiar el comportamiento de un modelo sin la dirección de rechazo y compararlo con el original, útil para analizar mecanismos de negativa.
- Prototipado de pipelines de generación de texto en local: la integración directa con `mlx-lm` 0.32.2 permite usar `mlx_lm.generate` en scripts y experimentos sin infraestructura GPU dedicada.
- Evaluación de cuantización: las métricas de KL y acuerdo top-1 publicadas frente a BF16 permiten usar este modelo como referencia para estudiar el impacto de la cuantización de 8 bits en modelos de ~27B.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización frente a los pesos BF16 de la edición sin censura, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---:|---:|
| Tamano | 28,58 GB | 16,81 GB |
| WikiText-2 KL | 0,000354 | 0,039687 |
| WikiText-2 top-1 | 99,26 % | 90,82 % |
| Chat KL | 0,000327 | 0,045670 |
| Chat top-1 | 99,31 % | 91,76 % |
| Held-out KL | 0,000250 | 0,040544 |
| Held-out top-1 | 99,06 % | 89,25 % |
| Check de 7 preguntas | 7/7 (BF16: 7/7) | 7/7 (BF16: 7/7) |

Además, el autor indica que el modelo MLX sin cuantizar tiene una KL de 0,000478 en WikiText-2 (4 x 512). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 28,58 GB de pesos en 8 bits; la versión 4 bits ocupa 16,81 GB.
- Hardware objetivo: Apple Silicon con memoria unificada. La tabla del autor cubre Mac Studio M5 Max (32 y 40 núcleos de GPU) y M5 Ultra (hasta 80 núcleos de GPU).
- Configuraciones probadas por el autor:
  - M5 Max 32-core GPU, 36 GB: usar la variante 4-bit (16,81 GB), contexto de 121K.
  - M5 Max 40-core GPU, 48 GB: 8 bits, contexto de 80K.
  - M5 Max 40-core GPU, 64 GB: 8 bits, contexto de 256K.
  - M5 Ultra 96 GB, 128 GB, 256 GB y 512 GB: 8 bits, contexto de 256K.
- GPU NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon y no se documenta soporte para CUDA.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 mediante `mlx_lm.generate` y `mlx_lm.chat`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3.8-27B-Uncensored-MLX-8bit | ~26,9 B | hasta 256K (según memoria) | MLX safetensors 8-bit | Apache 2.0 | Solo texto; sin censura; métricas KL publicadas |
| Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit | ~26,9 B | 121K en 36 GB | MLX safetensors 4-bit | Apache 2.0 | Variante de menor tamaño (16,81 GB) con mayor degradación (KL 0,0397) |
| Xylolabs/Qwen3.8-27B-Uncensored-GGUF | ~26,9 B | no disponible | GGUF | Apache 2.0 | Edición sin censura en formato GGUF, pesos BF16 de referencia de la edición |
| Qwen/Qwen3.8-27B | ~26,9 B | no disponible | safetensors | Apache 2.0 | Modelo base original con rechazos y torre de visión |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo reduce las negativas del modelo, lo que implica un riesgo mayor de generar contenido dañino, ilegal o inexacto sin advertencia; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; como todo modelo generativo, puede producir información falsa con apariencia de rigor.
- Solo texto: al eliminar la torre de visión, no puede procesar imágenes, a diferencia del Qwen3.8-27B original.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe más allá de la del modelo base.
- El contexto máximo efectivo depende de la memoria unificada disponible: 80K con 48 GB, 121K con 36 GB y la variante 4-bit, y 256K solo con 64 GB o más.
- Formato exclusivo MLX: no se puede desplegar en GPUs NVIDIA ni en servidores x86 convencionales sin reconversión.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un `NOTICE` por la modificación de pesos; conviene revisarlo y evaluar las implicaciones legales y éticas de distribuir un modelo sin censura.
- No se han publicado benchmarks de tareas estándar, por lo que la calidad frente a otros modelos de ~27B no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edición sin censura en GGUF: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-GGUF
- Variante 4-bit MLX: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de utilidades del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
