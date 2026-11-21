# Truthseeker87/solarhive-e4b-ollama

## Resumen

SolarHive E4B es un ajuste fino por LoRA del modelo multimodal google/gemma-4-e4b-it, desarrollado por Truthseeker87 para el Gemma 4 Good Hackathon (Google DeepMind x Kaggle). El modelo está especializado en el dominio de la energía solar comunitaria: responde preguntas sobre instalaciones fotovoltaicas, predice producción energética a partir de datos meteorológicos y enruta llamadas a herramientas (function calling) hacia APIs como Open-Meteo, PVWatts, OpenWeatherMap y EIA. Se distribuye como checkpoint fusionado en safetensors BF16 (8.000 millones de parámetros), pensado como artefacto fuente para conversión a GGUF y despliegue local.

La arquitectura es la del Gemma 4 E4B: un transformer denso con una capa de embeddings posicionales (PLE, Per-Layer Embeddings) que da 8.000 millones de parámetros totales con aproximadamente 4.500 millones efectivos. El ajuste LoRA se aplicó sobre todas las capas lineales con rango 16, entrenando únicamente 41,2 millones de parámetros (0,51 % del total) en 420 segundos sobre una RTX PRO 6000. El corpus de entrenamiento es modesto: 1.727 ejemplos, mayoritariamente texto con grounding en APIs reales, más 14 turnos de Q&A sobre imágenes del cielo de Ann Arbor.

Su relevancia práctica está en el despliegue en el borde: el repo hermano solarhive-e4b-gguf publica una cuantización Q4_K_M de 5,34 GB más un proyector multimodal de 992 MB, lo que permite ejecutar el modelo con visión y audio en un portátil de 16 GB de RAM mediante Ollama o llama.cpp. La licencia del artefacto es MIT, aunque el modelo base Gemma 4 se rige por su propia licencia de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con PLE (Per-Layer Embeddings); base Gemma 4 E4B |
| Parametros totales | 7.996.156.490 (8B) |
| Parametros activos | No aplica (modelo denso); ~4,5B efectivos según el autor |
| Longitud de contexto | No disponible (el entrenamiento usó max_seq_length 2048, pero no se especifica la ventana de inferencia del modelo base) |
| Tipos de cuantizacion | BF16 (safetensors, repo principal); Q4_K_M GGUF con receta Q6_K-PLE (repo hermano); mmproj BF16 para visión y audio |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT para los archivos SolarHive; Apache 2.0 para el modelo base Gemma 4 según la model card (verificar en la página oficial de licencia de Google) |
| Formato de pesos | safetensors (BF16 fusionado); GGUF disponible en repo separado |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-e4b-it |
| Fine-tuning | LoRA (Unsloth FastVisionModel), rango 16, alpha 16, dropout 0, todas las capas lineales |
| Datos de entrenamiento | 1.727 ejemplos (dataset Truthseeker87/solarhive-community-solar-multimodal) |
| Tamaño del repo | 64,0 GB |
| Descargas / likes | 29 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer denso de 8.000 millones de parámetros con Per-Layer Embeddings, una variante que reparte información de embedding a lo largo de las capas y reduce el coste efectivo de cómputo (el autor cita 4,5B efectivos). El codificador visual del modelo base, de unos 150 millones de parámetros, no fue modificado por el LoRA: el ajuste es solo de texto, y la capacidad de VQA en inferencia proviene del encoder original de Gemma 4, siguiendo la receta de SFT de Vertex AI.

El entrenamiento se realizó con Unsloth FastVisionModel en BF16 sobre una RTX PRO 6000 (96 GB), con AdamW de 8 bits, learning rate 2e-4, 3 épocas, 5 pasos de warmup, semilla 3407 y longitud máxima de secuencia 2048. Se entrenaron 41,2M de parámetros (0,51 %) en 324 pasos y 420 segundos. La pérdida convergió a 0,9218 (media de los últimos 20 pasos); el autor advierte que la pérdida del paso final (0,0635) es una estadística puntual de un solo batch y no debe interpretarse como indicador de convergencia. El corpus combina 413 ejemplos manuales sobre 15+ ciudades estadounidenses y 9 dominios energéticos, unos 1.117 ejemplos con grounding en APIs en vivo (Open-Meteo, PVWatts, OWM, EIA), 183 ejemplos de tool calling (positivos, rechazos, aclaraciones de seguimiento y recuperación de fallos) y 14 turnos de Q&A sobre 7 fotografías del cielo etiquetadas manualmente.

## Capacidades

- Generación de texto conversacional especializado en energía solar comunitaria y sostenibilidad.
- Razonamiento sobre datos meteorológicos y de producción fotovoltaica (irradiancia, nubosidad, estimaciones PVWatts).
- Tool calling / function calling: enrutamiento de llamadas a APIs externas, con ejemplos de entrenamiento para rechazos negativos, aclaraciones de seguimiento y recuperación tras fallos.
- Respuesta a preguntas visuales (VQA) sobre imágenes del cielo mediante el encoder visual del modelo base, sin ajuste específico.
- Procesamiento de audio a través del proyector multimodal incluido en el repo GGUF (mmproj BF16).
- Capacidad multimodal image-text-to-text en transformers nativo con AutoModelForCausalLM.
- Base para extender el ajuste con nuevos datos mediante Unsloth FastVisionModel.

## Casos de uso

- Asistente de consulta para instalaciones solares comunitarias: el modelo responde preguntas sobre producción, ubicación y condiciones meteorológicas apoyándose en datos de APIs en vivo, con prompts que no salen del dispositivo en despliegue local.
- Enrutador de herramientas en pipelines de datos energéticos: dado un mensaje de usuario, decide qué API invocar (Open-Meteo, PVWatts, EIA) y con qué parámetros, gracias a los 183 ejemplos de tool calling del corpus.
- Predicción asistida de generación fotovoltaica: combina la consulta meteorológica con la estimación de producción y presenta el resultado en lenguaje natural para operadores de plantas comunitarias.
- Punto de información en el borde para técnicos de campo: desplegado vía Ollama en un portátil de 16 GB, permite consultar el estado de una instalación sin conexión a servicios de inferencia en la nube.
- Clasificación y descripción de condiciones del cielo a partir de fotografías: usa el encoder visual para interpretar imágenes y relacionarlas con la irradiancia esperada.
- Base de prototipado para hackathons y proyectos de sostenibilidad: al ser un LoRA pequeño (41,2M entrenables) y con licencia MIT, sirve como plantilla para adaptar Gemma 4 a otros dominios verticales con presupuesto de cómputo mínimo.
- Módulo de recuperación ante fallos en agentes: los ejemplos de failure-recovery del dataset permiten al modelo reformular o escalar cuando una llamada a API devuelve error.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluación interna (mayo 2026) | 9/10 | 5/5 Q&A registrados (no puntuados) + 4/5 tool routing + 2/3 When2Call |
| Tool routing (run local GGUF) | 5/5 | Ejecución local con Q4_K_M; la mitad de Q&A no se puntuó y el archivo de resultados no está en el repo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de una única ejecución con los prompts del propio proyecto, sin conjunto de validación reservado, por lo que no son comparables con evaluaciones independientes.

## Requisitos de hardware

- Inferencia en BF16 con transformers: ~16,9 GB de VRAM medidos en una RTX PRO 6000 durante la ejecución de mayo de 2026; requiere 24 GB o más de RAM de sistema para cargar.
- Despliegue en el borde: GGUF Q4_K_M de 5,34 GB más mmproj BF16 de 992 MB; funciona en un portátil con CPU y 16 GB de RAM.
- GPU recomendadas: RTX PRO 6000 (usada en entrenamiento e inferencia BF16), A100/H100 para BF16 en servidor; en consumer, RTX 4090/3090 con 24 GB para BF16, o cualquier GPU con 6-8 GB para el GGUF Q4_K_M.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M; en BF16 requiere 24 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (convert_hf_to_gguf.py + llama-quantize), Ollama (Modelfile listo en el repo GGUF), transformers con AutoModelForCausalLM.
- Advertencia de despliegue: la ruta experimental de importación directa en Ollama agota la memoria en máquinas de 16 GB o menos; en equipos de 24 GB o más funciona, pero el pipeline GGUF es el recomendado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolarHive E4B | 8B (4,5B efectivos) | No disponible | Imagen, audio, texto | MIT (artefacto) / Apache 2.0 (base) | Hugging Face, GGUF en repo hermano |
| google/gemma-4-e4b-it | 8B (4,5B efectivos) | No disponible | Imagen, audio, texto | Licencia Gemma 4 de Google | Hugging Face, Kaggle |
| SolarHive 26B A4B | 26B (MoE, 4B activos) | No disponible | Imagen, audio, texto | No disponible | Hugging Face |

La comparación con modelos de la misma categoría fuera de la familia SolarHive no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El ajuste LoRA es solo de texto: la capacidad visual y de audio proviene del modelo base sin adaptar al dominio solar, por lo que la precisión en VQA específica puede ser limitada.
- Corpus de entrenamiento pequeño (1.727 ejemplos) y centrado en ciudades estadounidenses; el rendimiento fuera de EE. UU. o en otros idiomas no está validado.
- Solo inglés: no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación en cifras energéticas: aunque el modelo está entrenado para invocar APIs, puede generar estimaciones plausibles sin llamada real a herramienta.
- Los resultados de benchmark son de una única ejecución con prompts del proyecto y sin conjunto reservado; no deben tomarse como medida de calidad general.
- La licencia del artefacto es MIT, pero el modelo base Gemma 4 se rige por la licencia de Google; conviene verificar las condiciones de uso comercial del modelo base antes de desplegar en producción.
- La ruta de importación experimental en Ollama falla por falta de memoria en equipos de 16 GB o menos; usar el GGUF.
- El repositorio ocupa 64 GB, lo que encarece la descarga y el almacenamiento frente al GGUF de 5,34 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
- Repo GGUF compañero: https://huggingface.co/Truthseeker87/solarhive-e4b-gguf
- Modelo 26B A4B: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Modelo base: https://kaggle.com/models/google/gemma-4
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Blog de receta SFT: https://huggingface.co/blog/gemma4
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://unsloth.ai
- Hackathon Gemma 4 Good: https://kaggle.com/competitions/gemma-4-good-hackathon
- Paper referenciado (arXiv 2504.18851): https://arxiv.org/abs/2504.18851
- Paper referenciado (arXiv 2211.17192): https://arxiv.org/abs/2211.17192
