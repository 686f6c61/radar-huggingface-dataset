# tencent/WeMM-Ecom-9B-FP8

## Resumen

WeMM-Ecom-9B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-9B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el comercio electrónico de WeChat. El modelo parte de una arquitectura densa de 9B parámetros (identificada en los tags como `qwen3_5`) y acepta entradas de texto, imagen, multi-imagen y vídeo, con una ventana de contexto de 262.144 tokens. Resuelve la necesidad de entender productos, atributos, moderación de contenido, OCR y razonamiento visual dentro de un dominio de e-commerce muy específico, manteniendo a la vez capacidades generales de visión-lenguaje.

La relevancia de esta variante FP8 es práctica: reduce el peso del checkpoint a unos 11,9 GB en el repositorio y permite desplegar un modelo de 9B con contexto muy largo en GPUs con soporte de FP8, manteniéndose compatible con motores de serving como vLLM (versión 0.31.0 o superior). El modelo incorpora un modo híbrido de "thinking" (razonamiento explícito) además del modo instruct convencional.

La familia WeMM-Ecom incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B (MoE), y esta ficha se centra en la variante densa de 9B en FP8. Según la model card, el checkpoint BF16 subyacente supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de e-commerce, y mantiene una ventaja de 0,83 y 13,02 puntos respectivamente en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia `qwen3_5`), con encoder de visión |
| Parametros totales | 9.409.813.744 (9B denso) |
| Parametros activos | No aplica (modelo denso; la variante MoE de la familia es 35B-A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque de 128 × 128; activaciones en FP8 dinámico; encoder de visión, cabeza de salida y proyecciones sensibles en precisión original. La familia ofrece además BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros con un encoder de visión acoplado para entradas image-text-to-text. Acepta texto, imagen única, múltiples imágenes y vídeo, y expone dos modos de inferencia: instruct y thinking. La cuantización FP8 aplica pesos E4M3 con una escala por cada bloque de 128 × 128 y cuantización dinámica de activaciones en tiempo de inferencia; el encoder de visión, la cabeza de salida y determinadas proyecciones sensibles se mantienen en su precisión original para preservar calidad. El checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí indica que la evaluación se realizó sobre 28 benchmarks de e-commerce agrupados en ocho escenarios (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos de e-commerce y conocimiento de producto) y sobre 64 benchmarks generales en ocho categorías. Existe un informe técnico (arXiv 2611.30662) que documenta el desarrollo, pero su contenido no está incluido en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal sobre texto, imagen, multi-imagen y vídeo.
- Comprensión fina de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding y conocimiento de producto.
- Modo "thinking" (razonamiento explícito) e modo "instruct" convencional, seleccionables.
- Capacidades generales de visión-lenguaje: VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Tareas centradas en texto (text-centric tasks) dentro del conjunto de evaluación general.
- Conversación multi-turno y streaming a través de API compatible con OpenAI servida por vLLM.
- Soporte multilingüe limitado a chino e inglés.
- No se documenta en la información disponible soporte explícito de tool calling o function calling, ni de audio.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos (color, talla, material, categoría) a partir de imágenes y descripciones, apoyándose en sus capacidades de OCR y grounding y en su contexto de 262.144 tokens para procesar fichas extensas.
- Moderación de contenido en marketplace: clasificación de imágenes y textos de anuncios según políticas, usando los benchmarks de moderación para los que fue entrenado y evaluado.
- Búsqueda y recuperación visual: generación de representaciones y descripciones enriquecidas para motores de búsqueda de producto, aprovechando las tareas de retrieval incluidas en su suite de evaluación.
- Atención al cliente con soporte visual: conversaciones multi-turno en las que el usuario adjunta fotos de un producto o de un defecto, con streaming vía API compatible con OpenAI.
- Verificación de anuncios con múltiples imágenes o vídeo: comparación entre imágenes de catálogo y vídeo de producto para detectar discrepancias, gracias al soporte de entradas multi-imagen y vídeo.
- Procesamiento de documentación comercial: comprensión de documentos y gráficos (facturas, albaranes, tablas de precios) dentro de las capacidades generales evaluadas.
- Despliegue en producción con FP8: servir el modelo en GPUs con soporte FP8 mediante vLLM 0.31.0 o superior, con pesos de aproximadamente 11,9 GB, para reducir coste de VRAM frente al checkpoint BF16.

## Benchmarks y rendimiento

La model card presenta los resultados del checkpoint BF16 (WeMM-Ecom-9B) en forma de tablas e imágenes, e indica las siguientes diferencias medias frente a modelos comparables, pero no incluye los valores numéricos por benchmark en el texto disponible:

| Comparación | Diferencia media (e-commerce) | Diferencia media (general) |
|---|---|---|
| WeMM-Ecom-9B frente a Qwen3.5-9B | +5,19 puntos | +0,83 puntos |
| WeMM-Ecom-9B frente a Valley3-8B | +10,28 puntos | +13,02 puntos |

Las puntuaciones se expresan en escala 0–100. Los resultados completos por benchmark (28 de e-commerce y 64 generales, en modos instruct y thinking) están publicados únicamente como imágenes en la model card. No se han publicado en la información disponible resultados numéricos desglosados de MMLU, HumanEval, GSM8K u otros benchmarks estándar, ni mediciones específicas de la variante FP8 frente al BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 11,9 GB en FP8, por lo que los pesos caben en GPUs con 16 GB o más, dejando margen para caché KV; el contexto de 262.144 tokens exige planificación adicional de memoria KV según la longitud real de las secuencias.
- GPU recomendadas: se requiere una GPU con soporte de FP8 (por ejemplo, H100, H200, L40S o A100 según el soporte del motor). Para FP8 nativo se recomiendan H100/H200 y L40S.
- GPU de consumo: los pesos FP8 de ~11,9 GB podrían caber en RTX 4090 (24 GB) si el motor y el kernel soportan FP8 en esa arquitectura; no se confirma en la información disponible. Como alternativa, la familia ofrece GGUF para llama.cpp/Ollama.
- Opciones de despliegue: vLLM >= 0.31.0 (recomendado por el autor, con detección automática de la configuración de cuantización) y API compatible con OpenAI. La familia publica además GPTQ y GGUF, lo que abre la puerta a otros motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-FP8 | 9B denso | 262.144 | Multimodal e-commerce + general | Apache 2.0 | BF16, FP8, GPTQ, GGUF |
| Qwen3.5-9B | 9B (según comparación de la model card) | No disponible | Multimodal general | No disponible | No disponible |
| Valley3-8B | 8B (según comparación de la model card) | No disponible | Multimodal general | No disponible | No disponible |
| WeMM-Ecom-35B-A3B | 35B totales / 3B activos (MoE) | No disponible | Multimodal e-commerce + general | Apache 2.0 | No disponible |

Según la model card, WeMM-Ecom-9B supera a Qwen3.5-9B y Valley3-8B tanto en la media de e-commerce como en la de capacidades generales. Los datos de contexto, licencia y formatos de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Dominio: el ajuste está orientado al e-commerce de WeChat; puede presentar sesgos hacia categorías, jergas y formatos de ese ecosistema.
- Alucinación: no se documentan medidas específicas de mitigación ni tasas de alucinación en la información disponible.
- Cuantización FP8: aunque se preservan encoder de visión, cabeza de salida y proyecciones sensibles, no se publican métricas que cuantifiquen la pérdida de calidad frente al checkpoint BF16.
- Contexto largo: la ventana de 262.144 tokens implica un consumo elevado de memoria KV; su uso práctico requiere ajustar el motor y el hardware.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse en producción sin validación.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones de los pesos base.
- Datos de benchmarks: los resultados completos solo están disponibles como imágenes en la model card; no se han podido verificar numéricamente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Familia 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Familia 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Familia 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentación de instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8/blob/main/LICENSE
