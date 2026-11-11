# VoightKampffLabs/voi-slop-detect-380M

## Resumen

voi-slop-detect-380M es un modelo encoder de clasificación de texto disenado para estimar que proporcion de un texto en ingles ha sido escrita por un modelo de lenguaje. Lo desarrolla VoightKampffLabs y se presenta como la variante pequena de una familia que incluye tambien voi-slop-detect-4B. A diferencia de los detectores binarios habituales, la salida es un unico valor continuo entre 0 y 1 que se entrena para aproximar la fraccion de palabras modificadas por una IA: 0 para escritura humana intacta, alrededor de 0.3 para un borrador humano pulido por un chatbot y 1 para texto generado desde cero.

El modelo parte de dmis-lab/UltraBERT-380M, un encoder de 377.538.561 parametros, sobre el que se aplica un ajuste fino completo con una cabeza de clasificacion de secuencia de una sola salida y mean pooling. La entrada se trunca a los primeros 512 tokens y los bloques de codigo delimitados se vacian antes de la tokenizacion. Su principal atractivo es el coste: funciona en CPU y distribuye grafos ONNX en fp32, fp16 y cuantizacion de 8 bits, lo que lo hace viable en entornos sin GPU.

La relevancia actual reside en que aborda la deteccion de texto generado como una tarea de regresion graduada en lugar de una decision binaria, con umbrales operativos publicados (0.15, 0.75 y 0.412) y un conjunto de entrenamiento construido a partir de documentos humanos anteriores a 2023 y reescrituras con modelos de OpenAI, Anthropic, Google, DeepSeek, xAI, Qwen y Gemma. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT-380M) con cabeza de clasificacion de secuencia y mean pooling |
| Parametros totales | 377.538.561 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion de la entrada) |
| Tipos de cuantizacion | bf16 safetensors; ONNX fp32, ONNX fp16 y ONNX con pesos de 8 bits (resto fp16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de dmis-lab/UltraBERT-380M mediante ajuste fino completo. Sobre la representacion pooled se anade una cabeza de clasificacion con una unica salida logit, cuya sigmoide produce la puntuacion final. El entrenamiento consistio en 3 epocas con learning rate 8e-6 y batch de 64, optimizando una perdida BCE sobre la puntuacion con pesos balanceados por banda. Los pesos se publican en bf16 safetensors (755 MB) y se acompanan de tres grafos ONNX cuyas desviaciones respecto al modelo PyTorch se midieron sobre 500 textos de validacion de EditLens.

Los datos de entrenamiento suman 484.000 textos construidos a partir de 98.000 documentos humanos escritos antes de 2023, con hasta tres versiones IA por documento y un split 80/10/10 por documento fuente. Las fuentes cubren resenas de Amazon (13.510 documentos), abstracts de arXiv (14.983), comentarios de Hacker News (16.198), posts de Medium (8.725), Reddit (15.699), StackExchange (12.188) y noticias XSum (16.776). Las versiones IA se dividen en tres tipos: espejo (128.262 filas, documento nuevo escrito desde un resumen y palabras clave, objetivo 1), reescritura (123.402 filas, con 8 instrucciones distintas y objetivo igual a la fraccion medida de palabras cambiadas) y round trip (134.411 filas, traduccion a espanol, aleman o ruso y vuelta al ingles). Los generadores incluyen GPT-6 Luna, GPT-6.1 Terra y Sol, Claude Haiku 5.5, Sonnet 5.5 y Opus 5.5, Gemini 3.5 Flash-Lite a 3.8 Flash, DeepSeek Flash, Grok 4.3, Qwen3.8-27B y Gemma 4 31B y 26B-A4B. Se descartan filas cuando el espejo se desvia del tema, la edicion cambia el significado (coseno de embeddings respecto al origen), se modifica menos del 2% de las palabras o el texto tiene menos de 30 palabras de prosa. La longitud mediana es de 116 palabras.

## Capacidades

- Deteccion graduada de texto generado por IA en ingles, con salida continua entre 0 y 1 que aproxima la fraccion de palabras modificadas.
- Clasificacion en tres bandas mediante umbrales publicados: humano por debajo de 0.15, generado por IA a partir de 0.75 y AI-edited en el intervalo intermedio.
- Umbral adicional de flag (0.412) calibrado para que solo el 1% de los textos humanos de validacion se marquen como no humanos.
- Inferencia en CPU gracias a los grafos ONNX, incluida una variante cuantizada de 441 MB.
- Procesamiento por lotes de textos con truncacion a 512 tokens.
- Manejo de textos con bloques de codigo, que deben vaciarse a un par de backticks antes de la inferencia, tal como se hizo en el entrenamiento.
- Sin soporte de tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderacion de contenido en plataformas: puntuar automaticamente publicaciones y comentarios para marcar contenido sospechoso de generacion automatica, usando el umbral de flag (0.412) para limitar los falsos positivos sobre escritura humana al 1% en validacion.
- Verificacion editorial en medios: estimar si un articulo recibido fue escrito desde cero por una IA o solo pulido, aprovechando que la salida continua distingue entre texto generado (cercano a 1) y texto editado (banda intermedia).
- Filtrado de datos para entrenamiento: descartar documentos sinteticos de un corpus antes de usarlos para preentrenar o ajustar otros modelos, con la ventaja de que el detector corre en CPU y puede procesar grandes volumenes sin GPU.
- Analisis de integridad academica: revisar abstracts y textos enviados en ingles para detectar reescrituras con LLM, con la cautela de que el modelo no es una prueba definitiva y debe combinarse con revision humana.
- Monitorizacion de resenas y opiniones: detectar resenas de producto generadas masivamente por modelos, especialmente en dominios como Amazon, que forma parte del conjunto de entrenamiento.
- Auditoria de pipelines de generacion aumentada: comprobar en produccion que las respuestas de un sistema RAG o de resumen no han sido sustituidas por texto puramente generado cuando se esperaba contenido humano.
- Investigacion sobre deteccion: servir como linea base ligera y reproducible (Apache 2.0, pesos abiertos, umbrales documentados) para comparar metodos de deteccion en articulos academicos.

## Benchmarks y rendimiento

La model card incluye una seccion de benchmarks con resultados sobre el split de test reservado (48.041 textos), pero el contenido proporcionado se interrumpe antes de mostrar la tabla de metricas. Los unicos datos numericos disponibles son las desviaciones de los grafos ONNX respecto a los pesos PyTorch, medidas sobre 500 textos de validacion de EditLens:

| Grafo ONNX | Tamano | Pesos | Deriva maxima | Deriva media | Misma banda |
|---|---|---|---|---|---|
| `model.onnx` | 1.5 GB | fp32 | 0.042 | 0.002 | 99.2% |
| `model_fp16.onnx` | 758 MB | fp16 | 0.039 | 0.002 | 99.2% |
| `model_quantized.onnx` | 441 MB | 8 bits (resto fp16) | 0.076 | 0.006 | 98.8% |

No se han publicado en la informacion disponible los resultados de MMLU, HumanEval, GSM8K ni metricas de deteccion comparadas con otros modelos; la model card menciona una tabla de test reservado y comparaciones con otros detectores, pero los valores no se incluyen en el extracto.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los pesos bf16 ocupan aproximadamente 755 MB y el grafo ONNX cuantizado 441 MB, por lo que la memoria necesaria en CPU ronda 1-2 GB incluyendo activaciones.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM sirve para ejecutar la version bf16 o fp16; no se necesita A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier RTX o GTX moderna e incluso en iGPU con suficiente memoria compartida; el caso de uso principal declarado es CPU.
- Opciones de despliegue: transformers (probado con transformers 5.22), onnxruntime con los grafos incluidos; vLLM, llama.cpp, Ollama y TGI no aplican a un encoder de clasificacion de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que se ejecuta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voi-slop-detect-380M | 377,5 M | 512 tokens | Score continuo 0-1 + bandas | Apache 2.0 | Hugging Face, ONNX incluido |
| voi-slop-detect-4B | no disponible | no disponible | Score continuo 0-1 + bandas | no disponible | Hugging Face |
| UltraBERT-380M (base) | 377,5 M | no disponible | Clasificacion de secuencia generica | no disponible | Hugging Face |

El unico comparable directo documentado es voi-slop-detect-4B, el hermano mayor de la misma familia, descrito como mas grande y mas preciso, con umbral de flag propio de 0.385 frente a 0.412 del modelo de 380M. No se dispone de datos de benchmarks que permitan comparar su rendimiento numerico ni de otros detectores de texto IA con especificaciones equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; textos en otros idiomas no estan cubiertos por el entrenamiento.
- La entrada se trunca a los primeros 512 tokens, por lo que textos largos se evaluan solo por su inicio y pueden puntuarse de forma poco fiable.
- El modelo se entreno con documentos humanos anteriores a 2023 y generadores de una generacion concreta; puede degradarse frente a modelos mas recientes o estilos de escritura no representados.
- Riesgo de falsos positivos sobre escritura humana: el umbral de flag se calibro para un 1% de marcado en validacion, pero no es una garantia en dominios fuera de distribucion.
- Riesgo de falsos negativos ante textos muy editados, traducciones o parafraseos que no cambian suficientes palabras.
- No es una prueba definitiva de autoria; la model card lo plantea como un score graduado y su uso en decisiones disciplinarias o legales requiere revision humana.
- Los bloques de codigo deben vaciarse a un par de backticks antes de la inferencia; no hacerlo introduce un sesgo respecto a la distribucion de entrenamiento.
- La cuantizacion ONNX de 8 bits introduce una deriva maxima de 0.076 en la puntuacion y reduce al 98.8% la coincidencia de banda, relevante si se usan umbrales ajustados.
- Los resultados publicados provienen de una sola semilla de entrenamiento y de los pesos PyTorch, sin verificacion independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base UltraBERT-380M por si anaden restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoightKampffLabs/voi-slop-detect-380M
- Modelo hermano de mayor tamano: https://huggingface.co/VoightKampffLabs/voi-slop-detect-4B
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Conjunto de validacion EditLens: no disponible como enlace en la informacion proporcionada
- Paper de APT-Eval: no disponible como enlace en la informacion proporcionada
