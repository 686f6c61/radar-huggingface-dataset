# yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep2

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face. El modelo se ha reentrenado como "modelo de memoria" (memory model) sobre pares sintéticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue, con un método de agrupamiento denominado `hdb_and_entity` que combina HDBSCAN (con tamaño mínimo de clúster 2) y agrupamiento por entidades (con frecuencia documental máxima de 3). El checkpoint publicado corresponde a la época 2 de un total de 3 épocas de entrenamiento.

El modelo conserva la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parámetros totales, y se distribuye en formato safetensors bf16, cargable directamente con `transformers` mediante `AutoModelForCausalLM.from_pretrained`. La licencia es Apache 2.0, heredada del modelo base. Su relevancia radica en que ejemplifica una técnica de especialización para tareas de memoria y recuperación de contexto multi-documento, aunque su adopción práctica es limitada por la ausencia de benchmarks publicados y de documentación sobre idiomas soportados.

El conjunto de entrenamiento consta de 2.177.125 ejemplos sintéticos derivados de un subconjunto de 1.000 muestras de MuSiQue, con una única época de muestreo configurada en la generación de datos. El modelo está pensado para generación de texto conversacional con la plantilla de chat de Qwen, y su nombre sugiere un uso experimental dentro de una línea de investigación sobre modelos de memoria más que un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 8.096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, heredado de Qwen2.5-14B-Instruct, sin modificaciones estructurales conocidas. El ajuste fino fue completo (no LoRA ni adaptadores): los 14.770.033.664 parámetros (100,00 %) fueron entrenables mediante FSDP, con precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. La longitud máxima de secuencia durante el entrenamiento fue de 8.096 tokens.

Los hiperparámetros documentados son: batch efectivo de 256 (32 por dispositivo, sin acumulación, 8 GPUs), learning rate de 2e-05 con scheduler constante y warmup del 5 %, weight decay de 0,01, max grad norm de 1,0 y 3 épocas totales (el checkpoint publicado es la época 2). El entrenamiento se ejecutó sobre 8 aceleradores AMD Instinct MI325X y requirió 9,18 horas de reloj para las 3 épocas (73,5 GPU-horas). Los datos de entrenamiento son 2.177.125 ejemplos sintéticos de QA generados a partir de MuSiQue con el pipeline de agrupamiento `hdb_and_entity` (HDBSCAN con min cluster size 2 + agrupamiento por entidades con max df 3, combinación cross-doc v3). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Entrenado específicamente como modelo de memoria sobre pares QA multi-documento sintéticos, orientado a tareas de recuperación y agregación de información entre documentos.
- Razonamiento multi-paso sobre contextos que combinan información de varias fuentes, derivado del formato MuSiQue.
- Capacidades heredadas del modelo base Qwen2.5-14B-Instruct (código, matemáticas, multilingüismo, tool calling), aunque no se documenta su preservación tras el ajuste fino.
- Soporte de tool calling y function calling: no documentado en la información proporcionada para este checkpoint.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre modelos de memoria: el modelo sirve como punto de comparación en experimentos que evalúan si un ajuste fino supervisado sobre QA sintético multi-documento mejora la capacidad de agregar información dispersa en varios documentos.
- Evaluación de pipelines de datos sintéticos: permite medir el impacto del método de agrupamiento `hdb_and_entity` frente a alternativas de clustering en la calidad de las respuestas generadas.
- Reproducción de experimentos académicos: al estar publicados los hiperparámetros completos (batch, LR, épocas, hardware), facilita la replicación del entrenamiento con FSDP sobre 8 GPUs.
- Estudio de olvido catastrófico: al ser un full fine-tuning sobre un dominio estrecho, es útil para analizar cuánto se degradan las capacidades generales del modelo base tras la especialización.
- Generación de respuestas multi-documento en prototipos: para tareas de pregunta-respuesta donde la respuesta requiere combinar entidades de varios documentos, con la cautela de que no hay benchmarks publicados.
- Base para ajustes posteriores: al conservar la licencia Apache 2.0 y el formato safetensors estándar, puede reutilizarse como punto de partida en experimentos de especialización adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, más KV cache y activaciones; en la práctica se recomienda al menos 40-48 GB para secuencias largas.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB para pesos; en 4 bits, alrededor de 8-9 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI300X/MI325X para bf16 sin cuantizar; en consumer, RTX 4090 (24 GB) solo con cuantización de 8 o 4 bits y contextos moderados.
- Cabe en consumer GPU únicamente con cuantización agresiva; no cabe en bf16 en GPUs de 24 GB.
- Opciones de despliegue: `transformers` (soporte confirmado por el autor), text-generation-inference (tag `text-generation-inference` en el repo), y previsiblemente vLLM, llama.cpp u Ollama tras conversión a GGUF, aunque esto no está documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep2 | 14,77 B | no disponible | Memoria / QA multi-documento (MuSiQue) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (según documentación del modelo base) | Instrucciones generales | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (según documentación del modelo base) | Instrucciones generales | Apache 2.0 | Hugging Face, ampliamente adoptado |

La comparación directa con el modelo base es la más relevante: este checkpoint parte de Qwen2.5-14B-Instruct y lo especializa en un dominio estrecho, por lo que la comparación de rendimiento general requeriría benchmarks que no se han publicado. No se dispone de datos para comparar con otros modelos de memoria de la misma categoría.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; se desconoce el rendimiento real en tareas de memoria o en capacidades generales.
- El ajuste fino completo sobre un corpus sintético estrecho puede provocar olvido catastrófico de las capacidades originales del modelo base (código, matemáticas, multilingüismo, tool calling).
- Los datos de entrenamiento son sintéticos y derivados de un subconjunto de solo 1.000 muestras de MuSiQue; el riesgo de sobreajuste a los patrones de generación del pipeline es alto.
- No se documentan los idiomas soportados; no hay garantía de comportamiento correcto en castellano.
- No se documenta el riesgo de sesgos del corpus sintético ni del modelo base.
- Riesgo de alucinación inherente a los modelos de 14 B y potencialmente agravado por la especialización en QA sintético.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Es un checkpoint intermedio (época 2 de 3), no el modelo final del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Conjunto de datos MuSiQue (referencia del corpus de origen): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
