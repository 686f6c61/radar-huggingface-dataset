# tencent/WeMM-Ecom-0.8B

## Resumen

WeMM-Ecom-0.8B es un modelo multimodal de tipo image-text-to-text desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el contexto del comercio electronico de WeChat. Forma parte de la familia WeMM-Ecom, que incluye variantes de 0.8B, 2B, 4B, 9B y 35B-A3B. Este modelo concreto es la variante densa mas pequena de la familia y esta construido como un fine-tuning del modelo base Qwen/Qwen3.5-0.8B.

El modelo resuelve el problema de la comprension multimodal especializada en dominios de comercio electronico: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding, razonamiento sobre productos y conocimiento de catalogo. Combina esta especializacion vertical con capacidades generales de vision-lenguaje y razonamiento, e incorpora un modo de pensamiento hibrido (thinking mode) que permite alternar entre respuestas directas y razonamiento extendido.

Con 852.985.920 parametros totales (aproximadamente 0.85B), una ventana de contexto de 262.144 tokens y licencia Apache 2.0, el modelo es relevante por su relacion tamano-rendimiento: segun la model card, supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de comercio electronico, manteniendo capacidades generales competitivas. Su tamano reducido lo hace desplegable en hardware modesto, lo que facilita su integracion en pipelines de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), basado en Qwen3.5-0.8B |
| Parametros totales | 852.985.920 (aprox. 0.85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); tambien FP8, GPTQ y GGUF en repositorios derivados |

## Arquitectura y entrenamiento

WeMM-Ecom-0.8B es un modelo denso de aproximadamente 0.85B parametros construido mediante fine-tuning sobre Qwen/Qwen3.5-0.8B. La arquitectura es un transformer multimodal que acepta entradas de texto, imagen, multiples imagenes y video, y genera texto. El modelo emplea la libreria transformers (version >= 5.2.0 segun la model card) y se carga mediante `AutoModelForImageTextToText` y `AutoProcessor`.

El entrenamiento se orienta a dos ejes: comprension fina de comercio electronico y preservacion de capacidades generales de vision-lenguaje. La evaluacion reportada cubre 28 benchmarks en ocho escenarios de comercio electronico (atributos de producto, moderacion, OCR, recuperacion, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y 64 benchmarks en ocho categorias generales (VQA general, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto). El modelo soporta modo de pensamiento hibrido (thinking mode) ademas del modo instruct. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes, multiples imagenes y video.
- Comprension especializada de comercio electronico: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding y conocimiento de producto.
- Modo de pensamiento hibrido (thinking mode) e modo instruct, con ajustes de muestreo recomendados por modo y tarea.
- Comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo.
- Comprension multi-imagen y seguimiento de instrucciones.
- Tareas centradas en texto (text-centric tasks).
- Capacidades multilingues limitadas a chino e ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de despliegue mediante Transformers y opciones de serving compatibles con OpenAI (segun la model card).

## Casos de uso

- Moderacion de contenido en marketplaces: el modelo puede clasificar y evaluar imagenes y texto de listados de producto para detectar contenido prohibido, gracias a sus benchmarks especificos de moderacion y su ventana de contexto de 262.144 tokens para procesar fichas completas.
- Extraccion de atributos de producto: a partir de imagenes y descripciones, el modelo identifica y normaliza atributos (color, talla, material, categoria) para alimentar catalogos estructurados, aprovechando sus capacidades de OCR y comprension de producto.
- OCR y digitalizacion de documentacion comercial: lectura de etiquetas, facturas y fichas tecnicas en imagen para extraer texto estructurado, adecuado por su evaluacion en tareas de OCR y documentos.
- Busqueda y recuperacion multimodal: generacion de representaciones o descripciones enriquecidas de productos para motores de busqueda visual y recuperacion, apoyandose en los benchmarks de retrieval del modelo.
- Atencion al cliente automatizada en e-commerce: gestion de conversaciones multi-turno con imagenes adjuntas (capturas de pedido, fotos de producto defectuoso) gracias a la ventana de contexto larga y al modo instruct.
- Grounding y verificacion visual: localizacion de elementos en imagenes de producto (por ejemplo, defectos o componentes) para flujos de control de calidad, usando las capacidades de grounding y conteo evaluadas.
- Procesamiento de video de producto: analisis de videos de demostracion o unboxing para extraer informacion, dado el soporte de entrada de video indicado en la model card.
- Despliegue en entornos con recursos limitados: su tamano de 0.85B permite ejecucion en GPUs de consumo y en formato GGUF para inferencia en CPU o entornos embebidos.

## Benchmarks y rendimiento

La model card reporta resultados en escala 0-100, pero las tablas completas se presentan como imagenes (`assets/ecommerce-benchmarks.png`, `assets/general-benchmarks.png` y tablas instruct/thinking), por lo que los valores numericos por benchmark no estan disponibles en formato textual en la informacion proporcionada. Los datos agregados citados son:

| Comparativa | Diferencia en media de benchmarks |
|---|---|
| WeMM-Ecom-0.8B vs. Qwen3.5-0.8B (e-commerce) | +16,43 puntos |
| WeMM-Ecom-0.8B vs. MiniCPM-V-4.7-1B (e-commerce) | +13,03 puntos |
| WeMM-Ecom-0.8B vs. Qwen3.5-0.8B (general) | +6,93 puntos |
| WeMM-Ecom-0.8B vs. MiniCPM-V-4.7-1B (general) | +1,09 puntos |

No se han publicado en la informacion disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) en formato numerico textual.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB para los pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB para contextos moderados.
- VRAM estimada en FP8: aproximadamente 0,9 GB para pesos, con overhead adicional.
- VRAM estimada en GPTQ (4 bits): aproximadamente 0,5 GB para pesos.
- GGUF: permite inferencia en CPU y en GPUs de consumo con requisitos de VRAM muy reducidos segun la cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en contextos cortos; RTX 3060/4060 o superiores son suficientes. Para contextos largos (hasta 262.144 tokens) se requiere mas VRAM por la cache KV, por lo que se recomiendan A100/H100 o GPUs con 24 GB o mas.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares, especialmente en FP8, GPTQ o GGUF.
- Opciones de despliegue: Transformers (>= 5.2.0), opciones de serving compatibles con OpenAI citadas en la model card, y formatos GGUF para llama.cpp/Ollama. No se confirma en la informacion disponible el soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B | 0,85B | 262.144 | Apache 2.0 | Multimodal e-commerce + general | Hugging Face, FP8/GPTQ/GGUF |
| Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | Multimodal general | Modelo base en Hugging Face |
| MiniCPM-V-4.7-1B | 1B (aprox.) | no disponible | no disponible | Multimodal general | Hugging Face |

Segun la model card, WeMM-Ecom-0.8B supera a Qwen3.5-0.8B en 16,43 puntos (e-commerce) y 6,93 puntos (general), y a MiniCPM-V-4.7-1B en 13,03 puntos (e-commerce) y 1,09 puntos (general). Los datos de contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; no se garantiza rendimiento en castellano u otros idiomas.
- Especializacion: el ajuste fino esta orientado a comercio electronico de WeChat; el rendimiento fuera de ese dominio puede diferir del reportado.
- Sesgos: no se documentan en la informacion disponible los sesgos conocidos del modelo ni de su dataset de entrenamiento.
- Alucinacion: como todo modelo generativo, puede producir descripciones o atributos incorrectos; en tareas de moderacion o extraccion de atributos conviene validacion adicional.
- Contexto: aunque la ventana es de 262.144 tokens, el uso practico de contextos muy largos incrementa la VRAM necesaria para la cache KV.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio para condiciones exactas.
- Produccion: no se publican en la informacion disponible datos de latencia, throughput ni tasas de error en produccion; se recomienda evaluacion propia antes de desplegar.
- Dependencia de version: requiere transformers >= 5.2.0, lo que puede limitar la compatibilidad con stacks mas antiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Coleccion de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Variante 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Version FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Version GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Version GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B/blob/main/LICENSE
