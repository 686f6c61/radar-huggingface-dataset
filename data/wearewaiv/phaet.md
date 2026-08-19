# wearewaiv/phaet

## Resumen

Phaet es un modelo de extracción de características de imágenes (image feature extraction) desarrollado por wearewaiv, especializado en el dominio de la patología digital. Se trata de un fine-tuning del modelo base owkin/phikon-v2, un Vision Transformer (ViT) entrenado con técnicas de aprendizaje auto-supervisado sobre datos histopatológicos. Phaet está diseñado para convertir tiles de imágenes de tejido (procedentes de whole slide images, WSI) en representaciones vectoriales densas que pueden utilizarse en tareas downstream como clasificación, segmentación o detección de biomarcadores.

El modelo cuenta con 303.351.808 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1,2 GB. Su pipeline es `image-feature-extraction`, lo que indica que no genera texto ni realiza razonamiento multimodal, sino que se limita a producir embeddings de imágenes. La relevancia de Phaet radica en que ofrece una alternativa fine-tuned y potencialmente más precisa que el modelo base para aplicaciones específicas de patología, aunque su acceso es restringido (gated) y su licencia es "other", lo que obliga a revisar las condiciones de uso antes de implementarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) basado en owkin/phikon-v2 |
| Parametros totales | 303.351.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin GGUF u otros formatos) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | other (acceso restringido, requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phaet es un encoder de imágenes basado en la arquitectura Vision Transformer (ViT), heredada de su modelo base owkin/phikon-v2. Phikon-v2 es un ViT entrenado con aprendizaje contrastivo y auto-supervisado sobre un gran corpus de imágenes histopatológicas, diseñado para producir representaciones robustas de tiles de tejido. Phaet es un fine-tuning de este modelo, lo que implica que se ha ajustado con datos adicionales o con una tarea específica dentro del dominio de patología, aunque los detalles exactos del dataset de fine-tuning no se han publicado en la información disponible.

El modelo se distribuye con la etiqueta `custom_code`, lo que sugiere que puede requerir código personalizado para su carga o uso. También se referencia un paper con identificador arXiv 2607.22861, aunque no se ha proporcionado el título ni el contenido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que al ser un modelo de visión estas técnicas no son habituales.

## Capacidades

- Extraccion de caracteristicas de imagenes histopatologicas: genera embeddings densos a partir de tiles de WSI, listos para ser usados en clasificacion, regresion o clustering.
- Especializacion en patologia: al ser un fine-tuning de Phikon-v2, esta optimizado para dominios medicos como deteccion de cancer, analisis de tejidos y biomarcadores.
- Integracion con pipelines de vision por computadora: compatible con la libreria transformers de HuggingFace, lo que facilita su uso en flujos de trabajo existentes.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que es exclusivamente un modelo de vision.

## Casos de uso

- Clasificacion de subtipos de cancer: dado un tile de tejido, Phaet extrae una representacion que puede alimentar un clasificador lineal o una red neuronal para distinguir entre subtipos tumorales (por ejemplo, adenocarcinoma vs. carcinoma escamoso).
- Deteccion de biomarcadores: los embeddings generados pueden utilizarse para predecir la expresion de proteinas o mutaciones geneticas a partir de imagenes de inmunohistoquimica o H&E.
- Segmentacion de regiones tumorales: combinando las caracteristicas de Phaet con una cabeza de segmentacion, es posible identificar areas de tejido maligno en WSI de alta resolucion.
- Recuperacion de imagenes similares: en una base de datos de casos de patologia, los embeddings permiten buscar casos histologicamente similares para apoyar el diagnostico o la investigacion.
- Integracion en sistemas de diagnostico asistido por ordenador (CAD): Phaet puede servir como extractor de caracteristicas en un pipeline que combine multiples modelos para la deteccion temprana de enfermedades.
- Investigacion en patologia digital: los investigadores pueden usar Phaet para generar representaciones de tejido y estudiar correlaciones con datos clinicos o genomicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas, ya que el modelo no esta orientado a tareas de texto o razonamiento general. Tampoco se han proporcionado metricas especificas de patologia (como AUC en clasificacion de cancer o Dice en segmentacion).

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 303M parametros, en precision FP16 ocuparia aproximadamente 600 MB de VRAM, y en FP32 unos 1,2 GB. Esto permite ejecutarlo en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque se recomienda una RTX 3060 o mejor para mayor comodidad.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como RTX 3060, RTX 4090, A100 o H100. Para fine-tuning se necesitaria al menos 8-12 GB de VRAM dependiendo del batch size.
- Opciones de despliegue: al ser un modelo de vision, se puede cargar con la libreria transformers de HuggingFace mediante `AutoModel` o `AutoImageProcessor`. No es compatible con vLLM ni llama.cpp, que estan orientados a modelos de lenguaje. Se puede servir como microservicio con FastAPI o TorchServe.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un ViT de 300M parametros procesa una imagen de 224x224 en decenas de milisegundos en una GPU moderna, pero depende del hardware y del batch.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para Phaet. El modelo base owkin/phikon-v2 es la referencia inmediata, pero no se han proporcionado especificaciones detalladas de este ultimo en la informacion disponible. Otros modelos de patologia como UNI o Virchow existen en el ecosistema, pero no se han incluido datos de comparacion en la documentacion de Phaet. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que es necesario aceptar las condiciones del autor antes de descargarlo. Esto puede limitar su uso en entornos corporativos o academicos si no se cumplen los requisitos.
- Licencia "other": no se especifica una licencia estandar (como Apache 2.0 o MIT). Es imprescindible revisar los terminos exactos para determinar si el uso comercial esta permitido.
- Solo vision: Phaet no procesa texto ni admite entradas multimodales. No puede utilizarse para tareas que requieran comprension de lenguaje natural.
- Sesgos potenciales: al ser un modelo entrenado con datos de patologia, puede heredar sesgos presentes en los datos de entrenamiento, como desequilibrios en tipos de tejido o poblaciones. No se ha publicado informacion sobre la composicion del dataset de fine-tuning.
- Riesgo de errores en diagnostico: aunque el modelo extrae caracteristicas utiles, no es un sistema de diagnostico autonomo. Cualquier aplicacion clinica debe ser validada y supervisada por profesionales.
- Sin informacion sobre cuantizacion: no se ofrecen versiones cuantizadas (GGUF, ONNX, etc.), lo que puede limitar su despliegue en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/wearewaiv/phaet
- Modelo base: https://huggingface.co/owkin/phikon-v2
- Paper asociado (arXiv): 2607.22861 (no se ha verificado el enlace directo, se referencia el identificador proporcionado)
