# tencent/WeMM-Ecom-35B-A3B-GPTQ

## Resumen

WeMM-Ecom-35B-A3B-GPTQ es la versión cuantizada del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico de WeChat. El modelo parte de una arquitectura MoE (mezcla de expertos) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un despliegue relativamente económico pese al tamaño nominal. Esta variante concreta aplica cuantización GPTQ W4A16 (pesos de 4 bits, activaciones de 16 bits) sobre el checkpoint original en BF16, reduciendo el peso del repositorio a unos 20,3 GB.

El modelo resuelve tareas de comprensión imagen-texto orientadas a e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de catálogo. Según la model card, supera a Qwen3.5-35B-A3B en 3,92 puntos, a Qwen3.6-35B-A3B en 3,36 puntos y a MiniCPM-V-4.7-35B-A3B en 8,22 puntos en la media de benchmarks de e-commerce, manteniendo además capacidades generales competitivas.

Su relevancia actual radica en tres factores: una ventana de contexto de 262.144 tokens, soporte de entradas de texto, imagen, multi-imagen y vídeo, y un modo de razonamiento híbrido (instruct y thinking). La licencia Apache 2.0 y la disponibilidad en formatos BF16, FP8, GPTQ y GGUF facilitan tanto la experimentación como el despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text), familia `qwen3_5_moe` |
| Parámetros totales | 35B (nominal); 5.954.701.156 según safetensors del checkpoint GPTQ |
| Parámetros activos | ~3B (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128, simétrica; también existen BF16, FP8 y GGUF en la familia |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors empaquetados en formato `compressed-tensors` (GPTQ); el modelo base en BF16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La familia se etiqueta internamente como `qwen3_5_moe`, lo que sugiere una base arquitectónica derivada de la familia Qwen 3.5, aunque la model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO). El modelo incorpora un codificador visual que, en esta variante GPTQ, conserva su precisión original junto con la cabeza de salida y determinadas proyecciones sensibles.

La cuantización aplicada es GPTQ con pesos de 4 bits y activaciones de 16 bits (W4A16), con cuantización simétrica y grupos de 128 valores. Los pesos se almacenan empaquetados en Safetensors bajo el formato `compressed-tensors`, y el checkpoint incluye su propia configuración de cuantización, de modo que el motor de servicio (vLLM con backend `compressed-tensors`) puede detectar el formato automáticamente al arrancar. No se han publicado en la información disponible detalles sobre innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de texto, imagen, multi-imagen y vídeo.
- Comprensión fina de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de catálogo.
- Modo de razonamiento híbrido: modo instruct (respuesta directa) y modo thinking (razonamiento extendido).
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Soporte de streaming en las peticiones servidas mediante API compatible con OpenAI.
- Capacidades multilingües limitadas a chino e inglés.
- No se menciona explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar productos prohibidos, contenido engañoso o infracciones de políticas, apoyándose en su entrenamiento específico en moderación de e-commerce.
- Extracción de atributos de producto: a partir de fotos de catálogo, el modelo identifica categoría, color, material, talla y otras características, facilitando la generación automática de fichas de producto.
- OCR y digitalización de etiquetas: lectura de etiquetas, embalajes y documentos de producto en chino e inglés para poblar bases de datos de inventario.
- Búsqueda visual y recuperación: generación de descripciones y embeddings semánticos de imágenes de producto para motores de búsqueda visual dentro de un marketplace.
- Asistencia al comprador: chatbot multi-turno que responde preguntas sobre productos comparando imágenes y descripciones, con contexto largo para conversaciones prolongadas.
- Análisis de reseñas con imágenes: interpretación conjunta de texto e imágenes enviadas por usuarios para clasificar quejas, detectar productos defectuosos o resumir opiniones.
- Grounding y conteo en escenas comerciales: localización de objetos en imágenes de tienda o estantería para tareas de inventario visual.

## Benchmarks y rendimiento

La model card reporta comparaciones agregadas, pero no incluye los valores numéricos de cada benchmark en el texto disponible (las tablas completas están en imágenes no accesibles). Los datos agregados publicados son:

| Comparación | Diferencia en media de benchmarks de e-commerce | Diferencia en media de benchmarks generales |
|---|---|---|
| vs. Qwen3.5-35B-A3B | +3,92 puntos | +0,17 puntos |
| vs. Qwen3.6-35B-A3B | +3,36 puntos | no disponible |
| vs. MiniCPM-V-4.7-35B-A3B | +8,22 puntos | +5,60 puntos |
| vs. Valley3-32B | no disponible | +9,13 puntos |

La evaluación de e-commerce cubre 28 benchmarks en ocho escenarios y la evaluación general cubre 64 benchmarks en ocho categorías, con puntuaciones en escala 0-100. Los resultados individuales por benchmark (MMLU, HumanEval, GSM8K u otros) no están disponibles en el texto proporcionado; las tablas completas se encuentran en las imágenes `assets/ecommerce-*-table.png` y `assets/general-*-table.png` de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GPTQ ocupa 20,3 GB, por lo que se requiere al menos ~24 GB de VRAM para cargar los pesos cuantizados, más memoria para el codificador visual, la caché KV y el contexto. Con contexto largo (262.144 tokens) el consumo de caché KV crece de forma significativa.
- GPU recomendadas: para producción con contexto largo, GPU de centro de datos como A100 (40/80 GB) o H100; para contexto moderado, una RTX 4090 (24 GB) puede ser insuficiente por el margen de caché KV, siendo más seguras tarjetas de 32 GB o superiores.
- Cabe en GPU de consumo: parcialmente; una RTX 4090 de 24 GB queda al límite y probablemente requiera reducir la longitud de contexto o usar variantes GGUF más agresivas.
- Opciones de despliegue: vLLM (>= 0.31.0) con backend `compressed-tensors` es la vía recomendada por el autor; la familia también ofrece GGUF, lo que habilita llama.cpp y Ollama para entornos con menos VRAM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-GPTQ | 35B totales / ~3B activos | 262.144 | Apache 2.0 | GPTQ W4A16, BF16, FP8, GGUF | Especializado en e-commerce; +3,92 pts vs. Qwen3.5-35B-A3B en e-commerce |
| Qwen3.5-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Referencia generalista; superado por WeMM-Ecom en e-commerce |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Referencia generalista; superado por WeMM-Ecom en e-commerce |
| MiniCPM-V-4.7-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Multimodal; superado por WeMM-Ecom en e-commerce y general |
| Valley3-32B | 32B | no disponible | no disponible | no disponible | Multimodal; superado por WeMM-Ecom en benchmarks generales |

Los datos de parámetros y contexto de los modelos comparados no se detallan en la información proporcionada más allá de lo indicado; los valores marcados como "no disponible" no deben interpretarse como ausencia de la característica.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan en la model card los sesgos conocidos del modelo; al estar entrenado sobre datos de e-commerce de WeChat, puede heredar sesgos culturales y comerciales del corpus chino.
- Alucinación: no se proporcionan métricas específicas de tasa de alucinación; en tareas de atributos de producto o moderación conviene validar las salidas con reglas de negocio.
- Contexto: aunque la ventana es de 262.144 tokens, el rendimiento efectivo en contextos muy largos no está cuantificado en la información disponible, y el coste de caché KV puede ser prohibitivo en GPU de consumo.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento subyacentes.
- Cuantización: la variante GPTQ W4A16 puede degradar ligeramente la precisión frente al checkpoint BF16; el autor conserva en alta precisión el codificador visual, la cabeza de salida y proyecciones sensibles, pero no se publican métricas de la pérdida de calidad inducida por la cuantización.
- Producción: requiere vLLM >= 0.31.0 con backend `compressed-tensors`; otros motores pueden no interpretar correctamente el formato empaquetado.
- Tool calling: no se documenta soporte explícito de function calling, lo que limita su uso en pipelines de agentes que dependan de esta capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Modelo base (BF16): https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Colección de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Informe técnico (referenciado en la model card): https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ/blob/main/LICENSE
- Documentación de instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
