# yuhengtu-bytedance/DataDecide-dolma1_7-no-reddit-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

DataDecide-dolma1_7-no-reddit-1B es un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) publicado por el usuario yuhengtu-bytedance en HuggingFace. No es un modelo entrenado desde cero ni un ajuste fino supervisado: es el resultado de una fusion de pesos (weighted average) de cinco checkpoints intermedios del mismo entrenamiento, correspondientes a los pasos 60000, 62500, 65000, 67500 y 69369 de una ejecucion sobre el corpus Dolma 1.7 en su variante "no-reddit". La fusion se realizo con mergekit mediante el metodo Linear (promedio ponderado de pesos), con pesos 1, 2, 3, 4 y 5 normalizados, tomando el checkpoint de paso 69369 como base.

El modelo pertenece a la familia de experimentos denominada DataDecide, orientada a medir el efecto de decisiones sobre datos de preentrenamiento y de tecnicas de agregacion de checkpoints. Su relevancia practica es doble: por un lado, sirve como banco de pruebas reproducible para investigar si promediar checkpoints de un mismo run mejora la estabilidad y la calidad frente al checkpoint final; por otro, al ser un modelo denso de ~1,3B con pesos en bfloat16 y arquitectura Llama, es lo bastante pequeno para ejecutarse en GPU de consumo y para servir como base de ajuste fino en tareas de dominio.

La informacion publicada es muy limitada: la model card describe unicamente el metodo y la configuracion YAML de la fusion, sin detallar el dataset exacto utilizado, el numero de tokens de entrenamiento, la longitud de contexto, los idiomas soportados ni la licencia. El repositorio ocupa 2,6 GB y contiene pesos en safetensors, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (etiqueta `llama` en el repositorio; no se publica `config.json` con el detalle de capas) |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors en bfloat16; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), compatibles con la libreria transformers |
| Metodo de creacion | mergekit, metodo Linear (weighted average), `normalize: true`, `dtype: float32`, `out_dtype: bfloat16` |
| Pesos de la fusion | paso 60000: 1/15 (6,67 %); paso 62500: 2/15 (13,33 %); paso 65000: 3/15 (20 %); paso 67500: 4/15 (26,67 %); paso 69369: 5/15 (33,33 %) |
| Checkpoint base | paso 69369 de `dolma1_7-no-reddit` |
| Tamano del repositorio | 2,6 GB |
| Fecha de creacion (HuggingFace) | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de tipo Llama, segun la etiqueta de arquitectura declarada en el repositorio. No se dispone de informacion publicada sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de normalizacion, activacion ni vocabulario, ya que el autor no incluye la configuracion del modelo en la model card. Tampoco se documenta si se aplicaron tecnicas como atencion con RoPE escalado, GQA o decodificacion especulativa.

El modelo no fue entrenado por el autor de la ficha de HuggingFace: es una agregacion de pesos de cinco checkpoints de un mismo run de preentrenamiento sobre Dolma 1.7 sin la porcion de Reddit. El proceso, ejecutado con mergekit, aplica una interpolacion lineal con normalizacion de pesos, dando mas peso a los checkpoints mas avanzados (el paso 69369 concentra un tercio de la mezcla). La motivacion tecnica habitual de este tipo de operacion, descrita en el articulo de referencia del metodo Linear (model soups, arXiv:2203.05482), es que promediar soluciones cercanas en el espacio de pesos puede mejorar la robustez y reducir la varianza respecto a escoger un unico checkpoint, sin incrementar el coste de inferencia. No se documenta ningun tipo de ajuste posterior con RLHF, DPO o instrucciones: la model card no lo menciona en ningun momento.

No hay informacion sobre el volumen de tokens vistos por cada checkpoint ni sobre la composicion exacta del subconjunto de Dolma 1.7 empleado, mas alla de la exclusion de Reddit que indica el propio nombre del modelo.

## Capacidades

- Generacion de texto autoregresiva: es la tarea declarada en el pipeline (`text-generation`), con comportamiento de modelo base, no de modelo instruido.
- Continuacion y complecion de texto en dominios cubiertos por Dolma 1.7 (texto web, libros, articulos cientificos, codigo y similares, excluyendo Reddit).
- Ajuste fino posterior (fine-tuning) para clasificacion, extraccion de informacion, resumen o generacion condicionada, dado su tamano reducido y su formato estandar de transformers.
- Integracion con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.
- Tool calling / function calling: no disponible; no se documenta ninguna plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se ha aplicado entrenamiento por instrucciones ni reforzado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Investigacion sobre model merging: reproducir y extender el experimento de promediado de checkpoints (Linear / model soups) para medir si la mezcla supera al checkpoint final en perplejidad o en tareas downstream. El modelo es adecuado porque el propio repositorio documenta los pesos exactos y los pasos de origen, lo que hace el experimento trazable.
- Estudio de escalado de datos de preentrenamiento: dado que procede de la familia DataDecide y de Dolma 1.7 "no-reddit", sirve como punto de comparacion controlado para medir el efecto de excluir una fuente concreta del corpus.
- Ajuste fino para dominios verticales: con 1,28B de parametros, es posible reentrenar todas las capas en una unica GPU de 24 GB con precision mixta y tecnicas de ahorro de memoria, para tareas como clasificacion de tickets, extraccion de entidades o resumen de documentos internos.
- Generacion de texto en local o en el borde: los pesos en bfloat16 (unos 2,6 GB) caben en GPUs de consumo con 8 GB o mas, lo que permite prototipar asistentes de escritura o autocompletado sin depender de API externas.
- Generacion de datos sinteticos para destilar o aumentar datasets: al ser un modelo base sin alineamiento, puede emplearse para producir grandes volumenes de texto en tareas de aumento de datos, con revision posterior.
- Servicio de inferencia por lotes de bajo coste: su tamano permite desplegarlo en vLLM o TGI sobre una sola GPU y procesar lotes grandes con throughput alto para tareas de anotacion o normalizacion de texto a escala.
- Baseline en evaluaciones de tecnicas de entrenamiento: util como referencia "promediada" frente a checkpoints individuales en estudios de estabilidad de entrenamiento y seleccion de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad, ni comparaciones con otros modelos. Los resultados de busqueda web obtenidos no guardan ninguna relacion con este modelo (corresponden a listas de reproduccion de peliculas del oeste en YouTube) y no aportan datos tecnicos utilizables.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir del recuento real de parametros (1.279.854.592):
  - bfloat16 / float16: aproximadamente 2,4-2,6 GB.
  - float32: aproximadamente 5,1 GB.
  - int8: aproximadamente 1,3 GB.
  - int4 (si se convierte): aproximadamente 0,7-0,9 GB.
- A la VRAM de pesos hay que sumar la memoria de la cache KV, cuyo tamano depende de la longitud de contexto, numero de capas y cabezas, datos que no se publican; por tanto, la VRAM total necesaria no puede calcularse con precision.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4060 Ti, RTX 4070). Para entrenamiento completo o lotes grandes, RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: si, en bfloat16 en tarjetas de 8 GB o superiores, y en cuantizacion de 4 bits en GPUs de 4-6 GB, siempre que se genere una conversion propia (el repositorio no incluye GGUF).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM y SGLang son compatibles con formatos safetensors de arquitectura Llama, y llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de tamano comparable ampliamente utilizados como base. Los datos de contexto y licencia de las alternativas son los publicos de cada proyecto; los del modelo analizado figuran como no disponibles porque su model card no los declara.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DataDecide-dolma1_7-no-reddit-1B (este modelo) | 1,28B | no disponible | no disponible | HuggingFace, safetensors | Fusion de checkpoints, sin ajuste por instrucciones |
| Llama 3.2 1B | 1,24B | 128k | Licencia comunitaria Llama 3.2 | HuggingFace, variantes GGUF oficiales | Modelo instruido disponible, amplio ecosistema |
| Qwen2.5 1.5B | 1,54B | 32k | Apache 2.0 (segun variante) | HuggingFace, GGUF, multiples cuantizaciones | Buen soporte multilingue y de codigo |
| SmolLM2 1.7B | 1,71B | 8k | Apache 2.0 | HuggingFace, GGUF, ONNX | Orientado a despliegue en dispositivo |
| OLMo 1B (AI2) | 1,18B | 2k (configuracion original) | Apache 2.0 | HuggingFace | Entrenado sobre Dolma, comparable en corpus |

No se dispone de resultados de benchmarks de este modelo que permitan una comparacion de rendimiento con las alternativas listadas.

## Limitaciones y advertencias

- Sesgos conocidos: no hay documentacion al respecto. Al derivar de Dolma 1.7 (corpus web, libros y material cientifico, sin Reddit), es previsible que herede sesgos presentes en esas fuentes, pero no se ha publicado ninguna evaluacion.
- Riesgo de alucinacion: al ser un modelo base sin alineamiento ni ajuste por instrucciones, no esta calibrado para responder con honestidad ni para rechazar peticiones; la generacion de contenido falso o inconsistente es esperable.
- Ausencia de formato de chat: no se publica plantilla de conversacion ni tokens especiales, por lo que usarlo como asistente conversacional requiere construir el prompt o ajustarlo previamente.
- Limitacion de contexto e idioma: ambas variables son desconocidas, lo que impide garantizar el comportamiento en secuencias largas o en idiomas distintos del dominante en el corpus de entrenamiento.
- Restricciones de licencia: la licencia no esta declarada en HuggingFace, lo que impide asumir permisos de uso comercial. Antes de cualquier uso en produccion es necesario contactar con el autor para aclarar los terminos, y hay que tener en cuenta que las condiciones de los checkpoints subyacentes y del corpus Dolma 1.7 podrian imponer restricciones adicionales.
- Trazabilidad limitada: la model card referencia rutas locales del sistema del autor (`/opt/tiger/...`) en lugar de identificadores publicos de los checkpoints fusionados, de modo que no es posible verificar ni descargar las fuentes originales desde HuggingFace.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Sesgo de seleccion de checkpoints: la mezcla solo incluye pasos finales de un unico run; no hay garantia de que el promediado aporte mejoras frente al checkpoint de paso 69369, y no se publica evidencia en ninguna direccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-reddit-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Articulo de referencia del metodo Linear (model soups): https://arxiv.org/abs/2203.05482
- Dataset Dolma 1.7 (origen de los datos de preentrenamiento, segun el nombre del modelo): https://huggingface.co/datasets/allenai/dolma
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las URLs devueltas corresponden a listas de reproduccion de peliculas en YouTube y no guardan relacion con el modelo.
