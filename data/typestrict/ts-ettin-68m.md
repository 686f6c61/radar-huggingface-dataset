# typestrict/TS-Ettin-68M

## Resumen

TS-Ettin-68M es un modelo encoder de la familia TS (typestrict) construido sobre el reranker inglés `cross-encoder/ettin-reranker-68m-v1`, un transformer de tipo ModernBERT con 68.415.618 parámetros. No es un modelo generativo: se distribuye con `pipeline_tag: text-classification` y está diseñado para producir "decisiones tipadas" (*typed decisions*), es decir, respuestas estructuradas con una etiqueta, la probabilidad de cada opción y un valor de confianza asociado. Resuelve el problema de convertir texto en decisiones operativas medibles dentro de pipelines de automatización, en lugar de generar prosa libre.

La propuesta del autor se apoya en tres modos de decisión: `choice` (elegir una opción entre varias), `noul` (determinar si un enunciado es verdadero o falso) y `score` (asignar un valor sobre una rúbrica ordenada). Con 68M de parámetros y 8.192 tokens de contexto, el modelo está pensado para volúmenes altos de peticiones en inglés, con ficheros ONNX que permiten inferencia en CPU sin GPU dedicada. El repositorio ocupa 0,4 GB e incluye pesos en safetensors y ONNX bajo licencia Apache-2.0.

Su relevancia ahora es la de un componente barato y desplegable en本地... en entornos sin acelerador: la familia TS aplica la misma receta de entrenamiento y los mismos datos a bases de 17M, 32M, 68M y 150M, de modo que cambiar de tamaño no cambia el contrato de la API. El propio autor advierte que la confianza del modelo aún no está calibrada, por lo que las probabilidades deben usarse con umbrales medidos sobre datos propios antes de automatizar decisiones. A fecha de la información disponible el modelo acumula 0 descargas y 0 likes, y su entrenamiento en typestrict.ai está anunciado como "coming soon".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (etiqueta `modernbert`), base cross-encoder de reranking |
| Parametros totales | 68.415.618 (68M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos ONNX para CPU y está etiquetado como `base_model:quantized`; no se detallan variantes int8/int4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

Otros datos: pipeline `text-classification` con funcionalidad de `feature-extraction`, librería `transformers`, repositorio de 0,4 GB, etiquetas `text-embeddings-inference` y `endpoints_compatible`, región US, creado el 2026-10-19.

## Arquitectura y entrenamiento

La base es el reranker `cross-encoder/ettin-reranker-68m-v1`, un encoder ModernBERT de 68M de parámetros que procesa pares de secuencias de hasta 8.192 tokens y emite una puntuación conjunta. Sobre esa base, typestrict aplica su "receta" común para convertirlo en un modelo de decisión tipada: la salida no es texto generado, sino una distribución de probabilidad sobre las opciones de una decisión (`choice`), sobre dos clases de veracidad (`noul`) o sobre los niveles de una rúbrica ordenada (`score`), acompañada de un valor de confianza. El `config.json` incluye ajustes de identidad para esa confianza, lo que confirma que la calibración está pendiente.

Los detalles cuantitativos del entrenamiento no están disponibles en la información proporcionada: no se indica el número de tokens, la composición del dataset, ni si hubo una fase de ajuste con preferencias (RLHF/DPO). El autor afirma que los pesos se entrenaron únicamente con datos cuya licencia lo permite y que esa lista se publica en la model card, pero el listado no aparece en el extracto disponible. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; al tratarse de un encoder clasificador, esas técnicas no aplican. La evaluación se realiza, según el autor, con una métrica propia denominada *Jev* sobre ejemplos reservados del usuario, y la familia se acompaña de un "Decision Index 0.3" sin métricas desglosadas en la información disponible.

## Capacidades

- Clasificación de texto en modo `choice`: selecciona una opción entre un conjunto arbitrario de alternativas, devolviendo la probabilidad de cada una.
- Verificación de enunciados en modo `noul`: responde si una afirmación es verdadera o falsa dados un contexto y una declaración.
- Puntuación sobre rúbrica en modo `score`: asigna un valor a una escala ordenada, adecuado para evaluación gradual.
- Salida con confianza: cada decisión incluye una probabilidad y un valor de confianza (no calibrado en esta versión).
- Extracción de características: el modelo puede usarse como encoder para generar representaciones (`feature-extraction`).
- Procesamiento de documentos largos: ventana de 8.192 tokens, suficiente para contratos, hilos de correo o artículos completos.
- Inferencia en CPU mediante los ficheros ONNX incluidos, sin requisito de GPU.
- Compatible con `text-embeddings-inference` y con la etiqueta `endpoints_compatible` de HuggingFace.
- Multilingüismo: limitado a inglés; no se declaran otros idiomas.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni modo "thinking"; es un encoder discriminativo, no un LLM.

## Casos de uso

- Triaje de tickets de soporte: con modo `choice`, el modelo clasifica cada incidencia entrante en categorías como facturación, incidencia técnica o cancelación; sus 8.192 tokens permiten incluir el hilo completo de la conversación sin truncar.
- Enrutado en pipelines RAG: dado un par (consulta, fragmento recuperado), el modo `noul` decide si el fragmento responde realmente a la consulta antes de invocar un LLM generativo, reduciendo llamadas caras y alucinaciones.
- Evaluación automática de respuestas de LLM: el modo `score` puntúa salidas sobre una rúbrica ordenada (por ejemplo, corrección de 1 a 5), lo que permite comparar versiones de un prompt o de un modelo con una métrica repetible.
- Moderación y verificación de afirmaciones: comprobar si una frase de un usuario está respaldada por una fuente citada, usando `noul` con la fuente como contexto.
- Etiquetado masivo de datasets: al ejecutarse en CPU vía ONNX, permite clasificar millones de registros en paralelo en clústeres sin GPU, con un coste por ítem muy inferior al de un LLM.
- Clasificación de documentos largos: análisis de contratos o informes de hasta 8.192 tokens para decidir, por ejemplo, si requieren revisión legal o si contienen una cláusula determinada.
- Guardrails en producción: filtro previo que decide si una petición debe pasar a un modelo mayor o rechazarse, aprovechando la latencia baja de un encoder de 68M.
- Generación de señales de confianza para revisión humana: cuando la probabilidad de la opción elegida cae por debajo de un umbral medido, la decisión se deriva a un operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una evaluación contra la métrica interna *Jev* sobre ejemplos reservados del usuario y una puntuación agregada de familia ("Decision Index 0.3"), pero no se incluyen valores numéricos, comparaciones con baselines ni resultados de MMLU, HumanEval, GSM8K u otras suites estándar. Tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,14 GB en fp16 y 0,27 GB en fp32 solo para los pesos; el consumo real depende de las activaciones y crece con la longitud de secuencia hasta 8.192 tokens.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060, RTX 4090 o superior permite lotes grandes, pero el modelo no las necesita. En centros de datos, A100/H100 quedan sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer y en iGPU: con menos de 1 GB de pesos, el cuello de botella es el procesamiento, no la memoria.
- Despliegue: `transformers` en Python, ONNX Runtime para CPU (ficheros ONNX incluidos), Text Embeddings Inference (etiqueta presente) y servicios de inferencia compatibles con los endpoints de HuggingFace. No hay pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia; vLLM no es la vía natural para un encoder de clasificación.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un encoder de 68M sobre secuencias cortas es órdenes de magnitud más rápido que un LLM de miles de millones de parámetros, pero secuencias de 8.192 tokens multiplican el coste de atención.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado en typestrict.ai |
|---|---|---|---|---|---|
| TS-Ettin-68M | 68M | 8.192 tokens | Inglés | Apache-2.0 | Anunciado ("coming soon") |
| TS-Ettin-150M | 150M | no disponible | Inglés | no disponible en la informacion | Anunciado ("coming soon") |
| TS-moBERTo-150M | 150M | no disponible | Inglés y portugués | no disponible en la informacion | Disponible, recomendado |
| TS-Ettin-32M | 32M | no disponible | Inglés | no disponible en la informacion | Anunciado ("coming soon") |
| cross-encoder/ettin-reranker-68m-v1 (base) | 68M | no disponible | Inglés | no disponible en la informacion | No aplica (modelo base) |

Frente al base, TS-Ettin-68M añade el contrato de decisión tipada (`choice`/`noul`/`score`) con probabilidades y confianza, a cambio del mismo coste computacional. Frente a TS-moBERTo-150M, la opción de 68M ofrece menos de la mitad de parámetros y menor huella, pero pierde el soporte de portugués y aún no está disponible para entrenamiento en la plataforma. No se dispone de comparaciones de rendimiento con alternativas de la misma categoría (clasificadores o cross-encoders pequeños como los de la familia MiniLM), por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Confianza no calibrada: el autor lo advierte explícitamente; las probabilidades no deben usarse como umbral de automatización sin medir antes sobre datos propios de retención.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas; el rendimiento fuera del inglés no está documentado.
- Modelo discriminativo, no generativo: no redacta respuestas, no mantiene conversaciones, no hace tool calling ni razonamiento multi-paso. Cualquier expectativa de uso como LLM es incorrecta.
- Sin benchmarks públicos: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta justificar su elección en producción.
- Riesgo de decisión errónea silenciosa: al emitir siempre una etiqueta con una probabilidad, un uso sin umbral ni revisión humana puede propagar clasificaciones incorrectas; el riesgo de alucinación en sentido estricto no aplica, pero sí el de sobreconfianza.
- Truncamiento a 8.192 tokens: documentos más largos requieren segmentación, con la consiguiente pérdida de contexto entre fragmentos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la información; el modelo se publicó y actualizó el mismo día, lo que sugiere escasa verificación externa.
- Licencia: Apache-2.0 permite uso comercial y modificaciones con atribución; conviene revisar el fichero LICENSE del repositorio. El autor afirma que los datos de entrenamiento tienen licencia compatible, pero el listado no está en la información disponible y debería verificarse antes de un despliegue regulado.
- Dependencia del ecosistema del proveedor: el flujo recomendado (entrenamiento propio, métrica Jev) pasa por typestrict.ai, lo que introduce dependencia de un servicio externo si se quiere especializar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/typestrict/TS-Ettin-68M
- Licencia del repositorio: https://huggingface.co/typestrict/TS-Ettin-68M/blob/main/LICENSE
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-68m-v1
- Organización typestrict en HuggingFace: https://huggingface.co/typestrict
- Plataforma de entrenamiento: https://typestrict.ai
- Documentación de modelos base: https://docs.typestrict.ai/base-models
- Documentación de MCP para asistentes: https://docs.typestrict.ai/agents
- CLI: https://github.com/typestrict-lab/cli
- TS-moBERTo-150M (alternativa recomendada por el autor): https://huggingface.co/typestrict/TS-moBERTo-150M
- TS-Ettin-150M: https://huggingface.co/typestrict/TS-Ettin-150M
- TS-Ettin-32M: https://huggingface.co/typestrict/TS-Ettin-32M
- TS-Ettin-17M: https://huggingface.co/typestrict/TS-Ettin-17M
