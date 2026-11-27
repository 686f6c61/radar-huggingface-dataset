# turintech/Qwen3-VL-4B-Instruct-Artemis-GGUF

## Resumen

Qwen3-VL-4B-Instruct-Artemis-GGUF es una cuantización en formato GGUF del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen, publicada por TurinTech bajo su pipeline de compresión "Artemis". El modelo original es un transformer vision-language de 4.022 millones de parámetros (aproximadamente 4B) que acepta entradas de imagen y texto y genera texto, orientado a tareas de comprensión de documentos, gráficos y texto en escena. Esta versión GGUF está pensada para su ejecución local en `llama.cpp` y servidores compatibles, con un peso de fichero de 2.487,7 MB en cuantización Q4_K_M.

La relevancia de esta ficha radica en que TurinTech no se limita a cuantizar: publica una comparativa controlada frente a las cuantizaciones Q4_K_M de Qwen y Unsloth y frente al BF16 original, con métricas en ChartQA, TextVQA y un proxy de DocVQA. Según esos datos, la versión Artemis Q4_K_M con proyector F16 alcanza 83,59 en ChartQA y 79,69 en TextVQA, ligeramente por encima del BF16 original (83,21 y 79,44) en esos mismos conjuntos de validación, con un tamaño de fichero de menos de un tercio del original (2.487,7 MB frente a 8.051,3 MB).

El modelo requiere un proyector multimodal (`mmproj`) para procesar imágenes y está probado con `llama.cpp` build b12110 o superior. La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial con las condiciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3-VL-4B-Instruct); pesos en formato GGUF para llama.cpp |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (fichero principal); proyector multimodal en Q8_0 (por defecto) o F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo) + GGUF mmproj (proyector) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas image-text-to-text. Esta publicación no entrena el modelo: aplica la compresión Artemis de TurinTech sobre los pesos originales y los serializa en GGUF para inferencia con `llama.cpp`. El repositorio incluye dos artefactos: el fichero de pesos cuantizado en Q4_K_M (`Qwen3-VL-4B-Instruct-Artemis-Q4_K_M.gguf`, 2.487,7 MB) y un proyector multimodal separado (`mmproj-Qwen3VL-4B-Instruct-Q8_0.gguf`), que es el proyector Q8_0 propio de Qwen y la opción por defecto probada.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni los detalles internos del método Artemis más allá de sus resultados medidos. La model card sí documenta el protocolo de evaluación: todas las imágenes se procesaron a 1.024 tokens de imagen (`--image-max-tokens 1024`), con escalado a la baja de imágenes mayores, y se comparó contra BF16, Qwen Q4_K_M, Unsloth Q4_K_M y Unsloth UD-Q4_K_XL. Un detalle técnico relevante es que, con reutilización de prompt activada, la respuesta vía `/v1/chat/completions` difirió de la de `/completion` en 2 de 61 ítems con el proyector Q8_0 y en 1 de 61 con F16; por eso el comando recomendado incluye `--no-cache-prompt`.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y por texto.
- Comprensión de documentos: la model card reporta evaluación en DocVQA (acuerdo con BF16 sobre 786 páginas de test).
- Comprensión de gráficos: evaluación en ChartQA.
- Lectura de texto en escena: evaluación en TextVQA.
- Respuesta a preguntas sobre imágenes con instrucciones de formato corto (el ejemplo de la model card pide respuesta de una sola palabra o frase).
- Conversación multi-turno mediante la API de chat de `llama.cpp` (`/v1/chat/completions`), con turno de sistema.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada (la variante es "Instruct").

## Casos de uso

- Digitalización de documentos escaneados: extraer títulos, campos y respuestas a preguntas concretas sobre páginas, usando el modelo con el proyector y una instrucción de respuesta corta, tal como se documenta en el ejemplo de la model card.
- Análisis de gráficos en informes: responder preguntas sobre valores y tendencias en gráficos de barras o líneas, apoyándose en el rendimiento medido en ChartQA (83,59 con proyector F16).
- Lectura de texto en escena para aplicaciones de accesibilidad: describir o transcribir rótulos y texto presente en fotografías, con la referencia de TextVQA (79,69 con proyector F16).
- Procesamiento por lotes en servidor local: desplegar `llama-server` con `-ngl 99` y `-np 1` para servir peticiones de imagen y texto en una máquina con GPU de consumo, dado el peso de 2.487,7 MB del fichero Q4_K_M.
- Clasificación y extracción de información en pipelines internos: enviar imágenes codificadas en base64 vía `/v1/chat/completions` con `temperature: 0` para obtener respuestas deterministas en tareas de extracción.
- Evaluación comparativa de cuantizaciones: usar los ficheros y el método documentado (1.024 tokens de imagen, proyector F16 o Q8_0) como referencia para validar otras cuantizaciones del mismo modelo base.
- Despliegue en entornos con memoria limitada: sustituir el BF16 original (8.051,3 MB) por el Q4_K_M (2.487,7 MB) cuando el presupuesto de VRAM no permita el modelo completo, aceptando las diferencias documentadas frente a BF16.

## Benchmarks y rendimiento

Datos publicados en la model card. ChartQA y TextVQA son puntuaciones contra sus etiquetas; DocVQA es el acuerdo con las respuestas del BF16 sobre 786 páginas de test (no accuracy, porque las respuestas de test no son públicas). Todos los ficheros, salvo el valor por defecto de TurinTech, se evaluaron con proyector F16.

| Fichero | Tamano | ChartQA | TextVQA | DocVQA (acuerdo con BF16) |
|---|---|---|---|---|
| TurinTech Q4_K_M + proyector Q8_0 (por defecto) | 2487.7 MB | 83.30 | 79.61 | 98.32 |
| TurinTech Q4_K_M + proyector F16 | 2487.7 MB | 83.59 | 79.69 | 98.69 |
| Unsloth Q4_K_M | 2497.3 MB | 83.21 | 78.96 | 98.49 |
| Qwen Q4_K_M | 2497.3 MB | 83.11 | 79.44 | 98.51 |
| Unsloth UD-Q4_K_XL | 2546.3 MB | 83.40 | 78.76 | 98.62 |
| BF16 original | 8051.3 MB | 83.21 | 79.44 | referencia |

La model card reporta además que, con proyector F16, el fichero queda a menos de 2 puntos de BF16 en ChartQA (+0,38 [−0,57, +1,33]) y a menos de 1 punto en TextVQA (+0,26 [−0,37, +0,90]); con el proyector Q8_0 por defecto, las diferencias son +0,09 [−0,66, +0,95] en ChartQA y +0,17 [−0,50, +0,85] en TextVQA. La métrica `kl_vision` (divergencia KL media respecto a BF16 en tokens de respuesta, menor es mejor), medida con proyector F16 sobre 3.346 ítems de gráficos, texto en escena y documentos, fue de −0,011687 [−0,016978, −0,007342] frente a Unsloth Q4_K_M y −0,013554 [−0,017390, −0,010022] frente a Qwen Q4_K_M (aproximadamente un 38 % y un 42 % menor), y −0,003838 [−0,006680, −0,000965] frente a Unsloth UD-Q4_K_XL.

## Requisitos de hardware

- Memoria de GPU con imágenes: 4,46 GiB según la model card para el fichero por defecto.
- Tamaño del fichero de pesos: 2.487,7 MB (Q4_K_M), más el proyector (`mmproj-Qwen3VL-4B-Instruct-Q8_0.gguf`).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, según la cifra de 4,46 GiB de memoria con imágenes; no se especifican modelos concretos de GPU en la información disponible.
- Opciones de despliegue: `llama.cpp` (probado con build b12110; se recomienda esa build o superior), mediante `llama-server` con `-ngl 99 -c 8192 -np 1 -fa on --no-cache-prompt --image-min-tokens 256 --image-max-tokens 1024 --port 8080`. Otros motores (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ChartQA | TextVQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TurinTech Qwen3-VL-4B-Instruct-Artemis Q4_K_M | 4.022.468.096 | no disponible | 83,59 (F16 proj.) / 83,30 (Q8_0 proj.) | 79,69 (F16 proj.) / 79,61 (Q8_0 proj.) | Apache 2.0 | Hugging Face (turintech) |
| Qwen3-VL-4B-Instruct Q4_K_M (Qwen) | 4B (base) | no disponible | 83,11 | 79,44 | Apache 2.0 (heredada) | Hugging Face |
| Qwen3-VL-4B-Instruct Q4_K_M (Unsloth) | 4B (base) | no disponible | 83,21 | 78,96 | Apache 2.0 (heredada) | Hugging Face |
| Qwen3-VL-4B-Instruct UD-Q4_K_XL (Unsloth) | 4B (base) | no disponible | 83,40 | 78,76 | Apache 2.0 (heredada) | Hugging Face |
| Qwen3-VL-4B-Instruct BF16 original | 4.022.468.096 | no disponible | 83,21 | 79,44 | Apache 2.0 | Hugging Face (Qwen) |

Todas las alternativas comparten el mismo modelo base; la comparación mide el efecto de la cuantización y del proyector, no diferencias de arquitectura o entrenamiento.

## Limitaciones y advertencias

- Las métricas publicadas proceden del propio autor de la cuantización; no se han verificado de forma independiente en la información disponible.
- DocVQA se reporta como acuerdo con las respuestas de BF16, no como accuracy: no mide corrección absoluta frente a etiquetas humanas.
- Las imágenes se evalúan a 1.024 tokens de imagen; imágenes mayores se escalan a la baja, lo que puede degradar la lectura de detalles finos.
- Con reutilización de prompt activada se observaron discrepancias entre `/v1/chat/completions` y `/completion` (2 de 61 ítems con proyector Q8_0, 1 de 61 con F16); se recomienda `--no-cache-prompt` en producción.
- El proyector es obligatorio para leer imágenes; sin `mmproj` el modelo no procesa entrada visual.
- Requiere `llama.cpp` build b12110 o superior según el autor; builds anteriores no están validadas.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial con las obligaciones de atribución y aviso de la licencia; conviene revisar la licencia del modelo base enlazada en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Qwen3-VL-4B-Instruct-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/ebb281ec70b05090aa6165b016eac8ec08e71b17/README.md
- Resultados completos, memoria y método: https://huggingface.co/turintech/Qwen3-VL-4B-Instruct-Artemis-GGUF/blob/main/RESULTS.md
- Web de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper referenciado (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
