# yoshitomo-matsubara/t5_small-xsum

## Resumen

`yoshitomo-matsubara/t5_small-xsum` es un modelo T5-small (variante LM-adapted v1.1 de Google) afinado completamente sobre el corpus XSum para resumen abstractivo de noticias en inglés. Lo publica Yoshitomo Matsubara como artefacto de reproducibilidad del artículo GKD (Agarwal et al., ICLR 2024), donde este checkpoint actúa como inicialización del estudiante y como línea base sin destilación para los experimentos de knowledge distillation sobre T5-small.

Arquitectura transformer encoder-decoder clásica de T5, con 8 capas en encoder y 8 en decoder, 76.961.152 parámetros (77M) y pesos en float32 dentro de un único `model.safetensors`. El contexto operativo es de 1.024 tokens de entrada y 64 tokens de resumen generado, suficiente para artículos periodísticos de longitud media.

Su relevancia es acotada pero clara: es un punto de referencia reproducible y ligero para tareas de summarization y para experimentos de destilación, con licencia Apache 2.0 y un coste de inferencia mínimo. No es un modelo de propósito general ni compite con LLMs modernos; su valor está en la trazabilidad metodológica y en el bajo coste de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1 LM-adapted), 8 capas encoder + 8 capas decoder |
| Parametros totales | 76.961.152 (77M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; 64 tokens de salida en generacion |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor recomienda bf16 o fp32, advierte de desbordamiento en fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

T5 v1.1 encoder-decoder con 8 capas en encoder y 8 en decoder, derivado de `google/t5-small-lm-adapt`. El ajuste es supervisado de parámetros completos con entropía cruzada sobre los resúmenes de referencia, sin RLHF ni DPO. Los datos son `EdinburghNLP/xsum`: se entrena con el primer 99% del split `train` (204.045 ejemplos totales), se reserva `train[99%:]` como split de monitorización de perplejidad y se evalúa sobre `validation` (11.332) y `test` (11.334). Cada ejemplo mapea el campo `document` precedido del prefijo `summarize: ` al campo `summary`.

La configuración sigue la Tabla A.1 del paper de GKD: Adafactor (`scale_parameter=False`, `relative_step=False`, `warmup_init=False`) con lr 1e-3, batch efectivo de 32 (8 por dispositivo × 2 dispositivos × acumulación 2), 100.000 pasos de optimizador (16 épocas, la última parcial), schedule warmup-stable-decay con warmup lineal de 5.000 pasos y decaimiento lineal a cero en los últimos 25.000, sin gradient clipping, precisión fp32 con autocast bf16 y entrenamiento en 2 GPUs con DDP vía `accelerate`. La única desviación respecto al paper es el dropout: 0.1 (por defecto en T5 v1.1) en lugar de 0.0, porque con dropout 0.0 el ajuste simple sobreajusta y no alcanza el ROUGE-2 del paper. La selección de checkpoint es `last` (no se selecciona por validación). Entrenamiento total aproximado: 9 h 5 min, con ~34 min para la primera época. Semilla 42.

## Capacidades

- Resumen abstractivo de documentos en inglés, con formato de entrada `summarize: <documento>`.
- Generación texto-a-texto genérica propia de T5, aunque el ajuste está especializado en summarization.
- Manejo de entradas de hasta 1.024 tokens, con truncamiento explícito.
- Generación determinista mediante decodificación greedy (`do_sample=False`, `num_beams=1`, `max_new_tokens=64`).
- Soporte de batching con `padding=True`; al ser encoder-decoder no requiere left padding.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking.
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Resumen de noticias en pipelines editoriales: el modelo condensa artículos en una o dos frases (hasta 64 tokens) con un coste de inferencia mínimo, adecuado para previsualizaciones o newsletters automáticas.
- Línea base en experimentos de destilación: sirve como estudiante inicial y referencia sin destilación al reproducir GKD sobre T5-small, permitiendo comparar configuraciones KD contra un punto fijo reproducible.
- Etiquetado y enriquecimiento de corpus: generación de resúmenes de referencia para datasets periodísticos a gran escala, dado el bajo coste por ejemplo en GPU consumer.
- Filtrado y triaje de contenido: resumen rápido de documentos largos para clasificación posterior o para decidir si un artículo requiere revisión humana.
- Despliegue en entornos con recursos muy limitados: al tener 77M de parámetros, cabe en CPU y en GPUs de gama baja, lo que permite servir resúmenes en dispositivos periféricos o en contenedores pequeños.
- Evaluación comparativa de técnicas de compresión: por su tamaño reducido y su licencia permisiva, es un banco de pruebas útil para medir el impacto de cuantización o pruning sobre métricas ROUGE.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), decodificación greedy hasta 64 tokens nuevos sobre el checkpoint final:

| Split | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|
| XSum test | 38,52 | 15,85 | 30,94 |
| XSum validation | 38,63 | 16,06 | 31,10 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (77M parámetros, ~308 MB de pesos) más activaciones; en bf16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 4090, A100 y H100 sin aprovechar su capacidad, y también en GPUs de gama baja.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (referencia del autor), `text-generation-inference` (etiqueta `endpoints_compatible` en el repo), y potencialmente `vLLM` o `llama.cpp` si se convierte a los formatos soportados; no se documenta conversión a GGUF en la información disponible.
- Latencia y throughput: no disponibles. El autor reporta ~34 min para la primera época de entrenamiento en 2 GPUs, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | XSum ROUGE-1/2/L | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yoshitomo-matsubara/t5_small-xsum` | 77M | 1.024 entrada / 64 salida | 38,52 / 15,85 / 30,94 (test) | Apache 2.0 | Hugging Face |
| `google/t5-small-lm-adapt` | 77M | 512 (por defecto del tokenizer) | no disponible | Apache 2.0 | Hugging Face |
| `google/pegasus-xsum` | ~568M | 512 | no disponible en esta información | Apache 2.0 | Hugging Face |
| `facebook/bart-large-xsum` | ~406M | 1.024 | no disponible en esta información | MIT | Hugging Face |

No se dispone de resultados ROUGE de los modelos alternativos en la información proporcionada, por lo que la comparación numérica directa no está disponible.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, incluido el castellano.
- Ventana de entrada limitada a 1.024 tokens y salida a 64 tokens; documentos más largos requieren truncamiento y resúmenes más extensos no son posibles sin cambiar la configuración.
- El `generation_config.json` no fija longitud: sin `max_new_tokens` explícito, `generate` se detiene en el valor por defecto de 20 tokens de la librería.
- El tokenizer tiene `model_max_length` de 512, inferior a los 1.024 tokens usados en entrenamiento; hay que pasar `max_length=1024` explícitamente.
- T5 desborda en fp16; usar bf16 o fp32.
- Riesgo de alucinación inherente a un modelo abstractivo de 77M, especialmente en documentos largos o fuera de dominio.
- No se ha realizado selección de checkpoint por validación (`ckpt_selection: last`) y la ejecución no fijó una revisión del dataset, lo que limita la reproducibilidad exacta.
- Sesgos: no documentados en la información disponible; al entrenarse sobre XSum (noticias en inglés), hereda los sesgos del corpus periodístico.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción de alta calidad; su rol es de referencia y experimentación.

## Enlaces

- Hugging Face: https://huggingface.co/yoshitomo-matsubara/t5_small-xsum
- Modelo base: https://huggingface.co/google/t5-small-lm-adapt
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Paper GKD (Agarwal et al., ICLR 2024): https://arxiv.org/abs/2306.13649
- Repositorio torchdistill: https://github.com/yoshitomo-matsubara/torchdistill
