# TheCacheIsALie/RidgeFill-Projector-Qwen3.5-9B

## Resumen

RidgeFill-Projector-Qwen3.5-9B es un conjunto de mapas ridge (una matriz por capa, en formato safetensors) que implementan la tecnica RidgeFill sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo entrenado ni un fine-tune convencional: son los artefactos de la "reference study" del paper *RidgeFill: Training-Free Late-Layer Cache Fill for Faster Prefill*, de Dylan Johnston y Robert P Smith. Su proposito es acelerar la fase de prefill de la inferencia prediciendo, mediante una proyeccion lineal ajustada en forma cerrada, el estado de entrada de las capas tardias a partir del estado de una capa intermedia, evitando ejecutar esas capas en su totalidad para la mayor parte de las filas del prompt.

El modelo base, Qwen3.5-9B, es un hibrido de capas de atencion y Gated DeltaNet, con 32 capas y una dimension oculta de 4096. RidgeFill explota que, en este tipo de arquitectura, el error de "relleno" se concentra en los valores y en el estado recurrente; por eso los mapas predicen la entrada de cada capa posterior al punto de corte y dejan que las propias proyecciones de clave y valor (y la actualizacion de estado en las capas Gated DeltaNet) se ejecuten sin cambios. Los ultimos miles de tokens del prompt, las filas seleccionadas como exactas y todos los pasos de decodificacion se ejecutan con el modelo completo.

La relevancia es doble: por un lado, demuestra que se puede reducir el coste computacional del prefill sin entrenar nada, solo con un ajuste en forma cerrada sobre texto de calibracion; por otro, publica los artefactos exactos (con hashes SHA256) que usaron las ejecuciones del paper, lo que facilita la reproducibilidad. El repositorio ocupa 2,4 GB y contiene cuatro variantes de profundidad de corte (8, 12, 16 y 20 de 32 capas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas ridge lineales (una matriz bf16 [4096, 4097] por capa) aplicados sobre Qwen3.5-9B, hibrido de atencion y Gated DeltaNet |
| Parametros totales | No disponible para los mapas; el modelo base Qwen3.5-9B tiene 9B (segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los experimentos cubren de 8K a 64K tokens |
| Tipos de cuantizacion | No disponible (los tensores se publican en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un tensor bf16 `layer.L` de forma [4096, 4097] por capa) |

## Arquitectura y entrenamiento

Los artefactos no son un modelo neuronal sino un conjunto de proyecciones lineales. Para cada capa L por encima del punto de corte se publica una matriz bf16 de forma [4096, 4097] (pesos mas bias) que predice la entrada de esa capa a partir del estado de la capa de corte. Las matrices se ajustan una sola vez, en forma cerrada (regresion ridge), sobre 839.652 filas procedentes de 71 documentos de calibracion, con lambda = 0,03. No hay entrenamiento por gradiente ni ajuste fino: es una regresion resuelta analiticamente.

El mecanismo de inferencia es el siguiente: las capas inferiores se ejecutan de forma exacta hasta el split; para cada fila del prompt que no sea exacta, el mapa ridge predice la entrada de cada capa posterior y esa capa escribe su cache a partir de la prediccion, ejecutando sin cambios sus propias proyecciones de clave y valor (y, en capas Gated DeltaNet, su actualizacion de estado). Las ultimas miles de tokens del prompt, las filas seleccionadas como exactas y todos los pasos de decodificacion pasan por el modelo completo. La idea procede de DeepSeek-V4.1-Flash, donde la proyeccion se entrena dentro del modelo; aqui se aplica de forma retrocompatible y sin entrenamiento, siguiendo la linea del proyecto Q3-8B-KVA-Projector de kishida.

Se publican cuatro puntos de corte: 8, 12, 16 y 20 capas de 32 (el split 12 es el primario). Los tamanos de fichero disminuyen a medida que el corte es mas profundo (805 MB, 671 MB, 537 MB y 402 MB respectivamente), porque hay menos capas que rellenar.

## Capacidades

- Aceleracion del prefill: sustituye la ejecucion completa de las capas tardias por una prediccion lineal para la mayor parte de las filas del prompt, manteniendo la decodificacion con el modelo completo.
- Compatibilidad con arquitecturas hibridas: gestiona tanto capas de atencion como capas Gated DeltaNet, incluyendo la actualizacion de estado recurrente.
- Seleccion de filas exactas: permite mantener un subconjunto de filas calculadas de forma exacta (por ejemplo, mediante atencion) para garantizar no inferioridad frente al calculo exacto.
- Ajuste sin entrenamiento: las proyecciones se obtienen en forma cerrada a partir de texto de calibracion, sin RLHF, DPO ni descenso de gradiente.
- Reproducibilidad: se publican hashes SHA256 de cada fichero para distinguir los ajustes definitivos de versiones anteriores.
- No incorpora capacidades generativas propias: no genera texto, no hace tool calling ni razonamiento por si mismo; hereda las capacidades del modelo base Qwen3.5-9B cuando se usa junto a el.
- Idiomas y capacidades multimodales: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de servidores de inferencia con prompts largos: integrado en un motor de serving, el mapa del split 12 permite rellenar la cache de las capas 13 a 32 a partir del estado de la capa 12, reduciendo el coste de prefill en cargas con prompts de miles de tokens (los experimentos cubren de 8K a 64K).
- Investigacion en tecnicas de cache y prefill: sirve como referencia reproducible para comparar estrategias de relleno de cache (RidgeFill frente a identity fill o frente a proyectores entrenados con cabezas de clave y valor).
- Evaluacion de la no inferioridad de aproximaciones: con la seleccion de filas por atencion, el paper reporta 0,0 puntos de diferencia frente al calculo exacto en RULER sobre la region rellenada (split 12), lo que permite usar el artefacto en estudios de calidad de aproximaciones.
- Despliegue en el fork de llama.cpp: el repositorio enlaza un fork `llama.cpp-ridgefill`, pensado para ejecutar el mecanismo en produccion sobre CPU/GPU con el modelo base.
- Reproduccion de resultados academicos: los ficheros con hashes verificables permiten replicar las ejecuciones del paper sin ambiguedad sobre que ajuste se uso.
- Analisis de arquitecturas hibridas: util para estudiar como se propaga el error en modelos con capas Gated DeltaNet, donde el error de relleno afecta a los valores y al estado recurrente y no solo a las claves.
- Prototipado de reduccion de latencia en pipelines RAG: en escenarios con contextos largos recuperados, el ahorro de prefill se traduce directamente en menor tiempo hasta el primer token, manteniendo la decodificacion exacta.

## Benchmarks y rendimiento

Resultados de la reference study del paper, con una cola exacta de 4.096 tokens:

| Medida | Valor |
|---|---|
| RULER en region rellenada, RidgeFill menos identity fill, split 12 (219 muestras, 8K a 64K) | +3,3 puntos [−1,3, +7,8] |
| RULER en region rellenada, RidgeFill con filas seleccionadas por atencion menos exacto, split 12 | 0,0 puntos, cota inferior −1,36 (no inferior a 2 puntos) |
| Perdida en tokens clave, RidgeFill menos identity fill, split 12 | −0,347 nats [−0,523, −0,196] |
| Perdida en tokens nuevos frente a exacto, splits 8 / 12 / 16 / 20 | +0,033 / +0,024 / +0,017 / +0,008 nats |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de velocidad (tokens por segundo) para estos artefactos.

## Requisitos de hardware

- VRAM para los mapas: entre 0,4 y 0,8 GB en bf16 segun el split (402 MB en el split 20, 805 MB en el split 8), adicionales a la memoria necesaria para el modelo base Qwen3.5-9B.
- VRAM para el modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion elegida y del motor de serving.
- GPU recomendadas: no disponibles; el paper no detalla hardware en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de 9B, cabe en GPUs de consumo con cuantizacion, pero el fork de llama.cpp y sus requisitos no se detallan.
- Opciones de despliegue: implementacion de referencia `code/kva` del repositorio de datos y fork `llama.cpp-ridgefill`. El autor indica explicitamente que no se reclama ningun motor de serving para estos ficheros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| RidgeFill-Projector-Qwen3.5-9B | Mapas ridge para prefill | No aplica (artefacto sobre 9B) | No disponible | Relleno de cache sin entrenamiento, ajuste en forma cerrada | Apache 2.0 |
| Q3-8B-KVA-Projector (kishida) | Proyector con cabezas de clave y valor entrenadas | Sobre Qwen3-8B | No disponible | Retrofit entrenado del mecanismo de DeepSeek-V4.1-Flash | No disponible |
| DeepSeek-V4.1-Flash | Modelo con proyeccion integrada | No disponible | No disponible | Proyeccion entrenada dentro del modelo | No disponible |

La comparativa se limita a las alternativas citadas en la model card; no se dispone de datos de rendimiento comparables entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Qwen/Qwen3.5-9B (revision c2022362) y una implementacion compatible; el autor no garantiza funcionamiento en motores de serving genericos.
- Solo cubre la ruta de texto del modelo base; no se menciona soporte para otras modalidades.
- La calidad depende del split y de la cola exacta: los resultados publicados usan una cola exacta de 4.096 tokens y seleccion de filas por atencion para alcanzar la no inferioridad; sin esas condiciones, la perdida en tokens nuevos frente al calculo exacto es de 0,008 a 0,033 nats.
- El paper esta en preparacion y algunos numeros de la nota tecnica anterior quedan reemplazados (ver `SUPERSEDED.md` en el repositorio de datos); conviene citar la version 1.1 de los datos.
- Ficheros con el mismo nombre en otros sitios pueden ser ajustes anteriores; es necesario verificar el SHA256.
- No hay datos publicados sobre sesgos, alucinacion o comportamiento multilingue de estos artefactos; esos riesgos heredan del modelo base.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantias explicitas del autor sobre el rendimiento en produccion.
- Ausencia de benchmarks de velocidad y de calidad en tareas generativas: la evaluacion publicada se centra en RULER y en perdidas de tokens, no en tareas de razonamiento o codigo.

## Enlaces

- HuggingFace: https://huggingface.co/TheCacheIsALie/RidgeFill-Projector-Qwen3.5-9B
- Perfil del autor: https://huggingface.co/TheCacheIsALie
- Repositorio de datos y codigo: https://github.com/Approximate-Science/ridgefill-data
- Fork de llama.cpp: https://github.com/Approximate-Science/llama.cpp-ridgefill
- Nota tecnica archivada: https://doi.org/10.5281/zenodo.23179168
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
