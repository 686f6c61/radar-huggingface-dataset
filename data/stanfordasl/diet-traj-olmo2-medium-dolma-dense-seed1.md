# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1

## Resumen

El modelo `stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1` es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, desarrollado por el grupo stanfordasl en el marco del proyecto DIET de análisis del espacio de pesos (*weight-space*). No es un modelo orientado a produccion ni a conversacion: es una pieza de un experimento cientifico disenado para estudiar trayectorias de entrenamiento, es decir, como evolucionan los pesos y las metricas a lo largo de un run de preentrenamiento completo. La coleccion entrena multiples semillas con receta identica para aislar el efecto del azar inicial.

El modelo tiene aproximadamente 305 millones de parametros (305.185.536 segun los safetensors), con `hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atencion y 12 cabezas KV (atencion multi-head clasica, sin GQA), y una longitud maxima de posicion de 2048 tokens. Se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente, con un presupuesto de 2.000 millones de tokens y decodificacion puramente autoregresiva con perdida de entropia cruzada.

Su relevancia es metodologica: proporciona checkpoints intermedios cada 100 pasos junto con curvas de perdida de entrenamiento y validacion en CSV, lo que permite reproducir analisis de dinamica de entrenamiento, comparativas entre semillas y estudios de alineacion de representaciones. Para uso practico como generador de texto, el modelo es demasiado pequeno y su entrenamiento demasiado limitado (2B tokens) para competir con modelos instructivos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo2 (`olmo2_medium_dense`), atencion multi-head con 12 cabezas Q y 12 KV |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16), una rama `stepN` por checkpoint y `main` con los pesos finales y el tokenizer |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa de ~305M: 16 capas transformer decoder-only, `hidden_size=768`, `intermediate_size=3072`, 12 cabezas de atencion y 12 cabezas KV, con un maximo de 2048 posiciones. La configuracion de referencia es `configs/model/olmo2_medium_dense.yaml` dentro del repositorio `jjalora/diet-lm`. No emplea mezcla de expertos ni mecanismos de atencion lineal o decodificacion especulativa; es un transformer clasico.

El entrenamiento es preentrenamiento puro de modelado de lenguaje con entropia cruzada (`distillation.teacher_schedule=none`, es decir, sin destilacion pese al nombre del script `src/run_distillation.py`). Se usa AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay 0.1, scheduler coseno y precision bf16 sobre GPUs H200. El presupuesto es de 2.000 millones de tokens (`token_budget=2000000000`), con `max_steps=30517` y guardado cada 100 pasos. Los datos proceden de `emozilla/dolma-v1_7-3B` en una cache preempaquetada de 500.000 bloques de entrenamiento y 544 de evaluacion a `seq_len=2048`; esta semilla (seed 1) entrena sobre el nodo `fran`. Un detalle metodologico importante: las semillas 0-3 usan la cache empaquetada, mientras que las semillas 4-11 hacen streaming en vivo, por lo que sus `eval_loss` se calculan sobre conjuntos de evaluacion distintos (1.113.568 frente a 2.094.081 tokens) y no son directamente comparables entre grupos.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada por el tamano del modelo y el presupuesto de entrenamiento (2B tokens).
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles, util para analisis de trayectorias de entrenamiento.
- Reproduccion de estudios de dinamica de pesos: checkpoints intermedios cada 100 pasos con ramas `stepN`.
- Analisis de variabilidad entre semillas: misma receta, mismo dataset y mismo hardware, solo cambia la semilla.
- No soporta tool calling ni function calling de forma nativa.
- No esta entrenado para agentes, razonamiento multi-paso ni modo *thinking*.
- No tiene capacidades de vision ni audio.
- Multilingue: no, solo ingles.
- No es un modelo instruct ni ha pasado por RLHF/DPO; no sigue instrucciones de forma fiable.

## Casos de uso

- Investigacion en dinamica de entrenamiento: cargar checkpoints `stepN` y analizar la evolucion de la perdida, la norma de pesos o la alineacion de representaciones capa a capa a lo largo de los 30.517 pasos.
- Estudios de variabilidad por semilla: comparar este run (seed 1) con las demas semillas de la coleccion para cuantificar cuanto del resultado final se debe al azar de inicializacion y orden de datos.
- Analisis de espacio de pesos (*weight-space*): estudiar interpolaciones, modos lineales o distancias entre checkpoints de la misma trayectoria, aprovechando la cadencia de guardado cada 100 pasos.
- Reproduccion de baselines OLMo2 a pequena escala: servir como referencia controlada para experimentos que modifiquen receta, datos o arquitectura sobre el mismo esqueleto de 305M.
- Calculo de perplejidad y metricas de validacion: usar `eval_metrics.csv` (32 filas, cada 950 pasos) para validar pipelines de evaluacion propios frente a los publicados.
- Docencia y experimentacion con bajo coste: un modelo de 305M en bf16 ocupa aproximadamente 610 MB de pesos, lo que permite ejecutarlo en una unica GPU consumer para demostraciones de preentrenamiento y analisis de curvas.
- Generacion de texto exploratoria en ingles: util para inspeccionar cualitativamente que ha aprendido el modelo en cada etapa, no para aplicaciones en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas internas de entrenamiento y validacion: `training_loss.csv` (perdida cada 25 pasos, 1.220 filas, con `step`, `loss`, `lr`, `tokens_per_sec`, `flops_total`), `eval_metrics.csv` (cada 950 pasos, 32 filas, con `eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`, `tokens_seen`) y `metrics.json` con la procedencia del run y las metricas finales. Los valores numericos concretos de estas metricas no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,61 GB solo para pesos, mas overhead de activaciones y cache KV (con contexto de 2048 y 16 capas, el coste de cache es reducido). En la practica, cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. El entrenamiento se realizo en NVIDIA H200.
- Cabe en GPU consumer: si, sin problema, incluso en GPUs de gama baja o en CPU con llama.cpp si se convierte a GGUF (no se publican pesos GGUF oficiales).
- Opciones de despliegue: `transformers` de forma nativa (libreria declarada). Al ser un modelo estandar OLMo2, es compatible con vLLM, TGI y llama.cpp/Ollama tras conversion, aunque no se documentan configuraciones oficiales para estos motores.
- Latencia y throughput estimados: no disponibles. El CSV de entrenamiento incluye `tokens_per_sec` por paso, pero corresponde a throughput de entrenamiento en H200, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed1 | ~305M | 2048 | 2B tokens (Dolma v1.7) | Apache 2.0 | Analisis de trayectorias |
| jjalora/diet-traj-pythia-410m-* | ~410M | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Analisis de trayectorias (proyecto predecesor) |
| allenai/OLMo-2-0425-1B | ~1B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Modelo base OLMo2 oficial |
| Pythia-410m (EleutherAI) | ~410M | 2048 | 300B tokens (Pile) | Apache 2.0 | Suite de checkpoints para interpretabilidad |

La comparacion con Pythia es la mas relevante metodologicamente: ambos publican checkpoints intermedios para estudiar el entrenamiento, pero Pythia entrena con un presupuesto de tokens mucho mayor (300B frente a 2B) y sobre The Pile en lugar de Dolma. El modelo de stanfordasl es, por tanto, un experimento de escala mucho menor y centrado en la arquitectura OLMo2 y en el control por semillas, no un competidor en calidad de generacion.

## Limitaciones y advertencias

- No es un modelo instruct: no sigue instrucciones, no tiene formato de chat y no ha pasado por RLHF ni DPO.
- Entrenado solo con 2.000 millones de tokens, muy por debajo de lo habitual; la calidad de generacion sera limitada y la perplexidad alta en comparacion con modelos base de mayor presupuesto.
- Solo ingles; no hay capacidades multilingues.
- Contexto maximo de 2048 tokens, insuficiente para tareas de contexto largo.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, dado el tamano y el presupuesto de entrenamiento.
- Sesgos: al entrenar sobre Dolma v1.7 (mezcla web, cientifica, codigo y libros), hereda los sesgos del corpus, pero no se documenta ningun analisis de sesgos en la informacion disponible.
- Caveat metodologico importante: las semillas 0-3 y 4-11 usan conjuntos de evaluacion distintos, por lo que sus `eval_loss` no son comparables entre grupos.
- El tokenizer solo esta en la rama `main`; hay que cargar pesos desde una revision `stepN` y el tokenizer desde `main` o desde `allenai/OLMo-2-0425-1B`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para produccion por su calidad y falta de alineacion.
- El repositorio ocupa 372,3 GB por la acumulacion de checkpoints; descargar la coleccion completa requiere planificacion de almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed1
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card para `configs/model/olmo2_medium_dense.yaml` y `src/run_distillation.py`)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
- Coleccion predecesora: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada como coleccion `jjalora/diet-traj-pythia-410m-*`)
