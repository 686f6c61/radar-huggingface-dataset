# wileewang/longlive-stepdistill-blocksize-loras

## Resumen

Este repositorio contiene un conjunto de LoRAs de destilación de pasos (step distillation) diseñados para acelerar la generación de video con el modelo base Wan-AI/Wan2.2-TI2V-5B, reduciendo el número de pasos de muestreo de 50 a 4. El autor, wileewang, publica dos familias de adaptadores: la familia A (actual, agosto de 2026) monta LoRA únicamente en las capas de self-attention y FFN, excluyendo deliberadamente la cross-attention, y emplea un desplazamiento de timestep de 10 con rollout autoregresivo. La familia B (junio de 2026) es una ablación que monta las 300 capas lineales con timestep_shift 5 y varía el tamaño de bloque y el rollout.

La relevancia de este trabajo radica en que permite ejecutar el modelo Wan2.2-TI2V-5B con una fracción del coste computacional original, manteniendo una calidad perceptual cercana a la referencia de 50 pasos. Los LoRAs están disponibles en formato PEFT (`.pt`) y requieren una configuración de inferencia específica para evitar fallos silenciosos. El repositorio incluye métricas detalladas de calidad (DreamSim, discontinuidad de costuras, deriva temporal) que comparan las distintas variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Wan2.2-TI2V-5B (modelo base de generación de video, arquitectura interna no especificada en la información disponible) |
| Parametros totales | 228,065,280 por LoRA (familia A); familia B con 300 capas (parámetros no desglosados); repo total 16.5 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generación de video, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base es de generación de video, no de texto) |
| Licencia | other |
| Formato de pesos | `.pt` (PEFT, claves tipo `base_model.model.blocks.0.self_attn.q.lora_A.weight`) |

## Arquitectura y entrenamiento

Los LoRAs se entrenan mediante destilación de pasos a partir del modelo base Wan2.2-TI2V-5B, que genera video en 50 pasos. El objetivo es que el estudiante produzca resultados equivalentes en solo 4 pasos. La familia A monta LoRA en 180 capas (self-attention + FFN), con rango y alpha de 128, dropout 0.0, 2000 pasos de entrenamiento y semilla 1. Se utiliza un `timestep_shift` de 10 y un rollout autoregresivo con bloques de 8 o 4 latentes (`num_frame_per_block`). La familia B, por el contrario, monta las 300 capas lineales (self + cross + FFN) con `timestep_shift` 5, variando el tamaño de bloque (8, 16, 24) y si el estudiante realiza rollout autoregresivo o un solo pase bidireccional.

El autor destaca que la elección de excluir cross-attention no es un compromiso por tamaño: los experimentos muestran que montar solo self-attention + FFN obtiene una distancia DreamSim de 0.2437 frente al objetivo de 50 pasos, mejor que montar todas las capas (0.2546) con un 29% menos de parámetros. La comparación entre bloques de 8 y 4 revela un equilibrio: el bloque 4 produce costuras más suaves (menor discontinuidad) pero introduce más costuras (5 frente a 2) y acumula mayor deriva temporal; el bloque 8 mantiene mejor la coherencia global del clip.

## Capacidades

- Aceleración de generación de video: reduce de 50 a 4 pasos de muestreo, manteniendo calidad perceptual cercana al original.
- Generación de video de 93 fotogramas a partir de 24 latentes (con `image_or_video_shape [1, 24, 48, 44, 80]`).
- Soporte de rollout autoregresivo con bloques configurables (4 u 8 latentes por bloque en la familia A).
- Compatible con el pipeline de inferencia de Wan2.2-TI2V-5B, incluyendo `multi_shot_rope_offset` y `sink_size`.
- No se reportan capacidades de tool calling, razonamiento multimodal ni procesamiento de texto; el modelo es exclusivamente para generación de video.

## Casos de uso

- Generación de video en tiempo real o casi tiempo real: al reducir los pasos de 50 a 4, la latencia de inferencia disminuye drásticamente, permitiendo aplicaciones interactivas como avatares virtuales o previsualización en directo.
- Prototipado rápido de contenido audiovisual: los creadores pueden generar múltiples variantes de un clip en minutos en lugar de horas, acelerando el proceso de iteración en producción.
- Despliegue en hardware limitado: con menos pasos de denoising, el coste de cómputo por clip se reduce, lo que facilita ejecutar el modelo en GPUs de gama media o entornos con presupuesto de VRAM ajustado.
- Investigación en destilación de modelos de difusión: el repositorio sirve como referencia para estudiar el efecto del tamaño de bloque, el rollout autoregresivo y la selección de capas en la calidad final.
- Integración en pipelines de postproducción: los LoRAs pueden combinarse con herramientas de edición de video que requieran generación condicionada a texto o imagen, manteniendo coherencia temporal.
- Evaluación comparativa de calidad perceptual: las métricas DreamSim y de discontinuidad de costuras proporcionan un marco para comparar configuraciones de destilación en generación de video.

## Benchmarks y rendimiento

El autor proporciona métricas de calidad perceptual (DreamSim, distancia al objetivo de 50 pasos) y de coherencia temporal, comparando diferentes configuraciones de montaje y tamaño de bloque. No se incluyen benchmarks estándar como MMLU o HumanEval, dado que el modelo es de generación de video.

| Montaje de LoRA | Parámetros | Distancia DreamSim al objetivo de 50 pasos |
|---|---|---|
| self + ffn | 228,065,280 | 0.2437 |
| todo (self+cross+ffn) | 322,437,120 | 0.2546 |
| cross + ffn | 228,065,280 | 0.2567 |
| ffn solo | 133,693,440 | 0.2648 |
| self + cross (sin ffn) | 188,743,680 | 0.2706 |

| Métrica | Block 8 | Block 4 | Ganador | p |
|---|---|---|---|---|
| Discontinuidad en costuras (fotogramas 28, 60) | 0.0105 | 0.0053 | block 4, 10:0 | 0.002 |
| Deriva del primer al último fotograma | 0.124 | 0.164 | block 8, 9:1 | 0.021 |
| Distancia media entre fotogramas del clip | 0.0066 | 0.0051 | block 4, 3:7 | 0.344 |
| Movimiento de píxeles | 4.08 | 3.25 | — | 0.109 |

Los tiempos de inferencia son prácticamente idénticos: 16m23s (block 8) frente a 16m55s (block 4) para 10 clips.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible. Dado que el modelo base Wan2.2-TI2V-5B tiene 5 mil millones de parámetros (según el nombre), se estima que la inferencia requiere al menos 10-12 GB de VRAM en FP16, y más si se usa precisión completa. Esta es una estimación, no un dato confirmado.
- No se mencionan GPUs concretas recomendadas. Para modelos de 5B, una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) serían adecuadas, pero no hay confirmación.
- No se indica si cabe en GPUs de consumo; la carga de LoRA añade ~228M parámetros, lo que incrementa ligeramente el uso de memoria.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp ni Ollama; el formato `.pt` y la librería `wan2.2` sugieren un pipeline de inferencia propio basado en PyTorch.
- Latencia y throughput: los tiempos reportados (16-17 minutos para 10 clips de 93 fotogramas) equivalen a ~100 segundos por clip, pero dependen del hardware y no se detallan las especificaciones de la máquina utilizada.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de destilación para Wan2.2-TI2V-5B ni sobre modelos alternativos comparables en la información proporcionada. La comparativa queda limitada a las variantes internas del repositorio (block 8 vs block 4, distintos montajes de capas).

## Limitaciones y advertencias

- Los LoRAs son específicos del modelo base Wan2.2-TI2V-5B y no funcionan con otros modelos de generación de video.
- La carga incorrecta de los pesos puede producir resultados silenciosamente incorrectos: si se montan las 300 capas en lugar de las 180 esperadas, PEFT descarta las claves no coincidentes sin error y se renderiza el modelo base sin adaptar a 4 pasos, lo que da un resultado de mala calidad sin aviso.
- Es obligatorio usar `timestep_shift: 10.0` para la familia A (no 5.0) y `num_frame_per_block` coincidente con el archivo (8 u 4). Un desajuste coloca los pasos de denoising en puntos del esquema de ruido distintos a los entrenados.
- La licencia es "other", lo que implica restricciones desconocidas; se recomienda revisar la licencia del modelo base Wan2.2-TI2V-5B antes de uso comercial.
- No se reportan sesgos ni riesgos de alucinación, pero al ser generación de video, pueden aparecer artefactos visuales o incoherencias temporales, especialmente con bloques de tamaño 4 (más costuras).
- El bloque 4 produce menos movimiento (3.25 frente a 4.08), lo que puede interpretarse como "más suave" pero en realidad implica menor dinamismo en el clip.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wileewang/longlive-stepdistill-blocksize-loras
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B (referenciado en la model card, sin URL directa confirmada)
