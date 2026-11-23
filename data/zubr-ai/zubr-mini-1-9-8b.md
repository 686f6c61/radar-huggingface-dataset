# Zubr-AI/zubr-mini-1.9-8b

## Resumen

Zubr Mini 1.9 8B es un modelo de lenguaje multimodal (visión + texto) de 8.489.553.920 parámetros publicado por Zubr-AI (autor alekringtonnn-ai) y afinado a partir de Mistralai/Ministral-3-8B-Instruct-2512. Resuelve la necesidad de un modelo visual-lingüístico de tamano medio que pueda ejecutarse en hardware de consumo mediante cuantización GGUF, manteniendo capacidades de razonamiento y comprensión de imágenes en una única arquitectura unificada mistral3.

Su rasgo diferencial es el denominado "fast thinking": el modelo fue entrenado con ejemplos que incluían contexto, pregunta y el inicio de cadenas de razonamiento cortas, de modo que el razonamiento se intercala en la propia respuesta en lugar de desplegarse como una fase oculta y extensa. Adicionalmente, el motor de visión se amplió de 1B a 2B de parámetros respecto a la versión anterior, mejorando OCR, lectura de diagramas y tablas.

Se distribuye exclusivamente en formato GGUF con seis cuantizaciones (de IQ2_M a Q5_K_S), lo que permite desplegarlo en CPU, portátiles y GPUs de consumo mediante Ollama, llama.cpp, vLLM o LM Studio. La licencia es Apache 2.0 y declara soporte para 47 idiomas, con especial énfasis en ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal unificada mistral3 (visión + lenguaje) |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M (~3,11 GB), Q2_K (~3,35 GB), Q3_K_S (~3,87 GB), Q3_K_M (~4,24 GB), Q4_0 (~4,94 GB), Q5_K_S (~5,92 GB) |
| Idiomas soportados | 47: ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base de referencia es GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mistral3 en su variante multimodal unificada: el componente de visión está integrado en el propio modelo en lugar de actuar como un módulo externo acoplado, de forma que visión y lenguaje operan conjuntamente. El motor visual se amplió de 1B a 2B de parámetros respecto a la versión previa de la familia, lo que según el autor mejora el reconocimiento de detalles, texto en imágenes (OCR), diagramas y tablas. La pipeline declarada es image-text-to-text.

El entrenamiento parte de Mistralai/Ministral-3-8B-Instruct-2512 (a su vez derivado de Ministral-3-8B-Base-2512) y consiste en un fine-tune de Zubr-AI. La innovación declarada es el formato de los ejemplos de entrenamiento: cada muestra contenía contexto, pregunta y el comienzo de pasos de razonamiento cortos, lo que produce un razonamiento compacto intercalado en la respuesta en lugar de una fase de "thinking" separada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento compacto integrado en la respuesta ("fast thinking"), con menos tokens dedicados a cadenas de pensamiento.
- Comprensión de imágenes: image-text-to-text, con reconocimiento de detalles, texto en imágenes (OCR), diagramas y tablas.
- Diálogo multimodal: imagen más pregunta textual produce respuesta textual.
- Capacidades multilingües declaradas para 47 idiomas, con foco en ruso.
- Ejecución local en CPU y GPU mediante runtimes GGUF (Ollama, llama.cpp, vLLM, LM Studio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Digitalización de documentos con OCR: el modelo puede recibir la imagen de un documento y devolver el texto extraído, apoyándose en el motor de visión de 2B de parámetros y en la cuantización Q5_K_S cuando la precisión de reconocimiento es crítica.
- Análisis de diagramas y tablas técnicas: adecuado para extraer relaciones o resumir figuras en documentación de ingeniería, gracias a la mejora declarada en lectura de diagramas y tablas.
- Asistente local de escritorio sin conexión: con Q4_0 (~4,94 GB) puede ejecutarse en un portátil con 8-12 GB de RAM vía Ollama o LM Studio, cubriendo consultas de texto e imagen sin depender de la nube.
- Atención al cliente en ruso y otros idiomas de la región: el soporte de 47 idiomas y el énfasis en ruso lo hacen apto para conversaciones multi-turno en mercados de Europa del Este y Asia Central.
- Procesamiento por lotes en servidor con GPU: desplegado con vLLM o llama.cpp sobre GPU NVIDIA/AMD, permite clasificar o describir imágenes a escala en pipelines de datos.
- Prototipado rápido de aplicaciones multimodales: al estar en GGUF y bajo Apache 2.0, sirve para validar productos de visión-lenguaje antes de invertir en modelos mayores.
- Análisis de capturas de pantalla o interfaces: la combinación de OCR y razonamiento compacto permite resumir o responder preguntas sobre contenido visual de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ2_M ~3,11 GB; Q2_K ~3,35 GB; Q3_K_S ~3,87 GB; Q3_K_M ~4,24 GB; Q4_0 ~4,94 GB; Q5_K_S ~5,92 GB. El autor recomienda al menos el doble de RAM que el tamano del fichero.
- Guía de memoria del autor: Q4_0 requiere ~8-12 GB de RAM; Q5_K_S requiere ~12-16 GB; las variantes Q2/Q3 se reservan para equipos con ~6-8 GB bajo restricciones estrictas.
- CPU: se requiere soporte AVX/AVX2 (cualquier x86 moderno) o un dispositivo ARM.
- GPU: opcional pero recomendable para tareas de visión; el autor menciona GPUs NVIDIA y AMD como aceleradores, sin especificar modelos concretos (A100, H100, RTX 4090, etc.: no disponible).
- Cabe en GPU de consumo: con Q4_0 (~4,94 GB) y Q5_K_S (~5,92 GB) es viable en GPUs consumer con 8 GB o más de VRAM, aunque el dato exacto de VRAM no está publicado.
- Opciones de despliegue: Ollama, llama.cpp, vLLM, LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Zubr Mini 1.9 8B | 8,49B | no disponible | Imagen-texto a texto | Apache 2.0 | GGUF | Fine-tune de Ministral-3-8B-Instruct con visión de 2B y "fast thinking" |
| Ministral-3-8B-Instruct-2512 (Mistral AI) | ~8B | no disponible | Texto (modelo base del fine-tune) | no disponible en la información | GGUF y otros | Modelo de referencia sobre el que se construye Zubr Mini |
| Zubr Mini 1.9 3B (alekringtonnn-ai) | ~3B | no disponible | Imagen-texto a texto | no disponible en la información | GGUF, MLX | Versión menor de la misma familia, con menor calidad de razonamiento y visión según el autor |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Las cuantizaciones IQ2_M y Q2_K degradan la calidad de forma notable según el propio autor; no son adecuadas para tareas de razonamiento o visión exigentes.
- El formato "fast thinking" intercala razonamiento en la respuesta, lo que puede reducir la trazabilidad de los pasos de razonamiento frente a modelos con cadena de pensamiento explícita.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en OCR de imágenes de baja calidad o en tablas densas.
- No se especifican en la información disponible los sesgos conocidos, el número de tokens de entrenamiento ni la composición del dataset, lo que limita la evaluación de riesgos.
- La longitud de contexto no está publicada; conviene verificarla antes de usarlo en conversaciones o documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo deriva de Ministral-3-8B-Instruct-2512; conviene revisar las condiciones de la licencia del modelo base antes de un despliegue comercial.
- El rendimiento multilingüe está declarado para 47 idiomas, pero no hay evaluaciones publicadas por idioma; el foco declarado es el ruso.
- El repositorio tiene un volumen de descargas bajo (491) y un solo "like", lo que indica poca validación comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF
- Versión 3B de la familia: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b
- Versión MLX para Mac: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Cuantización IQ2_M: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.IQ2_M.gguf
- Cuantización Q2_K: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.Q2_K.gguf
- Cuantización Q3_K_S: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.Q3_K_S.gguf
- Cuantización Q3_K_M: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.Q3_K_M.gguf
- Cuantización Q4_0: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.Q4_0.gguf
- Cuantización Q5_K_S: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b/blob/main/zubr-mini-1.9-8b.Q5_K_S.gguf
- Sitio del autor: https://zubrmax.site
