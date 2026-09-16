# stable-ai/LimiX-2M

## Resumen

LimiX-2M es un modelo fundacional para datos tabulares desarrollado por StableAI (repositorio `stable-ai/LimiX-2M` en HuggingFace), con tan solo 2 millones de parametros. A diferencia de los modelos de lenguaje, no procesa texto: su entrada son tablas (filas y columnas) y su salida son predicciones de clasificacion, regresion o valores imputados en celdas ausentes. Se presenta como una alternativa unificada a los pipelines clasicos de machine learning tabular (XGBoost, CatBoost, AutoGluon) y a TabPFN, sin necesidad de entrenamiento especifico por tarea ni ajuste de hiperparametros.

La relevancia del modelo radica en su enfoque de inferencia guiada por contexto (in-context learning): el usuario entrega el conjunto de entrenamiento completo como contexto y el modelo predice directamente sobre las filas nuevas. Esto elimina el reentrenamiento y los pipelines de preprocesado, y al ser tan pequeno puede ejecutarse en CPU o portatiles. La arquitectura es un transformer de 12 bloques con atencion por ejes (features y muestras) y el framework RaBEL, propuesto en el articulo asociado para mitigar el colapso de rango bajo y los cuellos de botella de atencion en modelos tabulares.

El modelo se distribuye como checkpoint PyTorch dentro de un repositorio de HuggingFace, con codigo de inferencia alojado en GitHub. La model card declara licencia Apache-2.0 para el codigo, pero impone una licencia separada para los pesos que reserva el uso comercial a una autorizacion expresa de StableAI, un caveat critico para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 12 bloques con atencion por ejes (features y muestras) y framework RaBEL |
| Parametros totales | 2 millones (2M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera por contexto de filas, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (los pesos se publican como checkpoint PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo tabular, no procesa lenguaje natural) |
| Licencia | Codigo: Apache-2.0. Pesos: licencia separada, uso academico libre y uso comercial sujeto a autorizacion de StableAI |
| Formato de pesos | Checkpoint PyTorch (`.ckpt`); el repositorio de HuggingFace ocupa 0.0 GB segun la ficha |

## Arquitectura y entrenamiento

LimiX-2M emplea un transformer de 12 bloques con atencion descompuesta por ejes: un eje atiende a lo largo de las caracteristicas (columnas) y otro a lo largo de las muestras (filas). El articulo que lo introduce describe el framework RaBEL, que expande cada valor escalar en caracteristicas RBF (funciones de base radial) compactas y localizadas, con el objetivo de mejorar el condicionamiento numerico y el rango efectivo de las capas superficiales. Segun la model card, esta eleccion ataca dos problemas concretos de los modelos fundacionales tabulares: el colapso de rango bajo y los cuellos de botella de atencion sobre datos estructurados.

El preentrenamiento se realiza mediante Context-Conditional Masked Modeling (CCMM). El procedimiento enmascara celdas de la tabla y condiciona la prediccion al resto de filas de contexto, de modo que el modelo aprende dependencias condicionales amplias entre columnas y entre muestras. Ese objetivo es el que habilita la inferencia sin entrenamiento posterior: el propio conjunto de entrenamiento actua como contexto en tiempo de inferencia. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Clasificacion tabular: prediccion de etiquetas categoricas a partir de filas con caracteristicas numericas y categoricas, sin fine-tuning por tarea.
- Regresion tabular: estimacion de objetivos continuos sobre el mismo esquema de inferencia por contexto.
- Imputacion de valores ausentes: relleno de celdas vacias dentro de la tabla, tratado como una tarea mas del mismo modelo.
- Razonamiento tabular unificado: un unico modelo cubre clasificacion, regresion e imputacion sin cabezas especificas ni ajuste de hiperparametros.
- Inferencia guiada por contexto (training-free): no requiere entrenamiento, ni pipelines de preprocesado, ni busqueda de hiperparametros.
- Despliegue ligero: inferencia en CPU y portatiles gracias a su tamano de 2M de parametros.
- Procesamiento offline y trazabilidad: la model card destaca despliegue sin conexion y transparencia total del modelo.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Soporte de agentes o razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingues, vision o audio: no aplica; el modelo no procesa texto, imagen ni audio.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Puntuacion de credito y riesgo financiero: el modelo recibe el historico de solicitudes con sus etiquetas como contexto y puntua nuevas solicitudes sin reentrenar, lo que simplifica la validacion de modelos y el despliegue en entornos regulados donde cada cambio de modelo exige reauditoria.
- Prediccion de abandono de clientes (churn): a partir de una tabla de clientes con caracteristicas de uso y una columna de baja, se obtiene una probabilidad de abandono para la base activa, con la ventaja de que el modelo se recalibra implicitamente al incluir cohortes recientes en el contexto.
- Triaje clinico sobre datos de laboratorio: clasificacion de pacientes a partir de analiticas tabulares, aprovechando la capacidad de imputacion para filas con pruebas incompletas, frecuentes en registros hospitalarios reales.
- Mantenimiento predictivo industrial: con lecturas de sensores en formato tabular, el modelo estima la probabilidad de fallo de un equipo y rellena huecos de telemetria perdida, todo sobre CPU en la propia planta sin enviar datos a la nube.
- Analisis de encuestas y ciencias sociales: imputacion de respuestas faltantes en cuestionarios y estimacion de variables objetivo, util cuando el numero de filas etiquetadas es pequeno y no compensa entrenar un modelo dedicado.
- Prototipado rapido y evaluacion comparativa: al no requerir entrenamiento, sirve como linea base inmediata frente a XGBoost o CatBoost en un cuaderno, reduciendo el tiempo de experimentacion de dias a minutos.
- Seleccion de caracteristicas y analisis exploratorio: las predicciones del modelo ante permutaciones de columnas permiten estimar la importancia relativa de variables en un conjunto de datos nuevo.
- Prediccion de precios o demanda: regresion sobre tablas de producto, historico y contexto temporal para estimar precios de venta o demanda agregada sin construir un pipeline de ingenieria de caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que LimiX-2M alcanza un nuevo estado del arte en clasificacion, regresion e imputacion de valores ausentes, por delante de XGBoost, CatBoost, AutoGluon y TabPFN, pero no incluye tablas de metricas, conjuntos de evaluacion ni cifras concretas. Los articulos citados (arXiv 2606.04485 y arXiv 2509.03505) son la fuente donde deberian consultarse esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 MB en precision fp32 (2M parametros x 4 bytes) y unos 4 MB en fp16, calculado a partir del numero de parametros; no se publican cifras oficiales de consumo.
- GPU recomendadas: el modelo es lo bastante pequeno para cualquier GPU, incluida una GTX 1650 o integradas modernas; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual gracias a su huella de memoria de pocos megabytes.
- CPU: la model card indica explicitamente que la arquitectura permite inferencia rapida en CPUs estandar y portatiles, sin necesidad de acelerador.
- Opciones de despliegue: el uso oficial requiere clonar el repositorio de GitHub, instalar Python 3.12.7, PyTorch 2.7.1, torchvision 0.22.1 y torchaudio 0.22.1, junto con scikit-learn, einops, huggingface-hub, matplotlib, networkx, numpy, pandas, scipy, tqdm, typing_extensions, xgboost, kditransform y hyperopt. Se recomienda Flash Attention 2 para un rendimiento optimo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimiX-2M | 2M | no disponible | Declarado SOTA por delante de XGBoost, CatBoost, AutoGluon y TabPFN, sin cifras publicadas en la informacion disponible | Codigo Apache-2.0; pesos con autorizacion comercial requerida | HuggingFace y GitHub |
| TabPFN | no disponible | no disponible | Superado por LimiX-2M segun la model card; sin cifras disponibles | no disponible | no disponible |
| XGBoost | no aplica (gradient boosting, no red neuronal) | no aplica | Referencia clasica en datos tabulares; superado por LimiX-2M segun la model card | Apache-2.0 | Libreria ampliamente distribuida |
| CatBoost | no aplica (gradient boosting) | no aplica | Referencia clasica en datos tabulares; superado por LimiX-2M segun la model card | Apache-2.0 | Libreria ampliamente distribuida |
| AutoGluon | no aplica (AutoML) | no aplica | Referencia de AutoML tabular; superado por LimiX-2M segun la model card | Apache-2.0 | Libreria ampliamente distribuida |

Los datos de parametros, contexto y licencia de los modelos comparados no se detallan en la informacion proporcionada, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Restriccion comercial de los pesos: aunque la etiqueta del repositorio indica Apache-2.0 y el codigo se publica bajo esa licencia, la model card especifica que los pesos tienen una licencia separada y que el uso comercial requiere autorizacion oficial de StableAI. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Discordancia de identificadores: la model card descarga los pesos desde `stableai-org/LimiX-2M`, mientras que el repositorio indicado en los metadatos es `stable-ai/LimiX-2M`. Conviene verificar cual es el espacio oficial antes de integrarlo.
- Dependencia de codigo externo: el ejemplo de uso llama a `LimiXPredictor` desde el repositorio de GitHub, no incluido en los pesos. Sin ese codigo, el checkpoint `.ckpt` por si solo no es utilizable.
- Sesgos: no se documenta ninguna evaluacion de sesgo o equidad, ni la composicion de los datos de preentrenamiento, por lo que se desconoce el comportamiento del modelo en subgrupos poco representados.
- Riesgo de alucinacion: en el contexto tabular, el riesgo equivalente es producir predicciones o imputaciones con aparente seguridad en columnas o dominios alejados de la distribucion de preentrenamiento, sin senal de incertidumbre documentada.
- Limitaciones de contexto: no se publica la longitud maxima de contexto en filas. Dado el caracter de inferencia por contexto, tablas de entrenamiento muy grandes podrian degradar el rendimiento o exceder la capacidad del modelo.
- Idiomas: el modelo no procesa lenguaje natural, por lo que no aplica soporte multilingue; cualquier dato textual en la tabla debe codificarse previamente.
- Ausencia de benchmarks publicos en esta informacion: las afirmaciones de estado del arte no van acompanadas de cifras verificables en el material disponible.
- Madurez del ecosistema: no hay soporte documentado para servidores de inferencia estandar (vLLM, TGI, Ollama) ni formatos de cuantizacion habituales, lo que complica la integracion en infraestructuras existentes.
- Fechas de publicacion inusuales: los identificadores de arXiv y las fechas de creacion y actualizacion del repositorio son posteriores a la fecha actual de analisis, un detalle que conviene contrastar con la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stable-ai/LimiX-2M
- Repositorio GitHub: https://github.com/limix-ldm-ai/LimiX
- Pagina del proyecto: https://www.limix.ai/
- Articulo LimiX-2M (arXiv 2606.04485): https://huggingface.co/papers/2606.04485
- Articulo LimiX (arXiv 2509.03505): https://arxiv.org/abs/2509.03505
- Web de StableAI (autorizacion comercial): https://www.stable-ai.ai/
- Resultados de busqueda web adicionales: no disponible (los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado)
