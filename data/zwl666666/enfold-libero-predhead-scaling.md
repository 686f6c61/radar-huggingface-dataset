# zwl666666/enfold-libero-predhead-scaling

## Resumen

Enfold on LIBERO — prediction-head depth scaling es un par de checkpoints de investigación publicados por el usuario zwl666666 en Hugging Face, orientados al aprendizaje de políticas robóticas visual-lingüísticas-acción (VLA) sobre el benchmark LIBERO. No se trata de un modelo de lenguaje conversacional, sino de un contenedor de entrenamiento completo (`EnfoldTrainable`) que empaqueta un experto de vídeo Cosmos-Predict2.5 2B, un estudiante vision-language DINOv3 ViT-H/16+, una cabeza de predicción de representación (TokenDiTHead) y una cabeza de acción con flow-matching. El objetivo del experimento es aislar el efecto de una única variable: la profundidad de la cabeza de predicción (`num_layers` = 6 frente a 16), manteniendo idénticos datos, semilla, batch, schedule y resto de hiperparámetros.

Ambos checkpoints corresponden al paso final (21700) de un entrenamiento de 10 épocas sobre las cuatro suites de LIBERO (`libero_spatial`, `libero_object`, `libero_goal`, `libero_10`), ejecutado en 8 GPUs con DeepSpeed ZeRO-1 y precisión mixta bf16. Cada `.pt` pesa en torno a 6,1-6,3 GB y va acompañado de un `dataset_stats.json` imprescindible para la normalización de acciones y propriocepción en evaluación.

La relevancia de esta publicación es metodológica: proporciona un control experimental limpio para estudiar cómo la profundidad de la cabeza de destilación de representaciones afecta al rendimiento de la política resultante, en un momento en el que los modelos VLA basados en destilación de features de modelos generativos de vídeo (tipo Cosmos) están ganando tracción en robótica. Los resultados de éxito en LIBERO aún no están publicados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Contenedor EnfoldTrainable: teacher Cosmos-Predict2.5 2B (DiT de difusión de vídeo) + student DINOv3 ViT-H/16+ + prediction head TokenDiTHead + action head ActionDiT (flow-matching) |
| Parámetros totales | No disponible (los pesos del checkpoint pesan 6,10 GB en la variante l6 y 6,35 GB en la l16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | `max_seq_len=4096` en la prediction head; `num_frames=33` con `action_video_freq_ratio=4` → 9 frames de vídeo por clip |
| Tipos de cuantización | No disponible (solo se distribuyen pesos en fp32/bf16 dentro del `.pt`) |
| Idiomas soportados | No disponible (el texto se inyecta como embeddings precalculados de Cosmos; no hay tokenizador de lenguaje expuesto) |
| Licencia | `other` (los pesos de terceros mantienen sus licencias: NVIDIA Open Model License para Cosmos-Predict2.5 2B y licencia DINOv3 para el estudiante) |
| Formato de pesos | `.pt` (PyTorch, checkpoint completo del contenedor entrenable); `dataset_stats.json` asociado por checkpoint |

## Arquitectura y entrenamiento

El contenedor `EnfoldTrainable` (campo `model.dit`) agrupa cuatro piezas. El `teacher_video_expert` es un DiT de difusión de vídeo Cosmos-Predict2.5 2B que, además de su función generativa, actúa como fuente de destilación: se extraen sus features intermedias de las capas `[7, 15, 23, 27]`, se concatenan y se proyectan a dimensión 8192. El `student` es un DINOv3 ViT-H/16+ con `hidden_dim=1024` y supervisión profunda en las capas `[7, 15, 23, 31]`. La `prediction_head` es un TokenDiTHead (`out_dim=8192`, `condition_dim=5120`, `ffn_dim=4096`, `num_heads=16`, `attn_head_dim=64`, `max_seq_len=4096`, RoPE 3D) que reproduce las features del teacher; su profundidad es la única variable del experimento (6 o 16 capas). La `action_head` es un ActionDiT de flow-matching con `action_dim=7` y 10 capas, inicializada desde `action_dit_cosmos_init_libero.pt`.

El entrenamiento es idéntico en ambas variantes: pérdida combinada `1.0 * loss_video + 1.0 * loss_repr + 1.0 * loss_action`, donde `loss_video` es MSE de denoising flow-matching con el frame condicional limpio, `loss_repr` es la reproducción de features del teacher por la prediction head y `loss_action` es MSE de difusión de acciones enmascarado por `action_is_pad`. Optimizador AdamW con `lr=1e-4` y cosine annealing hasta el 1 % del pico, `weight_decay=1e-2`, betas `(0.9, 0.95)`, `max_grad_norm=1.0` y bf16. Batch de 16 por GPU en 8 GPUs, sin acumulación de gradiente, ZeRO-1 (solo estados del optimizador particionados), 10 épocas hasta 21700 pasos. Los datos son las cuatro suites de LIBERO con las dos vistas de cámara concatenadas horizontalmente a `[224, 448]`, `action_chunk_len=32` y texto proveniente de una caché de embeddings de Cosmos precalculada.

Detalle importante de diseño: la prediction head **no forma parte de la política** en inferencia. `configs/sim_libero.yaml` fija `action_only_eval: true`, de modo que en rollout solo se instancian `student` y `action_head`; las claves del teacher y de la prediction head se ignoran. Por tanto, la profundidad de la cabeza influye únicamente durante el entrenamiento, modelando la representación del estudiante vía `loss_repr`.

## Capacidades

- Ejecución de políticas robóticas de manipulación sobre el benchmark LIBERO (4 suites, 40 tareas en total).
- Control de acción de 7 dimensiones con flow-matching y chunks de 32 acciones.
- Percepción visual a partir de dos vistas de cámara concatenadas a resolución 224×448.
- Condicionamiento por instrucciones en lenguaje natural mediante embeddings precalculados de Cosmos (no hay generación de lenguaje).
- Destilación de features de un modelo generativo de vídeo (Cosmos-Predict2.5 2B) hacia un estudiante ViT-H/16+.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; no es un modelo de chat.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües expuestas.
- Uso previsto exclusivamente como checkpoint de investigación para estudiar scaling de la prediction head.

## Casos de uso

- Reproducción de experimentos de scaling en VLA: cargar `predhead-l6` y `predhead-l16` con el mismo `dataset_stats.json` correspondiente y ejecutar `scripts/eval_libero.sh` para medir el efecto de la profundidad de la prediction head sobre las tasas de éxito en las 40 tareas de LIBERO.
- Estudio de destilación de features generativas: usar el par de checkpoints para analizar cómo la capacidad de la prediction head afecta a la calidad de la representación del estudiante DINOv3, comparando `loss_repr` y métricas downstream.
- Baseline para investigación en políticas de manipulación: servir como referencia controlada frente a otras arquitecturas VLA sobre LIBERO, dado que datos y receta están documentados al detalle.
- Análisis de coste/beneficio de cómputo en entrenamiento: comparar el coste adicional de 10 capas extra en la prediction head (6,10 GB frente a 6,35 GB de checkpoint) con la mejora, si la hay, en éxito de tarea.
- Punto de partida para fine-tuning en dominios robóticos propios: reutilizar `student` + `action_head` (que son los módulos que se ejecutan en inferencia) y reentrenar sobre un dataset distinto manteniendo el esquema de pérdidas.
- Docencia y divulgación técnica: ilustrar un pipeline completo de VLA con teacher de vídeo, estudiante ViT y cabeza de acción flow-matching, con configuración reproducible y pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las tasas de éxito en LIBERO vanilla (4 suites × 10 tareas × 50 trials = 2000 episodios, 8 GPUs con una tarea por GPU) están aún en medición y se añadirán cuando finalicen las ejecuciones de 40 tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, cada checkpoint pesa 6,10-6,35 GB en disco; en evaluación solo se instancian `student` (DINOv3 ViT-H/16+) y `action_head`, por lo que el consumo real es inferior al del contenedor completo, pero la cifra exacta no se publica.
- GPU recomendadas: el protocolo de evaluación documentado usa 8 GPUs con una tarea por GPU; el entrenamiento usó 8 GPUs con batch 16 por GPU y bf16.
- ¿Cabe en GPU consumer? No confirmado. El peso del checkpoint completo (≈6 GB) sugiere que una GPU con 16-24 GB podría alojar los módulos de inferencia, pero no hay medición publicada.
- Opciones de despliegue: el repositorio está pensado para el stack propio de Enfold (`scripts/eval_libero.sh`, `configs/sim_libero.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Enfold predhead-l6 / l16 (este) | VLA con destilación de vídeo | No disponible (checkpoint 6,10-6,35 GB) | `max_seq_len=4096` en prediction head; 9 frames por clip | Pendiente de publicación en LIBERO | `other` con pesos de terceros (NVIDIA, DINOv3) | Hugging Face, 0 descargas |
| OpenVLA | VLA sobre Llama-2 7B | 7B | No disponible en esta ficha | Resultados públicos en LIBERO | No disponible en esta ficha | Público |
| π0 (pi-zero) | VLA flow-matching | No disponible en esta ficha | No disponible en esta ficha | Resultados públicos en LIBERO | No disponible en esta ficha | Público |
| Octo | Política transformer generalista | No disponible en esta ficha | No disponible en esta ficha | Resultados públicos en LIBERO | No disponible en esta ficha | Público |

Nota: los datos de los modelos comparables no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards antes de usarse en una comparación formal.

## Limitaciones y advertencias

- Resultados de rendimiento no publicados: no hay tasas de éxito en LIBERO para ninguno de los dos checkpoints, por lo que no es posible afirmar que la profundidad 6 o 16 sea mejor.
- La prediction head no interviene en inferencia (`action_only_eval: true`): cualquier diferencia entre checkpoints se manifiesta solo a través del estudiante entrenado, no por la cabeza en sí.
- Dependencia estricta del `dataset_stats.json` emparejado: usar el fichero de la otra variante o de otra ejecución rompe la normalización de acciones y propriocepción.
- Pesos de terceros embebidos: Cosmos-Predict2.5 2B (NVIDIA Open Model License) y DINOv3 ViT-H/16+ (licencia DINOv3). Es obligatorio revisar ambas licencias por separado antes de redistribuir o usar comercialmente; la licencia `other` del repositorio no sustituye a las upstream.
- Ámbito limitado a LIBERO: no hay evidencia de generalización a otros entornos, robots o tareas fuera del benchmark.
- Sin soporte multilingüe declarado ni tokenizador de texto expuesto; el condicionamiento lingüístico depende de la caché de embeddings de Cosmos.
- Riesgo de sobreajuste al benchmark: 10 épocas sobre las cuatro suites de LIBERO con una única receta; no se documentan evaluaciones zero-shot ni de robustez.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de reproducibilidad.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval, GSM8K ni métricas de chat.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zwl666666/enfold-libero-predhead-scaling
- Cosmos-Predict2.5 (NVIDIA): no disponible en la información proporcionada
- DINOv3 (Meta): no disponible en la información proporcionada
- Benchmark LIBERO: no disponible en la información proporcionada
- Repositorio Enfold / scripts de evaluación (`scripts/eval_libero.sh`, `configs/sim_libero.yaml`): no disponible en la información proporcionada
- Paper o blog asociado: no disponible en la información proporcionada
