# T-K-C/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es, segun la model card del repositorio, la version oficial de DeepSeek-V4-Pro que sustituye a la version preliminar (Preview). Se presenta como una revision centrada en capacidades agenticas y en mejoras de rendimiento especialmente visibles en entornos de produccion. Sobre la estructura del modelo Preview se anade un modulo de decodificacion especulativa denominado DSpark.

El repositorio de HuggingFace analizado esta publicado por el usuario T-K-C, no por la organizacion oficial deepseek-ai, aunque la model card incluye ejemplos de codigo que invocan el identificador `deepseek-ai/DeepSeek-V4-Pro-0813`. El modelo cuenta con 1.650.497.936.906 parametros totales (aproximadamente 1,65 billones) segun los metadatos de safetensors, y el repositorio ocupa 892,8 GB. Se distribuye bajo licencia MIT y libreria transformers.

La relevancia de esta ficha esta acotada por la informacion disponible: el repositorio registra 0 descargas y 0 "likes", no declara idiomas soportados, no publica la longitud de contexto ni el numero de parametros activos, y la busqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo (los resultados obtenidos corresponden a zonas administrativas de Qatar y no guardan relacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de los parametros de despliegue del modelo (`--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`); el autor no detalla la arquitectura en la model card |
| Parametros totales | 1.650.497.936.906 (aproximadamente 1,65 billones), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (etiqueta `fp8` y `kv-cache-dtype fp8` en el ejemplo de vLLM); cache de indexador en FP4 (`use_fp4_indexer_cache: true`); etiqueta `8-bit`. No se menciona GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna ni el proceso de entrenamiento. Los unicos elementos tecnicos explicitos son la existencia de una estructura de mezcla de expertos (los comandos de despliegue incluyen `--enable-expert-parallel` y `--moe-backend deep_gemm_mega_moe`) y la incorporacion de un modulo de decodificacion especulativa llamado DSpark sobre la estructura del modelo Preview. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacada es DSpark, un mecanismo de decodificacion especulativa que se activa en vLLM con `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'` y en SGLang con `--speculative-algorithm DSPARK`. El modelo tambien expone un parametro `reasoning_effort` con tres niveles (`low`, `high`, `max`) que controla la cantidad de deliberacion antes de responder, y no incluye plantilla de chat en formato Jinja: en su lugar se distribuye una carpeta `encoding` con scripts Python para convertir mensajes en formato compatible con OpenAI a cadenas de entrada y para parsear la salida.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`).
- Capacidades agenticas reforzadas respecto a la version Preview, con mejoras declaradas en tareas de terminal, automatizacion y uso de herramientas.
- Uso de herramientas y function calling: la model card reporta resultados en Toolathlon-Verified y AutomationBench, benchmarks orientados a invocacion de herramientas y automatizacion.
- Razonamiento multi-paso y ejecucion de tareas largas: resultados en Agents' Last Exam y Terminal Bench 2.1.
- Generacion de codigo y desarrollo full-stack: benchmarks NL2Repo, DeepSWE, DSBench-FullStack y DSBench-Hard.
- Ciberseguridad ofensiva/defensiva evaluada mediante Cybergym.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).
- Vision, audio u otras modalidades: no disponible.
- Soporte de decodificacion especulativa DSpark para acelerar la inferencia.

## Casos de uso

- Agentes de desarrollo de software autonomos: el modelo obtiene 87,9 en Terminal Bench 2.1 y 61,5 en NL2Repo, por lo que esta orientado a tareas de creacion de repositorios, edicion de codigo y ejecucion de comandos en terminal dentro de un bucle agentico.
- Desarrollo full-stack asistido: con 71,1 en DSBench-FullStack y 67,2 en DSBench-Hard, encaja en flujos que generan y modifican aplicaciones completas a partir de especificaciones en lenguaje natural.
- Integracion en pipelines de CI/CD: su soporte de tool calling (74,1 en Toolathlon-Verified) permite conectarlo a sistemas de build, ejecucion de tests y apertura de pull requests.
- Automatizacion de procesos empresariales: con 31,8 en AutomationBench (Public), puede emplearse para orquestar tareas repetitivas en herramientas corporativas mediante llamadas a funciones.
- Analisis de seguridad y respuesta a incidentes: el resultado de 83,3 en Cybergym sugiere utilidad en tareas de analisis de vulnerabilidades y entornos de ciberseguridad.
- Razonamiento complejo con apoyo de herramientas externas: 60,0 en HLE con herramientas frente a 42,7 sin ellas, lo que indica que el modelo se beneficia de la integracion con buscadores, ejecutores de codigo u otras fuentes.
- Asistencia conversacional de largo alcance: no se puede dimensionar sin la longitud de contexto, que no esta publicada.
- Despliegue en produccion con decodificacion especulativa: el flag DSpark permite reducir la latencia de generacion en vLLM y SGLang sin cambiar los pesos.

## Benchmarks y rendimiento

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas de la model card: las tareas de agente de codigo se evaluaron con el modo minimal de DeepSeek Harness como framework de agente, con `reasoning_effort = max` y `temperature = 1.0, top_p = 0.95`. DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del recuento de parametros, en FP8 (1 byte por parametro) el modelo requeriria del orden de 1,65 TB; en BF16 (2 bytes) unos 3,3 TB. El repositorio ocupa 892,8 GB, una cifra inferior a esas estimaciones, lo que no queda explicado en la informacion disponible.
- GPU recomendadas: la model card incluye un ejemplo de despliegue con vLLM sobre un nodo unico de 4xGB300. No se detallan otras configuraciones, aunque la receta de vLLM enlazada menciona "otras configuraciones de hardware".
- GPU de consumo: no cabe en ninguna GPU de consumo. El tamano del modelo excede ampliamente la VRAM de una RTX 4090 o similar.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), vLLM y SGLang. No se menciona soporte para llama.cpp, Ollama, TGI ni GGUF.
- Configuracion de vLLM indicada: `--trust-remote-code --kv-cache-dtype fp8 --block-size 256 --data-parallel-size 4 --enable-expert-parallel --moe-backend deep_gemm_mega_moe --attention-config '{"use_fp4_indexer_cache": true}' --speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Disponibilidad | HLE (sin/con herramientas) | Terminal Bench 2.1 | DeepSWE |
|---|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 B (dato safetensors) | no disponible | MIT | Repositorio T-K-C en HuggingFace, 0 descargas | 42,7 / 60,0 | 87,9 | 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | 37,8 / 51,5 | 82,7 | 54,4 |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | 37,7 / 48,2 | 72,1 | 12,8 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | 40,5 / 54,7 | 81,0 | 46,2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | 43,5 / 56,0 | 88,3 | 67,5 |
| Opus-4.8 | no disponible | no disponible | no disponible | no disponible | 49,8 / 57,9 | 85,0 | 58,0 |
| Fable-5 (con fallback) | no disponible | no disponible | no disponible | no disponible | 53,3 / 63,0 | 88,0 | 70,0 |

Solo se dispone de datos de rendimiento de los modelos comparados; no hay informacion sobre sus parametros, licencias ni disponibilidad en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio esta publicado por el usuario T-K-C, mientras que la model card y los ejemplos de codigo hacen referencia a `deepseek-ai/DeepSeek-V4-Pro-0813`. Debe verificarse la autenticidad y la procedencia de los pesos antes de cualquier uso.
- Registra 0 descargas y 0 "likes" en el momento de la consulta, y se actualizo el mismo dia de su creacion. No hay evidencia de adopcion ni de validacion por parte de terceros.
- No se declaran los idiomas soportados ni la longitud de contexto, dos datos criticos para planificar despliegues en produccion.
- No se publican detalles de entrenamiento, composicion del dataset, sesgos conocidos ni procesos de alineacion (RLHF, DPO). El riesgo de sesgo no puede evaluarse con la informacion disponible.
- No se documentan tasas de alucinacion. Como en cualquier modelo de lenguaje, existe riesgo de generar informacion incorrecta, especialmente en tareas sin verificacion externa.
- La licencia MIT permite uso comercial y modificacion, pero al tratarse de un modelo de 1,65 billones de parametros, el coste de inferencia y de cumplimiento normativo puede ser relevante.
- La tabla de benchmarks incluye conjuntos de prueba internos (DSBench-FullStack y DSBench-Hard) cuyos datos no son verificables de forma independiente. Los resultados de modelos propietarios se presentan sin detallar la configuracion de evaluacion.
- No hay soporte declarado para GGUF ni para runners de inferencia en CPU o en GPU de consumo, lo que limita el despliegue a infraestructura de centro de datos.
- La discrepancia entre el tamano del repositorio (892,8 GB) y la estimacion derivada del recuento de parametros (1,65 TB en FP8 / 3,3 TB en BF16) no esta explicada en la model card.
- La busqueda web realizada no ha devuelto ninguna fuente independiente sobre el modelo; los resultados obtenidos no guardan relacion con el tema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/T-K-C/DeepSeek-V4-Pro-0813
- Informe tecnico (referenciado en la model card): https://arxiv.org/abs/2606.19348
- Pagina de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek V4: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Cuenta de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Carpeta `encoding` del repositorio (scripts de codificacion y parseo de mensajes): disponible dentro del propio repositorio, sin URL absoluta en la informacion proporcionada.
