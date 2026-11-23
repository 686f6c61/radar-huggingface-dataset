# tencent/WeMM-Ecom-2B-FP8

## Resumen
WeMM-Ecom-2B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-2B, desarrollado por WeChat Vision (Tencent). Se trata de un modelo denso de 2B parámetros orientado a la comprensión de contenido multimodal en el ámbito del comercio electrónico, con soporte para entradas de texto, imagen, multiimagen y vídeo. Forma parte de una familia que abarca desde 0.8B hasta 35B-A3B y que, según el autor, logra un rendimiento destacado en tareas de e-commerce manteniendo capacidades generales comparables a modelos del mismo tamaño.

El modelo está construido sobre la arquitectura Qwen3.5 (según las etiquetas del repositorio) y emplea un modo híbrido de razonamiento («thinking» e «instruct»). Su ventana de contexto alcanza los 262.144 tokens, lo que lo hace adecuado para conversaciones multi-turno largas y documentos extensos. La versión FP8 reduce el peso del repositorio a 3,1 GB, facilitando el despliegue en GPUs con soporte de FP8 y en motores de servicio como vLLM.

La relevancia de esta ficha radica en que combina cuantización de grano fino (escalas por bloque de 128×128), licencia Apache 2.0 y compatibilidad con endpoints, lo que lo convierte en una opción atractiva para producción en entornos de comercio electrónico donde el coste de inferencia y la latencia son críticos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque 128×128; también disponible BF16, GPTQ y GGUF en la familia |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento
WeMM-Ecom-2B-FP8 es un modelo denso de 2B parámetros con arquitectura transformer multimodal, construido sobre la base Qwen3.5. El modelo original (WeMM-Ecom-2B) se entrena para comprender contenido de comercio electrónico, incluyendo atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, aunque menciona que se evalúa en 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías.

La innovación técnica principal de esta versión es la cuantización FP8 por bloques: los pesos se almacenan en FP8 E4M3 con una escala por cada bloque de 128×128, mientras que las activaciones se cuantizan dinámicamente en FP8 durante la inferencia. El codificador visual, la cabeza de salida y algunas proyecciones sensibles conservan su precisión original. El checkpoint incluye la configuración de cuantización, que vLLM detecta automáticamente. No se especifica si hubo RLHF o DPO en el entrenamiento.

## Capacidades
- Generación de texto y razonamiento multimodal (texto, imagen, multiimagen y vídeo).
- Comprensión de contenido de comercio electrónico: atributos de producto, moderación, OCR, recuperación, grounding y conocimiento de producto.
- Modo híbrido de razonamiento: «instruct» y «thinking».
- Soporte de conversaciones multi-turno con contexto largo (262.144 tokens).
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multiimagen, seguimiento de instrucciones y tareas centradas en texto.
- Soporte multilingüe limitado a chino e inglés.
- Compatibilidad con endpoints (endpoints_compatible) y despliegue en vLLM con API compatible con OpenAI.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso
- Moderación de contenido en marketplaces: el modelo puede analizar imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, gracias a sus capacidades de OCR y comprensión de atributos de producto.
- Extracción de atributos de producto: a partir de imágenes y descripciones, el modelo puede generar fichas estructuradas con tallas, colores, materiales y categorías, facilitando la catalogación automática.
- Atención al cliente automatizada: con una ventana de 262.144 tokens, puede gestionar conversaciones multi-turno con historial extenso e incluir imágenes del producto para resolver dudas.
- Búsqueda visual y recuperación: el modelo puede generar representaciones o descripciones para búsqueda por imagen en catálogos de e-commerce, apoyando sistemas de recomendación.
- Análisis de reseñas con imágenes: procesar reseñas que incluyen fotos para extraer opiniones sobre calidad, ajuste o defectos, y agregar sentimiento a escala.
- Verificación de anuncios: comprobar que la imagen del producto coincide con la descripción textual y detectar discrepancias o fraudes.
- Asistencia en la creación de contenido: generar descripciones de producto y respuestas a preguntas frecuentes a partir de imágenes y especificaciones técnicas.

## Benchmarks y rendimiento
La model card indica que WeMM-Ecom-2B supera a Qwen3.5-2B en 10,59 puntos y a LFM3-VL-2B en 6,16 puntos en la media de benchmarks de e-commerce, y en 4,45 y 2,43 puntos respectivamente en capacidades generales. Sin embargo, no se proporcionan los valores numéricos concretos de cada benchmark en el texto disponible, solo referencias a imágenes y tablas. Por tanto, no se presentan cifras detalladas.

No se han publicado resultados numéricos desglosados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 2B en FP8, los pesos ocupan aproximadamente 2,2 GB; con overhead de activaciones y caché KV, se estima un consumo de 4-6 GB para contextos moderados.
- GPU recomendadas: GPUs con soporte de FP8, como NVIDIA H100, A100 (con FP8 mediante transformers o vLLM), L40S o RTX 4090 (Ada Lovelace soporta FP8).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/4070 Ti con cuantización FP8 o GGUF.
- Opciones de despliegue: vLLM (recomendado, con soporte de FP8 por bloques), llama.cpp/Ollama (para GGUF), TGI (si soporta FP8), y transformers con aceleración FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-FP8 | 2B denso | 262.144 | Apache 2.0 | safetensors FP8 | Multimodal e-commerce, chino/inglés |
| Qwen3.5-2B | 2B denso | no disponible | no disponible | no disponible | Referencia en benchmarks; superado por WeMM-Ecom-2B |
| LFM3-VL-2B | 2B denso | no disponible | no disponible | no disponible | Modelo visual-language; superado por WeMM-Ecom-2B |

No se dispone de más datos sobre los modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan en la model card; al estar entrenado principalmente con datos de comercio electrónico en chino e inglés, puede presentar sesgos culturales y de dominio.
- Riesgo de alucinación: como todo modelo generativo, puede inventar atributos de producto o descripciones inexistentes, especialmente en imágenes ambiguas.
- Limitaciones de contexto o idioma: solo soporta chino e inglés; no se garantiza un rendimiento equivalente en otros idiomas. La ventana de 262.144 tokens es amplia, pero el rendimiento puede degradarse en los extremos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio para condiciones adicionales.
- Caveats para producción: requiere GPU con soporte FP8 y un motor de servicio compatible con cuantización por bloques (vLLM >= 0.31.0). La precisión de la cuantización FP8 puede afectar ligeramente a tareas sensibles; se recomienda validar con el checkpoint BF16 si es crítico.

## Enlaces
- Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Modelo base (BF16): https://huggingface.co/tencent/WeMM-Ecom-2B
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Technical Report (enlace en model card): https://huggingface.co/tencent/WeMM-Ecom-2B-FP8 (referencia al informe técnico)
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8/blob/main/LICENSE
- Formatos alternativos: 
  - GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
  - GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Documentación vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
