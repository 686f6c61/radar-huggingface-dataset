# tencent/WeMM-Ecom-9B-GPTQ

## Resumen

WeMM-Ecom-9B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-9B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. Se distribuye como un checkpoint de 9.409.813.744 parámetros en formato `compressed-tensors` sobre safetensors, con una ventana de contexto de 262.144 tokens y soporte de entradas de texto, imagen, multi-imagen y vídeo.

El modelo parte de una arquitectura densa de 9B (etiquetada internamente como `qwen3_5`) y se ofrece como una alternativa de despliegue eficiente frente al checkpoint BF16 original, manteniendo las capacidades de razonamiento híbrido (modo instruct y modo thinking). Según la model card, la familia WeMM-Ecom está orientada a tareas de atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto, además de conservar capacidades generales de visión-lenguaje.

Su relevancia actual radica en que combina una ventana de contexto muy amplia con cuantización de 4 bits en pesos, lo que reduce los requisitos de memoria frente al BF16 y facilita el servicio con vLLM mediante el backend `compressed-tensors`. La licencia Apache 2.0 permite uso comercial, si bien el modelo está especializado y solo declara soporte para chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia `qwen3_5`), entrada image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits en pesos, 16 bits en activaciones), grupos de 128 con cuantización simétrica; también existen releases BF16, FP8 y GGUF de la familia |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` (GPTQ empaquetado) |

## Arquitectura y entrenamiento

El checkpoint es un modelo denso de 9B construido sobre una arquitectura transformer multimodal de la familia `qwen3_5`, con pipeline `image-text-to-text`. Acepta texto, imagen, multi-imagen y vídeo como entradas, y dispone de un modo de razonamiento híbrido que alterna entre modo instruct y modo thinking. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación destacable de esta release es la cuantización: GPTQ con pesos de 4 bits y activaciones de 16 bits, grupos de 128 valores y cuantización simétrica, almacenada en safetensors con el formato `compressed-tensors`. El encoder de visión, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original, lo que busca preservar la calidad en las partes críticas del modelo multimodal. El checkpoint incluye su configuración de cuantización, de modo que vLLM puede detectar el formato automáticamente al servir el modelo.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, multi-imagen y vídeo.
- Comprensión de contenido de comercio electrónico: atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto.
- Capacidades generales de visión-lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Modo de razonamiento híbrido: modo instruct y modo thinking.
- Conversación multi-turno con ventana de contexto de hasta 262.144 tokens.
- Servicio mediante API compatible con OpenAI a través de vLLM (peticiones de texto, imagen, multi-imagen, vídeo, multi-turno y streaming).
- Soporte multilingüe limitado a chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada (el modo thinking sugiere razonamiento extendido, pero no se documenta integración de agentes).

## Casos de uso

- Catalogación de productos de comercio electrónico: el modelo puede extraer atributos de producto a partir de imágenes y texto de fichas, apoyándose en sus benchmarks específicos de atributos de producto y su ventana de 262.144 tokens para procesar descripciones largas.
- Moderación de contenido en marketplaces: análisis combinado de imagen y texto para detectar listados que incumplen políticas, usando las capacidades de moderación declaradas en la suite de evaluación de comercio electrónico.
- OCR y digitalización de documentación comercial: extracción de texto de etiquetas, facturas o embalajes, aprovechando las tareas de OCR y comprensión de documentos incluidas en la evaluación del modelo.
- Búsqueda y recuperación multimodal: generación de representaciones y descripciones de productos para motores de búsqueda internos, apoyándose en las tareas de retrieval evaluadas por el autor.
- Asistencia conversacional al comprador: atención multi-turno en chino o inglés con contexto largo, sirviendo el modelo mediante vLLM con API compatible con OpenAI y streaming.
- Análisis de vídeo de producto: revisión de vídeos demostrativos o de unboxing para verificar características, gracias al soporte de entrada de vídeo declarado en la model card.
- Despliegue en infraestructura con memoria limitada: al estar cuantizado en W4A16, el checkpoint de 8,6 GB permite servir el modelo en GPUs con menos VRAM que la versión BF16, manteniendo el encoder de visión en mayor precisión.

## Benchmarks y rendimiento

La model card incluye gráficos y tablas de resultados (28 benchmarks de comercio electrónico en ocho escenarios y 64 benchmarks generales en ocho categorías, en escala 0-100), pero los valores numéricos concretos no están disponibles en la información proporcionada, ya que se presentan únicamente como imágenes. Los únicos datos cuantitativos textuales son las comparaciones medias declaradas por el autor para el checkpoint WeMM-Ecom-9B:

| Comparación | Diferencia media declarada |
|---|---|
| WeMM-Ecom-9B vs. Qwen3.5-9B (comercio electrónico) | +5,19 puntos |
| WeMM-Ecom-9B vs. Valley3-8B (comercio electrónico) | +10,28 puntos |
| WeMM-Ecom-9B vs. Qwen3.5-9B (capacidades generales) | +0,83 puntos |
| WeMM-Ecom-9B vs. Valley3-8B (capacidades generales) | +13,02 puntos |

No se han publicado en la información disponible resultados numéricos desglosados (MMLU, HumanEval, GSM8K u otros) ni métricas específicas de la versión GPTQ frente al checkpoint BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,6 GB en disco; con overhead de activaciones, caché KV y el encoder de visión en mayor precisión, se recomienda planificar por encima de los 10-12 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, GPUs de centro de datos como A100 o H100 son adecuadas; el autor no publica una lista oficial.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo en la información proporcionada; el tamaño del checkpoint sugiere que podría caber en GPUs con 16 GB o más, pero no hay validación oficial.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según el quick start) con backend `compressed-tensors` y API compatible con OpenAI. Existe un release GGUF de la familia para otros runners, pero la información proporcionada no detalla su uso con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-GPTQ | 9,4B (denso) | 262.144 tokens | Multimodal comercio electrónico, GPTQ W4A16 | Apache 2.0 | Hugging Face (tencent) |
| WeMM-Ecom-9B (BF16) | 9,4B (denso) | 262.144 tokens | Multimodal comercio electrónico, precisión completa | Apache 2.0 | Hugging Face (tencent) |
| Qwen3.5-9B | 9B (según la model card) | no disponible | Modelo generalista de referencia | no disponible | no disponible |
| Valley3-8B | 8B (según la model card) | no disponible | Modelo multimodal de referencia | no disponible | no disponible |

Según la model card, WeMM-Ecom-9B supera a Qwen3.5-9B y Valley3-8B en las medias de sus suites de evaluación, pero no se dispone de los valores absolutos ni de las especificaciones completas de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está validado.
- Especialización: el modelo está optimizado para comercio electrónico; su comportamiento fuera de ese dominio se apoya en las capacidades generales, pero no hay datos desglosados disponibles.
- Alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación específicos en la información proporcionada.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad en la información proporcionada.
- Cuantización: la versión GPTQ W4A16 puede presentar degradación frente al checkpoint BF16; el autor no publica una comparación numérica entre ambos en la información disponible.
- Tool calling y agentes: no se documenta soporte de function calling ni de flujos de agentes, por lo que no debe asumirse en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones y posibles avisos adicionales.
- Despliegue: requiere vLLM >= 0.31.0 con backend `compressed-tensors`; otros runners no están validados oficialmente en la información proporcionada.
- Datos de entrenamiento: no se detalla la composición del dataset ni el número de tokens, lo que dificulta evaluar riesgos de contaminación o cobertura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-9B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Versión GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Colección de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ/blob/main/LICENSE
- Documentación de instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Familia 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Familia 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Familia 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Tencent: https://www.tencent.com/
