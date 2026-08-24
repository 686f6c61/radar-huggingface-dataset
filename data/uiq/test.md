# uiq/test

## Resumen

El repositorio `uiq/test` aloja un proyecto denominado DeepSeek-OCR: PDF to Markdown Converter, una solución de OCR que convierte documentos PDF a formato Markdown utilizando el modelo DeepSeek-OCR como motor de reconocimiento. El proyecto incluye un backend FastAPI, scripts de procesamiento por lotes y una API REST, lo que permite integrar la conversión de documentos en flujos de trabajo automatizados. Aunque el repositorio está publicado bajo el usuario `uiq`, la model card indica que el modelo subyacente es `deepseek-ai/DeepSeek-OCR`, descargado desde Hugging Face.

La relevancia de este proyecto radica en la creciente necesidad de digitalizar documentos en entornos empresariales y de investigación, donde la conversión fiel de PDFs a Markdown facilita el procesamiento posterior, la indexación y la generación de documentación estructurada. El proyecto ofrece múltiples variantes de procesamiento (conversión estándar, OCR plano, prompts personalizados) y un despliegue basado en Docker, lo que simplifica su adopción en infraestructuras existentes.

No se dispone de información técnica detallada sobre el modelo DeepSeek-OCR en la documentación proporcionada (arquitectura, número de parámetros, contexto, etc.). El repositorio tiene un tamaño de 175.7 GB, lo que sugiere que contiene los pesos del modelo, pero no se especifican sus características internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura del modelo DeepSeek-OCR, los datos de entrenamiento, el número de tokens procesados ni las técnicas de optimización empleadas. La model card del repositorio se centra exclusivamente en el uso práctico del modelo a través de scripts y la API, sin entrar en detalles técnicos del modelo subyacente. Por tanto, no es posible describir la arquitectura, el proceso de entrenamiento ni las innovaciones técnicas del modelo.

## Capacidades

- Conversión de documentos PDF a formato Markdown, preservando la estructura del documento (títulos, listas, tablas, etc.).
- Extracción de texto plano mediante OCR, sin formato adicional, útil para documentos escaneados o imágenes.
- Extracción y guardado de imágenes contenidas en los PDFs durante el proceso de conversión.
- Procesamiento con prompts personalizados, permitiendo adaptar la salida a necesidades específicas mediante un archivo YAML de configuración.
- Post-procesamiento de la salida: limpieza de tokens especiales, procesamiento de referencias de layout y limpieza de contenido.
- Integración con FastAPI para ofrecer una API REST, facilitando la integración con otras aplicaciones.
- Despliegue mediante Docker y Docker Compose, con soporte para GPU NVIDIA (CUDA 11.8+).

## Casos de uso

- Digitalización de documentos corporativos: convertir contratos, facturas o informes en PDF a Markdown para su almacenamiento en sistemas de gestión documental, facilitando la búsqueda y el análisis posterior.
- Generación de documentación técnica: transformar manuales o especificaciones en PDF a Markdown para su integración en wikis, repositorios de documentación o sistemas de control de versiones.
- Extracción de texto de documentos escaneados: utilizar el modo OCR plano para obtener texto legible de PDFs que son imágenes escaneadas, habilitando su procesamiento con herramientas de NLP.
- Automatización de pipelines de datos: integrar la API REST en flujos de trabajo que requieran convertir PDFs a Markdown de forma programática, por ejemplo, en procesos de ingesta de documentos para bases de datos vectoriales.
- Preparación de datasets para entrenamiento: convertir PDFs de artículos científicos o libros a Markdown para crear corpus de texto estructurado, útil en tareas de fine-tuning o evaluación de modelos de lenguaje.
- Archivado y preservación digital: convertir documentos históricos o legales a un formato abierto y editable como Markdown, garantizando su accesibilidad a largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de rendimiento como MMLU, HumanEval o GSM8K para el modelo DeepSeek-OCR, ni comparaciones con otros modelos de OCR.

## Requisitos de hardware

- GPU NVIDIA con soporte CUDA 11.8 o superior.
- Memoria de GPU mínima de 12 GB (el modelo ocupa aproximadamente 9 GB).
- Memoria RAM del sistema mínima de 32 GB (recomendada 64 GB o más).
- Almacenamiento libre de al menos 50 GB para el modelo y los contenedores Docker.
- Software: Python 3.8+, Docker 20.10+ con soporte GPU, Docker Compose 2.0+ y NVIDIA Container Toolkit.
- Opciones de despliegue: Docker Compose para el backend FastAPI, o ejecución directa de los scripts de procesamiento en un entorno Python.
- No se especifican modelos concretos de GPU, pero se requiere una GPU con al menos 12 GB de VRAM, por lo que tarjetas como RTX 3060 12GB, RTX 3080, RTX 4090 o A100 serían adecuadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones con otras soluciones de OCR como Tesseract, PaddleOCR o modelos propietarios, ya que no se han proporcionado datos de rendimiento ni características técnicas del modelo DeepSeek-OCR.

## Limitaciones y advertencias

- No se ha especificado la licencia del modelo ni del proyecto, por lo que su uso comercial podría estar sujeto a restricciones desconocidas.
- El modelo requiere una GPU con al menos 12 GB de VRAM, lo que limita su despliegue en entornos sin hardware especializado.
- No se dispone de información sobre los idiomas soportados; es posible que el modelo esté optimizado para inglés u otros idiomas, pero no se confirma.
- No se han documentado posibles sesgos o riesgos de alucinación en la salida del OCR, aunque es recomendable validar los resultados en documentos críticos.
- El tamaño del repositorio (175.7 GB) implica un coste de almacenamiento y descarga considerable.
- La documentación no incluye instrucciones de seguridad ni consideraciones sobre el manejo de datos sensibles en los PDFs procesados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/uiq/test
- Modelo DeepSeek-OCR (mencionado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-OCR (enlace inferido, no verificado en la información proporcionada)
