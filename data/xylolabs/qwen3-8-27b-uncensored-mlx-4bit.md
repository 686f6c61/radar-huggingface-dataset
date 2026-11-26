# Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit

## Resumen

Qwen3.8-27B-Uncensored-MLX-4bit es una conversión a formato MLX y cuantización a 4 bits del modelo Qwen3.8-27B de Alibaba Qwen, publicada por Xylolabs. El autor ha aplicado una edición "abliterated" (eliminación de la dirección de rechazo en los pesos) sobre el modelo base y posteriormente lo ha convertido para su uso con la librería `mlx-lm` en hardware Apple Silicon. El resultado es un modelo de texto de 26.895.993.856 parámetros (aproximadamente 27B) que responde a muchas peticiones que el modelo original declina.

La relevancia de esta ficha radica en dos factores. Primero, permite ejecutar un modelo de ~27B en equipos Mac con memoria unificada de 36 GB gracias a la cuantización de 4 bits (16,81 GB de pesos). Segundo, la edición "uncensored" reduce los rechazos, lo que puede interesar a investigadores que estudian alineamiento, comportamiento de rechazo o generación de contenido sin restricciones. Es importante señalar que esta conversión es solo de texto: la torre de visión y la capa MTP del modelo original han sido eliminadas.

El modelo se publica bajo licencia Apache 2.0 y está pensado exclusivamente para inferencia con MLX en macOS; no es compatible con vLLM, llama.cpp ni otras pilas de inferencia habituales en GPU NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); sin torre de visión ni capa MTP en esta conversión |
| Parámetros totales | 26.895.993.856 (~27B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | Hasta 256K tokens según el modelo base; en esta conversión, 121K con 36 GB de memoria unificada y hasta 256K con 64 GB o más |
| Tipos de cuantización | 4 bits (esta publicación) y 8 bits (publicación hermana); cuantización afín con group size 32, escalas y sesgos en float16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); cuantización de 4 bits en todas las capas lineales, embedding de tokens y LM head; normas y tensores no cuantizados en float16, excepto `A_log` en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B más allá de su pertenencia a la familia Qwen3.5. Se trata de un transformer de aproximadamente 27B parámetros, con una torre de visión y una capa MTP (multi-token prediction) que han sido excluidas en esta conversión, por lo que el modelo resultante es exclusivamente de texto. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica principal de esta publicación es el proceso de edición y cuantización. Los pesos corresponden a la edición "uncensored" publicada por el mismo autor en formato GGUF, reaplicada sobre Qwen/Qwen3.8-27B y después cuantizada a MLX. El autor reporta que, frente a los pesos BF16 de esa edición, 10 tensores comprobados (embedding de tokens, LM head y proyecciones de salida en las capas 0, 3, 38 y 63) son bit-idénticos, y que el modelo MLX sin cuantizar presenta una KL de 0,000478 sobre WikiText-2 (4 x 512). La cuantización de 4 bits mantiene una comprobación de 7 preguntas con 7/7 aciertos, igual que el BF16.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Modo de razonamiento ("thinking") activado por defecto; puede desactivarse con `--chat-template-config '{"enable_thinking": false}'` para respuestas directas.
- Reducción de rechazos: responde a muchas peticiones que el modelo original declina, según declara el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no soportada (la torre de visión ha sido eliminada en esta conversión).
- Audio: no soportado según la información disponible.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el modelo permite estudiar cómo varía la tasa de rechazo tras eliminar la dirección de rechazo de los pesos, comparando respuestas con el Qwen3.8-27B original en el mismo hardware.
- Generación de texto en local en Mac: con 16,81 GB de pesos en 4 bits, cabe en un Mac con 36 GB de memoria unificada, lo que permite ejecutar un modelo de ~27B sin conexión a servicios en la nube.
- Procesamiento de documentos largos: la ventana de contexto de hasta 121K tokens con 36 GB y hasta 256K con 64 GB permite resumir o analizar contratos, informes o bases de código extensas en una sola pasada.
- Prototipado de asistentes conversacionales: mediante `mlx_lm.chat` se puede desplegar un chat multi-turno local para pruebas de producto antes de migrar a infraestructura de producción.
- Generación creativa sin filtros: útil para escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo alineado resultan un obstáculo, siempre dentro del marco legal aplicable.
- Evaluación de cuantización: los datos de KL y top-1 publicados (KL de 0,039687 en WikiText-2 para 4 bits frente a 0,000354 para 8 bits) permiten usarlo como referencia en estudios sobre el impacto de la cuantización afín de 4 bits en modelos de ~27B.
- Despliegue en estaciones de trabajo Apple: con un Mac Studio M5 Ultra de 96 GB o más se puede servir el modelo en 8 bits (28,58 GB) con contexto completo de 256K para tareas de análisis que requieran fidelidad máxima.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización frente a los pesos BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Cuantización | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Comprobación de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 28,58 GB | 0,000354 | 99,26% | 0,000327 | 99,31% | 0,000250 | 99,06% | 7/7 (BF16: 7/7) |
| MLX 4-bit | 16,81 GB | 0,039687 | 90,82% | 0,045670 | 91,76% | 0,040544 | 89,25% | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,81 GB de pesos en 4 bits; 28,58 GB en 8 bits. El contexto adicional consume memoria proporcional a la longitud de la secuencia.
- Hardware objetivo: Apple Silicon con MLX. La tabla del autor recomienda Mac Studio M5 Max (32 o 40 núcleos de GPU) y M5 Ultra.
- Configuraciones validadas por el autor:
  - Mac Studio M5 Max, 32 núcleos de GPU, 36 GB: 4 bits, contexto de 121K.
  - Mac Studio M5 Max, 40 núcleos de GPU, 48 GB: 8 bits, contexto de 80K.
  - Mac Studio M5 Max, 40 núcleos de GPU, 64 GB o 128 GB: 8 bits, contexto de 256K.
  - Mac Studio M5 Ultra, 96 GB, 256 GB o 512 GB (80 núcleos de GPU): 8 bits, contexto de 256K.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por esta conversión, que depende de MLX. Para esas GPU habría que usar el modelo base o la edición GGUF del autor.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 (comandos `mlx_lm.generate` y `mlx_lm.chat`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit | ~27B | Hasta 256K (121K con 36 GB) | MLX 4 bits, Apple Silicon | Apache 2.0 | Edición sin rechazos, solo texto |
| Xylolabs/Qwen3.8-27B-Uncensored-MLX-8bit | ~27B | Hasta 256K | MLX 8 bits, Apple Silicon | Apache 2.0 | Mayor fidelidad (KL 0,000354), 28,58 GB |
| Xylolabs/Qwen3.8-27B-Uncensored-GGUF | ~27B | No disponible | GGUF, CPU/GPU con llama.cpp | Apache 2.0 | Edición sin rechazos en formato GGUF |
| Qwen/Qwen3.8-27B (base) | ~27B | No disponible | Safetensors, GPU | Apache 2.0 | Modelo original alineado, con torre de visión y MTP |

No se dispone de datos de rendimiento comparativo en tareas estándar entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo puede producir contenido ofensivo, inseguro o legalmente problemático; el autor no ofrece garantías sobre el comportamiento en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de veracidad para esta conversión.
- Solo texto: la torre de visión y la capa MTP han sido eliminadas, por lo que no admite entradas de imagen ni decodificación especulativa multi-token.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- La cuantización de 4 bits degrada la fidelidad: KL de 0,039687 y top-1 del 90,82% frente al BF16, muy por debajo del 8 bits (KL 0,000354, top-1 99,26%). Para tareas sensibles a la precisión, se recomienda la variante de 8 bits.
- Dependencia exclusiva de MLX y macOS: no se puede desplegar en servidores Linux con GPU NVIDIA sin reconvertir los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó el 26 de noviembre de 2026; no hay validación independiente de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros de rechazo exige revisión legal y de política de contenido propia.
- El autor indica que se modificaron los pesos y se incluye un fichero NOTICE; conviene revisarlo antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Edición GGUF del mismo autor: https://huggingface.co/Xylolabs/Qwen3.8-27B-Uncensored-GGUF
- Repositorio MLX: https://github.com/ml-explore/mlx
- Hilo de Reddit mencionado en la búsqueda: https://www.reddit.com/r/LocalLLaMA/comments/1y1uqn7/dont_waste_your_time_by_downloading/
