# Valentinkun/rfdetr-seg-nano-1008-cpu-doc

## Resumen

RF-DETR-Seg Nano (1008x1008) CPU ONNX es un modelo de segmentación de layout documental derivado de la familia RF-DETR de Roboflow, exportado a ONNX en precisión FP32 y optimizado para inferencia en CPU. Lo publica el usuario Valentinkun en Hugging Face bajo licencia Apache 2.0. El modelo resuelve la detección y segmentación de regiones en documentos escaneados, distinguiendo cuatro clases: texto impreso, texto manuscrito, sellos y firmas.

La relevancia de esta variante concreta está en su orientación a despliegue sin GPU: según la model card, ocupa aproximadamente 1,8 GB de RSS en memoria y presenta una latencia de unos 4,8 segundos por imagen en una CPU de 6 núcleos, trabajando a resolución 1008x1008. Esto lo sitúa en el nicho de pipelines de document AI que deben ejecutarse en servidores sin acelerador, entornos on-premise o sistemas embebidos donde una GPU dedicada no es viable.

El modelo se apoya en la arquitectura RF-DETR (Real-Time DETR), un transformer de detección y segmentación basado en DETR con búsqueda de arquitectura neuronal, descrito en el paper arXiv 2511.09554. La información disponible sobre esta variante concreta es limitada: no se detallan parámetros totales, composición del dataset de entrenamiento ni resultados de benchmarks específicos para el checkpoint publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time DETR), transformer de deteccion y segmentacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (exportacion ONNX, Opset 17); no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento linguistico directo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32, Opset 17) |
| Resolucion de entrada | 1008x1008 |
| Clases de salida | PRINTED_TEXT, HANDWRITTEN_TEXT, STAMP, SIGNATURE |
| Huella de memoria (RSS) | ~1,8 GB |
| Latencia declarada | ~4,8 s en CPU de 6 nucleos |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR, un transformer de detección y segmentación de la familia DETR que incorpora búsqueda de arquitectura neuronal (NAS) para optimizar el equilibrio entre precisión y latencia en tiempo real, según el paper arXiv 2511.09554. La variante "seg" añade una cabeza de segmentación de instancias sobre la detección, de modo que produce máscaras por región además de las cajas delimitadoras. Esta exportación concreta se ha convertido a ONNX en FP32 con Opset 17 y se ha orientado a ejecución en CPU.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de técnicas de alineación como RLHF o DPO (no aplicables en un modelo de visión de este tipo) ni sobre el proceso de destilación o ajuste fino que haya dado lugar a este checkpoint. La model card únicamente documenta la resolución de entrada, el formato de exportación, las clases de salida y las métricas de memoria y latencia. El modelo base del que deriva es Roboflow/rf-detr-seg-nano, disponible en Hugging Face.

## Capacidades

- Segmentación de layout documental a resolución 1008x1008, con máscaras por región.
- Detección de cuatro clases específicas: texto impreso, texto manuscrito, sellos y firmas.
- Inferencia en CPU sin necesidad de GPU, con huella de memoria declarada de ~1,8 GB.
- Exportación ONNX FP32 (Opset 17) compatible con runtimes ONNX estándar.
- Integración en pipelines de document AI y OCR como etapa de preprocesado o enrutado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo puramente visual.

## Casos de uso

- Digitalización de archivos históricos: el modelo separa texto impreso de texto manuscrito y localiza sellos y firmas, lo que permite enrutar cada región a un motor OCR especializado (por ejemplo, un OCR de manuscritos para las regiones HANDWRITTEN_TEXT y uno de imprenta para PRINTED_TEXT).
- Verificación de documentos firmados y sellados: la detección explícita de las clases STAMP y SIGNATURE permite construir un control automático que compruebe la presencia y posición de sellos y firmas en contratos o certificados antes de aceptarlos en un flujo administrativo.
- Preprocesado para pipelines OCR en servidores sin GPU: al ejecutarse en CPU con ~4,8 s por imagen en 6 núcleos, encaja en procesos por lotes nocturnos donde el throughput no es crítico pero no se dispone de acelerador.
- Extracción de regiones para modelos downstream: las máscaras de segmentación permiten recortar cada bloque del documento y pasarlo a modelos de reconocimiento o clasificación específicos, reduciendo el ruido que un OCR de página completa introduciría.
- Gestión documental on-premise: al ser ONNX FP32 y Apache 2.0, puede desplegarse en infraestructura propia sin dependencias de servicios en la nube, útil en sectores con requisitos de confidencialidad (legal, sanitario, administración pública).
- Automatización de archivo y clasificación: la proporción de regiones manuscritas frente a impresas y la presencia de sellos o firmas sirven como señales para clasificar documentos (por ejemplo, formularios rellenados a mano frente a documentos impresos sin firma).
- Procesamiento embebido o de borde: la huella de ~1,8 GB y el formato ONNX permiten evaluar su despliegue en equipos de gama alta sin GPU dedicada, siempre que la latencia de varios segundos por página sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card solo declara métricas operativas: ~1,8 GB de RSS y ~4,8 s de latencia por imagen en una CPU de 6 núcleos a resolución 1008x1008. El paper de RF-DETR (arXiv 2511.09554) evalúa la familia base frente a detectores y segmentadores comparables, pero no se dispone aquí de cifras específicas para esta variante documental.

## Requisitos de hardware

- VRAM: no aplica para esta exportación, diseñada para CPU; la model card declara ~1,8 GB de RSS en memoria del sistema.
- GPU: no requerida. Para ejecución en GPU habría que usar el modelo base Roboflow/rf-detr-seg-nano o reexportar el checkpoint a un runtime con soporte CUDA.
- CPU: la latencia declarada (~4,8 s) corresponde a un procesador de 6 núcleos; en CPUs con menos núcleos o menor frecuencia la latencia será previsiblemente mayor, y en CPUs de gama alta, menor.
- Cabe en cualquier equipo consumer con al menos ~2 GB de RAM libre para el proceso de inferencia, además de la memoria del runtime ONNX.
- Despliegue: ONNX Runtime (CPUExecutionProvider) es la opción natural dado el formato; también podría ejecutarse con otros runtimes compatibles con ONNX (por ejemplo, OpenVINO tras conversión, aunque no está documentado).
- Throughput estimado: en torno a 0,2 imágenes por segundo por proceso en la CPU de referencia; paralelizar por procesos es la vía para escalar en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Valentinkun/rfdetr-seg-nano-1008-cpu-doc | RF-DETR seg, 4 clases documentales | 1008x1008 | ONNX FP32, CPU | Apache 2.0 | ~4,8 s/imagen en CPU de 6 nucleos; ~1,8 GB RSS |
| Roboflow/rf-detr-seg-nano | RF-DETR seg base | no disponible en la informacion | Pesos originales (no ONNX) | no disponible en la informacion | Modelo del que deriva este checkpoint; requiere conversion para CPU |
| Detectores/segmentadores DETR genericos | Transformer de deteccion | variable | variable | variable | Comparables en arquitectura, no especializados en layout documental |

No se dispone de datos de rendimiento comparativo (mAP, IoU) entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y modo de despliegue.

## Limitaciones y advertencias

- El modelo está especializado en cuatro clases documentales; no detecta otras regiones (tablas, figuras, formulas, encabezados) salvo que se hayan mapeado a las clases existentes.
- La latencia de ~4,8 s por imagen limita su uso en escenarios interactivos o de alto throughput sin paralelización.
- No hay información publicada sobre el dataset de entrenamiento, por lo que se desconocen los sesgos de dominio (idiomas de los documentos, tipos de sello, caligrafías, calidades de escaneo) y su generalización fuera de la distribución de entrenamiento.
- Riesgo de falsos positivos y negativos en documentos con baja calidad de escaneo, sellos solapados con texto o firmas muy estilizadas; no se han publicado métricas de precisión que permitan acotar este riesgo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la licencia del modelo base Roboflow del que deriva antes de un despliegue en producción.
- El checkpoint se publicó el 2026-11-08 y no se documenta mantenimiento posterior; tratar como artefacto sin garantías de soporte.
- No procesa texto: cualquier extracción de contenido requiere un OCR o modelo de reconocimiento adicional en el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valentinkun/rfdetr-seg-nano-1008-cpu-doc
- Modelo base RF-DETR Seg Nano de Roboflow: https://huggingface.co/Roboflow/rf-detr-seg-nano
- Paper RF-DETR (Neural Architecture Search for Real-Time Detection Transformers): https://arxiv.org/html/2511.09554v1
