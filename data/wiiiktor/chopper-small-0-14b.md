# wiiiktor/chopper-small-0.14B

## Resumen

Chopper 0.14B es un modelo de reordenación (reranking) y compresión de contexto desarrollado por el usuario wiiiktor, publicado bajo licencia MIT. Se trata de un cross-encoder construido sobre el modelo base jhu-clsp/mmBERT-small, un encoder multilingüe de pequeño tamaño. El modelo resuelve un problema concreto en pipelines de generación aumentada por recuperación (RAG): tras la fase de recuperación, los pasajes obtenidos suelen contener mucho texto irrelevante que consume ventana de contexto y degrada la precisión del generador.

La innovación principal es que, en una sola pasada forward, el modelo realiza dos tareas simultáneamente: puntúa cada pasaje como un reranker convencional y extrae los "chops", es decir, las oraciones exactas que responden a la pregunta, sin reescribirlas. Según la model card, estos fragmentos suponen típicamente entre el 2 % y el 5 % del texto original, lo que permite una compresión agresiva del contexto manteniendo las citas literales.

Con 0,14 mil millones de parámetros y un tiempo de inferencia declarado de unos 36 ms por pregunta en una RTX 3090 (20 fragmentos, aproximadamente 2.400 tokens), el modelo está orientado a entornos de producción donde la latencia y el coste computacional importan. Su tamaño reducido lo hace desplegable en GPU de consumo, y su licencia MIT elimina restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (mmBERT-small) |
| Parametros totales | 0,14B (140 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (heredado de mmBERT-small; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de jhu-clsp/mmBERT-small, un encoder multilingüe de la familia mmBERT. A diferencia de los bi-encoders que generan embeddings independientes para pregunta y pasaje, un cross-encoder procesa conjuntamente la pregunta y cada pasaje, lo que permite capturar interacciones token a token y produce puntuaciones de relevancia más precisas a costa de mayor coste por par evaluado.

La model card indica que el modelo realiza en una única pasada forward dos tareas: la puntuación de relevancia de cada pasaje (reranking) y la extracción de las oraciones exactas que responden a la pregunta (chops), sin reescritura del texto. El repositorio principal wiiiktor/chopper_mmbert contiene todas las variantes y los resultados completos, mientras que este repositorio empaqueta únicamente los pesos de la variante small para que las leaderboards puedan listarlo por tamaño. El conjunto de datos de demostración asociado es wiiiktor/chopper_demo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reordenación de pasajes (reranking): puntúa cada pasaje recuperado frente a una pregunta y devuelve una lista ordenada de índices con puntuaciones.
- Compresión de contexto: extrae las oraciones exactas ("chops") que responden a la pregunta, típicamente entre el 2 % y el 5 % del texto, sin reescribirlas.
- Procesamiento conjunto de pregunta y pasajes en una sola pasada forward.
- Soporte multilingüe heredado del modelo base mmBERT-small (lista concreta de idiomas no disponible).
- Orientado a pipelines RAG y escenarios multi-hop según las etiquetas del repositorio.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Compresión de contexto en RAG: tras la recuperación de pasajes, el modelo reduce el texto a las oraciones relevantes (2–5 % del original), lo que permite introducir más documentos en la ventana del generador sin superar el límite de tokens.
- Reordenación de resultados de búsqueda: el cross-encoder puntúa los pasajes recuperados por un retriever vectorial o léxico y reordena antes de pasarlos al LLM, mejorando la precisión del contexto final.
- Sistemas de preguntas y respuestas con citas literales: al devolver fragmentos exactos sin reescribir, facilita la trazabilidad y la verificación de fuentes en aplicaciones documentales.
- Atención al cliente sobre base de conocimiento: con latencias declaradas de unos 36 ms por pregunta en RTX 3090, es viable en servicios interactivos que necesitan recuperar y condensar información en tiempo real.
- Búsqueda multi-hop: las etiquetas del modelo indican soporte para escenarios multi-hop, donde la respuesta requiere combinar información de varios pasajes; el modelo puede puntuar y extraer fragmentos de cada uno.
- Despliegue en infraestructura de bajo coste: con 140 millones de parámetros y licencia MIT, puede ejecutarse en GPU de consumo o incluso en CPU para cargas moderadas, sin costes de licencia.
- Filtrado previo en pipelines de generación aumentada: reducir el contexto antes de enviarlo a un LLM grande disminuye el coste por token de entrada y la latencia del generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara un tiempo de inferencia de aproximadamente 36 ms por pregunta en una RTX 3090 con 20 fragmentos (~2.400 tokens), sin métricas de precisión como MMLU, HumanEval, GSM8K ni métricas específicas de reranking (NDCG, MRR).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,3 GB en safetensors; en fp16 serían aproximadamente 0,28 GB de pesos, más overhead de activaciones y del runtime. Cifra exacta de VRAM total no disponible.
- GPU recomendadas: RTX 3090 (referencia declarada por el autor con 36 ms por pregunta), así como cualquier GPU con al menos unos pocos GB de VRAM.
- Cabe en GPU de consumo: sí, por su tamaño de 140 millones de parámetros es desplegable en tarjetas consumer e incluso en CPU para cargas moderadas.
- Opciones de despliegue: el autor proporciona el paquete Python chopper-rag (`pip install chopper-rag`), con API `Chopper.from_pretrained` y métodos `run` y `rerank`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 36 ms por pregunta en RTX 3090 con 20 fragmentos (~2.400 tokens). No se dispone de datos de throughput agregado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros rerankers o cross-encoders (por ejemplo, de la familia BGE, Cohere Rerank o MiniLM), por lo que no es posible establecer una comparativa rigurosa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- No se dispone de datos publicados de benchmarks de precisión, por lo que el rendimiento real en tareas de reranking y extracción no está verificado de forma independiente.
- El modelo devuelve fragmentos literales del texto original; si el pasaje recuperado no contiene la respuesta, la compresión puede eliminar información relevante o devolver fragmentos vacíos o poco útiles.
- La lista concreta de idiomas soportados no está disponible; el soporte multilingüe se infiere del modelo base mmBERT-small, pero no se ha documentado su cobertura real.
- La longitud máxima de contexto no está especificada, lo que impide conocer el límite de tokens por pasaje o por lote de pasajes.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base y del dataset de ajuste, no documentados.
- Aunque la licencia MIT permite uso comercial sin restricciones, el autor no documenta garantías ni soporte para producción.
- El modelo está orientado exclusivamente a ranking y extracción; no genera texto libre, no soporta tool calling ni razonamiento multi-paso como un LLM generativo.

## Enlaces

- Hugging Face: https://huggingface.co/wiiiktor/chopper-small-0.14B
- Repositorio principal con todas las variantes: https://huggingface.co/wiiiktor/chopper_mmbert
- Código, receta de entrenamiento y benchmarks: https://github.com/wiiiktor/chopper_demo
- Dataset de demostración: https://huggingface.co/datasets/wiiiktor/chopper_demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
