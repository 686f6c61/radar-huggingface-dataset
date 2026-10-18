# vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag

## Resumen

Este modelo es un codificador de electrocardiograma (ECG) basado en un Vision Transformer 1D, identificado como `1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag`. El nombre describe la receta completa: arquitectura ViT de tamano base, parches de 50 muestras, ventanas de 5000 muestras, preentrenamiento auto-supervisado (SSL) sobre datos de MIMIC y ajuste fino supervisado sobre las etiquetas diagnosticas de PTB-XL. Lo publica originalmente el laboratorio 4dm-labs y esta ficha corresponde a un mirror sin cambios en el repositorio del autor secundario.

El problema que resuelve es concreto: convertir una senal de 12 derivaciones en probabilidades sobre las superclases diagnosticas de PTB-XL, sirviendo como bloque de representacion para investigacion en ECG y para tareas derivadas (cribado, preanotacion, extraccion de embeddings). Cuenta con 92.724.044 parametros y se distribuye en `safetensors` bajo licencia Apache-2.0, con un repo de 0,4 GB que sugiere pesos en precision completa.

Su relevancia ahora es la de los modelos fundacionales de senal fisiologica: un backbone preentrenado a gran escala que evita entrenar desde cero en cada tarea clinica. Acompana al trabajo ECGFlow (Moody JB, et al., NEJM AI 2025), que documenta el uso previsto y el codigo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 1D (ViT sobre senal de ECG de 12 derivaciones), variante base |
| Parametros totales | 92.724.044 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como valor declarado; por nomenclatura, ventana de 5000 muestras procesada en parches de 50 muestras |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en `safetensors`, presumiblemente fp32 (repo de 0,4 GB) |
| Idiomas soportados | no aplica: la entrada es senal de ECG, no texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad de entrada | ECG de 12 derivaciones, 5000 muestras por registro (10 s a 500 Hz) |
| Tarea | Clasificacion diagnostica sobre PTB-XL (`ptbxl-diag`) |
| Preentrenamiento | Auto-supervisado (SSL) sobre MIMIC |
| Pipeline declarado en HuggingFace | no disponible |
| Autor original | 4dm-labs |
| Tipo de publicacion | mirror sin modificaciones del modelo original |

## Arquitectura y entrenamiento

Se trata de un transformer 1D que aplica el esquema de ViT a senales temporales: la serie de cada derivacion se divide en parches de 50 muestras (0,1 s a 500 Hz) y cada parche se proyecta a un embedding, al que se anaden codificaciones posicionales y el token de clasificacion. La nomenclatura indica una ventana de 5000 muestras, es decir, 10 segundos a 500 Hz, que es el formato estandar de los registros de 12 derivaciones en PTB-XL y MIMIC-IV-ECG. Con 92,7 M de parametros, el modelo se situa en el rango de un ViT-Base, lo que lo hace viable en una sola GPU convencional.

El entrenamiento es en dos fases. Primero, preentrenamiento auto-supervisado sobre MIMIC (marcado `ssl_mimic` en el identificador), lo que proporciona al backbone una representacion general de morfologia y ritmo cardiaco sin depender de etiquetas. Despues, ajuste fino supervisado sobre las anotaciones diagnosticas de PTB-XL (`ft_ptbxl-diag`). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la funcion de perdida ni si hubo aumentado de datos o calibracion posterior; tampoco aplican tecnicas de RLHF o DPO, habituales en modelos de lenguaje pero no en clasificadores de senal.

El modelo acompana al trabajo ECGFlow, publicado en NEJM AI en 2025, que constituye la referencia metodologica y de evaluacion. El codigo y la descripcion completos se encuentran en el repositorio de 4dm-labs.

## Capacidades

- Clasificacion diagnostica de ECG de 12 derivaciones sobre el esquema de etiquetas de PTB-XL. La informacion proporcionada no enumera las clases concretas; PTB-XL define habitualmente cinco superclases diagnosticas, por lo que se espera una salida multietiqueta sobre ellas, sin confirmacion explicita en la model card.
- Extraccion de representaciones: al ser un backbone ViT con token de clasificacion, es reutilizable como extractor de embeddings para busqueda de casos similares, clustering o modelos posteriores.
- Ajuste fino sobre tareas derivadas: la naturaleza de backbone preentrenado permite reentrenar la cabeza de clasificacion para nuevos conjuntos de etiquetas (ritmo, hipertrofia, alteraciones especificas).
- Procesamiento por lotes: la entrada es una matriz numerica de forma fija, lo que facilita el preprocesado determinista y el despliegue en pipelines.
- Soporte de tool calling o function calling: no. Es un clasificador de senal, no genera texto ni ejecuta llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La unica modalidad es la senal de ECG unidimensional.

## Casos de uso

- Triaje en urgencias y consulta: el modelo clasifica un ECG de 10 segundos en superclases diagnosticas y puede priorizar la revision de los registros con mayor probabilidad de infarto o alteracion de la repolarizacion, siempre como herramienta de apoyo y no como diagnostico autonomo.
- Preanotacion de datasets de ECG: aplicar el modelo sobre grandes volumenes de registros sin etiquetar (por ejemplo, cohortes de hospital o de Holter) para generar etiquetas candidatas que despues revise un cardiologo, reduciendo el coste de anotacion manual.
- Cribado retrospectivo en estudios de cohorte: procesar archivos historicos de ECG y cruzar las predicciones con desenlaces clinicos para generar hipotesis de investigacion, aprovechando que el modelo acepta un formato de entrada fijo y homogeneo.
- Extraccion de embeddings para busqueda de casos: usar las representaciones internas del backbone para construir un indice vectorial de ECGs y recuperar registros morfologicamente similares a uno dado, util en docencia y en revision de casos.
- Punto de partida para ajuste fino en tareas especificas: partir de estos pesos en lugar de inicializar aleatoriamente para tareas con pocas etiquetas (deteccion de fibrilacion auricular, hipertrofia ventricular, alteraciones del intervalo QT), reduciendo el volumen de datos necesario.
- Integracion en pipelines de investigacion reproducibles: al ser un `safetensors` de 0,4 GB con licencia Apache-2.0, puede incluirse en contenedores y ejecutarse en CPU o GPU para validaciones cruzadas entre centros y para auditorias de sesgo.
- Despliegue en dispositivos con recursos limitados: con 92,7 M de parametros, la inferencia en CPU es factible para procesamiento por lotes no interactivo, lo que permite analisis en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card accesible no incluye metricas de AUC, F1 ni comparaciones numericas sobre PTB-XL, y el pipeline declarado en HuggingFace figura como no disponible. Para cifras de evaluacion debe consultarse la publicacion asociada (Moody JB, et al., NEJM AI 2025) y el repositorio de ECGFlow.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con pesos en fp32 (92,7 M de parametros), alrededor de 0,2 GB en fp16 y cerca de 0,1 GB en int8, sin contar activaciones ni el lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes; una RTX 4090 o una A100 no son necesarias para el modelo en si, pero aceleran el procesamiento de volumenes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- CPU: la inferencia en CPU es viable para lotes no interactivos dado el reducido numero de parametros, aunque el throughput sera menor.
- Opciones de despliegue: PyTorch como via principal, con exportacion a ONNX o TorchScript para servir en produccion; vLLM, llama.cpp, Ollama y TGI no aplican porque estan orientados a modelos de lenguaje. Al no haber `pipeline` declarado en HuggingFace, es necesario cargar los pesos y la arquitectura desde el codigo de ECGFlow en lugar de usar `AutoModel`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada (ni parametros, ni contexto, ni resultados). La comparacion honesta exige consultar la literatura de modelos fundacionales de ECG y la propia publicacion ECGFlow. Como referencia interna, la unica variante directamente relacionada es el repositorio original del que este es mirror:

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag` (este repo, mirror) | 92.724.044 | ECG 12 derivaciones, 5000 muestras | Clasificacion PTB-XL | Apache-2.0 | HuggingFace |
| `4dm-labs/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag` (original) | 92.724.044 (mismo modelo) | ECG 12 derivaciones, 5000 muestras | Clasificacion PTB-XL | Apache-2.0 | HuggingFace |
| Otros modelos fundacionales de ECG | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un producto sanitario. No consta marcado CE ni autorizacion FDA, y no debe usarse para diagnostico clinico sin validacion local y supervision medica.
- Riesgo de sesgo poblacional: PTB-XL y MIMIC tienen composiciones demograficas y de equipos concretas; el rendimiento puede degradarse en otras poblaciones, en otros dispositivos de adquisicion o con derivaciones mal colocadas.
- Ruido de etiquetas: las anotaciones de PTB-XL proceden de informes y no de un gold standard unico, lo que introduce errores irreducible en la evaluacion.
- Dependencia del preprocesado: el modelo espera senales de 5000 muestras con un muestreo y una normalizacion determinados. Cambiar la frecuencia de muestreo, el offset o el filtrado sin replicar el pipeline original degrada las predicciones.
- Sin garantias de calibracion: la informacion disponible no documenta calibracion de probabilidades; no deben interpretarse las salidas como probabilidades clinicas directas.
- Naturaleza del mirror: este repositorio es una redistribucion no oficial. Para soporte, actualizaciones y contexto metodologico debe acudirse a 4dm-labs y al repositorio de ECGFlow.
- Documentacion incompleta: no hay `pipeline` declarado, ni lista de etiquetas, ni metricas publicadas en la informacion disponible, lo que exige trabajo adicional de validacion antes de cualquier uso en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se distribuye sin garantias y obliga a conservar los avisos de atribucion y el texto de la licencia.
- Ambito limitado: no procesa texto, no admite instrucciones en lenguaje natural y no puede emplearse en tareas de generacion, agentes o razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace (este mirror): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag
- Modelo original en HuggingFace (4dm-labs): https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ssl_mimic_ft_ptbxl-diag
- Codigo y descripcion (4dm-labs): https://github.com/4dm-labs/ecgflow
- Repositorio del autor del mirror: https://github.com/vlmurthylab/ecgflow
- Publicacion asociada (ECGFlow, NEJM AI 2025): https://doi.org/10.1056/AIoa2500164
