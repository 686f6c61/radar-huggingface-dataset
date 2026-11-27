# tencent/WeMM-Ecom-4B-GPTQ

## Resumen

WeMM-Ecom-4B-GPTQ es la version cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-4B, desarrollado por WeChat Vision (Tencent) para la comprension de contenido en el contexto del comercio electronico de WeChat. El modelo original es un transformer denso de aproximadamente 4.500 millones de parametros que procesa entradas de texto e imagen (pipeline image-text-to-text) y esta disenado tanto para tareas especificas de e-commerce como para capacidades visuales y linguisticas de proposito general.

La relevancia de esta publicacion radica en dos factores. Por un lado, el modelo base declara una ventaja de 6,47 puntos de media sobre Qwen3.5-4B en el conjunto de 28 benchmarks de e-commerce (ocho escenarios) y de 0,40 puntos en los 64 benchmarks de capacidades generales. Por otro, esta variante GPTQ reduce los pesos a 4 bits con activaciones de 16 bits, lo que facilita el despliegue en infraestructura mas modesta sin renunciar por completo a la fidelidad numerica del checkpoint BF16.

El modelo soporta entradas de texto, imagen, multiples imagenes y video, con una ventana de contexto de 262.144 tokens y un modo hibrido de razonamiento (instruct y thinking). Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y esta disponible en formatos BF16, FP8, GPTQ y GGUF dentro de la familia WeMM-Ecom (0.8B, 2B, 4B, 9B y 35B-A3B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia qwen3_5 |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128 valores con cuantizacion simetrica; tambien disponibles BF16, FP8 y GGUF en la familia |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors empaquetados en formato `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B con torre de vision integrada para entradas image-text-to-text, construido sobre la familia arquitectonica qwen3_5. El checkpoint GPTQ mantiene en precision original (sin cuantizar) el codificador de vision, la cabeza de salida y determinadas proyecciones sensibles, mientras que el resto de los pesos se almacena en 4 bits con grupos simetricos de 128 valores. Esta seleccion de precision busca preservar la calidad perceptiva de la vision y la estabilidad de la generacion frente a la compresion agresiva del resto de capas.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se documenta que el modelo base se evaluo sobre 28 benchmarks de e-commerce agrupados en ocho escenarios (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y sobre 64 benchmarks generales en ocho categorias. La innovacion mas destacable es el modo hibrido de razonamiento (instruct y thinking), que permite alternar respuestas directas con cadenas de razonamiento extendidas segun la tarea.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto.
- Comprension de multiples imagenes en una misma peticion.
- Comprension de video como entrada.
- Modo hibrido de razonamiento: instruct (respuesta directa) y thinking (razonamiento extendido).
- Comprension especifica de e-commerce: atributos de producto, moderacion de contenido, OCR, retrieval, grounding y conocimiento de producto.
- Capacidades visuales generales: VQA, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo.
- Seguimiento de instrucciones y tareas centradas en texto.
- Conversacion multi-turno con contexto largo (hasta 262.144 tokens).
- Servicio compatible con la API de OpenAI a traves de vLLM, incluyendo streaming.
- Soporte bilingue chino-ingles.

## Casos de uso

- Moderacion de contenido en marketplaces: el modelo puede clasificar imagenes y textos de anuncios para detectar productos prohibidos o contenido inapropiado, aprovechando sus benchmarks especificos de moderacion y su ventana de contexto amplia para revisar lotes de publicaciones.
- Extraccion de atributos de producto: dado un conjunto de imagenes de un articulo, el modelo puede generar fichas estructuradas con color, material, talla o categoria, reduciendo el trabajo manual de catalogacion en plataformas de e-commerce.
- OCR y digitalizacion de etiquetas: lectura de texto en imagenes de producto, tickets o envases para poblar bases de datos y validar descripciones, apoyandose en las capacidades de OCR evaluadas en el modelo.
- Busqueda y recuperacion multimodal: generacion de representaciones o descripciones enriquecidas de imagenes de producto para alimentar sistemas de retrieval y busqueda visual dentro de un catalogo.
- Atencion al cliente con soporte visual: un agente conversacional puede recibir capturas o fotos del cliente (por ejemplo, un producto defectuoso) y responder en multi-turno con contexto largo, usando el modo instruct para respuestas rapidas y el modo thinking para casos complejos.
- Analisis de resenas con video e imagen: procesamiento de contenido generado por usuarios (fotos y videos de producto) para extraer opiniones, detectar problemas recurrentes y resumir quejas, gracias al soporte de video y multiples imagenes.
- Asistentes internos para equipos de operaciones: consultas sobre politicas de catalogo, normativa de moderacion o conocimiento de producto, con el modelo actuando como base de un asistente RAG sobre documentacion interna.

## Benchmarks y rendimiento

La model card presenta los resultados del checkpoint BF16 (WeMM-Ecom-4B) en forma de graficos e imagenes, sin tablas de valores numericos legibles en el texto proporcionado. Los unicos datos cuantitativos explicitos son las diferencias medias frente a Qwen3.5-4B:

| Comparativa | Diferencia media (escala 0-100) |
|---|---|
| Benchmarks de e-commerce (28 benchmarks, 8 escenarios) | +6,47 puntos frente a Qwen3.5-4B |
| Benchmarks generales (64 benchmarks, 8 categorias) | +0,40 puntos frente a Qwen3.5-4B |

No se han publicado en la informacion disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) ni los resultados especificos del checkpoint GPTQ frente al BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,8 GB en disco con pesos GPTQ W4A16; en ejecucion hay que sumar el codificador de vision, la cabeza de salida y las proyecciones en precision original, ademas de la cache KV para contextos largos. Como referencia orientativa, un contexto de 262.144 tokens exige planificacion cuidadosa de memoria.
- GPU recomendadas: el modelo esta pensado para servicio con vLLM (version >= 0.31.0) usando el backend `compressed-tensors`; son adecuadas GPUs con soporte de kernels de cuantizacion como A100, H100 o L40S. Para el checkpoint BF16 se requiere mas memoria que para esta variante GPTQ.
- GPU de consumo: la cuantizacion W4A16 y la existencia de una variante GGUF de la familia hacen plausible el despliegue en GPUs de consumo con suficiente VRAM, aunque la informacion proporcionada no confirma requisitos minimos exactos ni modelos concretos compatibles.
- Opciones de despliegue: vLLM con backend `compressed-tensors` (recomendado por el autor, con API compatible con OpenAI); llama.cpp u Ollama mediante la variante GGUF de la familia; el formato `compressed-tensors` tambien es compatible con otros motores que lo soporten.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-GPTQ | 4,5B (denso) | 262.144 | Apache 2.0 | Safetensors GPTQ W4A16, BF16, FP8, GGUF | Especializado en e-commerce; +6,47 puntos medios sobre Qwen3.5-4B en benchmarks de e-commerce |
| Qwen3.5-4B | 4B (denso) | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Referencia de comparacion usada por el autor; el modelo lo supera en e-commerce y ligeramente en capacidades generales |
| WeMM-Ecom-9B | 9B (denso) | No disponible en la informacion | Apache 2.0 (familia) | BF16, FP8, GPTQ, GGUF (familia) | Version superior de la misma familia, para escenarios con mas recursos |
| WeMM-Ecom-35B-A3B | 35B totales, 3B activos (MoE) | No disponible en la informacion | Apache 2.0 (familia) | BF16, FP8, GPTQ, GGUF (familia) | Segun el autor, supera a modelos abiertos de cientos de miles de millones de parametros en e-commerce |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento numerico con alternativas externas a la familia.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada; al estar orientado al e-commerce de WeChat, puede heredar sesgos de dominio y de la distribucion de datos de esa plataforma.
- Alucinacion: como modelo generativo multimodal, puede producir descripciones o atributos de producto incorrectos; en produccion conviene validar salidas estructuradas y usar el modo thinking solo cuando el coste de latencia lo permita.
- Contexto: aunque la ventana es de 262.144 tokens, el uso intensivo de contexto largo incrementa la memoria de cache KV y puede degradar la latencia; no se documentan curvas de rendimiento por longitud.
- Cuantizacion: el checkpoint GPTQ puede presentar una ligera perdida de calidad frente al BF16; el autor conserva en precision original el codificador de vision, la cabeza de salida y proyecciones sensibles, pero no se publican comparativas numericas GPTQ frente a BF16 en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas en la model card.
- Produccion: se recomienda vLLM >= 0.31.0 con backend `compressed-tensors`; otros motores pueden requerir conversion de formato. No se publican datos de throughput ni latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ
- Modelo base (BF16): https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-4B-FP8
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF
- Familia WeMM-Ecom 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia WeMM-Ecom 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Familia WeMM-Ecom 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Familia WeMM-Ecom 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Coleccion en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ/blob/main/LICENSE
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
