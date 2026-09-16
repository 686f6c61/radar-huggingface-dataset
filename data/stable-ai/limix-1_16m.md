# stable-ai/LimiX-1_16M

# LimiX-1 16M: ficha tecnica del modelo

## Resumen
LimiX es un modelo fundacional para datos estructurados (LDM, Large Structured-Data Model) desarrollado por stable-ai. Se presenta como el primer modelo fundacional orientado a inteligencia general en datos tabulares: un unico modelo cubre clasificacion, regresion, imputacion de valores faltantes, generacion tabular, seleccion de caracteristicas, seleccion de muestras e inferencia causal, sin necesidad de disenar redes especificas por tarea. El modelo se distribuye bajo licencia Apache 2.0.

La variante documentada aqui es LimiX-1 16M, con aproximadamente 16 millones de parametros, lo que la situa en un orden de magnitud muy inferior al de los grandes modelos de lenguaje y la hace desplegable en hardware modesto. El repositorio ocupa 0,1 GB, lo que es coherente con ese tamano. El modelo se apoya en una arquitectura transformer adaptada a datos estructurados, con atencion aplicada simultaneamente sobre las dimensiones de muestras y de caracteristicas.

Su relevancia actual radica en que compite directamente con XGBoost, con modelos clasicos de deep learning tabular y con otros modelos fundacionales tabulares, y el equipo afirma superarlos en benchmarks sobre 10 conjuntos de datos estructurados de referencia (BCCO, TabArena, TabZilla, CTR23). La familia se ha ampliado con LimiX-2M, una variante mas pequena aceptada en ICML 2026 que reduce consumo de GPU y tiempo de inferencia e incorpora un mecanismo de recuperacion (retrieval) mejorado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer optimizado para modelado de datos estructurados, con atencion sobre dimensiones de muestras y de caracteristicas, y cabezas de regresion y clasificacion |
| Parametros totales | 16 millones (16M), segun la nomenclatura del modelo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye como checkpoint PyTorch; no se documentan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | no aplica (modelo para datos tabulares; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (.ckpt) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
LimiX emplea una arquitectura transformer optimizada para el modelado de datos estructurados y para la generalizacion entre tareas. El flujo descrito en la model card es el siguiente: el modelo embebe las caracteristicas (X) y las etiquetas objetivo (Y) procedentes de una base de conocimiento previa en representaciones tipo token; a continuacion aplica mecanismos de atencion tanto sobre la dimension de muestras como sobre la dimension de caracteristicas para identificar patrones relevantes en muestras y variables clave; finalmente, las representaciones de alta dimension resultantes se envian a cabezas de regresion y de clasificacion que habilitan las distintas tareas predictivas. El modelado conjunto de variables y de valores faltantes es el eje del diseno.

En cuanto a datos de entrenamiento, el numero de tokens, la composicion exacta del dataset y el uso de tecnicas de alineacion tipo RLHF o DPO no se detallan en la informacion disponible; estos mecanismos, ademas, no son los habituales en el ambito tabular. La innovacion tecnica mas destacable es el planteamiento de receta unica de entrenamiento e inferencia para todas las tareas, junto con el mecanismo de recuperacion incorporado en la variante LimiX-2M, que mejora el rendimiento y reduce tiempo y memoria de inferencia. Los detalles completos se remiten al informe tecnico enlazado en la model card.

## Capacidades
- Clasificacion tabular: prediccion de etiquetas categoricas a partir de variables estructuradas, compitiendo con XGBoost y con modelos de deep learning tabular.
- Regresion tabular: prediccion de variables objetivo continuas.
- Imputacion de valores faltantes: reconstruccion de celdas ausentes modelando la distribucion conjunta de las variables.
- Generacion tabular: sintesis de filas de datos estructurados.
- Seleccion de caracteristicas (feature selection): identificacion de las variables mas relevantes mediante la atencion sobre la dimension de features.
- Seleccion de muestras (sample selection): identificacion de filas influyentes mediante la atencion sobre la dimension de muestras.
- Inferencia causal: soporte para analisis causal dentro de la misma receta de entrenamiento e inferencia.
- Generalizacion sin diseno de red por tarea: un unico modelo cubre el conjunto completo de tareas tabulares.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Scoring de riesgo crediticio: el modelo puede clasificar solicitudes a partir de variables tabulares heterogeneas (ingresos, historial, ratios) e imputar valores ausentes frecuentes en expedientes incompletos, sin necesidad de entrenar un modelo especifico por entidad.
- Prediccion de abandono de clientes (churn): tarea de clasificacion binaria sobre datos de uso, facturacion y soporte; la seleccion de caracteristicas integrada ayuda a identificar las variables con mayor poder predictivo.
- Enriquecimiento y limpieza de pipelines de datos: la imputacion de valores faltantes permite reparar tablas incompletas antes de alimentar otros sistemas analiticos, reduciendo el trabajo manual de preprocesado.
- Generacion de datos sinteticos tabulares: util para aumentar conjuntos de datos pequenos o sensibles, generar escenarios de prueba y compartir datos con terceros sin exponer registros reales.
- Mantenimiento predictivo industrial: regresion sobre lecturas de sensores y variables de proceso para estimar vida util o probabilidad de fallo de equipos.
- Deteccion de fraude en transacciones: clasificacion sobre variables estructuradas de operaciones, con capacidad de trabajar con campos ausentes o parcialmente informados.
- Analisis causal en experimentos y estudios observacionales: evaluacion de efectos de tratamiento sobre datos tabulares, aprovechando el soporte de inferencia causal del modelo.
- Reduccion de dimensionalidad en proyectos de analitica: uso de la seleccion de caracteristicas y de muestras como paso previo para simplificar modelos posteriores o abaratar el etiquetado.

## Benchmarks y rendimiento
No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye graficas comparativas y afirma que LimiX alcanza rendimiento SOTA en clasificacion, regresion e imputacion de valores faltantes, superando a XGBoost, a modelos clasicos de deep learning tabular y a modelos fundacionales tabulares existentes, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

| Benchmark | Tarea | Resultado |
|---|---|---|
| BCCO | Clasificacion | Solo grafica comparativa; sin cifras disponibles |
| TabArena | Clasificacion | Solo grafica comparativa; sin cifras disponibles |
| TabZilla | Clasificacion | Solo grafica comparativa; sin cifras disponibles |
| BCCO | Regresion | Solo grafica comparativa; sin cifras disponibles |
| TabArena | Regresion | Solo grafica comparativa; sin cifras disponibles |
| CTR23 | Regresion | Solo grafica comparativa; sin cifras disponibles |
| Imputacion de valores faltantes | Imputacion | Solo grafica comparativa; sin cifras disponibles |

## Requisitos de hardware
- VRAM para los pesos: con 16 millones de parametros, los pesos ocupan aproximadamente 32 MB en precision de 16 bits y unos 64 MB en precision de 32 bits (estimacion derivada del recuento de parametros, no confirmada en la informacion disponible).
- Cuello de botella real: al aplicar atencion sobre muestras y caracteristicas, el consumo de memoria crece con el numero de filas y columnas del conjunto de datos, no solo con el tamano del modelo. No se especifican limites maximos documentados.
- GPU recomendadas: no disponibles en la informacion proporcionada. El procedimiento de instalacion menciona CUDA 12.2 y compilacion de flash-attention 2.8.0, lo que implica soporte para GPU NVIDIA.
- GPU de consumo: por tamano de pesos, el modelo deberia caber en practicamente cualquier GPU de consumo con varios GB de VRAM (por ejemplo, gamas RTX), e incluso plantearse ejecucion en CPU; esta afirmacion es una estimacion basada en el numero de parametros y no una garantia publicada.
- Opciones de despliegue: el proyecto ofrece un Dockerfile y una instalacion manual con Python 3.12.7, PyTorch 2.7.1, torchvision 0.22.1, torchaudio 2.7.1, flash-attn 2.8.0, scikit-learn, einops, pandas, numpy, scipy, networkx, matplotlib, xgboost, kditransform y hyperopt. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La variante LimiX-2M se presenta explicitamente como mas rapida y con menor uso de memoria de GPU que LimiX-16M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimiX-1 16M | 16M | no disponible | Clasificacion, regresion, imputacion, generacion tabular, seleccion de features y muestras, inferencia causal | Apache 2.0 | HuggingFace y ModelScope (stable-ai) |
| LimiX-2M | no disponible | no disponible | Mismas tareas que LimiX-16M | Apache 2.0 | HuggingFace y ModelScope |
| XGBoost | no aplica (modelo de arboles) | no aplica | Clasificacion y regresion tabular | Apache 2.0 | Libreria de amplia difusion |
| Modelos fundacionales tabulares previos | no disponible | no disponible | Clasificacion y regresion | no disponible | no disponible |

La model card situa a LimiX por delante de XGBoost, de los modelos clasicos de deep learning tabular y de los modelos fundacionales tabulares existentes, pero no aporta cifras que permitan verificar la magnitud de esa diferencia. No se dispone de datos de parametros, contexto ni licencia de las alternativas citadas.

## Limitaciones y advertencias
- No se han publicado resultados numericos de benchmarks en la informacion disponible: todas las afirmaciones de superioridad son cualitativas y acompanadas unicamente de graficas.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-09-15, lo que indica validacion comunitaria practicamente nula y un modelo muy reciente.
- No se documentan sesgos conocidos, pero cualquier modelo entrenado sobre datos tabulares puede reproducir sesgos presentes en las variables y en la distribucion de los datos de entrenamiento.
- Riesgo de alucinacion: aunque el concepto de alucinacion no aplica igual que en modelos de lenguaje, existe riesgo de predicciones o imputaciones incorrectas cuando la distribucion de los datos de entrada se aleja de la del entrenamiento.
- No se especifica la longitud de contexto ni los limites maximos de filas y columnas; se desconoce el comportamiento con tablas muy anchas o muy largas.
- La licencia Apache 2.0 permite uso comercial segun la model card, pero el campo de licencia del repositorio en HuggingFace aparece como no disponible, por lo que conviene verificar la cabecera de licencia del repositorio antes de un despliegue en produccion.
- La denominacion del repositorio (LimiX-1_16M) y la del checkpoint (LimiX-16M) no coinciden exactamente; conviene confirmar que se descarga la version correcta.
- El nombre, los enlaces y las referencias de la model card pueden contener erratas: el enlace de descarga del checkpoint apunta a una organizacion distinta (stableai-org) de la del repositorio (stable-ai).
- La informacion de despliegue asume un entorno CUDA concreto (CUDA 12.2, PyTorch 2.7.1, flash-attn 2.8.0) y Python 3.12.7; versiones distintas pueden requerir recompilacion de flash-attention.

## Enlaces
- Repositorio del modelo en HuggingFace: https://huggingface.co/stable-ai/LimiX-1_16M
- Organizacion en HuggingFace: https://huggingface.co/stable-ai
- Checkpoint LimiX-16M: https://huggingface.co/stableai-org/LimiX-16M/tree/main
- Organizacion en ModelScope: https://modelscope.cn/organization/stable-ai
- Pagina del proyecto: https://www.limix.ai/
- Repositorio de codigo: https://github.com/limix-ldm/LimiX
- Informe tecnico en PDF: https://github.com/limix-ldm/LimiX/blob/main/LimiX_Technical_Report.pdf
- Dockerfile: https://github.com/limix-ldm/LimiX/blob/main/Dockerfile
- Paper original de LimiX: https://arxiv.org/abs/2509.03505
- Paper de LimiX-2M (ICML 2026): https://arxiv.org/abs/2606.04485
- Distribucion de flash-attention utilizada: https://github.com/Dao-AILab/flash-attention/releases/download/v2.8.0.post2/flash_attn-2.8.0.post2+cu12torch2.7cxx11abiTRUE-cp312-cp312-linux_x86_64.whl
