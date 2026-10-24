# VERIGEN/q-realign-GGUF

## Resumen

Q-ReAlign GGUF es la conversión a formato GGUF del modelo `q-future/Q-ReAlign-Lite-4B`, un juez multimodal de calidad de imagen desarrollado por el grupo Q-Future. No es un modelo conversacional: es un VLM de 4.841.450.496 parámetros (≈4,84 B) construido sobre un Qwen3.5-VL y afinado con el método Q-Align para puntuar la estética o la calidad técnica de una imagen en una escala de 0 a 1. La puntuación no se obtiene generando texto libre, sino leyendo los logprobs de los cinco niveles discretos (*excellent*, *good*, *fair*, *poor*, *bad*) y calculando el valor esperado.

La relevancia de esta conversión es práctica: permite ejecutar el juez en llama.cpp sin depender de transformers ni de un checkpoint en bf16, con un peso de 5,2 GB en Q8_0 más un proyector visual de 0,67 GB en F16. El autor del repo (VERIGEN) reporta una verificación sobre 20 imágenes comparando contra el código de referencia en transformers bf16, con correlación de Pearson 1,000 y una diferencia máxima de puntuación de 0,006.

Se trata de una conversión de terceros con 0 descargas y 0 likes en el momento de la consulta: el crédito del modelo corresponde a Q-Future y este repositorio solo cambia el formato de los ficheros. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3.5-VL) afinado como juez Q-Align; detalles de capas y dimensión oculta no disponibles |
| Parámetros totales | 4.841.450.496 (≈4,84 B), dato de safetensors del checkpoint base |
| Parámetros activos | No disponible (no se documenta variante MoE) |
| Longitud de contexto | No disponible; el ejemplo de servicio de llama.cpp usa `--ctx-size 4096` |
| Tipos de cuantización | Q8_0 (modelo de texto) y F16 (proyector mmproj) en este repo; no se publican cuantizaciones menores |
| Idiomas soportados | No disponible (la model card no los detalla; los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 + mmproj F16); el checkpoint original está en safetensors/bf16 |
| Tamaño del repo | 5,8 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura de partida es un Qwen3.5-VL, es decir, un transformer multimodal con un codificador visual y un proyector que inyecta las características de imagen en el espacio de tokens del modelo de lenguaje. Sobre esa base, Q-Future aplica el método Q-Align, que reformula la evaluación de calidad de imagen como una tarea de respuesta discreta con cinco niveles lingüísticos, en lugar de una regresión continua. El resultado es un modelo que, dado un prompt de valoración y una imagen, concentra su distribución de probabilidad en esas cinco palabras.

El detalle de los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la información proporcionada. La model card de esta conversión remite explícitamente a la model card original para el método, los benchmarks y la cita. En el plano técnico, la conversión se realizó con `convert_hf_to_gguf.py` de la build 11541 de llama.cpp (`f2918cabb`), con `--outtype q8_0` para el texto y `--mmproj --outtype f16` para el proyector, conservando el `lm_head` no atado como `output.weight` independiente.

Un detalle relevante para quien audite la conversión: el `tokenizer_config.json` del checkpoint declara `tokenizer_class: TokenizersBackend`, un nombre de transformers 5 que el conversor no puede cargar, por lo que el modelo de texto se convirtió desde una copia que declara `Qwen2TokenizerFast`. Los datos del tokenizador (`tokenizer.json`) no se modificaron.

## Capacidades

- Evaluación de estética de imagen: devuelve una puntuación de 0 a 1 mediante el valor esperado sobre los cinco niveles, con el prompt "How would you rate the aesthetics of this image?" y prefill "The aesthetics of the image is".
- Evaluación de calidad técnica: misma mecánica con el prompt "How would you rate the quality of this image?" y prefill "The quality of the image is".
- Procesamiento image-text-to-text: acepta imágenes y texto en el mismo turno, con unas 1040 tokens de prompt para una imagen de 1 MP.
- Modo determinista para scoring: `temperature 0` y `max_tokens 1`, leyendo `top_logprobs`.
- Desactivación del modo razonamiento: `chat_template_kwargs: {"enable_thinking": false}` en la API, o `--reasoning off` en llama-server.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no soportado; el modelo no es conversacional.
- Capacidades multilingües: no documentadas.
- Capacidades especiales: integración con el endpoint compatible con OpenAI de llama-server (`/v1/chat/completions`) con soporte de `logprobs` y `top_logprobs`.

## Casos de uso

- Curaduría y filtrado de datasets de imágenes: pasar cada imagen por el prompt de estética, calcular la puntuación esperada a partir de los logprobs de los cinco niveles y descartar las que caigan por debajo de un umbral. Es adecuado porque el coste por imagen es acotado (unas 1040 tokens de prompt por MP) y el resultado es reproducible con temperatura 0.
- Ranking de candidatos en generación de imágenes: generar N imágenes por prompt en un pipeline de difusión y ordenarlas combinando la puntuación de estética y la de calidad técnica, para quedarse con las mejores antes de publicarlas o mostrarlas al usuario.
- Control de calidad en plataformas de contenido generado por usuarios: detectar fotos borrosas, con ruido o mal recortadas. La verificación del autor muestra que las copias degradadas puntúan entre 0,02 y 0,22 frente a 0,78–0,99 de los originales, lo que da un margen amplio para fijar umbrales.
- Monitorización de pipelines de compresión o transcodificación: puntuar la imagen antes y después de cada etapa para cuantificar la pérdida de calidad técnica introducida por el codec o el escalado.
- Selección automática de miniaturas y portadas en un CMS: evaluar los distintos recortes de una misma fotografía y elegir el que maximiza la puntuación estética.
- Evaluación de modelos de restauración, upscaling o eliminación de ruido: usar la diferencia de puntuación entre entrada y salida como métrica automática de ganancia de calidad, complementaria a PSNR o SSIM.
- Pre-filtro para anotación humana: descartar automáticamente el tramo de imágenes claramente malas y reservar el etiquetado manual para la zona ambigua de la escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye cifras de MMLU, HumanEval, GSM8K ni de los conjuntos habituales de IQA (KonIQ-10k, SPAQ, AVA), y remite a la model card del checkpoint original para consultarlos.

Lo que sí se documenta es una verificación de reproducibilidad frente al código de referencia en transformers bf16:

| Prueba | Resultado |
|---|---|
| Imágenes evaluadas | 20 fondos de pantalla (4K, HD, 640 px) más copias con recorte, desenfoque y ruido |
| Prompts evaluados | Estética y calidad técnica |
| Correlación de Pearson con la referencia | 1,000 |
| Diferencia máxima de puntuación | 0,006 |
| Tokens de prompt | Idénticos a la referencia en todos los casos |
| Niveles en el top-20 de logprobs | Los cinco niveles aparecen siempre |
| Imágenes degradadas | 0,02–0,22 |
| Imágenes originales | 0,78–0,99 |

Se trata de una comprobación de equivalencia con el checkpoint original, no de una validación contra juicios humanos.

## Requisitos de hardware

- Pesos en disco y en memoria: 5,2 GB (Q8_0) más 0,67 GB del proyector F16, es decir, unos 5,9 GB solo de pesos.
- VRAM estimada para inferencia: alrededor de 7–8 GB con contexto de 4096 y caché KV en q8_0 con flash attention. Es una estimación a partir del tamaño de los ficheros, no un dato publicado.
- GPU consumer: cabe con holgura en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB el margen es muy justo y exige reducir contexto.
- GPU de datacenter: L4 (24 GB), A10, A100 y H100 lo ejecutan sobradamente; no necesitan su capacidad de cómputo para un modelo de este tamaño.
- CPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp, pero no hay datos de latencia publicados. El repositorio de Q-Future indica que la variante de 0,8B de la familia es ejecutable en CPU con menos de 4 GB de memoria.
- Despliegue verificado: llama-server de llama.cpp con `-ngl 99 --ctx-size 4096 --reasoning off` y `--mmproj` apuntando al proyector F16. Otros runners GGUF con soporte de mmproj (Ollama, LM Studio) no están verificados en esta ficha y necesitan soportar prefill del turno del asistente y `top_logprobs` para el cálculo de la puntuación.
- Throughput y latencia: no disponibles. Como referencia de coste, una imagen de 1 MP consume unas 1040 tokens de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| Q-ReAlign-Lite-4B GGUF (esta ficha) | ≈4,84 B | No disponible (ejemplo con 4096) | Juez de estética y calidad técnica | Apache 2.0 | GGUF Q8_0 + mmproj F16 |
| Q-ReAlign-Lite-4B original | ≈4,84 B | No disponible | Juez de estética y calidad técnica | Apache 2.0 | safetensors bf16 |
| Q-ReAlign (variante 0,8B de la familia) | ≈0,8 B | No disponible | Juez de estética y calidad técnica | No disponible en la información consultada | No disponible |
| Q-Align (ICML 2024) | No disponible | No disponible | IQA, IAA y VQA en un solo modelo; afinable a datasets | No disponible en la información consultada | No disponible |

Según el repositorio de Q-Future, la familia Q-ReAlign alcanza un rendimiento de nivel Q-Align con un 50 % menos de parámetros, y la variante de 0,8B funciona con menos de 4 GB de VRAM e incluso en CPU. No se dispone de cifras de benchmark que permitan cuantificar esa comparación.

## Limitaciones y advertencias

- No es un modelo conversacional. Cualquier uso como chatbot o asistente general producirá salidas sin garantía; el modelo está diseñado para una única tarea de puntuación.
- La puntuación tiene solo cinco niveles discretos. El valor esperado suaviza la escala, pero la resolución real es gruesa y no equivale a una regresión continua.
- Sensibilidad al preprocesado: no se debe pasar `--image-min-tokens`, porque reescala imágenes pequeñas y desvía las puntuaciones de la referencia. Para máxima concordancia, enviar imágenes de hasta 1 MP con ambos lados múltiplos de 32 px (patch 16 × merge 2) y en PNG, para que el servidor no las redimensione.
- Dependencia de infraestructura: el cálculo requiere prefill del turno del asistente y acceso a `top_logprobs` con al menos 20 candidatos. Endpoints que no expongan logprobs o que reescriban el historial de mensajes no sirven para este flujo.
- El modo razonamiento debe estar desactivado; si se activa, la distribución de logprobs deja de ser comparable con la referencia.
- Idiomas no documentados: los prompts de ejemplo están en inglés y no hay información sobre el comportamiento con prompts en castellano.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo estético por etnia, género, cultura o tipo de contenido, algo crítico si el modelo se usa para moderar o rankear imágenes de personas.
- Riesgo de alucinación: bajo en el sentido de que no genera texto libre, pero el modelo puede asignar puntuaciones altas a imágenes que no ha procesado correctamente si el pipeline de imagen falla silenciosamente.
- Licencia: Apache 2.0 permite uso comercial con conservación del aviso de licencia. No obstante, la licencia del checkpoint base (Qwen3.5-VL) no se detalla en la información disponible y conviene verificarla antes de un despliegue en producción.
- Conversión de terceros: el repo pertenece a VERIGEN, no a Q-Future, y tiene 0 descargas. La conversión del tokenizador requirió una copia con `tokenizer_class: Qwen2TokenizerFast`; aunque `tokenizer.json` no cambió, es un punto a auditar en entornos regulados.
- Solo se publica Q8_0: no hay cuantizaciones Q4 o Q5 que reduzcan el consumo por debajo de los ~6 GB de pesos.
- Advertencia de nombre: existe un trabajo distinto llamado también "Q-realign" (arXiv 2601.08089) sobre recuperación de alineamiento de seguridad durante la cuantización. No tiene relación con este modelo; no confundir las referencias.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/VERIGEN/q-realign-GGUF
- Checkpoint original: https://huggingface.co/q-future/Q-ReAlign-Lite-4B
- Repositorio GitHub de Q-ReAlign: https://github.com/Q-Future/Q-ReAlign
- Repositorio GitHub de Q-Align (ICML 2024): https://github.com/Q-Future/Q-Align
- Colección Q-ReAlign en HuggingFace: https://huggingface.co/collections/q-future/q-realign
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper homónimo sin relación con este modelo: https://arxiv.org/abs/2601.08089
