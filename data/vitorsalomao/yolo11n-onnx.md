# vitorsalomao/yolo11n-onnx

## Resumen

YOLO11n es la variante nano de la familia YOLO11 de Ultralytics, un detector de objetos de una sola etapa basado en una arquitectura convolucional (CNN). Este repositorio concreto, `vitorsalomao/yolo11n-onnx`, no contiene pesos nuevos ni un modelo reentrenado: son dos exportaciones a formato ONNX del checkpoint oficial `yolo11n.pt`, realizadas con `ultralytics` 8.4.208, opset 17 y batch estático de 1, pensadas para inferencia en CPU con ONNX Runtime.

El modelo detecta las 80 clases del dataset COCO y se ofrece en dos resoluciones de entrada, 416×416 y 640×640 píxeles, con salidas crudas de 1×84×3549 y 1×84×8400 respectivamente. La exportación se hizo sin NMS, de modo que el consumidor debe aplicar su propio umbral de confianza y supresión de no máximos. Es relevante para quienes necesitan desplegar detección de objetos en entornos sin GPU o con toolchains basadas en ONNX (servidores ligeros, edge, aplicaciones de escritorio, integraciones en C++, C# o Java).

Al tratarse de una exportación de un modelo oficial de Ultralytics, la licencia aplicable es AGPL-3.0, lo que condiciona su uso en productos comerciales cerrados. El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos de una etapa (familia YOLO11, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son float32) |
| Idiomas soportados | no disponible (modelo de visión; clases COCO en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (opset 17, batch estático 1, simplificado, sin NMS) |

Especificaciones adicionales de los ficheros publicados:

| Fichero | Entrada | Salida | SHA-256 |
|---|---|---|---|
| `yolo11n_416.onnx` | `images`, 1×3×416×416, float32 | `output0`, 1×84×3549 | `5c1693d60aa16efe327e134301005fb3f01d8aea2e45e00fe34ba347df691d4c` |
| `yolo11n_640.onnx` | `images`, 1×3×640×640, float32 | `output0`, 1×84×8400 | `1d49fd53d95a9793ddb9712095e08bb74f9511d8be216d21bf89bc3f9643a365` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de YOLO11 en su variante nano, una red convolucional de detección de objetos de una sola etapa. No se trata de un transformer ni de un modelo híbrido: es una CNN que predice directamente cajas y puntuaciones de clase sobre una rejilla de candidatos. El modelo fue entrenado por Ultralytics sobre el dataset COCO con sus 80 clases; este repositorio no aporta información sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables a un detector de objetos).

La innovación de este repositorio es puramente de despliegue: la exportación a ONNX con opset 17, simplificación del grafo, batch estático de 1 y eliminación del NMS del grafo. La salida es cruda: cada uno de los 3549 (416 px) o 8400 (640 px) candidatos contiene 84 valores, 4 para la caja (centro x, centro y, ancho y alto en píxeles de la entrada) y 80 puntuaciones de clase. El consumidor debe aplicar su propio umbral de confianza y NMS. No se documentan técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Detección de objetos en imágenes con las 80 clases del dataset COCO.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de CUDA ni de PyTorch en tiempo de ejecución.
- Dos resoluciones de entrada predefinidas: 416×416 (menor coste computacional) y 640×640 (mayor precisión en objetos pequeños).
- Salida cruda de cajas y puntuaciones de clase, lo que permite al integrador elegir umbral de confianza y algoritmo de NMS.
- Batch estático de 1: procesa una imagen por ejecución, sin soporte nativo de lotes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión multimodal, audio ni generación de texto.

## Casos de uso

- Detección de objetos en servidores sin GPU: al ser un ONNX de la variante nano, se puede ejecutar con ONNX Runtime en CPU para tareas de moderación de imágenes, conteo de personas o vehículos en lotes pequeños, sin necesidad de infraestructura con acelerador.
- Aplicaciones de escritorio y edge: integración en herramientas nativas (C++, C#, Java) mediante ONNX Runtime, con el fichero de 416 px para equipos de bajos recursos y el de 640 px cuando se requiere mayor detección de objetos pequeños.
- Preprocesado en pipelines de visión: uso como primer filtro para localizar regiones de interés antes de un modelo más pesado (OCR, clasificación fina o reconocimiento facial), reduciendo el coste total del pipeline.
- Prototipado rápido de sistemas de videovigilancia o análisis de tráfico: el modelo detecta personas, vehículos y señales de tráfico de COCO, suficiente para validar una idea antes de entrenar un detector específico.
- Automatización de inventario o control de calidad visual: detección de categorías genéricas de COCO como paso previo a un reentrenamiento con clases propias, usando estos ONNX como línea base reproducible.
- Integración en aplicaciones móviles o embebidas con toolchains ONNX: despliegue en dispositivos con ONNX Runtime Mobile, eligiendo la resolución de 416 px para minimizar latencia y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; para ejecución en GPU mediante ONNX Runtime con provider CUDA, el modelo nano es muy ligero y cabe holgadamente en cualquier GPU con al menos 2 GB de memoria, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no se especifican; al ser una exportación orientada a CPU, cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX Runtime; el modelo nano está diseñado para entornos de bajos recursos.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Mobile, y cualquier runtime compatible con ONNX (por ejemplo, OpenVINO o TensorRT mediante conversión adicional no documentada en el repositorio).
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la resolución (416 o 640) y del backend de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vitorsalomao/yolo11n-onnx` (este) | no disponible | 416×416 y 640×640 | ONNX | AGPL-3.0 | Hugging Face |
| `Ultralytics/YOLO11` (modelo base) | no disponible | múltiples resoluciones configurables | PyTorch (`.pt`) | AGPL-3.0 | Hugging Face / Ultralytics |
| Otras exportaciones ONNX de YOLO11n | no disponible | según exportación | ONNX | AGPL-3.0 | repositorios de terceros, no verificados en esta búsqueda |

La comparativa se limita al modelo base y a exportaciones equivalentes, ya que no se dispone de datos de benchmarks ni de especificaciones de parámetros en la información proporcionada. Frente al `.pt` original, este repositorio ofrece un artefacto listo para ONNX Runtime con batch estático y sin NMS, a costa de perder flexibilidad de resolución y de lotes.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en productos comerciales cerrados requiere cumplir con las obligaciones de la AGPL, lo que puede implicar la publicación del código fuente de la aplicación que lo integra. Revisar la licencia de Ultralytics antes de cualquier despliegue comercial.
- Sesgos conocidos: al entrenarse sobre COCO, hereda los sesgos de ese dataset en cuanto a representación de personas, contextos geográficos y categorías; no se documentan análisis de sesgo en este repositorio.
- Riesgo de falsos positivos y negativos: la salida es cruda y sin NMS; un umbral de confianza mal ajustado produce detecciones duplicadas o ausencias. Es responsabilidad del integrador calibrar el umbral y el NMS.
- Limitaciones de resolución: el batch es estático de 1 y las entradas están fijadas a 416×416 o 640×640; no se admite cambio dinámico de resolución ni procesamiento por lotes sin reexportar.
- Limitaciones de idioma: no aplica como modelo de lenguaje, pero las 80 clases de COCO están en inglés y no hay soporte de etiquetas en otros idiomas.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-17); no hay evidencia de validación por parte de la comunidad. Verificar los hashes SHA-256 publicados antes de usar los ficheros.
- No se documentan procesos de cuantización ni versiones INT8/FP16 en este repositorio; los ficheros publicados son float32.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vitorsalomao/yolo11n-onnx
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLO11
- Licencia de Ultralytics: https://ultralytics.com/license
