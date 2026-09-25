# tutuk45/satquery-grounding-qwen2.5vl-3b-merged

## Resumen

satquery-grounding-qwen2.5vl-3b-merged es un ajuste fino del modelo multimodal Qwen2.5-VL-3B-Instruct publicado por el usuario tutuk45 en HuggingFace. Se trata de un modelo de visión-lenguaje (image-text-to-text) de 3.754.622.976 parámetros (3,75B) que conserva la arquitectura del modelo base y se distribuye en safetensors, con un repositorio de 7,5 GB. La licencia declarada es Apache-2.0 y el único idioma etiquetado es el inglés.

Qwen2.5-VL es la serie multimodal de la familia Qwen, desarrollada por el equipo Qwen de Alibaba Cloud, disponible en variantes de 3B, 7B y 72B parámetros y preentrenada sobre 4,1 billones de tokens. La variante de 3B está orientada a despliegues en el borde (edge AI) y, según la documentación de la familia, supera al modelo de 7B de la generación anterior, Qwen2-VL. El ajuste fino se ha realizado con Unsloth y la librería TRL de HuggingFace, que el autor declara como un entrenamiento «2x faster».

El interés de esta ficha radica en que el identificador del modelo («satquery-grounding») sugiere una especialización en tareas de grounding sobre imágenes de satélite o teledetección, un nicho con demanda creciente en análisis geoespacial automatizado. Sin embargo, la model card publicada no documenta el conjunto de datos, el procedimiento de entrenamiento ni las métricas de evaluación, por lo que la mayor parte de las afirmaciones sobre su especialización deben considerarse no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (encoder ViT + decodificador de lenguaje). La familia Qwen2.5-VL emplea window attention en el encoder ViT, muestreo dinámico de FPS y MRoPE (multi-resolutional rotary positional embedding) |
| Parametros totales | 3.754.622.976 (3,75B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible para este repositorio (solo safetensors). El modelo base dispone de versiones GGUF publicadas por terceros, por ejemplo qwen2.5vl:3b en Ollama |
| Idiomas soportados | Inglés (en) según los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Pipeline | image-text-to-text |
| Modelo base | unsloth/Qwen2.5-VL-3B-Instruct (a su vez derivado de Qwen/Qwen2.5-VL-3B-Instruct) |
| Tamaño del repositorio | 7,5 GB |
| Librería | transformers |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen2.5-VL, que combina un encoder de visión de tipo ViT con un decodificador de lenguaje autorregresivo. Entre las innovaciones técnicas documentadas para la familia se encuentran la introducción de window attention en el encoder ViT para acelerar entrenamiento e inferencia, el muestreo dinámico de FPS en las dimensiones espacial y temporal para mejorar la comprensión de vídeo a distintas tasas de muestreo, y el uso de MRoPE (multi-resolutional rotary positional embedding) para manejar resoluciones variables. La familia fue preentrenada sobre 4,1 billones de tokens.

El proceso de ajuste fino de este repositorio concreto no está documentado en la model card: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único declarado por el autor es que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, con una aceleración declarada de 2x respecto a un flujo estándar, y que el resultado se ha fusionado («merged») en un único conjunto de pesos safetensors. La ausencia de detalles sobre el conjunto de datos impide reproducir el ajuste o auditar su comportamiento.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y produce texto.
- Comprensión de imágenes: capacidades heredadas del modelo base Qwen2.5-VL-3B-Instruct para descripción, respuesta a preguntas visuales y extracción de información de imágenes.
- Procesamiento de documentos: la familia Qwen2.5-VL está orientada, entre otros usos, a la lectura de documentos, tablas y gráficos, si bien este extremo no se documenta específicamente para el ajuste.
- Grounding visual: el identificador del modelo sugiere capacidades de localización de objetos o regiones sobre imágenes (grounding), presumiblemente sobre imagery satelital. No hay documentación que lo confirme.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este ajuste concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible en la información proporcionada.

## Casos de uso

- Análisis de imágenes satelitales con grounding: si el ajuste cumple lo que sugiere su nombre, podría utilizarse para localizar elementos concretos (edificaciones, cultivos, infraestructura, masas de agua) sobre imágenes de teledetección, devolviendo etiquetas o regiones de interés para pipelines de análisis geoespacial. Es un caso plausible, pero no verificado.
- Extracción de información de documentos escaneados: al heredar el pipeline image-text-to-text, puede emplearse para transcribir y estructurar contenido de facturas, formularios o informes en inglés, integrándose en flujos de digitalización.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en inglés para catálogos, repositorios de imágenes o aplicaciones que requieran etiquetado descriptivo.
- Preguntas y respuestas visuales en asistentes técnicos: un asistente que reciba una captura, un diagrama o una fotografía y responda preguntas concretas sobre su contenido, con el modelo actuando como componente de razonamiento visual.
- Clasificación y filtrado previo en pipelines de datos: uso como etiquetador de bajo coste para triaje de imágenes antes de pasarlas a modelos mayores, aprovechando su tamaño reducido para procesar grandes volúmenes.
- Despliegue en dispositivos de borde: con 3,75B parámetros y cuantización de 4 bits, el modelo cabe en GPUs de consumo e incluso en equipos con recursos limitados, lo que permite inferencia local sin enviar datos a servicios externos, relevante en entornos con requisitos de privacidad.
- Prototipado e investigación en visión-lenguaje: por su tamaño, sirve como base para experimentos académicos de ajuste fino sobre dominios específicos, donde un modelo mayor resultaría inviable en cuanto a coste de entrenamiento.
- Moderación o inspección de contenido visual: revisión automatizada de imágenes con salida en texto para detectar categorías predefinidas, siempre que se valide previamente la fiabilidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este ajuste fino.

Como referencia del modelo base, la página de Ollama sobre qwen2.5vl:3b afirma que Qwen2.5-VL-7B-Instruct supera a GPT-4o-mini en varias tareas y que Qwen2.5-VL-3B supera al modelo de 7B de la generación anterior, Qwen2-VL. Se trata de afirmaciones cualitativas del proveedor, sin cifras concretas asociadas en la información recopilada, y no son extrapolables al comportamiento de este ajuste específico.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del número de parámetros (3,75B) y no proceden de mediciones publicadas para este modelo:

- VRAM estimada para inferencia en FP16/BF16: en torno a 7,5-8 GB solo para pesos, más el consumo adicional del encoder de visión, la caché KV y el runtime.
- VRAM estimada en INT8: aproximadamente 3,8-4,5 GB para pesos.
- VRAM estimada en 4 bits: aproximadamente 2-2,5 GB para pesos, con margen adicional según resolución de imagen y longitud de secuencia.
- GPU recomendadas: para FP16, tarjetas con 16 GB o más (RTX 4080/4090, A100, H100) para trabajar con comodidad; para cuantización de 4 u 8 bits, es viable en GPUs de consumo con 8-12 GB (RTX 3060, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas, y presumiblemente en FP16 en GPUs de 16 GB si se limita la resolución de imagen y la longitud de contexto.
- Opciones de despliegue: transformers (formato declarado del repositorio), text-generation-inference (etiqueta declarada por el autor), y para cuantizaciones GGUF, llama.cpp u Ollama partiendo de conversiones del modelo base.
- Latencia y throughput: no disponibles. Dependerán del hardware, de la cuantización, de la resolución de las imágenes y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tutuk45/satquery-grounding-qwen2.5vl-3b-merged | 3,75B | No disponible | Apache-2.0 | HuggingFace (safetensors) | Ajuste fino sin documentación de dataset ni métricas |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | No disponible en la información recopilada | Apache-2.0 (según el repositorio base) | HuggingFace, GGUF vía Ollama | Modelo base; orientado a edge AI; el proveedor afirma que supera a Qwen2-VL-7B |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | No disponible en la información recopilada | No disponible en la información recopilada | HuggingFace, GGUF vía Ollama | El proveedor afirma que supera a GPT-4o-mini en varias tareas |
| Otras alternativas multimodales de ~3B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información recopilada |

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset de ajuste, el número de pasos, la configuración de entrenamiento ni las métricas obtenidas, lo que impide evaluar la calidad real del ajuste.
- Especialización no verificada: la orientación a grounding satelital se deduce únicamente del nombre del repositorio; no hay evidencia publicada que la respalde.
- Riesgo de alucinación: como cualquier modelo de lenguaje y visión de 3,75B parámetros, puede generar descripciones o localizaciones plausibles pero incorrectas, especialmente en imágenes complejas o de baja resolución.
- Idioma: los metadatos solo declaran inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Sesgos: no se documenta ningún análisis de sesgos. El modelo base puede arrastrar sesgos presentes en sus datos de preentrenamiento, incluyendo sesgos geográficos y culturales relevantes en tareas de teledetección.
- Grounding numérico: si el modelo devuelve coordenadas o cajas delimitadoras, deben validarse con tolerancias explícitas, ya que los errores de localización en modelos pequeños pueden ser elevados.
- Licencia: el repositorio declara Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de ajuste antes de un despliegue en producción.
- Sin soporte declarado de tool calling ni de agentes: la información disponible no confirma estas capacidades, por lo que no deberían asumirse en un diseño de sistema.
- Advertencia de procedencia: al ser un ajuste subido por un usuario individual, sin proceso de revisión, el origen de los datos de entrenamiento no es auditable, lo que supone un riesgo en entornos regulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tutuk45/satquery-grounding-qwen2.5vl-3b-merged
- Modelo base utilizado para el ajuste: https://huggingface.co/unsloth/Qwen2.5-VL-3B-Instruct
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Documentación de Qwen2.5-VL en transformers: https://huggingface.co/docs/transformers/model_doc/qwen2_5_vl
- Versión GGUF del modelo base en Ollama: https://ollama.com/library/qwen2.5vl:3b
- Unsloth (herramienta de entrenamiento declarada): https://github.com/unslothai/unsloth
- Repositorio divulgativo sobre Qwen2.5-VL: https://github.com/kustomzone/Qwen2.5VL-docs
- Repositorio espejo sobre Qwen2.5-VL: https://github.com/elsawhs/qwen2.5-vl
