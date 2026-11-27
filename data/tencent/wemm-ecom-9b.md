# tencent/WeMM-Ecom-9B

## Resumen

WeMM-Ecom-9B es un modelo multimodal de tipo image-text-to-text desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el contexto del comercio electronico de WeChat. Forma parte de la familia WeMM-Ecom, que incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B, y se construye como un fine-tuning del modelo base Qwen/Qwen3.5-9B. El modelo combina comprension fina de producto (atributos, moderacion, OCR, retrieval, grounding) con capacidades visuales y de razonamiento de proposito general.

Con 9.409.813.744 parametros totales y una ventana de contexto de 262.144 tokens, WeMM-Ecom-9B se posiciona como una alternativa de tamano medio para tareas de vision-lenguaje en entornos de e-commerce. Segun la model card, supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en la media de benchmarks de e-commerce, y mantiene capacidades generales equiparables a modelos del mismo tamano.

El modelo soporta entradas de texto, imagen, multiples imagenes y video, asi como un modo de pensamiento hibrido (thinking / instruct). Se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial, y ofrece formatos cuantizados BF16, FP8, GPTQ y GGUF para distintos escenarios de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes FP8, GPTQ y GGUF disponibles |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo denso de 9B parametros construido sobre Qwen3.5-9B mediante fine-tuning multimodal. La arquitectura sigue el paradigma image-text-to-text: un codificador visual acoplado a un modelo de lenguaje transformer que procesa conjuntamente tokens de texto e imagen. El checkpoint principal se distribuye en BF16 Safetensors, con variantes cuantizadas en FP8, GPTQ y GGUF.

El entrenamiento se orienta a dos objetivos simultaneos: por un lado, la comprension fina de contenido de e-commerce (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento y conocimiento de producto); por otro, el mantenimiento de capacidades generales de vision-lenguaje. La model card reporta evaluacion sobre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorias. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo soporta modo hibrido de pensamiento (thinking e instruct), lo que sugiere un entrenamiento orientado a razonamiento multi-paso ademas de respuesta directa.

## Capacidades

- Comprension de imagenes y texto combinados (image-text-to-text) con soporte de multiples imagenes y video.
- Comprension fina de producto de e-commerce: atributos, moderacion de contenido, OCR, retrieval, grounding y razonamiento sobre productos.
- Razonamiento multimodal de proposito general: VQA, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo.
- Modo de pensamiento hibrido: alternancia entre modo instruct (respuesta directa) y modo thinking (razonamiento extendido).
- Capacidades multilingues limitadas a chino e ingles.
- Conversacion multi-turno con ventana de contexto de 262.144 tokens.
- Soporte de despliegue mediante Transformers y endpoints compatibles con la API de OpenAI.
- No se especifica en la informacion disponible soporte explicito de tool calling o function calling.

## Casos de uso

- Moderacion de contenido en marketplace: el modelo puede clasificar imagenes y texto de listados de producto para detectar contenido prohibido o de riesgo, apoyandose en sus benchmarks de moderacion y en el modo thinking para casos ambiguos.
- Extraccion de atributos de producto: a partir de imagenes de producto y descripciones, el modelo genera fichas estructuradas con atributos (color, material, talla, categoria) gracias a sus capacidades de OCR y comprension fina.
- Busqueda y retrieval multimodal: generacion de representaciones y descripciones enriquecidas de imagenes de producto para alimentar sistemas de busqueda visual y semantica dentro del catalogo.
- Atencion al cliente automatizada: conversaciones multi-turno sobre productos con contexto largo (262.144 tokens), permitiendo adjuntar historial de compras, imagenes del producto y consultas previas en una sola ventana.
- Verificacion de listados y control de calidad: comparacion entre imagen de producto y descripcion para detectar discrepancias (grounding y razonamiento), reduciendo reclamaciones y devoluciones.
- Analisis de resenas con imagenes: procesamiento de resenas que incluyen fotos de clientes para extraer senales de calidad, defectos o problemas recurrentes mediante VQA y razonamiento.
- Procesamiento de video de producto: analisis de videos demostrativos o unboxings para generar descripciones, resumenes o etiquetas automaticas.
- Asistencia a vendedores: generacion de descripciones de producto y respuestas a preguntas frecuentes a partir de imagenes del articulo, con soporte de chino e ingles.

## Benchmarks y rendimiento

La model card reporta resultados en 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorias), con escala 0-100. Los resultados completos se presentan como imagenes en la model card y no se detallan cifras por benchmark en la informacion disponible. Los datos agregados publicados son:

| Comparativa | Diferencia en media de benchmarks |
|---|---|
| E-commerce: WeMM-Ecom-9B vs Qwen3.5-9B | +5,19 puntos |
| E-commerce: WeMM-Ecom-9B vs Valley3-8B | +10,28 puntos |
| General: WeMM-Ecom-9B vs Qwen3.5-9B | +0,83 puntos |
| General: WeMM-Ecom-9B vs Valley3-8B | +13,02 puntos |

No se han publicado en la informacion disponible cifras desagregadas por benchmark (MMLU, HumanEval, GSM8K u otros) ni resultados absolutos por escenario.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas para contextos cortos y 40-80 GB para contextos largos.
- VRAM estimada en FP8: aproximadamente 9-10 GB para pesos; en GPTQ (4 bits) alrededor de 5-6 GB; en GGUF Q4 en torno a 5-6 GB, segun el nivel de cuantizacion.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en FP8; RTX 3090/4080 (16-24 GB) viables en cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y GPUs con 16 GB o mas usando FP8, GPTQ o GGUF.
- Opciones de despliegue: Transformers (>=5.2.0), endpoints compatibles con la API de OpenAI, y variantes GGUF para llama.cpp/Ollama. No se confirma en la informacion disponible soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-9B | 9,41B (denso) | 262.144 tokens | Multimodal e-commerce + general | Apache 2.0 | Hugging Face (BF16, FP8, GPTQ, GGUF) |
| Qwen3.5-9B | 9B (denso) | No disponible | Vision-lenguaje general | No disponible en la informacion | Hugging Face (modelo base) |
| Valley3-8B | 8B (denso) | No disponible | Vision-lenguaje general | No disponible en la informacion | Hugging Face |

Segun la model card, WeMM-Ecom-9B supera a Qwen3.5-9B en 5,19 puntos (e-commerce) y 0,83 puntos (general), y a Valley3-8B en 10,28 y 13,02 puntos respectivamente. No se dispone de cifras absolutas por benchmark para establecer comparaciones mas detalladas.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado en la informacion disponible.
- Dominio: el fine-tuning esta orientado a e-commerce de WeChat; el sesgo hacia ese dominio puede afectar al rendimiento en otros contextos.
- Alucinacion: como todo modelo generativo multimodal, puede producir descripciones o atributos incorrectos, especialmente en imagenes de baja calidad u OCR ambiguo; se recomienda validacion en produccion.
- Sesgos: no se documentan en la informacion disponible evaluaciones de sesgo; el entrenamiento sobre datos de una plataforma concreta puede introducir sesgos de catalogo y de mercado.
- Contexto: aunque la ventana es de 262.144 tokens, el rendimiento real en contextos muy largos no esta cuantificado en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio para confirmar terminos y atribuciones.
- Despliegue: no se confirma soporte explicito de vLLM o TGI; verificar compatibilidad antes de integrar en pipelines de produccion.
- Tool calling y agentes: no se documenta soporte explicito; no asumir su disponibilidad sin validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Coleccion WeMM-Ecom en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Variante 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Cuantizacion FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Cuantizacion GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Cuantizacion GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
