# YoanHristov/xraynpc4

## Resumen

xraynpc4 es un clasificador de imagenes de radiografia de torax basado en una ResNet-18, publicado por el usuario YoanHristov en Hugging Face. Forma parte de lo que el autor denomina "Part 4 model of the Veritas AI 2026 notebook", un experimento de investigacion en el que se entreno la red sobre el conjunto de datos COVID-QU-Ex tras filtrar las imagenes que un modelo Gemini habia etiquetado como "Unacceptable" (con al menos un 70 % de confianza y afectando como maximo al 30 % de una clase).

El modelo no es un modelo de lenguaje ni un modelo generativo: es un clasificador de vision por computadora orientado a la deteccion de patologias en radiografias de torax. El repositorio es muy pequeno (0,1 GB), contiene un unico fichero de pesos `resnet18.pt` en formato state_dict de torchvision y un `config.json` que documenta el preprocesado y las clases de salida. Se distribuye bajo licencia "other" y esta marcado explicitamente por el autor como prototipo de investigacion, no como dispositivo medico.

Su relevancia es limitada y acotada al ambito de la experimentacion: sirve como referencia reproducible de un pipeline de clasificacion medica con curado de datos asistido por un LLM, y como punto de partida para quien quiera replicar o auditar ese tipo de flujo. No dispone de model card extensa, benchmarks publicados ni pipeline declarado en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, torchvision) |
| Parametros totales | no disponible (ResNet-18 estandar de torchvision: aproximadamente 11,7 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de vision) |
| Licencia | other |
| Formato de pesos | `resnet18.pt` (state_dict de torchvision); `config.json` con preprocesado y clases |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18, una red neuronal convolucional residual con 18 capas (bloques residuales basicos) ampliamente utilizada como baseline en vision por computadora. Los pesos se distribuyen como `resnet18.pt` en formato state_dict de torchvision, lo que implica que para cargarlos hay que instanciar primero el modelo `torchvision.models.resnet18` y aplicar `load_state_dict`. El `config.json` del repositorio contiene la informacion de preprocesado (probablemente normalizacion y redimensionado) y la lista de clases de salida.

El entrenamiento se realizo exclusivamente sobre el conjunto COVID-QU-Ex, un dataset publico de radiografias de torax con categorias de COVID-19, neumonia viral, neumonia bacteriana y normal (la composicion exacta de clases debe consultarse en el `config.json`). El elemento diferencial del pipeline es el curado de datos: antes del entrenamiento se eliminaron las imagenes que un modelo Gemini habia calificado como "Unacceptable", aplicando un umbral de confianza de al menos el 70 % y limitando el descarte a un maximo del 30 % de cada clase. No se documentan en la model card el numero de epocas, la funcion de perdida, el optimizador, el tamano del split de validacion ni si hubo aumento de datos o ajuste fino de hiperparametros.

## Capacidades

- Clasificacion de imagenes de radiografia de torax en las clases definidas en el `config.json` del repositorio.
- Deteccion de patrones asociados a patologias pulmonares (COVID-19 y neumonias, segun el dataset COVID-QU-Ex), siempre como prototipo de investigacion.
- Inferencia ligera: al tratarse de una ResNet-18, el coste computacional es bajo y puede ejecutarse en CPU o en GPU de gama baja.
- Integracion sencilla en pipelines de PyTorch/torchvision mediante carga de state_dict.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision general: esta especializado en un unico dominio de imagen medica.
- No dispone de modo "thinking", audio ni modalidades adicionales.

## Casos de uso

- Prototipado academico de clasificacion de radiografias de torax: util como baseline reproducible para comparar tecnicas de curado de datos o de aumento de datos en un curso o articulo.
- Auditoria de pipelines de curado asistido por LLM: permite estudiar como afecta el filtrado de imagenes "Unacceptable" por parte de Gemini al rendimiento final del clasificador.
- Docencia en vision por computadora medica: ejemplo completo y ligero (0,1 GB) para ensenar carga de state_dict, preprocesado desde `config.json` e inferencia con torchvision.
- Experimentos de transferencia: la ResNet-18 preentrenada en COVID-QU-Ex puede servir de inicializacion para tareas relacionadas con radiografia de torax en investigacion.
- Evaluacion de robustez y sesgos de dataset: al conocer el proceso de filtrado, es un caso de estudio para medir el impacto de eliminar muestras ambiguas en la equidad entre clases.
- Pruebas de integracion en herramientas de investigacion (scripts de PyTorch, notebooks), no en entornos clinicos reales.
- No es adecuado para triaje, diagnostico ni asistencia clinica: el propio autor lo declara prototipo de investigacion y no dispositivo medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, sensibilidad, especificidad, AUC ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una ResNet-18 (aproximadamente 11,7 M parametros, dato estandar de torchvision no confirmado en la model card); en FP16 se reduce a la mitad.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; una NVIDIA T4, RTX 3060 o superior ofrece latencia minima. Tambien funciona en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida; en CPU la inferencia por imagen es del orden de milisegundos a decenas de milisegundos.
- Opciones de despliegue: PyTorch nativo con torchvision, TorchScript, ONNX Runtime o TensorRT para optimizacion. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la arquitectura se espera un throughput alto en lotes pequenos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xraynpc4 (YoanHristov) | ResNet-18 | no disponible (aprox. 11,7 M estandar) | no aplica | other | Hugging Face, 37 descargas |
| ResNet-18 preentrenada en ImageNet (torchvision) | ResNet-18 | aprox. 11,7 M | no aplica | BSD-3-Clause | torchvision |
| COVID-Net (Wang et al.) | CNN especifica para radiografia | no disponible en esta ficha | no aplica | codigo abierto con condiciones | GitHub |
| CheXNet (Rajpurkar et al.) | DenseNet-121 | aprox. 8 M | no aplica | investigacion | GitHub |

La comparativa es orientativa: no se dispone de metricas de xraynpc4 que permitan una comparacion cuantitativa con COVID-Net o CheXNet.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no es un dispositivo medico; no debe usarse para diagnostico, triaje ni decision clinica.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la model card; es necesario contactar con el autor o revisar el repositorio antes de cualquier uso productivo.
- Dataset unico y filtrado: el entrenamiento se limita a COVID-QU-Ex con un subconjunto eliminado por Gemini; esto puede introducir sesgos de seleccion y reducir la generalizacion a otras poblaciones, equipos de rayos X o protocolos de adquisicion.
- Riesgo de sobreajuste al dominio: al ser una ResNet-18 entrenada sobre un unico dataset, es probable que el rendimiento caiga fuera de la distribucion de COVID-QU-Ex.
- Sin metricas publicadas: no hay forma de verificar la calidad del modelo a partir de la informacion disponible.
- Sin soporte multilingue ni de texto: no aplica a tareas de NLP.
- Documentacion minima: la model card no detalla hiperparametros, split de validacion ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Fecha de creacion futura en los metadatos del Hub (2026-11-15): conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoanHristov/xraynpc4
- Dataset COVID-QU-Ex (referencia del entrenamiento): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
