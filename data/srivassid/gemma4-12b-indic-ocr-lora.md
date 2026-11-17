# srivassid/gemma4-12b-indic-ocr-lora

## Resumen

El modelo `srivassid/gemma4-12b-indic-ocr-lora` es un adaptador LoRA (r=16) entrenado sobre el modelo vision-language `google/gemma-4-12B-it` para tareas de OCR de páginas y generación de pies de foto en lenguas índicas. Lo desarrolla el usuario de Hugging Face `srivassid` y se distribuye como adaptador PEFT, no como modelo completo: es necesario cargarlo sobre el modelo base para poder utilizarlo. Resuelve un problema concreto: el modelo base, pese a su capacidad multimodal, falla sistemáticamente al transcribir texto en escrituras índicas, con tasas de error de carácter (CER) cercanas a 1,0 en la mayoría de lenguas.

El adaptador se entrenó con QLoRA (base en NF4 de 4 bits) sobre aproximadamente 35.756 muestras de OCR de página y captioning procedentes de Internet Archive, Wikisource, Vaani y WIT. La innovación principal es práctica: demuestra que un ajuste fino ligero y de bajo coste (14,8 horas en dos RTX 3080) puede reducir el CER de 0,991 a 0,379 en diez lenguas índicas, aunque a costa de degradar la traducción inglés-índico (chrF de 57,1 a 47,4).

Es relevante ahora porque ataca un cuello de botella real en digitalización de patrimonio documental del sur de Asia con recursos computacionales modestos, y porque publica tanto los datos de entrenamiento (manifiesto) como el código de evaluación, algo poco habitual en adaptadores de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (vision-language) Gemma 4 12B |
| Parametros totales | No disponible (adaptador LoRA con r=16; el modelo base es de 12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens durante entrenamiento (contexto del base: no disponible) |
| Tipos de cuantizacion | Base en NF4 4-bit con doble cuantizacion (QLoRA); adaptador en safetensors; bf16 en cómputo |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, ne, or, pa, ta, te, ur, sa, mai, doi, kok, ks, mni, sat, sd, brx, gbm (22 lenguas índicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica únicamente a las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje de `google/gemma-4-12B-it`; el vision tower, el proyector multimodal y el `lm_head` quedan congelados y sin cuantizar (excluidos explícitamente de la cuantización NF4 mediante `llm_int8_skip_modules`). La configuración LoRA es r=16, alpha=32, dropout 0,05. El entrenamiento usó QLoRA con base en NF4 de 4 bits, doble cuantización y cómputo en bf16, optimizador paged AdamW de 8 bits con lr 1e-4 y schedule coseno, batch global de 16 durante 2.235 pasos (una época). La pérdida se calcula solo sobre los tokens de respuesta, en bloques de 256 tokens para no materializar los logits del vocabulario de 262k.

Los datos de entrenamiento son 35.756 muestras (de 36.000 seleccionadas al azar con semilla 42; 244 descartadas por superar 2.048 tokens) extraídas de un mix de 72.605 muestras: 15.879 de Internet Archive (OCR de página, 22 lenguas), 14.025 de Wikisource (OCR, 12 lenguas), 5.355 de Vaani (captioning, 19 lenguas) y 741 de WIT (captioning, solo hindi). Se aplicaron topes por lengua (IA 1.500, Wikisource 2.500, Vaani 700) para evitar sobrerrepresentación de las lenguas mayoritarias. Las imágenes se redimensionaron a un máximo de 1.344 px, generando 280 tokens de imagen. La pérdida de entrenamiento pasó de 3,40 a 2,31 y la de validación de 2,438 a 2,145. El entrenamiento se hizo en 2×RTX 3080 (20 GB) durante ~14,8 horas a ~0,67 muestras/s. No se menciona RLHF ni DPO.

## Capacidades

- OCR de páginas en 22 lenguas índicas (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, nepalí, oriya, panyabí, tamil, telugu, urdu, sánscrito, maithili, dogri, konkani, cachemir, manipuri, sánscrito, sindhi, bodo y garo), con reducción de CER de 0,991 a 0,379 en el conjunto de evaluación.
- Generación de pies de foto (captioning) de imágenes en lenguas índicas.
- Comprensión de imagen y texto (pipeline `image-text-to-text`).
- Instrucciones en inglés: el adaptador se entrenó con cuatro formulaciones de prompt para OCR y cuatro para captioning, todas en inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico del adaptador (heredado del base, no evaluado).
- Capacidades multilingües limitadas a las 22 lenguas índicas listadas y al inglés como idioma de instrucción.

## Casos de uso

- Digitalización de patrimonio documental: procesar escaneos de la Digital Library of India y de Wikisource para extraer texto transcrito en bengalí, tamil o telugu, donde el modelo base falla con CER ~0,95 y el adaptador baja a 0,20-0,22.
- Construcción de corpus para PLN de bajos recursos: transcribir páginas de lenguas como oriya, malabar o cachemir (CER 0,57-0,60) para alimentar datasets de entrenamiento de modelos lingüísticos en esas lenguas.
- Indexación y búsqueda en archivos: extraer texto de páginas escaneadas para generar índices buscables, usando el adaptador con decodificación greedy y prompts fijos de OCR.
- Catalogación de imágenes en repositorios Wikimedia: generar pies de foto en hindi y otras lenguas índicas a partir de imágenes, aprovechando las muestras de WIT y Vaani del entrenamiento.
- Accesibilidad: describir imágenes en lenguas índicas para usuarios con discapacidad visual, con la salvedad de que la calidad de captioning no se reporta cuantitativamente en la model card.
- Prototipado con hardware de consumo: desplegar el adaptador en una única GPU de 20 GB (RTX 3080) con cuantización NF4, dado que el entrenamiento cupo en dos de esas tarjetas y la inferencia requiere cargar el base en 4 bits.

## Benchmarks y rendimiento

Evaluación sobre IndicVisionBench (Krutrim AI Labs), no incluido en entrenamiento, decodificación greedy, mismos prompts y mismas muestras para base y adaptador:

| Tarea | Métrica | Base | Adaptador |
|---|---|---|---|
| OCR (200 páginas, 20 por lengua) | CER (menor es mejor) | 0,991 | 0,379 |
| Traducción inglés-índico (106 ítems) | chrF (mayor es mejor) | 57,1 | 47,4 |

Resultados por lengua (base / adaptador):

| Lengua | CER OCR | chrF traducción |
|---|---|---|
| Bengalí | 0,91 / 0,20 | 67,1 / 60,8 |
| Gujarati | 0,93 / 0,32 | 55,8 / 45,1 |
| Hindi | 0,91 / 0,35 | 65,0 / 59,2 |
| Canarés | 0,95 / 0,44 | 54,6 / 45,2 |
| Malabar | 1,10 / 0,60 | 56,4 / 42,4 |
| Maratí | 0,89 / 0,33 | 58,6 / 44,7 |
| Oriya | 1,12 / 0,57 | 32,4 / 24,3 |
| Panyabí | 1,14 / 0,26 | 45,8 / 46,0 |
| Tamil | 0,95 / 0,22 | 65,8 / 46,3 |
| Telugu | 1,00 / 0,49 | 61,2 / 57,8 |

No se publican resultados de MMLU, HumanEval ni GSM8K para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base en NF4 4 bits más el adaptador requiere aproximadamente 8-10 GB de VRAM para inferencia; el entrenamiento cupo en 2×RTX 3080 de 20 GB.
- GPU recomendadas: RTX 3080/3090, RTX 4090, A100, H100. El entrenamiento se validó en RTX 3080 de 20 GB.
- Cabe en GPU de consumo: sí, en RTX 3080/3090 y superiores con cuantización NF4; en bf16 completo el base de 12B no cabe en GPU de consumo.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` + `PeftModel` + `BitsAndBytesConfig` (NF4); el código de ejemplo usa `attn_implementation="sdpa"` y `device_map={"": 0}`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; durante entrenamiento se reportan ~0,67 muestras/s en 2×RTX 3080.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OCR indic | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Gemma 4 12B) | 12B base + LoRA r=16 | 2.048 (entrenamiento) | CER 0,379 | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it (base) | 12B | No disponible | CER 0,991 | No disponible en la información | Hugging Face |
| Alternativas OCR índicas especializadas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de OCR índico en la documentación proporcionada.

## Limitaciones y advertencias

- La mejora en OCR está sobreestimada por el baseline: con el prompt de estilo de entrenamiento, el modelo base a menudo no transcribe y en su lugar describe la página en inglés, inflando el CER base.
- Degradación de la traducción: el chrF inglés-índico cae de 57,1 a 47,4; no usar este adaptador para traducción.
- El adaptador es dependiente del prompt: solo se entrenó con cuatro formulaciones de OCR y cuatro de captioning, todas en inglés; otros prompts pueden degradar el rendimiento.
- El conjunto de entrenamiento es una porción pequeña de los datos disponibles (el set de Internet Archive tiene ~710k muestras antes del tope); los topes y el subconjunto de 36k se eligieron por presupuesto de ~15 horas, no por calidad.
- Calidad desigual por lengua: malabar (CER 0,60) y oriya (0,57) quedan muy por detrás de bengalí (0,20) y tamil (0,22).
- No se reportan métricas de captioning, solo de OCR y traducción.
- Riesgo de alucinación inherente al modelo base no evaluado específicamente para este adaptador.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base `google/gemma-4-12B-it`, cuyos términos no se detallan en la información disponible.
- Solo se publican resultados agregados; las páginas del benchmark no se redistribuyen.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/srivassid/gemma4-12b-indic-ocr-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de manifiesto: https://huggingface.co/datasets/srivassid/indic-vlm-ocr-caption-manifest-v1
- Benchmark IndicVisionBench: https://huggingface.co/datasets/krutrim-ai-labs/IndicVisionBench
