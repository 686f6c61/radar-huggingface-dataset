# takumiecd/cst-mtgnn-pems-bay

## Resumen

CST-MTGNN para PEMS-BAY es un conjunto de checkpoints de prediccion de series temporales orientado especificamente a la prediccion de velocidad de trafico en la red de sensores del area de la bahia de San Francisco (PEMS-BAY). Lo desarrolla el usuario takumiecd y se publica bajo licencia Apache 2.0. El modelo predice la siguiente hora de velocidad de trafico (12 lecturas a intervalos de cinco minutos, en millas por hora) a partir de la hora previa de datos en 325 sensores.

La propuesta tecnica combina dos ideas: la arquitectura MTGNN (Multivariate Time-series Graph Neural Network) para modelar dependencias entre sensores, y una capa `CSTLinear` derivada de la libreria `torchcst` que genera las puntuaciones del grafo a partir de las coordenadas de los sensores. El paquete incluye dos variantes comparables: una variante CST (con `CSTLinear` para producir las puntuaciones del grafo) y una variante `baseline_coords` (MTGNN con grafo aprendido y coordenadas de sensores como entrada adicional).

Es relevante porque publica una comparacion controlada, con seis ejecuciones (tres semillas por variante), del efecto de incorporar informacion geoespacial en la construccion del grafo frente a un MTGNN con grafo puramente aprendido. La variante CST reduce el MAE medio de test de 1,745 mph a 1,586 mph en el holdout cronologico, un resultado que, si se confirma en otros conjuntos, seria una mejora sustancial para un problema de prediccion de trafico a corto plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTGNN (Graph Neural Network para series temporales multivariantes) con capa `CSTLinear` (torchcst) para generar las puntuaciones del grafo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 12 pasos temporales de entrada (1 hora a intervalos de 5 minutos); horizonte de prediccion de 12 pasos (1 hora) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors sin indicacion de cuantizaciones) |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MTGNN, una arquitectura de grafos para series temporales multivariantes que aprende la estructura de dependencias entre sensores y aplica convoluciones sobre el grafo resultante. La innovacion principal del checkpoint es la sustitucion de la generacion de puntuaciones del grafo por una capa `CSTLinear` de la libreria `torchcst`, que incorpora las coordenadas de los 325 sensores para producir dichas puntuaciones. La variante `baseline_coords` mantiene el grafo aprendido de MTGNN pero anade las coordenadas como informacion de entrada, lo que permite aislar el efecto de la construccion del grafo frente a la mera disponibilidad de coordenadas.

El entrenamiento se realizo durante 100 epocas en una unica RTX 4090, con seis ejecuciones (tres semillas: 17, 29 y 43, para cada variante). Se conservan los pesos de la epoca con menor MAE de validacion. La evaluacion de test se realizo sobre 10.412 ventanas de un holdout cronologico. No se detalla en la informacion disponible el volumen total de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de regularizacion especificas mas alla de las propias de MTGNN.

## Capacidades

- Prediccion de series temporales multivariantes: genera 12 predicciones a intervalos de cinco minutos (una hora) de velocidad de trafico en mph para 325 sensores.
- Modelado de dependencias espaciales mediante grafo: la variante CST usa coordenadas de sensores para construir el grafo; la variante `baseline_coords` usa el grafo aprendido con coordenadas como entrada.
- Entrada de contexto: 12 lecturas previas a intervalos de cinco minutos (ultima hora) por sensor.
- Inferencia en CPU y CUDA: el CLI permite `--device cuda` para usar PyTorch con CUDA.
- Soporte de multiples semillas: checkpoints para las semillas 17, 29 y 43, lo que permite analizar variabilidad entre ejecuciones.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas: es un modelo puramente numerico de series temporales.

## Casos de uso

- Prediccion de trafico a corto plazo en redes de sensores: el modelo predice la velocidad en 325 sensores de la bahia de San Francisco con un horizonte de una hora, adecuado para sistemas de informacion al conductor y planificacion de rutas.
- Investigacion sobre grafos geoespaciales: la comparacion controlada entre CST y `baseline_coords` permite estudiar el impacto de incorporar coordenadas en la construccion del grafo frente a su uso como entrada, con tres semillas para estimar la variabilidad.
- Benchmark de referencia para PEMS-BAY: el checkpoint y el protocolo (holdout cronologico, 10.412 ventanas, MAE en mph) sirven como linea base reproducible para nuevos metodos de prediccion de trafico.
- Monitorizacion de infraestructura de trafico: la variante CST puede integrarse en pipelines de alerta cuando la velocidad predicha cae por debajo de umbrales, usando el CLI con datos propios en CSV.
- Reproduccion de experimentos: el repositorio incluye un manifiesto de checkpoints con digests SHA-256 y curvas de aprendizaje, lo que facilita la replicacion de los resultados.
- Evaluacion de robustez ante fallos de sensores: la model card menciona resultados de "feed outages and latency" con los mismos seis checkpoints, utiles para estudiar el comportamiento bajo perdida de datos o retrasos en la entrega.

## Benchmarks y rendimiento

Resultados de MAE de test en mph sobre el holdout cronologico (10.412 ventanas), segun la model card:

| Semilla | MTGNN + coordenadas | Epoca seleccionada | CST | Epoca seleccionada |
| ---: | ---: | ---: | ---: | ---: |
| 17 | 1,764 | 20 | 1,586 | 74 |
| 29 | 1,744 | 11 | 1,587 | 89 |
| 43 | 1,726 | 10 | 1,584 | 81 |
| Media | 1,745 | — | 1,586 | — |

La variante CST mejora el MAE medio en 0,159 mph (aproximadamente un 9,1 %) respecto a la variante con grafo aprendido y coordenadas. No se han publicado otros benchmarks (por ejemplo, comparaciones con modelos externos) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: cada una de las seis ejecuciones se entreno durante 100 epocas en una unica RTX 4090, segun la model card.
- Inferencia: el CLI permite ejecucion en CPU o en CUDA (`--device cuda`). No se especifica VRAM estimada; dado que el repositorio ocupa 0,0 GB y no se detalla el numero de parametros, no es posible dar una cifra fiable de VRAM.
- GPU recomendadas: la model card solo cita la RTX 4090 para entrenamiento y evaluacion. No se indican requisitos para A100, H100 ni otras GPU.
- Despliegue: la via documentada es el CLI `infer.py` del repositorio `cst-mtgnn-metr-la`, con pesos en safetensors descargados desde el Hub o mediante `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La model card menciona resultados de latencia en el contexto de "feed outages and latency", pero no se incluyen cifras en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica comparacion interna es entre las dos variantes del propio paquete:

| Modelo | Parametros | Contexto | MAE test (mph) | Licencia | Disponibilidad |
|---|---|---|---|---|
| CST-MTGNN (variante CST) | no disponible | 12 pasos de entrada / 12 de salida | 1,586 (media de 3 semillas) | Apache 2.0 | Hugging Face |
| MTGNN + coordenadas (`baseline_coords`) | no disponible | 12 pasos de entrada / 12 de salida | 1,745 (media de 3 semillas) | Apache 2.0 | Hugging Face |

No se han identificado en la informacion disponible alternativas publicas de la misma categoria (prediccion de trafico en PEMS-BAY) con las que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado exclusivamente para PEMS-BAY (325 sensores de la bahia de San Francisco) y no es directamente transferible a otras redes de trafico sin reentrenamiento.
- Formato de entrada estricto: requiere 325 columnas de sensores con los IDs exactos, intervalo de cinco minutos y columna de timestamp en hora local del Pacifico; el CLI predice a partir de las ultimas 12 filas.
- No determinismo en la seleccion de vecinos: la model card advierte que la variante con coordenadas puede seleccionar vecinos distintos en CPU y en CUDA cuando las puntuaciones del grafo empatan en el corte top-20, lo que puede producir predicciones ligeramente diferentes segun el dispositivo.
- Repositorio sin descargas ni likes: el modelo no tiene traccion comunitaria y no hay evidencia externa de validacion independiente.
- Sin datos de parametros ni cuantizaciones: no se publica el numero de parametros ni variantes cuantizadas, lo que dificulta estimar requisitos de despliegue.
- Riesgo de sobreajuste al holdout: los resultados se basan en un unico holdout cronologico de 10.412 ventanas; no se reportan intervalos de confianza ni evaluacion en otros periodos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la calidad de los datos de entrenamiento.
- Sin informacion sobre sesgos: al ser un modelo numerico de trafico, los sesgos relevantes serian los del dataset PEMS-BAY (cobertura de sensores, condiciones meteorologicas, eventos), no documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takumiecd/cst-mtgnn-pems-bay
- Repositorio de codigo (CLI, protocolo de entrenamiento y resultados): https://github.com/takumiecd/cst-mtgnn-metr-la
- Comparacion completa de 100 epocas: https://github.com/takumiecd/cst-mtgnn-metr-la#full-100-epoch-comparison
- Resultados de caidas y latencia del feed: https://github.com/takumiecd/cst-mtgnn-metr-la#feed-outages-and-latency
- Manifiesto de checkpoints y digests SHA-256: https://huggingface.co/takumiecd/cst-mtgnn-pems-bay/blob/main/checkpoints.json
- Ejemplo de entrada: https://huggingface.co/takumiecd/cst-mtgnn-pems-bay/resolve/main/example_input.csv
