# tencent/WeMM-Ecom-0.8B-GGUF

## Resumen

WeMM-Ecom-0.8B-GGUF es la edición cuantizada en formato GGUF del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido multimodal orientado al comercio electrónico de WeChat. El modelo resuelve la necesidad de procesar y razonar sobre imágenes de producto, texto asociado y contexto conversacional en un único modelo compacto, y esta edición GGUF está pensada para su despliegue local con llama.cpp, incluyendo inferencia por línea de comandos y un servidor compatible con la API de OpenAI.

Se trata de un modelo denso de aproximadamente 752 millones de parámetros (etiquetado comercialmente como 0.8B), con una ventana de contexto de 262.144 tokens y soporte de modo de pensamiento híbrido (thinking). Combina pesos del modelo de lenguaje en cuantización Q4_K_M con un proyector multimodal en F16, lo que permite ejecutarlo en hardware de consumo manteniendo las capacidades de visión.

Su relevancia radica en dos factores: por un lado, el autor declara que supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de comercio electrónico, manteniendo además capacidades generales competitivas; por otro, al publicarse bajo licencia Apache 2.0 y en formato GGUF, se abre la puerta a despliegues en producción sin dependencia de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + proyector multimodal), familia qwen3_5 |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) + F16 (proyector multimodal); existen tambien BF16, FP8 y GPTQ en el modelo base |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de describirla como un modelo denso de 0,8B de la familia qwen3_5, con un componente de lenguaje y un proyector multimodal que se distribuye como archivo independiente (mmproj-F16.gguf). El pipeline declarado es image-text-to-text, es decir, entrada conjunta de imagen y texto con salida de texto. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

El autor menciona que el modelo soporta modo de pensamiento híbrido, lo que implica la posibilidad de alternar entre respuestas directas (instruct) y razonamiento extendido (thinking). La evaluacion publicada se presenta separada por modo, con 28 benchmarks de comercio electronico en ocho escenarios y 64 benchmarks generales en ocho categorias, lo que sugiere un entrenamiento orientado tanto a tareas verticales de e-commerce como a capacidades generales de vision-lenguaje.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre pares imagen-texto.
- Comprension de atributos de producto, moderacion de contenido, OCR, recuperacion, grounding y razonamiento sobre imagenes de catalogo.
- Conocimiento especifico de producto y benchmarks publicos de comercio electronico.
- VQA general, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen e instrucciones complejas.
- Modo de pensamiento híbrido (instruct y thinking) conmutables.
- Capacidades multilingues limitadas a chino e ingles.
- Despliegue con llama.cpp mediante CLI y servidor compatible con la API de OpenAI.
- No se especifica en la informacion disponible soporte explicito de tool calling o function calling.

## Casos de uso

- Moderacion de contenido en marketplaces: el modelo puede analizar imagenes de anuncios junto con su texto para detectar productos prohibidos o contenido inapropiado, apoyandose en sus capacidades de moderacion y en el modo thinking para casos ambiguos.
- Extraccion de atributos de producto: a partir de una foto de catalogo, generar fichas estructuradas con categoria, color, material y otras caracteristicas, gracias a las capacidades de OCR y comprension de atributos.
- Atencion al cliente multimodal: gestionar conversaciones multi-turno donde el usuario envia fotos de un producto defectuoso, aprovechando la ventana de 262.144 tokens para mantener contexto largo de la conversacion.
- Busqueda visual y recuperacion: indexar y recuperar productos a partir de descripciones o imagenes, usando las capacidades de grounding y retrieval evaluadas por el autor.
- Generacion de descripciones de producto: redactar titulos y descripciones comerciales a partir de imagenes, con soporte bilingue chino-ingles para catalogos internacionales.
- Despliegue en el borde o en local: al caber en cuantizacion Q4_K_M en hardware de consumo, permite prototipado y demos sin coste de API, asi como procesamiento de datos sensibles en instalaciones propias.
- Analisis de resenas con imagen: procesar resenas de compradores que incluyen fotos para resumir quejas o detectar patrones de calidad.

## Benchmarks y rendimiento

Los resultados publicados por el autor se expresan como medias agregadas sobre 28 benchmarks de e-commerce y 64 benchmarks generales, en escala 0-100, y se comparan con dos modelos de tamano similar. No se proporcionan en la informacion disponible los valores absolutos por benchmark ni las tablas completas (que en la model card aparecen como imagenes).

| Comparativa | Diferencia en benchmarks de e-commerce | Diferencia en benchmarks generales |
|---|---|---|
| WeMM-Ecom-0.8B frente a Qwen3.5-0.8B | +16,43 puntos | +6,93 puntos |
| WeMM-Ecom-0.8B frente a MiniCPM-V-4.7-1B | +13,03 puntos | +1,09 puntos |

No se han publicado en la informacion disponible resultados numericos absolutos de benchmarks individuales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,7 GB en total, por lo que la inferencia en Q4_K_M con proyector F16 requiere aproximadamente 1-2 GB de memoria, dependiendo del contexto utilizado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo e incluso en CPU, ya que el autor documenta compilacion solo para CPU con `-ngl 0` y `--no-mmproj-offload`.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con API compatible con OpenAI); backends CUDA, Metal, Vulkan y CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-GGUF | ~0,8B | 262.144 | Multimodal e-commerce | Apache 2.0 | GGUF |
| Qwen3.5-0.8B | ~0,8B | no disponible | Multimodal general | no disponible | no disponible |
| MiniCPM-V-4.7-1B | ~1B | no disponible | Multimodal general | no disponible | no disponible |

Segun el autor, WeMM-Ecom-0.8B supera a ambos comparables en la media de benchmarks de e-commerce y mantiene ventaja en la media de benchmarks generales. No se dispone de datos de contexto ni de licencia de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Sesgos: no se documentan en la informacion disponible analisis de sesgos; al estar orientado a e-commerce de WeChat, puede heredar sesgos de dominio y de los datos de entrenamiento del modelo base.
- Alucinacion: como todo modelo generativo, puede producir descripciones o atributos incorrectos sobre imagenes; en moderacion o catalogacion conviene validacion humana.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base.
- Produccion: la edicion GGUF requiere una build reciente de llama.cpp con soporte de Qwen3.5 y multimodal; versiones antiguas pueden no cargar el modelo o el proyector correctamente.
- Contexto: aunque la ventana es de 262.144 tokens, el coste de memoria y la latencia crecen con la longitud; en hardware de consumo conviene limitar el contexto efectivo.
- Datos de benchmarks: los resultados publicados son medias agregadas y no se acompanan de tablas numericas completas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Version FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Version GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guia de compilacion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
