# tencent/WeMM-Ecom-4B-GGUF

## Resumen

WeMM-Ecom-4B-GGUF es la edición cuantizada en formato GGUF de WeMM-Ecom-4B, un modelo multimodal (image-text-to-text) desarrollado por WeChat Vision, Tencent, orientado a la comprensión de contenido en el ámbito del comercio electrónico. Forma parte de una familia que abarca cinco tamaños (0.8B, 2B, 4B, 9B y 35B-A3B) y que, según el autor, mantiene capacidades generales equiparables a modelos del mismo orden de magnitud.

El modelo es un transformer denso de 4.205.751.296 parámetros (aproximadamente 4B), con una ventana de contexto de 262.144 tokens, y combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16. Soporta modo de razonamiento híbrido (instruct y thinking) y está pensado para desplegarse con llama.cpp, tanto en línea de comandos como mediante un servidor local compatible con la API de OpenAI.

Su relevancia radica en que ofrece un modelo multimodal especializado en e-commerce con licencia Apache 2.0 y un formato de despliegue ligero (repo de 3,4 GB), lo que facilita su integración en entornos con recursos limitados. El autor reporta una ventaja de 6,47 puntos frente a Qwen3.5-4B en la media de benchmarks de e-commerce y de 0,40 puntos en la media de benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia Qwen3.5 |
| Parámetros totales | 4.205.751.296 (≈4B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

WeMM-Ecom-4B es un modelo denso de aproximadamente 4B parámetros construido sobre la familia Qwen3.5, según indican las etiquetas del repositorio. La variante GGUF combina los pesos del modelo de lenguaje cuantizados a Q4_K_M con un proyector multimodal en F16, lo que permite ejecutar inferencia multimodal con llama.cpp. El modelo soporta razonamiento híbrido, con modos instruct y thinking diferenciados en la evaluación publicada.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona un informe técnico (technical report) asociado a la familia, pero los datos concretos de entrenamiento no se recogen en la model card proporcionada. La evaluación se estructura en 28 benchmarks de e-commerce distribuidos en ocho escenarios y 64 benchmarks generales en ocho categorías, con puntuaciones en escala 0-100.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto para producir respuestas conversacionales.
- Comprensión de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación (retrieval), grounding, razonamiento y conocimiento de producto.
- Modo de razonamiento híbrido: soporta modo instruct y modo thinking, con resultados de benchmark diferenciados para cada uno.
- Capacidades generales: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Conversación multi-turno: pipeline etiquetado como conversacional.
- Despliegue local: inferencia por línea de comandos y servidor local compatible con la API de OpenAI mediante llama.cpp.
- Soporte de vídeo: la guía de inicio rápido menciona rutas locales de imagen y vídeo como contenido de entrada.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar contenido inapropiado, apoyándose en las capacidades de moderación evaluadas dentro del conjunto de benchmarks de e-commerce.
- Extracción de atributos de producto: a partir de imágenes y descripciones, generar fichas estructuradas con atributos (color, material, categoría) para catálogos, usando el modo instruct para respuestas directas.
- OCR en publicaciones de vendedores: extraer texto de imágenes de producto (etiquetas, precios, especificaciones) para normalizar datos de catálogo.
- Asistencia conversacional al comprador: gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, adecuado para hilos largos de atención al cliente con historial extenso e imágenes adjuntas.
- Búsqueda y recuperación multimodal: indexar y recuperar productos combinando representaciones de imagen y texto, apoyándose en las tareas de retrieval evaluadas por el autor.
- Razonamiento sobre conocimiento de producto: responder preguntas técnicas sobre productos (compatibilidades, especificaciones) en modo thinking cuando se requiere razonamiento multi-paso.
- Despliegue en entornos con recursos limitados: al estar cuantizado a Q4_K_M con un repo de 3,4 GB, puede ejecutarse en estaciones de trabajo sin GPU de gran capacidad mediante llama.cpp.

## Benchmarks y rendimiento

El autor reporta comparaciones agregadas frente a Qwen3.5-4B, pero los valores numéricos completos se presentan únicamente como imágenes en la model card y no están disponibles como texto.

| Benchmark | WeMM-Ecom-4B | Qwen3.5-4B | Diferencia |
|---|---|---|---|
| Media de benchmarks de e-commerce (28 benchmarks, 8 escenarios) | no disponible (solo diferencia) | no disponible | +6,47 puntos |
| Media de benchmarks generales (64 benchmarks, 8 categorías) | no disponible (solo diferencia) | no disponible | +0,40 puntos |

No se han publicado resultados numéricos desagregados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 3,4 GB (Q4_K_M + proyector F16); la VRAM necesaria para cargar los pesos completos en GPU es del orden de 4-5 GB, a lo que hay que sumar la memoria para el contexto (hasta 262.144 tokens, lo que puede incrementar sustancialmente el consumo de KV cache).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cabría esperar GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, así como A100/H100 para despliegues de mayor concurrencia, pero el autor no confirma modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos cuantizados (3,4 GB), aunque el contexto máximo de 262.144 tokens requiere planificación de memoria.
- Opciones de despliegue: llama.cpp (compilación con CUDA, CPU, Metal, Vulkan u otros backends), con `llama-cli` y `llama-server` (servidor compatible con la API de OpenAI). El autor indica una revisión concreta de llama.cpp probada: `a8f8294c45076538f4509754e4c79fc51a1a486b`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-GGUF | ≈4B (denso) | 262.144 | Multimodal e-commerce | Apache 2.0 | GGUF |
| Qwen3.5-4B | ≈4B | no disponible | Multimodal general | no disponible | no disponible |
| WeMM-Ecom-2B-GGUF | ≈2B | no disponible | Multimodal e-commerce | Apache 2.0 | GGUF |
| WeMM-Ecom-9B-GGUF | ≈9B | no disponible | Multimodal e-commerce | Apache 2.0 | GGUF |

El autor sitúa a WeMM-Ecom-4B por delante de Qwen3.5-4B tanto en e-commerce (+6,47 puntos de media) como en capacidades generales (+0,40 puntos). No se dispone de datos de rendimiento de los modelos de 2B y 9B de la propia familia en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al estar entrenado para e-commerce de WeChat, puede reflejar sesgos del dominio y del mercado chino.
- Alucinación: no se documenta una evaluación específica de tasas de alucinación; en tareas de conocimiento de producto conviene validar las respuestas.
- Contexto: aunque la ventana es de 262.144 tokens, el uso del contexto máximo con cuantización Q4_K_M incrementa el consumo de memoria y puede afectar a la latencia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base.
- Producción: la model card fija una revisión concreta de llama.cpp para el despliegue; usar otras versiones puede provocar incompatibilidades. El modelo está cuantizado a Q4_K_M, lo que implica una pérdida de precisión frente a BF16.
- Datos de benchmark: los resultados completos se presentan como imágenes, no como tablas de texto, lo que dificulta su verificación automatizada.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- GGUF 2B: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- GGUF 9B: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
