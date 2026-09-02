# spark-ux/indic-doc-parser

## Resumen

IndicDocParser es un sistema modular de parseo de documentos en dos etapas desarrollado por el usuario spark-ux, diseñado para convertir imagenes de paginas de documentos en Markdown con orden de lectura. Cubre ingles y las 22 lenguas indias constitucionalmente reconocidas en texto impreso, y 12 lenguas en manuscrito. La primera etapa, **IndicDocLayout**, detecta los bloques de la pagina y los ordena mediante una arquitectura PP-DocLayoutV3/RT-DETR de 33 M de parametros; la segunda, **IndicBlockOCR**, transcribe los bloques textuales con un Qwen3.5-0.8B de 0.8 B de parametros. Ambas etapas se comunican mediante un JSON estructurado, lo que permite usarlas de forma independiente o sustituirlas por otras implementaciones.

El modelo esta orientado al dominio educativo: su taxonomia de 37 clases incluye elementos como Ecuacion, Pregunta, Ejemplo-resuelto, Tabla, Figura, Codigo o MCQ. La salida incluye Markdown en orden de lectura, matematicas como LaTeX, tablas como HTML o Markdown, y un JSON por bloque con detalle de posicion y transcripcion. El repositorio ocupa 1.9 GB y fue publicado el 2 de septiembre de 2026.

Existe una discrepancia relevante: el identificador del repositorio es `spark-ux/indic-doc-parser`, pero el codigo de uso de la model card referencia `bodhan-ai/indic-doc-parser`. Conviene verificar cual es el repositorio canónico antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-DocLayoutV3 / RT-DETR (layout) + Qwen3.5-0.8B (OCR) |
| Parametros totales | 33 M (layout) + 0.8 B (OCR) = 0.833 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (layout), bf16 (OCR) |
| Idiomas soportados | 23 en impreso (en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur); 12 en manuscrito (en, hi, bn, te, mr, ta, gu, kn, ml, or, pa, as, ur) |
| Licencia | Apache-2.0 segun la insignia de la model card; la metadata de HuggingFace indica "no disponible" |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema combina dos arquitecturas independientes conectadas por un JSON intermedio. **IndicDocLayout** es un ajuste fino de PP-DocLayoutV3/RT-DETR, un detector de objetos basado en transformer, entrenado con una taxonomia de 37 clases de elementos de pagina disenada para documentos del dominio educativo. Produce cajas delimitadoras etiquetadas para cada elemento detectado, con su orden de lectura. **IndicBlockOCR** es un modelo de lenguaje visual basado en Qwen3.5-0.8B, que utiliza el tokenizador Sarvam-30B, cuyo vocabulario esta disenado para cubrir escrituras indias. Transcribe cada bloque textual a Markdown, convirtiendo las expresiones matematicas a LaTeX y las tablas a HTML o Markdown.

No se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. Tampoco hay informacion sobre innovaciones tecnicas especificas mas alla de la arquitectura modular y el uso del tokenizador Sarvam-30B para cubrir las 22 escrituras indias.

## Capacidades

- OCR de texto impreso en 23 idiomas (ingles y 22 lenguas indias constitucionales).
- Reconocimiento de escritura manuscrita en ingles y 12 lenguas indias (calidad en desarrollo).
- Analisis de layout con 37 clases de elementos: Titulo, Parrafo, Ecuacion, Tabla, Figura, Codigo, MCQ, Pregunta, Ejemplo-resuelto, Pie de pagina, Cabecera, Numero de pagina, Nota al pie, Indice, Imagen, Diagrama, entre otras.
- Orden de lectura automatico de los bloques detectados.
- Conversion de matematicas impresas y manuscritas a LaTeX.
- Conversion de tablas a HTML o Markdown.
- Salida JSON por bloque con posicion y transcripcion, ademas del Markdown completo.
- Arquitectura modular: cada etapa puede usarse de forma independiente o sustituirse por otra implementacion.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un sistema de parseo de documentos, no un asistente conversacional.

## Casos de uso

- Digitalizacion de libros de texto escolares en lenguas indias: el modelo detecta titulos, parrafos, figuras y ecuaciones, y genera Markdown con orden de lectura, listo para publicacion web o conversion a EPUB.
- Archivo de cuadernos manuscritos de matematicas: transcribe algebra manuscrita a LaTeX, lo que permite buscar y reutilizar contenido de examenes o apuntes antiguos.
- Extraccion de preguntas de examenes para bancos de items: la clase MCQ y Pregunta permite indexar automaticamente bancos de preguntas desde paginas escaneadas.
- Construccion de pipelines RAG sobre documentacion tecnica en hindi, tamil o bengali: el JSON por bloque conserva la estructura del documento, lo que mejora la recuperacion segmentada frente a OCR plano.
- Parsing de articulos cientificos con formulas: la conversion a LaTeX habilita busqueda semantica sobre expresiones matematicas.
- Accesibilidad: conversion de documentos impresos en lenguas indias a texto estructurado para lectores de pantalla o sistemas de lectura en voz alta.
- Catalogacion de documentos gubernamentales o legales multilingues: el modelo maneja escrituras como urdu, santali y bodo, poco cubiertas por OCR comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni evaluaciones de precision de OCR o layout (p. ej., mAP, CER o WER) sobre conjuntos de referencia estandar.

## Requisitos de hardware

- Tamano total del repositorio: 1.9 GB; pesos de layout 133 MB en fp32 y pesos de OCR 1.7 GB en bf16.
- VRAM estimada para inferencia: no disponible en la documentacion, pero con 0.8 B de parametros en bf16 (~1.6 GB de pesos) cabe en GPUs de consumo como RTX 3060 o superiores.
- GPU recomendadas: no especificadas; el instalador incluido detecta el driver y selecciona wheels CUDA compatibles, lo que sugiere soporte para NVIDIA.
- Opciones de despliegue: el codigo se distribuye dentro del propio repositorio (se importa anadiendo el repo al `sys.path`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre IndicDocParser y otros sistemas de parseo de documentos indios. Como referencia general, los alternativas en el espacio de OCR de lenguas indias incluyen Tesseract (sin analisis de layout avanzado ni salida Markdown), PaddleOCR (con deteccion de layout pero cobertura limitada de escrituras indias) y servicios comerciales como Google Document AI o Databricks `ai_parse_document`. Sin embargo, no hay benchmarks publicados que permitan una comparacion cuantitativa rigurosa con este modelo.

## Limitaciones y advertencias

- La calidad del reconocimiento de escritura manuscrita es declarada como "trabajo en progreso" por el propio autor, especialmente ante estilos de escritura variados.
- Ambiguiedad de licencia: la insignia de la model card indica Apache-2.0, pero la metadata de HuggingFace no registra licencia. Antes de uso comercial, conviene confirmar la licencia con el autor.
- Discrepancia de identificador: el codigo de ejemplo referencia `bodhan-ai/indic-doc-parser` mientras que el repositorio esta publicado como `spark-ux/indic-doc-parser`; verificar la procedencia del codigo antes de ejecutarlo.
- La cobertura manuscrita se limita a 12 lenguas frente a las 23 del impreso; lenguas como santali, sindhi o dogri solo se soportan en texto impreso.
- No se documentan limites de resolucion de imagen, tamano maximo de pagina ni comportamiento ante documentos con multiples columnas complejas.
- El instalador ejecuta scripts que instalan dependencias en el Python activo; requiere revision antes de usarlo en entornos compartidos o de produccion.
- Sin datos de benchmarks publicados, el rendimiento real en tareas especificas no puede validarse de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spark-ux/indic-doc-parser
- ARCHITECTURE.md: disponible dentro del repositorio, documenta el flujo de llamadas y las invariantes del sistema (no hay URL directa publicada).
- TROUBLESHOOTING.md: disponible dentro del repositorio con los comandos alternativos de instalacion (no hay URL directa publicada).
