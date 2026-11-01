# vllm-project/dse-qwen2-2b-mrl-v1

## Resumen

DSE-QWen2-2b-MRL-V1 es un modelo bi-encoder especializado en recuperación visual de documentos (visual document retrieval), desarrollado originalmente por MrLight y redistribuido por el equipo de vLLM como copia de seguridad de la cadena de suministro para sus pruebas de integración continua. Se basa en Qwen2-VL-2B-Instruct, un transformer multimodal de 2.000 millones de parámetros, y aplica el enfoque Document Screenshot Embedding (DSE): en lugar de parsear el texto de un documento, codifica directamente su captura de pantalla como vector denso, preservando texto, imagenes y estructura de layout sin pérdida de información.

El modelo resuelve el problema de la recuperación de información en documentos con formatos complejos (PDF, páginas web, presentaciones) donde el parsing tradicional introduce errores y descarta información visual. Con 85,8 nDCG@5 en el leaderboard ViDoRE, se posiciona como una alternativa eficiente en tamaño (2B parámetros) frente a modelos de recuperación visual de mayor escala.

Su relevancia actual radica en que combina dos capacidades poco habituales: representación de dimensión flexible (Matryoshka Representation Learning, MRL) y tamaño de imagen de entrada flexible, lo que permite ajustar el coste computacional al presupuesto de VRAM disponible. La licencia Apache 2.0 facilita su uso comercial y su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL) con encoder de visión y bi-encoder para embeddings |
| Parametros totales | 2.000 millones (aproximado, basado en Qwen2-VL-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuración de píxeles; max_pixels por defecto 2560×28×28) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; compatible con cuantización estándar de transformers, no verificada) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,4 GB, librería Tevatron) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-VL-2B-Instruct, un transformer multimodal que combina un encoder de visión con un decoder de lenguaje. Para la tarea de recuperación, se convierte en un bi-encoder: tanto las consultas textuales como las capturas de documentos se procesan a través del mismo modelo y se extrae el estado oculto del último token como representación densa, normalizada con L2. La dimensión de salida es flexible gracias a MRL: se puede truncar a 1536, 512 u otras dimensiones para equilibrar efectividad y eficiencia.

El entrenamiento utiliza múltiples datasets de recuperación: Tevatron/docmatix-ir y HuggingFaceM4/Docmatix para documentos visuales, Tevatron/msmarco-passage-aug para texto, vidore/colpali_train_set para recuperación visual y Tevatron/wiki-ss-nq para pares pregunta-respuesta. El checkpoint incluye un warm-up con msmarco-passage-aug que permite codificar también documentos como texto plano, ampliando su aplicabilidad. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es el enfoque DSE: codificar la imagen completa del documento en lugar de extraer texto, lo que evita el parsing y preserva layout, tablas e imágenes. Además, el tamaño de imagen de entrada es configurable (resized_height y resized_width), permitiendo ajustar el consumo de VRAM.

## Capacidades

- Recuperación visual de documentos: codifica capturas de pantalla de PDF, páginas web y presentaciones en vectores densos para búsqueda por similitud coseno.
- Recuperación de texto: puede codificar documentos como texto plano gracias al warm-up con msmarco-passage-aug.
- Representación de dimensión flexible (MRL): permite truncar el embedding a 1536, 512 u otras dimensiones para trade-off efectividad-eficiencia.
- Tamaño de imagen de entrada flexible: ajustable mediante resized_height y resized_width para adaptarse a la VRAM disponible.
- Codificación de consultas textuales: las queries se procesan con una imagen dummy de 1×1 píxel para mantener el formato multimodal.
- Multilingüe limitado: soporta inglés y francés según la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa; es un modelo de embeddings, no de generación.

## Casos de uso

- Búsqueda empresarial en archivos PDF: indexar capturas de páginas de contratos, informes y facturas como vectores y recuperar los documentos relevantes ante consultas textuales, evitando el parsing de PDFs con layouts complejos.
- Recuperación en bases de conocimiento con tablas e imágenes: codificar páginas web o presentaciones que contienen tablas y gráficos, donde el texto extraído perdería la estructura visual.
- Motor de búsqueda para portales de documentación técnica: indexar manuales y guías con capturas de pantalla y diagramas, permitiendo búsquedas semánticas que respetan el contenido visual.
- Atención al cliente con base documental visual: recuperar fragmentos de manuales o políticas internas en formato PDF para alimentar sistemas RAG, con embeddings de 512 dimensiones para reducir latencia en producción.
- Indexación de diapositivas corporativas: codificar presentaciones como imágenes para búsqueda interna, preservando gráficos y tablas que el texto plano no captura.
- Recuperación multimodal en comercio electrónico: indexar fichas de producto con imágenes y especificaciones visuales para búsquedas por similitud.
- Pipeline de e-discovery legal: procesar grandes volúmenes de documentos escaneados y recuperar evidencias relevantes mediante consultas textuales, con la ventaja de no requerir OCR previo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| ViDoRE (nDCG@5) | 85,8 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo está especializado en recuperación y no en generación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en bfloat16 para el modelo base (2B parámetros), más la memoria adicional del encoder de visión que depende del tamaño de imagen. La model card advierte que imágenes grandes consumen mucha VRAM y recomienda ajustar resized_height y resized_width (por ejemplo, 680×680) según los recursos.
- GPU recomendadas: A100, H100 para indexación a gran escala; RTX 4090, RTX 3090, A10G para inferencia en producción.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso RTX 4070 (12 GB) con tamaños de imagen reducidos.
- Opciones de despliegue: transformers con flash_attention_2, vLLM (el checkpoint se mantiene para CI de vLLM), Tevatron para pipelines de recuperación. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ViDoRE nDCG@5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSE-QWen2-2b-MRL-V1 | 2B | no disponible | 85,8 | Apache 2.0 | HuggingFace |
| ColPali (basado en PaliGemma-3B) | 3B | no disponible | no disponible en la información | no disponible | HuggingFace |
| ColQwen2 (basado en Qwen2-VL-2B) | 2B | no disponible | no disponible en la información | no disponible | HuggingFace |

No se dispone de datos comparativos adicionales en la información proporcionada. La comparativa con ColPali y ColQwen2 se ofrece como referencia de categoría, pero sus métricas no están verificadas en esta ficha.

## Limitaciones y advertencias

- El modelo está especializado en recuperación (embeddings), no en generación de texto; no debe usarse para tareas generativas.
- Idiomas limitados a inglés y francés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Riesgo de sesgos inherentes a los datasets de entrenamiento (Docmatix, msmarco, colpali_train_set), que pueden reflejar sesgos de dominio y idioma.
- La calidad de recuperación depende del tamaño de imagen de entrada; reducirlo demasiado para ahorrar VRAM puede degradar la efectividad.
- El encoder de visión de Qwen2-VL puede consumir mucha VRAM con imágenes grandes; es necesario ajustar resized_height y resized_width en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de los datasets de entrenamiento para usos derivados.
- El checkpoint es una copia de seguridad de vLLM del original en MrLight/dse-qwen2-2b-mrl-v1; para producción se recomienda usar el original o verificar la integridad del copy.
- No se han publicado datos sobre latencia, throughput ni comportamiento en dominios específicos (legal, médico, financiero).

## Enlaces

- HuggingFace: https://huggingface.co/vllm-project/dse-qwen2-2b-mrl-v1
- Modelo original: https://huggingface.co/MrLight/dse-qwen2-2b-mrl-v1
- Paper DSE: https://arxiv.org/abs/2406.11251
- Leaderboard ViDoRE: https://huggingface.co/spaces/vidore/vidore-leaderboard
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Dataset Docmatix: https://huggingface.co/datasets/HuggingFaceM4/Docmatix
- Dataset colpali_train_set: https://huggingface.co/datasets/vidore/colpali_train_set
- Dataset msmarco-passage-aug: https://huggingface.co/datasets/Tevatron/msmarco-passage-aug
- Dataset docmatix-ir: https://huggingface.co/datasets/Tevatron/docmatix-ir
- Dataset wiki-ss-nq: https://huggingface.co/datasets/Tevatron/wiki-ss-nq
