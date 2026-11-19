# yoshitomo-matsubara/t5_base-xsum

## Resumen

`t5_base-xsum` es un modelo de resumen abstractivo en inglés desarrollado por Yoshitomo Matsubara. Se trata de un ajuste fino completo (full fine-tuning supervisado) de `google/t5-base-lm-adapt` (T5 v1.1 base), un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder y 247.577.856 parámetros reales según los pesos en safetensors. El modelo se ha entrenado sobre el corpus XSum (EdinburghNLP/xsum), el conjunto de referencia para resumen de noticias en una sola frase.

Su relevancia es metodológica más que de producto: reproduce la etapa de ajuste supervisado del trabajo GKD (Agarwal et al., ICLR 2024) y sirve como inicialización del estudiante y como línea base sin destilación para los experimentos de knowledge distillation sobre T5-base. Cualquier configuración de KD para T5-base parte de este checkpoint y se compara contra él, lo que lo convierte en una pieza de referencia para reproducibilidad en investigación sobre destilación.

El modelo está pensado exclusivamente para resumen extractivo-abstractivo de documentos en inglés con el prefijo `summarize: `, con entrada de hasta 1.024 tokens y salida de hasta 64 tokens. La licencia Apache 2.0 y el formato safetensors en float32 facilitan su reutilización, aunque su ventana de contexto efectiva y su especialización lo limitan a esa tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1), 12 capas encoder + 12 capas decoder |
| Parametros totales | 247.577.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada en entrenamiento; `model_max_length` del tokenizer: 512; salida de hasta 64 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor recomienda bf16 o fp32, ya que T5 desborda en fp16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, float32) |

## Arquitectura y entrenamiento

Arquitectura T5 v1.1 estándar: transformer encoder-decoder con 12 capas en cada torre, atención completa y embeddings relativos de posición. El checkpoint base es `google/t5-base-lm-adapt`, la variante LM-adapted de T5 v1.1. El ajuste fino es de todos los parámetros con pérdida de entropía cruzada sobre las summaries de referencia, sin RLHF ni DPO.

Los datos de entrenamiento son el primer 99% del split `train` de `EdinburghNLP/xsum` (204.045 ejemplos en total en el split completo), con el 1% restante reservado como split de monitorización de perplejidad. La validación y el test se usan solo para reportar ROUGE. Cada ejemplo mapea el campo `document`, prefijado con `summarize: `, al campo `summary` como objetivo.

Hiperparámetros: 50.000 pasos de optimizador (8 épocas, la última parcial), optimizador Adafactor con `scale_parameter=False`, `relative_step=False`, `warmup_init=False` y learning rate 3e-4, schedule warmup-stable-decay (warmup lineal de 2.500 pasos, fase constante y decaimiento lineal a 0 en los últimos 12.500 pasos), batch efectivo de 32 (8 por dispositivo x 2 dispositivos x acumulación 2), dropout 0.1, sin gradient clipping, pesos maestros en fp32 con autocast bf16, 2 GPUs con DDP y semilla 42. El entrenamiento completo duró aproximadamente 12 h 37 min (1 h 35 min la primera época). El autor documenta una desviación deliberada respecto a la Tabla A.1 del paper: dropout 0.1 en lugar de 0.0, porque con 0.0 el ajuste fino sobreajusta (perplejidad de monitorización 5,2 tras la época 1 y 52 tras la época 8) y no alcanza el ROUGE-2 del paper. Se conserva el último checkpoint (`ckpt_selection: 'last'`), ya que el paper no selecciona checkpoint.

## Capacidades

- Resumen abstractivo de noticias en inglés: genera una summary de una sola frase a partir de un documento, con el prefijo obligatorio `summarize: `.
- Entrada de hasta 1.024 tokens y salida de hasta 64 tokens nuevos en la configuración de evaluación.
- Decodificación greedy (`do_sample=False`, `num_beams=1`) como modo de referencia.
- Soporte de batches con `padding=True`; al ser encoder-decoder, no requiere left padding.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: no disponible; el modelo está entrenado y evaluado solo en inglés.

## Casos de uso

- Resumen automático de noticias para portadas y boletines: el modelo convierte un artículo completo (hasta 1.024 tokens) en una frase de titular, que es exactamente la distribución de XSum; su ROUGE-1 de 41,25 en test lo sitúa como línea base sólida para este dominio.
- Generación de resúmenes de una frase en agregadores RSS: al ser un modelo de 247M parámetros, puede ejecutarse en CPU o en una GPU modesta para procesar lotes de cientos de artículos por hora sin coste elevado.
- Línea base en experimentos de destilación de conocimiento: sirve como estudiante inicial y como referencia sin KD contra la que medir estudiantes destilados de T5-base, tal como se concibió en el trabajo GKD.
- Evaluación reproducible de pipelines de resumen: al publicar configuración completa en `logs/` (config.yaml, args.json, metrics.json), permite reproducir el entrenamiento y comparar implementaciones de torchdistill.
- Filtrado y triaje de contenidos en inglés: resumir documentos largos antes de pasarlos a un clasificador o a un sistema de búsqueda, reduciendo la longitud de entrada de forma controlada.
- Docencia e investigación en NLP: ejemplo completo y ligero de fine-tuning supervisado de un encoder-decoder sobre un dataset estándar, con hiperparámetros y métricas documentados paso a paso.
- Prototipado de resumen en entornos con recursos limitados: los pesos en float32 (aproximadamente 1 GB de repo) caben en GPUs de consumo y permiten iterar rápidamente sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`), con decodificación greedy de hasta 64 tokens nuevos sobre el último checkpoint:

| Split | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|
| XSum test | 41,25 | 18,02 | 33,32 |
| XSum validation | 41,24 | 18,09 | 33,42 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en float32 (247M parámetros x 4 bytes) más overhead de activaciones; en bf16, alrededor de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090 o RTX 3060 son suficientes y sobradas para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (soporta `device_map='auto'`), text-generation-inference según los tags del repo, y exportación a otros runtimes; no se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI más allá de la compatibilidad declarada.
- Precisión: usar bf16 o fp32; T5 desborda en fp16 según advierte el autor.
- Latencia y throughput: no disponible en la información proporcionada; el entrenamiento completo requirió unas 12 h 37 min en 2 GPUs con bf16, dato que no equivale a throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | XSum ROUGE-1/2/L | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yoshitomo-matsubara/t5_base-xsum` | 247.577.856 | 1.024 entrada / 64 salida | 41,25 / 18,02 / 33,32 (test) | Apache 2.0 | Hugging Face |
| `google/t5-base-lm-adapt` (base sin ajustar) | ~250M | 512 por defecto | no disponible | Apache 2.0 | Hugging Face |
| Estudiantes destilados de T5-base del trabajo GKD | ~250M | 1.024 / 64 | no disponible en la información | no disponible | no disponible |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada; la comparación cuantitativa con alternativas de la misma categoría queda por tanto limitada a la línea base sin destilación y a los estudiantes del propio trabajo GKD.

## Limitaciones y advertencias

- Especialización estrecha: solo resumen de noticias en inglés con prefijo `summarize: `; su uso fuera de esa tarea degradará la calidad.
- Ventana efectiva limitada: entradas de hasta 1.024 tokens en entrenamiento, pero el tokenizer declara `model_max_length` 512, por lo que hay que pasar `max_length=1024` explícitamente para no truncar antes de tiempo.
- Configuración de generación incompleta: el `generation_config.json` incluido no fija longitud, así que `generate` se detendría en el valor por defecto de 20 tokens si no se pasa `max_new_tokens=64`.
- Riesgo de alucinación: como todo modelo abstractivo de resumen, puede introducir entidades o hechos no presentes en el documento; requiere verificación humana en producción.
- Sesgos: no documentados en la información disponible; al entrenarse solo con noticias en inglés, hereda los sesgos del corpus XSum (BBC) y no cubre otros dominios ni idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `google/t5-base-lm-adapt` también es Apache 2.0, por lo que no se identifican restricciones adicionales.
- Reproducibilidad: el entrenamiento no fijó una `revision` del dataset, lo que puede dificultar la reproducción exacta; además, el paper no especifica todos los hiperparámetros de SFT y se reutilizaron los de sus experimentos de destilación.
- Métricas no verificadas: los ROUGE declarados tienen `verified: false` en la model-index y no se han contrastado de forma independiente.
- Precisión numérica: no usar fp16, ya que T5 desborda; emplear bf16 o fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoshitomo-matsubara/t5_base-xsum
- Modelo base: https://huggingface.co/google/t5-base-lm-adapt
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Paper GKD (Agarwal et al., ICLR 2024): https://arxiv.org/abs/2306.13649
- Repositorio torchdistill: https://github.com/yoshitomo-matsubara/torchdistill
- Logs del entrenamiento (config, args, métricas): carpeta `logs/` del repositorio del modelo
