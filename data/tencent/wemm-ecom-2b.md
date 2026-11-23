# tencent/WeMM-Ecom-2B

## Resumen

WeMM-Ecom-2B es un modelo multimodal denso de 2.213 millones de parámetros desarrollado por WeChat Vision (Tencent), especializado en comprensión de contenido para comercio electrónico dentro del ecosistema de WeChat. Forma parte de la familia WeMM-Ecom, que cubre los tamaños 0.8B, 2B, 4B, 9B y 35B-A3B, y está construido como un fine-tuning del modelo base Qwen/Qwen3.5-2B.

El modelo aborda la comprensión fina de producto: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre imágenes y conocimiento de catálogo, además de mantener capacidades visuales y de lenguaje de propósito general. Soporta entradas de texto, imagen, múltiples imágenes y vídeo, y dispone de un modo híbrido de razonamiento (thinking e instruct).

Su relevancia actual radica en que ofrece, con solo 2B de parámetros, un rendimiento en tareas de e-commerce superior al de su base Qwen3.5-2B (10,59 puntos de media según el autor) y a LFM3-VL-2B (6,16 puntos), con una ventana de contexto de 262.144 tokens y licencia Apache 2.0, lo que facilita su despliegue en entornos de producción con requisitos moderados de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-2B) |
| Parámetros totales | 2.213.241.664 (2,21B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint BF16); variantes FP8, GPTQ y GGUF publicadas aparte |

## Arquitectura y entrenamiento

WeMM-Ecom-2B es un modelo denso de 2B parámetros construido sobre Qwen3.5-2B, al que se le añaden capacidades de comprensión visual y se especializa mediante fine-tuning en dominios de comercio electrónico. El modelo acepta entradas multimodales (texto, imagen, multi-imagen y vídeo) y expone un pipeline `image-text-to-text` a través de `transformers` (requiere `transformers>=5.2.0` y `AutoModelForImageTextToText`).

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documenta que el entrenamiento cubre 28 benchmarks de e-commerce agrupados en ocho escenarios (atributos de producto, moderación, OCR, retrieval, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorías. La innovación destacable es el soporte de modo híbrido de razonamiento (thinking e instruct) dentro de un modelo de este tamaño, junto con la ventana de contexto de 262.144 tokens.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo.
- Comprensión fina de producto: atributos, categorías, variantes y especificaciones.
- OCR y extracción de texto en imágenes de producto, etiquetas y documentos.
- Moderación de contenido visual y textual para catálogos y listings.
- Retrieval y grounding visual: localización de objetos y correspondencia imagen-texto.
- Razonamiento multi-paso en modo thinking y respuestas directas en modo instruct.
- Comprensión de documentos y gráficos, razonamiento STEM y tareas espaciales.
- Comprensión multi-imagen e instrucciones complejas.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Enriquecimiento automático de fichas de producto: el modelo extrae atributos, materiales, tallas y variantes a partir de imágenes y texto del listing, aprovechando su especialización en atributos de producto y su ventana de 262.144 tokens para procesar descripciones largas.
- Moderación de catálogo en marketplaces: clasificación de imágenes y textos de vendedores para detectar contenido prohibido o engañoso, usando los benchmarks de moderación sobre los que fue entrenado.
- OCR de etiquetas y documentación: extracción de texto de etiquetas, certificados y facturas en imágenes de alta resolución, con soporte de multi-imagen para comparar varias capturas del mismo producto.
- Búsqueda visual y retrieval: generación de representaciones y correspondencias imagen-texto para motores de búsqueda por similitud dentro de un catálogo, apoyándose en las capacidades de grounding y retrieval.
- Asistente de atención al cliente en comercio: conversaciones multi-turno sobre productos con contexto largo, combinando texto e imágenes enviadas por el usuario para resolver dudas sobre compatibilidad o estado del pedido.
- Análisis de reseñas con imágenes: interpretación conjunta de texto de reseña y fotos adjuntas para detectar problemas de calidad o discrepancias con la descripción del producto.
- Verificación de anuncios y creatividades: comprobación de que la imagen promocional coincide con el producto y el texto del anuncio, usando razonamiento multimodal en modo thinking.

## Benchmarks y rendimiento

La model card reporta comparativas agregadas, pero los resultados detallados están publicados como imágenes (tablas en PNG) y no como cifras textuales en la información disponible. Los datos agregados que sí se explicitan son:

| Comparación | Diferencia media (escala 0-100) |
|---|---|
| WeMM-Ecom-2B vs. Qwen3.5-2B (e-commerce) | +10,59 puntos |
| WeMM-Ecom-2B vs. LFM3-VL-2B (e-commerce) | +6,16 puntos |
| WeMM-Ecom-2B vs. Qwen3.5-2B (general) | +4,45 puntos |
| WeMM-Ecom-2B vs. LFM3-VL-2B (general) | +2,43 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen cifras individuales.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 4,4 GB solo para pesos (tamaño del repo), más overhead de activaciones y del codificador visual; se recomienda un mínimo de 8-12 GB para inferencia cómoda.
- VRAM estimada en FP8: aproximadamente 2,2-2,5 GB de pesos, apta para GPUs de 6-8 GB.
- VRAM estimada en GGUF (cuantización 4-bit): del orden de 1,3-1,6 GB de pesos, desplegable en GPUs de consumo de gama media.
- GPU recomendadas: A100/H100 para servir en BF16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para BF16/FP8 en un solo dispositivo; GPUs de 8 GB o menos para GGUF cuantizado.
- Cabe en GPU de consumo: sí, especialmente en formatos FP8, GPTQ y GGUF.
- Opciones de despliegue: `transformers` (con `AutoModelForImageTextToText`), endpoints compatibles con la API de OpenAI según la model card, y variantes GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-2B | 2,21B (denso) | 262.144 | E-commerce multimodal | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | 2B (denso) | no disponible | Multimodal general | no disponible | Hugging Face |
| LFM3-VL-2B | 2B (denso) | no disponible | Visión-lenguaje general | no disponible | no disponible |

Según los datos del autor, WeMM-Ecom-2B supera a Qwen3.5-2B y a LFM3-VL-2B tanto en la media de e-commerce como en la media general, lo que lo sitúa como opción preferente frente a su base cuando el caso de uso incluye productos o catálogos. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Dominio: el fine-tuning está orientado a e-commerce; en tareas generales mantiene capacidades, pero con un margen de mejora menor frente a modelos generalistas del mismo tamaño.
- Alucinación: como todo modelo generativo, puede inventar atributos de producto o descripciones no presentes en la imagen; conviene validar salidas en flujos críticos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los datos de e-commerce de WeChat pueden introducir sesgos de catálogo o de mercado.
- Contexto: aunque soporta 262.144 tokens, el coste de memoria y latencia crece con la longitud; el rendimiento real en contextos extremos no está cuantificado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones de los checkpoints cuantizados publicados por separado.
- Producción: la model card recomienda ajustar los parámetros de muestreo según el modo (thinking/instruct) y la tarea; no se documentan tasas de error ni latencias medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Modelo 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Modelo 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Modelo 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Modelo 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B/blob/main/LICENSE
- Sitio de Tencent: https://www.tencent.com/
