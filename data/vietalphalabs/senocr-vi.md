# VietAlphaLabs/SenOCR-Vi

## Resumen

SenOCR-Vi es un modelo de reconocimiento óptico de caracteres (OCR) especializado en documentos vietnamitas, desarrollado por VietAlphaLabs sobre la arquitectura de PaddleOCR-VL-1.6 de PaddlePaddle. Se trata de un modelo multimodal de tipo imagen-a-texto (image-text-to-text) con aproximadamente 0,96 mil millones de parámetros, que ha sido ajustado mediante LoRA para mejorar la precisión en la transcripción de texto vietnamita impreso, páginas fotografiadas, material de archivo y libros de texto.

El modelo resuelve el problema de la baja precisión del OCR genérico en vietnamita, un idioma con diacríticos y caracteres específicos que suelen degradar el rendimiento de los sistemas estándar. Su relevancia radica en que consigue una mejora de 1,93 puntos sobre el modelo base PaddleOCR-VL-1.6 en la métrica compuesta vietnamita, empleando únicamente el 1,26 % de los parámetros totales durante el ajuste fino, lo que lo convierte en una opción ligera y económica para flujos de digitalización documental.

El checkpoint se distribuye como un único archivo fusionado en FP32, sin necesidad de cargar adaptadores separados en inferencia, y mantiene la interfaz de PaddleOCR-VL-1.6, por lo que puede usarse tanto directamente con `transformers` como integrado en el pipeline de parsing de páginas de PaddleOCR-VL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (image-text-to-text) basado en PaddleOCR-VL-1.6; decoder-only con LoRA |
| Parametros totales | 958.588.736 (~0,959 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint oficial en FP32; se advierte que precisiones inferiores requieren validacion) |
| Idiomas soportados | Vietnamita (vi), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

SenOCR-Vi hereda la arquitectura de PaddleOCR-VL-1.6, un modelo de visión-lenguaje diseñado para tareas de OCR y parsing de documentos. La model card no detalla la estructura interna del transformer (número de capas, tipo de atención, etc.), pero confirma que se trata de un modelo decoder-only con aproximadamente 0,96 B parámetros. El ajuste fino se realizó mediante LoRA con rango 32 y alpha 64, actualizando únicamente 12,09 millones de parámetros (el 1,26 % del total). El entrenamiento se completó en una sola GPU NVIDIA A10G en unas dos horas, utilizando el dataset 5CD-AI/Viet-Handwriting-OCR-v2, que, pese a su nombre, se emplea aquí para especializar el reconocimiento de texto vietnamita impreso y manuscrito.

El checkpoint final es una fusión verificada de los pesos base y el adaptador LoRA, con una validación de equivalencia que confirma 128/128 coincidencias exactas de decodificación entre la inferencia base-más-adaptador y el modelo fusionado. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) para vietnamita, inglés y chino, con especialización en vietnamita.
- Parsing de documentos a nivel de página mediante el pipeline PaddleOCR-VL 1.6, incluyendo análisis de layout, estructura y restructuración del documento.
- Interfaz conversacional (image-text-to-text) compatible con `transformers` y plantillas de chat.
- Generación de texto a partir de imágenes con soporte para múltiples turnos si se usa el pipeline de PaddleOCR.
- No se documentan capacidades de tool calling, razonamiento multi-paso, ni funciones de visión más allá del OCR.

## Casos de uso

- Digitalización de archivos históricos vietnamitas: el modelo transcribe páginas escaneadas o fotografiadas con alta precisión en vietnamita, lo que permite indexar y buscar contenido en bibliotecas digitales.
- Extracción de texto de libros de texto y material educativo: su especialización en vietnamita reduce errores en diacríticos y caracteres compuestos, facilitando la conversión a formatos editables.
- Ingestión de documentos en flujos empresariales: integrado en el pipeline PaddleOCR-VL, puede procesar facturas, formularios y contratos en vietnamita, extrayendo texto estructurado en JSON o Markdown.
- Automatización de atención al cliente: combinado con un sistema de preguntas y respuestas, permite procesar imágenes de documentos enviados por usuarios (DNI, recibos, cartas) y extraer la información relevante.
- Archivado de prensa y publicaciones periódicas: su capacidad para manejar páginas completas con layout complejo lo hace adecuado para digitalizar periódicos y revistas vietnamitas.
- Investigación académica en NLP vietnamita: sirve como componente de preprocesamiento para construir corpus de texto a partir de documentos escaneados, alimentando modelos de lenguaje o sistemas de búsqueda semántica.

## Benchmarks y rendimiento

SenOCR-Vi se evaluó sobre una población corregida de 160 páginas vietnamitas utilizada en la comparativa MDPBench de parsing de documentos. Los resultados publicados son los siguientes:

| Modelo | Parametros | Compuesto vietnamita |
|---|---|---|
| chandra-ocr-2 | 5B | 85,60 |
| MonkeyOCRv2-B-Parsing | 0,7B | 83,20 |
| Claude-Sonnet-4.6 | No revelado | 83,10 |
| **SenOCR-Vi** | **0,959B** | **82,83** |
| ChatGPT-5.2-2025-12-11 | No revelado | 82,10 |
| PaddleOCR-VL-1.6 | ~0,9B | 80,90 |

Además, en la métrica de reconocimiento de texto vietnamita bajo `1 - Edit_dist`, SenOCR-Vi alcanza un 86,7 %. El modelo supera a ChatGPT-5.2 en 0,73 puntos y a PaddleOCR-VL-1.6 en 1,93 puntos, aunque queda 2,77 puntos por detrás de chandra-ocr-2, que tiene aproximadamente 5,2 veces más parámetros. No se han publicado resultados para otros benchmarks generales (MMLU, HumanEval, etc.) al tratarse de un modelo especializado en OCR.

## Requisitos de hardware

- Inferencia en FP32: el checkpoint pesa aproximadamente 3,8 GB, por lo que se necesita al menos 8 GB de VRAM para cargar los pesos en GPU; en CPU puede ejecutarse, aunque con latencia elevada.
- GPU recomendadas: NVIDIA A10G (usada en entrenamiento), RTX 3090/4090, A100 o superiores para inferencia con margen de memoria.
- En GPUs de consumo con 8-12 GB de VRAM (p. ej., RTX 3060, RTX 4070) es viable en FP32, y probablemente en FP16/INT8 si se validan las precisiones reducidas.
- Opciones de despliegue: `transformers` (AutoModelForImageTextToText) y pipeline PaddleOCR-VL 1.6; no se mencionan backends como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compuesto vietnamita | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenOCR-Vi | 0,959B | No disponible | 82,83 | Apache 2.0 | Hugging Face |
| PaddleOCR-VL-1.6 | ~0,9B | No disponible | 80,90 | Apache 2.0 | Hugging Face |
| MonkeyOCRv2-B-Parsing | 0,7B | No disponible | 83,20 | No disponible | No disponible |
| chandra-ocr-2 | 5B | No disponible | 85,60 | No disponible | No disponible |

SenOCR-Vi se posiciona como una alternativa ligera y de código abierto frente a modelos propietarios como Claude-Sonnet-4.6 o ChatGPT-5.2, con un rendimiento cercano al de estos últimos en vietnamita. Frente a su base PaddleOCR-VL-1.6, ofrece una mejora significativa sin aumentar el coste de inferencia.

## Limitaciones y advertencias

- El modelo está especializado en vietnamita; su rendimiento en inglés y chino no se ha evaluado públicamente y puede ser inferior al de modelos OCR genéricos.
- Los benchmarks publicados se obtuvieron en FP32; el uso de cuantizaciones de menor precisión (FP16, INT8) requiere validación específica en el entorno de despliegue.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita el diseño de aplicaciones que procesen documentos muy extensos o múltiples imágenes en una sola pasada.
- El dataset de entrenamiento (Viet-Handwriting-OCR-v2) sugiere cobertura de manuscritos, pero la model card no detalla la proporción de datos manuscritos frente a impresos; la precisión en manuscritos reales podría ser inferior a la reportada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente con datos vietnamitas, puede presentar errores sistemáticos en variantes dialectales o tipografías poco comunes.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero se recomienda verificar los términos de los datasets utilizados en el ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VietAlphaLabs/SenOCR-Vi
- Página de investigación: https://vietalpha.org/research/senocr-vi
- Documentación de PaddleOCR-VL: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PaddleOCR-VL.en.md
- Leaderboard MDPBench: https://github.com/Yuliang-Liu/MultimodalOCR/blob/main/MDPBench/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/5CD-AI/Viet-Handwriting-OCR-v2
