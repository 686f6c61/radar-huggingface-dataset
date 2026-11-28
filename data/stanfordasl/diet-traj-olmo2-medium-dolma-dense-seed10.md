# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed10

## Resumen

`diet-traj-olmo2-medium-dolma-dense-seed10` es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, desarrollado por el grupo `stanfordasl` dentro del proyecto DIET de análisis del espacio de pesos (weight-space). No es un modelo destinado a producción ni a uso conversacional: es una pieza de un conjunto de trayectorias de entrenamiento cuyo objetivo es estudiar cómo evolucionan los pesos y las métricas a lo largo del preentrenamiento, variando únicamente la semilla aleatoria entre ejecuciones. En este caso concreto se trata de la semilla 10 sobre datos Dolma v1.7.

El modelo tiene aproximadamente 305 millones de parámetros (305.185.536 según los pesos en safetensors), con `hidden_size=768`, 16 capas, 12 cabezas de atención y 12 cabezas KV, lo que lo sitúa en la gama pequeña de la familia OLMo2. Se entrenó con un presupuesto de 2.000 millones de tokens (2B) sobre el mirror de Hugging Face `emozilla/dolma-v1_7-3B`, con un máximo de 30.517 pasos y checkpoints cada 100 pasos.

Su relevancia es metodológica más que de rendimiento: proporciona curvas de pérdida, métricas de validación y pesos intermedios en formato bf16 safetensors para reproducir análisis de dinámica de entrenamiento. La licencia Apache 2.0 y el formato estándar de `transformers` facilitan su reutilización en experimentos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 (transformer decoder-only denso) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), ramas `stepN` por checkpoint; tokenizer en `main` |

Otros parámetros de configuración: `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia OLMo2, definido en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Con 16 capas, dimensión oculta de 768 y FFN de 3072, el modelo sigue el diseño convencional de atención multi-cabeza con 12 cabezas de consulta y 12 de clave/valor (sin GQA), y una ventana máxima de 2.048 posiciones.

El entrenamiento es preentrenamiento puro con pérdida de entropía cruzada sobre lenguaje (`distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin destilación efectiva). Se usó AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, schedule coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, un mirror nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes, y se consumieron en streaming desde el Hub. El presupuesto total fue de 2.000 millones de tokens con `max_steps=30517` y guardado cada 100 pasos, ejecutado en GPUs H100 (clúster `makau`, job 10838). La única diferencia respecto a otras ejecuciones de la colección es la semilla aleatoria (seed 10), lo que convierte a este checkpoint en una réplica controlada para estudiar variabilidad de trayectorias.

## Capacidades

- Generación de texto autoregresiva básica en inglés, limitada por el tamaño del modelo y el presupuesto de entrenamiento (2B tokens).
- Modelado de lenguaje y cálculo de perplejidad, útil como referencia en experimentos de dinámica de entrenamiento.
- Checkpoints intermedios accesibles mediante revisiones `stepN`, lo que permite analizar la evolución de representaciones y pesos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en dinámica de entrenamiento: cargar distintas revisiones `stepN` y comparar la evolución de pesos, activaciones y pérdida entre semillas para estudiar estabilidad del preentrenamiento.
- Análisis de weight-space: usar los pesos finales e intermedios como sustrato para técnicas de interpolación, pruning o merging experimental, aprovechando que solo varía la semilla.
- Reproducibilidad de recetas: validar la receta OLMo2 medium densa sobre Dolma con `lr=3e-5`, AdamW y schedule coseno, comparando las curvas de `training_loss.csv` y `eval_metrics.csv`.
- Baseline de perplejidad: emplear `eval_perplexity` y `eval_bits_per_token` como referencia para modelos pequeños entrenados con presupuestos similares de 2B tokens.
- Docencia y experimentación académica: modelo de 305M parámetros que cabe en una sola GPU consumer y permite reproducir experimentos de preentrenamiento a pequeña escala.
- Estudio de sesgos de corpus: analizar cómo Dolma v1.7 moldea el comportamiento lingüístico de un modelo pequeño en distintas etapas del entrenamiento.
- Punto de partida para fine-tuning controlado: al ser un checkpoint OLMo2 estándar en `transformers`, puede servir como inicialización en experimentos de adaptación con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento y validación (`eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`) en `eval_metrics.csv` y `metrics.json`, sin valores numéricos concretos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (305M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB con contexto completo de 2.048 tokens.
- VRAM estimada en fp32: aproximadamente 1,2 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; H100/A100 sobredimensionadas para inferencia, pero fueron las usadas en entrenamiento.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), y en principio compatible con `vLLM`, `TGI`, `llama.cpp` u `Ollama` si se generan los pesos en los formatos correspondientes, aunque no se documenta ninguna conversión oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

Nota: el repositorio ocupa 372,3 GB por la acumulación de checkpoints en ramas `stepN`; conviene descargar solo la revisión necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed10 | ~305M | 2.048 | Apache 2.0 | Checkpoint de investigación (trayectoria) |
| OLMo-2-0425-1B (AllenAI) | ~1B | no disponible en la información | Apache 2.0 | Modelo OLMo2 publicado para uso general |
| Pythia-410M (EleutherAI) | ~410M | 2.048 | Apache 2.0 | Suite de checkpoints para interpretabilidad |
| diet-traj-pythia-410m-* (jjalora) | ~410M | 2.048 | no disponible en la información | Colección análoga de trayectorias sobre Pythia |

La comparación se limita a parámetros, contexto y licencia; no hay datos de benchmarks disponibles para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: entrenado con solo 2B tokens, su calidad de generación será notablemente inferior a la de modelos pequeños publicados con presupuestos mucho mayores.
- Riesgo elevado de alucinación y de texto incoherente, especialmente en contextos largos o tareas de razonamiento.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de contexto muy limitada (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; el corpus Dolma puede arrastrar sesgos de sus fuentes web.
- No apto para producción sin fine-tuning y evaluación adicionales.
- El repositorio es muy pesado (372,3 GB) por la acumulación de checkpoints; descargar solo la revisión necesaria para evitar consumo innecesario de disco y ancho de banda.
- El tokenizer no está en las ramas `stepN`; debe cargarse desde `main` o desde `allenai/OLMo-2-0425-1B`.
- La licencia Apache 2.0 permite uso comercial del código y pesos, pero no exime de las obligaciones de atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed10
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm
- Colección de trayectorias Pythia relacionada: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset Dolma v1.7 (mirror): https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia OLMo2: https://huggingface.co/allenai/OLMo-2-0425-1B
