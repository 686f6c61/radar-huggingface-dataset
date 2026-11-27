# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9` es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, de aproximadamente 305 millones de parametros, publicado por el grupo stanfordasl dentro del proyecto DIET de analisis en el espacio de pesos. No es un modelo pensado para uso en produccion, sino una trayectoria de entrenamiento reproducible: una de las ejecuciones de una coleccion en la que solo varia la semilla aleatoria, con el objetivo de estudiar la dinamica del entrenamiento y la evolucion de los pesos.

El modelo usa la arquitectura OLMo2 densa (hidden_size=768, 16 capas, 12 cabezas de atencion, contexto maximo de 2048 tokens) y se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes. La receta es preentrenamiento puro con entropia cruzada (sin destilacion, `teacher_schedule=none`), AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16, con un presupuesto de 2.000 millones de tokens y 30.517 pasos maximos.

Su relevancia es metodologica: permite a investigadores comparar trayectorias de entrenamiento entre semillas, analizar la evolucion de la perdida y las metricas de validacion cada 950 pasos, y estudiar el espacio de pesos con la arquitectura OLMo2 y datos Dolma. Los checkpoints intermedios se publican en ramas `stepN` con periodicidad de 100 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles de configuracion: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (sin GQA). Tamano del repositorio: 372,3 GB, debido a la acumulacion de checkpoints por paso.

## Arquitectura y entrenamiento

Transformer decoder-only con la configuracion OLMo2 media definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. La atencion usa 12 cabezas de query y 12 de key/value (sin agrupacion), con un contexto maximo de 2048 posiciones. El modelo es denso, sin mezcla de expertos ni componentes hibridos.

El entrenamiento parte de inicializacion aleatoria y usa exclusivamente perdida de entropia cruzada de modelado de lenguaje, con `distillation.teacher_schedule=none` en `src/run_distillation.py`. Los datos son `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y transmitido en streaming desde el Hub. La receta incluye AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precision bf16, con un presupuesto de 2.000 millones de tokens repartidos en hasta 30.517 pasos. La ejecucion se realizo en un cluster con GPU H100, job 10843, iniciado el 2026-11-20. Solo la semilla (9) difiere respecto al resto de ejecuciones de la coleccion, lo que permite analisis controlados de variabilidad entre trayectorias. Se publican curvas de perdida cada 25 pasos (`training_loss.csv`, 1.220 filas) y metricas de validacion cada 950 pasos (`eval_metrics.csv`, 32 filas: `eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`, `tokens_seen`), ademas de `metrics.json` con la procedencia y las metricas finales.

## Capacidades

- Generacion de texto autoregresiva basica, tras preentrenamiento puro sobre Dolma.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles.
- Analisis de trayectorias de entrenamiento: checkpoints intermedios en ramas `stepN` (cada 100 pasos) para estudiar la evolucion de los pesos.
- Reproducibilidad experimental: misma receta que otras semillas de la coleccion, cambiando unicamente el seed.
- Soporte de tool calling / function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay ajuste por instrucciones ni RLHF.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: comparar las curvas de perdida y las metricas de validacion de esta semilla con las de otras semillas de la coleccion para cuantificar la varianza entre ejecuciones con la misma receta.
- Analisis del espacio de pesos: estudiar la evolucion de los pesos entre checkpoints `stepN` (cada 100 pasos) para detectar fases de convergencia o cambios abruptos en la representacion interna.
- Estudios de scaling y recetas: usar la configuracion OLMo2 media (~305M) y el presupuesto de 2.000 millones de tokens como punto de referencia reproducible para comparar variantes de optimizador, learning rate o schedule.
- Validacion de pipelines de datos: al entrenar con Dolma v1.7 en streaming, sirve para evaluar el impacto de la mezcla de datos y del orden de muestreo en modelos de escala pequena.
- Baseline de perplejidad en ingles: medir `eval_perplexity` y `eval_bits_per_token` sobre el conjunto de validacion del proyecto para comparar con otros modelos de ~300M entrenados sobre Dolma.
- Docencia y experimentacion academica: modelo de 305M con contexto de 2048 tokens que puede ejecutarse en hardware modesto para ilustrar el preentrenamiento desde cero y el analisis de trayectorias.
- Analisis de estabilidad entre semillas: al ser una de varias ejecuciones identicas salvo por el seed, permite estudiar la sensibilidad del entrenamiento a la inicializacion y al orden de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia metricas de validacion internas del proyecto (`eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`) registradas en `eval_metrics.csv` cada 950 pasos, sin valores concretos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6-0,7 GB solo para pesos (305M parametros × 2 bytes), mas memoria para activaciones y cache KV; en la practica, menos de 2 GB para contextos de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,3-0,4 GB para pesos; en 4 bits, alrededor de 0,15-0,2 GB (cuantizaciones no publicadas por el autor, requieren conversion).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100 o H100, aunque sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria indicada en la model card); vLLM, llama.cpp, Ollama o TGI requeririan conversion o soporte adicional de la arquitectura OLMo2, no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El `training_loss.csv` incluye `tokens_per_sec` y `flops_total` por paso, pero no se proporcionan valores concretos.
- Nota de almacenamiento: el repositorio completo ocupa 372,3 GB por la acumulacion de checkpoints; para inferencia basta con descargar una revision `stepN` concreta o `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed9 | ~305M | 2048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Trayectoria de investigacion |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | no disponible | Trayectoria de investigacion (coleccion relacionada) |
| allenai/OLMo-2-0425-1B | ~1B | no disponible | Dolma | Apache 2.0 | Modelo base OLMo2 publicado por AI2 |

La comparacion con modelos de proposito general de ~300M no esta disponible en la informacion proporcionada. La alternativa mas directa es la coleccion `jjalora/diet-traj-pythia-410m-*`, que aplica el mismo enfoque de analisis de trayectorias sobre la arquitectura Pythia.

## Limitaciones y advertencias

- Modelo de investigacion: no ha pasado por ajuste por instrucciones, RLHF ni DPO; no es adecuado como asistente conversacional ni para uso en produccion.
- Entrenamiento limitado: 2.000 millones de tokens sobre un modelo de 305M, muy por debajo de los regimenes de entrenamiento de modelos base de proposito general; la calidad del texto generado sera limitada.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Contexto corto: 2048 tokens maximos, insuficiente para tareas de contexto largo.
- Riesgo de alucinacion y sesgos: al ser un modelo base preentrenado sobre Dolma, puede reproducir sesgos presentes en los datos y generar contenido factualmente incorrecto sin senalizacion.
- Sin soporte de tool calling ni agentes: no se ha entrenado para ello.
- Tokenizer: `tokenizer.json` solo esta en `main`; al cargar una revision `stepN` hay que tomar el tokenizer de `main` o de `allenai/OLMo-2-0425-1B`.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta validado para ello y su calidad no lo hace recomendable.
- Repositorio muy pesado: 372,3 GB por los checkpoints acumulados; conviene descargar solo la revision necesaria.
- Procedencia incompleta: el `git_commit` figura como `unknown` en `run.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm
- Coleccion relacionada de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia: https://huggingface.co/allenai/OLMo-2-0425-1B
