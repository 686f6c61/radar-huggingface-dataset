# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed11

## Resumen

DIET trajectory: OLMo2-medium es un modelo de lenguaje de aproximadamente 305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto de investigación DIET sobre trayectorias en el espacio de pesos. No es un modelo pensado para uso en producción, sino un artefacto experimental: una de las múltiples ejecuciones de preentrenamiento idénticas salvo por la semilla aleatoria (en este caso, seed 11), cuyo objetivo es permitir el análisis de cómo evolucionan los pesos y las métricas a lo largo del entrenamiento. La relevancia es, por tanto, metodológica: ofrece checkpoints intermedios cada 100 pasos junto con curvas de pérdida y métricas de validación, lo que lo convierte en material para estudiar dinámica de entrenamiento, merging de modelos o técnicas de weight-space.

La arquitectura es un transformer denso de estilo OLMo2 con hidden_size de 768, 16 capas, 12 cabezas de atención y 12 cabezas KV, con una longitud máxima de posición de 2048 tokens. El entrenamiento se realizó sobre una muestra proporcional del dataset Dolma v1.7 (mirror `emozilla/dolma-v1_7-3B`), consumido en streaming desde el Hub, con un presupuesto de 2.000 millones de tokens, AdamW con lr=3e-5, schedule coseno y precisión bf16 sobre GPUs H100.

El modelo solo soporta inglés, se distribuye bajo licencia Apache 2.0 y está etiquetado como compatible con endpoints de inferencia. Su tamaño reducido (~305M) permite ejecutarlo en hardware de consumo, pero su interés principal reside en la colección de checkpoints y los datos de trayectoria asociados, no en su calidad como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`) |
| Parámetros totales | 305.185.536 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors; cuantizaciones de terceros no documentadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); tokenizer en `tokenizer.json` |
| Hidden size | 768 |
| Intermediate size | 3072 |
| Capas | 16 |
| Cabezas de atención | 12 |
| Cabezas KV | 12 |
| Dataset de entrenamiento | `emozilla/dolma-v1_7-3B` (streaming) |
| Presupuesto de tokens | 2.000.000.000 |
| Pasos máximos | 30.517 |
| Cadencia de checkpoints | cada 100 pasos (ramas `stepN`) |
| Hardware de entrenamiento | H100 (clúster `makau`) |
| Tamaño del repo | 372,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa media, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: un transformer decoder-only con 16 capas, dimensión oculta de 768, dimensión intermedia de 3072 y atención multi-cabeza con 12 cabezas de query y 12 de key/value (sin GQA). La longitud máxima de posición es de 2048 tokens. No se documentan innovaciones adicionales como atención lineal, decodificación especulativa ni componentes MoE; se trata de un transformer clásico.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none`, es decir, sin destilación efectiva pese al nombre del script `run_distillation.py`). Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16, sobre un presupuesto de 2.000 millones de tokens y 30.517 pasos máximos. Los datos provienen del mirror `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre sus componentes y consumido en streaming desde el Hub. La particularidad del proyecto DIET es que se publican checkpoints intermedios cada 100 pasos en ramas `stepN` (solo pesos), junto con `training_loss.csv` (pérdida cada 25 pasos), `eval_metrics.csv` (métricas de validación cada 950 pasos) y `metrics.json` con la procedencia y métricas finales. Todas las ejecuciones de la colección comparten receta y solo difieren en la semilla aleatoria.

## Capacidades

- Generación de texto autoregresiva en inglés, como resultado directo del preentrenamiento con objetivo de modelado de lenguaje.
- Razonamiento básico y continuación de texto; no se documenta ningún ajuste instructivo, RLHF ni DPO, por lo que no hay modo chat ni formato de instrucciones nativo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado; el corpus Dolma contiene material multilingüe, pero el autor solo declara `en`.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad especial del artefacto: checkpoints intermedios por paso para análisis de trayectorias en el espacio de pesos.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: comparar los pesos y las métricas de los checkpoints `stepN` de esta semilla con los de otras semillas de la colección para estudiar la variabilidad inducida por la inicialización y el orden de los datos.
- Análisis en el espacio de pesos (weight-space): usar los checkpoints intermedios para estudiar interpolación lineal entre pasos, merging de modelos o la geometría de la trayectoria de optimización, aprovechando que todos los runs comparten receta.
- Reproducibilidad de recetas de preentrenamiento: el `run.json` y los CSV de pérdida permiten replicar exactamente la configuración (lr, betas, schedule, presupuesto de tokens) en otros tamaños o arquitecturas.
- Baseline de referencia para modelos pequeños en inglés: servir como punto de comparación controlado (305M parámetros, 2B tokens) en experimentos de scaling o de eficiencia de datos.
- Fine-tuning ligero en tareas de NLP en inglés: al ser un modelo denso de 305M con licencia Apache 2.0, puede ajustarse en una sola GPU de consumo para clasificación, extracción de información o generación acotada, aunque su calidad base será limitada.
- Docencia y experimentación: ejecutar el modelo en local con llama.cpp u Ollama (previa conversión a GGUF) para ilustrar el funcionamiento de un transformer pequeño y el efecto del número de tokens vistos en la perplejidad.
- Validación de pipelines de inferencia: por su tamaño, es útil para probar integraciones con vLLM, TGI o endpoints compatibles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas de validación internas del entrenamiento (`eval_loss`, `eval_perplexity`, `eval_accuracy`, `eval_bits_per_token`) registradas cada 950 pasos en `eval_metrics.csv`, sin valores concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos de 2048 tokens.
- En cuantización de 8 bits: alrededor de 0,3 GB de pesos; en 4 bits, alrededor de 0,15 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para entrenamiento desde cero, el autor usó H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos respectivos, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. El CSV de entrenamiento incluye `tokens_per_sec` y `flops_total`, pero no se aportan valores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed11 | ~305M | 2048 | Apache 2.0 | Trayectoria de preentrenamiento (checkpoints cada 100 pasos) | Hugging Face, 185 descargas |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Colección análoga de trayectorias sobre Pythia | Hugging Face (referenciada en la model card) |
| allenai/OLMo-2-0425-1B | ~1B | no disponible | no disponible | Modelo OLMo2 oficial, tokenizer compatible | Hugging Face (referenciado en la model card) |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, variantes de Pythia o GPT-2) no está disponible en la información proporcionada; además, la finalidad de este checkpoint es experimental, no la calidad de generación.

## Limitaciones y advertencias

- No ha pasado por ajuste instructivo, RLHF ni DPO: no sigue instrucciones y no debe usarse como asistente conversacional sin fine-tuning.
- Riesgo elevado de alucinación y de generar texto incoherente, dado el reducido presupuesto de entrenamiento (2B tokens) y el tamaño del modelo.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- El repositorio ocupa 372,3 GB debido a los múltiples checkpoints; descargar una rama `stepN` concreta requiere cuidado para no bajar el repo completo.
- El tokenizer solo está en `main`; cargar pesos de una rama `stepN` exige obtener el tokenizer de `main` o de `allenai/OLMo-2-0425-1B`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y el autor no ofrece garantías.
- El campo `git_commit` del `run.json` figura como `unknown`, lo que limita la reproducibilidad exacta del código empleado.
- No hay datos publicados de sesgos; el corpus Dolma puede contener sesgos sociales y de dominio que se reflejen en las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed11
- Repositorio de código del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Colección de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia: https://huggingface.co/allenai/OLMo-2-0425-1B
