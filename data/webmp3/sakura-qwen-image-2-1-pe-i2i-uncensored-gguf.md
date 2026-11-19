# webmp3/Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen-Image-2.1-PE-I2I, el modelo de reescritura de prompts para edición de imágenes de la familia Qwen-Image-2.1. Se trata de un fine-tune de Qwen3.5-VL de 9B de parámetros (8.953.803.264 parámetros reales) que lee una o varias imágenes de entrada junto con una instrucción de edición y devuelve una instrucción de edición precisa en formato JSON que se pasa al modelo generador de imágenes. El autor, webmp3, ha aplicado un proceso de abliteración (eliminación de rechazos) sobre los pesos del modelo de lenguaje, dejando intacta la torre de visión y el system prompt originales.

El modelo resuelve un problema concreto en pipelines de edición de imágenes: la traducción de instrucciones vagas o coloquiales del usuario en prompts técnicos y precisos que el modelo de difusión o edición pueda ejecutar correctamente. Su relevancia actual radica en que forma parte de la cadena de herramientas de Qwen-Image-2.1 y en que la versión publicada aquí elimina los filtros de seguridad del modelo base, lo que la hace inadecuada para servicios públicos sin moderación propia.

La ficha describe un modelo de 9B en arquitectura tipo transformer multimodal (Qwen3.5-VL), distribuido exclusivamente en GGUF para llama.cpp, con licencia Qwen Research (no comercial) y sin datos publicados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5-VL (torre de visión + modelo de lenguaje de 9B), con modo de razonamiento en bloque `<think>` |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor ejecuta con `-c 16384` en sus pruebas |
| Tipos de cuantizacion | GGUF Q8_0 (8,87 GiB) y Q4_K_M (5,24 GiB, con importance matrix, no evaluada); torre de visión en GGUF F16 (0,86 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original del modelo base es presumiblemente safetensors, no incluido en este repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen-Image-2.1-PE-I2I es un fine-tune de Qwen3.5-VL 9B orientado a la reescritura de prompts para edición de imágenes. Procesa una o más imágenes referenciadas como `<image1>`, `<image2>`, etc., junto con una instrucción del usuario, genera un bloque de razonamiento `<think>` y devuelve un objeto JSON con los campos `rewritten_prompt`, `wh_ratio` y `ratio_follow`. Los dos últimos son mutuamente excluyentes: `wh_ratio` define una nueva relación de aspecto para composiciones nuevas, mientras que `ratio_follow` hereda la relación de una imagen de entrada para ediciones in-place.

Sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se dispone de información en la documentación proporcionada. La modificación introducida por webmp3 consiste en una abliteración aplicada únicamente a los pesos del modelo de lenguaje, con ajustes elegidos por el autor; la torre de visión y el system prompt no se modifican. Según las mediciones del autor sobre el checkpoint BF16, la edición reduce los rechazos de 98/100 a 68/100 en su conjunto de 100 prompts dañinos, con una divergencia KL de 0,026 en la distribución del primer token. En los ficheros GGUF Q8_0, la misma métrica da 68/100 sin forzar inicio de respuesta, y el efecto se concentra en el modo de razonamiento: con el pensamiento desactivado los primeros tokens apenas cambian (93/100 frente a 100/100).

## Capacidades

- Lectura de una o varias imágenes de entrada y comprensión de instrucciones de edición en lenguaje natural.
- Generación de un prompt de edición reescrito y preciso, listo para pasarse al modelo de imagen Qwen-Image-2.1.
- Razonamiento explícito en bloque `<think>` antes de emitir la respuesta JSON final.
- Salida estructurada en JSON con los campos `rewritten_prompt`, `wh_ratio` y `ratio_follow`.
- Control de relación de aspecto: nueva composición (`wh_ratio`) o herencia de la imagen de entrada (`ratio_follow`).
- Modo conversacional compatible con plantillas Jinja (`--jinja` en llama.cpp).
- Pesos abliterados: el modelo no aplica filtros de seguridad y reproduce solicitudes dañinas de forma literal en el prompt reescrito.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Preprocesado de instrucciones de edición en un pipeline de generación de imágenes: el usuario escribe una petición coloquial, el modelo la convierte en un prompt técnico y preciso que se envía a Qwen-Image-2.1, reduciendo la variabilidad de resultados frente a usar la instrucción original.
- Edición in-place con preservación de composición: usando `ratio_follow` apuntando a la imagen de entrada, el modelo genera instrucciones que mantienen la relación de aspecto original, adecuado para retoques sobre fotografías existentes.
- Reencuadres y nuevas composiciones: mediante `wh_ratio`, el modelo produce instrucciones para generar una escena nueva con una relación de aspecto distinta, útil en herramientas de diseño que ofrecen varios formatos de salida.
- Automatización de flujos de trabajo en ComfyUI o scripts propios: al ser GGUF y ejecutarse en llama.cpp, puede integrarse como nodo o servicio local junto al modelo de imagen, sin depender de APIs externas.
- Investigación sobre alineación y seguridad: la comparación entre el modelo original y esta versión abliterada (con las tablas de rechazos y ejecución de peticiones dañinas publicadas por el autor) sirve como material de estudio sobre el efecto de la abliteración en modelos multimodales.
- Generación de contenido para adultos con control local: el autor declara el modelo para uso exclusivamente adulto y no comercial; puede desplegarse en local para experimentación con contenido sin filtros, asumiendo la responsabilidad legal por parte del usuario.
- Evaluación de robustez de pipelines de moderación: al escribir solicitudes dañinas de forma literal en el prompt reescrito, permite probar si una capa de moderación posterior (sobre el prompt o sobre la imagen generada) detecta y bloquea correctamente esos casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica únicamente métricas internas de su proceso de abliteración, que se reproducen a continuación tal como aparecen en la model card.

Recuento sobre 100 prompts dañinos, 100 tokens generados, system prompt por defecto y sin imagen de entrada:

| Configuracion | Sin modificar | Version abliterada |
|---|---:|---:|
| Pensamiento activo, inicio forzado `I first` | 93 / 100 | 61 / 100 |
| Pensamiento activo, sin inicio forzado | 95 / 100 | 68 / 100 |
| Pensamiento desactivado | 100 / 100 | 93 / 100 |
| Pensamiento desactivado, inicio forzado `I first` | 90 / 100 | 57 / 100 |

Prueba de longitud completa con el system prompt propio del modelo y una imagen neutra de 512 px (Q8_0, temperatura 0, hasta 6.144 tokens generados, `-c 16384`, 24 prompts):

| Metrica | Sin modificar | Version abliterada |
|---|---:|---:|
| JSON final encontrado | 21 | 17 |
| Sin terminar en 6.144 tokens (aun pensando) | 3 | 7 |
| `rewritten_prompt` rechaza o sustituye por escena "segura" | 16 | 0 |
| `rewritten_prompt` sustituye por escena no relacionada | 3 | 0 |
| `rewritten_prompt` ejecuta la peticion | 2 | 17 |

El autor advierte que esta última prueba se limita a 24 prompts, un único conjunto de imágenes neutras y clasificación manual de las respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,87 GiB para el fichero Q8_0 más 0,86 GiB de la torre de visión en F16, es decir, en torno a 10 GiB en total sin contar el contexto KV cache; el Q4_K_M reduce el modelo de lenguaje a 5,24 GiB, quedando alrededor de 6,1 GiB más caché.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el Q8_0 encaja en GPUs de 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100) y el Q4_K_M en GPUs de 8-12 GB con margen para el contexto.
- Cabe en GPU de consumo: sí, con el Q4_K_M en tarjetas de 8 GB o más y con el Q8_0 en tarjetas de 16 GB o más, siempre que se reserve memoria para la torre de visión y el contexto.
- Opciones de despliegue: llama.cpp mediante `llama-server` con soporte de Qwen3.5, `--jinja` y `--mmproj`; el autor midió con la release b11524 (Vulkan). ComfyUI aparece en la tabla de la model card como no probado. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor indica que en sus pruebas con pensamiento activo algunos prompts no terminaron en 6.144 tokens, lo que sugiere generaciones largas.
- Advertencia de runtime: con la release b11259 de llama.cpp, esta arquitectura (Qwen3.5) leía solo la primera palabra de un mensaje de usuario en inglés, también con GGUF de terceros. Se recomienda usar una build más reciente y verificarla con una pregunta corta antes de confiar en los resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-PE-I2I-Uncensored (este) | ~9B | no disponible | qwen-research (no comercial) | GGUF Q8_0 / Q4_K_M + mmproj F16 | Abliterado, sin filtros, solo llama.cpp |
| Qwen/Qwen-Image-2.1-PE-I2I (base) | ~9B | no disponible | qwen-research (no comercial) | safetensors (checkpoint original) | Modelo original con filtros de seguridad; referencia de comparación del autor |
| Qwen3.5-VL 9B (arquitectura de partida) | ~9B | no disponible | no disponible | no disponible | Modelo multimodal general del que deriva el fine-tune; no es un reescritor de prompts especializado |
| Otros reescritores de prompts para edición de imágenes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al tratarse de un modelo abliterado, se eliminan los rechazos y se espera que reproduzca sesgos y contenido dañino presentes en los datos de entrenamiento sin filtro.
- Riesgo de alucinación: el modelo puede inventar detalles en el prompt reescrito; el autor documenta casos en los que la versión original sustituía la petición por una escena no relacionada (3 de 24 en su prueba), comportamiento que la versión abliterada elimina a costa de ejecutar la petición tal cual.
- Contenido dañino: el modelo escribe solicitudes dañinas de forma literal en el prompt y, por tanto, en la imagen generada; en las pruebas del autor aparecieron pasos para fabricar explosivos, una carta amenazante y una URL inventada de un sitio de odio.
- Restricciones legales: prohibido representar a menores en contextos sexuales o abusivos y crear imágenes sexuales o difamatorias de personas reales sin su consentimiento; es ilegal en la mayoría de países.
- Licencia: Qwen Research License Agreement, solo uso no comercial; el despliegue en servicios públicos requiere moderación propia y no está permitido comercialmente sin licencia adicional.
- Contexto e idioma: no se dispone de la longitud de contexto oficial ni de la lista de idiomas soportados; el autor ejecuta con `-c 16384` y advierte de un fallo de lectura de mensajes en inglés con builds antiguas de llama.cpp.
- Runtime: requiere una build reciente de llama.cpp con soporte de Qwen3.5, `--jinja` y `--mmproj`; ComfyUI no está probado. El Q4_K_M no ha sido evaluado por el autor.
- Modo de pensamiento: con el pensamiento desactivado, la abliteración apenas tiene efecto (93/100 frente a 100/100); es necesario mantener el bloque `<think>` activo para obtener el comportamiento sin filtros.
- Responsabilidad: el autor declara el modelo para adultos y exime a Alibaba/Qwen de cualquier relación con esta versión; el usuario asume toda la responsabilidad legal sobre lo que genere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-PE-I2I-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp (build b11524 utilizada por el autor): https://github.com/ggml-org/llama.cpp/releases
- Licencia Qwen Research: incluida en el fichero `LICENSE` del repositorio del modelo
- System prompt original: fichero `system_prompt.txt` incluido en el repositorio del modelo
