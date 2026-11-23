# tencent/WeMM-Ecom-2B-GGUF

## Resumen

WeMM-Ecom-2B-GGUF es la edición cuantizada en formato GGUF de WeMM-Ecom-2B, un modelo multimodal (image-text-to-text) desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo parte de una arquitectura densa de aproximadamente 1.880 millones de parámetros y está empaquetado para su despliegue con llama.cpp: los pesos del modelo de lenguaje se ofrecen en cuantización Q4_K_M y el proyector multimodal en F16.

La propuesta del modelo es doble. Por un lado, cubre tareas específicas de e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto) y, según la model card, supera a Qwen3.5-2B en 10,59 puntos y a LFM3-VL-2B en 6,16 puntos en la media de sus benchmarks de e-commerce. Por otro, mantiene capacidades generales de visión-lenguaje, con una ventaja de 4,45 puntos sobre Qwen3.5-2B y 2,43 puntos sobre LFM3-VL-2B en la media de benchmarks generales.

El aspecto más relevante para desarrolladores es su ventana de contexto declarada de 262.144 tokens combinada con un tamaño reducido y una licencia Apache 2.0, lo que permite desplegarlo en hardware modesto mediante llama.cpp (CLI o servidor compatible con la API de OpenAI) y procesar conversaciones o documentos de producto muy extensos sin recurrir a infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa multimodal (image-text-to-text); familia Qwen3.5 según tags |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos del LM en Q4_K_M; proyector multimodal en F16 (GGUF). Existen además BF16, FP8 y GPTQ en el modelo base |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base ofrece safetensors en BF16 |

## Arquitectura y entrenamiento

WeMM-Ecom-2B es un modelo denso de 2B parámetros con arquitectura transformer multimodal: un modelo de lenguaje (etiquetado como qwen3_5 en los tags del repositorio) acoplado a un proyector multimodal que inyecta las representaciones visuales en el espacio del LM. La edición GGUF conserva el proyector en F16 para preservar la calidad de la alineación visión-lenguaje mientras comprime el LM a Q4_K_M. El modelo soporta modo híbrido de razonamiento (instruct y thinking), lo que implica que fue entrenado con fases de post-entrenamiento orientadas a instrucciones y a razonamiento explícito.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; esa información se remite al informe técnico (Technical Report) enlazado desde la propia ficha. La evaluación publicada cubre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías (VQA general, documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, multi-imagen, seguimiento de instrucciones y tareas centradas en texto).

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo (pipeline image-text-to-text).
- Comprensión de producto: extracción de atributos, moderación de contenido, OCR, recuperación y grounding sobre catálogos.
- Razonamiento de e-commerce: preguntas sobre productos, comparativas y conocimiento de dominio.
- Modo híbrido de razonamiento: respuestas directas (instruct) o con cadena de pensamiento (thinking).
- Comprensión de documentos, gráficos y tablas, además de razonamiento STEM y espacial.
- Comprensión multi-imagen y tareas de conteo y localización (grounding).
- Seguimiento de instrucciones y tareas centradas en texto.
- Idiomas: chino e inglés.
- Despliegue con llama.cpp: inferencia por línea de comandos (llama-cli) y servidor local compatible con la API de OpenAI (llama-server).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Fichas de producto automatizadas: el modelo puede recibir imágenes de producto y generar o completar atributos (color, material, talla, categoría) aprovechando sus benchmarks específicos de atributos de producto y su contexto de 262.144 tokens para procesar lotes de imágenes y descripciones en una misma sesión.
- Moderación de contenido en marketplace: clasificación de imágenes y texto de anuncios para detectar contenido no permitido, apoyándose en el escenario de moderación incluido en su suite de evaluación.
- Extracción OCR en logística y catálogo: lectura de etiquetas, albaranes y embalajes en chino e inglés, con salida estructurada para integrarla en un ERP o pipeline de datos.
- Asistente de atención al cliente en comercio electrónico: conversaciones multi-turno sobre pedidos y productos con soporte de imágenes del cliente, desplegado como servidor compatible con OpenAI mediante llama-server.
- Búsqueda visual y grounding: localización de elementos dentro de imágenes de producto (por ejemplo, defectos o accesorios) para sistemas de control de calidad o devoluciones.
- Enriquecimiento de catálogos a gran escala: ejecución en local sobre GPU de consumo con cuantización Q4_K_M para procesar imágenes por lotes sin costes de API externa, gracias a la licencia Apache 2.0.
- Asistente de compras en el móvil o en el borde: al ocupar el modelo completo unos 2 GB en el repositorio, es viable integrarlo en entornos con recursos limitados para recomendación y comparación de productos.

## Benchmarks y rendimiento

La model card publica comparativas agregadas (escala 0-100) frente a Qwen3.5-2B y LFM3-VL-2B, pero los resultados detallados están en imágenes y tablas no incluidas en la información disponible. Los datos agregados son:

| Benchmark (media agregada) | WeMM-Ecom-2B | Qwen3.5-2B | LFM3-VL-2B |
|---|---|---|---|
| E-commerce (28 benchmarks, 8 escenarios) | referencia | -10,59 puntos | -6,16 puntos |
| Generales (64 benchmarks, 8 categorías) | referencia | -4,45 puntos | -2,43 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen cifras individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 2,0 GB (LM Q4_K_M + proyector F16), por lo que la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM, reservando margen para el contexto KV cache.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos ~4 GB de VRAM; para contextos largos cerca de los 262.144 tokens, la caché KV crece de forma significativa y conviene una GPU con 24 GB o más (RTX 3090/4090, A100, H100).
- GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores; también es posible la ejecución en CPU con `-ngl 0` y `--no-mmproj-offload`.
- Opciones de despliegue: llama.cpp (revisión probada `a8f8294c45076538f4509754e4c79fc51a1a486b`), con `llama-cli` para línea de comandos y `llama-server` para servidor compatible con OpenAI. Backends soportados: CUDA, CPU, Metal y Vulkan según la guía oficial de compilación.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-GGUF | ~1,88B (denso) | 262.144 | Apache 2.0 | Sí (Q4_K_M + proyector F16) | Especializado en e-commerce; ventaja declarada sobre Qwen3.5-2B y LFM3-VL-2B |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | Referencia de comparación en la model card; pierde 10,59 puntos en e-commerce y 4,45 en general |
| LFM3-VL-2B | ~2B | no disponible | no disponible | no disponible | Referencia de comparación; pierde 6,16 puntos en e-commerce y 2,43 en general |
| WeMM-Ecom-0.8B / 4B / 9B / 35B-A3B | 0,8B-35B (35B-A3B MoE) | no disponible | Apache 2.0 | Sí | Misma familia, distintos tamaños para ajustar coste y calidad |

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Sesgos: no se documentan en la información disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede heredar sesgos de ese dominio y de sus políticas de moderación.
- Alucinación: como todo modelo generativo multimodal, puede inventar atributos de producto o leer incorrectamente texto en imágenes; conviene validar salidas estructuradas en producción.
- Contexto: aunque declara 262.144 tokens, el coste de memoria de la caché KV a esa longitud es elevado y puede degradar la calidad en extremos muy alejados del prompt.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base y de los datos de entrenamiento en el informe técnico.
- Despliegue: requiere una revisión concreta de llama.cpp; otras versiones pueden no ser compatibles con el proyector multimodal incluido.
- Datos de benchmarks: los resultados detallados solo están disponibles como imágenes en la model card; no se han podido verificar cifras individuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Modelo base (BF16): https://huggingface.co/tencent/WeMM-Ecom-2B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Versión GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Familia GGUF 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia GGUF 4B: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia GGUF 9B: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Familia GGUF 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF/blob/main/LICENSE
