# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed10

## Resumen

`diet-traj-olmo2-medium-dolma-dense-seed10` es un checkpoint de preentrenamiento desde cero de un modelo con arquitectura OLMo2 de aproximadamente 305 millones de parametros, publicado por el grupo stanfordasl dentro del proyecto DIET de analisis en el espacio de pesos (weight-space). No es un modelo pensado para uso en produccion ni para tareas de inferencia general, sino una pieza de un conjunto de trayectorias de entrenamiento que permite estudiar como evolucionan los pesos y las capacidades a lo largo del preentrenamiento. Forma parte de una coleccion en la que solo cambia la semilla aleatoria entre ejecuciones, lo que facilita comparaciones controladas.

El modelo usa la arquitectura OLMo2 densa con `hidden_size=768`, `intermediate_size=3072`, 16 capas, 12 cabezas de atencion y 12 cabezas KV (atencion multi-cabeza clasica, sin GQA), con una longitud maxima de posiciones de 2048 tokens. Se entreno sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes, con un presupuesto de 2.000 millones de tokens y 30.517 pasos, guardando checkpoints cada 100 pasos.

Su relevancia es metodologica: permite reproducir y analizar trayectorias de entrenamiento (incluyendo fenomenos como cambios de fase, formacion de circuitos o dinamica de representaciones) sobre la arquitectura OLMo2 y el corpus Dolma, extendiendo trabajos previos realizados con Pythia. La licencia Apache 2.0 y el formato bf16 safetensors facilitan su reutilizacion en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos |
| Dimension oculta | 768 |
| Dimension intermedia | 3072 |
| Numero de capas | 16 |
| Cabezas de atencion / KV | 12 / 12 |
| Dataset de entrenamiento | `emozilla/dolma-v1_7-3B` (streamed) |
| Presupuesto de tokens | 2.000.000.000 |
| Pasos de entrenamiento | 30.517 (`max_steps`) |
| Cadencia de checkpoints | cada 100 pasos (`save_steps`) |
| Optimizador | AdamW, lr=3e-5, betas (0.9, 0.95), weight decay 0.1 |
| Precision de entrenamiento | bf16 |
| Hardware de entrenamiento | H100 (cluster "makau") |
| Semilla | 10 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion OLMo2 definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: 16 capas, `hidden_size=768`, `intermediate_size=3072`, 12 cabezas de atencion con 12 cabezas KV (sin grouped-query attention), y ventana de posiciones de 2048 tokens. No emplea mezcla de expertos ni mecanismos hibridos; es un transformer clasico con atencion completa.

El entrenamiento consistio en preentrenamiento puro con perdida de entropia cruzada sobre lenguaje (`distillation.teacher_schedule=none` en `src/run_distillation.py`), es decir, sin destilacion ni profesor, pese al nombre del script. Se uso AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1 y schedule coseno, en bf16, sobre GPU H100. Los datos se transmitieron en streaming desde `emozilla/dolma-v1_7-3B` (sin pre-empaquetado), con un presupuesto total de 2.000 millones de tokens repartidos en 30.517 pasos. La unica diferencia respecto a otras ejecuciones de la coleccion es la semilla aleatoria (seed 10), lo que convierte este checkpoint en una replica controlada para estudiar variabilidad de trayectorias.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, derivada del preentrenamiento con perdida LM.
- Modelado de lenguaje y evaluacion de perplejidad sobre corpus en ingles.
- Analisis de trayectorias de entrenamiento: los checkpoints por paso (`stepN`) permiten estudiar la evolucion de pesos, activaciones y representaciones internas.
- Comparacion controlada entre semillas dentro del proyecto DIET (misma receta, distinto seed).
- Extraccion de representaciones internas (hidden states) para investigacion de interpretabilidad.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion de dinamica de entrenamiento: cargar checkpoints intermedios de la rama `stepN` para medir la evolucion de la perdida, la norma de pesos o la geometria de representaciones a lo largo de los 30.517 pasos.
- Estudios de reproducibilidad y varianza entre semillas: comparar esta ejecucion (seed 10) con las demas semillas de la coleccion para cuantificar cuanto varia una misma receta de preentrenamiento.
- Interpretabilidad de circuitos en modelos pequenos: con 16 capas y 768 dimensiones oculta, el modelo es manejable para analisis de attention heads, probing lineal y activaciones en una sola GPU.
- Analisis en el espacio de pesos (weight-space): el proyecto DIET se centra en estudiar como se organizan los pesos; este checkpoint sirve como punto de muestreo de una trayectoria completa.
- Evaluacion de corpus Dolma: al entrenarse sobre `emozilla/dolma-v1_7-3B`, permite estudiar el efecto de esa mezcla de datos en un modelo de ~305M de parametros.
- Docencia y experimentacion en preentrenamiento: receta completa y reproducible (AdamW, lr, schedule, presupuesto de tokens) para cursos o laboratorios sobre entrenamiento de LLM a pequena escala.
- Baseline para comparaciones con Pythia u otras trayectorias: la coleccion extiende el espiritu de `jjalora/diet-traj-pythia-410m-*` a la arquitectura OLMo2, permitiendo contrastes entre arquitecturas sobre datos comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6-0,7 GB solo para pesos (~305M parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU consumer moderna.
- VRAM estimada en fp32: alrededor de 1,2-1,3 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el entrenamiento original se realizo en H100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (libreria declarada), y por compatibilidad de arquitectura OLMo2, potencialmente llama.cpp, Ollama o vLLM si convierten los pesos; no se documenta soporte explicito en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia muy rapida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed10 | ~305M | 2048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Trayectorias de entrenamiento |
| jjalora/diet-traj-pythia-410m-* (coleccion referenciada) | ~410M | no disponible en la informacion | no disponible | no disponible | Trayectorias de entrenamiento |
| OLMo2 (familia oficial) | tamanos mayores (no especificados aqui) | no disponible | Dolma | Apache 2.0 | Modelo de proposito general |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no se han publicado benchmarks para este checkpoint ni se detallan metricas de la coleccion Pythia en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta ajustado con instrucciones (no es instruct/chat) y no debe usarse como asistente conversacional en produccion.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas sera deficiente.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Riesgo elevado de alucinacion y de generacion de texto incoherente, propio de un modelo de ~305M de parametros con solo 2.000 millones de tokens de entrenamiento.
- Sesgos presentes en el corpus Dolma (datos web, libros, papers, etc.) que el modelo puede reproducir; no se documentan mitigaciones.
- No dispone de tool calling, agentes, vision ni otras capacidades avanzadas.
- Los checkpoints intermedios estan en ramas `stepN` y contienen solo pesos; es necesario consultar `run.json` para conocer el presupuesto exacto de tokens y la cadencia de guardado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por sus limitaciones tecnicas y su naturaleza de artefacto de investigacion.
- El campo `git_commit` figura como `unknown` en la procedencia, lo que dificulta la reproducibilidad exacta del codigo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed10
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Coleccion de referencia Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
