# tencent/WeMM-Ecom-9B-GGUF

## Resumen

WeMM-Ecom-9B-GGUF es la edición cuantizada en formato GGUF de WeMM-Ecom-9B, un modelo multimodal (image-text-to-text) desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo parte de una arquitectura densa de 9B parámetros (8.953.803.264 en pesos safetensors) construida sobre la familia Qwen3.5, e incorpora un proyector multimodal que permite procesar imágenes y vídeo junto con texto. Esta versión GGUF combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, pensada para despliegue con llama.cpp.

El modelo resuelve tareas específicas del dominio e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de catálogo, además de mantener capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial y seguimiento de instrucciones. La familia WeMM-Ecom cubre tamaños de 0,8B, 2B, 4B, 9B y 35B-A3B, y según la model card el checkpoint de 9B supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de e-commerce, y también supera a ambos en benchmarks generales.

Su relevancia actual radica en que ofrece un modelo multimodal especializado en e-commerce con ventana de contexto de 262.144 tokens, licencia Apache 2.0, soporte de modo de pensamiento híbrido (instruct y thinking) y una edición GGUF que permite ejecución local vía llama.cpp con servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text) basado en Qwen3.5, con proyector multimodal |
| Parametros totales | 8.953.803.264 (9B denso) |
| Parametros activos | No aplica (modelo denso; la variante MoE es 35B-A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal) en esta edición GGUF; BF16, FP8 y GPTQ disponibles en otros repositorios |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo denso de 9B parámetros con arquitectura transformer multimodal de tipo image-text-to-text, construido sobre la base Qwen3.5. Integra un proyector multimodal que transforma representaciones visuales (imágenes y vídeo) en tokens comprensibles por el modelo de lenguaje, permitiendo entrada conjunta de texto e imagen. La edición GGUF mantiene el proyector en F16 para preservar la fidelidad de la proyección visual mientras cuantiza el modelo de lenguaje a Q4_K_M.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. La model card menciona un informe técnico (Technical Report) y una evaluación sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, con puntuaciones en escala 0-100, pero los resultados numéricos completos se presentan como imágenes y no están disponibles en texto. El modelo soporta modo de pensamiento híbrido (instruct y thinking), lo que constituye una innovación operativa destacable para alternar entre respuestas directas y razonamiento extendido.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y vídeo (pipeline image-text-to-text).
- Comprensión de contenido de e-commerce: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Modo de pensamiento híbrido: modo instruct (respuesta directa) y modo thinking (razonamiento extendido).
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidades multilingües limitadas a chino e inglés.
- No se especifica en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Moderación de listados de producto: el modelo puede analizar imágenes y texto de anuncios para detectar contenido prohibido o atributos inconsistentes, apoyándose en sus benchmarks de moderación y en la ventana de 262.144 tokens para revisar fichas extensas.
- Extracción de atributos de producto: a partir de imágenes de producto y descripciones, el modelo puede estructurar atributos (color, material, talla, categoría) para alimentar catálogos, gracias a sus capacidades de OCR y grounding.
- OCR y digitalización de fichas y etiquetas: procesamiento de imágenes con texto (etiquetas, embalajes, documentos) para extraer información y normalizarla en bases de datos de e-commerce.
- Búsqueda y recuperación multimodal: generación de representaciones y descripciones a partir de imágenes de producto para mejorar la recuperación y el emparejamiento entre consultas y artículos.
- Razonamiento sobre productos y recomendación: responder a preguntas comparativas o de idoneidad sobre productos usando el modo thinking para razonamientos multi-paso sobre atributos y especificaciones.
- Asistencia conversacional en atención al cliente: conversaciones multi-turno con contexto largo e imágenes adjuntas (por ejemplo, capturas de pedidos o fotos de producto) para resolver incidencias.
- Despliegue local con llama.cpp: ejecución en entornos con recursos limitados mediante el GGUF Q4_K_M y servidor compatible con OpenAI, útil para pruebas y prototipos de integración sin infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

La model card reporta comparaciones agregadas del checkpoint WeMM-Ecom-9B frente a Qwen3.5-9B y Valley3-8B, pero los resultados detallados se presentan como imágenes no transcritas. Los datos textuales disponibles son:

| Benchmark (media agregada) | WeMM-Ecom-9B vs Qwen3.5-9B | WeMM-Ecom-9B vs Valley3-8B |
|---|---|---|
| E-commerce (28 benchmarks, 8 escenarios) | +5,19 puntos | +10,28 puntos |
| General (64 benchmarks, 8 categorías) | +0,83 puntos | +13,02 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K, etc.) ni las tablas completas en formato texto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 6,6 GB (Q4_K_M + proyector F16), por lo que se requiere aproximadamente 7-8 GB de VRAM para cargar modelo y proyector, más memoria para el contexto KV.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en GPUs consumer con 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: sí, con cuantización Q4_K_M, siempre que se disponga de al menos ~8 GB de VRAM; con contexto largo (262.144 tokens) el coste de KV cache crece significativamente.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con API compatible con OpenAI), revisión probada a8f8294c45076538f4509754e4c79fc51a1a486b; builds para CUDA, CPU, Metal y Vulkan. Para CPU pura, usar `-ngl 0` y `--no-mmproj-offload`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-9B | 9B denso | 262.144 | Referencia (+5,19 vs Qwen3.5-9B en e-commerce; +0,83 en general) | Apache 2.0 | GGUF, BF16, FP8, GPTQ |
| Qwen3.5-9B | 9B | no disponible | Inferior en e-commerce y general según la model card | no disponible | no disponible |
| Valley3-8B | 8B | no disponible | Inferior en e-commerce (-10,28) y general (-13,02) | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y puede degradarse.
- Riesgo de alucinación inherente a modelos generativos multimodales, especialmente en descripciones de producto y OCR con imágenes de baja calidad.
- Sesgos potenciales derivados de los datos de entrenamiento de e-commerce de WeChat, no documentados en la información disponible.
- La ventana de 262.144 tokens implica un coste elevado de memoria KV cache en despliegue local; en GPUs consumer el contexto práctico será mucho menor.
- El repositorio GGUF solo incluye Q4_K_M y proyector F16; otras cuantizaciones no están disponibles en esta edición.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base y del informe técnico para atribución.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse para pipelines de automatización.
- La model card no transcribe los resultados numéricos completos de benchmarks, lo que limita la verificación independiente del rendimiento.

## Enlaces

- Modelo GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- GGUF 2B: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- GGUF 4B: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF/blob/main/LICENSE
