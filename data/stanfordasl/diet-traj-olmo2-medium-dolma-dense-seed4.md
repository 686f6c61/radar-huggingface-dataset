# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed4

## Resumen

DIET trajectory: OLMo2-medium es un modelo de lenguaje de ~305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para producción ni para uso conversacional: es una pieza de un conjunto de ejecuciones de preentrenamiento controladas, donde únicamente varía la semilla aleatoria, para estudiar cómo evolucionan los pesos y las métricas a lo largo de la trayectoria de entrenamiento. Esta variante concreta corresponde a la semilla 4 sobre el dataset Dolma v1.7.

El modelo emplea una arquitectura transformer densa de estilo OLMo2 con hidden_size de 768, 16 capas, 12 cabezas de atención (sin GQA, ya que num_key_value_heads también es 12) y una longitud máxima de posición de 2048 tokens. El entrenamiento consistió en preentrenamiento puro con entropía cruzada (sin destilación, con `teacher_schedule=none`), AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, con un presupuesto de 2.000 millones de tokens y 30.517 pasos.

Su relevancia es metodológica más que de rendimiento: proporciona checkpoints intermedios (ramas `stepN` cada 100 pasos) con curvas de pérdida y métricas de validación asociadas, lo que lo convierte en material útil para investigación sobre dinámica de entrenamiento, dietas de datos y reproducibilidad, no para tareas de generación de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (estilo decoder-only) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles adicionales de configuración: hidden_size=768, intermediate_size=3072, num_hidden_layers=16, num_attention_heads=12, num_key_value_heads=12.

## Arquitectura y entrenamiento

Se trata de un transformer denso decoder-only con la configuración `olmo2_medium_dense` del repositorio jjalora/diet-lm. Con 16 capas, dimensión oculta de 768 y FFN de 3072, el modelo se sitúa en la gama de ~305M parámetros, con atención multi-cabeza estándar (12 cabezas de query y 12 de key/value, sin grouped-query attention) y embeddings posicionales limitados a 2048 tokens.

El entrenamiento es preentrenamiento puro de modelado de lenguaje con entropía cruzada, sin fase de destilación (`distillation.teacher_schedule=none`), sin RLHF ni DPO. Los datos provienen de `emozilla/dolma-v1_7-3B`, un espejo nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming desde el Hub. La receta usa AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16, con un presupuesto de 2.000 millones de tokens repartidos en 30.517 pasos y checkpoints cada 100 pasos. La ejecución se realizó en un clúster con GPU H100 (job 10836, inicio 2026-11-19). La única diferencia respecto al resto de ejecuciones de la colección es la semilla aleatoria (seed 4), lo que convierte al modelo en una réplica controlada para análisis de trayectorias.

## Capacidades

- Generación de texto autoregresiva básica en inglés, limitada por el tamaño del modelo (~305M) y su contexto de 2048 tokens.
- Modelado de lenguaje y cálculo de perplejidad, útil para evaluación de dietas de datos.
- Producción de checkpoints intermedios con curvas de pérdida y métricas de validación para análisis de trayectoria de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: comparar la evolución de pesos y pérdidas entre semillas (esta es la seed 4) para estudiar estabilidad y reproducibilidad del preentrenamiento.
- Análisis de dietas de datos: usar las métricas de validación (`eval_metrics.csv`) para evaluar el efecto de Dolma v1.7 en un modelo de ~305M con presupuesto fijo de 2.000 millones de tokens.
- Estudios de weight-space: aprovechar los checkpoints `stepN` para analizar interpolación, simetrías o trayectorias en el espacio de parámetros entre ejecuciones con distinta semilla.
- Baseline de referencia: servir como punto de comparación de bajo coste para experimentos de destilación o de recetas alternativas sobre la misma arquitectura OLMo2.
- Reproducción de recetas: validar pipelines de entrenamiento en streaming desde el Hub con AdamW, schedule coseno y bf16 antes de escalar a modelos mayores.
- Evaluación de perplejidad y bits por token: emplear `eval_loss`, `eval_perplexity` y `eval_bits_per_token` como señales para seleccionar checkpoints intermedios en estudios de scaling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia métricas internas de entrenamiento y validación (`training_loss.csv`, `eval_metrics.csv`, `metrics.json`), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,6 GB en bf16/fp16 para los ~305M parámetros, más overhead de activaciones y caché KV para 2048 tokens; en fp32, ~1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; H100 fue la GPU usada en entrenamiento, pero no es necesaria para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

Nota operativa: cargar los pesos desde una revisión `stepN` y el tokenizer desde `main` (o desde `allenai/OLMo-2-0425-1B`), ya que las ramas por paso omiten `tokenizer.json`. El repositorio ocupa 372,3 GB por la acumulación de checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed4 | ~305M | 2048 | apache-2.0 | Trayectoria de preentrenamiento (seed 4) |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Trayectoria de preentrenamiento sobre Pythia |
| allenai/OLMo-2-0425-1B | ~1B | no disponible | no disponible | Modelo OLMo2 publicado para uso general |

La comparación con alternativas de la misma categoría se limita a las referencias citadas en la model card; no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado para instrucciones ni para uso conversacional; su calidad de generación es la de un preentrenamiento de ~305M parámetros.
- Riesgo elevado de alucinación y de texto incoherente en tareas abiertas, inherente a su escala y a la ausencia de alineamiento.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma restringido al inglés según la model card.
- Sesgos heredados de Dolma v1.7: el dataset web puede contener sesgos sociales, toxicidad y datos de baja calidad; no se documenta ningún filtrado adicional en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero el modelo no está pensado para producción y no se ofrecen garantías de calidad.
- El repositorio de 372,3 GB incluye múltiples checkpoints; conviene descargar solo la revisión necesaria.
- No se documentan resultados de benchmarks ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed4
- Dataset Dolma v1.7 (espejo): https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia OLMo2: https://huggingface.co/allenai/OLMo-2-0425-1B
- Repositorio del proyecto DIET (referenciado en la model card): jjalora/diet-lm
- Colección de trayectorias Pythia (referenciada): jjalora/diet-traj-pythia-410m-*
