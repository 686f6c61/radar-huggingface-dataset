# tencent/WeMM-Ecom-0.8B-GGUF

## Resumen

WeMM-Ecom-0.8B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para comprensión de contenido multimodal en el contexto del comercio electrónico de WeChat. El modelo combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, lo que permite su despliegue con llama.cpp tanto en línea de comandos como mediante un servidor local compatible con la API de OpenAI.

El modelo resuelve tareas de comprensión de imagen y texto orientadas a e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto) manteniendo a la vez capacidades generales de visión y lenguaje. Según la model card, supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de e-commerce, y mantiene una ventaja de 6,93 y 1,09 puntos respectivamente en la media de benchmarks generales.

Se trata de un modelo denso de 0,8B parámetros (752.393.024 parámetros reales según safetensors) con una ventana de contexto de 262.144 tokens, licencia Apache 2.0 y soporte de modos de instrucción y de razonamiento (thinking). Su relevancia actual radica en que ofrece capacidades multimodales especializadas en e-commerce en un tamaño que cabe en hardware de consumo, con un formato de despliegue ampliamente soportado como GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.5, tag `qwen3_5`), con proyector multimodal |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal) en esta edición GGUF; el modelo base dispone de BF16, FP8 y GPTQ |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos `WeMM-Ecom-0.8B-GGUF.gguf` y `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

WeMM-Ecom-0.8B es un modelo denso de 0,8B parámetros construido sobre la familia Qwen3.5 (según el tag `qwen3_5`), con un proyector multimodal que conecta la entrada visual con el modelo de lenguaje. La edición GGUF mantiene el proyector en F16 mientras cuantiza el modelo de lenguaje a Q4_K_M, una configuración habitual para preservar la calidad de la representación visual mientras se reduce el peso del decodificador. El modelo soporta un modo híbrido de razonamiento (thinking) además del modo de instrucción directa.

La model card indica que el modelo fue evaluado sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, con puntuaciones en escala 0-100. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación específicas más allá del soporte de thinking mode. Para más detalle técnico, la model card remite al informe técnico en arXiv (2611.30662).

## Capacidades

- Comprensión de imagen y texto (pipeline `image-text-to-text`): descripción y análisis de imágenes de producto.
- Tareas de e-commerce especializadas: extracción de atributos de producto, moderación de contenido, OCR, recuperación (retrieval), grounding y razonamiento sobre productos.
- Conocimiento de producto: respuesta a preguntas sobre catálogo y características.
- Capacidades generales de visión y lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Modo de razonamiento híbrido (thinking mode) además del modo de instrucción.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.
- Despliegue con llama.cpp: inferencia por línea de comandos y servidor local compatible con la API de OpenAI.
- Idiomas: chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Catalogación automática de productos: el modelo puede analizar imágenes de producto y extraer atributos (categoría, color, material, talla) para poblar fichas de catálogo, aprovechando sus benchmarks específicos de atributos de producto.
- Moderación de contenido en marketplace: clasificación de imágenes y texto de anuncios para detectar contenido no permitido, apoyándose en las tareas de moderación incluidas en su suite de e-commerce.
- Extracción de texto en imágenes (OCR) para logística y facturación: lectura de etiquetas, albaranes y capturas de pedido en chino e inglés, con el modo de instrucción para respuestas directas.
- Asistente de atención al cliente multi-turno: conversaciones largas sobre pedidos y productos gracias a la ventana de 262.144 tokens, desplegado con llama.cpp en un servidor compatible con la API de OpenAI.
- Búsqueda visual y recuperación de productos: generación de descripciones y representaciones a partir de imágenes para tareas de retrieval en motores de búsqueda internos.
- Enriquecimiento de reseñas y control de calidad: análisis de imágenes enviadas por usuarios junto con su texto para verificar que coinciden con el producto y detectar reclamaciones.
- Despliegue en el borde o en hardware de consumo: al ser un modelo de 0,8B en Q4_K_M, puede ejecutarse en equipos sin GPU dedicada o con GPU de consumo para prototipos y demos internas de e-commerce.
- Asistente multimodal general de bajo coste: VQA, comprensión de documentos y gráficos y seguimiento de instrucciones en aplicaciones que requieran un modelo pequeño con contexto largo.

## Benchmarks y rendimiento

La model card reporta comparaciones del checkpoint BF16 de WeMM-Ecom-0.8B frente a Qwen3.5-0.8B y MiniCPM-V-4.7-1B, con puntuaciones medias en escala 0-100. Los resultados detallados por benchmark se presentan en imágenes dentro de la model card y no están disponibles como cifras textuales en la información proporcionada.

| Comparativa (media de benchmarks) | Diferencia a favor de WeMM-Ecom-0.8B |
|---|---|
| E-commerce vs. Qwen3.5-0.8B | +16,43 puntos |
| E-commerce vs. MiniCPM-V-4.7-1B | +13,03 puntos |
| Generales vs. Qwen3.5-0.8B | +6,93 puntos |
| Generales vs. MiniCPM-V-4.7-1B | +1,09 puntos |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) ni resultados específicos de la edición GGUF cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,7 GB, por lo que la edición Q4_K_M + proyector F16 es muy ligera y cabe holgadamente en GPU de consumo.
- GPU recomendadas: no se especifican modelos concretos; la guía de compilación de llama.cpp cubre CUDA (NVIDIA), Metal, Vulkan y CPU.
- GPU de consumo: sí, cabe en GPU de consumo por el tamaño del repositorio (0,7 GB) y el número de parámetros (0,8B); no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (revisión `a8f8294c45076538f4509754e4c79fc51a1a486b`) con `llama-cli` y `llama-server` (servidor compatible con la API de OpenAI). Para inferencia solo en CPU, usar `-ngl 0` y `--no-mmproj-offload`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento relativo (media) |
|---|---|---|---|---|
| WeMM-Ecom-0.8B | 0,8B denso | 262.144 tokens | Apache 2.0 | Referencia |
| Qwen3.5-0.8B | 0,8B (no confirmado en la información) | No disponible | No disponible | -16,43 (e-commerce) y -6,93 (general) frente a WeMM-Ecom-0.8B |
| MiniCPM-V-4.7-1B | 1B (según nombre) | No disponible | No disponible | -13,03 (e-commerce) y -1,09 (general) frente a WeMM-Ecom-0.8B |

Los datos de parámetros, contexto y licencia de los modelos comparados no están confirmados en la información proporcionada y se indican como no disponibles cuando no se detallan.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Especialización: el modelo está optimizado para e-commerce; su comportamiento fuera de ese dominio depende de las capacidades generales, que la model card declara comparables a modelos del mismo tamaño pero sin cifras absolutas publicadas en texto.
- Alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación en la información disponible; en tareas de atributos de producto conviene validar las salidas contra el catálogo.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Cuantización: esta edición usa Q4_K_M para el modelo de lenguaje; los benchmarks reportados corresponden al checkpoint BF16, por lo que puede existir una degradación no cuantificada respecto a BF16.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base y de los datos de entrenamiento, no detalladas aquí.
- Producción: la model card fija una revisión concreta de llama.cpp; usar otras revisiones puede provocar incompatibilidades. El soporte de tool calling y agentes no está confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Edición FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Edición GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Colección WeMM-Ecom en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Ediciones GGUF de la familia: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF · https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF · https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF · https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF/blob/main/LICENSE
