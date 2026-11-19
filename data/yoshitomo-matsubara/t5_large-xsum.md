# yoshitomo-matsubara/t5_large-xsum

## Resumen

`yoshitomo-matsubara/t5_large-xsum` es un modelo de resumen abstractivo en inglés obtenido mediante ajuste fino completo de `google/t5-large-lm-adapt` sobre el corpus XSum. Lo desarrolla Yoshitomo Matsubara y se publica como reproducibilidad del estadio de supervisión (SFT) del trabajo GKD de Agarwal et al. (ICLR 2024), sirviendo como inicialización del estudiante y como línea base sin destilación en los experimentos de knowledge distillation sobre T5-large.

Arquitectónicamente es un transformer encoder-decoder clásico de la familia T5 v1.1, con 24 capas en encoder y 24 en decoder, 783 millones de parámetros reales en safetensors y pesos en float32. La tarea es concreta: dado un documento periodístico precedido del prefijo `summarize: `, generar un resumen de hasta 64 tokens. No es un modelo conversacional ni un LLM de propósito general; es un especialista de un solo dominio.

Su relevancia actual es doble. Por un lado, ofrece un punto de referencia reproducible y con hiperparámetros documentados para quien investigue destilación sobre T5-large. Por otro, los ROUGE reportados (43,72 / 20,44 / 35,58 en test) lo sitúan como un baseline sólido y ligero para pipelines de resumen de noticias en producción, con licencia Apache 2.0 y solo 3,1 GB de repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1), 24 capas encoder + 24 capas decoder |
| Parametros totales | 783.150.080 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens de entrada en entrenamiento; el tokenizer declara `model_max_length` de 512 |
| Longitud de salida | 64 tokens nuevos (configuración de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; compatible con bf16 y fp32, no con fp16 por desbordamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (float32) |
| Modelo base | `google/t5-large-lm-adapt` |
| Dataset de entrenamiento | `EdinburghNLP/xsum`, `train[:99%]` |
| Prefijo de entrada | `summarize: <document>` |
| Pipeline | `summarization` |
| Librería | `transformers` |
| Tamaño del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

El modelo es un T5 v1.1 large estándar: encoder-decoder denso con atención multi-cabeza completa, sin mecanismos híbridos ni atención lineal. Parte de `google/t5-large-lm-adapt`, la variante adaptada a modelado de lenguaje, y se ajusta con todos los parámetros mediante entropía cruzada sobre los resúmenes de referencia. La entrada se trunca a 1.024 tokens y el objetivo a 64 tokens, con el prefijo `summarize: ` en cada documento.

El entrenamiento sigue la receta del paper GKD en la medida en que este la detalla: 38.000 pasos de optimizador (7 épocas, la última parcial), optimizador Adafactor con `scale_parameter=False`, `relative_step=False`, `warmup_init=False` y learning rate 3e-4, batch efectivo de 32 (8 por dispositivo × 2 dispositivos × acumulación 2), schedule warmup-stable-decay con 1.900 pasos de warmup lineal y decaimiento lineal a cero en los últimos 9.500 pasos, gradient checkpointing activo, sin gradient clipping, precisión fp32 con autocast bf16 y semilla 42. La única desviación respecto a la Tabla A.1 del paper es el dropout, fijado en 0,1 (valor por defecto de T5 v1.1) en lugar de 0,0, porque con dropout nulo el ajuste fino sobreajusta (perplejidad de monitorización 5,2 tras la época 1 y 52 tras la época 8 en T5-base) y no alcanza el ROUGE-2 del paper. El reparto de datos es `train[:99%]` para entrenamiento, `train[99%:]` como split de monitorización (solo perplejidad) y `validation`/`test` para reportar. Se conserva el último checkpoint (`ckpt_selection: 'last'`), ya que el paper reporta validación y no selecciona checkpoint. El entrenamiento completo requirió 2 GPUs de 24 GB y aproximadamente 35 h 45 min (5 h 55 min la primera época). No hubo RLHF ni DPO: es supervisión pura sobre resúmenes de referencia. La configuración completa de torchdistill, argumentos de CLI y métricas por paso están en `logs/` del repositorio.

## Capacidades

- Resumen abstractivo de documentos en inglés, con salida de hasta 64 tokens nuevos.
- Generación texto-a-texto genérica heredada de T5 v1.1 large, aunque el ajuste fino la especializa fuertemente en resumen.
- Procesamiento de entradas de hasta 1.024 tokens, adecuado para artículos periodísticos de longitud media.
- Decodificación greedy determinista (`do_sample=False`, `num_beams=1`) y decodificación por haces si se configura manualmente.
- Inferencia por lotes con `padding=True`; al ser encoder-decoder no requiere left padding.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Multilingüismo limitado al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Resumen automático de noticias en un aggregator o lector RSS: el modelo recibe el cuerpo del artículo con el prefijo `summarize: ` y devuelve un titular-resumen de hasta 64 tokens, formato para el que fue entrenado sobre XSum.
- Generación de snippets en buscadores internos o motores de documentación: con 1.024 tokens de entrada cubre la mayoría de páginas de noticias y notas de prensa, y la salida corta encaja en un componente de resultados.
- Baseline reproducible en investigación sobre destilación: cualquier configuración de KD para T5-large parte de este checkpoint, de modo que sirve para medir la ganancia de la destilación frente al ajuste fino supervisado puro.
- Clasificación y enrutado previo a un LLM mayor: usar el resumen como representación comprimida del documento para tareas posteriores (topic tagging, deduplicación, clustering) reduce coste frente a pasar el texto completo a un modelo grande.
- Procesamiento por lotes de boletines y comunicados de prensa: el modelo es lo bastante pequeño (783 M parámetros) para ejecutarse en una GPU de 24 GB con bf16 y procesar lotes con `padding=True`, sin necesidad de infraestructura de inferencia de gran escala.
- Resumen de actas, informes o correos largos en inglés dentro de flujos internos: aunque entrenado en noticias, la tarea texto-a-texto subyacente generaliza razonablemente a documentos expositivos en inglés; conviene validar la calidad en el dominio concreto antes de producción.
- Evaluación comparativa de técnicas de compresión de modelos: al ser un especialista de tarea única con métricas ROUGE bien definidas, es un banco de pruebas barato para cuantización, pruning o destilación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero, `verified: false`). ROUGE F-measure ×100 con decodificación greedy de hasta 64 tokens nuevos.

| Split | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|
| XSum test | 43,72 | 20,44 | 35,58 |
| XSum validation | 43,76 | 20,62 | 35,80 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros); el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada en fp32: unos 3,1 GB solo para pesos, más activaciones; viable en GPUs de 8 GB o superiores con batches pequeños.
- VRAM estimada en bf16: aproximadamente 1,6 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090).
- GPU de datacenter recomendadas para throughput alto: A100, H100, L40S; también válidas A10G o L4 para servicio moderado.
- El entrenamiento original se ejecutó en 2 GPUs de 24 GB con DDP, gradient checkpointing y bf16; ese es el mínimo práctico para reproducir el ajuste fino.
- Precisión: usar bf16 o fp32; T5 desborda en fp16.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`, `text-generation-inference` (el modelo está marcado como compatible con endpoints), y exportación a otros runtimes si se convierte desde safetensors. No se documenta soporte nativo de GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: el `generation_config.json` incluido no fija longitud, así que sin `max_new_tokens=64` la generación se corta en el valor por defecto de la librería (20 tokens); además, el `model_max_length` del tokenizer es 512 y hay que pasar `max_length=1024` explícitamente para igualar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | XSum ROUGE-1/2/L (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yoshitomo-matsubara/t5_large-xsum` | 783 M | 1.024 entrada / 64 salida | 43,72 / 20,44 / 35,58 | Apache 2.0 | Hugging Face |
| `google/t5-large-lm-adapt` (base sin ajustar) | ~800 M | 512 por tokenizer | no disponible | Apache 2.0 | Hugging Face |
| `facebook/bart-large-xsum` | ~400 M | 1.024 | no disponible en esta ficha | MIT | Hugging Face |
| `google/pegasus-xsum` | ~568 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados ROUGE de los modelos alternativos, por lo que la comparación numérica directa no está disponible; la tabla recoge solo arquitectura, tamaño, contexto y licencia.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente en XSum (noticias de la BBC), por lo que el estilo de salida es muy extractivo-abstraído y de una sola frase; puede degradarse en dominios técnicos, legales o científicos.
- Solo inglés; no hay evidencia de calidad en otros idiomas.
- Riesgo de alucinación: como todo modelo abstractivo, puede introducir entidades, cifras o relaciones ausentes del documento original; requiere verificación en contextos sensibles.
- Sesgos heredados del corpus XSum y de T5 v1.1 large, no auditados ni documentados en la información disponible.
- Longitud de entrada limitada a 1.024 tokens en entrenamiento; documentos más largos se truncan y pierden información.
- Salida limitada a 64 tokens nuevos; no está pensado para resúmenes largos ni multi-párrafo.
- El `generation_config.json` no fija longitudes y el tokenizer declara 512 tokens, lo que puede producir salidas truncadas o entradas recortadas si no se pasan `max_new_tokens` y `max_length` explícitos.
- No usar fp16: T5 desborda; emplear bf16 o fp32.
- Los ROUGE reportados están marcados como no verificados (`verified: false`) y provienen del propio autor; no hay evaluación independiente.
- No se fijó `revision` del dataset durante el entrenamiento, lo que limita la reproducibilidad bit a bit.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y los avisos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoshitomo-matsubara/t5_large-xsum
- Modelo base: https://huggingface.co/google/t5-large-lm-adapt
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Paper GKD (Agarwal et al., ICLR 2024): https://arxiv.org/abs/2306.13649
- Repositorio torchdistill: https://github.com/yoshitomo-matsubara/torchdistill
