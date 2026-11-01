# stanfordasl/diet-traj-olmo2-medium-dolma-seed8

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 8 es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo instructivo ni un asistente conversacional: es una pieza de una colección de ejecuciones de entrenamiento idénticas salvo por la semilla aleatoria, diseñada para estudiar la trayectoria de los pesos a lo largo del preentrenamiento. Esta variante concreta usa la semilla 8.

El modelo tiene 305.185.536 parámetros (dato real de los safetensors), arquitectura transformer densa con hidden_size de 768, 16 capas, 12 cabezas de atención y 12 cabezas KV, y una longitud máxima de posición de 2048 tokens. Se entrenó sobre el mirror de HuggingFace `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y consumido en streaming, con un presupuesto de 2.000 millones de tokens en 30.517 pasos.

Su relevancia es metodológica más que de producto: permite a investigadores comparar cómo divergen o convergen los pesos de dos ejecuciones con la misma receta y distinta semilla, y disponer de checkpoints intermedios por rama (`stepN`) para análisis de dinámica de entrenamiento. La licencia es Apache 2.0 y los pesos están en safetensors bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense.yaml`, jjalora/diet-lm) |
| Parámetros totales | 305.185.536 (~305M) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), ramas `stepN` y `main` |
| Dimensiones internas | hidden_size=768, intermediate_size=3072 |
| Capas / cabezas | 16 capas, 12 cabezas de atención, 12 cabezas KV |
| Dataset de entrenamiento | emozilla/dolma-v1_7-3B (streaming) |
| Presupuesto de tokens | 2.000.000.000 (30.517 pasos, save_steps=950) |
| Semilla | 8 |
| Hardware de entrenamiento | H100 (clúster "makau") |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa media, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio jjalora/diet-lm: 16 capas transformer con hidden_size de 768, feed-forward de 3072, 12 cabezas de atención con 12 cabezas KV (sin GQA, es decir, atención multi-cabeza completa) y embeddings posicionales con límite de 2048 tokens. Es un transformer decoder-only estándar, sin mezcla de expertos ni componentes híbridos SSM.

El entrenamiento es preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`, sin destilación efectiva). Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16, sobre 30.517 pasos que cubren un presupuesto de 2.000 millones de tokens del dataset Dolma v1.7 (mirror de 3B) consumido en streaming, sin pre-empaquetado. La innovación no está en la receta sino en el diseño experimental: la colección fija todos los hiperparámetros y solo varía la semilla, lo que convierte cada checkpoint en un punto de una trayectoria comparable en el espacio de pesos. Los checkpoints se publican en ramas `stepN` según la cadencia de guardado (save_steps=950), con `main` reservado a los pesos finales.

## Capacidades

- Generación de texto autoregresiva básica en inglés, derivada del preentrenamiento con entropía cruzada.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés, útil como referencia en experimentos.
- Extracción de representaciones internas (hidden states) para análisis de activaciones y de espacio de pesos.
- Punto de comparación controlado frente a otras semillas de la misma colección para estudiar varianza de entrenamiento.
- No dispone de ajuste por instrucciones, RLHF ni DPO: no es fiable como asistente conversacional.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa.
- No tiene capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés, según la etiqueta de idioma del modelo.

## Casos de uso

- Análisis de trayectorias de entrenamiento: comparar los pesos de esta semilla 8 con los de otras semillas de la colección en cada checkpoint `stepN` para cuantificar la divergencia en el espacio de pesos y su relación con la pérdida.
- Estudio de sensibilidad a la semilla: usar la colección completa para medir cuánta varianza introduce la inicialización aleatoria en métricas de validación con la misma receta y los mismos datos.
- Investigación de alineamiento de representaciones (model merging y linear mode connectivity): comprobar si los checkpoints de distintas semillas son interpolables sin pérdida catastrófica.
- Referencia de línea base a pequeña escala: servir como baseline de ~305M parámetros entrenado en Dolma para comparar con modelos del mismo tamaño en experimentos académicos.
- Experimentos de perplejidad y evaluación de corpus: calcular la perplejidad de textos en inglés con un modelo cuyo presupuesto de tokens y datos están documentados en `run.json`.
- Reproducibilidad de pipelines de preentrenamiento: reutilizar la configuración OLMo2 y la receta AdamW documentada para validar infraestructura de entrenamiento en streaming sobre Dolma.
- Extracción de características para probing: usar los hidden states de las 16 capas en tareas de diagnóstico lingüístico a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 0,61 GB solo para pesos (305M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB con contexto de 2048 tokens.
- VRAM en fp32: aproximadamente 1,22 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior es más que suficiente. Para entrenamiento o fine-tuning completo, se recomienda A100 o H100, coherente con el hardware original (H100).
- Cabe holgadamente en GPU consumer: RTX 4090, RTX 3090, RTX 4070, RTX 3060 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving, llama.cpp u Ollama si se convierte a GGUF (no se publica GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, el throughput será alto en GPU moderna, pero no hay cifras publicadas.
- Tamaño del repo: 39,1 GB, dominado por las múltiples ramas de checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos | Licencia | Propósito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed8 (este) | ~305M | 2048 | Dolma v1.7, 2B tokens | Apache 2.0 | Trayectoria de preentrenamiento, semilla 8 |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | no disponible | Colección análoga sobre arquitectura Pythia |
| OLMo2-medium estándar (referencia de arquitectura) | ~305M (config) | 2048 | no disponible | Apache 2.0 (familia OLMo) | Modelo base de la misma arquitectura |
| Modelos densos ~300M de propósito general | ~300M | variable | variable | variable | Uso general; no comparables en trayectoria |

La comparación relevante es con la colección Pythia de trayectorias (jjalora/diet-traj-pythia-410m-*), que aplica la misma filosofía experimental sobre otra arquitectura y otro tamaño. No hay datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- Modelo exclusivamente de preentrenamiento: no está ajustado por instrucciones ni alineado, por lo que puede generar texto incoherente, repetitivo u ofensivo sin filtros.
- Riesgo alto de alucinación y de contenido sesgado heredado de Dolma v1.7; no apto para producción orientada a usuarios finales sin ajuste posterior.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo en sí no es un producto utilizable comercialmente sin fine-tuning y evaluación adicionales.
- El repositorio pesa 39,1 GB por la acumulación de ramas de checkpoints; la descarga completa es costosa si solo se necesitan los pesos finales de `main`.
- El campo `git_commit` en `run.json` figura como "unknown", lo que limita la reproducibilidad exacta del código de entrenamiento.
- No se publican métricas de evaluación ni curvas de pérdida en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed8
- Repositorio del proyecto DIET (configuración y scripts): jjalora/diet-lm (referenciado en la model card; sin URL completa en la información disponible)
- Colección de trayectorias análoga sobre Pythia: jjalora/diet-traj-pythia-410m-* (referenciada en la model card; sin URL completa en la información disponible)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper de Dolma v1.7: no disponible en la información proporcionada
