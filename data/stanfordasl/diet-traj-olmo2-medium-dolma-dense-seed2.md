# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed2

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 2 es un modelo de lenguaje entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para producción, sino un artefacto de investigación: una de las múltiples ejecuciones de preentrenamiento idénticas salvo por la semilla aleatoria, cuyo objetivo es estudiar la trayectoria de entrenamiento y la variabilidad entre inicializaciones. Esta ficha corresponde a la semilla 2 de la colección.

El modelo emplea una arquitectura transformer densa de tipo OLMo2 con 16 capas, `hidden_size` de 768, 12 cabezas de atención (12 cabezas KV, sin GQA) y una longitud máxima de posición de 2048 tokens, sumando aproximadamente 305 millones de parámetros. Se entrenó sobre el espejo nativo de Hugging Face `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente según los componentes de la mezcla Dolma v1.7, con un presupuesto de 2.000 millones de tokens.

Su relevancia es metodológica: proporciona checkpoints intermedios (ramas `stepN`) y curvas de pérdida y métricas de evaluación detalladas, lo que permite a investigadores analizar la dinámica de convergencia, la influencia de la semilla y las propiedades del espacio de pesos. No debe confundirse con los modelos OLMo 2 oficiales de Ai2, de mayor tamaño y entrenados con recetas distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`), hidden_size=768, intermediate_size=3072, 16 capas, 12 cabezas de atención, 12 cabezas KV, max_position_embeddings=2048 |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

Se trata de un transformer denso decoder-only con la arquitectura OLMo2, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. La configuración incluye 16 capas, dimensión oculta de 768, dimensión intermedia de 3072, 12 cabezas de atención con 12 cabezas KV (atención multi-cabeza estándar, sin grouped-query attention) y embeddings posicionales limitados a 2048 tokens. No emplea mezcla de expertos ni componentes de estado recurrente.

El entrenamiento consistió en preentrenamiento puro con pérdida de entropía cruzada (LM), con `distillation.teacher_schedule=none`, es decir, sin destilación ni profesor. Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, con un presupuesto de 2.000 millones de tokens y 30.517 pasos máximos, guardando checkpoints cada 100 pasos. Los datos provienen de una caché de tokens preempaquetada de `emozilla/dolma-v1_7-3B` (500.000 bloques de entrenamiento y 544 de evaluación a seq_len=2048). La ejecución se realizó en el clúster "fran" con GPUs H200. Un detalle metodológico relevante: las semillas 0-3 usan la caché empaquetada, mientras que las semillas 4-11 transmiten datos en vivo, por lo que sus `eval_loss` se calculan sobre conjuntos de evaluación distintos (1.113.568 frente a 2.094.081 tokens) y no son comparables entre grupos.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto máximo de 2048 tokens.
- Modelado de lenguaje base: no se documenta ajuste por instrucciones, RLHF ni DPO.
- Razonamiento y conocimiento factual limitados por su escala (~305M parámetros) y por el presupuesto de entrenamiento (2.000 millones de tokens).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de modo de razonamiento explícito (thinking), visión ni audio.
- Utilidad principal: servir como punto de análisis de trayectorias de entrenamiento y comparación entre semillas, no como modelo de propósito general.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: comparar las curvas de pérdida y las métricas de validación de esta semilla con las de las demás semillas de la colección para cuantificar la varianza debida a la inicialización aleatoria.
- Análisis del espacio de pesos: estudiar la evolución de los pesos entre checkpoints (`stepN`) para detectar fases de convergencia, simetrías o cambios de régimen durante el preentrenamiento.
- Reproducibilidad de recetas: servir como referencia verificable de una receta concreta (AdamW, lr=3e-5, cosine, bf16, Dolma empaquetado) para validar pipelines de entrenamiento propios.
- Estudio de mezclas de datos: al estar entrenado sobre un muestreo proporcional de los componentes de Dolma v1.7, permite analizar cómo afecta esa mezcla a las métricas de validación en un modelo de escala pequeña.
- Experimentos de destilación: al fijar `teacher_schedule=none`, actúa como línea base sin profesor frente a variantes con destilación en el mismo marco DIET.
- Docencia y prototipado de bajo coste: con ~305M parámetros, puede ejecutarse en hardware modesto para demostrar flujos de carga de checkpoints, evaluación de perplejidad y análisis de curvas de entrenamiento.
- Evaluación de metodologías de checkpointing: los checkpoints cada 100 pasos y los ficheros `training_loss.csv` y `eval_metrics.csv` permiten probar herramientas de análisis de series temporales de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente proporciona métricas de entrenamiento y validación internas (`training_loss.csv`, `eval_metrics.csv`, `metrics.json`), sin valores numéricos concretos de pérdida o perplejidad final en el texto disponible, y sin comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 0,6 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y caché KV; en fp32, alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para inferencia en bf16/fp16; para entrenamiento desde cero se usaron GPUs H200 en el clúster "fran".
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso con contexto completo de 2048 tokens.
- Opciones de despliegue: `transformers` (librería declarada en la model card); para cuantización y ejecución ligera serían necesarias conversiones a GGUF para llama.cpp u Ollama, no documentadas oficialmente. vLLM y TGI no están documentados para esta revisión concreta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de carga: los pesos deben cargarse desde una revisión `stepN` y el tokenizer desde `main` (o desde `allenai/OLMo-2-0425-1B`), ya que las ramas por paso omiten el tokenizer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed2 (este) | ~305M | 2048 | Dolma v1.7 (2.000M tokens) | Apache 2.0 | Investigación de trayectorias de entrenamiento |
| jjalora/diet-traj-pythia-410m-* | ~410M | No disponible en la información | No disponible en la información | No disponible en la información | Investigación de trayectorias (arquitectura Pythia) |
| allenai/OLMo-2-0425-1B | ~1B | No disponible en la información | No disponible en la información | No disponible en la información | Modelo OLMo 2 oficial de Ai2 |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada. La comparación se limita a escala, arquitectura y propósito declarado.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no es adecuado como asistente conversacional en producción.
- Riesgo elevado de alucinación y de errores factuales por su escala (~305M) y su presupuesto de entrenamiento (2.000M tokens).
- Solo inglés: no se documenta soporte multilingüe.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Sesgos: no se documenta ninguna evaluación de sesgos; al entrenarse sobre Dolma, hereda los sesgos y la composición de ese corpus.
- Comparabilidad de métricas: las semillas 0-3 y 4-11 usan conjuntos de evaluación distintos, por lo que sus `eval_loss` no son directamente comparables; hay que tenerlo en cuenta al usar `metrics.json`.
- Carga correcta: es necesario cargar el tokenizer desde `main` o desde `allenai/OLMo-2-0425-1B`; las ramas `stepN` no lo incluyen.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece garantías de calidad para tales fines.
- Tamaño del repositorio: 372,3 GB, dominado por los múltiples checkpoints; la descarga completa es costosa y conviene limitarse a la revisión necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed2
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección de referencia Pythia (mencionada en la model card): https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
