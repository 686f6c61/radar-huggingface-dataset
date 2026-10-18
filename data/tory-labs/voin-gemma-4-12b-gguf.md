# tory-labs/voin-gemma-4-12b-gguf

## Resumen

`tory-labs/voin-gemma-4-12b-gguf` es un espejo (mirror) del archivo GGUF del modelo `google/gemma-4-12B-it`, publicado por el desarrollador tory-labs para que la aplicacion voin lo descargue automaticamente. No es un modelo nuevo ni un ajuste fino: el propio autor indica que el fichero es una copia sin modificaciones del GGUF generado por unsloth (commit `fc034cfff751`) a partir del modelo original de Google. El repositorio contiene un unico artefacto, `gemma-4-12b-it-Q4_K_M.gguf`, de 7.121.861.440 bytes (7,12 GB decimales, 6,63 GiB), con SHA-256 publicado y etiqueta `imatrix`.

El modelo base es un Gemma 4 de 12B en variante instruct (`-it`), con 11.907.350.576 parametros segun los safetensors del modelo original, y licencia declarada `apache-2.0` en los metadatos de este repositorio. La model card no aporta ningun dato sobre arquitectura, longitud de contexto, composicion del dataset de entrenamiento ni idiomas soportados, por lo que esta ficha se limita a lo verificable en el repositorio.

Su interes es eminentemente practico: un unico fichero listo para ejecutar en local con llama.cpp u Ollama, con un tamano que encaja en GPUs de consumo de 8-12 GB de VRAM, y la etiqueta `endpoints_compatible` que facilita el despliegue en infraestructura de Hugging Face. Como contrapartida, es un espejo sin descargas ni validacion independiente y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el modelo base es `google/gemma-4-12B-it`) |
| Parametros totales | 11.907.350.576 (~11,9B), dato de safetensors del modelo base |
| Parametros activos | no aplica / no disponible (sin indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); repositorio etiquetado `imatrix` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (metadatos y model card); verificar contra la licencia del modelo base |
| Formato de pesos | GGUF |
| Fichero publicado | `gemma-4-12b-it-Q4_K_M.gguf`, 7.121.861.440 bytes |
| SHA-256 | `0a270ec9fe6b34f4a0d33992b6135117b484ebc4766ab76b51d4ae8c457e4c42` |
| Modelo base | `google/gemma-4-12B-it` |
| Conversion GGUF | `unsloth/gemma-4-12b-it-GGUF`, commit `fc034cfff751157913579611efad8462ac1be606` |
| Tag de pipeline | conversational |
| Tamano del repositorio | 7,1 GB |
| Fecha de creacion / actualizacion | 2026-10-17T20:43:10Z / 2026-10-17T20:43:37Z |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada: la model card del espejo no menciona si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o las etapas de alineacion (RLHF, DPO u otras). Tampoco se indica la longitud de contexto nativa ni si se emplean tecnicas como atencion lineal o decodificacion especulativa. Cualquier afirmacion en ese sentido seria especulativa.

Lo unico documentado es el proceso de distribucion: el autor del espejo no entrena ni modifica nada, y se limita a redistribuir la conversion GGUF publicada por unsloth. La cuantizacion es Q4_K_M, un esquema k-quant de 4 bits con mezcla de precision en las capas mas sensibles, y el repositorio lleva la etiqueta `imatrix`, lo que sugiere el uso de una matriz de importancia durante la cuantizacion para reducir la perdida de perplejidad; la model card no confirma explicitamente ese punto.

## Capacidades

- Generacion de texto conversacional: la etiqueta de pipeline es `conversational` y el modelo base es una variante instruct, por lo que esta disenado para seguir instrucciones y mantener dialogos multi-turno.
- Respuesta a instrucciones: la variante `-it` del modelo base implica algun proceso de ajuste por instrucciones, aunque su naturaleza exacta no se detalla.
- Ejecucion local en CPU y GPU: el formato GGUF permite inferencia con llama.cpp y derivados sin necesidad de frameworks de deep learning completos.
- Integracion via API compatible con endpoints: el tag `endpoints_compatible` indica que el artefacto esta pensado para desplegarse en infraestructura compatible de Hugging Face.
- Capacidades especiales (vision, audio, tool calling, modo de razonamiento explicito, soporte multilingue declarado): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional totalmente offline: el fichero Q4_K_M de 7,12 GB se carga en llama.cpp sobre una GPU de 12 GB y permite mantener un chatbot local sin enviar datos a terceros, algo relevante en entornos con requisitos de confidencialidad.
- Prototipado rapido de aplicaciones de chat: al ser un unico GGUF, se integra en Ollama o LM Studio en minutos, lo que permite validar prompts y flujos conversacionales antes de invertir en infraestructura mayor.
- Procesamiento de documentos sensibles en puesto de trabajo: despachos, clinicas o departamentos de RRHH pueden resumir y reescribir textos internos sin salida de datos, siempre que se verifique la calidad del modelo en espanol.
- Generacion de borradores y reescritura de texto: el modelo puede producir primeras versiones de correos, informes o documentacion tecnica que despues revise una persona, con un coste marginal nulo por token una vez desplegado.
- Base para experimentacion y evaluacion interna: investigadores pueden desplegar esta cuantizacion como linea base de 12B en experiments de prompting, RAG o evaluacion comparativa, con la ventaja de un fichero unico y reproducible via SHA-256.
- Despliegue en el borde o en equipos sin GPU dedicada: al ser GGUF, puede ejecutarse en CPU con llama.cpp en estaciones de trabajo o mini-PC, aceptando latencias mayores a cambio de no requerir acelerador.
- Uso como dependencia de la aplicacion voin: es el caso de uso original del repositorio, que existe para servir el fichero que descarga dicha aplicacion de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio documentacion tecnica del modelo base ni de la conversion GGUF.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 7,12 GB solo para el fichero Q4_K_M; con cache KV y buffers de llama.cpp, el consumo realista se situa en torno a 8-9 GB para contextos moderados (estimacion, no dato del autor).
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB, RTX 4080/4090 16-24 GB. En tarjetas de 8 GB el modelo no entra completo y requeriria offload parcial a CPU.
- GPUs de datacenter: A100 40/80 GB, H100, L40S o A10G pueden ejecutar el modelo con holgura y contextos largos, aunque para 12B en 4 bits son sobredimensionadas salvo por concurrencia.
- CPU: viable con llama.cpp en CPU (AVX2/AVX-512), con latencias notablemente superiores; no se dispone de cifras de tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI sobre llama.cpp, y plataformas de endpoints que acepten GGUF. vLLM y TGI no estan orientados a GGUF de forma nativa, por lo que no se recomiendan sin conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este fichero.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni benchmarks ni especificaciones del modelo base). La unica comparacion posible es entre las distintas presentaciones del mismo modelo:

| Artefacto | Parametros | Formato | Tamano | Licencia declarada | Contexto |
|---|---|---|---|---|---|
| `tory-labs/voin-gemma-4-12b-gguf` (Q4_K_M) | ~11,9B | GGUF | 7,12 GB | apache-2.0 | no disponible |
| `unsloth/gemma-4-12b-it-GGUF` (origen del fichero) | ~11,9B | GGUF | no disponible | no disponible en esta busqueda | no disponible |
| `google/gemma-4-12B-it` (modelo original) | 11.907.350.576 | safetensors | no disponible | no disponible en esta busqueda | no disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo original: no aporta ninguna mejora, ajuste ni evaluacion propia; la calidad depende integramente de `google/gemma-4-12B-it` y de la conversion de unsloth.
- Ausencia total de validacion independiente: 0 descargas y 0 likes en el momento de redactar la ficha, y publicacion y actualizacion separadas por 27 segundos, lo que sugiere un espejo automatizado.
- Falta de documentacion: sin contexto nativo, idiomas, arquitectura ni regimen de entrenamiento documentados, es arriesgado asumir capacidades multilingues o de razonamiento avanzado.
- Discrepancia de licencia potencial: los metadatos declaran apache-2.0, pero conviene verificar la licencia real del modelo base antes de un uso comercial, ya que las familias Gemma han utilizado historicamente terminos propios distintos de Apache 2.0.
- Cuantizacion con perdida: Q4_K_M reduce la precision respecto a los pesos originales en bf16/fp16; es esperable una degradacion en tareas de matematicas, codigo y contextos largos frente al modelo completo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; sin benchmarks publicados no es posible acotar su magnitud. Requiere verificacion en produccion.
- Sin garantias de soporte: al no ser un repositorio oficial de Google, no hay compromiso de mantenimiento, parches de seguridad ni actualizaciones.
- Integridad del fichero: conviene comprobar el SHA-256 publicado antes de desplegar, especialmente si se descarga desde redes intermedias.
- Un unico formato disponible: solo Q4_K_M; no hay Q5, Q6, Q8 ni versiones para GPU con mayor precision en este repositorio.
- La busqueda web no aporto informacion tecnica: los resultados obtenidos corresponden a la marca Tory Burch y al Partido Conservador britanico, sin relacion con el modelo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/tory-labs/voin-gemma-4-12b-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Conversion GGUF de origen: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF/tree/fc034cfff751157913579611efad8462ac1be606
- Aplicacion voin: https://github.com/su-record/voin
- Licencia del repositorio: https://huggingface.co/tory-labs/voin-gemma-4-12b-gguf/blob/main/LICENSE
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
