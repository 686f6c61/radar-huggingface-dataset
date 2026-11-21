# yanauto/Inkling-2-Mini-heretic-GGUF

## Resumen

Inkling-2-Mini-heretic-GGUF es una distribucion en formato GGUF del modelo yanauto/Inkling-2-Mini-heretic, una version "decensored" (abliterated) del Inkling 2 Mini de Thinking Machines. El modelo original es un transformer con arquitectura MoE con bucles (looped MoE), 26.400 millones de parametros totales y 3.400 millones activos por token, con capacidad de procesamiento de texto e imagen. Esta distribucion GGUF la publica el usuario yanauto y esta pensada para ejecucion local con llama.cpp.

El modelo base se ha modificado mediante la tecnica Heretic ARA para eliminar los rechazos ante peticiones que el modelo original denegaria: la tasa de rechazo pasa de 100/100 a 6/100, con una caida de MMLU de 78,7% a 78,0% y una divergencia KL de 0,049 respecto al original. El resultado es un modelo conversacional sin censura, con licencia Apache 2.0, orientado a desarrolladores que necesitan inferencia local de un MoE multimodal de tamano medio.

Esta ficha cubre especificamente la version cuantizada en GGUF, que incluye pesos en Q4_K_M, Q8_0 y BF16, ademas de un proyector de vision separado necesario para entrada de imagenes. El repositorio ocupa 98,3 GB y el modelo requiere una build de llama.cpp con soporte para Inkling 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped MoE (transformer con mezcla de expertos y bucles), multimodal texto e imagen |
| Parametros totales | 26.070.385.152 (~26,1B; el autor indica 26,4B) |
| Parametros activos | ~3,4B |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16; proyector de vision F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo original Inkling 2 Mini emplea una arquitectura MoE con bucles: un transformer donde los expertos se reutilizan en varias pasadas, lo que permite mantener un coste de computo bajo (3,4B parametros activos) con una capacidad total de 26,4B. Incorpora ademas capacidad multimodal de texto e imagen mediante un proyector de vision que se distribuye como archivo aparte (mmproj, 0,64 GB en F16). El modelo "piensa" antes de responder por defecto, igual que el original.

Sobre el entrenamiento del modelo original no se dispone de informacion en los datos proporcionados (numero de tokens, composicion del dataset, uso de RLHF/DPO). La modificacion heretic se aplico con la tecnica Heretic ARA sobre el modelo base, con los siguientes efectos medidos: rechazos de 100/100 a 6/100, MMLU de 78,7% a 78,0% y KL de 0,049. En cuanto a la cuantizacion, los expertos originales estaban en NVFP4/MXFP8, se dequantizaron a BF16 y se recuantizaron; por ello el archivo BF16 es sin perdida respecto al origen y Q8_0 es efectivamente sin perdida. Las cuantizaciones se generaron con una importance matrix (imatrix.gguf, wikitext-2 train, 200 chunks) usando llama.cpp b12600 (commit 29b52d3).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento previo a la respuesta (thinking mode) activado por defecto.
- Procesamiento de imagenes (vision) mediante el proyector mmproj F16.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Respuestas sin rechazo ante peticiones que el modelo original denegaria (6/100 rechazos frente a 100/100).

## Casos de uso

- Inferencia local en estacion de trabajo: con Q4_K_M (17,5 GB) cabe en 24 GB de VRAM o en 32 GB de memoria unificada en un Mac, permitiendo ejecutar un MoE de 26B con solo 3,4B activos por token en hardware de consumo.
- Procesamiento de documentos con imagenes: el mmproj permite pasar capturas, escaneos o diagramas junto al texto para extraccion de informacion o descripcion, en un unico modelo local.
- Asistentes conversacionales sin filtros editoriales: util para investigacion sobre comportamiento de modelos, red teaming y evaluacion de seguridad, dado que la tasa de rechazo se ha reducido a 6/100.
- Generacion de contenido creativo sin restricciones: el modo heretic evita bloqueos en ficcion, guiones o material editorial sensible, manteniendo MMLU casi intacto (78,0% frente a 78,7%).
- Despliegue en pipelines de CI/CD o backend propio: al ser GGUF con licencia Apache 2.0 y servible con llama-server, se puede integrar en servicios internos sin dependencia de APIs externas.
- Prototipado rapido con contexto de 32K: el ejemplo oficial arranca con `-c 32768`, adecuado para conversaciones largas o analisis de documentos extensos en local.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MMLU (modelo original) | 78,7% |
| MMLU (version heretic) | 78,0% |
| Rechazos (original) | 100/100 |
| Rechazos (heretic) | 6/100 |
| Divergencia KL respecto al original | 0,049 |
| Perplejidad wikitext-2, 40 chunks (Q4_K_M) | 6,879 |
| Perplejidad wikitext-2, 40 chunks (Q8_0) | 6,816 |
| Perplejidad wikitext-2, 40 chunks (BF16) | 6,834 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks estandar, ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada: Q4_K_M 17,5 GB (cabe en 24 GB de VRAM); Q8_0 27,8 GB; BF16 52,2 GB. El proyector de vision anade 0,64 GB.
- Memoria unificada: Q4_K_M funciona en Mac con 32 GB y espacio para contexto.
- GPU recomendadas: no especificadas por el autor; por tamano, Q4_K_M encaja en GPUs de 24 GB (por ejemplo RTX 4090) y Q8_0/BF16 requieren GPUs de 32-80 GB (A100, H100) o configuraciones multi-GPU.
- Despliegue: llama.cpp (llama-server) con build que soporte Inkling 2; ejemplo oficial con `--jinja -ngl 99 -c 32768`. Otros motores (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-heretic-GGUF | 26,1B | 3,4B | 32K | 78,0% | Apache 2.0 | GGUF |
| Inkling-2-Mini (original) | 26,4B | 3,4B | no disponible | 78,7% | no disponible | no disponible |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo original del que deriva. No hay informacion en la fuente sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Modelo decensored: responde a peticiones que el original rechaza; el autor declara que el usuario es responsable del uso y del cumplimiento legal y de la politica de uso aceptable del modelo original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo conversacional, persiste el riesgo habitual.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingue.
- Contexto limitado a 32K en la configuracion de referencia; ventanas mayores no estan documentadas.
- Requiere una build especifica de llama.cpp con soporte para Inkling 2; no funciona en versiones genericas.
- La cuantizacion Q4_K_M introduce una perplejidad ligeramente superior (6,879 frente a 6,816 en Q8_0); para maxima fidelidad usar Q8_0 o BF16.
- El repositorio ocupa 98,3 GB, lo que exige espacio de almacenamiento considerable para descargar todas las variantes.
- Sin descargas ni likes en el momento de la ficha: modelo recien publicado, sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Modelo base heretic: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable del original: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
