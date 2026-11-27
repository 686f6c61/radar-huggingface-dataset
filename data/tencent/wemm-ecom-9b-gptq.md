# tencent/WeMM-Ecom-9B-GPTQ

## Resumen

WeMM-Ecom-9B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-9B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico de WeChat. Es un modelo denso de 9B parámetros con arquitectura Qwen3.5, diseñado para procesar entradas de texto, imagen, multi-imagen y vídeo, con una ventana de contexto de 262.144 tokens y soporte de razonamiento híbrido (modo instruct y modo thinking).

El modelo resuelve el problema del entendimiento fino de contenido comercial: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de catálogo. Según la model card, supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de comercio electrónico, manteniendo capacidades generales competitivas.

Esta release cuantizada es relevante porque reduce los requisitos de memoria del checkpoint BF16 manteniendo precisión en pesos de 4 bits (W4A16), lo que facilita el despliegue en infraestructura más modesta mediante vLLM con el backend `compressed-tensors`. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128, simétrica; vision encoder, output head y proyecciones sensibles en precisión original |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato `compressed-tensors` (empaquetado) |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo denso de 9B parámetros construido sobre la arquitectura Qwen3.5, adaptado para entrada multimodal (texto, imagen, multi-imagen y vídeo) mediante un pipeline image-text-to-text. El modelo incorpora razonamiento híbrido: dispone de modo instruct y modo thinking, lo que permite alternar entre respuestas directas y cadenas de razonamiento explícitas según la tarea.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo se ha optimizado para comprensión de comercio electrónico y que mantiene capacidades generales, evaluado sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías. La versión GPTQ aplica cuantización de solo pesos con activaciones en 16 bits, preservando en precisión original el codificador visual, la cabeza de salida y determinadas proyecciones sensibles.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, multi-imagen y vídeo.
- Comprensión fina de comercio electrónico: atributos de producto, moderación de contenido, OCR, recuperación, grounding y razonamiento sobre productos.
- Modo thinking (razonamiento explícito) y modo instruct (respuesta directa).
- Comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo.
- Comprensión multi-imagen e instrucciones complejas.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el modo thinking habilita razonamiento explícito, pero no se documenta soporte de agentes).

## Casos de uso

- Moderación de contenido en marketplaces: el modelo analiza imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, aprovechando sus benchmarks específicos de moderación en e-commerce.
- Extracción de atributos de producto: a partir de fotos de producto, el modelo identifica categoría, materiales, colores y especificaciones, útil para completar fichas de catálogo automáticamente.
- OCR en imágenes comerciales: lectura de etiquetas, precios y textos en envases o carteles, con contexto de 262.144 tokens para procesar lotes de imágenes en una sola sesión.
- Búsqueda y recuperación multimodal: generación de descripciones y representaciones de producto para motores de búsqueda visual dentro de una plataforma de comercio.
- Asistencia al vendedor: conversaciones multi-turno con contexto largo para responder dudas sobre productos, políticas o gestión de catálogo, con soporte de imágenes y vídeo.
- Análisis de vídeo de producto: comprensión de demostraciones o unboxings para generar resúmenes, extraer características y validar contenido.
- Razonamiento sobre conocimiento de producto: comparación de productos, recomendaciones y respuestas que requieren cadenas de razonamiento (modo thinking).

## Benchmarks y rendimiento

La model card presenta comparativas en forma de gráficos e imágenes, sin valores numéricos individuales por benchmark en el texto disponible. Los datos agregados que se indican son:

| Comparativa | Diferencia media |
|---|---|
| WeMM-Ecom-9B vs Qwen3.5-9B (e-commerce) | +5,19 puntos |
| WeMM-Ecom-9B vs Valley3-8B (e-commerce) | +10,28 puntos |
| WeMM-Ecom-9B vs Qwen3.5-9B (general) | +0,83 puntos |
| WeMM-Ecom-9B vs Valley3-8B (general) | +13,02 puntos |

Los resultados individuales por benchmark (MMLU, HumanEval, GSM8K u otros) no están disponibles en formato numérico en la información proporcionada; la model card remite a tablas en imágenes dentro del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,6 GB en formato GPTQ W4A16, por lo que se requiere aproximadamente 10-12 GB de VRAM para pesos y overhead de inferencia, dependiendo del tamaño de lote y de la longitud de contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) para inferencia con lotes moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en GPUs con 16 GB para contextos cortos; los 262.144 tokens de contexto exigen memoria adicional para la caché KV.
- Opciones de despliegue: vLLM (>= 0.31.0) con backend `compressed-tensors`, que detecta automáticamente el formato de cuantización; también existe release GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-GPTQ | 9,4B (denso) | 262.144 | Apache 2.0 | GPTQ W4A16, BF16, FP8, GGUF | Especializado en e-commerce; +5,19 pts vs Qwen3.5-9B en e-commerce |
| Qwen3.5-9B | 9B (denso) | no disponible | no disponible | no disponible | Referencia general; superado por WeMM-Ecom-9B en e-commerce y ligeramente en general |
| Valley3-8B | 8B (denso) | no disponible | no disponible | no disponible | Referencia multimodal; superado por WeMM-Ecom-9B en ambas suites |

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Sesgos: no se documentan sesgos específicos; al estar entrenado sobre contenido de comercio electrónico de WeChat, puede reflejar sesgos del dominio y de la plataforma.
- Alucinación: riesgo inherente a modelos generativos multimodales, especialmente en OCR y extracción de atributos; se recomienda validación en producción.
- Contexto largo: los 262.144 tokens requieren memoria considerable para la caché KV; el rendimiento real en contextos extremos no está documentado.
- Cuantización: la versión GPTQ W4A16 puede degradar ligeramente la precisión respecto al checkpoint BF16; no se publican métricas de la pérdida de calidad por cuantización.
- Tool calling y agentes: no se documenta soporte explícito; verificar antes de diseñar pipelines agénticos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-9B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Versión GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
