# tencent/WeMM-Ecom-4B-GGUF

## Resumen

WeMM-Ecom-4B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-4B, desarrollado por WeChat Vision (Tencent) para comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo resuelve la necesidad de procesar y entender contenido visual y textual propio del dominio e-commerce: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto, manteniendo además capacidades generales de visión-lenguaje.

Se trata de un modelo denso de 4B parámetros (4.205.751.296 según los pesos safetensors del checkpoint base), con una ventana de contexto de 262.144 tokens y soporte de "hybrid thinking" (modos instruct y thinking). La versión GGUF combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, pensada para despliegue con llama.cpp tanto en línea de comandos como en servidor local compatible con la API de OpenAI.

Su relevancia actual radica en que ofrece un modelo especializado en e-commerce con licencia Apache 2.0, empaquetado para inferencia eficiente en hardware modesto, y con un informe técnico publicado. Según la model card, supera a Qwen3.5-4B en 6,47 puntos de media en benchmarks de e-commerce y en 0,40 puntos en benchmarks generales, manteniendo un rendimiento general a la par de modelos del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5, etiqueta `qwen3_5`); modelo de lenguaje + proyector multimodal |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal); el checkpoint base dispone de BF16, FP8 y GPTQ |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`WeMM-Ecom-4B-GGUF.gguf` + `mmproj-F16.gguf`); el base en safetensors |

## Arquitectura y entrenamiento

WeMM-Ecom-4B es un modelo denso de 4B parámetros construido sobre la arquitectura Qwen3.5 (según la etiqueta `qwen3_5`), con un componente de lenguaje y un proyector multimodal que permite entrada image-text-to-text. La versión GGUF mantiene el proyector en F16 para preservar la calidad de la proyección visual mientras cuantiza el modelo de lenguaje a Q4_K_M, lo que reduce el peso y facilita el despliegue en llama.cpp. El modelo soporta un modo híbrido de razonamiento (instruct y thinking) y una ventana de contexto de 262.144 tokens.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí indica que el modelo se ha entrenado y evaluado sobre 28 benchmarks de e-commerce en ocho escenarios (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorías. Para más detalle sobre datos y metodología, la model card remite al informe técnico (arXiv:2611.30662).

## Capacidades

- Comprensión multimodal image-text-to-text: procesa imágenes junto con texto para responder preguntas y analizar contenido visual.
- Comprensión especializada en e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y razonamiento sobre productos.
- Conocimiento de producto y benchmarks públicos de e-commerce.
- Capacidades generales de visión-lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Modo híbrido de razonamiento: modos instruct y thinking.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Despliegue con llama.cpp: inferencia por línea de comandos y servidor local compatible con la API de OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada (más allá del modo thinking).
- Capacidades de audio: no disponible.
- Idiomas: chino e inglés.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar contenido inapropiado o fraudulento, aprovechando sus benchmarks específicos de moderación y su ventana de contexto de 262.144 tokens para revisar lotes de publicaciones.
- Extracción de atributos de producto: a partir de fotos de producto y descripciones, el modelo puede identificar y estructurar atributos (color, material, talla, categoría), útil para normalizar catálogos y mejorar la búsqueda.
- OCR y digitalización de fichas de producto: extrae texto de imágenes de etiquetas, embalajes o documentos comerciales para poblar bases de datos de producto.
- Búsqueda y recuperación multimodal: genera representaciones o descripciones a partir de imágenes de producto para mejorar la recuperación en motores de búsqueda internos del marketplace.
- Asistencia al vendedor: un chatbot que responde preguntas sobre productos y políticas de la plataforma, con conversaciones multi-turno y contexto largo, desplegado en local mediante llama.cpp con servidor compatible con la API de OpenAI.
- Análisis de reseñas con imágenes: procesa reseñas de compradores que incluyen fotos para resumir quejas, detectar defectos recurrentes o clasificar sentimiento.
- Despliegue en entornos con hardware limitado: al estar cuantizado en Q4_K_M con proyector F16, puede ejecutarse en estaciones de trabajo o servidores modestos, evitando depender de infraestructura de GPU de gran escala.
- Evaluación de contenido general de visión-lenguaje: tareas de VQA, comprensión de documentos y gráficos, y razonamiento STEM en un único modelo de 4B.

## Benchmarks y rendimiento

La model card presenta comparativas mediante imágenes (no tablas de texto extraíbles) para 28 benchmarks de e-commerce y 64 benchmarks generales, en modos instruct y thinking, sobre una escala de 0 a 100. Los datos numéricos concretos no están disponibles en formato textual en la información proporcionada. Las afirmaciones agregadas que sí se indican son:

| Comparativa | Resultado |
|---|---|
| Media en benchmarks de e-commerce frente a Qwen3.5-4B | +6,47 puntos |
| Media en benchmarks generales frente a Qwen3.5-4B | +0,40 puntos |
| WeMM-Ecom-35B-A3B frente a modelos open source de cientos de miles de millones de parámetros | Superior (según la model card) |

No se han publicado resultados numéricos detallados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en la información disponible; los resultados completos están en las imágenes de la model card y en el informe técnico arXiv:2611.30662.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,4 GB; con pesos Q4_K_M y proyector F16, la inferencia completa requiere aproximadamente 3-4 GB de memoria, más el espacio para el contexto KV, que crece con la longitud de contexto utilizada.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, una RTX 4090 o GPUs de gama media con suficiente VRAM son suficientes. Para contextos muy largos (hasta 262.144 tokens) se necesita más memoria para la caché KV.
- Cabe en GPU de consumo: sí, por el tamaño de pesos (~3,4 GB en Q4_K_M); el límite práctico es la memoria para el contexto.
- Opciones de despliegue: llama.cpp (compilación con CUDA, CPU, Metal, Vulkan u otros backends), con `llama-cli` y `llama-server` (servidor compatible con la API de OpenAI). Se indica una revisión concreta de llama.cpp (`a8f8294c45076538f4509754e4c79fc51a1a486b`). Para CPU pura se indica `-ngl 0` y `--no-mmproj-offload`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-GGUF | 4B denso | 262.144 | +6,47 pts e-commerce y +0,40 pts general vs Qwen3.5-4B (media) | Apache 2.0 | GGUF, BF16, FP8, GPTQ |
| Qwen3.5-4B | 4B (referencia de la model card) | No disponible | Base de comparación | No disponible | No disponible |
| WeMM-Ecom-35B-A3B | 35B totales, A3B (MoE) | No disponible | Superior a modelos open source de cientos de miles de millones de parámetros (según la model card) | Apache 2.0 | GGUF |
| WeMM-Ecom-9B / 2B / 0.8B | 9B, 2B, 0.8B | No disponible | Variantes de la misma familia | Apache 2.0 | GGUF |

Las cifras detalladas de benchmarks de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al estar especializado en e-commerce de WeChat, puede heredar sesgos del dominio y de los datos de entrenamiento.
- Riesgo de alucinación: no se cuantifica en la model card; como todo modelo generativo, puede producir respuestas incorrectas, especialmente en conocimiento de producto y OCR.
- La cuantización Q4_K_M puede degradar ligeramente la calidad respecto al checkpoint BF16; los benchmarks reportados corresponden al BF16, no a la versión GGUF.
- El proyector multimodal se mantiene en F16, pero el modelo de lenguaje cuantizado puede afectar a tareas de razonamiento complejo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- Requiere una revisión concreta de llama.cpp para su funcionamiento correcto; otras versiones pueden no ser compatibles.
- Para imágenes de cámara, es necesario aplicar la orientación EXIF antes de pasarlas a llama.cpp.
- No se documentan capacidades de tool calling, agentes o audio; no deben asumirse en producción.
- El contexto máximo de 262.144 tokens exige memoria considerable para la caché KV; en hardware de consumo puede ser inviable a plena longitud.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-4B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Versión GPTQ: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- Familia GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia GGUF 2B: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Familia GGUF 9B: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Familia GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF/blob/main/LICENSE
