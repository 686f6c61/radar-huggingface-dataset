# TensorFold/Hy4-flash-MLX-8bit-MTP

## Resumen

Hy4-flash-MLX-8bit-MTP es una conversión a formato MLX del modelo multimodal Tencent Hy4-flash, preparada por TensorFold para su ejecución en Apple Silicon. El modelo original, desarrollado por Tencent, es un mixture-of-experts (MoE) multimodal con 220.251.201.958 parámetros totales y aproximadamente 12.000 millones de parámetros activos por token, orientado a tareas image-text-to-text. Esta conversión cuantiza los pesos a 8 bits en formato afín MLX y empaqueta junto a los pesos objetivo el drafter DFly2 de decodificación especulativa que el modelo upstream incluye.

La relevancia de esta ficha es doble. Por un lado, documenta un checkpoint de 239,3 GB que, según la propia model card, todavía no cuenta con soporte en el runtime de TensorFold (versión 1.2.9), por lo que no es directamente ejecutable. Por otro, permite evaluar el estado del ecosistema de cuantización para Apple Silicon aplicado a modelos MoE multimodales de gran tamaño, un segmento donde las opciones de despliegue local siguen siendo limitadas.

La información disponible es escasa: la model card se autodeclara borrador, no publica benchmarks, no especifica la longitud de contexto, los idiomas soportados ni los tipos de cuantización más allá del 8-bit afín, y no incluye mediciones de rendimiento en Apple Silicon. Esta ficha refleja únicamente los datos verificables aportados por el autor y la información de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal; stack de lenguaje con sliding-window attention, sparse attention y Engram embeddings; incluye torre de visión y drafter DFly2 de 5 capas |
| Parametros totales | 220.251.201.958 (220,25 B) |
| Parametros activos | Aproximadamente 12 B por token (según descripción de Tencent en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit (group size 64 en la mayoría de pesos, 32 en Engram embeddings); torre de visión y gates del router MoE en precisión de origen; existe una variante companion de 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license_name: tencent-hy-license) |
| Formato de pesos | Safetensors MLX (148 shards); drafter DFly2 en precisión de origen |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal descrito por Tencent como un transformer con 220 B de parámetros totales y unos 12 B activos por token. El stack de lenguaje combina tres mecanismos: sliding-window attention, sparse attention y Engram embeddings. La conversión conserva además la torre de visión y los gates del router MoE en precisión de origen, mientras que el resto de pesos se cuantiza en MLX affine 8-bit. El drafter DFly2, con cinco capas, reutiliza la caché KV del modelo objetivo y las posiciones de la atención dispersa, y se empaqueta junto a los pesos objetivo para habilitar decodificación especulativa.

Sobre el entrenamiento no hay información en la documentación proporcionada: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. La conversión de TensorFold parte del checkpoint BF16 fijado por Tencent y conserva tokenizer, processor, chat template y configuración de DFly2. La validación realizada cubre la integridad de los tensores: los 148 shards coinciden con el índice de tensores, muestras de pesos empaquetados coinciden con la cuantización afín MLX y los 87 tensores de DFly2 coinciden byte a byte con los del upstream. La paridad de generación entre el modo con drafter y el modo plano está pendiente de soporte en el runtime.

## Capacidades

- Generación de texto conversacional en pipeline image-text-to-text.
- Procesamiento de imágenes junto con texto (modelo vision-language), con torre de visión incluida en la conversión.
- Razonamiento multi-step y modo agente: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la documentación proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas de Hugging Face figura como no disponible.
- Decodificación especulativa mediante el drafter DFly2 empaquetado (5 capas, reutiliza caché KV y posiciones de atención dispersa del objetivo).
- Capacidades de audio: no disponibles.

## Casos de uso

- Evaluación de cuantización MLX en Apple Silicon: el checkpoint sirve para medir la viabilidad de ejecutar un MoE multimodal de 220 B en hardware Apple, comparando la variante 8-bit con la companion de 4-bit del mismo autor y revisión upstream.
- Investigación sobre decodificación especulativa: el empaquetado de DFly2 con los pesos objetivo permite estudiar la ganancia de velocidad del drafter frente a la generación plana, una vez exista soporte de runtime.
- Desarrollo de tooling de conversión: el repositorio documenta el proceso de conversión (group sizes, shards, validación de tensores) y puede servir como referencia para portar otros modelos MoE multimodales a MLX.
- Prototipado de asistentes multimodales en local: para equipos con estaciones Apple Silicon que quieran experimentar con un modelo image-text-to-text de gran escala sin depender de la nube, sujeto a la disponibilidad futura del backend `hy_v4_flash`.
- Benchmarking de memoria: el tamaño verificado de 239,3 GB de payload permite planificar requisitos de memoria unificada y configuraciones de caché para distintos niveles de hardware Apple.
- Validación de licencias y cumplimiento: útil para equipos que necesiten evaluar las implicaciones de la Tencent Hy License antes de adoptar el modelo upstream en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la velocidad de decodificación y la memoria pico están pendientes de medición en Apple Silicon, y que la paridad entre generación con drafter y generación plana está pendiente de soporte en el runtime.

## Requisitos de hardware

- VRAM/memoria unificada: el payload verificado de pesos es de 239,3 GB. La memoria en runtime depende además de la longitud de contexto, la configuración de caché y las peticiones concurrentes; no se ha medido ningún nivel de memoria Apple Silicon para esta conversión.
- GPU recomendadas: no disponible. El formato MLX está orientado a Apple Silicon; no se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU consumer? No hay datos. Por el tamaño del checkpoint, excede la memoria de cualquier GPU consumer convencional; en Apple Silicon requeriría configuraciones de memoria unificada muy alta, sin mediciones publicadas.
- Opciones de despliegue: runtime TensorFold (la versión 1.2.9 rechaza este checkpoint al arrancar por falta de backend `hy_v4_flash`). DFly2 depende además del índice de atención dispersa y de la caché KV del objetivo. No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; pendientes de medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| TensorFold/Hy4-flash-MLX-8bit-MTP | 220,25 B | ~12 B | no disponible | MLX 8-bit Safetensors | Tencent Hy License | Conversión verificada, runtime pendiente |
| TensorFold/Hy4-flash-MLX-4bit-MTP | no disponible (misma revisión upstream) | ~12 B | no disponible | MLX 4-bit Safetensors | Tencent Hy License | Conversión companion del mismo autor |
| tencent/Hy4-flash | 220 B | ~12 B | no disponible | BF16 (upstream) | Tencent Hy License | Modelo original |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es ejecutable con la versión actual del runtime TensorFold (1.2.9), que lo rechaza al arrancar por falta de backend `hy_v4_flash`.
- La model card se autodeclara borrador: las instrucciones de descarga y uso, así como el rendimiento en Apple Silicon, están pendientes de validación.
- La paridad de generación entre el modo con drafter DFly2 y el modo plano no se ha verificado.
- No se han publicado benchmarks, mediciones de latencia, throughput ni memoria pico.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que impide evaluar su idoneidad para casos multilingües o de contexto largo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, sin evaluación publicada en esta conversión.
- Licencia: Tencent Hy License, con posibles restricciones para uso comercial; debe revisarse el texto completo antes de cualquier despliegue en producción.
- El tamaño del checkpoint (239,3 GB) limita su uso a entornos con memoria unificada muy elevada; no hay niveles de memoria Apple Silicon medidos.

## Enlaces

- Hugging Face (conversión 8-bit): https://huggingface.co/TensorFold/Hy4-flash-MLX-8bit-MTP
- Conversión companion 4-bit: https://huggingface.co/TensorFold/Hy4-flash-MLX-4bit-MTP
- Modelo base upstream: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
