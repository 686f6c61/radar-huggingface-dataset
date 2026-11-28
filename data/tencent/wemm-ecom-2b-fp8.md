# tencent/WeMM-Ecom-2B-FP8

## Resumen

WeMM-Ecom-2B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-2B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo resuelve la necesidad de interpretar y razonar sobre contenido visual y textual propio de catálogos de producto, moderación, OCR y recuperación de información, manteniendo además capacidades visuales y de lenguaje de propósito general.

Se trata de un modelo denso de 2B parámetros con una ventana de contexto de 262.144 tokens, construido sobre la arquitectura `qwen3_5` y distribuido en formato `safetensors` con pesos FP8 E4M3. Forma parte de una familia que abarca 0,8B, 2B, 4B, 9B y 35B-A3B, y esta variante FP8 busca reducir los requisitos de memoria para despliegue en producción sin renunciar a las capacidades del checkpoint BF16 original.

Su relevancia actual radica en que combina un contexto muy largo, entradas multimodales (texto, imagen, multi-imagen y vídeo) y un modo de razonamiento híbrido (instruct y thinking) en un tamaño compacto y con licencia Apache 2.0, lo que facilita su integración en pipelines de comercio electrónico y en aplicaciones de visión-lenguaje de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 por bloques (escala 128 × 128); el modelo base ofrece además BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2B parámetros con arquitectura `qwen3_5` y pipeline `image-text-to-text`, lo que implica un codificador visual acoplado a un modelo de lenguaje para procesar entradas de texto, imagen, multi-imagen y vídeo. La variante FP8 aplica cuantización de pesos E4M3 con una escala por cada bloque de 128 × 128 y cuantización dinámica de activaciones durante la inferencia; el codificador visual, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que el modelo se evalúa en 28 benchmarks de comercio electrónico repartidos en ocho escenarios y en 64 benchmarks de capacidades generales en ocho categorías, y que dispone de un modo de razonamiento híbrido (instruct y thinking). Para los detalles de entrenamiento y las innovaciones técnicas concretas, la información disponible remite al informe técnico arXiv:2611.30662.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen y texto.
- Comprensión de comercio electrónico: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Capacidades visuales generales: VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Entrada de vídeo además de texto, imagen y multi-imagen.
- Modo de razonamiento híbrido: modo instruct y modo thinking.
- Conversación multi-turno y streaming a través de una API compatible con OpenAI servida con vLLM.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.

## Casos de uso

- Enriquecimiento de fichas de producto: el modelo puede extraer atributos (color, talla, material, categoría) a partir de imágenes y descripciones, apoyándose en el contexto de 262.144 tokens para procesar lotes grandes de fichas en una sola pasada.
- Moderación de contenido en marketplaces: análisis de imágenes y texto de anuncios para detectar contenido no permitido, aprovechando los benchmarks de moderación incluidos en la suite de evaluación del modelo.
- OCR y digitalización de documentación comercial: extracción de texto de etiquetas, facturas y embalajes, con capacidad documentada de comprensión de documentos y gráficos.
- Búsqueda y recuperación multimodal: generación de representaciones y descripciones para indexar imágenes de catálogo y responder consultas de recuperación, un escenario cubierto explícitamente por la suite de evaluación del modelo.
- Asistencia conversacional al comprador: gestión de conversaciones multi-turno con contexto largo sobre productos, imágenes y vídeo, servida mediante una API compatible con OpenAI.
- Automatización de atención al cliente con vídeo e imágenes: el soporte de entrada de vídeo permite analizar demostraciones de producto o incidencias enviadas por el usuario.
- Procesamiento por lotes de contenido general: VQA, comprensión de gráficos y razonamiento STEM en un modelo de 2B desplegable con FP8 en GPU con soporte de esta precisión.

## Benchmarks y rendimiento

La model card presenta los resultados del checkpoint BF16 WeMM-Ecom-2B mediante gráficos e imágenes de tablas, sin cifras textuales extraíbles. Los datos cualitativos indicados son los siguientes:

| Comparativa | Diferencia media indicada |
|---|---|
| WeMM-Ecom-2B frente a Qwen3.5-2B (benchmarks de comercio electrónico) | +10,59 puntos |
| WeMM-Ecom-2B frente a LFM3-VL-2B (benchmarks de comercio electrónico) | +6,16 puntos |
| WeMM-Ecom-2B frente a Qwen3.5-2B (capacidades generales) | +4,45 puntos |
| WeMM-Ecom-2B frente a LFM3-VL-2B (capacidades generales) | +2,43 puntos |

Las puntuaciones se expresan en una escala de 0 a 100. No se han publicado en la información disponible resultados numéricos por benchmark individual (MMLU, HumanEval, GSM8K u otros); las tablas completas están en las imágenes de la model card y en el informe técnico.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,1 GB en FP8, por lo que se requiere al menos esa cantidad de memoria para los pesos, más overhead de activaciones, caché KV y codificador visual.
- GPU recomendadas: se requiere una GPU con soporte de FP8, como las de las familias Hopper (H100) o posteriores; la model card indica explícitamente el uso de una GPU compatible con FP8 y un motor de servicio con soporte de FP8 por bloques.
- GPU de consumo: no se confirma en la información disponible compatibilidad con GPUs de consumo; el requisito de FP8 condiciona la viabilidad en tarjetas domésticas.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según la guía de inicio rápido), con API compatible con OpenAI. Para otras precisiones, el modelo base ofrece formatos GPTQ y GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-FP8 | 2B (denso) | 262.144 tokens | Apache 2.0 | Safetensors FP8; base en BF16, GPTQ y GGUF | Especializado en comercio electrónico con modo thinking |
| Qwen3.5-2B | 2B | No disponible | No disponible | No disponible | Referencia de comparación en la model card; el modelo lo supera en 10,59 puntos (e-commerce) y 4,45 puntos (general) |
| LFM3-VL-2B | 2B | No disponible | No disponible | No disponible | Referencia de comparación en la model card; el modelo lo supera en 6,16 puntos (e-commerce) y 2,43 puntos (general) |

Los datos de contexto, licencia y formatos de los modelos comparables no se detallan en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de chino e inglés; el rendimiento en castellano u otras lenguas no está garantizado.
- Riesgo de alucinación: no se documenta en la información disponible ninguna evaluación específica de tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Despliegue: la variante FP8 exige GPU compatible con FP8 y un motor con soporte de cuantización FP8 por bloques (vLLM >= 0.31.0); el checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar los términos exactos.
- Especialización: parte de la evaluación está orientada al ecosistema de comercio electrónico de WeChat, por lo que su ventaja frente a modelos generales puede no trasladarse a otros dominios.
- Contexto: aunque la ventana es de 262.144 tokens, no se proporcionan datos de rendimiento en contextos largos ni de degradación con la longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Colección de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Familia: 0.8B (https://huggingface.co/tencent/WeMM-Ecom-0.8B), 4B (https://huggingface.co/tencent/WeMM-Ecom-4B), 9B (https://huggingface.co/tencent/WeMM-Ecom-9B), 35B-A3B (https://huggingface.co/tencent/WeMM-Ecom-35B-A3B)
- Informe técnico: https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentación de instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8/blob/main/LICENSE
