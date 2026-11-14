# wyyadd/FFDNet-L-cpu

## Resumen

FFDNet-L-cpu es la exportación ONNX optimizada para CPU del detector de objetos FFDNet-L, desarrollado por el autor wyyadd en el marco del proyecto CommonForms. El modelo resuelve una tarea muy concreta: detectar automáticamente los campos rellenables de un PDF (cuadros de texto, casillas de verificación y campos de firma) para convertir un documento estático en un formulario interactivo. Con 25 millones de parámetros, es un modelo pequeño y especializado, no un modelo de lenguaje generativo.

La relevancia del modelo radica en su aplicación práctica dentro del ecosistema CommonForms: permite procesar PDFs en local, sin GPU y sin depender de servicios externos, mediante una única exportación ONNX. Esto lo hace adecuado para pipelines de digitalización documental y automatización de formularios en entornos con recursos limitados.

La información disponible sobre el modelo es escasa: la model card describe la tarea, la arquitectura de detección y los resultados por clase, pero no detalla la licencia, los idiomas soportados ni la composición exacta del dataset de entrenamiento. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos (familia FFDNet), exportado a ONNX |
| Parametros totales | 25 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación CPU) |

## Arquitectura y entrenamiento

FFDNet-L es un detector de objetos de 25 millones de parámetros entrenado sobre el dataset del paper *CommonForms: A Large, Diverse Dataset for Form Field Detection* (arXiv:2509.16506). El modelo detecta tres clases de widgets en documentos: TextBoxes (cuadros de texto), ChoiceButtons (casillas de verificación) y Signature (campos de firma). La variante publicada en este repositorio es una exportación ONNX optimizada para inferencia en CPU, lo que implica una conversión del grafo original a un formato portable y una configuración orientada a ejecución sin acelerador hardware.

No se dispone de información detallada sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino posteriores. El dataset de referencia es `jbarrow/CommonForms`, disponible públicamente en Hugging Face. La resolución de inferencia por defecto es de 1600 píxeles, configurable mediante el argumento `--image-size`, y la model card reporta resultados a 1216 píxeles.

## Capacidades

- Detección de campos de formulario en PDFs en tres clases: cuadros de texto, casillas de verificación y campos de firma.
- Conversión automática de un PDF estático en un formulario rellenable, preservando o sustituyendo los campos existentes según configuración.
- Ejecución en CPU mediante exportación ONNX, sin necesidad de GPU.
- Modo rápido (`--fast`) que intercambia precisión por velocidad, aproximadamente la mitad del tiempo de inferencia en CPU.
- Umbral de confianza configurable (`--confidence`, por defecto 0,3) para controlar la sensibilidad de la detección.
- Uso mediante CLI (`commonforms input.pdf output.pdf`) o API de Python (`prepare_form`).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes: es exclusivamente un modelo de visión para detección de objetos.

## Casos de uso

- Digitalización de formularios administrativos: el modelo detecta los campos de un PDF escaneado o nativo y genera un formulario rellenable listo para su cumplimentación electrónica, reduciendo el trabajo manual de marcado de campos.
- Automatización de procesos de onboarding documental: en un pipeline de recepción de documentos, el modelo identifica cuadros de texto y casillas para que un sistema posterior pueda rellenarlos o validarlos automáticamente.
- Procesamiento por lotes en servidores sin GPU: al ser una exportación ONNX para CPU, permite procesar grandes volúmenes de PDFs en infraestructura estándar, sin coste de aceleradores.
- Integración en aplicaciones de gestión documental: mediante la API `prepare_form`, se puede incorporar la detección de campos en herramientas internas de archivo, gestoría o administración pública.
- Detección de campos de firma: con `--use-signature-fields`, el modelo distingue zonas de firma y las convierte en campos específicos, útil en contratos y documentos legales.
- Preprocesado para OCR y extracción de datos: los recuadros detectados sirven como regiones de interés para motores de OCR posteriores, mejorando la precisión de la extracción de datos estructurados.
- Prototipado rápido en local: la CLI permite probar la conversión de formularios en un portátil sin configuración de infraestructura, adecuada para validar flujos antes de desplegarlos en producción.

## Benchmarks y rendimiento

Resultados reportados en la model card (AP por clase y AP global, a 1216 píxeles):

| Modelo | Text | Choice | Signature | AP (↑) |
|---|---|---|---|---|
| FFDNet-S (1216px) | 61,5 | 71,3 | 84,2 | 72,3 |
| FFDNet-L (1216px) | 71,4 | 78,1 | 93,5 | 81,0 |

No se han publicado en la información disponible resultados comparativos con otros detectores de campos de formulario, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante CPU; el modelo está pensado para ejecutarse en memoria del sistema.
- GPU recomendadas: no disponibles para esta exportación; la CLI acepta `--device cuda` o índices de GPU, pero la variante publicada está optimizada para CPU.
- Cabe en cualquier equipo de consumo: con 25 millones de parámetros y un repositorio de 0,1 GB, la inferencia en CPU es viable en portátiles convencionales.
- Opciones de despliegue: paquete `commonforms` (instalable con `pip` o `uv`), CLI y API de Python; el formato ONNX permite su integración en runtimes compatibles.
- Latencia y throughput: no disponibles; la model card solo indica que el modo `--fast` reduce el tiempo a aproximadamente la mitad en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FFDNet-L-cpu | 25 M | Detección de campos de formulario | 81,0 | no disponible | Hugging Face (ONNX CPU) |
| FFDNet-L | 25 M | Detección de campos de formulario | 81,0 | no disponible | Repositorio commonforms |
| FFDNet-S | no disponible | Detección de campos de formulario | 72,3 | no disponible | Repositorio commonforms |

No se dispone de información sobre otros detectores de campos de formulario comparables en la documentación consultada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en detección de campos de formulario; no sirve para generación de texto ni otras tareas de lenguaje.
- La licencia no está especificada, por lo que el uso comercial no puede confirmarse sin consultar al autor o al repositorio del proyecto.
- No se documentan sesgos conocidos ni el impacto de la diversidad del dataset en la detección; el rendimiento puede degradarse en formularios con layouts atípicos o idiomas no representados en el entrenamiento.
- Riesgo de falsos positivos y negativos en la detección, mitigable ajustando el umbral `--confidence`, pero sin métricas publicadas de precisión y recall por clase más allá del AP.
- El modo `--fast` reduce la precisión a cambio de velocidad; no se cuantifica la pérdida exacta.
- La resolución de inferencia por defecto (1600 px) difiere de la reportada en los benchmarks (1216 px), por lo que los resultados pueden variar.
- Repositorio sin descargas ni interacciones registradas: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyyadd/FFDNet-L-cpu
- Paper CommonForms: https://arxiv.org/abs/2509.16506
- Dataset CommonForms: https://huggingface.co/datasets/jbarrow/CommonForms
- Repositorio y modelos del proyecto: https://github.com/jbarrow/commonforms/tree/main/commonforms/models
- Modelos alojados (demo): https://detect.semanticdocs.org
