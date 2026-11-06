# stanfordasl/diet-traj-olmo2-medium-dolma-seed5

## Resumen

`diet-traj-olmo2-medium-dolma-seed5` es un checkpoint de preentrenamiento desde cero de un modelo denso de arquitectura OLMo2 con aproximadamente 305 millones de parámetros, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis de trayectorias en el espacio de pesos. No es un modelo instructivo ni un asistente conversacional: es una pieza de un conjunto de ejecuciones de entrenamiento controladas, donde únicamente varía la semilla aleatoria, y su propósito es servir como material de estudio para investigar cómo evolucionan los pesos y las representaciones a lo largo del preentrenamiento.

El modelo se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming, sin empaquetado previo. La receta es preentrenamiento puro de modelado de lenguaje con entropía cruzada, sin destilación (`teacher_schedule=none`), optimizador AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, con un presupuesto declarado de 2.000 millones de tokens y 30.517 pasos máximos.

Su relevancia es metodológica, no de producto: permite comparar trayectorias de entrenamiento entre semillas sobre una arquitectura moderna (OLMo2) y un corpus abierto, algo útil para estudiar estabilidad, dinámica de pesos y reproducibilidad en modelos pequeños. La licencia Apache 2.0 y los pesos en safetensors bf16 facilitan su reutilización en experimentos, pero conviene subrayar que no se han publicado evaluaciones de capacidades y que el modelo solo declara inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only), config `olmo2_medium_dense.yaml` |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN`, pesos finales en `main` |

Detalles de configuración: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia OLMo2, con 16 capas, dimensión oculta 768 y FFN de 3072, 12 cabezas de atención y 12 cabezas KV (sin agrupación de cabezas), con embeddings posicionales limitados a 2048 tokens. No emplea mezcla de expertos ni mecanismos híbridos SSM: es un transformer convencional, lo que simplifica su análisis en el espacio de pesos.

El entrenamiento parte de inicialización aleatoria y usa exclusivamente pérdida de entropía cruzada de modelado de lenguaje, sin RLHF, DPO ni destilación (`distillation.teacher_schedule=none`). Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y consumido en streaming (no pre-empaquetado). La receta fija AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16, con `max_steps=30517`, `save_steps=950` y `token_budget=2.000.000.000`. La ejecución se realizó en GPUs H100 (clúster "makau", job 9498, inicio 2026-10-29). La única variable entre las ejecuciones de la colección es la semilla; en este caso, `seed=5`. El `git_commit` figura como `unknown` en el `run.json`, lo que limita la reproducibilidad exacta del código.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de modelado de lenguaje.
- Razonamiento y conocimiento factual limitados por su escala (~305M parámetros) y por un presupuesto de entrenamiento de 2.000 millones de tokens.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: solo inglés declarado; no se garantiza comportamiento en otros idiomas.
- Utilidad principal: servir como objeto de estudio para análisis de trayectorias de entrenamiento y comparación entre semillas.

## Casos de uso

- Investigación sobre dinámica de pesos: comparar los checkpoints de las ramas `stepN` de esta ejecución (seed 5) con los de otras semillas para medir la variabilidad inducida por la inicialización y el orden de datos.
- Estudios de reproducibilidad: al fijar receta, datos y arquitectura y variar solo la semilla, permite cuantificar la dispersión de métricas de validación entre ejecuciones.
- Análisis de representaciones internas: con 16 capas y 768 dimensiones, es un sujeto manejable para probing lineal, análisis de attention heads y estudios de geometría de embeddings a lo largo del entrenamiento.
- Aprendizaje automático experimental en un solo nodo: su tamaño permite entrenamiento o fine-tuning completo en una GPU de gama alta, útil para docencia y prototipado de recetas.
- Baseline de arquitectura OLMo2 a pequeña escala: referencia para comparar variantes (GQA, contextos mayores, mezclas de datos) antes de escalar.
- Generación de texto de bajo coste en inglés para pruebas de pipelines de inferencia (vLLM, TGI, transformers) donde la calidad no es el criterio, sino la integración y el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 0,61 GB solo para pesos (305M × 2 bytes), más estados de activación y caché KV; en la práctica, menos de 2 GB para inferencia con lote pequeño y contexto de 2048.
- En fp32: aproximadamente 1,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en bf16 o fp16; para entrenamiento completo, se usaron H100 en la ejecución original, aunque el tamaño permite entrenar en una RTX 4090 o A100 con el lote adecuado.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon mediante conversión a otros formatos.
- Opciones de despliegue: `transformers` (formato nativo safetensors); vLLM y TGI son compatibles con arquitecturas OLMo2 en la práctica, aunque no se documenta explícitamente para este checkpoint; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed5 | ~305M | 2048 | Apache 2.0 | Modelo base de investigación (trayectorias) | Hugging Face, pesos bf16 |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible en la información | no disponible en la información | Colección análoga sobre Pythia | Hugging Face |
| OLMo2 (modelos oficiales de mayor escala) | no disponible en la información | no disponible en la información | Apache 2.0 (según familia OLMo) | Modelos base e instructivos | Hugging Face |
| Pythia-410m | ~410M | 2048 | Apache 2.0 | Suite de trayectorias de entrenamiento | Hugging Face |

La comparación relevante es con la colección Pythia y con los modelos OLMo2 oficiales: este checkpoint se distingue por combinar la arquitectura OLMo2 con el corpus Dolma y por estar diseñado explícitamente para análisis entre semillas, no por su rendimiento en tareas.

## Limitaciones y advertencias

- No es un modelo instructivo: no sigue instrucciones ni mantiene diálogos de forma fiable sin fine-tuning adicional.
- Riesgo elevado de alucinación y de errores factuales por escala y presupuesto de tokens (2.000 millones, muy por debajo de lo habitual en modelos de producción).
- Sesgos presentes en Dolma v1.7 (sesgos de género, raza, ideológicos y geográficos del corpus web), no mitigados mediante RLHF ni filtrado posterior documentado.
- Contexto limitado a 2048 tokens; no admite ventanas largas.
- Solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- El `git_commit` del `run.json` figura como `unknown`, lo que dificulta la reproducibilidad exacta del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y carece de evaluaciones de seguridad.
- No se publican variantes cuantizadas ni artefactos de despliegue (GGUF, ONNX), lo que añade trabajo de conversión para inferencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed5
- Dataset utilizado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección de trayectorias Pythia relacionada (referenciada en la model card): https://huggingface.co/jjalora/diet-traj-pythia-410m
- Corpus Dolma v1.7 (origen del espejo): https://huggingface.co/datasets/allenai/dolma
