# srivassid/drishti

## Resumen

Drishti es un adaptador LoRA (r=16) desarrollado por el usuario srivassid para el modelo multimodal `google/gemma-4-12B-it`. Su propósito es especializar el modelo base en dos tareas concretas sobre lenguas índicas: OCR de páginas escaneadas (transcripción literal del texto presente en la imagen) y generación de pies de foto (captioning) a partir de imágenes. El adaptador se entrenó con QLoRA en cuantización NF4 sobre aproximadamente 36.000 muestras, y se distribuye como pesos PEFT que deben cargarse encima del modelo base, no como un modelo autónomo.

La relevancia del proyecto radica en que el modelo base, pese a su tamaño de 12.000 millones de parámetros, apenas transcribe texto en escrituras índicas cuando se le pide con el formato de prompt adecuado: en la evaluación sobre IndicVisionBench su tasa de error de caracteres (CER) es de 0,991, es decir, prácticamente no produce transcripción útil. El adaptador reduce esa cifra a 0,379, lo que supone una mejora sustancial en una tarea con muy pocos recursos abiertos para escrituras como bengalí, tamil o telugu.

El adaptador cubre 22 lenguas índicas y se publica bajo licencia Apache 2.0, aunque hereda las limitaciones del modelo base. Es un artefacto de investigación con un presupuesto de entrenamiento modesto (unas 15 horas en dos RTX 3080), y el propio autor advierte de que la mejora en OCR va acompañada de un deterioro en la traducción inglés-índico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 12B (image-text-to-text) |
| Parametros totales | no disponible (adaptador LoRA r=16; el modelo base tiene 12.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base admite secuencias de entrenamiento de hasta 2.048 tokens en este adaptador |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion para el modelo base (QLoRA); pesos del adaptador en safetensors |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, ne, or, pa, ta, te, ur, sa, mai, doi, kok, ks, mni, sat, sd, brx, gbm (22 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar sobre `google/gemma-4-12B-it` |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje; la torre de visión, el proyector multimodal y los embedders de visión y audio, así como `lm_head`, permanecen sin cuantizar y sin adaptar. La configuración LoRA es r=16, alpha=32 y dropout de 0,05. El entrenamiento emplea QLoRA con el modelo base en NF4 de 4 bits, doble cuantización y cómputo en bf16, optimizador paged AdamW de 8 bits, tasa de aprendizaje 1e-4 con scheduler coseno, 100 pasos de calentamiento y recorte de gradiente de 1,0.

Los datos provienen de cuatro fuentes: escaneos de Internet Archive con texto OCR (15.879 muestras, 22 lenguas), escaneos y transcripciones de Wikisource (14.025 muestras, 12 lenguas), descripciones habladas de imágenes del corpus Vaani transcritas (5.355 muestras, 19 lenguas) y pies de foto de Wikipedia (WIT, 741 muestras, solo hindi). Se aplicaron topes por lengua (1.500 para Internet Archive, 2.500 para Wikisource y 700 para Vaani) para evitar el desequilibrio entre lenguas grandes y pequeñas. De las 36.000 muestras muestreadas con semilla 42, se descartaron 244 por superar los 2.048 tokens, quedando 35.756 efectivas. El entrenamiento consistió en una época de 2.235 pasos con lote global de 16, sobre dos RTX 3080 de 20 GB durante aproximadamente 14,8 horas, a un ritmo de 0,67 muestras por segundo. La pérdida se calculó solo sobre los tokens de respuesta, en fragmentos de 256 tokens para no materializar los logits del vocabulario de 262.000 entradas. La pérdida de entrenamiento bajó de 3,40 a 2,31 y la de validación (200 muestras reservadas) de 2,438 a 2,145.

## Capacidades

- OCR de páginas escaneadas en 22 lenguas índicas, con transcripción literal del texto de la imagen.
- Generación de pies de foto (captioning) de imágenes, incluyendo descripciones de escenas.
- Procesamiento multimodal imagen-texto mediante la torre de visión del modelo base Gemma 4 12B.
- Comprensión de instrucciones en inglés para las tareas de OCR y captioning (el prompt de entrenamiento es en inglés).
- Cobertura multilingüe amplia en escrituras índicas: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, nepalí, oriya, panyabí, tamil, telugu, urdu, sánscrito, maithili, dogri, konkani, cachemir, manipurí, sánscrito, sindhi, bodo y garo.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización de archivos coloniales y fondos de la Digital Library of India: el adaptador transcribe páginas escaneadas en escrituras índicas con un CER de 0,379 frente al 0,991 del modelo base, lo que lo hace viable para pipelines de OCR masivo en hindi, bengalí o tamil.
- Extracción de texto de documentos legales y administrativos en lenguas regionales: permite convertir PDFs escaneados en texto editable para su indexación y búsqueda, siempre que se use el formato de prompt de entrenamiento.
- Enriquecimiento de catálogos de bibliotecas digitales: genera pies de foto automáticos para imágenes de archivo, útil para metadatos de colecciones de Wikimedia o repositorios institucionales.
- Accesibilidad de material gráfico en lenguas índicas: descripción automática de imágenes para lectores de pantalla en comunidades lingüísticas con pocos recursos de visión-lenguaje.
- Investigación en OCR de escrituras de baja densidad de recursos: sirve como punto de partida para fine-tuning adicional sobre escrituras concretas (oriya, malayalam) donde el CER del adaptador sigue siendo alto (0,57 y 0,60).
- Prototipado de asistentes de lectura de documentos en dispositivos con una sola GPU: el adaptador cabe en una RTX 3080 de 20 GB con el modelo base en 4 bits, lo que abarata la experimentación frente a un fine-tuning completo.

## Benchmarks y rendimiento

Evaluación sobre IndicVisionBench (Krutrim AI Labs), conjunto externo al entrenamiento, con decodificación greedy y los mismos prompts para ambos modelos.

| Tarea | Métrica | Modelo base | Adaptador Drishti |
|---|---|---|---|
| OCR (200 páginas, 20 por lengua) | CER (menor es mejor) | 0,991 | 0,379 |
| Traducción inglés-índico (106 ítems) | chrF (mayor es mejor) | 57,1 | 47,4 |

Desglose por lengua (base / adaptador):

| Lengua | CER OCR | chrF traducción |
|---|---|---|
| Bengalí | 0,91 / 0,20 | 67,1 / 60,8 |
| Gujarati | 0,93 / 0,32 | 55,8 / 45,1 |
| Hindi | 0,91 / 0,35 | 65,0 / 59,2 |
| Canarés | 0,95 / 0,44 | 54,6 / 45,2 |
| Malayalam | 1,10 / 0,60 | 56,4 / 42,4 |
| Maratí | 0,89 / 0,33 | 58,6 / 44,7 |
| Oriya | 1,12 / 0,57 | 32,4 / 24,3 |
| Panyabí | 1,14 / 0,26 | 45,8 / 46,0 |
| Tamil | 0,95 / 0,22 | 65,8 / 46,3 |
| Telugu | 1,00 / 0,49 | 61,2 / 57,8 |

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa unos 0,3 GB (tamaño del repositorio); el modelo base en NF4 de 4 bits requiere aproximadamente 8-10 GB, y con la torre de visión y el proyector en bf16 se recomienda al menos 16-20 GB.
- GPU recomendadas: RTX 3080 de 20 GB (configuración usada en el entrenamiento), RTX 4090, A100 40 GB, H100.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y RTX 3080 de 20 GB con el modelo base cuantizado en 4 bits.
- Opciones de despliegue: transformers con PEFT y BitsAndBytes (flujo documentado por el autor); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se registraron 0,67 muestras por segundo con dos RTX 3080.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OCR índico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drishti (este adaptador) | LoRA sobre 12B | 2.048 tokens en entrenamiento | CER 0,379 en IndicVisionBench | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it (base) | 12B | no disponible | CER 0,991 en IndicVisionBench | no disponible | Hugging Face |
| Alternativas específicas de OCR índico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de OCR índico en la documentación proporcionada.

## Limitaciones y advertencias

- La mejora en OCR está sobreestimada por el comportamiento del modelo base: con el prompt de entrenamiento, el modelo base suele describir la página en inglés en lugar de transcribirla, lo que infla la diferencia entre ambos.
- Deterioro de la traducción inglés-índico: chrF cae de 57,1 a 47,4, con descensos acusados en tamil (65,8 a 46,3), maratí (58,6 a 44,7) y malayalam (56,4 a 42,4).
- El adaptador solo se entrenó con prompts en inglés (cuatro formulaciones de OCR y cuatro de captioning); usar otras formulaciones puede degradar el rendimiento.
- El OCR sigue siendo débil en oriya (CER 0,57) y malayalam (CER 0,60), y en menor medida en telugu (0,49) y canarés (0,44).
- Es un adaptador, no un modelo completo: requiere cargar `google/gemma-4-12B-it` y no funciona de forma autónoma.
- El entrenamiento se limitó a 36.000 muestras de un conjunto disponible de más de 710.000 en Internet Archive, con topes por lengua elegidos para ajustarse a un presupuesto de 15 horas, no por calidad.
- Riesgo de alucinación en la transcripción de páginas con baja calidad de escaneo o escrituras no representadas en el entrenamiento.
- Licencia Apache 2.0 declarada por el autor, pero el uso comercial debe verificar también los términos del modelo base Gemma 4.
- No se documentan evaluaciones de sesgo, robustez ante imágenes adversarias ni comportamiento en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/srivassid/drishti
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de manifiesto de entrenamiento: https://huggingface.co/datasets/srivassid/indic-vlm-ocr-caption-manifest-v1
- Benchmark IndicVisionBench: https://huggingface.co/datasets/krutrim-ai-labs/IndicVisionBench
