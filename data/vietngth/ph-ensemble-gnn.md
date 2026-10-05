# vietngth/ph-ensemble-gnn

## Resumen

PH-ensemble-gnn es un repositorio de checkpoints publicado por el usuario vietngth con los modelos entrenados PH-TSER-Att_0 descritos en el articulo "Persistent Homology-Induced Graph Ensembles" (arXiv:2503.14240). No es un modelo de lenguaje ni un modelo fundacional, sino un conjunto de cuatro checkpoints de redes neuronales de grafos orientadas a la estimacion de parametros sismicos en redes de estaciones de Italia. El repositorio contiene una carpeta por red (Central Italy y Central-West Italy) y por configuracion de entrenamiento (tuned y untuned), siempre para la semilla 1.

La innovacion tecnica del trabajo consiste en construir un ensemble de grafos a partir de 38 grafos derivados de homologia persistente sobre la geometria de la red de estaciones (el conjunto denominado G^(0) en el paper), y combinar esa representacion topologica con un modelo de convolucion sobre grafos con atencion (la nomenclatura PH-TSER-Att sugiere Persistent Homology + TSER + Attention). La configuracion "untuned" reproduce los hiperparametros publicados del modelo base TSER-GCN, mientras que la "tuned" emplea AdamW con scheduler one-cycle y una tasa de aprendizaje seleccionada mediante un range test.

Es relevante ahora porque distribuye pesos entrenados reproducibles junto con el codigo de inferencia y los resultados por fold, lo que permite verificar el MAE declarado sin reentrenar. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,6 GB y licencia MIT. No se especifican en la informacion disponible el numero de parametros, la arquitectura exacta ni los valores numericos de los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GCN) con atencion, ensamblada sobre 38 grafos derivados de homologia persistente; base TSER-GCN en la configuracion untuned |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una ventana temporal sobre grafos de estaciones sismicas) |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen sin cuantizar |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`) mas fichero `results.json` por carpeta |
| Tamano del repositorio | 0,6 GB |
| Dominio | Sismologia y alerta temprana de terremotos (earthquake early warning) |
| Redes cubiertas | Central Italy y Central-West Italy |
| Semilla publicada | Seed 1 (fija el split 80/20) |
| Dataset asociado | vietngth/ph-ensemble-gnn-data |
| Metrica de evaluacion | MAE (error absoluto medio) sobre el conjunto de test del fold |
| Fecha de creacion en el repositorio | 2026-10-05 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de redes neuronales sobre grafos aplicadas a senales sismicas. La representacion de entrada se organiza como un grafo cuyos nodos corresponden a estaciones sismicas y cuyas relaciones se derivan de homologia persistente: el paper define un conjunto G^(0) de 38 grafos PH, y el checkpoint PH-TSER-Att_0 es un ensemble sobre esos 38 grafos. La componente "Att" de la nomenclatura apunta a un mecanismo de atencion, y la referencia a TSER-GCN en la configuracion untuned indica que la columna vertebral es una GCN temporal-espacial de la literatura previa de early warning. No se detalla en la informacion disponible el numero de capas, las dimensiones ocultas ni el mecanismo exacto de agregacion del ensemble.

En cuanto al entrenamiento, el repositorio publica dos regimenes por cada red. El regimen "tuned" usa AdamW con scheduler one-cycle y una tasa de aprendizaje elegida a partir de un range test. El regimen "untuned" reproduce los hiperparametros publicados de TSER-GCN. Cada checkpoint corresponde a la semilla 1 y al fold con la menor perdida de validacion (`best.ckpt`), con un split fijo 80/20 por semilla. Los `results.json` guardan la configuracion de la ejecucion, el fold y las metricas de test registradas. No se documenta en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del catalogo sismico, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de regresion de este tipo).

## Capacidades

- Regresion sobre senales sismicas: el modelo produce estimaciones numericas evaluadas con MAE, orientadas a tareas de early warning sismico.
- Modelado topologico: incorpora informacion de homologia persistente mediante un ensemble de 38 grafos, lo que permite representar la estructura global de la red de estaciones.
- Modelado espacial sobre grafos: explota la topologia de la red de estaciones (nodos y aristas) en lugar de tratar cada estacion de forma independiente.
- Modelado temporal: la referencia a TSER-GCN y la metrica de regresion indican tratamiento de ventanas temporales de senal.
- Ensemble: agrega multiples grafos PH en una unica prediccion.
- Reproducibilidad: incluye pesos, hiperparametros y grafos dentro del checkpoint, mas el script `predict.py` para verificar el MAE.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision, audio): no disponible / no aplica.

## Casos de uso

- Replicacion de resultados cientificos: clonar el repositorio de codigo, descargar el dataset `ph-gnn-data.zip` y los checkpoints, y ejecutar `predict.py` para reproducir el MAE registrado en `results.json`. Es adecuado porque el autor incluye tanto los pesos como las metricas de referencia por fold.
- Control de integridad de pesos publicados: comparar la salida del checkpoint con el valor de MAE almacenado permite detectar corrupciones de fichero o discrepancias de version de dependencias antes de reutilizar el modelo.
- Analisis de ablacion tuned frente a untuned: al existir las variantes `ci_tuned_seed1` y `ci_untuned_seed1` (y sus equivalentes en Central-West Italy), se puede medir de forma aislada la contribucion del ajuste de hiperparametros sobre una misma arquitectura y split.
- Investigacion sobre homologia persistente en series temporales: el ensemble de 38 grafos PH es un punto de partida para estudiar si la informacion topologica aporta mejoras frente a grafos basados solo en distancia geografica.
- Punto de partida para transferencia a otras redes regionales: reentrenar la columna vertebral sobre catalogos de otras zonas sismicas, reutilizando la implementacion y el esquema de grafos PH como inicializacion o como referencia metodologica.
- Construccion de ensembles propios multi-semilla: el repositorio publica la semilla 1, de modo que un equipo puede generar las semillas restantes repitiendo el pipeline y promediando folds, tal como hace el paper en sus tablas.
- Baseline en comparativas de arquitecturas GNN para early warning: sirve como referencia cuantitativa (MAE) frente a variantes sin atencion o sin ensemble topologico.
- Docencia y formacion: el par codigo + checkpoints + configuracion permite ilustrar un flujo completo de entrenamiento, validacion por folds y evaluacion de una GNN aplicada a datos geofisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `predict.py` evalua el checkpoint sobre el conjunto de test de su semilla y comprueba el MAE contra el valor registrado, pero los valores numericos de MAE no se incluyen en la informacion proporcionada. Tampoco se aportan resultados comparativos frente a otros modelos en esta ficha de HuggingFace.

| Aspecto | Estado |
|---|---|
| Metrica reportada por el autor | MAE sobre el conjunto de test del fold |
| Valores de MAE por carpeta | no disponibles en la informacion proporcionada |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica |
| Comparacion cuantitativa con TSER-GCN | no disponible; el paper la contiene, pero sus cifras no se incluyen aqui |

Nota metodologica del autor: las tablas del paper promedian cinco modelos de fold sobre diez semillas, por lo que un unico modelo de fold de una sola semilla no tiene por que coincidir exactamente con los valores de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,6 GB para cuatro carpetas, de modo que cada checkpoint individual es una fraccion de ese tamano; esto sugiere un modelo de dimension reducida, pero es una inferencia a partir del tamano del fichero y no un dato confirmado.
- GPU recomendadas: no disponibles. Al no conocerse el numero de parametros ni el lote de inferencia, no se puede recomendar una GPU concreta.
- Viabilidad en GPU de consumo: probable en tarjetas tipo RTX 3060 o superiores, e incluso en CPU, dado el tamano del repositorio, pero sin confirmacion en la informacion disponible.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El despliegue previsto es PyTorch / PyTorch Lightning mediante el script `experiments/predict.py` del repositorio de codigo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| PH-TSER-Att_0 (este repositorio) | GNN + ensemble de grafos de homologia persistente | no disponible | no aplica | MIT | Checkpoints en HuggingFace, semilla 1, cuatro carpetas | MAE no disponible en esta informacion |
| TSER-GCN (configuracion publicada) | GCN espacio-temporal para early warning | no disponible | no aplica | no disponible | Referenciado como base del modo untuned | MAE no disponible en esta informacion |
| Otras GNN para early warning sismico | GNN sobre redes de estaciones | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling ni agentes.
- Cobertura geografica limitada: solo se entrenan y publican modelos para Central Italy y Central-West Italy; no hay evidencia de generalizacion a otras redes sismicas sin reentrenamiento.
- Cobertura de semillas incompleta: unicamente se distribuye la semilla 1. Un solo fold de una sola semilla no representa el comportamiento promedio reportado en el paper.
- Split fijo: la semilla 1 fija la particion 80/20, lo que limita el analisis de variabilidad si no se reentrena con otras semillas.
- Sin validacion por la comunidad: 0 descargas y 0 likes, sin senales de mantenimiento, issues resueltos ni replicaciones independientes.
- Artefactos no cuantizados: no se ofrecen versiones GGUF, ONNX ni INT8/INT4, lo que obliga a usar el stack PyTorch/PyTorch Lightning.
- Riesgo de sobreajuste regional: cambios en la instrumentacion, en la disponibilidad de estaciones o en las caracteristicas del catalogo pueden degradar el MAE fuera del periodo de entrenamiento.
- Uso operativo en alerta temprana: no hay indicios de certificacion, validacion en tiempo real ni integracion con sistemas de alerta; debe tratarse como material de investigacion, no como componente listo para produccion.
- Sesgos conocidos: sesgo geografico (solo Italia central y centro-occidental) y previsible sesgo temporal segun el catalogo utilizado, cuya composicion no se detalla en la informacion disponible.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones erroneas fuera de la distribucion de entrenamiento, sin senales de calibracion o intervalos de incertidumbre documentados.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero la licencia del dataset asociado `vietngth/ph-ensemble-gnn-data` no se especifica en la informacion proporcionada y debe verificarse antes de un uso comercial.
- Consistencia de metadatos: la fecha de creacion registrada (2026-10-05) conviene verificarla, ya que resulta posterior a la fecha habitual de publicacion del paper referenciado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vietngth/ph-ensemble-gnn
- Dataset asociado: https://huggingface.co/datasets/vietngth/ph-ensemble-gnn-data
- Repositorio de codigo: https://github.com/vietngth/ph-ensemble-gnn
- Paper (arXiv): https://arxiv.org/abs/2503.14240
- Identificador arXiv: arXiv:2503.14240
