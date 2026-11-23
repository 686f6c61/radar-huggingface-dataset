# tencent/WeMM-Ecom-9B-FP8

## Resumen

WeMM-Ecom-9B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-9B, desarrollado por WeChat Vision (Tencent). Se trata de un modelo denso de 9B parámetros especializado en comprensión de contenido multimodálico para comercio electrónico, con capacidades generales de visión-lenguaje y un modo de razonamiento híbrido (thinking/instruct). Forma parte de una familia que abarca 0.8B, 2B, 4B, 9B y 35B-A3B.

El modelo resuelve la necesidad de comprender productos, imágenes, texto y vídeo en entornos de e-commerce (atributos de producto, moderación, OCR, retrieval, grounding, razonamiento visual) manteniendo a la vez un rendimiento generalista comparable a modelos del mismo tamaño. Según la model card, supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de e-commerce, y a Qwen3.5-9B en 0,83 puntos y a Valley3-8B en 13,02 puntos en la media de benchmarks generales.

Esta variante FP8 mantiene la ventana de contexto de 262.144 tokens del checkpoint base y emplea cuantización FP8 E4M3 con escalas por bloque de 128×128, lo que reduce el peso del repositorio a 11,9 GB y facilita el despliegue en GPUs con soporte FP8. La licencia es Apache 2.0 y los idiomas declarados son chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5) con encoder de visión |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 E4M3 (block-wise, escala por bloque 128×128); el modelo base ofrece además BF16, GPTQ y GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros construido sobre la base Qwen3.5, con un encoder de visión que permite entradas de texto, imagen, multi-imagen y vídeo. La model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. Sí se indica que el modelo soporta un modo de razonamiento híbrido (thinking mode) además del modo instruct convencional.

La innovación técnica destacable de esta variante es la cuantización FP8: los pesos se almacenan en FP8 E4M3 con una escala por cada bloque de 128×128, las activaciones se cuantizan dinámicamente en FP8 durante la inferencia, y el encoder de visión, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original. El checkpoint incluye sus ajustes de cuantización, que vLLM detecta automáticamente. Según la model card, el modelo base se evalúa sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías.

## Capacidades

- Comprensión de e-commerce: atributos de producto, moderación de contenido, OCR, retrieval, grounding, razonamiento y conocimiento de producto.
- Capacidades generales de visión-lenguaje: VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo.
- Comprensión multi-imagen e instrucciones con múltiples imágenes.
- Entrada de vídeo además de texto e imagen.
- Modo de razonamiento híbrido: instruct mode y thinking mode.
- Conversación multi-turno con streaming.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el thinking mode habilita razonamiento, pero no se documenta integración de agentes).

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos de producto a partir de imágenes y texto (color, material, categoría, medidas), aprovechando sus benchmarks específicos de atributos de producto y OCR.
- Moderación de contenido en marketplace: análisis de imágenes y publicaciones para detectar contenido no permitido, apoyándose en el escenario de moderación evaluado en la suite de e-commerce.
- Búsqueda visual y retrieval: generación de representaciones y descripciones de productos para motores de búsqueda visual, con grounding sobre las imágenes de entrada.
- Atención al cliente multimodal: gestión de conversaciones multi-turno en chino o inglés donde el usuario adjunta fotos de productos, gracias a la ventana de 262.144 tokens que permite mantener historiales largos.
- Verificación de fichas de producto: comparación entre la imagen del producto y la descripción textual para detectar discrepancias, usando el razonamiento visual en thinking mode.
- Análisis de vídeo de producto: extracción de información a partir de vídeos demostrativos o de unboxing, ya que el modelo acepta entradas de vídeo.
- Procesamiento de documentos comerciales: lectura de facturas, etiquetas y documentos con gráficos gracias a las capacidades de document y chart understanding.

## Benchmarks y rendimiento

La model card proporciona comparaciones agregadas, pero los resultados detallados están en imágenes (tablas PNG) no incluidas en el texto extraído. Los datos numéricos concretos por benchmark (MMLU, HumanEval, GSM8K, etc.) no están disponibles en la información proporcionada.

| Comparación | Diferencia en media de benchmarks de e-commerce | Diferencia en media de benchmarks generales |
|---|---|---|
| WeMM-Ecom-9B vs Qwen3.5-9B | +5,19 puntos | +0,83 puntos |
| WeMM-Ecom-9B vs Valley3-8B | +10,28 puntos | +13,02 puntos |

Las evaluaciones cubren 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorías), en escala 0–100. Los resultados por benchmark individual no están disponibles en formato textual.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 11,9 GB, por lo que se requiere aproximadamente 12–14 GB de VRAM solo para pesos, más overhead de KV cache y activaciones; con contexto largo la demanda crece de forma significativa.
- GPU recomendadas: se requiere una GPU con soporte FP8 (generación Hopper o superior, como H100; también Ada Lovelace con soporte FP8). La model card indica explícitamente el uso de una GPU compatible con FP8 y un motor de serving con soporte de FP8 block-wise.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información proporcionada; el requisito de soporte FP8 limita las opciones.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según la guía de inicio rápido), con API compatible con OpenAI. El modelo base dispone además de formatos GPTQ y GGUF, lo que abre la puerta a llama.cpp/Ollama para esas variantes, pero no para este checkpoint FP8.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento relativo | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-FP8 | 9,4B (denso) | 262.144 | Referencia de la familia | Apache 2.0 | safetensors FP8 |
| Qwen3.5-9B | 9B (denso) | no disponible | −5,19 pts en e-commerce y −0,83 pts en general frente a WeMM-Ecom-9B | no disponible | no disponible |
| Valley3-8B | 8B (denso) | no disponible | −10,28 pts en e-commerce y −13,02 pts en general frente a WeMM-Ecom-9B | no disponible | no disponible |
| WeMM-Ecom-35B-A3B | 35B totales (MoE, 3B activos) | no disponible | Supera, según la model card, a modelos abiertos de cientos de miles de millones de parámetros | Apache 2.0 | BF16, FP8, GPTQ, GGUF |

Los datos de contexto, licencia y formatos de Qwen3.5-9B y Valley3-8B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Especialización: el modelo está optimizado para e-commerce; su comportamiento fuera de ese dominio se apoya en las capacidades generales del base Qwen3.5, con una mejora marginal (+0,83 pts) frente a ese modelo.
- Alucinación: no se documentan tasas de alucinación ni estrategias de mitigación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad o equidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas.
- Despliegue: requiere GPU con soporte FP8 y vLLM >= 0.31.0; no es un checkpoint apto para GPUs sin FP8 ni para motores que no soporten cuantización block-wise.
- Datos de entrenamiento: no se especifica la composición del dataset, el número de tokens ni el proceso de alineación, lo que dificulta evaluar riesgos de contaminación o sesgo.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento efectivo en contextos extremos ni el coste de memoria asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Modelo base (BF16): https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Colección de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Informe técnico: enlazado desde la model card como "Technical Report" (URL no expuesta en el texto extraído; no disponible)
