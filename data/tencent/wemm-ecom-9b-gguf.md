# tencent/WeMM-Ecom-9B-GGUF

## Resumen

WeMM-Ecom-9B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-9B, desarrollado por WeChat Vision (Tencent). Se trata de un modelo denso de aproximadamente 8.950 millones de parámetros (8,95B) orientado a la comprensión de contenido multimodal en el ámbito del comercio electrónico, con capacidad para procesar entradas de imagen y texto y generar respuestas conversacionales. Esta variante GGUF combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, lo que permite su despliegue con llama.cpp tanto en modo CLI como mediante un servidor local compatible con la API de OpenAI.

El modelo forma parte de una familia que incluye versiones de 0,8B, 2B, 4B, 9B y 35B-A3B, y está diseñado para tareas de comercio electrónico como atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto, además de mantener capacidades generales de visión-lenguaje. Según la model card, supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de comercio electrónico, y también mejora a ambos en benchmarks generales.

La relevancia actual de esta ficha radica en que ofrece un contexto de 262.144 tokens (256K), soporte de "thinking híbrido" (modo instruct y modo thinking) y una licencia Apache 2.0 permisiva, lo que facilita su uso comercial. Su formato GGUF y su integración con llama.cpp lo hacen accesible para despliegues en hardware de consumo y entornos sin infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + proyector multimodal); etiquetado como qwen3_5 en los tags |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; proyector multimodal en F16 (GGUF). Existen otras variantes del modelo base en BF16, FP8 y GPTQ |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base también disponible en safetensors (BF16), FP8 y GPTQ |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo denso de 9B parámetros con arquitectura transformer multimodal. El pipeline declarado es image-text-to-text, lo que implica un codificador visual y un proyector que alinean representaciones de imagen con el espacio del modelo de lenguaje. En esta edición GGUF, el modelo de lenguaje se cuantiza a Q4_K_M mientras que el proyector multimodal se mantiene en F16, una configuración habitual para preservar la calidad de la alineación visual sin disparar el tamaño del artefacto. Los tags del repositorio indican una base arquitectónica etiquetada como qwen3_5.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se menciona que la familia se evalúa sobre 28 benchmarks de comercio electrónico en ocho escenarios y 64 benchmarks generales en ocho categorías, con puntuaciones en escala 0-100. El modelo soporta "hybrid thinking", es decir, modos de razonamiento instruct y thinking, lo que sugiere un entrenamiento orientado a tareas de razonamiento multi-paso además de respuestas directas. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión multimodal de imagen y texto (image-text-to-text), con soporte para imágenes y, según la guía de inicio rápido, también vídeo.
- Comprensión de contenido de comercio electrónico: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Capacidades generales de visión-lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen e instrucciones.
- Modo de razonamiento híbrido: modo instruct (respuesta directa) y modo thinking (razonamiento explícito multi-paso).
- Conversación multi-turno con contexto largo de hasta 262.144 tokens.
- Soporte multilingüe limitado a chino e inglés.
- Despliegue con llama.cpp mediante CLI y servidor local compatible con la API de OpenAI.

No se menciona en la información disponible soporte explícito de tool calling o function calling, ni capacidades de audio.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, aprovechando sus benchmarks específicos de moderación y su contexto de 256K tokens para revisar lotes de publicaciones.
- Extracción de atributos de producto: a partir de fotos de producto y descripciones, el modelo puede generar fichas estructuradas con atributos (color, material, talla, categoría), útil para catalogación automática a gran escala.
- OCR y digitalización de etiquetas: permite leer texto en imágenes de envases, etiquetas y documentos comerciales, integrándose en pipelines de digitalización de inventario.
- Asistencia al cliente en comercio electrónico: con conversación multi-turno y contexto largo, puede gestionar consultas de compradores sobre productos, incluyendo imágenes adjuntas del artículo o del embalaje.
- Búsqueda y recuperación multimodal: el modelo puede servir como componente de reranking o comprensión en sistemas de búsqueda visual de productos dentro de un catálogo.
- Generación de descripciones de producto: a partir de imágenes y especificaciones, puede redactar descripciones comerciales en chino o inglés, reduciendo el trabajo manual de los vendedores.
- Evaluación de calidad de imágenes de listados: detección de imágenes borrosas, recortadas o con texto ilegible en anuncios, mediante grounding y comprensión espacial.
- Despliegue en entornos con hardware limitado: gracias a la cuantización Q4_K_M y llama.cpp, puede ejecutarse en estaciones de trabajo o servidores sin GPU de datacenter, para prototipos y validación de casos de uso de comercio electrónico.

## Benchmarks y rendimiento

La model card incluye comparaciones en forma de imágenes (no tablas de texto) para los benchmarks de comercio electrónico y generales del checkpoint BF16 de WeMM-Ecom-9B. Los datos numéricos concretos no están disponibles en formato textual en la información proporcionada. Los únicos datos citados son agregados:

| Comparación | Diferencia en media de benchmarks |
|---|---|
| WeMM-Ecom-9B vs Qwen3.5-9B (comercio electrónico) | +5,19 puntos |
| WeMM-Ecom-9B vs Valley3-8B (comercio electrónico) | +10,28 puntos |
| WeMM-Ecom-9B vs Qwen3.5-9B (general) | +0,83 puntos |
| WeMM-Ecom-9B vs Valley3-8B (general) | +13,02 puntos |

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en formato textual en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,6 GB en total (pesos Q4_K_M + proyector F16), por lo que se puede estimar un consumo de VRAM en torno a 7-10 GB para el modelo y el proyector, dependiendo del backend y del contexto utilizado.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar buen funcionamiento en GPUs consumer con 8-12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) para despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, previsiblemente en GPUs con al menos 8-12 GB de VRAM; también es posible la inferencia solo en CPU con `-ngl 0` y `--no-mmproj-offload`, según la guía del autor.
- Opciones de despliegue: llama.cpp (versión concreta indicada en la model card: commit `a8f8294c45076538f4509754e4c79fc51a1a486b`), con `llama-cli` y `llama-server` (servidor compatible con la API de OpenAI). Backends soportados: CUDA, CPU, Metal, Vulkan y otros según la guía oficial de llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-GGUF | ~8,95B (denso) | 262.144 tokens | Apache 2.0 | GGUF (Q4_K_M + F16 proyector) | Especializado en comercio electrónico, multimodal, thinking híbrido |
| Qwen3.5-9B | ~9B (no confirmado) | no disponible | no disponible | no disponible | Referencia de comparación en la model card; WeMM-Ecom-9B lo supera en media de benchmarks de comercio electrónico y generales |
| Valley3-8B | ~8B (no confirmado) | no disponible | no disponible | no disponible | Referencia de comparación en la model card; WeMM-Ecom-9B lo supera en media de benchmarks de comercio electrónico y generales |
| WeMM-Ecom-35B-A3B | 35B totales / 3B activos (MoE, según nombre) | no disponible | Apache 2.0 (según familia) | GGUF disponible | Versión mayor de la misma familia, con mejor rendimiento según la model card |

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otros idiomas, lo que puede degradar el rendimiento en aplicaciones en español.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de OCR, atributos de producto y conocimiento de producto; se recomienda validación humana en flujos críticos.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad; el modelo puede reflejar sesgos presentes en los datos de entrenamiento de comercio electrónico.
- La cuantización Q4_K_M puede introducir una ligera pérdida de calidad respecto al checkpoint BF16; los benchmarks publicados corresponden al modelo BF16, no a esta edición GGUF.
- El contexto de 262.144 tokens es amplio, pero el uso de contextos muy largos incrementa el consumo de memoria y reduce el throughput; no se han publicado cifras de rendimiento para esta variante cuantizada.
- Aunque la licencia es Apache 2.0, se recomienda revisar el archivo LICENSE del repositorio y las condiciones de uso de los datos de entrenamiento para despliegues comerciales.
- Requiere una revisión concreta de llama.cpp (commit indicado); versiones distintas pueden no cargar correctamente el proyector multimodal.
- No se declara soporte de tool calling ni de agentes; verificar antes de integrar en pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Familia GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia GGUF 2B: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Familia GGUF 4B: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF/blob/main/LICENSE
