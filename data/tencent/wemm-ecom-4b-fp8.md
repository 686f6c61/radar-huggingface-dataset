# tencent/WeMM-Ecom-4B-FP8

## Resumen

WeMM-Ecom-4B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-4B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico. Se trata de un modelo denso de 4B parámetros construido sobre la familia Qwen3.5, con una ventana de contexto de 262.144 tokens, capaz de procesar entradas de texto, imagen, múltiples imágenes y vídeo. Su propósito es cubrir tareas específicas del dominio e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto) sin sacrificar capacidades generales de visión-lenguaje.

La relevancia de esta variante FP8 reside en la eficiencia de despliegue: reduce el peso del repositorio a 5,5 GB manteniendo un formato compatible con motores de servicio modernos como vLLM, que detecta automáticamente la configuración de cuantización incluida en el checkpoint. El modelo incorpora un modo híbrido de razonamiento (thinking) que puede activarse o desactivarse según la tarea, lo que permite equilibrar latencia y calidad en producción.

La familia WeMM-Ecom se publica bajo licencia Apache 2.0 con soporte para chino e inglés, y ofrece múltiples formatos (BF16, FP8, GPTQ y GGUF) además de varios tamaños (0.8B, 2B, 4B, 9B y 35B-A3B). Esta ficha se centra en la variante de 4B en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5) con encoder de visión, modo híbrido thinking/instruct |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 por bloques (escala por bloque de 128 × 128), cuantización dinámica de activaciones en inferencia; el modelo base dispone además de BF16, GPTQ y GGUF |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros derivado de la arquitectura Qwen3.5, adaptado al dominio del comercio electrónico mediante entrenamiento multimodal que combina un encoder de visión con el decodificador de lenguaje. Acepta entradas de texto, imagen única, múltiples imágenes y vídeo, y soporta conversaciones multi-turno y streaming. La variante FP8 aplica cuantización por bloques de 128 × 128 sobre los pesos con formato E4M3 y cuantización dinámica de las activaciones durante la inferencia; el encoder de visión, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original para preservar la calidad.

El entrenamiento se orienta a ocho escenarios de e-commerce evaluados sobre 28 benchmarks (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y a ocho categorías generales evaluadas sobre 64 benchmarks (VQA general, documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto). La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni confirma el uso de RLHF o DPO. La innovación destacable es el modo híbrido de razonamiento (thinking mode) combinado con la cuantización FP8 por bloques compatible con vLLM.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, múltiples imágenes y vídeo.
- Comprensión específica de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Modo híbrido de razonamiento: modo instruct y modo thinking seleccionables según la tarea.
- Comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo.
- Comprensión multi-imagen y seguimiento de instrucciones.
- Conversaciones multi-turno con ventana de contexto de 262.144 tokens.
- Generación en streaming mediante API compatible con OpenAI.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos de producto a partir de imágenes y texto descriptivo, aprovechando sus benchmarks específicos de atributos de producto y su contexto de 262.144 tokens para procesar fichas completas con varias imágenes.
- Moderación de contenido en marketplaces: análisis conjunto de imagen y texto para detectar listados que incumplen políticas, apoyándose en las capacidades de moderación evaluadas en el dominio e-commerce.
- OCR y digitalización de documentación comercial: extracción de texto de etiquetas, facturas y embalajes, con soporte de documentos y gráficos y contexto largo para lotes de imágenes.
- Búsqueda y recuperación multimodal: generación de representaciones y descripciones enriquecidas para motores de búsqueda de producto, usando grounding y recuperación sobre imágenes y texto.
- Asistencia conversacional al comprador: atención multi-turno en chino o inglés con contexto largo, incluyendo imágenes del producto enviadas por el usuario y respuestas en streaming.
- Análisis de vídeo promocional: comprensión de vídeo para verificar contenido, extraer información de producto o generar descripciones, gracias a la entrada de vídeo soportada.
- Despliegue en infraestructura con GPU FP8: servicio mediante vLLM en GPUs con soporte FP8, reduciendo el peso a 5,5 GB y manteniendo la precisión del encoder de visión.

## Benchmarks y rendimiento

La model card indica que WeMM-Ecom-4B supera a Qwen3.5-4B en 6,47 puntos de media en benchmarks de e-commerce y en 0,40 puntos de media en benchmarks generales. Los resultados completos se presentan como imágenes en la model card (28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, escala 0–100), por lo que los valores numéricos desglosados no están disponibles en formato textual.

| Comparación | Diferencia media reportada |
|---|---|
| WeMM-Ecom-4B vs. Qwen3.5-4B (e-commerce) | +6,47 puntos |
| WeMM-Ecom-4B vs. Qwen3.5-4B (general) | +0,40 puntos |

No se han publicado resultados numéricos desglosados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 5,5 GB en disco; en inferencia se requiere VRAM adicional para activaciones, caché KV y el encoder de visión. Con contexto de 32.768 tokens (ejemplo de la model card) la huella es moderada, pero con los 262.144 tokens completos la caché KV crece de forma significativa.
- GPU recomendadas: se requiere una GPU con soporte de FP8 (por ejemplo, H100, H200, L40S o A100 con kernels compatibles) y un motor de servicio con soporte de FP8 por bloques.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información proporcionada; para esos entornos la familia ofrece variantes GPTQ y GGUF del modelo base.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según el ejemplo de instalación) con API compatible con OpenAI; el checkpoint incluye la configuración de cuantización que vLLM detecta automáticamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-FP8 | 4,54B denso | 262.144 | Multimodal e-commerce, thinking híbrido | Apache 2.0 | safetensors FP8 (base: BF16, GPTQ, GGUF) |
| WeMM-Ecom-4B | 4,54B denso | 262.144 | Multimodal e-commerce, thinking híbrido | Apache 2.0 | BF16, FP8, GPTQ, GGUF |
| Qwen3.5-4B | 4B (aproximado) | no disponible | Multimodal general | no disponible | no disponible |
| WeMM-Ecom-9B | 9B (aproximado) | no disponible | Multimodal e-commerce | Apache 2.0 | BF16, FP8, GPTQ, GGUF |
| WeMM-Ecom-35B-A3B | 35B totales, 3B activos (MoE) | no disponible | Multimodal e-commerce | Apache 2.0 | BF16, FP8, GPTQ, GGUF |

La model card afirma que WeMM-Ecom-35B-A3B supera a modelos open source de cientos de miles de millones de parámetros, pero no se proporcionan cifras desglosadas para verificar la comparación.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos multimodales, especialmente en descripciones de producto o extracción de atributos no presentes en la imagen.
- Los benchmarks completos se publican como imágenes en la model card, lo que dificulta la verificación numérica independiente.
- La cuantización FP8 puede introducir degradación de precisión respecto al checkpoint BF16, aunque se preservan en precisión original el encoder de visión, la cabeza de salida y proyecciones sensibles.
- Requiere GPU con soporte FP8 y un motor de servicio con soporte de FP8 por bloques; no es un checkpoint universal para cualquier entorno.
- El contexto de 262.144 tokens implica un consumo elevado de memoria en caché KV si se utiliza completo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones.
- No se documentan en la información disponible sesgos específicos, datos de entrenamiento ni procesos de alineación (RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Familia: https://huggingface.co/tencent/WeMM-Ecom-0.8B · https://huggingface.co/tencent/WeMM-Ecom-2B · https://huggingface.co/tencent/WeMM-Ecom-9B · https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8/blob/main/LICENSE
