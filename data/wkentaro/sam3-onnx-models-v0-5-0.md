# wkentaro/sam3-onnx-models-v0.5.0

## Resumen

SAM3 ONNX models es una colección de exportaciones a formato ONNX del modelo Segment Anything Model 3 (SAM3) de Meta, publicada por el desarrollador wkentaro a través del proyecto sam3-onnx. El modelo base, facebook/sam3, es la tercera iteración de la familia Segment Anything, centrada en la segmentación de instancias en imágenes guiada tanto por prompts visuales (cajas, puntos) como por prompts de texto en lenguaje natural. Esta exportación permite ejecutar el modelo con onnxruntime sobre CPU, GPU NVIDIA (CUDA) y Apple CoreML, eliminando la dependencia de PyTorch en producción.

El problema que resuelve es la portabilidad: los pesos originales de SAM3 requieren el stack completo de PyTorch y hardware con soporte CUDA, lo que complica el despliegue en entornos ligeros, servidores sin GPU, aplicaciones de escritorio o dispositivos Apple Silicon. Al dividir el modelo en cuatro módulos ONNX independientes (codificador de imagen, codificador de lenguaje, decodificador de texto/cajas y decodificador de puntos), el repositorio facilita despliegues modulares y eficientes.

La relevancia de esta ficha radica en que SAM3 introduce segmentación por texto (por ejemplo, segmentar todos los "coches" de una imagen con el prompt "car"), incluyendo cajas negativas para excluir regiones. El repositorio pesa 3,6 GB en total y se distribuye bajo la SAM License de Meta, que impone restricciones al uso comercial. No se trata de un modelo de lenguaje, por lo que conceptos como longitud de contexto o parámetros activos no aplican de la forma habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model 3 (SAM3): codificador de imagen + codificador de lenguaje + decodificadores de máscaras (arquitectura detallada no disponible en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el modelo base facebook/sam3 figura como cuantizado; detalle no especificado) |
| Idiomas soportados | no disponible |
| Licencia | SAM License (Meta); el código de exportación es MIT |
| Formato de pesos | ONNX |

Desglose de archivos del repositorio:

| Archivo | Tamano | Entrada |
|---|---|---|
| `sam3_image_encoder.onnx` | 1,9 GB | Imagen |
| `sam3_language_encoder.onnx` | 1,6 GB | Prompt de texto |
| `sam3_decoder.onnx` | 130 MB | Texto y cajas de ejemplo, incluidas cajas negativas |
| `sam3_point_decoder.onnx` | 20 MB | Puntos |

## Arquitectura y entrenamiento

SAM3 sigue el patrón de la familia Segment Anything: un codificador de imagen que extrae embeddings visuales, un codificador de lenguaje que procesa prompts de texto, y decodificadores ligeros que generan máscaras de segmentación combinando ambas fuentes de información. La novedad de esta exportación es la modularidad: el decodificador principal (`sam3_decoder.onnx`, 130 MB) acepta prompts de texto y cajas de ejemplo, incluyendo cajas negativas que permiten indicar explícitamente qué no segmentar, mientras que un decodificador de puntos (`sam3_point_decoder.onnx`, 20 MB) cubre el flujo clásico de SAM basado en clics.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el proceso de entrenamiento del modelo base no están disponibles en la información proporcionada; deben consultarse los recursos oficiales de Meta (repositorio facebookresearch/sam3). El modelo original fue entrenado por Meta; esta versión ONNX es únicamente una exportación realizada con la herramienta sam3-onnx, sin modificación de los pesos ni proceso de destilación adicional documentado.

## Capacidades

- Generación de máscaras de segmentación de instancias en imágenes (pipeline mask-generation).
- Segmentación guiada por texto: segmentar todas las instancias que coincidan con una descripción en lenguaje natural (por ejemplo, "car" o "person").
- Segmentación guiada por cajas: acepta cajas de ejemplo como referencia, incluyendo cajas negativas para excluir objetos de la segmentación.
- Segmentación interactiva por puntos mediante el decodificador ligero de 20 MB, compatible con el flujo de trabajo clásico de SAM.
- Ejecución multiplataforma con onnxruntime: CPU, GPU NVIDIA (CUDA) y Apple Silicon vía CoreML.
- Arquitectura modular: el codificador de imagen puede ejecutarse una vez por imagen y reutilizar el embedding con múltiples prompts, reduciendo el coste computacional en uso interactivo.
- No posee capacidades de generación de texto, razonamiento, código, ni modalidades de audio; es un modelo exclusivamente de visión con comprensión de prompts de texto cortos.

## Casos de uso

- Anotación de datasets de visión: integración en herramientas de etiquetado para generar máscaras de instancias a partir de prompts de texto o puntos, acelerando la creación de datasets de segmentación para entrenar detectores o segmentadores propios.
- Despliegue en CPU en servidores sin GPU: al funcionar con onnxruntime en CPU, puede integrarse en servicios backend ligeros (por ejemplo, filtrado de contenido visual o catalogación automática de imágenes) sin infraestructura CUDA.
- Aplicaciones de escritorio en macOS: el soporte de CoreML permite ejecutar la segmentación sobre la GPU de Apple Silicon en apps nativas, útil para edición fotográfica o recorte automático de objetos.
- Análisis automatizado de imágenes con prompts de texto: contar o localizar todos los objetos de una categoría descrita textualmente (por ejemplo, "vehículo" en imágenes de tráfico) sin entrenar un detector específico.
- Segmentación interactiva en tiempo casi real: gracias al decodificador de puntos de solo 20 MB, un usuario puede refinar máscaras con clics sucesivos reutilizando el embedding del codificador de imagen.
- Exclusión de objetos mediante cajas negativas: en escenas complejas, el operador indica qué regiones ignorar (por ejemplo, segmentar "persona" excluyendo reflejos o maniquíes), algo que los SAM anteriores no soportaban de forma nativa.
- Pipelines de preprocesamiento para modelos posteriores: extraer máscaras de instancias para difuminar rostros, eliminar fondos o aislar objetos antes de pasar las imágenes a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas de calidad de segmentación (mIoU, AP en COCO, LVIS, etc.) ni tiempos de inferencia medidos para esta exportación ONNX. Para evaluar el modelo base, remítase a los recursos oficiales de facebook/sam3.

## Requisitos de hardware

- VRAM / memoria estimada: el archivo mayor (`sam3_image_encoder.onnx`) pesa 1,9 GB en disco; se recomienda disponer de al menos 4-6 GB de RAM o VRAM libres para ejecutar el pipeline completo con holgura (estimación, no dato oficial).
- GPU NVIDIA: cualquier GPU con soporte CUDA y memoria suficiente para los ejecutores ONNX (por ejemplo, RTX 3060 o superior sería razonable; recomendación específica no disponible).
- Apple Silicon: soporte de CoreML para ejecutar sobre la GPU integrada de chips M1/M2/M3/M4, según la documentación del proyecto.
- Consumer GPUs: dado el tamaño moderado de los archivos (máximo 1,9 GB), el modelo debería ejecutarse en GPUs de consumo habituales como una RTX 3060/4060 o superior; no hay confirmación oficial.
- CPU: viable según el README, con ejecución vía `osam[cpu]` (recomendado en macOS).
- Despliegue: mediante la herramienta `osam` (`pip install 'osam[cpu]'` o `osam[gpu]`), o directamente con el script `infer_onnx.py` del repositorio sam3-onnx usando onnxruntime. No se documenta soporte para vLLM, TGI u Ollama (no aplicables, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Prompt | Tamano aprox. | Licencia |
|---|---|---|---|---|
| SAM3 ONNX (wkentaro, v0.5.0) | ONNX (4 módulos) | Texto, cajas (incl. negativas), puntos | 3,6 GB total | SAM License (Meta) |
| SAM2 (Meta) | PyTorch (exportaciones ONNX de terceros disponibles) | Puntos, cajas (sin texto) | no disponible | Apache 2.0 (SAM2) |
| MobileSAM / FastSAM | PyTorch / ONNX | Puntos, cajas | ~40 MB / ~130 MB | Apache 2.0 |

Notas de la comparativa: la ventaja diferencial de SAM3 frente a SAM2 y MobileSAM/FastSAM es la segmentación por prompt de texto y el soporte de cajas negativas. A cambio, su licencia (SAM License) es más restrictiva que la Apache 2.0 de las alternativas. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos están bajo la SAM License de Meta, que impone condiciones al uso comercial (prohibición de competir con Meta prestando el propio modelo como servicio, entre otras). Revise el texto de la licencia antes de cualquier despliegue comercial; el código de exportación sí es MIT.
- Riesgo de alucinación visual: el modelo puede generar máscaras espurias u omitir instancias con prompts ambiguos, especialmente con categorías poco comunes; no hay datos de fiabilidad publicados en la información disponible.
- Idiomas del codificador de lenguaje: no se especifican los idiomas soportados en los prompts de texto; en la práctica, se recomienda usar prompts en inglés, dado que los modelos de la familia SAM se entrenan principalmente con texto en inglés.
- Dependencia de terceros: se trata de una exportación comunitaria (wkentaro), no oficial de Meta; posibles diferencias de precisión respecto al modelo PyTorch original no están documentadas.
- Consumo de memoria: el codificador de imagen (1,9 GB) es la parte pesada del pipeline; en CPU la latencia puede ser elevada para imágenes de alta resolución.
- Sin benchmarks publicados: no hay métricas oficiales de esta exportación para validar calidad o rendimiento antes de producción; se aconseja evaluación propia sobre el dominio de datos objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wkentaro/sam3-onnx-models-v0.5.0
- Modelo base: https://huggingface.co/facebook/sam3
- Repositorio sam3 (Meta, oficial): https://github.com/facebookresearch/sam3
- Repositorio sam3-onnx (exportación): https://github.com/wkentaro/sam3-onnx
- Licencia del modelo: https://huggingface.co/wkentaro/sam3-onnx-models-v0.5.0/blob/main/LICENSE
