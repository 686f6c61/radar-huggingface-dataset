# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-10p-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) obtenido mediante la fusion de cinco checkpoints de un mismo entrenamiento, no mediante un entrenamiento adicional. La fusion se ha realizado con la herramienta mergekit aplicando el metodo Linear (el paper referenciado, arXiv:2203.05482, corresponde a la tecnica de "model soups") sobre los pasos 57500, 60000, 62500, 65000 y 67500 de una ejecucion denominada internamente `falcon-and-cc-qc-10p`, con pesos normalizados de 1, 2, 3, 4 y 5 respectivamente y tomando el paso 67500 como base.

El modelo lo publica el usuario `yuhengtu-bytedance` dentro de la linea de experimentos DataDecide, orientada a estudiar como las decisiones sobre datos de preentrenamiento afectan al rendimiento de modelos de distintas escalas. El nombre del checkpoint sugiere una mezcla de corpus tipo Falcon/RefinedWeb con Common Crawl filtrado, aunque la model card no lo confirma ni aporta detalles sobre el dataset, el tokenizador o el numero de tokens vistos.

Su relevancia es fundamentalmente experimental: se trata de un artefacto de investigacion sin evaluaciones publicadas, sin licencia declarada, sin idiomas declarados y con cero descargas y cero "likes" en el momento de redactar esta ficha. Es util para reproducir experimentos de promediado de pesos entre checkpoints de un mismo run y para estudiar si la fusion de pasos mejora la estabilidad del modelo final, pero no es un modelo listo para produccion ni para uso comercial en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio incluyen `llama`, pero los checkpoints de origen se denominan `falcon-and-cc-qc-10p`; la model card no especifica la arquitectura) |
| Parametros totales | 1.279.854.592 (dato real del repositorio, safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en bfloat16 (el script de fusion usa `out_dtype: bfloat16`). No hay versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`); el repositorio ocupa 2,6 GB, consistente con 1,28B de parametros en bfloat16 (2 bytes por parametro) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de atencion o mecanismo de posicionamiento). Lo unico verificable es el proceso de fusion: se parte de cinco checkpoints intermedios (pasos 57500, 60000, 62500, 65000 y 67500) del mismo entrenamiento, se aplica el metodo Linear de mergekit con `normalize: true` y pesos proporcionales a 1, 2, 3, 4 y 5 (suma 15), y se fija `base_model` en el paso 67500. Siguiendo la convencion de mergekit para el metodo Linear cuando se especifica un modelo base, los pesos se aplican sobre las diferencias de cada checkpoint respecto a esa base, de forma que el resultado se comporta como una media ponderada de los deltas acumulados durante el tramo final del entrenamiento. La fusion se ejecuta en `float32` y se exporta en `bfloat16`.

El patron de pesos crecientes (1, 2, 3, 4, 5) da mas influencia a los checkpoints mas avanzados, lo que en la practica equivale a interpolar hacia el paso 67500 sin descartar por completo la informacion de los pasos anteriores. No se documenta ningun tipo de ajuste posterior: no hay indicios de RLHF, DPO, SFT ni de instrucciones. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del corpus ni el regimen de aprendizaje del run original.

## Capacidades

- Generacion de texto autoregresiva: es un modelo de completado de texto (pipeline `text-generation`), no un modelo de chat ni de instrucciones.
- No hay evidencia de modo "thinking", razonamiento explicito, capacidades de codigo especializadas ni matematicas documentadas.
- Soporte de tool calling / function calling: no disponible y, dado que no es un modelo ajustado por instrucciones, no es esperable.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Capacidades especiales: no disponibles; no hay vision, audio ni multimodalidad declaradas.
- Compatibilidad de despliegue: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que es cargable con TGI y con la libreria `transformers`.

## Casos de uso

- Reproduccion de experimentos de fusion de checkpoints: el repositorio documenta la configuracion YAML exacta, lo que permite replicar el promediado ponderado de los pasos 57500 a 67500 sobre el mismo run y comparar el resultado con cada checkpoint individual.
- Estudio de "model soups" en escalas pequenas: con 1,28B de parametros, se puede ejecutar una bateria de evaluaciones sobre distintas combinaciones de pesos en una sola GPU consumer para medir si el promediado reduce la varianza entre pasos.
- Punto de partida para preentrenamiento continuado: al ser un modelo base sin ajuste por instrucciones, puede servir como inicializacion para entrenamiento adicional sobre un dominio concreto, partiendo de un checkpoint ya promediado en lugar de uno crudo.
- Investigacion sobre decisiones de datos (linea DataDecide): el nombre del run sugiere variantes de mezcla de corpus; este checkpoint permite comparar como afecta la composicion de datos al comportamiento del modelo a escala 1B.
- Destilacion de conocimiento: puede actuar como profesor o alumno en pipelines de destilacion a escalas menores, dado su tamano manejable y su formato estandar de `transformers`.
- Evaluacion de infraestructura de inferencia: sirve como carga de trabajo ligera para medir throughput y latencia de servidores TGI o vLLM, o para validar pipelines de cuantizacion, sin necesidad de GPUs de gama alta.
- Analisis de sesgos y seguridad en corpus web: util para auditar que tipo de contenido reproduce un modelo entrenado sobre mezclas de datos web, siempre que se respete la incertidumbre sobre la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica (MMLU, HumanEval, GSM8K, Perplexity ni similares) y no se ha publicado ninguna evaluacion externa del repositorio.

## Requisitos de hardware

- VRAM para los pesos en bfloat16 o float16: aproximadamente 2,6 GB (coincide con el tamano del repositorio).
- VRAM estimada en int8: en torno a 1,3 GB; en int4: en torno a 0,7 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no valores medidos, y requieren cuantizar el modelo por cuenta propia porque no hay versiones cuantizadas publicadas.
- Hay que sumar el coste de la cache KV, que depende de la longitud de contexto y del lote; al no conocerse la longitud de contexto soportada, no se puede acotar.
- GPU recomendadas: cabe holgadamente en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en tarjetas de 8 GB si se cuantiza. Para servicio con lotes grandes, las opciones habituales son A10G, L4, L40S, A100 o H100.
- Si cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas, y en 6 GB usando cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo safetensors), Text Generation Inference (etiqueta `text-generation-inference`), vLLM y endpoints compatibles con la API de inferencia. Ollama y llama.cpp requeririan una conversion previa a GGUF que no esta publicada.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

La comparacion es orientativa: los datos de la columna de alternativas son informacion publica general y no proceden de la documentacion de este repositorio. No existen benchmarks de este modelo que permitan comparar calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (DataDecide-falcon-and-cc-qc-10p, fusion) | 1,28B | no disponible | no disponible | safetensors en HuggingFace, sin cuantizaciones |
| Falcon-RW-1B | ~1,3B | 2048 tokens (segun documentacion publica de Falcon) | Apache 2.0 (segun documentacion publica) | safetensors, ampliamente distribuido |
| TinyLlama-1.1B | 1,1B | 2048 tokens (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | safetensors y GGUF |
| Llama-3.2-1B | 1,23B | 128k tokens (segun documentacion publica) | Licencia comunitaria de Llama 3.2 | safetensors y GGUF |

Frente a estas alternativas, la diferencia principal no es de rendimiento sino de proposito: este checkpoint es un artefacto de investigacion sobre mezcla de datos y promediado de pesos, mientras que los modelos comparados son publicaciones con licencia explicita, evaluaciones publicadas y soporte de cuantizacion.

## Limitaciones y advertencias

- Ausencia total de licencia: no se puede asumir permiso de uso comercial, redistribution ni uso derivado. Es el principal bloqueo para cualquier despliegue en produccion.
- No es un modelo ajustado por instrucciones: no respondera de forma fiable a prompts conversacionales ni seguira instrucciones; su uso natural es el completado de texto o el ajuste posterior.
- Riesgo de alucinacion elevado y no caracterizado: al no existir evaluaciones, se desconoce su tasa de error factual, y un modelo de 1,28B entrenado sobre corpus web tiende a generar contenido plausible pero incorrecto.
- Sesgos desconocidos: no hay analisis de sesgos, toxicidad ni seguridad. El nombre del run (`qc`) sugiere algun tipo de filtrado de calidad, pero no se documenta.
- Idiomas y contexto sin especificar: se desconoce si soporta castellano o cualquier otra lengua distinta del ingles, y se desconoce la ventana de contexto maxima utilizable.
- Trazabilidad limitada: la model card apunta a rutas locales del entorno de entrenamiento (`/opt/tiger/...`) en lugar de a identificadores publicos, por lo que no se pueden inspeccionar los checkpoints originales.
- Repositorio sin actividad: cero descargas, cero "likes" y sin historial de mantenimiento; no hay garantia de soporte ni de correccion de errores.
- Al ser una fusion lineal, no hay garantia de que el resultado sea superior a cualquiera de los checkpoints individuales; el promediado de pesos puede degradar el rendimiento si los checkpoints son muy dispares.
- El uso de `float32` en la fusion y `bfloat16` en la salida implica que puede haber perdido precision respecto a los checkpoints originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-10p-1B-57500_60000_62500_65000_67500_weightedavg_merge
- Paper del metodo de fusion referenciado en las etiquetas (Model Soups): https://arxiv.org/abs/2203.05482
- Herramienta mergekit empleada para la fusion: https://github.com/cg123/mergekit
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft ajenas al tema.
