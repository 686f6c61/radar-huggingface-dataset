# tencent/WeMM-Ecom-4B

## Resumen

WeMM-Ecom-4B es un modelo multimodal de tipo image-text-to-text desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el contexto del comercio electronico de WeChat. Forma parte de la familia WeMM-Ecom, que incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B. Este modelo de 4B escala se construye sobre Qwen/Qwen3.5-4B mediante fine-tuning y combina comprension fina de producto con capacidades generales de vision-lenguaje y razonamiento.

El modelo resuelve el problema de entender imagenes, multiples imagenes y video en escenarios de e-commerce: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding, razonamiento y conocimiento de producto. Segun la model card, supera a Qwen3.5-4B en 6,47 puntos en la media de benchmarks de e-commerce y en 0,40 puntos en la media de benchmarks generales, manteniendo asi un equilibrio entre especializacion y capacidades generales.

Con 4.539.265.536 parametros (arquitectura densa) y una ventana de contexto de 262.144 tokens, WeMM-Ecom-4B se posiciona como una opcion de despliegue flexible: acepta entradas de texto, imagen, multiples imagenes y video, y se distribuye en formatos BF16, FP8, GPTQ y GGUF. Soporta modo hibrido de pensamiento (instruct y thinking), lo que permite alternar entre respuestas directas y razonamiento extendido segun la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | Chino (zh), ingles (en); la model card menciona ademas arabe (ar) en los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint BF16); variantes FP8, GPTQ y GGUF publicadas por separado |

## Arquitectura y entrenamiento

WeMM-Ecom-4B es un modelo denso de 4B parametros construido sobre Qwen/Qwen3.5-4B mediante fine-tuning. La arquitectura es de tipo transformer multimodal con pipeline image-text-to-text, capaz de procesar texto, imagenes, multiples imagenes y video. El checkpoint principal se distribuye en BF16 Safetensors, con variantes cuantizadas en FP8, GPTQ y GGUF para distintos escenarios de despliegue.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se indica que el entrenamiento combina comprension fina de e-commerce con capacidades generales de vision-lenguaje y razonamiento, y que el modelo soporta modo hibrido de pensamiento (instruct y thinking). La evaluacion se realizo sobre 28 benchmarks de e-commerce agrupados en ocho escenarios y 64 benchmarks generales en ocho categorias, todos en escala 0-100.

## Capacidades

- Comprension de e-commerce: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding, razonamiento y conocimiento de producto.
- Generacion de texto y razonamiento multimodal sobre imagenes y video.
- Entrada de texto, imagen, multiples imagenes y video.
- Modo hibrido de pensamiento: modo instruct (respuesta directa) y modo thinking (razonamiento extendido).
- Capacidades generales de vision-lenguaje: VQA general, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Capacidades multilingues limitadas a chino e ingles (con mencion a arabe en los tags).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se menciona explicitamente soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Catalogacion automatica de productos: el modelo puede extraer atributos de producto a partir de imagenes y descripciones, aprovechando su especializacion en atributos de e-commerce y su ventana de 262.144 tokens para procesar fichas extensas.
- Moderacion de contenido en marketplaces: analisis de imagenes y texto de anuncios para detectar contenido inapropiado, apoyandose en los benchmarks de moderacion incluidos en la evaluacion.
- OCR de etiquetas y documentos de producto: extraccion de texto de imagenes de envases, etiquetas y documentacion, util para inventario y cumplimiento normativo.
- Busqueda y recuperacion multimodal: generacion de representaciones o descripciones para recuperacion de productos a partir de imagenes, gracias a las capacidades de retrieval y grounding evaluadas.
- Atencion al cliente con soporte visual: gestion de conversaciones multi-turno donde el usuario envia imagenes de productos o defectos, aprovechando el contexto largo y el modo thinking para razonamiento complejo.
- Analisis de video de producto: procesamiento de video para resenas, demostraciones o inspeccion de calidad, una de las modalidades de entrada soportadas.
- Asistentes de compra con razonamiento: uso del modo thinking para tareas de recomendacion y comparacion de productos que requieren varios pasos de razonamiento.

## Benchmarks y rendimiento

La model card reporta resultados en 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorias), en escala 0-100, pero los valores numericos concretos se presentan unicamente como imagenes (assets/ecommerce-benchmarks.png, assets/general-benchmarks.png y tablas completas en imagenes), no como texto extraible en la informacion proporcionada.

| Comparacion | Diferencia reportada |
|---|---|
| Media de benchmarks de e-commerce frente a Qwen3.5-4B | +6,47 puntos |
| Media de benchmarks generales frente a Qwen3.5-4B | +0,40 puntos |

No se dispone de los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) en formato textual en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Como referencia orientativa por tamano de checkpoint (4,54B parametros): BF16 ~9,1 GB de pesos, FP8 ~4,5 GB, GPTQ (4 bits) ~2,3 GB, GGUF variable segun cuantizacion.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; las variantes GPTQ y GGUF sugieren viabilidad en GPU de consumo, pero no se aportan datos oficiales.
- Opciones de despliegue: Transformers (>=5.2.0) con accelerate, torch y torchvision; la model card menciona dos opciones de serving compatibles con OpenAI, aunque los detalles no estan incluidos en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| WeMM-Ecom-4B | 4,54B (denso) | 262.144 | Apache 2.0 | Especializado en e-commerce; +6,47 pts en e-commerce y +0,40 pts en general frente a Qwen3.5-4B |
| Qwen3.5-4B | ~4B (denso) | no disponible | no disponible | Modelo base; referencia directa de comparacion en la model card |
| WeMM-Ecom-9B | no disponible | no disponible | Apache 2.0 (presumible, misma familia) | Version superior de la misma familia |
| WeMM-Ecom-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 (presumible, misma familia) | Segun la model card, supera a modelos abiertos de cientos de miles de millones de parametros |

No se dispone de datos de benchmarks numericos de modelos de la competencia en la informacion proporcionada para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede presentar sesgos hacia ese dominio y hacia los idiomas chino e ingles.
- Riesgo de alucinacion: no cuantificado en la model card; como modelo generativo multimodal, es susceptible de generar descripciones o atributos incorrectos, especialmente en imagenes ambiguas.
- Limitaciones de idioma: soporte declarado de chino e ingles (y mencion a arabe en tags); el rendimiento en otros idiomas no esta documentado.
- Limitaciones de contexto: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento en el extremo de esa ventana ni con entradas de video largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.5-4B.
- Caveats para produccion: los resultados de benchmarks solo estan disponibles como imagenes; conviene validar el modelo en el dominio concreto antes de desplegarlo. No se documentan requisitos de hardware ni latencias oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-4B
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-4B/blob/main/LICENSE
- Variante 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Version FP8: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Version GPTQ: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- Version GGUF: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
