# tacodevs/Wicked-Stuff-31B-Final-NVFP4-GPTQ-Max

## Resumen

Wicked-Stuff-31B-Final-NVFP4-GPTQ-Max es una cuantizacion de precision mixta del modelo ReadyArt/Wicked-Stuff-31B-Final, publicada por el usuario tacodevs. Aplica GPTQ con esquema NVFP4 (pesos y activaciones en FP4 con grupo de 16) sobre las capas `Linear` de texto, manteniendo en BF16 las torres de vision, audio, embeddings y `lm_head`. El resultado es un checkpoint de aproximadamente 20,5 GB que conserva las capacidades multimodales del original mientras reduce drasticamente el coste de memoria en las capas densas.

El modelo base se etiqueta como `gemma4` y esta orientado a roleplay y conversacion multi-turno. Aunque el nombre comercial habla de "31B", el recuento real de parametros en los safetensors es de 18.460.143.972 (unos 18,5 mil millones), dato que conviene tener presente al planificar el despliegue. La calibracion del GPTQ se ha hecho especificamente con 256 muestras de hasta 8192 tokens de roleplay multi-turno, lo que sesga la cuantizacion hacia ese dominio.

Su relevancia actual es doble: por un lado, demuestra la viabilidad de NVFP4 (formato de 4 bits nativo de las GPU Blackwell) en un modelo multimodal con perdida de calidad moderada; por otro, ofrece una alternativa lista para vLLM con solo 90,2% de acuerdo top-1 frente al BF16, un dato que el autor publica de forma transparente junto a la comparativa con FP8-Dynamic y con una cuantizacion NVFP4 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiquetado `gemma4`), capas `Linear` de texto cuantizadas; vision, audio, embeddings y `lm_head` en BF16 |
| Parametros totales | 18.460.143.972 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la calibracion usa muestras de hasta 8192 tokens, no implica limite del modelo) |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) con GPTQ en capas de texto; BF16 en vision, audio, embeddings y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento desde cero. Se parte de ReadyArt/Wicked-Stuff-31B-Final (etiquetado `gemma4`, multimodal por la presencia de torres de vision y audio) y se aplica `GPTQModifier(scheme="NVFP4")` de llm-compressor 0.13. Esto produce pesos y activaciones en FP4 con granularidad de grupo 16 en todas las capas `Linear` de texto, mientras que las torres de vision, audio, embeddings y `lm_head` permanecen en BF16 para preservar la fidelidad en las partes mas sensibles.

El conjunto de calibracion son 256 muestras de hasta 8192 tokens compuestas por conversaciones multi-turno de roleplay (prompt mas respuesta). Esta eleccion es deliberada: el autor busca minimizar el drift en el dominio objetivo del modelo base. El resultado es un checkpoint de 20,5 GB que puede servirse con vLLM 0.27.1 usando KV cache en FP8, segun indica la model card. No se documentan datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y roleplay multi-turno, dominio para el que fue calibrada la cuantizacion.
- Capacidades multimodales heredadas del base: presencia de torres de vision y audio en BF16, aunque la model card no detalla tareas concretas.
- Razonamiento y generacion de codigo: no disponible de forma explicita en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking: no disponible.

## Casos de uso

- Roleplay y personajes conversacionales: es el caso de uso principal del modelo base y el dominio de calibracion; el modelo puede mantener conversaciones multi-turno con contexto largo, y la cuantizacion NVFP4 reduce el coste de memoria sin degradar gravemente la coherencia (90,2% de acuerdo top-1 con BF16 en el conjunto de evaluacion del autor).
- Despliegue en GPU Blackwell con vLLM: el formato NVFP4 esta pensado para acelerar inferencia en hardware Blackwell; usar vLLM 0.27.1 con KV cache en FP8 permite servir el modelo con mayor throughput que un BF16 equivalente.
- Chat multimodal experimental: al conservar vision y audio en BF16, el checkpoint puede emplearse en aplicaciones que combinen imagen o audio con dialogo, aunque la model card no detalla el rendimiento en esas tareas.
- Prototipado de asistentes con presupuesto de VRAM ajustado: con ~20,5 GB de pesos, cabe en GPUs de 24 GB (RTX 4090, L4) en configuraciones controladas, lo que facilita iteracion local.
- Investigacion sobre cuantizacion NVFP4: el autor publica metricas de drift (top-1 agreement, KL aproximada) frente a BF16, FP8-Dynamic y otra cuantizacion NVFP4 de referencia, lo que lo convierte en un punto de comparacion util para estudiar el impacto de GPTQ en FP4.
- Fine-tuning o adaptadores sobre la version cuantizada: no recomendado de forma general, pero posible en flujos que acepten compressed-tensors; util para experimentar con LoRA sobre un backbone de bajo coste.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de drift frente al BF16, medidas sobre 50 chats reservados (23,7k tokens de respuesta) servidos con vLLM 0.27.1 y KV cache en FP8:

| Build | Top-1 agreement | KL aproximada |
|---|---|---|
| Este build (NVFP4, GPTQ, calibracion roleplay) | 90,2% | 0,061 |
| NVFP4 publico (calibracion Gryphe, RTN) | 87,7% | 0,102 |
| FP8-Dynamic | 94,9% | 0,016 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~20,5 GB; con overhead de activaciones y KV cache en FP8, se recomienda al menos 24 GB para contexto corto y 40-48 GB para contextos largos.
- GPU recomendadas: Blackwell (B200, RTX 5090) para aprovechar NVFP4 de forma nativa; en Hopper (H100, H200) y Ada (L40S, RTX 4090) el formato puede requerir emulacion o no estar soportado por el kernel, lo que degrada el rendimiento.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con contexto moderado; en GPUs de 16 GB no cabe sin cuantizacion adicional.
- Opciones de despliegue: vLLM 0.27.1 es el runtime validado por el autor; llama.cpp y Ollama no estan confirmados para NVFP4; TGI no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wicked-Stuff-31B-Final-NVFP4-GPTQ-Max (este) | 18,46B | no disponible | NVFP4 W4A4 GPTQ | apache-2.0 | Hugging Face (0 descargas) |
| Wicked-Stuff-31B-Final (base) | no disponible | no disponible | BF16 | no disponible | Hugging Face |
| NVFP4 publico (calibracion Gryphe, RTN) | no disponible | no disponible | NVFP4 RTN | no disponible | no disponible |
| FP8-Dynamic (referencia del autor) | no disponible | no disponible | FP8 | no disponible | no disponible |

La comparativa se limita a las variantes citadas en la model card; no se dispone de datos de modelos alternativos de la misma categoria (roleplay multimodal ~18-30B) en la informacion proporcionada.

## Limitaciones y advertencias

- El nombre comercial "31B" no coincide con el recuento real de parametros (18,46B); conviene verificar antes de dimensionar infraestructura.
- La cuantizacion NVFP4 introduce drift medible: 90,2% de acuerdo top-1 y KL ~0,061 frente a BF16, con degradacion esperable en generaciones largas o fuera del dominio de calibracion (roleplay multi-turno).
- La calibracion esta sesgada a roleplay; el rendimiento en codigo, matematicas o tareas tecnicas puede ser peor de lo que sugiere la metrica global.
- El modelo base esta orientado a roleplay y puede producir contenido no apto para todos los publicos; no se documentan filtros de seguridad.
- No se listan idiomas soportados; el soporte multilingue es incierto.
- Licencia apache-2.0 declarada, pero el modelo base no publica su licencia en la informacion disponible; verificar compatibilidad antes de uso comercial.
- NVFP4 requiere soporte de hardware y runtime; en GPUs no Blackwell el rendimiento puede degradarse o no estar soportado.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tacodevs/Wicked-Stuff-31B-Final-NVFP4-GPTQ-Max
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
