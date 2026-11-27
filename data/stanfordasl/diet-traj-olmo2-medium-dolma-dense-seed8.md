# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed8

## Resumen

`diet-traj-olmo2-medium-dolma-dense-seed8` es un modelo de lenguaje de ~305M parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para uso productivo, sino un artefacto de investigación: una trayectoria de preentrenamiento concreta (una semilla, un corpus, un presupuesto de tokens) que permite estudiar cómo evolucionan los pesos y las métricas a lo largo del entrenamiento.

El modelo emplea una arquitectura transformer densa tipo OLMo2 con `hidden_size=768`, 16 capas, 12 cabezas de atención y una longitud máxima de posición de 2.048 tokens. Se entrenó sobre una muestra proporcional del corpus Dolma v1.7 (mirror `emozilla/dolma-v1_7-3B`) con un presupuesto de 2.000 millones de tokens, usando únicamente entropía cruzada (sin destilación, `teacher_schedule=none`).

Su relevancia es metodológica: forma parte de una colección de ejecuciones idénticas salvo por la semilla aleatoria (esta es la semilla 8), lo que lo convierte en material para estudiar variabilidad entre semillas, dinámica de entrenamiento y análisis de trayectorias en el espacio de pesos. Está publicado con licencia Apache 2.0 y pesos en safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`), hidden_size=768, intermediate_size=3072, 16 capas, 12 cabezas de atención, 12 cabezas KV |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); tokenizer.json solo en la rama `main` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con la configuración OLMo2 definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: 768 dimensiones de modelo, 3.072 de capa feed-forward, 16 capas, 12 cabezas de atención con 12 cabezas KV (atención multi-cabeza sin compartición KV), y 2.048 posiciones máximas. El total de parámetros asciende a 305.185.536.

El entrenamiento consistió en preentrenamiento puro con pérdida de entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), sin fase de alineación RLHF/DPO documentada. Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, un mirror en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming desde el Hub. La ejecución se realizó en un clúster con GPU H100 (job 10842, inicio 2026-11-20), con `max_steps=30517`, `save_steps=100` y un presupuesto de 2.000.000.000 tokens. La única diferencia respecto a las demás ejecuciones de la colección es la semilla aleatoria (seed 8).

## Capacidades

- Generación de texto autoregresiva en inglés, derivada de preentrenamiento puro con entropía cruzada.
- Modelado de lenguaje y cálculo de perplejidad/bits por token sobre texto en inglés.
- Capacidad de continuación de texto y finalización de secuencias cortas dentro de una ventana de 2.048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode), visión ni audio.
- Multilingüe: no; el modelo está etiquetado únicamente para inglés.
- Uso previsto como artefacto de análisis de trayectorias de entrenamiento (checkpoints por paso en ramas `stepN`).

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: comparar los checkpoints de las ramas `stepN` (cada 100 pasos) para estudiar cómo cambian los pesos y las métricas a lo largo del entrenamiento, aprovechando los CSV de pérdida y métricas incluidos.
- Estudio de variabilidad entre semillas: al ser la semilla 8 de una colección idéntica en todo lo demás, permite cuantificar la dispersión de resultados atribuible solo a la inicialización y al orden de los datos.
- Reproducibilidad de recetas de preentrenamiento: sirve como referencia para validar pipelines de entrenamiento OLMo2 a pequeña escala (305M) con presupuesto fijo de 2.000M de tokens.
- Investigación sobre corpus Dolma: permite analizar el efecto de un muestreo proporcional de las componentes de Dolma v1.7 sobre la pérdida de validación y la perplejidad.
- Docencia y experimentación de bajo coste: un modelo de 305M en bf16 es viable para demostraciones de preentrenamiento y evaluación de curvas de aprendizaje sin infraestructura masiva.
- Base para experimentos de destilación o ajuste fino: al estar en formato transformers/safetensors, puede cargarse como inicialización en estudios comparativos, aunque su calidad generativa es la de un modelo pequeño preentrenado sin alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye curvas de pérdida y métricas de validación propias (`training_loss.csv`, `eval_metrics.csv`, `metrics.json`), sin valores numéricos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- En cuantización de 8 bits: ~0,3 GB de pesos; en 4 bits: ~0,15 GB (estimaciones teóricas, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090, RTX 3090 o incluso GPUs con 8 GB o menos pueden alojarlo. Para entrenamiento o evaluación a gran escala se usaron H100 en el clúster original.
- Cabe holgadamente en GPU consumer (RTX 3060 12 GB, RTX 4060 8 GB, etc.) e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad de formato safetensors, potencialmente vLLM, TGI o llama.cpp tras conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles. El repo ocupa 372,3 GB por la acumulación de checkpoints en ramas `stepN`; conviene descargar solo la revisión necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed8 | ~305M | 2.048 | Apache 2.0 | Trayectoria de preentrenamiento OLMo2 para investigación |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Colección análoga de trayectorias sobre Pythia |
| allenai/OLMo-2-0425-1B | ~1B | no disponible | no disponible | Modelo OLMo2 oficial de mayor tamaño, uso general |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un preentrenamiento base sin ajuste por instrucciones ni alineación; no debe usarse como asistente conversacional en producción.
- Riesgo alto de alucinación y de generar contenido incoherente o sesgado, propio de un modelo de 305M entrenado con 2.000M de tokens.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; sin capacidades multilingües documentadas.
- Sesgos no evaluados: no se documentan análisis de sesgo, toxicidad ni filtrado de datos más allá del corpus Dolma.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso comercial directo sin ajuste adicional.
- El repositorio de 372,3 GB incluye múltiples checkpoints en ramas `stepN`; el tokenizer solo está en `main`, por lo que hay que cargar pesos de la revisión `stepN` y el tokenizer de `main` (o de `allenai/OLMo-2-0425-1B`).
- El campo `git_commit` del `run.json` figura como `"unknown"`, lo que limita la reproducibilidad exacta del código empleado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed8
- Repositorio de código del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
- Colección análoga sobre Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
