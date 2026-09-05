# youngseok12/AX-3.1-Light-specialist-132-ties-answerfirst

## Resumen
El modelo `AX-3.1-Light-specialist-132-ties-answerfirst` es un modelo de lenguaje coreano de 7.26 mil millones de parámetros, desarrollado por `youngseok12` a partir del modelo base `skt/A.X-3.1-Light`. Es un experimento de *model merging* que combina tres adaptadores LoRA especialistas (K, R, C) de 132 filas mediante la técnica TIES, y posteriormente aplica un ajuste fino adicional para forzar un formato de salida "answer-first" (respuesta primero, seguida de una justificación breve). El objetivo es mejorar el rendimiento en benchmarks coreanos como KMMLU-Pro, MuSR y Com2-main, y garantizar respuestas concisas y estructuradas.

Su relevancia reside en servir como caso de estudio de técnicas de merging de LoRA y corrección de formato en modelos de tamaño medio. Está disponible bajo licencia Apache 2.0, con pesos completos en BF16 y en formato `safetensors`, sin necesidad de adaptadores externos. El modelo está pensado para investigación y evaluación, y no se recomienda como única fuente para decisiones de alto riesgo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura tipo LLaMA) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos completos en safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `skt/A.X-3.1-Light`, un modelo coreano de 7.26B parámetros. El proceso de entrenamiento consta de dos etapas. Primero, se entrenan tres LoRA especialistas (K, R, C) de 132 filas cada uno sobre las tareas KMMLU-Pro, MuSR y Com2-main respectivamente, y se combinan mediante TIES con densidad 0.5. En la segunda etapa, se añade un LoRA adicional entrenado con el dataset `format_sft_answer_first_v1.jsonl` (5.801 filas procedentes de AI Hub) bajo las condiciones rank16, alpha32, learning rate 5e-5 con scheduler cosine y una época. El resultado es un modelo fusionado en BF16 con pesos completos, sin adaptadores separados.

El formato de salida esperado es `정답: X (근거: <한 문장>)` (Respuesta: X (Justificación: <una frase>)). No se proporcionan detalles sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades
- Generación de texto y seguimiento de instrucciones en coreano.
- Respuestas en formato "answer-first": la respuesta se coloca al principio seguida de una justificación breve.
- Especialización en benchmarks coreanos concretos: KMMLU-Pro (conocimiento), MuSR (razonamiento multi-turno) y Com2-main (comprensión de texto).
- Formato de salida compacto y estructurado, útil para sistemas que requieren extracción automática de respuestas.
- No se documentan capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso
- Investigación en técnicas de *model merging*: permite estudiar cómo la combinación de LoRA con TIES afecta al rendimiento en tareas especializadas.
- Evaluación de modelos coreanos: puede usarse como referencia en suites de benchmarks como KMMLU-Pro o Com2-main para comparar el efecto del ajuste.
- Generación de respuestas concisas en asistentes de preguntas y respuestas en coreano: el formato "answer-first" facilita la extracción automática de la respuesta.
- Experimentos de corrección de formato: sirve para analizar cómo un segundo LoRA puede modificar el estilo de salida de un modelo ya ajustado.
- Prototipos de sistemas de razonamiento en coreano: gracias a su entrenamiento en MuSR, puede abordar tareas de razonamiento sobre textos narrativos.
- Docencia y análisis de modelos open source: su licencia Apache 2.0 permite su uso en entornos educativos para ilustrar pipelines de fine-tuning y merging.

## Benchmarks y rendimiento
El autor presenta una evaluación local (n=100 por eje) en una suite canónica, con la métrica A_acc, comparando el modelo base, la etapa 1 (solo merge de especialistas) y el modelo final. Los resultados son los siguientes:

| Eje | Modelo base | Stage 1 (solo TIES) | Modelo final (con corrección) |
|---|---|---|---|
| click | 0.664 | 0.720 | 0.710 |
| kmmlu_pro | 0.310 | 0.370 | 0.370 |
| com2_main | 0.610 | 0.660 | 0.670 |
| snu_ko_musr | 0.476 | 0.490 | 0.510 |
| Promedio | 0.515 | 0.560 | 0.565 |

No se han publicado resultados de benchmarks externos independientes en la información disponible.

## Requisitos de hardware
- VRAM estimada: los pesos BF16 ocupan aproximadamente 14.5 GB. Con la cache de claves y valores, se recomienda un mínimo de 16 GB de VRAM para secuencias moderadas. Con cuantización a 8 bits (no incluida en el repo), podría reducirse a unos 8 GB, pero no hay archivos cuantizados disponibles.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o RTX 4090 (24 GB) para inferencia en BF16 sin problemas.
- Consumer GPU: puede ejecutarse en una RTX 3090 o RTX 4090 de 24 GB. También en GPUs de 16 GB con secuencias cortas o usando cuantización externa.
- Opciones de despliegue: compatible con `transformers` y `text-generation-inference`. También puede servirse con vLLM, llama.cpp u Ollama convirtiendo los pesos a GGUF (no incluido).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
Se comparan los modelos relacionados de la misma familia. Los datos de los modelos alternativos no están completos en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AX-3.1-Light-specialist-132-ties-answerfirst | 7.264.800.768 | No disponible | Apache 2.0 | Merge de LoRA con TIES + corrección answer-first |
| skt/A.X-3.1-Light | No disponible | No disponible | No disponible | Modelo base |
| youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e | No disponible | No disponible | Apache 2.0 | Fine-tuning para respuesta primero con selección de datos |
| youngseok12/AX-3.1-Light-sft_v3_0 | No disponible | No disponible | Apache 2.0 | Fine-tuning para respuesta primero |

No se conocen más detalles sobre estos modelos alternativos.

## Limitaciones y advertencias
- La evaluación local es limitada (n=100 por eje) y el propio autor advierte que los resultados en KMMLU-Pro no son fiables como evidencia real, ya que experimentos anteriores predijeron la dirección opuesta.
- El modelo puede generar respuestas incorrectas o alucinadas; no debe usarse como única fuente para decisiones de alto riesgo.
- Solo está entrenado para coreano; no se garantiza el rendimiento en otros idiomas.
- No hay benchmarks externos independientes que validen las afirmaciones del autor.
- La licencia Apache 2.0 permite uso comercial, pero el autor indica que es un modelo de investigación y evaluación.
- No se documentan sesgos específicos, pero al estar entrenado con datos de AI Hub puede reflejar los sesgos de esas fuentes.

## Enlaces
- HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-specialist-132-ties-answerfirst
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Modelos relacionados:
  - https://huggingface.co/youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e
  - https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0

No se han encontrado papers, blogs o demos en la información proporcionada.
