# thekraftors/kraftlens-vl

## Resumen

KraftLens-VL es un modelo de visión-lenguaje (image-text-to-text) publicado por el usuario thekraftors en Hugging Face, orientado a tareas de OCR y comprensión de documentos. El modelo está etiquetado específicamente para reconocimiento de texto, análisis de layout, tablas, gráficos y fórmulas, lo que lo sitúa en el nicho de los modelos de document AI más que en el de asistentes visuales de propósito general.

La información publicada es muy limitada: el repositorio contiene 466.654.208 parámetros (aproximadamente 467 millones) en formato safetensors, con un tamaño de repo de 2,6 GB, lo que sugiere pesos en precisión alta (fp32 o similar) además de las variantes GGUF. La model card no incluye descripción técnica, datos de entrenamiento ni benchmarks; únicamente declara licencia Apache 2.0 y el pipeline image-text-to-text.

Por su tamaño contenido y su enfoque en documentos, el modelo es relevante para despliegues en hardware modesto donde se necesite extracción estructurada de información (texto, tablas, fórmulas) sin recurrir a modelos de decenas de miles de millones de parámetros. No obstante, la ausencia de documentación técnica y de resultados publicados obliga a validarlo empíricamente antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo image-text-to-text; se desconoce la arquitectura interna) |
| Parámetros totales | 466.654.208 (~467 M) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (según tags del repositorio); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Los tags indican un pipeline image-text-to-text con soporte de código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones incluidas en el repositorio (`trust_remote_code`). El tamaño de 467 M de parámetros es compatible con un codificador visual ligero acoplado a un decoder o a un modelo de lenguaje pequeño, pero se trata de una inferencia y no de un dato confirmado.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del modelo (OCR, layout, table, chart, formula) sugieren un entrenamiento orientado a documentos, pero no se especifica qué datasets se utilizaron ni si hubo etapas de instrucción específicas para cada subtarea.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Comprensión de layout documental (disposición de bloques, secciones y elementos).
- Extracción y comprensión de tablas.
- Interpretación de gráficos.
- Reconocimiento de fórmulas matemáticas en documentos.
- Generación de texto condicionada a imagen (image-text-to-text).
- Soporte de conversación multi-turno según el tag `conversational`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling, agentes, visión general, audio o modo thinking: no disponible en la información publicada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede recibir la imagen de un documento y devolver el texto y la estructura de tablas, lo que permite alimentar sistemas de contabilidad sin OCR externo. Su tamaño de 467 M facilita el despliegue en servidores modestos.
- Extracción de tablas de informes financieros: gracias a la etiqueta específica de tablas, puede usarse para convertir tablas impresas o escaneadas en representaciones textuales procesables (CSV, Markdown) dentro de pipelines de análisis.
- Procesamiento de artículos científicos: la capacidad declarada para fórmulas permite extraer expresiones matemáticas de PDFs renderizados como imagen, útil en bases de conocimiento técnico.
- Análisis de gráficos en publicaciones: puede describir o extraer información de gráficos de barras y líneas para resúmenes automáticos de informes.
- Indexación de archivos escaneados: combinado con un motor de búsqueda, permite generar representaciones textuales de documentos históricos o administrativos para búsqueda semántica.
- Asistencia en la revisión de documentos legales: extracción de cláusulas y tablas de anexos a partir de imágenes, con revisión humana posterior dado el riesgo de error del modelo.
- Despliegue en el borde (edge): con 467 M de parámetros y variantes GGUF, es viable ejecutarlo en equipos con CPU o GPU de gama baja para tareas de OCR en local, sin enviar documentos sensibles a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~467 M de parámetros, en fp16 serían necesarios aproximadamente 0,9-1 GB solo para pesos; en cuantizaciones GGUF de 4 bits, del orden de 300-500 MB, más el overhead del codificador visual y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes, A10G o A100 aportan margen.
- GPU de consumo: sí, cabe holgadamente en tarjetas consumer recientes e incluso en iGPU con suficiente memoria compartida en cuantización GGUF.
- Opciones de despliegue: llama.cpp/Ollama para las variantes GGUF; vLLM o TGI si el modelo es compatible con sus pipelines (no confirmado); transformers con `trust_remote_code` para los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| KraftLens-VL | ~467 M | no disponible | OCR y document understanding | Apache 2.0 |
| Modelos OCR/VL pequeños de referencia | no disponible | no disponible | OCR/documentos | variable |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas; los datos de rendimiento de KraftLens-VL no están publicados.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento ni evaluación, lo que impide conocer sus sesgos.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto que no aparece en el documento, especialmente en tablas complejas o imágenes de baja calidad.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin validación previa.
- Longitud de contexto desconocida: limita la planificación de documentos de muchas páginas.
- Requiere `trust_remote_code`: la carga implica ejecutar código del repositorio, con el riesgo de seguridad asociado; conviene auditar el código antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero al no haber garantías del autor sobre el rendimiento, la validación en producción corre por cuenta del integrador.
- Popularidad mínima (0 descargas, 1 like en el momento de la consulta): no hay comunidad ni reportes de uso que respalden su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/thekraftors/kraftlens-vl
