# Vtuber-plan/Huihui-Qwen3.8-27B-abliterated-NVFP4

## Resumen

Huihui-Qwen3.8-27B-abliterated-NVFP4 es una cuantización de 4 bits (NVFP4) del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez deriva de Qwen/Qwen3.8-27B. El modelo base fue sometido a un proceso de "abliteration" para eliminar rechazos y comportamientos de negativa, y luego se cuantizó con NVIDIA TensorRT Model Optimizer para reducir el uso de memoria y acelerar la inferencia en GPUs compatibles.

La cuantización NVFP4 usa pesos de 4 bits (grupo de tamaño 16) y caché KV en FP8, con un conjunto de calibración extendido con 675 muestras de chain-of-thought largas generadas por el propio modelo, diseñadas para evitar que el ruido de cuantización degrade el comportamiento de parada en la fase de razonamiento. Además, se incluye un chat template corregido que ajusta el `reasoning_effort` por defecto a `medium`, lo que evita que el modelo agote el presupuesto de tokens antes de dar una respuesta.

El repositorio contiene 5 shards de safetensors (~19,5 GB en total), con un tamaño de repo de 20,6 GB y un total de 15.193.246.960 parámetros según los archivos de pesos. El modelo está licenciado bajo Apache 2.0 y se distribuye para uso con runtimes compatibles con NVFP4, como sglang o TensorRT-LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (según módulos excluidos) y torre de visión (no se especifica en detalle) |
| Parametros totales | 15.193.246.960 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos 4-bit, group size 16) + FP8 KV cache |
| Idiomas soportados | en, fr, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, cuantización NVFP4) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que según la información de la model card incorpora atención lineal (los módulos `conv1d`, `in_proj_a`, `in_proj_b` se excluyen de la cuantización) y una torre de visión (`vision tower`). La versión abliterated de huihui-ai elimina los rechazos del modelo original, permitiendo que responda sin negarse a ciertas instrucciones. Sobre esta base, el autor aplicó una cuantización NVFP4 con NVIDIA ModelOpt 0.45.0, excluyendo además `lm_head`, embeddings, capas MTP y la torre de visión.

El proceso de calibración usó 4771 muestras (2048 de ultrachat_200k, 2048 de Nemotron-SFT-Multilingual-v2 y 675 muestras auto-generadas de chain-of-thought largo) con una longitud de secuencia de calibración de 6144 tokens. Las muestras auto-generadas se produjeron con el modelo sin cuantizar a `reasoning_effort=xhigh`, y solo se conservaron las que terminaban correctamente con ` response`. El objetivo era que la cuantización no degradara el comportamiento de parada de la fase de razonamiento.

## Capacidades

- Generación de texto y conversación multilingüe (inglés, francés y otros idiomas).
- Razonamiento con chain-of-thought visible (modo thinking) mediante el parámetro `reasoning_effort` (default `medium`, con opción `xhigh`).
- Modo no-razonamiento (`enable_thinking=false`) restaurado en el chat template corregido.
- Soporte de tool calling robusto (renderizado de argumentos JSON sin fallos).
- Capacidad de procesamiento de imágenes (por la presencia de la torre de visión en el modelo base, aunque no se documenta explícitamente en esta variante).
- Compatibilidad con APIs de servidores compatibles con ModelOpt NVFP4 (sglang, TensorRT-LLM).

## Casos de uso

- Asistente conversacional de propósito general: el modelo puede mantener diálogos multi-turno en inglés y francés con un tono natural, gracias a su chat template corregido que evita el agotamiento de tokens en razonamiento innecesario.
- Razonamiento y resolución de problemas: con `reasoning_effort=medium` o `xhigh`, es adecuado para tareas de matemáticas, lógica y análisis, siempre que se use `temperature > 0` para evitar bucles de repetición.
- Generación de código: aunque no se especifican benchmarks, la base Qwen3.8 es conocida por su capacidad en programación; el modelo puede integrarse en pipelines de autocompletado o revisión de código con tool calling.
- Procesamiento de documentos multilingües: al soportar varios idiomas (EN, FR, multilingual), puede resumir o extraer información de textos en diferentes lenguas.
- Desarrollo de agentes con tool calling: el renderizado robusto de tool calls permite que el modelo invoque funciones externas en pipelines de automatización.
- Chat de moderación o contenido generativo sin restricciones: al ser abliterated, puede generar respuestas a temas que normalmente serían rechazados, útil para investigación de alineación o aplicaciones de nicho (con las debidas advertencias).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se añadirán resultados de GSM8K, MMLU, CMMLU y C-Eval, pero aún no están disponibles.

## Requisitos de hardware

- La model card recomienda ejecutar el modelo en una GPU de 80 GB (por ejemplo, A100 o H100) con sglang.
- El modelo en NVFP4 ocupa aproximadamente 19,5 GB en disco, y los pesos de 4 bits requieren cerca de 7,6 GB de VRAM (15,19 B × 0,5 bytes), más la caché KV FP8 y activaciones, por lo que podría caber en GPUs de 24 GB si se gestiona la memoria correctamente, aunque no está verificado.
- Se necesita un runtime con soporte para ModelOpt NVFP4 (sglang con `--quantization modelopt`, TensorRT-LLM). No es posible ejecutarlo con transformers/BF16 estándar.
- Opciones de despliegue: sglang (recomendado), TensorRT-LLM. No se menciona compatibilidad con llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-NVFP4 (este) | 15.19 B (pesos NVFP4) | NVFP4 4-bit | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27 B (según nombre) | BF16 | no disponible | Apache 2.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27 B (según nombre) | BF16 | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (versión estándar) | 27 B | BF16 | no disponible | Apache 2.0 | Hugging Face |

No hay datos de rendimiento publicados para comparar con otras alternativas. El modelo se diferencia por su cuantización NVFP4 y su comportamiento abliterated (sin rechazos).

## Limitaciones y advertencias

- El proceso de abliteración elimina las negativas del modelo, lo que puede generar respuestas inapropiadas, dañinas o no deseadas. No se recomienda su uso en producción sin moderación de contenido.
- El modelo puede alucinar o generar información falsa, especialmente en modos de razonamiento largo.
- La cuantización NVFP4 puede introducir degradación de rendimiento en comparación con el modelo BF16, aunque la validación del autor sugiere que no hay regresión significativa en el comportamiento de parada.
- El uso de `reasoning_effort=xhigh` con `temperature=0` provoca bucles de repetición y agotamiento del presupuesto de tokens; se recomienda usar `temperature > 0` y `repetition_penalty`.
- No es compatible con runtimes que no soporten NVFP4 (por ejemplo, transformers estándar no lo desaquantiza).
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a leyes de moderación según la región.
- No se especifican límites de contexto; se debe verificar con el modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Vtuber-plan/Huihui-Qwen3.8-27B-abliterated-NVFP4
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Chat template corregido: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Dataset de calibración (ShareGPT limpiado): https://huggingface.co/datasets/Vtuber-plan/sharegpt-cleaned
- Página en Ollama (versión abliterada): https://ollama.com/huihui_ai/Qwen3.8-abliterated
