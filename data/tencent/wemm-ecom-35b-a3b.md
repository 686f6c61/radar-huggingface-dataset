# tencent/WeMM-Ecom-35B-A3B

## Resumen

WeMM-Ecom-35B-A3B es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el ambito del comercio electronico de WeChat. El modelo parte del checkpoint Qwen/Qwen3.5-35B-A3B y se ajusta de forma fina para combinar una comprension detallada de productos, atributos, moderacion y OCR con capacidades generales de vision-lenguaje y razonamiento.

Con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, el modelo ofrece una ventana de contexto de 262.144 tokens, lo que lo situa en la gama alta de modelos multimodales eficientes en computo. Segun la model card, supera a Qwen3.5-35B-A3B en 3,92 puntos y a MiniCPM-V-4.7-35B-A3B en 8,22 puntos en la media de benchmarks de comercio electronico, y mantiene capacidades generales a la par de modelos del mismo tamano.

Su relevancia actual radica en la combinacion de un contexto muy largo, soporte de texto, imagen, multi-imagen y video, y modos de "thinking" e "instruct" conmutables, todo bajo licencia Apache 2.0 y con formatos de cuantizacion listos para despliegue (BF16, FP8, GPTQ y GGUF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (base Qwen3.5-35B-A3B) |
| Parametros totales | 35B |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes FP8, GPTQ y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con arquitectura mixture-of-experts heredada de Qwen3.5-35B-A3B: 35B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste de inferencia frente a un modelo denso equivalente. Procesa entradas de texto, imagen, multi-imagen y video, y ofrece dos modos de generacion: "instruct" (respuesta directa) y "thinking" (razonamiento extendido). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion figura como no disponible en el material proporcionado.

El ajuste fino se orienta a tareas de comercio electronico (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento y conocimiento de producto) sin sacrificar rendimiento general. La evaluacion reportada cubre 28 benchmarks de comercio electronico en ocho escenarios y 64 benchmarks generales en ocho categorias, con puntuaciones en escala 0-100.

## Capacidades

- Generacion de texto y razonamiento multimodal (VQA, STEM, documentos y graficos).
- Comprension de imagenes, multiples imagenes y video como entrada (pipeline image-text-to-text).
- Comprension especifica de comercio electronico: atributos de producto, moderacion de contenido, OCR, retrieval, grounding y conocimiento de producto.
- Modo "thinking" con razonamiento extendido y modo "instruct" para respuestas directas.
- Capacidades multilingues limitadas a chino (zh) e ingles (en).
- Comprension de documentos y graficos, razonamiento espacial, grounding y conteo, seguimiento de instrucciones y tareas centradas en texto.
- No se especifica en la informacion disponible soporte explicito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Catalogacion automatica de productos: extraer atributos (color, talla, material, categoria) a partir de imagenes y descripciones de producto, aprovechando el ajuste especifico en atributos de producto y OCR.
- Moderacion de contenido en marketplace: clasificar imagenes y textos de anuncios para detectar contenido no permitido, usando los benchmarks de moderacion reportados por el autor.
- Busqueda y retrieval multimodal: generar representaciones o descripciones enriquecidas de productos para mejorar la recuperacion por imagen o por texto en un catalogo de comercio electronico.
- Atencion al cliente con contexto largo: gestionar conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas, fotos de producto) gracias a la ventana de 262.144 tokens.
- Analisis de resenas y contenido generado por usuarios: procesar resenas con imagenes o video para extraer quejas, sentimiento y defectos de producto de forma estructurada.
- Verificacion de fichas de producto: comprobar coherencia entre imagen, titulo y especificaciones mediante grounding y razonamiento visual.
- Procesamiento de video de demostracion de producto: resumir o etiquetar videos de uso del producto para enriquecer la ficha o el sistema de recomendacion.

## Benchmarks y rendimiento

La model card reporta comparativas agregadas, pero los resultados detallados se presentan solo como imagenes (tablas en PNG) y no como cifras textuales; por tanto, no se reproducen numeros por benchmark individual.

| Comparativa (media de benchmarks) | Diferencia frente a WeMM-Ecom-35B-A3B |
|---|---|
| Comercio electronico vs. Qwen3.5-35B-A3B | -3,92 puntos |
| Comercio electronico vs. Qwen3.6-35B-A3B | -3,36 puntos |
| Comercio electronico vs. MiniCPM-V-4.7-35B-A3B | -8,22 puntos |
| General vs. Qwen3.5-35B-A3B | -0,17 puntos |
| General vs. MiniCPM-V-4.7-35B-A3B | -5,60 puntos |
| General vs. Valley3-32B | -9,13 puntos |

No se han publicado resultados numericos por benchmark (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 70 GB solo para pesos, mas memoria para KV cache y activaciones; requiere multiples GPU o GPU de 80 GB con paralelismo.
- VRAM estimada en FP8: aproximadamente 35 GB para pesos, viable en una GPU de 48-80 GB.
- VRAM estimada en GPTQ (4 bits): en torno a 18-20 GB para pesos, con margen para contexto y cache.
- VRAM estimada en GGUF (segun cuantizacion, p. ej. Q4): aproximadamente 18-22 GB; las variantes de menor bit permiten acercarse a GPU de consumo de 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; L40S, A6000 o RTX 4090 (24 GB) para cuantizaciones de 4-8 bits con contexto moderado.
- Cabe en GPU de consumo (RTX 4090, 3090) solo en cuantizaciones GGUF/GPTQ de baja precision y con ventanas de contexto reducidas.
- Opciones de despliegue: Transformers (>=5.2.0), endpoints compatibles con OpenAI, y presumiblemente vLLM/llama.cpp segun los formatos publicados; no se detalla configuracion de TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| WeMM-Ecom-35B-A3B | 35B totales / ~3B activos | 262.144 | Apache 2.0 | Ajuste especifico de comercio electronico; multimodal |
| Qwen3.5-35B-A3B | 35B totales / ~3B activos (segun modelo base) | no disponible | no disponible | Modelo base; superado por WeMM-Ecom en benchmarks de e-commerce |
| MiniCPM-V-4.7-35B-A3B | 35B totales / ~3B activos (segun nombre) | no disponible | no disponible | Superado por WeMM-Ecom en e-commerce y general |
| Valley3-32B | 32B | no disponible | no disponible | Superado por WeMM-Ecom en benchmarks generales |

Los datos de contexto y licencia de los modelos comparados no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos: no se documentan evaluaciones de sesgo; al estar ajustado sobre datos de comercio electronico de WeChat, puede heredar sesgos de ese dominio y de la distribucion de productos china.
- Alucinacion: como modelo generativo multimodal, puede producir descripciones o atributos inexistentes; en catalogacion y moderacion conviene validacion humana o reglas de negocio.
- El modo "thinking" incrementa el consumo de tokens y la latencia; la model card recomienda perfiles de muestreo y presupuestos de salida distintos por modo y tarea.
- Los resultados de benchmarks se presentan como imagenes en la model card; no hay cifras textuales verificables por benchmark individual.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.5-35B-A3B.
- El repositorio figura con 0 descargas y 0,0 GB de tamano en el momento de la consulta, lo que sugiere que los pesos pueden no estar completamente disponibles o que el modelo es muy reciente.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Familia: https://huggingface.co/tencent/WeMM-Ecom-0.8B, https://huggingface.co/tencent/WeMM-Ecom-2B, https://huggingface.co/tencent/WeMM-Ecom-4B, https://huggingface.co/tencent/WeMM-Ecom-9B
- Tencent Vision: https://tencentvision.org/
