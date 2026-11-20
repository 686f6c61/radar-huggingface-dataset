# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed2

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 2 es un checkpoint de preentrenamiento desde cero perteneciente al proyecto DIET de análisis en el espacio de pesos (weight-space), desarrollado por el autor stanfordasl. El modelo emplea la arquitectura OLMo2 en su variante densa de aproximadamente 305 millones de parámetros, con una configuración de 16 capas, dimensión oculta de 768 y 12 cabezas de atención. Su propósito no es el despliegue como asistente conversacional, sino servir como punto de muestreo dentro de una trayectoria de entrenamiento para estudiar cómo evolucionan los pesos y las representaciones internas a lo largo del preentrenamiento.

La relevancia de este checkpoint reside en su carácter controlado: forma parte de una colección en la que únicamente varía la semilla aleatoria entre ejecuciones, lo que permite aislar el efecto del azar en la dinámica de entrenamiento. Se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo comunitario de Dolma v1.7 en Hugging Face, con un presupuesto de 2.000 millones de tokens y decodificación en streaming (sin pre-empaquetado), lo que lo vincula directamente a las prácticas de datos abiertos del ecosistema OLMo.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors bf16 y checkpoints intermedios accesibles mediante ramas `stepN`. Está pensado para investigadores que trabajan en interpretabilidad, alineamiento de trayectorias de entrenamiento o estudios de reproducibilidad, más que para aplicaciones de producción final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer OLMo2 denso |
| Parametros totales | ~305M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en configuración densa, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` y `max_position_embeddings=2048`. La atención emplea el mismo número de cabezas de query y de key/value, sin GQA, y la posición máxima fija el contexto efectivo en 2048 tokens.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), sin destilación ni RLHF/DPO. Se usa AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, schedule coseno y precisión bf16. El presupuesto es de 2.000 millones de tokens (`token_budget: 2000000000`), con `max_steps=30517` y `save_steps=100`, sobre `emozilla/dolma-v1_7-3B` en streaming (no pre-empaquetado). La ejecución se realizó en GPUs H200 (clúster "fran", commit `81e3d16`, job `683691`, inicio 2026-11-20 00:33:47). La única variable que difiere respecto a otras ejecuciones de la colección es la semilla (`seed: 2`).

## Capacidades

- Generación de texto autoregresiva básica, limitada al dominio y escala de un modelo de ~305M entrenado con 2B tokens.
- Modelado de lenguaje causal para evaluación de perplejidad y estudios de trayectoria de entrenamiento.
- Análisis de representaciones internas y del espacio de pesos (objetivo principal del proyecto DIET).
- Reproducibilidad controlada: permite comparar ejecuciones que solo difieren en la semilla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: [en]`).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en trayectorias de entrenamiento: comparar checkpoints `stepN` de esta ejecución con los de otras semillas para estudiar la variabilidad inducida por el azar en el espacio de pesos.
- Estudios de interpretabilidad: analizar activaciones y representaciones internas de un transformer OLMo2 de 16 capas entrenado sobre Dolma, con configuración conocida y reproducible.
- Reproducibilidad de recetas: verificar recetas de preentrenamiento con AdamW, schedule coseno y bf16 sobre un presupuesto fijo de 2B tokens.
- Baseline de investigación en modelos pequeños: servir como referencia de ~305M parámetros para comparaciones controladas con arquitecturas alternativas.
- Experimentos de weight-space merging: usar los pesos como punto de partida o componente en estudios de interpolación y dietas de pesos.
- Docencia y formación: ilustrar el ciclo completo de preentrenamiento OLMo2 con datos Dolma en un modelo que cabe en hardware modesto.
- Evaluación de pipelines de datos: medir el efecto del muestreo proporcional de Dolma v1.7 en streaming frente a pre-empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (~305M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- En cuantización de 8 bits: ~0,3 GB de pesos; en 4 bits: ~0,15 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en bf16; para entrenamiento se usaron H200 según `run.json`.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (librería declarada), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed2 | ~305M | 2048 | Apache 2.0 | Trayectoria de entrenamiento (seed 2) |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Trayectoria de entrenamiento (Pythia) |
| OLMo2 (variantes oficiales de mayor tamaño) | >1B | no disponible | Apache 2.0 | Modelo base OLMo2 |

La comparación directa con los checkpoints de la colección `jjalora/diet-traj-pythia-410m-*` es pertinente por compartir el mismo espíritu metodológico (trayectorias con semillas controladas), aunque cambian arquitectura (Pythia frente a OLMo2), tamaño y dataset.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado para instrucciones ni para uso conversacional; su salida es texto continuado, no respuestas alineadas.
- Riesgo elevado de alucinación y de contenido incoherente por su escala (~305M) y presupuesto de entrenamiento (2B tokens).
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; sin cobertura multilingüe documentada.
- Sesgos potenciales heredados de Dolma v1.7, dataset de origen web con posibles sesgos de dominio, género y geografía; no se documenta mitigación.
- Licencia Apache 2.0 permite uso comercial, pero la idoneidad técnica para producción es muy limitada por la escala y el propósito del checkpoint.
- Los checkpoints intermedios viven en ramas `stepN`; `main` solo contiene los pesos finales cuando la ejecución termina, por lo que conviene verificar `run.json` para el presupuesto exacto.
- No hay garantías de soporte ni mantenimiento del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed2
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Colección relacionada: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
