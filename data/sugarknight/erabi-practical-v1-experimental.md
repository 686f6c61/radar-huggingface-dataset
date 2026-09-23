# sugarknight/erabi-practical-v1-experimental

## Resumen

Erabi Practical V1 (experimental) es un modelo de ranking de opciones (choice-ranking) publicado por el usuario sugarknight sobre la arquitectura GLiClass. Dado un contexto y una pregunta en lenguaje natural, puntua entre 2 y 16 candidatos de texto suministrados por quien lo invoca y devuelve una probabilidad para cada uno, a traves del runtime ERABI. No genera texto libre ni toma decisiones: ordena alternativas. Cuenta con 438.672.897 parametros y se distribuye bajo licencia Apache-2.0.

El modelo parte de knowledgator/gliclass-instruct-large-v1.0 y se ha ajustado en dos fases: una primera epoca sobre 2.414 registros sinteticos de Practical V1 (learning rate maximo 2,5e-6, 151 pasos de optimizador, microbatch 2, acumulacion de gradiente 8, fp16 AMP) y un segundo ajuste exploratorio fechado el 2026-09-23 sobre 175 transformaciones privadas de Exam-QA mezcladas con 175 registros de repeticion deterministas de Practical V1 (learning rate 1,5e-6, 22 pasos, longitud maxima de entrenamiento 1.024 tokens). El soporte linguistico declarado es japones, ingles y chino simplificado.

Su relevancia es acotada y el propio autor la enmarca explicitamente como experimental: es un artefacto de investigacion sin calibracion de temperatura, sin conjunto de prueba verificado por humanos y sin aprobacion formal de publicacion. Las etiquetas proceden de un profesor sintetico (DeepSeek V4.1 Flash via OrcaRouter) y no de anotacion humana, de modo que las cifras de evaluacion miden acuerdo con ese profesor, no correccion en el mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de clasificacion de la familia GLiClass; detalles internos no disponibles |
| Parametros totales | 438.672.897 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento y comprobacion experimental; el runtime publico de ERABI aplica por defecto un contrato fail-closed de 512 tokens |
| Tipos de cuantizacion | FP32 y FP16 en variantes ONNX; se probaron variantes INT8 experimentales pero no se distribuyen porque alteran sustancialmente las predicciones |
| Idiomas soportados | japones (ja), ingles (en), chino simplificado (zh) |
| Licencia | Apache-2.0 para los pesos; el codigo de ERABI tiene licencia MIT independiente |
| Formato de pesos | safetensors (PyTorch) y ONNX (onnx/fp32/model.onnx y onnx/fp16/model.onnx) |
| Tarea (pipeline) | text-classification / choice-classification |
| Modelo base | knowledgator/gliclass-instruct-large-v1.0 |
| Tamano del repositorio | 8,8 GB (incluye los tres formatos de inferencia del mismo checkpoint) |
| SHA256 de model.safetensors | 1ae38ef6c1103f8c021b0d3a974f3b1aedc42d89832d11761e74b95664216251 |
| Descargas / likes | 81 descargas, 0 likes |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna mas alla de que los pesos derivan del modelo GLiClass knowledgator/gliclass-instruct-large-v1.0, con 438.672.897 parametros. Se trata de un modelo de clasificacion por eleccion, no de un modelo generativo: recibe un contexto, una pregunta y un conjunto de 2 a 16 candidatos de texto, y produce una distribucion de probabilidad sobre esos candidatos. El repositorio distribuye tres formatos de inferencia del mismo checkpoint: safetensors para PyTorch, ONNX FP32 para CPU y ONNX FP16 para GPU NVIDIA.

Los datos de Practical V1 son ejemplos sinteticos originales en japones, ingles y chino simplificado, organizados en seis familias de tarea, generados y rejuzgados a ciegas respecto de la respuesta con DeepSeek V4.1 Flash via OrcaRouter. La fuente Exam-QA se filtro y transformo con el mismo modelo DeepSeek: las etiquetas simbolicas de respuesta se mapearon al texto de la opcion de origen, y se descartaron los elementos ambiguos, con multiples respuestas, dependientes de figuras, con credito parcial, incompletos o de mas de 1.024 tokens. Los distractores generados se usaron solo en entrenamiento; la validacion utilizo unicamente las opciones proporcionadas por la fuente. Ni los registros originales de Exam-QA, ni el JSONL transformado, ni las respuestas de la API estan publicados, a la espera de revision humana y de una revision de redistribucion fuente por fuente. El autor declara que las etiquetas siguen siendo acuerdo con un profesor sintetico sin revisar, no oro humano.

## Capacidades

- Ranking de opciones: puntua y ordena entre 2 y 16 candidatos de texto para un contexto y una pregunta en lenguaje natural.
- Salida de probabilidades completas: devuelve la probabilidad de todos los candidatos, no solo del mejor situado.
- Clasificacion zero-shot por etiquetas candidatas: las etiquetas se expresan como textos candidatos en lugar de como clases fijas.
- Multilingue en japones, ingles y chino simplificado.
- Consistencia de orden de candidatos del 97,50% sobre el conjunto Existing RC3 Bridge, es decir, el ranking es mayoritariamente estable ante permutaciones de las opciones.
- Inferencia en CPU mediante ONNX Runtime (FP32) y en GPU NVIDIA mediante CUDA Execution Provider (FP16), ademas de PyTorch con safetensors.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de una sola pasada.
- No dispone de modo de pensamiento, vision, audio ni generacion de texto.
- No hay calibracion de temperatura: las probabilidades devueltas no son garantias de confianza calibrada.

## Casos de uso

- Reranking en pipelines RAG: dado un contexto de consulta y una lista de fragmentos recuperados por un buscador vectorial, el modelo puntua cada fragmento como candidato y permite reordenarlos antes de pasarlos a un generador. La ventana utilizable de 512 tokens por defecto limita el tamano de los fragmentos.
- Clasificacion zero-shot con etiquetas abiertas: en lugar de entrenar un clasificador por taxonomia, se pasan las categorias como candidatos de texto, lo que permite anadir o modificar clases sin reentrenar.
- Seleccion de respuesta en atencion al cliente: con varias respuestas pregeneradas para una consulta de soporte, el modelo elige la mejor candidata como paso previo a la revision de un operador. El propio autor advierte de que no debe usarse en decisiones desatendidas.
- Prefiltrado en sistemas internos de preguntas y respuestas: ordenar respuestas candidatas procedentes de una base documental antes de una validacion humana, en entornos donde el coste de una respuesta erronea lo absorbe el revisor.
- Moderacion y clasificacion de intencion: presentar al modelo un conjunto de etiquetas de politica (por ejemplo, categorias de incidencia) como candidatos y usar el ranking como senal auxiliar dentro de un sistema con supervision.
- Evaluacion comparativa de candidatos generados: comparar traducciones, parafraseos o resumenes alternativos de un mismo texto de entrada, tratando cada version como un candidato y usando el ranking como metrica relativa.
- Deduplicacion y seleccion de variantes: elegir la formulacion mas adecuada entre varias variantes de un mismo mensaje en un catalogo de respuestas predefinidas multilingue (ja, en, zh).
- Anotacion asistida: proponer una opcion preferente sobre datos no etiquetados para acelerar el etiquetado manual posterior, asumiendo que las puntuaciones no estan calibradas.

## Benchmarks y rendimiento

Resultados del primer ajuste sobre Practical V1, comparados con el checkpoint congelado RC3 anterior (datos facilitados por el autor):

| Conjunto | RC3 congelado antes del ajuste | Este checkpoint (Practical V1) |
|---|---:|---:|
| Practical V1 dev, 399 casos | 59,90% | 77,19% |
| Practical V1 eval sintetico retenido, 386 casos | 61,66% | 76,17% |
| Existing RC3 Bridge, 480 casos | 88,75% | 88,54% |

Resultados tras el ajuste exploratorio con Exam-QA (pesos actuales):

| Conjunto | Antes del ajuste Exam-QA | Pesos actuales |
|---|---:|---:|
| Exam-QA privado, solo opciones de origen, 37 casos | 21,62% (8/37) | 24,32% (9/37) |
| Practical V1 dev, 399 casos | 77,19% (308/399) | 78,20% (312/399) |
| Existing RC3 Bridge, 480 casos | 88,54% (425/480) | 88,54% (425/480) |
| Practical V1 eval con acuerdo del profesor, 386 casos | 76,17% (294/386) | 75,65% (292/386) |

Advertencias del autor sobre estas cifras: la inferencia de lectura retrocedio de 54/71 a 50/71 pese a las ganancias agregadas; la mejora en Exam-QA corresponde a un unico elemento adicional correcto y el conjunto de validacion solo tiene nueve grupos de origen, sin auditoria humana independiente; el conjunto de eval de Practical V1 se uso una sola vez tras seleccionar por resultados de dev y del puente existente; las preguntas y etiquetas de Practical V1 proceden de la misma familia de profesor, por lo que las cifras no son una medida de correccion real ni de paridad con Jev. No hay conjunto de prueba final verificado por humanos, ni calibracion de temperatura, ni aprobacion formal de publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia FP32: aproximadamente 1,75 GB solo para los pesos, mas activaciones y memoria del runtime.
- VRAM estimada para inferencia FP16: aproximadamente 0,88 GB solo para los pesos, mas activaciones.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de CUDA Execution Provider; no se especifican modelos concretos en la documentacion. Una RTX 3060 de 12 GB o superior es mas que suficiente por tamano. No se recomienda A100 ni H100 para inferencia, dado el reducido numero de parametros.
- Cabe sin problema en GPU de consumo: si, en gamas desde 8 GB de VRAM en adelante, tanto en FP16 como en FP32.
- Inferencia en CPU: viable con la variante ONNX FP32 y ONNX Runtime (paquete onnxruntime), no con onnxruntime-gpu. No deben instalarse ambos paquetes en el mismo entorno.
- Opciones de despliegue: CLI de ERABI (`pip install erabi`, `erabi predict --request request.json`), PyTorch con safetensors, ONNX Runtime CPU o GPU. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- El parametro `--model-format auto` descarga solo la variante seleccionada: ONNX FP32 para CPU con ONNX Runtime, ONNX FP16 para CUDA y, en su defecto, safetensors de PyTorch.
- Rendimiento verificado: las variantes ONNX FP32 y FP16 exportadas conservaron la opcion mejor situada de PyTorch en 37 de 37 casos de validacion privada de Exam-QA, con entradas de hasta 853 tokens. Las variantes INT8 experimentales cambiaron las predicciones de forma sustancial y no se distribuyen.
- Latencia y throughput: no disponibles. El repositorio ocupa 8,8 GB porque incluye los tres formatos; la primera invocacion descarga la variante elegida y las posteriores usan la cache de Hugging Face.

## Comparativa con modelos similares

La informacion disponible no incluye datos de benchmarks de otras alternativas de la misma categoria, por lo que la comparacion se limita al modelo base y a la revision anterior del propio checkpoint. No se dispone de cifras comparables de otros rerankers o clasificadores zero-shot.

| Modelo | Parametros | Formato de pesos | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| knowledgator/gliclass-instruct-large-v1.0 (base) | 438.672.897 | safetensors (segun el autor) | Apache-2.0 | no disponible |
| erabi-practical-v1-experimental, revision Practical V1 (fijada por ERABI 0.1.2) | 438.672.897 | safetensors, ONNX FP32, ONNX FP16 | Apache-2.0 | Practical V1 dev 77,19%; eval retenido 76,17%; RC3 Bridge 88,54% |
| erabi-practical-v1-experimental, pesos actuales (fijados por ERABI 0.1.3) | 438.672.897 | safetensors, ONNX FP32, ONNX FP16 | Apache-2.0 | Practical V1 dev 78,20%; RC3 Bridge 88,54%; eval con acuerdo del profesor 75,65% |
| Otros clasificadores zero-shot o rerankers de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental y sin calibrar: el autor indica explicitamente que no es un modelo oficial de Jev, ni un razonador general validado, ni un tomador de decisiones automatico.
- Las probabilidades de candidato no son garantias de confianza calibrada; no debe interpretarse el valor numerico como probabilidad de correccion.
- Etiquetas de origen sintetico: proceden de acuerdo con un profesor (DeepSeek V4.1 Flash) sin revision humana, asi que miden concordancia con ese profesor, no exactitud real.
- Riesgo de circularidad en la evaluacion: las preguntas y etiquetas de Practical V1 provienen de la misma familia de profesor que genero los datos de entrenamiento.
- Regresion medida en la tarea de inferencia de lectura: de 54/71 a 50/71, pese a las ganancias agregadas.
- La mejora atribuida a Exam-QA se apoya en un unico elemento adicional correcto sobre 37 casos y nueve grupos de origen, sin auditoria humana.
- Sin conjunto de prueba final verificado por humanos, sin calibracion de temperatura y sin aprobacion formal de publicacion.
- Contrato de longitud restrictivo: el runtime publico de ERABI aplica 512 tokens con comportamiento fail-closed, mientras que el modelo se entreno y comprobo hasta 1.024 tokens; usar la longitud mayor exige modificar tanto el limite del runtime como la longitud de preprocesado y comprobar la entrada sin truncar.
- Las variantes INT8 no se distribuyen porque cambian sustancialmente las predicciones; no deben generarse ni desplegarse sin validacion propia.
- Cobertura linguistica limitada a japones, ingles y chino simplificado; no hay datos sobre el comportamiento en otras lenguas.
- No debe usarse para decisiones de alto riesgo ni desatendidas; el autor recomienda revision humana de las decisiones.
- Adopcion comunitaria muy baja en el momento de la ficha: 81 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- Licencia Apache-2.0 en los pesos y MIT en el codigo de ERABI, lo que permite uso comercial, pero la procedencia sintetica de las etiquetas y la falta de validacion humana deben tenerse en cuenta en cualquier despliegue.
- Los datos de Exam-QA no estan publicados y su redistribucion esta pendiente de revision, lo que limita la reproducibilidad completa de la segunda fase de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugarknight/erabi-practical-v1-experimental
- Modelo base: https://huggingface.co/knowledgator/gliclass-instruct-large-v1.0
- Repositorio de codigo ERABI: https://github.com/sugarkwork/erabi
- Datos de Practical V1: https://github.com/sugarkwork/erabi/tree/main/data/practical_v1
- Script de entrenamiento: https://github.com/sugarkwork/erabi/blob/main/scripts/train_practical_v1.py
- Documentacion del runtime ERABI (seleccion automatica de formato y recomendaciones): https://github.com/sugarkwork/erabi
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
