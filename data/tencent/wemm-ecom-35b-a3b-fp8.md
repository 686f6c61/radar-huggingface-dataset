# tencent/WeMM-Ecom-35B-A3B-FP8

## Resumen

WeMM-Ecom-35B-A3B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico de WeChat. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, construido sobre la arquitectura `qwen3_5_moe` y con una ventana de contexto de 262.144 tokens.

El modelo resuelve el problema de la comprensión multimodal especializada en e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de catálogo, además de mantener capacidades generales de visión-lenguaje. Según la model card, supera a Qwen3.5-35B-A3B en 3,92 puntos, a Qwen3.6-35B-A3B en 3,36 puntos y a MiniCPM-V-4.7-35B-A3B en 8,22 puntos en la media de benchmarks de e-commerce.

Esta variante FP8 es relevante porque reduce el peso del repositorio a 36,6 GB (frente al BF16 del modelo base) manteniendo la precisión en los componentes sensibles, lo que facilita el despliegue en infraestructura con GPUs compatibles con FP8 y motores de servicio que soporten cuantización FP8 por bloques.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 (~35B) |
| Parámetros activos | ~3B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 E4M3 por bloques (escala cada 128×128); el modelo base ofrece además BF16, GPTQ y GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 35B parámetros totales y aproximadamente 3B activos, sobre la base `qwen3_5_moe`. Es multimodal (image-text-to-text) y acepta entradas de texto, imagen, multi-imagen y vídeo. La cuantización FP8 E4M3 aplica una escala por cada bloque de 128×128 en los pesos, con cuantización dinámica de activaciones durante la inferencia; el encoder de visión, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original. El checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La evaluación del modelo base se realizó sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, con puntuaciones en escala 0-100. El modelo soporta modo instruct y modo thinking (razonamiento híbrido).

## Capacidades

- Comprensión multimodal de texto, imagen, multi-imagen y vídeo.
- Comprensión especializada de e-commerce: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Modo thinking (razonamiento híbrido) e modo instruct.
- Comprensión general de VQA, documentos, gráficos, STEM, razonamiento espacial, grounding, conteo, multi-imagen e instrucciones.
- Conversación multi-turno con contexto largo (262.144 tokens).
- Generación en streaming mediante API compatible con OpenAI.
- Capacidades multilingües limitadas a chino (zh) e inglés (en).

## Casos de uso

- Moderación de contenido en marketplace: clasificación y revisión de imágenes y textos de listados de producto para detectar contenido prohibido, usando el modo thinking para casos ambiguos.
- Extracción de atributos de producto: OCR y comprensión de imágenes de fichas técnicas para poblar catálogos estructurados (talla, color, material, compatibilidad).
- Búsqueda y recuperación multimodal: generación de representaciones y descripciones enriquecidas de productos para motores de búsqueda visual y textual dentro de la plataforma.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo (262k tokens) para resolver dudas sobre pedidos, devoluciones y compatibilidad de productos.
- Grounding y verificación visual: localización de elementos en imágenes de producto para comprobar que la foto corresponde a la descripción del listado.
- Análisis de reseñas con imágenes: interpretación conjunta de texto e imágenes enviadas por usuarios para detectar defectos, falsificaciones o reclamaciones.
- Asistentes de compra con razonamiento: modo thinking para comparar productos y justificar recomendaciones con base en atributos extraídos de imágenes y texto.

## Benchmarks y rendimiento

La model card presenta los resultados del checkpoint BF16 (WeMM-Ecom-35B-A3B), no de esta variante FP8, y las cifras completas están en imágenes no disponibles como texto. Los datos textuales disponibles son:

| Comparativa (media de benchmarks de e-commerce) | Diferencia frente a WeMM-Ecom-35B-A3B (BF16) |
|---|---|
| Qwen3.5-35B-A3B | -3,92 puntos |
| Qwen3.6-35B-A3B | -3,36 puntos |
| MiniCPM-V-4.7-35B-A3B | -8,22 puntos |

| Comparativa (media de benchmarks generales) | Diferencia frente a WeMM-Ecom-35B-A3B (BF16) |
|---|---|
| Qwen3.5-35B-A3B | -0,17 puntos |
| MiniCPM-V-4.7-35B-A3B | -5,60 puntos |
| Valley3-32B | -9,13 puntos |

No se han publicado resultados numéricos desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en formato texto en la información disponible; las tablas completas están en imágenes (`assets/ecommerce-instruct-table.png`, etc.).

## Requisitos de hardware

- VRAM estimada: el repositorio FP8 ocupa 36,6 GB, por lo que se necesita al menos una GPU con ~40 GB libres para cargar los pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: H100 (80 GB), A100 80 GB, L40S, o GPUs con soporte nativo FP8 (arquitecturas Hopper y posteriores). El modelo requiere una GPU compatible con FP8.
- GPU de consumo: no cabe en GPUs consumer de 24 GB en FP8; para ese perfil sería necesario recurrir a la variante GGUF del modelo base.
- Despliegue: vLLM (>= 0.31.0) con soporte de FP8 por bloques, que detecta automáticamente la configuración de cuantización. La model card no menciona soporte explícito para TGI, llama.cpp u Ollama en esta variante FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-FP8 | 35B totales / ~3B activos | 262.144 | Multimodal e-commerce | Apache 2.0 | FP8 (base: BF16, GPTQ, GGUF) |
| Qwen3.5-35B-A3B | 35B (MoE) | no disponible | Multimodal general | no disponible | no disponible |
| MiniCPM-V-4.7-35B-A3B | 35B (MoE) | no disponible | Multimodal general | no disponible | no disponible |
| Valley3-32B | 32B | no disponible | Multimodal general | no disponible | no disponible |

Según la model card, WeMM-Ecom-35B-A3B supera a los tres en la media de benchmarks de e-commerce y mantiene paridad o ventaja en benchmarks generales. Los datos de licencia y contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede reflejar sesgos del dominio y de la plataforma.
- Alucinación: como modelo generativo multimodal, puede producir descripciones o atributos incorrectos; requiere verificación en flujos críticos (moderación, catálogo).
- Cuantización: esta variante FP8 puede presentar degradación de precisión frente al BF16; la model card no publica comparativas numéricas FP8 vs. BF16.
- Hardware: requiere GPU con soporte FP8; no es desplegable en GPUs consumer de 24 GB en este formato.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para condiciones adicionales.
- Contexto: aunque la ventana es de 262.144 tokens, no se documentan pruebas de rendimiento en el extremo de esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Familia de modelos: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en HF: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
