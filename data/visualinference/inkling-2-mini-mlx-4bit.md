# VisualInference/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con arquitectura de bucles ("looped MoE") desarrollado por Thinking Machines Lab. Con 26.388.641.280 parámetros totales, acepta texto e imágenes como entrada y genera texto, bajo licencia Apache 2.0. El repositorio que nos ocupa, VisualInference/Inkling-2-Mini-MLX-4bit, es una cuantización de 4 bits del modelo original, empaquetada en formato mlx-vlm para su ejecución en Apple Silicon.

La relevancia de esta build concreta radica en la reducción de requisitos de memoria: pasa de 18,2 GiB de pesos del checkpoint original a 14,8 GiB, lo que permite ejecutar el modelo en Macs con 32 GB de memoria unificada (24 GB es ajustado). Según la model card, la pérdida en held-out aumenta solo +0,002 ± 0,001 nats por token (+0,2 % de perplejidad) respecto al original, con un rendimiento de decodificación de 31,1 tok/s frente a 25,9 tok/s del original en un Mac mini M4 Pro de 48 GB.

El modelo está orientado a agentes y tool calling, con soporte de razonamiento configurable (reasoning_effort) y decodificación especulativa mediante un drafter DSpark incluido (mtp.safetensors). Su pipeline es image-text-to-text y su idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos con bucles (looped MoE), multimodal texto-imagen a texto |
| Parametros totales | 26.388.641.280 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (se han medido prompts de hasta 16k tokens en las pruebas de memoria) |
| Tipos de cuantizacion | 4 bits en este repositorio (4,5 bits por peso en capas de expertos); existen builds de 3 bits y 2 bits del mismo autor |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato mlx-vlm), más mtp.safetensors para el drafter DSpark |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con bucles ("inkling2_loop"), multimodal (entrada de texto e imagen, salida de texto). El checkpoint original ya emplea cuantización en la mayoría de sus capas de expertos con formatos NVFP4 y MXFP8 (5,1 bits por peso de media). Esta build de 4 bits mantiene intactos los expertos originales de 4 bits y recuantiza a 4 bits las cuatro capas de expertos que estaban en 8 bits, aplicando compensación de error; el resto de componentes se mantiene en 8 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Como innovaciones técnicas destacables, el modelo incorpora un drafter DSpark para decodificación especulativa (incluido sin modificar en el repositorio) y un mecanismo de esfuerzo de razonamiento configurable a través de la plantilla de chat, con niveles none, minimal, low, medium, high y xhigh (por defecto high).

## Capacidades

- Generación de texto y razonamiento con nivel de esfuerzo configurable mediante reasoning_effort.
- Entrada de imágenes (image-text-to-text) a través del flag --image en mlx_vlm.generate.
- Tool calling / function calling: el servidor compatible con OpenAI devuelve tool_calls con argumentos en formato JSON y finish_reason "tool_calls"; en las pruebas realizadas obtuvo 18/19 en la tarea de tool calls.
- Salida JSON estructurada: 9/10 en las pruebas de JSON output.
- Ejecución de tareas de agente multi-paso: 4/4 en las tareas de Hermes Agent.
- Generación de código: 36/40 en HumanEval en esta build de 4 bits.
- Razonamiento matemático: 45/50 en GSM8K en esta build de 4 bits.
- Decodificación especulativa opcional mediante el drafter DSpark incluido.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede gestionar bucles de agente con llamadas a herramientas, devolviendo tool_calls estructurados vía API compatible con OpenAI; conviene usar reasoning_effort low o medium para acelerar cada paso del bucle.
- Asistentes de código en local sobre Mac: con 36/40 en HumanEval y soporte de generación de funciones (por ejemplo, fusionar intervalos solapados), es adecuado para autocompletado y generación de código en entornos de desarrollo sobre Apple Silicon sin conexión a la nube.
- Automatización de tareas con salida JSON: su rendimiento de 9/10 en JSON output lo hace utilizable en pipelines que requieren respuestas estructuradas para integración con sistemas posteriores.
- Procesamiento de documentos con imágenes: al aceptar entrada de imagen y texto, puede emplearse para extraer información de capturas, formularios o figuras combinadas con instrucciones textuales.
- Razonamiento matemático asistido: con 45/50 en GSM8K, sirve para resolver problemas aritméticos de varios pasos en herramientas educativas o de validación internas.
- Despliegue de servidor local compatible con OpenAI: mediante mlx_vlm.server en loopback, se puede integrar en aplicaciones existentes que consuman /v1/chat/completions con soporte de herramientas.
- Prototipado de agentes en Mac con memoria limitada: la build de 4 bits (14,8 GiB de pesos, 15,5 GiB de memoria pico con prompt corto) permite ejecutar el modelo en equipos de 32 GB donde el checkpoint original no cabría con holgura.

## Benchmarks y rendimiento

Datos de la model card, medidos en un Mac mini (M4 Pro, 48 GB) con decodificación greedy (temperatura 0):

| Build | Pesos | Pérdida held-out vs original | GSM8K | HumanEval | Tool calls | JSON output | Hermes Agent | Velocidad decodificación | Memoria pico (prompt corto / 4k / 16k) |
|---|---|---|---|---|---|---|---|---|---|
| Original (cargado tal cual) | 18,2 GiB | referencia (1,448 nats/token) | 48/50 | 35/40 | 18/19 | 9/10 | 4/4 | 25,9 tok/s | 20,3 / 21,4 / 22,1 GiB |
| 4bit (este repo) | 14,8 GiB | +0,002 ± 0,001 nats (+0,2 % perplejidad) | 45/50 | 36/40 | 18/19 | 9/10 | 4/4 | 31,1 tok/s | 15,5 / 16,2 / 16,9 GiB |
| 3bit | 11,9 GiB | +0,014 ± 0,004 nats (+1,4 % perplejidad) | 49/50 | 35/40 | 19/19 | 9/10 | 4/4 | 33,8 tok/s | 12,7 / 13,5 / 14,1 GiB |
| 2bit | 9,1 GiB | +0,095 ± 0,013 nats (+10,0 % perplejidad) | 47/50 | 32/40 | 19/19 | 9/10 | 4/4 | 33,4 tok/s | 9,8 / 10,6 / 11,2 GiB |

La propia model card advierte que los conjuntos de tareas son pequeños y que diferencias de unos pocos problemas entre filas son ruido; la comparación precisa es la pérdida held-out. No se han publicado resultados de benchmarks adicionales (MMLU u otros) en la información disponible.

## Requisitos de hardware

- Memoria: 14,8 GiB de pesos; memoria pico medida de 15,5 GiB con prompt corto, 16,2 GiB con 4k y 16,9 GiB con 16k. Recomendado para Macs con 32 GB de memoria unificada; 24 GB es ajustado.
- GPU: el formato mlx-vlm está diseñado para Apple Silicon; las mediciones se realizaron en un Mac mini con M4 Pro y 48 GB. No hay datos de rendimiento en GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Cabe en hardware de consumo Apple Silicon con 32 GB o más; no aplica a GPU de consumo convencionales por el formato MLX.
- Despliegue: mlx-vlm (instalación desde el repositorio git de Neywa-Labs hasta que haya release con soporte de Inkling 2 Mini), con CLI mlx_vlm.generate y servidor compatible con OpenAI mediante mlx_vlm.server. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Velocidad: 31,1 tok/s de decodificación en M4 Pro con decodificación greedy; la decodificación especulativa con el drafter DSpark no supone una ganancia fiable en M4 Pro según la model card.
- Requisito de versión: el soporte de tool calling requiere mlx-vlm en el commit 434a1bed (2026-11-21, PR 2783) o posterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (este repo) | 26,4B | No disponible | Apache 2.0 | safetensors MLX 4 bits | 14,8 GiB, 31,1 tok/s en M4 Pro, GSM8K 45/50, HumanEval 36/40 |
| Inkling-2-Mini (original) | 26,4B | No disponible | Apache 2.0 | safetensors (NVFP4/MXFP8) | 18,2 GiB, 25,9 tok/s en M4 Pro, GSM8K 48/50, HumanEval 35/40 |
| Inkling-2-Mini-MLX-3bit | 26,4B | No disponible | Apache 2.0 | safetensors MLX 3 bits | 11,9 GiB, 33,8 tok/s, GSM8K 49/50, HumanEval 35/40 |
| Inkling-2-Mini-MLX-2bit | 26,4B | No disponible | Apache 2.0 | safetensors MLX 2 bits | 9,1 GiB, 33,4 tok/s, GSM8K 47/50, HumanEval 32/40 |

No se dispone de datos de otros modelos de la misma categoría (mismo tamaño o tarea) en la información proporcionada para establecer comparaciones externas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La model card no documenta sesgos conocidos ni evaluación de alucinación; se debe aplicar validación en producción.
- El razonamiento consume tokens de max_tokens: con un límite bajo el modelo puede agotarlo razonando y devolver una respuesta vacía; se recomienda permitir al menos 1.000 tokens por turno.
- El nivel reasoning_effort none no desactiva por completo el razonamiento.
- El token de parada correcto es <|content_model_end_sampling|> (id 200006); <|end_message|> no debe usarse como stop string.
- La temperatura por defecto en generation_config.json es 1.0; los benchmarks de la card usan temperatura 0.
- El soporte de tool calling requiere una versión concreta de mlx-vlm (commit 434a1bed o posterior); versiones anteriores no devuelven tool_calls ni content.
- La decodificación especulativa con el drafter DSpark no ofrece una ganancia fiable en M4 Pro.
- Los conjuntos de evaluación de la model card son pequeños; las diferencias de pocos problemas entre builds no son significativas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y atribución correspondientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 3 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-3bit
- Build de 2 bits: https://huggingface.co/VisualInference/Inkling-2-Mini-MLX-2bit
- mlx-vlm (repositorio): https://github.com/Neywa-Labs/mlx-vlm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Pull request 2778 de mlx-vlm (soporte de Inkling 2 Mini, 2026-11-20): no disponible como enlace directo en la información proporcionada
- Pull request 2783 de mlx-vlm (parser de tool calls, commit 434a1bed, 2026-11-21): no disponible como enlace directo en la información proporcionada
