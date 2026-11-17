# TahiraKhan01/vit-beans-plant-disease

## Resumen

El modelo `TahiraKhan01/vit-beans-plant-disease` es un clasificador de imagenes basado en la arquitectura Vision Transformer (ViT), publicado en Hugging Face por el usuario TahiraKhan01. Segun el identificador y los tags del repositorio, esta disenado para la clasificacion de imagenes, presumiblemente orientado a la deteccion de enfermedades en plantas de judia (beans, en ingles). El modelo cuenta con 85.800.963 parametros (aproximadamente 86 millones) y un peso de repositorio de 0,3 GB en formato safetensors.

La relevancia de este modelo radica en su aplicacion potencial en agricultura de precision: la deteccion temprana de enfermedades foliares mediante vision por computador puede reducir perdidas de cultivo y optimizar el uso de fitosanitarios. La arquitectura ViT, introducida en el paper "An Image is Worth 16x16 Words" (arXiv:1910.09700), es especialmente adecuada para tareas de clasificacion de imagenes cuando se dispone de suficientes datos de entrenamiento o de un backbone preentrenado.

Sin embargo, la informacion publica disponible es muy limitada: la model card esta generada automaticamente y no contiene detalles sobre datos de entrenamiento, procedimiento de fine-tuning, metricas de evaluacion, licencia ni idiomas soportados. Esto limita seriamente la evaluacion rigurosa del modelo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.800.963 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT), el transformer originalmente descrito en el paper arXiv:1910.09700 (Dosovitskiy et al., 2020). El ViT divide la imagen de entrada en parches (patches) fijos, los proyecta linealmente en embeddings y los procesa mediante capas de atencion multi-cabeza. Con aproximadamente 86 millones de parametros, el tamano es compatible con variantes como ViT-Base (86M), lo que sugiere que se trata de un ViT-Base fine-tuneado o entrenado desde cero para la tarea de clasificacion de enfermedades en judias.

No se dispone de informacion sobre el dataset de entrenamiento (numero de imagenes, composicion de clases, tecnicas de aumento de datos), ni sobre si se partio de un checkpoint preentrenado en ImageNet o se entreno desde cero. Tampoco se documenta si se aplicaron tecnicas de regularizacion como mixup, cutmix o RandAugment, habituales en el fine-tuning de ViT. La model card no especifica hiperparametros de entrenamiento, regimen de precision (fp32, fp16, bf16) ni procedimiento de validacion. Toda esta informacion figura como "no disponible" en la documentacion publicada.

## Capacidades

- Clasificacion de imagenes: el pipeline declarado es `image-classification`, orientado a asignar una etiqueta a una imagen de entrada.
- Deteccion de enfermedades en plantas de judia: segun el identificador del modelo, se espera que clasifique imagenes de hojas de judia en categorias de enfermedad (sanas frente a distintas patologias), aunque las clases concretas no estan documentadas.
- Extraccion de caracteristicas visuales: al ser un ViT, los embeddings del token CLS pueden reutilizarse como representaciones visuales para tareas downstream (deteccion, segmentacion, recuperacion de imagenes), aunque no se documenta esta capacidad de forma explicita.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento (thinking), por tratarse de un modelo exclusivamente de vision.
- No se documentan capacidades de vision generativa, audio ni video.

## Casos de uso

- Diagnostico asistido en campo: integrado en una aplicacion movil, el modelo puede clasificar fotografias de hojas de judia tomadas por agricultores y devolver una etiqueta de enfermedad, permitiendo actuacion temprana antes de que la patologia se extienda al resto del cultivo.
- Monitorizacion de cultivos con drones: procesando imagenes aereas o de proximidad capturadas periodicamente, el clasificador puede generar mapas de incidencia de enfermedad por parcela, siempre que la resolucion y el encuadre de las imagenes sean compatibles con el entrenamiento del modelo.
- Triaje en estaciones de inspeccion agricola: en lineas de recepcion de producto, el modelo puede preclasificar lotes de judia descartando aquellos con signos visibles de enfermedad, reduciendo la carga de inspeccion manual.
- Investigacion agronomica: como baseline reproducible para comparar experimentos de fitopatologia o para etiquetar grandes volumenes de imagenes de campo recolectadas en estudios longitudinales.
- Sistemas de alerta temprana: combinado con un pipeline de captura automatizada (sensores IoT con camara), el clasificador puede disparar alertas cuando la proporcion de imagenes clasificadas como enfermas supera un umbral configurable.
- Educacion y extension agraria: herramienta de apoyo para tecnicos y estudiantes que necesiten identificar visualmente enfermedades de la judia, con la salvedad de que la precision real del modelo no esta documentada y requiere validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, ni metricas como accuracy, F1, precision o recall sobre conjuntos de test. Tampoco se documentan comparaciones con otros clasificadores de enfermedades de plantas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,8 millones de parametros, en fp32 el modelo ocupa aproximadamente 343 MB de pesos (0,34 GB); en fp16 aproximadamente 172 MB. La VRAM total necesaria depende del tamano de lote y de la resolucion de entrada, pero en inferencia por lotes pequenos (1-16 imagenes) deberia mantenerse por debajo de 2-4 GB en fp16, incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una NVIDIA RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso GPUs de gama baja como GTX 1650 (4 GB) pueden ejecutar inferencia en fp16 sin problemas. Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8-12 GB de VRAM (RTX 3080, RTX 4070, A10, A100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (Pipeline de `image-classification`), ONNX Runtime tras exportacion, TorchScript, y servidores de inferencia como TGI (aunque TGI esta optimizado para modelos de lenguaje, no para ViT) o Triton Inference Server. Para CPU, ONNX Runtime o OpenVINO son opciones razonables.
- Latencia y throughput estimados: no disponibles. Al no documentarse la resolucion de entrada ni el hardware de referencia, no es posible dar cifras fiables. Como orientacion generica para un ViT-Base a 224x224 en fp16 sobre una RTX 4090, la latencia por imagen suele situarse en el orden de milisegundos, pero esta estimacion no procede de datos del autor y debe validarse empiricamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TahiraKhan01/vit-beans-plant-disease | 85,8 M | no disponible (vision) | Clasificacion de enfermedades en judia | no disponible | Hugging Face (0 descargas) |
| google/vit-base-patch16-224 | 86 M | imagen 224x224 | Clasificacion general (ImageNet) | Apache 2.0 | Hugging Face, ampliamente usado |
| plantnet/plantnet-300k (referencia) | variable | imagen variable | Identificacion de especies vegetales | variable | Hugging Face |
| modelos de clasificacion de enfermedades de plantas en HF (p. ej., linkanjan/plant-disease) | variable | imagen variable | Clasificacion de enfermedades foliares | variable | Hugging Face |

La comparativa es limitada porque no se dispone de metricas del modelo evaluado. Frente a `google/vit-base-patch16-224`, el modelo de TahiraKhan01 parte presumiblemente de un backbone similar pero especializado en un dominio concreto (judia), lo que puede aportar ventaja en esa tarea especifica a costa de perder generalidad. Los modelos de PlantNet y clasificadores de enfermedades de plantas en Hugging Face cubren tareas relacionadas pero con dominios y datasets distintos, por lo que la comparacion directa requiere evaluacion sobre un conjunto de test comun.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card esta generada automaticamente y no contiene informacion sobre entrenamiento, evaluacion, licencia ni uso previsto. Esto impide verificar la calidad del modelo antes de desplegarlo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere contactar al autor o asumir riesgo legal.
- Riesgo de sobreajuste al dominio: al ser un modelo especializado en judia, es probable que falle ante otras especies vegetales, condiciones de iluminacion distintas o imagenes de baja resolucion no representadas en el entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que pueden existir sesgos hacia variedades concretas, regiones geograficas o condiciones de captura especificas.
- Riesgo de alucinacion en sentido amplio: como clasificador, el modelo siempre devolvera una etiqueta con una probabilidad, incluso ante imagenes fuera de distribucion (hojas de otras plantas, fondos irrelevantes). Es imprescindible calibrar umbrales de confianza y prever una clase "desconocida" o un mecanismo de rechazo.
- Sin metricas de rendimiento: no hay evidencia publica de precision, recall ni F1, por lo que no se puede recomendar su uso clinico o agronomico sin una validacion independiente sobre datos locales.
- Modelo con cero descargas y cero likes: indica ausencia de validacion por parte de la comunidad; su fiabilidad no ha sido contrastada por terceros.
- Limitaciones de contexto: no aplica en el sentido de texto, pero la resolucion de imagen de entrada y el preprocesamiento esperado no estan documentados, lo que puede provocar errores silenciosos si se alimenta con imagenes de dimensiones distintas a las usadas en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TahiraKhan01/vit-beans-plant-disease
- Paper de la arquitectura ViT: https://arxiv.org/abs/1910.09700
- Repositorio de referencia de ViT en transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/vit
- Documentacion del pipeline de clasificacion de imagenes: https://huggingface.co/docs/transformers/main/en/tasks/image_classification
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
