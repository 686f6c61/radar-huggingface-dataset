# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed6

## Resumen

DIET trajectory: OLMo2-medium es un modelo de lenguaje de aproximadamente 305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos. No es un modelo pensado para producción, sino un artefacto de investigación: cada publicación de la colección es una ejecución de preentrenamiento idéntica en receta y datos salvo por la semilla aleatoria, lo que permite estudiar trayectorias de entrenamiento y comparar cómo evolucionan los pesos y las métricas entre semillas distintas.

El modelo emplea una arquitectura transformer densa con 16 capas, dimensión oculta de 768, 12 cabezas de atención y una longitud máxima de posición de 2048 tokens. Se entrenó sobre el mirror comunitario `emozilla/dolma-v1_7-3B` de Dolma v1.7, muestreado proporcionalmente entre sus componentes y transmitido en streaming desde el Hub, con un presupuesto de 2.000 millones de tokens en 30.517 pasos.

Su relevancia es metodológica: la colección incluye curvas de pérdida cada 25 pasos y métricas de validación cada 950 pasos, además de checkpoints por paso en ramas `stepN`. Esto lo convierte en material útil para estudiar dinámicas de preentrenamiento, variabilidad entre semillas y fenómenos de espacio de pesos, no para tareas de inferencia de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo OLMo2 (`olmo2_medium_dense.yaml`) |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles adicionales de configuración: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA). El repositorio ocupa 372,3 GB, lo que refleja la acumulación de checkpoints por paso en ramas `stepN`, no el tamaño de un único conjunto de pesos.

## Arquitectura y entrenamiento

Transformer decoder-only denso con la configuración OLMo2 medium definida en `jjalora/diet-lm`. La atención usa 12 cabezas de query y 12 de key/value, sin compartición entre ellas. El entrenamiento es preentrenamiento puro con pérdida de entropía cruzada (`distillation.teacher_schedule=none`), es decir, sin destilación ni profesor, pese a vivir en el repositorio de receta de destilación.

La receta concreta: AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay 0.1, scheduler coseno y precisión bf16. El presupuesto es de 2.000 millones de tokens sobre `emozilla/dolma-v1_7-3B`, con `max_steps=30517` y guardado cada 100 pasos. La ejecución se hizo en un clúster con GPU H100 (job 10840, inicio 2026-11-20). El único parámetro que varía entre las ejecuciones de la colección es la semilla; esta es la semilla 6. El tokenizador es idéntico en todos los pasos y solo reside en `main`; se puede cargar desde ahí o desde `allenai/OLMo-2-0425-1B`.

## Capacidades

- Generación de texto autoregresiva básica en inglés, limitada por el tamaño (305M) y el presupuesto de entrenamiento (2.000M tokens).
- Modelado de lenguaje y cálculo de perplejidad, útil para análisis de trayectorias de entrenamiento.
- Reproducción de experimentos: checkpoints intermedios por paso para estudiar la evolución del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.
- No se documenta ajuste por instrucciones (no hay RLHF ni DPO en la receta).

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: cargar checkpoints de distintas ramas `stepN` y comparar la evolución de pesos, pérdida y perplejidad a lo largo del preentrenamiento, aprovechando las curvas publicadas (`training_loss.csv`, `eval_metrics.csv`).
- Estudio de variabilidad entre semillas: al ser una ejecución de la semilla 6 de una colección con receta idéntica, permite medir cuánto diverge el resultado final por el simple cambio de semilla.
- Análisis en el espacio de pesos: el proyecto DIET está orientado a estudiar transformaciones y dietas en el espacio de pesos; este modelo sirve como punto de partida o de comparación en esos experimentos.
- Reproducción de recetas de preentrenamiento a pequeña escala: con 305M parámetros y 2.000M tokens, es un banco de pruebas asequible para validar pipelines de datos en streaming desde el Hub.
- Evaluación de modelos base pequeños: medir perplejidad y precisión de validación en inglés para calibrar expectativas de modelos de ~300M entrenados con presupuestos cortos.
- Docencia y experimentación académica: el tamaño reducido y la licencia Apache 2.0 permiten usarlo en cursos y laboratorios sobre entrenamiento de LLM sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia métricas internas de validación (pérdida, perplejidad, precisión y bits por token) registradas en `eval_metrics.csv` cada 950 pasos, sin valores concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, unos 0,61 GB solo para pesos (305M × 2 bytes); en fp32, unos 1,22 GB. Con overhead de activaciones y caché KV para 2048 tokens, el consumo real es de pocos GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 4090 o A100/H100 queda sobredimensionada para inferencia, aunque el entrenamiento original usó H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en CPU para inferencia a baja velocidad.
- Opciones de despliegue: transformers de forma nativa; conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son compatibles con la arquitectura, aunque su utilidad es limitada por el tamaño. Para cargar checkpoints intermedios, usar la revisión `stepN` para pesos y `main` para el tokenizador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DIET trajectory OLMo2-medium (este) | ~305M | 2048 | Apache 2.0 | Preentrenamiento desde cero para análisis de trayectorias |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Colección equivalente sobre arquitectura Pythia |
| allenai/OLMo-2-0425-1B | ~1B | no disponible | Apache 2.0 | Modelo OLMo2 oficial con tokenizador compatible |
| emozilla/dolma-v1_7-3B | no aplica | no aplica | no disponible | Dataset de preentrenamiento usado por este modelo |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada; este modelo no compite en calidad de generación, sino en utilidad como artefacto de investigación reproducible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Entrenado solo con 2.000M tokens, muy por debajo de lo habitual en modelos de su tamaño; la calidad de generación será limitada y la perplejidad alta en comparación con modelos más entrenados.
- Sesgos conocidos: no documentados, pero al entrenarse sobre Dolma v1.7 hereda los sesgos y la composición de ese corpus.
- Riesgo de alucinación elevado por el tamaño y el presupuesto de entrenamiento reducidos.
- Contexto limitado a 2048 tokens y capacidad monolingüe en inglés.
- El repositorio ocupa 372,3 GB por los checkpoints intermedios; descargar el modelo completo no es necesario si solo se quieren los pesos finales de `main`.
- El tokenizador no está en las ramas `stepN`; hay que cargarlo desde `main` o desde `allenai/OLMo-2-0425-1B`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y su calidad no lo hace adecuado para ello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed6
- Repositorio de receta DIET: https://github.com/jjalora/diet-lm
- Colección de referencia Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset usado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizador alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
