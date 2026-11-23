# tencent/WeMM-Ecom-9B

## Resumen

WeMM-Ecom-9B es un modelo multimodal denso de 9B parámetros desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el ambito del comercio electronico de WeChat. Forma parte de la familia WeMM-Ecom, que incluye variantes de 0.8B, 2B, 4B, 9B y 35B-A3B (esta ultima con arquitectura MoE), y se construye como un fine-tuning del modelo base Qwen/Qwen3.5-9B. El modelo acepta entradas de texto, imagen, multiples imagenes y video, y su proposito es combinar comprension fina de producto (atributos, moderacion, OCR, grounding, recuperacion) con capacidades generales de vision-lenguaje y razonamiento.

El modelo destaca por su soporte de "thinking hibrido": puede operar en modo instruct (respuesta directa) o en modo thinking (razonamiento explicito antes de responder). Segun la model card, supera a Qwen3.5-9B en 5,19 puntos y a Valley3-8B en 10,28 puntos en el promedio de benchmarks de comercio electronico, y mantiene capacidades generales superiores a su modelo base (0,83 puntos por encima). La ventana de contexto es de 262.144 tokens, lo que permite procesar conversaciones largas, catalogos extensos o multiples imagenes en una sola peticion.

Es relevante ahora porque aborda un nicho poco cubierto por los modelos multimodales generalistas: la comprension de producto y contenido comercial con precision. Al publicarse bajo licencia Apache 2.0 y con pesos en BF16, FP8, GPTQ y GGUF, es desplegable tanto en infraestructura de servidor como en hardware de consumo, y su compatibilidad con endpoints OpenAI facilita su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variantes FP8, GPTQ y GGUF publicadas por separado |

## Arquitectura y entrenamiento

WeMM-Ecom-9B es un modelo denso de 9B parámetros construido sobre Qwen/Qwen3.5-9B mediante fine-tuning multimodal. Incorpora un codificador visual que permite procesar imagenes individuales, multiples imagenes y video, ademas de texto. La arquitectura subyacente es un transformer con atencion completa y una ventana de contexto de 262.144 tokens, lo que habilita entradas de muy larga duracion (catalogos, conversaciones multi-turno extensas, secuencias de video). El checkpoint publicado esta en BF16 safetensors, con versiones cuantizadas en FP8, GPTQ y GGUF disponibles en repositorios separados.

La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, pero indica que el modelo se evalua en 28 benchmarks de comercio electronico repartidos en ocho escenarios (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y en 64 benchmarks generales repartidos en ocho categorias (VQA general, documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto). No se especifica en la informacion disponible si se aplico RLHF, DPO u otra etapa de alineacion, ni si se empleo decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto y razonamiento multimodal: responde a preguntas sobre imagenes, multiples imagenes y video, ademas de texto puro.
- Modo thinking hibrido: puede alternar entre modo instruct (respuesta directa) y modo thinking (razonamiento explicito paso a paso antes de la respuesta final).
- Comprension de producto de comercio electronico: identificacion de atributos, categorias, materiales, tallas, colores y otras propiedades de producto a partir de imagenes y texto.
- OCR y extraccion de texto en imagenes: lectura de etiquetas, embalajes, documentacion y capturas.
- Moderacion de contenido: deteccion de contenido inapropiado o fraudulento en listados y conversaciones comerciales.
- Grounding visual y conteo: localizacion de objetos y conteo en imagenes.
- Retrieval multimodal: busqueda y emparejamiento entre texto e imagenes de producto.
- Comprension de documentos y graficos: interpretacion de tablas, diagramas y documentos escaneados.
- Razonamiento STEM y comprension espacial.
- Seguimiento de instrucciones complejas en entornos multimodales.
- Capacidades multilingues limitadas a chino e ingles.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el modo thinking facilita cadenas de razonamiento, pero no se documenta explicitamente un framework de agentes.

## Casos de uso

- Catalogacion automatica de productos: el modelo puede recibir imagenes de producto y generar descripciones estructuradas con atributos (categoria, color, material, talla) gracias a su comprension fina de e-commerce y su ventana de 262.144 tokens para procesar lotes grandes en una sola peticion.
- Moderacion de listados y conversaciones comerciales: clasificacion de contenido inapropiado, fraudulento o de riesgo en imagenes y texto, apoyandose en los benchmarks de moderacion del modelo y en su capacidad de OCR para detectar texto en embalajes o capturas.
- Extraccion de datos de documentos y etiquetas: lectura de facturas, albaranes, etiquetas de envio y embalajes mediante OCR y comprension de documentos, util para automatizar la entrada de datos en sistemas de gestion de pedidos.
- Busqueda visual de producto (retrieval multimodal): dado un texto o una imagen de referencia, el modelo puede emparejar y describir productos candidatos, aprovechando su entrenamiento en retrieval y grounding.
- Asistencia al vendedor en conversaciones multi-turno: gestion de dialogos largos con contexto de catalogo e historial de conversacion, gracias a la ventana de 262.144 tokens y al modo instruct para respuestas directas.
- Analisis de video de producto: procesamiento de video para extraer caracteristicas, detectar defectos o describir demostraciones de uso, aprovechando el soporte de entrada de video.
- Generacion de fichas y resenas de producto: redaccion de descripciones y resenas a partir de imagenes y especificaciones, con el modo thinking para razonamiento sobre atributos y comparaciones.
- Control de calidad visual en almacen: verificacion de que el producto embalado coincide con el pedido mediante comparacion de imagenes y grounding visual.

## Benchmarks y rendimiento

La model card reporta resultados agregados en escala 0-100, pero las tablas completas se presentan como imagenes (assets/ecommerce-benchmarks.png, general-benchmarks.png y tablas instruct/thinking) que no estan disponibles como texto en la informacion proporcionada. Los unicos datos numericos citados son las diferencias medias frente a modelos comparables:

| Comparacion | Diferencia en promedio (e-commerce) | Diferencia en promedio (general) |
|---|---|---|
| WeMM-Ecom-9B vs Qwen3.5-9B | +5,19 puntos | +0,83 puntos |
| WeMM-Ecom-9B vs Valley3-8B | +10,28 puntos | +13,02 puntos |

No se han publicado en la informacion disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K, etc.). La evaluacion cubre 28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorias, en modos instruct y thinking.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos (hasta 262.144 tokens).
- VRAM estimada en FP8: aproximadamente 9,4 GB para pesos; util en GPUs de 16-24 GB con contexto moderado.
- VRAM estimada en GPTQ (4 bits): aproximadamente 5-6 GB para pesos; permite ejecucion en GPUs de consumo de 8-12 GB con contexto limitado.
- VRAM estimada en GGUF (segun cuantizacion, Q4-Q8): aproximadamente 5-10 GB; apto para llama.cpp y Ollama en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 y contextos largos; L40S o RTX 6000 Ada para FP8; RTX 4090 (24 GB) para FP8 o GPTQ con contexto moderado; RTX 3090/4080 para GPTQ o GGUF.
- Cabe en GPU de consumo: si, en cuantizaciones GPTQ o GGUF (RTX 3060 12 GB en adelante con contexto reducido).
- Opciones de despliegue: Transformers (>=5.2.0) con accelerate y torch; endpoints compatibles con OpenAI (segun la model card); llama.cpp/Ollama mediante GGUF; vLLM y TGI no confirmados explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-9B | 9,4B denso | 262.144 | Apache 2.0 | Multimodal e-commerce + general, thinking hibrido | Hugging Face (BF16, FP8, GPTQ, GGUF) |
| Qwen3.5-9B | 9B denso | no disponible | no disponible | Multimodal generalista (modelo base) | Hugging Face |
| Valley3-8B | 8B denso | no disponible | no disponible | Multimodal generalista | Hugging Face |
| WeMM-Ecom-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 | Multimodal e-commerce, gama alta de la familia | Hugging Face |

Segun la model card, WeMM-Ecom-9B supera a Qwen3.5-9B y Valley3-8B tanto en e-commerce como en capacidades generales, y la variante 35B-A3B de la familia supera a modelos abiertos de cientos de miles de millones de parametros en e-commerce. No se dispone de datos de benchmarks absolutos para una comparacion mas detallada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; no se garantiza rendimiento en castellano ni en otros idiomas.
- Sesgos: al estar entrenado sobre datos de comercio electronico de WeChat, puede heredar sesgos culturales y comerciales del mercado chino; no se documentan mitigaciones especificas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar atributos de producto, precios o detalles de imagenes; en produccion conviene validar contra fuentes estructuradas.
- Contexto largo: aunque soporta 262.144 tokens, el rendimiento real en contextos extremos puede degradarse y el coste de memoria crece con la longitud.
- Modo thinking: consume mas tokens de salida y aumenta la latencia; debe reservarse para tareas que requieran razonamiento.
- Tool calling y agentes: no confirmados en la informacion disponible; verificar antes de disenar pipelines agenticos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las licencias del modelo base Qwen3.5-9B.
- Madurez: el repositorio tiene muy pocas descargas e interacciones (0 descargas, 1 like en el momento de la consulta), por lo que la comunidad y el soporte son limitados.
- Despliegue: las versiones cuantizadas se publican en repositorios separados; hay que verificar compatibilidad de Transformers >=5.2.0 y de las herramientas de serving.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-9B
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Variante 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Version FP8: https://huggingface.co/tencent/WeMM-Ecom-9B-FP8
- Version GPTQ: https://huggingface.co/tencent/WeMM-Ecom-9B-GPTQ
- Version GGUF: https://huggingface.co/tencent/WeMM-Ecom-9B-GGUF
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-9B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de Tencent: https://www.tencent.com/
- Wikipedia de Tencent: https://en.m.wikipedia.org/wiki/Tencent
