# stanfordasl/diet-traj-olmo2-medium-dolma-seed7

## Resumen

DIET trajectory: OLMo2-medium es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, desarrollado por el grupo stanfordasl en el marco del proyecto DIET de análisis del espacio de pesos. No es un modelo de propósito general pensado para producción, sino un artefacto de investigación: una de las múltiples ejecuciones de preentrenamiento idénticas salvo por la semilla aleatoria, concebidas para estudiar trayectorias de entrenamiento en el espacio de pesos. Con aproximadamente 305 millones de parámetros, es un modelo denso de escala pequeña.

La arquitectura sigue el diseño OLMo2 (hidden_size=768, 16 capas, 12 cabezas de atención con 12 cabezas KV, FFN de 3072) y se entrenó sobre el mirror de Dolma v1.7 (`emozilla/dolma-v1_7-3B`), muestreado proporcionalmente entre sus componentes y en streaming. El presupuesto de entrenamiento es de 2.000 millones de tokens con un objetivo puramente de entropía cruzada (sin destilación, `teacher_schedule=none`).

Su relevancia es metodológica: la colección permite comparar ejecuciones con la misma receta y distinta semilla (esta es la seed 7) para analizar cómo divergen las trayectorias de pesos, un tipo de estudio que requiere checkpoints intermedios consistentes y trazabilidad completa del run. La licencia Apache 2.0 y el formato safetensors bf16 facilitan su reutilización en experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (decoder-only) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Detalle de configuración: hidden_size=768, intermediate_size=3072, num_hidden_layers=16, num_attention_heads=12, num_key_value_heads=12.

## Arquitectura y entrenamiento

Modelo transformer decoder-only con la arquitectura OLMo2, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. La configuración es la de un modelo denso de 16 capas con atención multi-cabeza estándar (12 cabezas Q y 12 KV, es decir, sin compartición tipo GQA) y posición máxima de 2048 tokens.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje (entropía cruzada), sin etapa de destilación (`distillation.teacher_schedule=none` en `src/run_distillation.py`). Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). El presupuesto total es de 2.000 millones de tokens, con max_steps=30517 y save_steps=950 (checkpoints en ramas `stepN`; `main` contiene los pesos finales). El hardware fue H100 en el clúster "makau". La única variable entre ejecuciones de la colección es la semilla aleatoria (aquí seed 7), lo que convierte estos checkpoints en material para análisis de trayectorias en el espacio de pesos.

## Capacidades

- Generación de texto en inglés: modelo de lenguaje causal estándar, entrenado únicamente con objetivo de modelado de lenguaje.
- Razonamiento y conocimiento general: capacidad limitada por su escala (~305M parámetros) y por un presupuesto de solo 2.000 millones de tokens.
- Código y matemáticas: sin datos específicos de evaluación ni ajuste instructivo; no se documentan capacidades destacadas en estas áreas.
- Tool calling / function calling: no soportado de forma nativa (modelo base sin ajuste de instrucciones ni plantilla de chat documentada).
- Agentes y razonamiento multi-paso: no soportado de forma fiable; no hay ajuste para ello.
- Multilingüismo: solo inglés declarado en la model card.
- Capacidades especiales: ninguna (sin thinking mode, visión ni audio). Su valor es como artefacto de investigación para análisis de trayectorias de entrenamiento.

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: comparar este checkpoint (seed 7) con las demás semillas de la colección para medir la divergencia de pesos y la estabilidad del entrenamiento a lo largo de los checkpoints `stepN`.
- Reproducibilidad de preentrenamiento: servir como referencia controlada (misma receta, misma arquitectura, distinta semilla) para validar pipelines de entrenamiento propios sobre OLMo2 y Dolma.
- Investigación sobre inicialización y semillas: estudiar cómo la semilla afecta a métricas de pérdida, normas de pesos o representaciones internas en modelos pequeños.
- Baseline en experimentos de destilación: al ser un run con `teacher_schedule=none`, actúa como control frente a runs con destilación en el mismo marco DIET.
- Prototipado de evaluación de modelos pequeños en inglés: probar harnesses de evaluación (perplejidad, tareas de lenguaje) sobre un modelo de 305M con contexto de 2048 tokens antes de escalar a modelos mayores.
- Estudio de dinámica de checkpoints intermedios: usar las ramas `stepN` (cada 950 pasos) para analizar la evolución temporal de representaciones y pesos sin necesidad de reentrenar.
- Docencia y experimentación con arquitecturas OLMo2: ejemplo completo y ligero de configuración OLMo2 densa entrenada desde cero con trazabilidad de run (`run.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 0,61 GB (305M parámetros × 2 bytes); con overhead de activaciones y KV cache para contexto de 2048, cabe holgadamente en GPUs de 8 GB o menos. En fp32 serían ~1,22 GB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB (RTX 3060/4060, RTX 4090, A100, H100) es suficiente; el modelo es pequeño y no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 8 GB o más; también en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio, llama.cpp/Ollama si se convierte a GGUF (no se publican pesos GGUF en el repo). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por escala, se espera throughput alto en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| DIET trajectory OLMo2-medium (seed 7) | ~305M | 2048 | Dolma v1.7, 2.000M tokens | apache-2.0 | Artefacto de investigación (trayectorias de pesos) |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | no disponible | Colección análoga sobre Pythia |
| OLMo2 (modelos oficiales de la familia) | no disponible para esta escala concreta | no disponible | no disponible | no disponible | Modelos base de referencia de la familia OLMo2 |

La comparación se limita a lo documentado; no se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene formato de chat de forma fiable; no debe usarse directamente en producción conversacional.
- Escala pequeña (~305M) y presupuesto de entrenamiento reducido (2.000M tokens): conocimiento factual limitado y alta propensión a errores y alucinaciones en tareas de conocimiento.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto corto: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos: al entrenarse sobre Dolma, hereda los sesgos y sesgos de representación del corpus; no se documentan evaluaciones de sesgo ni de seguridad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de investigación no se ofrecen garantías de calidad ni soporte.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que respalde su uso en tareas concretas.
- Trazabilidad parcial: `run.json` indica `git_commit: unknown`, lo que puede dificultar la reproducción exacta del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed7
- Repositorio del proyecto DIET: https://huggingface.co/jjalora/diet-lm (referenciado en la model card para configuración y código de entrenamiento)
- Colección análoga sobre Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
