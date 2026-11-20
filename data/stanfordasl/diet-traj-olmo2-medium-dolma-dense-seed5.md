# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed5

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 5 es un modelo de lenguaje de ~305 millones de parametros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto de investigacion DIET sobre trayectorias en el espacio de pesos. No es un modelo pensado para uso en produccion, sino un artefacto de investigacion: forma parte de una coleccion de ejecuciones de preentrenamiento identicas en receta y datos en las que solo cambia la semilla aleatoria, lo que permite analizar como evolucionan los pesos y las representaciones internas durante el entrenamiento.

El modelo sigue la arquitectura densa OLMo2 con hidden_size de 768, 16 capas, 12 cabezas de atencion (12 cabezas KV) y una longitud maxima de posicion de 2048 tokens. Se entrena sobre el espejo nativo de Hugging Face `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y consumido en streaming, con un presupuesto de 2.000 millones de tokens, AdamW con learning rate 3e-5 y precision bf16 sobre GPUs H100.

Su relevancia es metodologica: la coleccion (junto con las variantes `diet-traj-pythia-410m-*`) proporciona puntos de control intermedios cada 100 pasos que permiten estudiar dietas de entrenamiento, transferencia entre arquitecturas y estabilidad del entrenamiento frente a la semilla. La licencia Apache 2.0 y el formato safetensors bf16 facilitan su reutilizacion en experimentos academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (decoder-only) |
| Parametros totales | ~305 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Dimension oculta | 768 |
| Dimension intermedia | 3072 |
| Numero de capas | 16 |
| Cabezas de atencion / KV | 12 / 12 |
| Dataset de entrenamiento | emozilla/dolma-v1_7-3B (streamed) |
| Presupuesto de tokens | 2.000 millones |
| Hardware de entrenamiento | NVIDIA H100 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion `olmo2_medium_dense` del repositorio jjalora/diet-lm: 16 capas, hidden_size 768, intermediate_size 3072, 12 cabezas de atencion con 12 cabezas KV (sin GQA, es decir, atencion multi-cabeza clasica) y embeddings posicionales con maximo de 2048 tokens. No emplea mezcla de expertos ni mecanismos hibridos; es una arquitectura estandar de tipo GPT con las convenciones de OLMo2.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropia cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), sin destilacion, sin RLHF ni DPO. Se usa AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y bf16, con `max_steps=30517` y `save_steps=100`, lo que genera checkpoints cada 100 pasos en ramas `stepN`. Los datos proceden de `emozilla/dolma-v1_7-3B`, un espejo comunitario de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). La unica diferencia entre las ejecuciones de la coleccion es la semilla aleatoria (en este caso, seed 5), lo que convierte al modelo en una pieza de un diseno experimental controlado para analisis de trayectorias en el espacio de pesos.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada por el tamano del modelo (~305M) y por el presupuesto de entrenamiento (2.000 millones de tokens).
- Razonamiento de un solo paso y continuacion de texto; no se ha entrenado para razonamiento multi-paso ni para modo "thinking".
- Capacidad limitada de codigo y matematicas, derivada unicamente de la mezcla Dolma; no hay ajuste fino especifico en estas areas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues practicamente inexistentes: el modelo esta etiquetado solo para ingles.
- Sin vision, audio ni ninguna otra modalidad.
- Valor principal como objeto de estudio: checkpoints intermedios cada 100 pasos para analisis de trayectorias de entrenamiento y del espacio de pesos.

## Casos de uso

- Investigacion sobre dietas de entrenamiento: comparar los checkpoints `stepN` de esta ejecucion (seed 5) con los de otras semillas de la misma coleccion para medir la varianza inducida por la inicializacion en las curvas de perdida y en las representaciones internas.
- Analisis del espacio de pesos: estudiar la trayectoria de los parametros entre checkpoints consecutivos (cada 100 pasos) para detectar fases de entrenamiento, cambios de regimen o inestabilidades, gracias a la granularidad de los guardados.
- Estudios de transferencia entre arquitecturas: al replicar la receta de la coleccion `diet-traj-pythia-410m-*` sobre OLMo2, permite comparar como se comportan dos arquitecturas distintas con el mismo corpus y receta.
- Experimentos de destilacion y merging: servir como modelo base pequeno para probar tecnicas de interpolacion de pesos o de destilacion desde modelos mayores, dado su tamano manejable (~305M) y su licencia permisiva.
- Reproducibilidad y auditoria de entrenamiento: el `run.json` documenta cluster, GPU, job, pasos y presupuesto de tokens, lo que facilita replicar o auditar la ejecucion en entornos academicos.
- Docencia y prototipado de pipelines: usar el modelo como ejemplo de referencia para montar pipelines de evaluacion de checkpoints intermedios con `transformers` sin requerir hardware de gama alta.
- Generacion de texto de bajo coste en ingles para pruebas internas de infraestructura (no recomendado para produccion por su calidad limitada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6-0,7 GB solo para pesos (~305M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: ~0,3-0,4 GB de pesos; en 4 bits, ~0,15-0,2 GB (cuantizacion no publicada por el autor, requeriria conversion propia a GGUF o similar).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es mas que suficiente; tambien cabe en GPUs de 8 GB e incluso en CPU para inferencia por lotes pequenos.
- A100/H100 no son necesarios para inferencia; se usaron H100 para el entrenamiento segun `run.json`.
- Opciones de despliegue: `transformers` (libreria declarada), y conversion posible a llama.cpp/Ollama/vLLM/TGI aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed5 | ~305M | 2048 | 2.000M tokens Dolma v1.7 | Apache 2.0 | Hugging Face |
| diet-traj-pythia-410m-* (coleccion relacionada) | ~410M | 2048 (Pythia) | Dolma / Pile segun variante | Apache 2.0 (Pythia) | Hugging Face |
| OLMo2 oficial (variantes mayores) | no disponible en la informacion | no disponible | Dolma | Apache 2.0 | Hugging Face |
| Pythia-410m (referencia de arquitectura) | ~410M | 2048 | Pile | Apache 2.0 | Hugging Face |

La comparacion se limita a la familia de modelos de investigacion de trayectorias; no se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no ajustado para instrucciones ni para uso conversacional; la calidad de generacion sera baja en tareas practicas.
- Entrenado unicamente con 2.000 millones de tokens, muy por debajo de lo habitual en modelos de su tamano; alta probabilidad de infraentrenamiento y de alucinaciones.
- Solo ingles; no hay soporte multilingue documentado.
- Contexto maximo de 2048 tokens, insuficiente para tareas de contexto largo.
- Sesgos heredados de la mezcla Dolma v1.7 y de su muestreo proporcional; no se documenta ninguna mitigacion.
- No se documentan evaluaciones de seguridad, sesgo ni toxicidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para produccion por su calidad y por la falta de ajuste.
- El repositorio ocupa 30,5 GB, lo que sugiere la presencia de multiples checkpoints; conviene descargar solo la rama o el paso necesarios.
- El campo `git_commit` figura como "unknown" en `run.json`, lo que dificulta la reproducibilidad exacta del codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed5
- Repositorio de codigo del proyecto (referenciado en la model card): https://github.com/jjalora/diet-lm
- Coleccion relacionada de trayectorias Pythia (referenciada): https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Dolma v1.7 (dataset original): no disponible enlace directo en la informacion proporcionada
