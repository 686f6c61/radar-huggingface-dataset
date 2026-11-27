# Xylolabs/Qwen3.5-9B-MLX-8bit

## Resumen

Qwen3.5-9B-MLX-8bit es una conversión y cuantización a 8 bits del modelo Qwen/Qwen3.5-9B, publicada por Xylolabs para su uso con la librería `mlx-lm` de Apple. El modelo base pertenece a la familia Qwen3.5 de Alibaba, con 8.953.801.728 parámetros (aproximadamente 9 mil millones) y una ventana de contexto de 256K tokens según la tabla de compatibilidad de hardware de la model card. La conversión es exclusivamente de texto: se han eliminado la torre de visión y la capa MTP (multi-token prediction) del modelo original.

El formato es MLX con cuantización afín de grupo 64, escalas y sesgos en float16, aplicada a todas las capas lineales, el embedding de tokens y la LM head. El resultado ocupa 9,51 GB en disco frente a los 5,60 GB de la variante MLX 4-bit, lo que lo sitúa en el rango de memoria unificada de equipos Apple Silicon de gama alta. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha radica en que ofrece una alternativa de cuantización de alta fidelidad (KL de 0,000573 en WikiText-2 frente a BF16) para ejecutar un modelo de 9B con contexto largo en hardware Apple, sin necesidad de GPUs dedicadas. Es una opción orientada a desarrolladores que trabajan en ecosistema macOS y necesitan inferencia local con degradación mínima respecto al modelo en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), conversión MLX; sin torre de visión ni capa MTP |
| Parámetros totales | 8.953.801.728 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantización | 8-bit afín, group size 64; escalas y sesgos en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 9,51 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con aproximadamente 9 mil millones de parámetros. La conversión de Xylolabs aplica cuantización afín de 8 bits con tamaño de grupo 64 a todas las capas lineales, al embedding de tokens y a la LM head. Las capas de normalización y el resto de tensores no cuantizados se mantienen en float16, con la excepción de `A_log`, que se guarda en float32. Se han eliminado la torre de visión y la capa MTP del modelo original, por lo que la conversión es solo de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La model card no documenta innovaciones técnicas del modelo base más allá de la propia conversión a MLX y la cuantización. El modelo "piensa por defecto" (thinking mode activado), y puede desactivarse mediante `--chat-template-config '{"enable_thinking": false}'` en `mlx_lm.generate`.

## Capacidades

- Generación de texto conversacional y de propósito general, en modo texto exclusivamente (sin visión).
- Modo de razonamiento (thinking) activado por defecto, desactivable por configuración de plantilla de chat.
- Conversaciones multi-turno con contexto de hasta 256K tokens.
- Generación de código y tareas de razonamiento, heredadas del modelo base Qwen3.5.
- Soporte multilingüe: no documentado en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de audio o visión: no disponibles (la torre de visión fue eliminada en la conversión).

## Casos de uso

- Inferencia local en Mac con contexto largo: el modelo permite procesar documentos extensos de hasta 256K tokens en equipos Apple Silicon con memoria unificada suficiente (por ejemplo, Mac Studio M5 Max con 36 GB), sin depender de GPUs dedicadas.
- Asistentes conversacionales en escritorio: con `mlx_lm.chat` se puede desplegar un chatbot local multi-turno con thinking mode, útil para prototipado rápido en macOS.
- Procesamiento de documentación técnica: la ventana de 256K permite resumir o consultar repositorios de documentación, manuales o bases de conocimiento extensas en una sola pasada.
- Generación de código en local: al derivar de Qwen3.5, es adecuado para autocompletado y generación de fragmentos de código en entornos de desarrollo sobre macOS, con la ventaja de no enviar datos a servicios externos.
- Análisis de textos largos con alta fidelidad: el KL de 0,000573 frente a BF16 en WikiText-2 indica que las respuestas son prácticamente indistinguibles del modelo en precisión completa, lo que lo hace apto para tareas donde la fidelidad es crítica.
- Evaluación y benchmarking de cuantizaciones: la model card incluye métricas KL y top-1 frente a BF16, lo que permite usar este modelo como referencia para comparar otras cuantizaciones en pipelines de investigación.
- Educación e investigación: al ser Apache 2.0 y ejecutable en hardware de consumo Apple, sirve para experimentación académica sin infraestructura de GPU.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de la cuantización frente a BF16 (KL y top-1) sobre WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens:

| Cuantización | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Verificación 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 9,51 GB | 0,000573 | 99,05% | 0,000806 | 99,16% | 0,000343 | 98,65% | 7/7 (BF16: 7/7) |
| MLX 4-bit | 5,60 GB | 0,063576 | 88,98% | 0,067069 | 88,59% | 0,059950 | 86,04% | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 9,51 GB para los pesos en 8-bit; se requiere memoria unificada adicional para el contexto y el estado de inferencia.
- Hardware recomendado según la model card: Mac Studio M5 Max (32 o 40 núcleos de GPU, 36-128 GB de memoria unificada) y Mac Studio M5 Ultra (96-512 GB), todos con contexto de 256K.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, ya que el formato MLX está diseñado para Apple Silicon.
- ¿Cabe en GPU de consumo? No en el sentido tradicional; está pensado para memoria unificada de Apple Silicon. No se documenta compatibilidad con GPUs NVIDIA o AMD.
- Despliegue: `mlx-lm==0.32.2` (comandos `mlx_lm.generate` y `mlx_lm.chat`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3.5-9B-MLX-8bit | 8,95B | 256K | MLX safetensors 8-bit | Apache 2.0 | Hugging Face |
| Xylolabs/Qwen3.5-9B-MLX-4bit | no disponible | 256K (según tabla de hardware) | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes documentadas en la model card. No se dispone de datos de rendimiento en tareas para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es una conversión solo de texto: no incluye visión ni la capa MTP del modelo base, por lo que no puede realizar tareas multimodales.
- El formato MLX limita su uso a hardware Apple Silicon; no es desplegable en GPUs NVIDIA/AMD ni en la mayoría de stacks de servidor convencionales.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- No se documentan sesgos conocidos ni tasas de alucinación; se heredan los del modelo base Qwen3.5, no evaluados en esta conversión.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe más allá de lo que ofrezca el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` y la licencia del autor de la conversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria de su comportamiento en producción.
- No se documenta soporte de tool calling ni de agentes; conviene verificarlo empíricamente antes de usarlo en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
