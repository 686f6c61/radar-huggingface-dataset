# ThakiCloud/Qwen3-Coder-30B-A3B-W4A16

## Resumen

ThakiCloud/Qwen3-Coder-30B-A3B-W4A16 es una cuantización W4A16 (pesos en 4 bits, activaciones en 16 bits) del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct, desarrollada por ThakiCloud. El objetivo principal es reducir el tamaño del modelo de 61,1 GB (bf16) a 16,69 GB, un factor de compresión de 3,65 veces, manteniendo la calidad en tareas de generación de código. Según las mediciones del autor, no se detecta pérdida de rendimiento en HumanEval pass@1 (0,9400 frente a 0,9267 del bf16, dentro del error estadístico).

Este checkpoint se publica como el brazo de control de un lanzamiento doble, junto a una versión podada (Prune3) que añade un 3,1% de poda de expertos. La relevancia actual de este modelo radica en que permite ejecutar un MoE de 30,5B parámetros totales (3B activos) en hardware con VRAM limitada, aunque a costa de un throughput inferior frente a formatos como FP8 o NVFP4. Es una solución pensada para ajustar el modelo en memoria, no para maximizar la velocidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer (tag: qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (GPTQ, 4 bits en pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-Coder-30B-A3B-Instruct, un transformer de mezcla de expertos (MoE) con 30,5B parámetros totales y 3B parámetros activos por token. La contribución de este checkpoint es exclusivamente la cuantización: se aplica un esquema W4A16 mediante GPTQ y la librería llm-compressor, almacenando los pesos en 4 bits mientras las activaciones se mantienen en 16 bits. Esto implica que los pesos deben dequantizarse en tiempo de computación antes de cada multiplicación de matrices, una característica estructural que explica su menor rendimiento frente a formatos con soporte nativo en tensor cores, como FP8 o NVFP4 en GPUs Blackwell. No se proporcionan detalles sobre el entrenamiento original del modelo base ni sobre el proceso de calibración de la cuantización más allá de la evaluación posterior.

## Capacidades

- Generación de código y razonamiento técnico, heredadas del modelo base Qwen3-Coder.
- Soporte de tool calling y function calling, propio de la familia Qwen3-Coder.
- Capacidades multilingües, aunque la ficha no especifica los idiomas concretos.
- La cuantización W4A16 no altera las capacidades funcionales del modelo; solo cambia la representación numérica de los pesos.
- Pipeline de generación de texto (text-generation) sin soporte de visión o audio declarado en esta ficha.

## Casos de uso

- Desarrollo local en GPUs de consumo: con 16,69 GB de pesos, el modelo cabe en una RTX 4090 de 24 GB, permitiendo a desarrolladores ejecutar un MoE de 30B en local para pruebas de agentes de código sin depender de la nube.
- Reducción de costes en infraestructura cloud: al ocupar 3,65 veces menos memoria que bf16, se puede alojar en GPUs más pequeñas y baratas (por ejemplo, A10G o L4), reduciendo el coste por instancia en producción.
- Ampliación de la KV cache: la memoria liberada por la cuantización puede destinarse a aumentar la longitud de la KV cache, permitiendo manejar contextos más largos o mayor concurrencia por GPU.
- Inferencia por lotes en entornos con restricciones de memoria: si el objetivo es procesar grandes volúmenes de peticiones sin priorizar la latencia individual, este formato permite empaquetar más requests en la misma VRAM.
- Evaluación de calidad en pipelines de CI/CD: para validar la generación de código en pruebas automatizadas (por ejemplo, HumanEval) donde el throughput no es crítico, este modelo ofrece una calidad equivalente a bf16 con un 73% menos de requisitos de memoria.
- Fine-tuning con PEFT/LoRA en hardware limitado: al ocupar menos espacio, los pesos base pueden cargarse junto con adaptadores LoRA en GPUs con poca VRAM, facilitando la personalización del modelo para dominios específicos.

## Benchmarks y rendimiento

Resultados de HumanEval pass@1 medidos por el autor con vLLM y `lm-eval` (150 preguntas, single B200):

| Modelo | Tamaño | HumanEval pass@1 | stderr |
|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (bf16) | 61,1 GB | 0,9267 | 0,0214 |
| **ThakiCloud/Qwen3-Coder-30B-A3B-W4A16** | **16,69 GB** | **0,9400** | 0,0195 |
| FP8 (mismo base) | ~29-31 GB | 0,9400 | — |

El autor indica que la diferencia entre 0,9400 y 0,9267 no es una mejora real, ya que el error estándar es de aproximadamente 2 puntos; se interpreta como ausencia de pérdida detectable. En cuanto a throughput, las mediciones muestran que W4A16 es consistentemente más lento que FP8. En una B200 (input 1746 / output 256, vLLM 0.27.1):

| Concurrencia | FP8 | W4A16 | NVFP4 |
|---|---|---|---|
| 1 | 257,6 tok/s | 215,9 tok/s | 303,3 tok/s |
| 128 | 8130,3 tok/s | 5427,7 tok/s | 9941,8 tok/s |
| 512 | 6302,0 tok/s | 4103,3 tok/s | 6925,4 tok/s |

En una H200 NVL, W4A16 también pierde frente a FP8 (por ejemplo, a concurrencia 128: 4648,3 tok/s frente a 5596,7 tok/s). La calidad en Hopper se mantiene (HumanEval 0,9390 y 0,9451 en dos ejecuciones, frente a 0,9146 y 0,9207 de FP8).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 16,69 GB. Con overhead de runtime y KV cache, se recomienda al menos 24 GB de VRAM para un uso cómodo. En GPUs de 16 GB (por ejemplo, RTX 4080 o A100 40GB) podría caber con una KV cache reducida.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. En Hopper (H100, H200) funciona correctamente, aunque pierde en throughput frente a FP8 (ratio 0,81x-0,84x). En Blackwell (B200) también pierde frente a FP8 y NVFP4, pero es el formato más pequeño disponible.
- Opciones de despliegue: vLLM (usado en las pruebas del autor), TGI, y potencialmente llama.cpp si se convierte a GGUF, aunque el formato nativo es safetensors.
- Latencia y throughput: en B200 a concurrencia 1 se obtienen 215,9 tok/s; a concurrencia 128, 5427,7 tok/s. En H200 a concurrencia 128, 4648,3 tok/s. La latencia p99 a concurrencia 50 en B200 es de 475 ms, frente a 322 ms de FP8.

## Comparativa con modelos similares

| Modelo | Tamaño | HumanEval pass@1 | Throughput (B200, conc. 128) | Licencia |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (bf16) | 61,1 GB | 0,9267 | no disponible | Apache 2.0 |
| **ThakiCloud/Qwen3-Coder-30B-A3B-W4A16** | **16,69 GB** | **0,9400** | 5427,7 tok/s | Apache 2.0 |
| ThakiCloud/Qwen3-Coder-30B-A3B-NVFP4 | 18,11 GB | no disponible | 9941,8 tok/s | Apache 2.0 |
| FP8 (mismo base) | ~29-31 GB | 0,9400 | 8130,3 tok/s | Apache 2.0 |

La comparativa directa con el modelo base bf16 muestra una compresión de 3,65x sin pérdida de calidad en HumanEval. Frente a NVFP4, este modelo es más pequeño (16,69 GB frente a 18,11 GB) y funciona en Hopper, donde NVFP4 no tiene tensor cores nativos y cae a emulación Marlin. Sin embargo, NVFP4 es entre 1,40x y 1,83x más rápido en Blackwell.

## Limitaciones y advertencias

- No es un modelo para maximizar velocidad: la cuantización W4A16 es una estrategia de memoria, no de rendimiento. Pierde frente a FP8 en todas las concurrencias medidas, tanto en Hopper como en Blackwell.
- En GPUs Blackwell, NVFP4 es claramente superior en throughput (1,40x-1,83x) con un coste de solo 1,42 GB adicionales. Si el hardware objetivo es Blackwell y se busca velocidad, este checkpoint no es la opción óptima.
- La dequantización en tiempo de computación es una limitación estructural del formato W4A16, no un problema de tuning del checkpoint.
- No se especifican la longitud de contexto ni los idiomas soportados en la ficha; se heredan del modelo base, pero no se pueden confirmar con los datos proporcionados.
- El autor advierte que la diferencia en HumanEval frente a bf16 está dentro del error estadístico; no debe interpretarse como una mejora real.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-Coder para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-W4A16
- Hermano podado (Prune3): https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-Prune3-W4A16
- Hermano NVFP4: https://huggingface.co/ThakiCloud/Qwen3-Coder-30B-A3B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
