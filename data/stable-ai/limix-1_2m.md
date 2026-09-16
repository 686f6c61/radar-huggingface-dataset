# stable-ai/LimiX-1_2M

## Resumen

LimiX es un modelo fundacional para datos estructurados (tabular data) desarrollado por stable-ai, presentado como el primer miembro de su serie LDM (Large Structured-Data Foundation Model). A diferencia de los modelos de lenguaje, LimiX no genera texto: modela la distribucion conjunta de variables y valores ausentes en tablas, de forma que un unico modelo cubre clasificacion, regresion, imputacion de valores faltantes, seleccion de caracteristicas, seleccion de muestras e inferencia causal sin necesidad de disenar redes especificas por tarea. El repositorio `stable-ai/LimiX-1_2M` corresponde a la variante pequena de la familia, junto a LimiX-16M.

La relevancia del modelo esta en su enfoque de "aprendizaje tabular de estilo fundacional": sustituir los pipelines artesanales (ingenieria de caracteristicas, ajuste de hiperparametros, un modelo por problema) por inferencia directa sobre una tabla de entrada. La model card afirma que supera a XGBoost, a modelos tabulares profundos clasicos y a otros modelos fundacionales tabulares existentes en benchmarks de 10 conjuntos de datos estructurados de referencia, aunque no se proporcionan cifras numericas en la informacion disponible, solo figuras comparativas.

La arquitectura es un transformer adaptado a datos estructurados: embebe caracteristicas X y objetivos Y en representaciones tipo token y aplica atencion tanto en la dimension de muestras como en la de caracteristicas, con cabezas de regresion y clasificacion. La variante 2M fue aceptada en ICML 2026 (arXiv:2606.04485) y se libera bajo licencia Apache 2.0, con menor consumo de memoria GPU y mayor velocidad de inferencia que LimiX-16M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer optimizado para datos estructurados (atencion sobre dimensiones de muestra y de caracteristica, cabezas de clasificacion y regresion) |
| Parametros totales | No disponible con precision. La nomenclatura de la familia indica variantes de 16M y 2M; el ID del repositorio es LimiX-1_2M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en el contexto tabular, depende del numero de filas y columnas que soporte el modelo) |
| Tipos de cuantizacion | No disponible. La model card solo documenta checkpoints en precision completa (`.ckpt`) |
| Idiomas soportados | No aplica / no disponible (modelo sobre datos tabulares, no sobre texto) |
| Licencia | Apache 2.0 (segun la model card: "All model resources are open-sourced under the Apache 2.0 License") |
| Formato de pesos | Checkpoint de PyTorch (`.ckpt`, p. ej. `LimiX-2M.ckpt`); no se documentan safetensors ni GGUF |

## Arquitectura y entrenamiento

LimiX emplea una arquitectura transformer disenada especificamente para modelado de datos estructurados y generalizacion entre tareas. El flujo descrito en la model card es el siguiente: el modelo embebe las caracteristicas X y los objetivos Y procedentes de una "base de conocimiento previo" (prior knowledge base) en representaciones tipo token; a continuacion, en los modulos centrales, se aplican mecanismos de atencion sobre dos ejes distintos, la dimension de muestras (filas) y la dimension de caracteristicas (columnas), para identificar patrones relevantes en muestras y caracteristicas clave; finalmente, las representaciones de alta dimension se envian a cabezas de regresion y clasificacion, lo que permite cubrir tareas predictivas diversas con un unico flujo de entrenamiento e inferencia.

Un elemento diferencial que menciona la model card es un mecanismo de recuperacion (retrieval) que, en la version 2M, se ha mejorado para incrementar el rendimiento del modelo al tiempo que reduce el tiempo de inferencia y el consumo de memoria. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus tabular, ni si se emplearon tecnicas de ajuste como RLHF o DPO (no aplicables en el sentido habitual a un modelo tabular). La model card indica cobertura de tareas de clasificacion, regresion, imputacion de valores ausentes, seleccion de caracteristicas, seleccion de muestras, inferencia causal y generacion tabular bajo una misma receta de entrenamiento.

## Capacidades

- Clasificacion tabular: prediccion de etiquetas categoricas a partir de tablas con caracteristicas mixtas.
- Regresion tabular: prediccion de variables objetivo continuas.
- Imputacion de valores ausentes: reconstruccion de celdas faltantes modelando la distribucion conjunta de las variables.
- Seleccion de caracteristicas y de muestras: identificacion de columnas y filas relevantes para la tarea.
- Inferencia causal sobre datos estructurados.
- Generacion tabular: sintesis de filas con la distribucion aprendida.
- Modelado conjunto de variables y valores ausentes, sin diseno de red especifico por tarea (zero-shot / in-context sobre la tabla de entrada).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Prediccion de riesgo de credito: introducir directamente la tabla de solicitudes con sus variables socioeconomicas e historico y obtener la probabilidad de impago, evitando reentrenar un modelo por cada cambio en el conjunto de variables.
- Scoring de abandono de clientes (churn): usar la tabla de actividad del cliente y obtener la clasificacion binaria de abandono en una sola pasada, con manejo nativo de campos ausentes frecuentes en CRM.
- Imputacion de historiales clinicos incompletos: rellenar valores faltantes de analiticas y variables demograficas antes de alimentar un estudio estadistico, aprovechando el modelado conjunto de variables.
- Mantenimiento predictivo industrial: regresion sobre series de sensores agregadas por equipo para estimar vida util restante, con tolerancia a lecturas perdidas de sensores.
- Deteccion de fraude en transacciones: clasificacion sobre tablas de operaciones con alta proporcion de campos opcionales, donde la imputacion y la clasificacion se resuelven con el mismo modelo.
- Seleccion de variables en estudios de investigacion: cribar que caracteristicas de una tabla aportan senal predictiva antes de construir un modelo interpretable o un analisis causal.
- Generacion de datos sinteticos tabulares para aumentar conjuntos pequenos o enmascarar datos personales en entornos de pruebas.
- Analisis causal en experimentos empresariales: estimar efectos de tratamiento a partir de tablas observacionales con covariables y valores ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras numericas en la informacion disponible. La model card incluye unicamente figuras comparativas de los conjuntos BCCO (clasificacion y regresion), TabArena (clasificacion y regresion), TabZilla (clasificacion), CTR23 (regresion) y un grafico de imputacion de valores ausentes, frente a XGBoost, modelos tabulares profundos clasicos y modelos fundacionales tabulares. Las afirmaciones cualitativas del autor son: rendimiento SOTA en clasificacion, regresion e imputacion de valores ausentes, y superioridad sobre XGBoost y los modelos comparados en 10 conjuntos de datos estructurados de referencia. Estas afirmaciones no van acompanadas de tablas de cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Para una variante de ~2 millones de parametros, el peso del modelo en precision completa ocuparia del orden de decenas de MB, por lo que el consumo real vendra dominado por la atencion sobre filas y columnas, la base de conocimiento previo y el tamano de la tabla de entrada, no por el numero de parametros.
- GPU recomendadas: no especificadas por el autor. La guia de instalacion asume entorno CUDA (imagen base `nvidia/cuda:12.2.0-base-ubuntu22.04`), es decir, una GPU NVIDIA.
- GPU de consumo: por el reducido numero de parametros, es esperable que quepa en GPU de consumo (por ejemplo, RTX 4090 o inferiores), aunque el autor no publica requisitos minimos de VRAM.
- Dependencias de software: Python 3.12.7, PyTorch 2.7.1, torchvision 0.22.1, torchaudio 2.7.1, `flash_attn` 2.8.0.post2 (compilado para CUDA 12 y C++11 ABI), scikit-learn, einops, huggingface-hub, matplotlib, networkx, numpy, pandas, scipy, tqdm, typing_extensions, xgboost, kditransform y hyperopt.
- Opciones de despliegue: Docker (Dockerfile oficial) o instalacion manual del entorno Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. La model card indica cualitativamente que LimiX-2M ofrece menor uso de memoria GPU y mayor velocidad de inferencia que LimiX-16M, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimiX-2M / LimiX-1_2M | ~2M (segun nomenclatura; dato exacto no disponible) | No disponible | Clasificacion, regresion, imputacion, seleccion de caracteristicas y muestras, inferencia causal, generacion tabular | Apache 2.0 | HuggingFace (`stable-ai/LimiX-1_2M`) y ModelScope |
| LimiX-16M | 16M (segun nomenclatura) | No disponible | Clasificacion, regresion, imputacion de valores ausentes | Apache 2.0 | HuggingFace (`stableai-org/LimiX-16M`) |
| XGBoost | No aplica (modelo de gradiente boosting, no fundacional) | No aplica | Clasificacion y regresion tabular | Apache 2.0 | Ampliamente disponible |
| Modelos fundacionales tabulares previos | No disponible | No disponible | Clasificacion y regresion tabular | No disponible | No disponible |

La model card situa a LimiX por encima de XGBoost y de los modelos fundacionales tabulares existentes, pero no ofrece cifras ni nombres concretos de esos modelos comparables, por lo que no es posible construir una comparativa cuantitativa con la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta instrucciones en lenguaje natural, tool calling ni agentes. Cualquier caso de uso conversacional queda fuera de su alcance.
- Ausencia de datos numericos publicados: las afirmaciones de rendimiento SOTA se apoyan en figuras de la model card, sin tablas de metricas verificables en la informacion disponible.
- Sesgos: no documentados. Al entrenarse sobre datos tabulares de origen no especificado, puede heredar sesgos presentes en esos datos (por ejemplo, variables sensibles correlacionadas con el objetivo), sin que el autor describa mitigaciones.
- Riesgo de predicciones poco fiables fuera de la distribucion de las tablas de entrenamiento, especialmente con esquemas de columnas muy distintos o con un numero reducido de filas.
- El modelo no documenta explicitamente su licencia en los metadatos de HuggingFace (aparece como "no disponible"); la licencia Apache 2.0 se declara en la model card, por lo que conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Restricciones de contexto: se desconoce el numero maximo de filas y columnas soportado; con tablas muy anchas o muy largas el coste de atencion puede crecer de forma significativa.
- El repositorio `stable-ai/LimiX-1_2M` figura con 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos no estan alojados ahi o que el repositorio esta vacio; conviene comprobar los repositorios alternativos de la organizacion antes de desplegar.
- Dependencia de `flash_attn` y de versiones muy concretas de PyTorch y CUDA, lo que complica la reproducibilidad del entorno.
- No se documentan cuantizaciones oficiales ni formatos ligeros, por lo que el despliegue en CPU o en entornos restringidos requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stable-ai/LimiX-1_2M
- Organizacion en HuggingFace: https://huggingface.co/stable-ai
- Variante LimiX-16M: https://huggingface.co/stableai-org/LimiX-16M/tree/main
- Paper original: https://arxiv.org/abs/2509.03505
- Paper de LimiX-2M (ICML 2026): https://arxiv.org/abs/2606.04485
- Pagina del proyecto: https://www.limix.ai/
- Repositorio de codigo: https://github.com/limix-ldm/LimiX
- Informe tecnico: https://github.com/limix-ldm/LimiX/blob/main/LimiX_Technical_Report.pdf
- Dockerfile oficial: https://github.com/limix-ldm/LimiX/blob/main/Dockerfile
- ModelScope: https://modelscope.cn/organization/stable-ai
- Los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.
