# Soulfate24/OvisOCR3-Paretrix-GGUF

## Resumen

OvisOCR3-Paretrix-GGUF es una coleccion de cuantizaciones GGUF del modelo multimodal ATH-MaaS/OvisOCR3, publicada por el usuario Soulfate24. El modelo base es un sistema de image-text-to-text especializado en OCR y parsing de documentos, capaz de convertir imagenes de documentos en Markdown estructurado, incluyendo tablas, formulas y extraccion de informacion clave. Con 752 millones de parametros, se posiciona como una alternativa compacta frente a modelos de OCR basados en LLM de mayor tamano.

La aportacion principal de este repositorio no es el modelo en si, sino el conjunto de cuantizaciones "Paretrix", una metodologia empirica de cuantizacion hibrida que asigna distintos tipos de cuantizacion a distintas clases de tensores en funcion de su sensibilidad medida, en lugar de aplicar un unico bitwidth uniforme a toda la red. El autor publica 13 variantes con tamanos que van desde 774 MiB (Q8_0) hasta 323 MiB (Femto-21pc), acompanadas de metricas de perplejidad, divergencia KL y RMS delta-p.

El resultado es relevante para desarrolladores que necesitan desplegar OCR de documentos en entornos con VRAM limitada: las variantes intermedias ofrecen un equilibrio medido entre calidad y tamano, con datos objetivos de degradacion que permiten elegir el compromiso adecuado. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag qwen3_5 en el repo, detalles no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx, y variantes Paretrix (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,2 GB con multiples variantes) |

## Arquitectura y entrenamiento

El modelo base ATH-MaaS/OvisOCR3 es un sistema multimodal de tipo image-text-to-text orientado a OCR y parsing de documentos. El tag `qwen3_5` presente en el repositorio sugiere una base derivada de la familia Qwen, aunque no se detalla la arquitectura exacta del encoder visual ni del decoder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de este repositorio es el proceso de cuantizacion Paretrix. El autor describe un metodo empirico y activation-aware: partiendo de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), cada clase de tensor se mueve individualmente a cada tipo de cuantizacion y se mide contra los logits BF16. Con esas mediciones se resuelve un problema de mochila (knapsack) exacto para planificar cada nivel, y un "duelo" en el regimen de veredicto decide si el plan sustituye al campeon. El resultado son variantes con bitwidth mixto optimizadas para el modelo concreto, no para una familia generica.

## Capacidades

- OCR y parsing de documentos: conversion de imagenes de documentos a Markdown estructurado.
- Extraccion de tablas y formulas a partir de imagenes.
- Extraccion de informacion clave (key-information-extraction) de documentos.
- Figure captioning: generacion de descripciones para figuras.
- Procesamiento multimodal image-text-to-text.
- Compatible con vLLM y llama.cpp segun los tags del repositorio.
- Endpoints compatibles (tag `endpoints_compatible`).
- Capacidades conversacionales (tag `conversational`).
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo convierte la imagen del documento en Markdown con tablas, permitiendo extraer lineas de pedido y totales de forma automatizada en un pipeline de contabilidad.
- Procesamiento de articulos cientificos: extraccion de formulas y tablas de PDFs renderizados como imagen, util para construir bases de conocimiento tecnicas.
- Extraccion de informacion clave en formularios: identificacion de campos y valores en documentos escaneados, con salida estructurada en Markdown.
- Generacion de descripciones de figuras para accesibilidad: el modelo puede producir captions de imagenes y figuras en documentacion, mejorando la accesibilidad de repositorios y publicaciones.
- Despliegue en entornos con VRAM limitada: las variantes Mini-30pc (446 MiB) y Nano-27pc (405 MiB) permiten ejecutar OCR de documentos en GPUs de consumo o incluso en CPU via llama.cpp, con degradacion de perplejidad medida y acotada.
- Pipelines de ingestion documental a gran escala: al ser un modelo de 752 M de parametros, el throughput por GPU es alto y el coste por pagina procesada bajo, adecuado para lotes masivos de digitalizacion.
- Servicio de OCR como API: integrable en vLLM para servir peticiones concurrentes con endpoints compatibles con OpenAI.

## Benchmarks y rendimiento

El autor publica metricas de cuantizacion (perplejidad, divergencia KL, RMS delta-p y top-p) para cada variante, no benchmarks de tareas (MMLU, HumanEval, etc.).

| Modelo | MiB | PPL | Delta PPL | KLD | RMS delta p | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 774 | 29,2935 | +0,1753 | 0,0015 | 0,93% | 97,9% |
| Fidelity-48pc | 704 | 29,4017 | +0,2836 | 0,0025 | 1,19% | 97,2% |
| Precision-42pc | 620 | 29,2723 | +0,1541 | 0,0047 | 1,62% | 95,8% |
| Q6_K-imx (stock) | 601 | 29,5624 | +0,4442 | 0,0060 | 1,76% | 95,5% |
| Q5_K_M-imx (stock) | 551 | 29,9596 | +0,8414 | 0,0133 | 2,73% | 93,9% |
| Quality-36pc | 533 | 29,8921 | +0,7739 | 0,0139 | 2,79% | 93,3% |
| Compact-33pc | 490 | 30,8873 | +1,7692 | 0,0292 | 4,15% | 90,6% |
| IQ4_XS-imx (stock) | 481 | 33,3498 | +4,2316 | 0,0588 | 5,79% | 87,7% |
| Mini-30pc | 446 | 31,4572 | +2,3390 | 0,0527 | 5,33% | 87,0% |
| IQ3_M-imx (stock) | 433 | 34,8456 | +5,7274 | 0,1547 | 9,83% | 81,5% |
| Nano-27pc | 405 | 32,6288 | +3,5107 | 0,0824 | 6,58% | 85,2% |
| Pico-24pc | 364 | 38,9024 | +9,7842 | 0,1702 | 9,86% | 77,9% |
| Femto-21pc | 323 | 44,3950 | +15,2768 | 0,2947 | 12,96% | 71,6% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde aproximadamente 0,4 GB (Femto-21pc, 323 MiB) hasta 0,9 GB (Q8_0, 774 MiB), mas el overhead del runtime y del encoder visual.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es mas que suficiente; tambien cabe en GPUs de 4-8 GB y en iGPU con memoria compartida.
- Cabe en consumer GPU: si, con amplio margen en todas las variantes.
- Opciones de despliegue: llama.cpp, Ollama (via GGUF), vLLM (segun tags), transformers con backend compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvisOCR3-Paretrix-GGUF | 752 M | No disponible | OCR documental multimodal, GGUF cuantizado | Apache 2.0 | Hugging Face |
| ATH-MaaS/OvisOCR3 (base) | 752 M | No disponible | OCR documental multimodal, pesos completos | Apache 2.0 | Hugging Face |
| Otros modelos OCR-LLM de ~1B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de OCR en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar contenido en documentos con baja calidad de imagen o layouts atipicos.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para documentos de muchas paginas en una sola pasada.
- Las variantes de cuantizacion agresiva (Pico-24pc, Femto-21pc) presentan degradacion significativa: KLD de 0,1702 y 0,2947 respectivamente, y caidas de top-p hasta 77,9% y 71,6%, lo que puede afectar la fidelidad del OCR.
- El repositorio es una cuantizacion de terceros (Soulfate24), no una publicacion oficial del autor del modelo base; la reproducibilidad de las metricas Paretrix depende de la metodologia del autor.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base ATH-MaaS/OvisOCR3 antes de uso comercial.
- El modelo tiene 752 M de parametros: no compite en razonamiento general con LLMs de mayor tamano; su uso esta acotado a tareas de vision-documento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/OvisOCR3-Paretrix-GGUF
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
