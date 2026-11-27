# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed7

## Resumen

DIET trajectory: OLMo2-medium (~305M) es un checkpoint de preentrenamiento desde cero sobre la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos. No es un modelo pensado para uso en producción, sino una pieza de un conjunto de trayectorias de entrenamiento (una por semilla) cuyo objetivo es estudiar cómo evolucionan los pesos y las métricas a lo largo del preentrenamiento. La única diferencia entre las ejecuciones de la colección es la semilla aleatoria, lo que permite análisis controlados de variabilidad.

El modelo tiene 305.185.536 parámetros, una ventana de contexto de 2.048 tokens y se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes. La receta es preentrenamiento puro con cross-entropy (sin destilación, `teacher_schedule=none`), AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, con un presupuesto de 2.000 millones de tokens y 30.517 pasos.

Es relevante ahora porque ofrece checkpoints intermedios etiquetados por paso (ramas `stepN`, cada 100 pasos) junto con curvas de pérdida y métricas de validación, algo poco habitual en modelos abiertos. Eso lo convierte en material útil para investigación sobre dinámica de entrenamiento, no para tareas de generación de calidad. La licencia es Apache 2.0 y el repositorio ocupa 372,3 GB por la acumulación de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense.yaml` de jjalora/diet-lm) |
| Parametros totales | 305.185.536 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); tokenizer.json solo en `main` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia OLMo2 con `hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atención y 12 cabezas key/value (atención multi-cabeza sin GQA), y 2.048 posiciones máximas. Suma aproximadamente 305M de parámetros. No emplea mezcla de expertos ni mecanismos híbridos SSM; es un decoder-only estándar.

El entrenamiento parte de cero sobre `emozilla/dolma-v1_7-3B`, leído en streaming desde el Hub, con un presupuesto de 2.000 millones de tokens repartidos en 30.517 pasos y checkpoints cada 100 pasos. La receta es preentrenamiento puro de modelado de lenguaje con cross-entropy, sin RLHF, DPO ni destilación (`distillation.teacher_schedule=none`), usando AdamW (lr=3e-5, betas 0.9/0.95, weight decay 0.1), schedule coseno y bf16, ejecutado en GPUs H100 (clúster makau, job 10841). La innovación no está en el modelo sino en el artefacto: la colección fija todos los hiperparámetros y varía solo la semilla (esta es la semilla 7), lo que habilita estudios de trayectoria en el espacio de pesos. Se publican `training_loss.csv` (pérdida cada 25 pasos, 1.220 filas), `eval_metrics.csv` (validación cada 950 pasos, 32 filas) y `metrics.json` con la procedencia y métricas finales.

## Capacidades

- Generación de texto autoregresiva básica en inglés, limitada por el tamaño (305M) y por un preentrenamiento de solo 2.000 millones de tokens.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés, útil como referencia en experimentos.
- Checkpoints intermedios por paso (ramas `stepN`) para análisis de evolución de pesos y métricas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: cargar distintas revisiones `stepN` y comparar la evolución de pesos, pérdida y perplejidad a lo largo de los 30.517 pasos para estudiar trayectorias en el espacio de pesos.
- Estudios de variabilidad por semilla: emparejar este checkpoint (semilla 7) con las demás semillas de la colección para cuantificar la dispersión de resultados con hiperparámetros idénticos.
- Análisis de curvas de escalado y recetas: usar `training_loss.csv` y `eval_metrics.csv` para reproducir el comportamiento de AdamW con schedule coseno en un modelo de 305M sobre Dolma.
- Referencia base para experimentos de destilación: al ser un modelo entrenado con `teacher_schedule=none`, sirve como línea base frente a variantes con destilación en el mismo pipeline (`src/run_distillation.py`).
- Pruebas de infraestructura de entrenamiento: el `run.json` documenta clúster, GPU y jobs, lo que permite validar pipelines de streaming de datos desde el Hub con checkpoints cada 100 pasos.
- Experimentos didácticos de preentrenamiento: su tamaño reducido y su receta explícita lo hacen manejable para reproducir el flujo completo en entornos académicos con GPUs H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de validación internas (`eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`) en `eval_metrics.csv`, sin valores concretos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU consumer moderna.
- En cuantización de 8 bits o 4 bits el peso se reduce a unos 0,3 GB o 0,15 GB respectivamente, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia; para reproducir el entrenamiento se documenta el uso de H100.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad de formato safetensors con arquitectura OLMo2, cabría esperar soporte en vLLM o TGI si la arquitectura está implementada; no se documenta en la información disponible. llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed7 | 305M | 2.048 | apache-2.0 | Trayectoria de preentrenamiento (investigación) |
| jjalora/diet-traj-pythia-410m-* | ~410M (según nombre de la colección) | no disponible | no disponible | Trayectoria de preentrenamiento sobre Pythia |
| allenai/OLMo-2-0425-1B | ~1B (según nombre) | no disponible | no disponible | Modelo OLMo2 publicado por AI2, uso general |

La comparación con alternativas de uso general no es directa: este checkpoint está diseñado para análisis de trayectorias, no para rendimiento en tareas. Los datos de los modelos comparables no están detallados en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: con 305M de parámetros y 2.000 millones de tokens de entrenamiento, su calidad de generación es muy inferior a la de modelos instructivos actuales; no debe usarse como asistente en producción.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente en contextos largos o dominios especializados.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no hay evidencia de capacidades multilingües.
- No se documenta ningún proceso de alineación (RLHF/DPO) ni filtrado de seguridad, por lo que puede reproducir sesgos presentes en Dolma v1.7.
- El tokenizer no está en las ramas `stepN`: hay que cargarlo desde `main` o desde `allenai/OLMo-2-0425-1B`, lo que añade un paso extra y riesgo de error en la carga.
- El repositorio ocupa 372,3 GB por la acumulación de checkpoints; descargar la colección completa requiere planificación de almacenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed7
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
- Repositorio del proyecto DIET (referenciado en la model card): jjalora/diet-lm (configs/model/olmo2_medium_dense.yaml, src/run_distillation.py)
- Colección relacionada (referenciada en la model card): jjalora/diet-traj-pythia-410m-*
