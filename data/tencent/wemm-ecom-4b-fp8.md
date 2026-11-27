# tencent/WeMM-Ecom-4B-FP8

## Resumen

WeMM-Ecom-4B-FP8 es la version cuantizada en FP8 del modelo multimodal WeMM-Ecom-4B, desarrollado por WeChat Vision (Tencent) para la comprension de contenido en el contexto del comercio electronico de WeChat. El modelo resuelve la tarea de image-text-to-text: recibe texto, imagenes, multiples imagenes o video y genera respuestas conversacionales, con especial enfasis en el entendimiento de productos, atributos, moderacion de contenido y OCR comercial.

Se trata de un modelo denso de 4B parametros construido sobre la arquitectura Qwen3.5 (tag `qwen3_5`), con una ventana de contexto de 262.144 tokens y soporte para modo instruct y modo thinking (razonamiento hibrido). Su relevancia actual radica en que ofrece capacidades especializadas de e-commerce manteniendo un rendimiento general competitivo con modelos del mismo tamano, y en que esta disponible en formato FP8 block-wise para despliegue eficiente en GPU con soporte de FP8.

El checkpoint FP8 conserva la precision original en el codificador visual, la cabeza de salida y determinadas proyecciones sensibles, mientras cuantiza los pesos a FP8 E4M3 con una escala por bloque de 128x128 y cuantizacion dinamica de activaciones en inferencia. La licencia es Apache 2.0 y los idiomas declarados son chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (ventana nativa); el ejemplo de servicio usa 32.768 tokens |
| Tipos de cuantizacion | FP8 E4M3 block-wise (escala por bloque 128x128, activaciones FP8 dinamicas); la familia ofrece tambien BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parametros con arquitectura multimodal de tipo image-text-to-text, construido sobre la familia Qwen3.5. Integra un codificador visual que procesa imagenes, multiples imagenes y video, y un decodificador de lenguaje que genera la respuesta. El checkpoint FP8 mantiene en precision original el codificador visual, la cabeza de salida y proyecciones seleccionadas consideradas sensibles, y aplica cuantizacion FP8 E4M3 block-wise al resto de pesos, con cuantizacion dinamica de activaciones durante la inferencia.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se documenta que el entrenamiento esta orientado a e-commerce: la evaluacion cubre 28 benchmarks en ocho escenarios comerciales (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorias. El modelo soporta modo instruct y modo thinking, lo que sugiere un entrenamiento orientado a razonamiento hibrido, aunque los detalles del pipeline no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens).
- Comprension de imagen, multiples imagenes y video como entradas multimodales.
- Entendimiento especializado de e-commerce: atributos de producto, moderacion de contenido, OCR comercial, retrieval y grounding de productos.
- Razonamiento multimodal con modo thinking (razonamiento paso a paso) y modo instruct.
- Capacidades generales de VQA, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada, mas alla del modo thinking.
- Capacidades multilingues limitadas a chino e ingles.
- Servicio mediante API compatible con OpenAI a traves de vLLM, con soporte de streaming.

## Casos de uso

- Moderacion de contenido en marketplace: el modelo puede analizar imagenes y texto de anuncios para detectar productos prohibidos, contenido inapropiado o discrepancias entre la imagen y la descripcion, aprovechando sus benchmarks especificos de moderacion.
- Extraccion de atributos de producto: a partir de la imagen y el titulo de un articulo, el modelo genera fichas estructuradas con color, material, talla y categoria, usando las capacidades de OCR y comprension de producto.
- Busqueda y retrieval visual en catalogo: el modelo puede generar descripciones o representaciones de producto que alimenten un motor de busqueda multimodal, gracias a sus capacidades de grounding y retrieval evaluadas en el suite de e-commerce.
- Atencion al cliente automatizada: con 262.144 tokens de contexto, puede gestionar conversaciones multi-turno con historial largo e incorporar imagenes del pedido o del producto para resolver incidencias.
- Analisis de resenas con imagen: procesamiento de resenas de compradores que incluyen fotos para clasificar sentimiento, detectar problemas de calidad o verificar que la imagen corresponde al producto vendido.
- Generacion de descripciones de producto: redaccion automatica de fichas y descripciones comerciales a partir de imagenes del articulo, en chino o ingles.
- Procesamiento de video de producto: analisis de videos de demostracion o unboxing para extraer caracteristicas, detectar contenido problematico o generar resumenes.
- Asistente interno para operaciones de e-commerce: consultas sobre politicas, catalogos y conocimiento de producto en un contexto de hasta 262.144 tokens.

## Benchmarks y rendimiento

La model card indica que WeMM-Ecom-4B (checkpoint BF16) supera a Qwen3.5-4B en 6,47 puntos de media en el suite de e-commerce y en 0,40 puntos de media en el suite general. Los resultados detallados se presentan como imagenes en la model card y no estan disponibles como cifras textuales en la informacion proporcionada.

| Benchmark | WeMM-Ecom-4B | Qwen3.5-4B | Diferencia |
|---|---|---|---|
| Media e-commerce (28 benchmarks, 8 escenarios) | no disponible (cifra absoluta) | no disponible (cifra absoluta) | +6,47 puntos |
| Media general (64 benchmarks, 8 categorias) | no disponible (cifra absoluta) | no disponible (cifra absoluta) | +0,40 puntos |

No se han publicado en la informacion disponible los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni las cifras del checkpoint FP8, que la model card no reporta de forma separada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,5 GB en FP8, por lo que se requiere aproximadamente 6-8 GB de VRAM solo para pesos, mas el espacio para cache KV y el codificador visual; con contexto de 32.768 tokens el consumo adicional de cache es significativo.
- GPU recomendadas: se requiere una GPU con soporte de FP8 (generacion Hopper o superior, como H100; tambien Ada Lovelace como L40S o RTX 4090 con soporte FP8). Para contextos largos y mayor throughput se recomienda A100/H100 con mayor memoria.
- Cabe en GPU de consumo: si, en GPUs consumer con soporte FP8 (por ejemplo RTX 4090 con 24 GB) para contextos moderados; en GPUs sin soporte FP8 nativo el checkpoint puede no ser la opcion adecuada y conviene usar las variantes BF16, GPTQ o GGUF.
- Opciones de despliegue: vLLM (version >= 0.31.0 segun la model card, con deteccion automatica de la configuracion de cuantizacion), con API compatible con OpenAI. Para las variantes GPTQ y GGUF de la familia existen otras opciones (no detalladas en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-FP8 | 4,54B denso | 262.144 | Multimodal e-commerce | Apache 2.0 | Safetensors FP8 (familia con BF16, GPTQ, GGUF) |
| Qwen3.5-4B | 4B (segun referencia de la model card) | no disponible | Multimodal general | no disponible | no disponible |
| WeMM-Ecom-2B | 2B (segun familia) | no disponible | Multimodal e-commerce | Apache 2.0 | BF16, FP8, GPTQ, GGUF |
| WeMM-Ecom-9B | 9B (segun familia) | no disponible | Multimodal e-commerce | Apache 2.0 | BF16, FP8, GPTQ, GGUF |

WeMM-Ecom-4B supera a Qwen3.5-4B en el suite de e-commerce (+6,47 puntos de media) y en el general (+0,40 puntos), segun la model card. No se dispone de datos de contexto ni de licencia de Qwen3.5-4B en la informacion proporcionada. Dentro de la propia familia, el 4B se situa entre el 2B y el 9B, y el 35B-A3B es la variante MoE de mayor capacidad.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos multimodales, especialmente en OCR de imagenes de baja calidad o en atributos de producto poco visibles.
- Sesgos potenciales derivados de los datos de entrenamiento orientados al ecosistema de e-commerce de WeChat; el rendimiento puede degradarse en catalogos de otras regiones o sectores.
- El checkpoint FP8 requiere GPU con soporte FP8 y un motor de servicio con soporte de FP8 block-wise (vLLM >= 0.31.0); en otros entornos conviene usar las variantes BF16, GPTQ o GGUF.
- La cuantizacion FP8 puede introducir perdida de precision respecto al checkpoint BF16; la model card no reporta una evaluacion separada del checkpoint FP8.
- No se documentan en la informacion proporcionada los detalles de entrenamiento (tokens, dataset, RLHF/DPO), lo que dificulta evaluar sesgos y robustez.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los terminos del fichero LICENSE del repositorio.
- El ejemplo de servicio de la model card usa 32.768 tokens de contexto, muy por debajo de la ventana nativa de 262.144; el uso de contextos muy largos incrementa notablemente el consumo de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia WeMM-Ecom 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia WeMM-Ecom 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Familia WeMM-Ecom 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Familia WeMM-Ecom 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Coleccion en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentacion de instalacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8/blob/main/LICENSE
