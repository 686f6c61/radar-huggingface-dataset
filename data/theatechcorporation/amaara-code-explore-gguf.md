# theatechcorporation/amaara-code-explore-GGUF

## Resumen

Amaara Code Explore es un modelo de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) especializado en exploracion de repositorios de codigo, desarrollado por The A-Tech Corporation PTY LTD (Regional QLD, Australia). Su funcion concreta es actuar como agente de exploracion: trabaja sobre un repositorio usando shell y lecturas de ficheros para localizar el codigo relevante ante un bug o una pregunta, y se detiene. No edita ficheros de forma fiable; su tarea es encontrar, no parchear.

Esta ficha cubre la distribucion GGUF del modelo base `theatechcorporation/amaara-code-explore`, publicada para llama.cpp. La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, multimodal, con una torre de vision heredada del modelo base Qwen3.5-VL que no fue afinada por el autor. El modelo fue entrenado con SFT sobre un corpus exclusivamente textual y posteriormente recibio una pasada de re-anclaje de identidad.

La relevancia actual del modelo radica en su enfoque acotado: en lugar de competir como generador de codigo generalista, se posiciona como un componente especializado de recuperacion de contexto para pipelines agenticos, con una ventana de servicio que puede alcanzar los 262.144 tokens (aunque el entrenamiento se realizo a 8.192). La licencia es propietaria (`a-tech-license`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForConditionalGeneration`), con torre de vision |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado a 8.192 tokens; servido hasta 262.144 tokens (con `--parallel 1`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | `a-tech-license` (propietaria, enlazada en el repo) |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |
| Tamano del repo | 46,3 GB |
| Proyector de vision | `mmproj-amaara-code-explore-f16.gguf` (672 MB), obligatorio para entrada de imagen |
| Descargas | 510 |
| Fecha de creacion | 2026-11-18 |
| Fecha de actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que incorpora una torre de vision completa (tensores `model.visual.*`: 297 de 738 tensores, 24 bloques, patch de 16, dimension de proyeccion 2560). El entrenamiento del autor consistio en SFT sobre un corpus exclusivamente textual orientado a exploracion de repositorios, seguido de una pasada de re-anclaje de identidad separada del corpus principal (learning rate 5e-5, 370 filas de chat, 2 epocas). El autor justifica la separacion argumentando que, a aproximadamente el 0,4% de la mezcla de entrenamiento, un bloque de ese tamano se olvidaria si se mezclara con el corpus.

La innovacion tecnica mas destacable no esta en la arquitectura sino en el diseno de la tarea: el modelo esta entrenado para operar con herramientas de shell y lectura de ficheros, localizar el codigo relevante y detenerse. La torre de vision es heredada del base Qwen3.5-VL y no fue afinada por el autor; el corpus SFT es textual, por lo que cualquier capacidad visual medida corresponde al modelo base, no a un resultado de Amaara. No se dispone de informacion sobre el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Exploracion de repositorios: localiza codigo relevante ante un bug o pregunta mediante shell y lecturas de ficheros, y termina la tarea.
- Razonamiento agentico multi-paso: ejecuta episodios con presupuesto de pasos (el benchmark uso 60 pasos) y llama a herramientas de forma secuencial.
- Tool calling / function calling: expone acciones de shell y lectura de ficheros; el JSON de llamadas a herramientas es parte central de su salida.
- Generacion de codigo: capacidad secundaria; el modelo puede modificar ficheros via `sed -i` y redireccion de shell, pero no es un generador de parches fiable.
- Modo thinking: soporta razonamiento extendido, aunque el autor recomienda servirlo con `enable_thinking=False` para las tareas de identidad.
- Vision: acepta entrada de imagen mediante el proyector `mmproj`, con la salvedad de que la calidad visual es la del base Qwen3.5-VL sin afinar.
- Multilingue: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Localizacion de codigo para triaje de bugs: dado un informe de error, el modelo explora el repositorio con shell y lecturas para identificar los ficheros relevantes y devuelve la lista. Es adecuado porque su entrenamiento esta centrado exactamente en esa tarea, con 9/10 de recall en ficheros gold en el benchmark del autor.
- Recuperacion de contexto para agentes mayores: se puede usar como subagente de retrieval que alimenta a un modelo generador de parches con los ficheros correctos, reduciendo el contexto irrelevante. Su ventana de servicio de hasta 262.144 tokens permite manejar repositorios grandes en un solo episodio.
- Analisis de repositorios desconocidos: para incorporarse a un proyecto nuevo, el modelo puede responder preguntas del tipo "donde se define X" o "que modulo gestiona Y" navegando por el arbol de ficheros.
- Automatizacion de preguntas sobre bases de codigo en CI: integrado en un pipeline, puede ejecutarse ante un fallo de test para localizar el codigo implicado antes de invocar a un humano o a un generador de parches.
- Asistencia en revision de codigo: localiza las definiciones y llamadas afectadas por un cambio propuesto, aportando contexto al revisor.
- Exploracion de documentacion tecnica con imagenes: con el proyector `mmproj`, puede procesar capturas de pantalla o diagramas junto con texto, aunque sin garantias de rendimiento visual superior al base.
- Servicio de bajo coste en hardware consumer: con cuantizacion Q4_K_M (2,6 GB) cabe en GPU de consumo, lo que permite desplegar el agente de exploracion en estaciones de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

Los datos publicados corresponden a la build anterior a la correccion de identidad; el autor advierte que el benchmark agentico no se ha re-ejecutado sobre los pesos actuales.

SWE-bench Lite (dev), 10 instancias, contexto de 262.144, presupuesto de 60 pasos, cuantizacion Q8_0:

| Metrica | Resultado |
|---|---|
| Recall de fichero gold | 9 / 10 (90%) |
| Llamadas a herramienta medianas hasta alcanzarlo | 2 |
| Episodios que modificaron un fichero gold | 7 / 10 |
| Episodios enviados | 2 / 10 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,1 GB en F16, 4,3 GB en Q8_0, 3,4 GB en Q6_K, 3,0 GB en Q5_K_M y 2,6 GB en Q4_K_M, mas 672 MB del proyector si se usa vision.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) o superior permite servir Q8_0 con contexto largo. Para contexto de 262.144 tokens se necesita margen adicional de KV cache.
- Cabe en GPU consumer: si, en Q4_K_M y Q5_K_M en tarjetas de 8 GB o mas; Q8_0 requiere aproximadamente 6 GB solo para pesos, mas cache.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `--jinja`, `--mmproj` para vision y tipos de cache `q8_0` para K y V.
- Configuracion recomendada por el autor: `-ngl 99 -c 262144 --parallel 1 -ub 512 -b 1024 --jinja --cache-type-k q8_0 --cache-type-v q8_0`. La opcion `--parallel 1` es obligatoria a contexto largo porque `-c` es un pool compartido: con 4 slots por defecto, 262.144 se reparten en 65.536 por peticion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Cualitativamente, el modelo se situa en la categoria de agentes de codigo de ~4 B parametros con licencia propietaria y distribucion GGUF, lo que lo diferencia de alternativas de codigo abierto del mismo tamano en terminos de licencia y de enfoque (exploracion frente a generacion).

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Amaara Code Explore | 4,3 B | 8.192 entrenamiento / 262.144 servicio | `a-tech-license` (propietaria) | GGUF, safetensors |
| Alternativas de ~4 B para codigo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia `a-tech-license` es propietaria; es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El benchmark agentico se midio sobre la build anterior a la correccion de identidad y no se ha re-ejecutado; los numeros de recall deben tratarse como mediciones previas.
- El dano por cuantizacion por debajo de Q8_0 no esta medido. El JSON de llamadas a herramientas de un agente de codigo es mas fragil bajo cuantizacion agresiva que la salida de chat; hay que medir antes de confiar en Q4_K_M.
- La edicion de ficheros es tosca: el scaffold del eval solo expone `bash`, y el modelo edita mediante `sed -i` y redireccion de shell. No es un generador de parches fiable.
- Problema de terminacion: la generacion no siempre se detiene tras la respuesta y puede continuar con turnos sinteticos. Es un comportamiento preexistente del baseline; se debe configurar una secuencia de parada al servir.
- Con thinking activado, el modelo puede gastar el presupuesto razonando y llegar tarde a la correccion de identidad; se recomienda `enable_thinking=False` o un presupuesto de tokens generoso.
- La torre de vision no fue afinada por el autor; cualquier rendimiento visual corresponde al base Qwen3.5-VL y no se garantiza que supere al modelo original en tareas visuales.
- El modelo fue entrenado a 8.192 tokens aunque se sirve con contextos mucho mayores; el comportamiento mas alla de la ventana de entrenamiento no esta garantizado.
- No se documentan sesgos conocidos ni idiomas soportados; el riesgo de alucinacion en la localizacion de codigo existe y debe validarse en produccion.
- El modelo base declaro originalmente ser Qwen; la build actual corrige la identidad, pero conviene verificar el comportamiento en despliegues propios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/theatechcorporation/amaara-code-explore-GGUF
- Modelo base: https://huggingface.co/theatechcorporation/amaara-code-explore
- Licencia: https://huggingface.co/theatechcorporation/amaara-code-explore-GGUF/blob/main/LICENSE
- Comunidad del autor (Skool): https://www.skool.com/open-source-ai-builders-club/about
