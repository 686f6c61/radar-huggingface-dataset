# tinyopsec/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored-GGUF

## Resumen

Esta ficha describe la colección de cuantizaciones GGUF publicada por el usuario `tinyopsec` a partir del modelo `DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored`, que a su vez deriva de `meta-llama/Llama-3.2-3B-Instruct` de Meta. El modelo original ha sido sometido a "abliteration" mediante la herramienta Heretic, una tecnica que identifica la denominada direccion de rechazo en el residual stream y ortogonaliza los pesos contra ella, de forma que se elimina el comportamiento de negativa a responder sin reentrenar el modelo ni degradar su comprension del lenguaje. El resultado es un modelo instruct de 3.212.749.888 parametros que sigue instrucciones sin restricciones de contenido incorporadas.

La aportacion de `tinyopsec` es exclusivamente de cuantizacion: once ficheros GGUF que van desde F16 (~6,4 GB) hasta Q2_K (~1,3 GB), generados con `llama.cpp`, lo que permite ejecutar el modelo en GPU de consumo, CPU e incluso en equipos con 4 GB de RAM en las variantes mas agresivas. La arquitectura subyacente es `LlamaForCausalLM` con una longitud de contexto declarada de 128.000 tokens, aunque los ejemplos de uso de la propia model card trabajan con 4.096 tokens.

El modelo es relevante para quien necesite un asistente conversacional muy ligero y sin filtros de salida para experimentacion local, investigacion sobre alineacion y mecanismos de rechazo, o generacion de texto creativo sin censura. Conviene tener en cuenta que el repositorio muestra 0 descargas y 0 likes, y que en el momento de redactar esta ficha no hay benchmarks publicados ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, denso) |
| Parametros totales | 3.212.749.888 (~3,2 mil millones) |
| Longitud de contexto | 128.000 tokens segun la model card del autor; los ejemplos de uso configuran 4.096 |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (`en`) segun los metadatos; el modelo Llama 3.2 original es multilingue, pero este derivado declara solo ingles |
| Licencia | Llama 3.2 Community License (`license: llama3.2`) |
| Formato de pesos | GGUF (un fichero por cuantizacion) |
| Tamano del repositorio | 27,4 GB en total (suma de todas las cuantizaciones) |
| Modelo base | `DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored` |
| Modelo original de partida | `meta-llama/Llama-3.2-3B-Instruct` |
| Pipeline | text-generation |
| Libreria | gguf |
| Fecha de creacion del repositorio | 2026-09-14 (ultima actualizacion: 2026-09-14) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm y embeddings RoPE, distribuido por Meta en precision bfloat16 y con versiones cuantizadas oficiales posteriores. El modelo no es un MoE, de modo que sus 3.212.749.888 parametros son todos activos en cada paso de inferencia. El contexto nominal es de 128.000 tokens, si bien la model card de esta cuantizacion recomienda y ejemplifica 4.096 tokens, un valor mucho mas razonable para el consumo de memoria de KV cache en hardware de gama de consumo.

Sobre el entrenamiento concreto de este derivado no hay informacion publicada: no se indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO adicionales. Lo unico documentado es la tecnica de posprocesado: abliteracion mediante Heretic, que localiza la direccion de rechazo en el residual stream y modifica los pesos para neutralizarla. Segun la documentacion de modelos equivalentes, este procedimiento no requiere reentrenamiento y busca preservar las capacidades de seguimiento de instrucciones. La cuantizacion posterior se realizo con `llama.cpp`, sin informacion sobre calibracion o dataset de calibracion empleado.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (roles `system`, `user`, `assistant`).
- Seguimiento de instrucciones y respuestas multi-turno, al ser una variante instruct.
- Razonamiento basico y comprension lectora propias de un modelo de 3B parametros.
- Generacion de texto creativo sin mecanismos de rechazo incorporados: el modelo no declina peticiones por contenido.
- Ejecucion local completa, sin dependencia de API ni conexion a internet.
- Integracion con `llama.cpp` en modo CLI y servidor HTTP, `llama-cpp-python`, Ollama y LM Studio.
- Compatible con endpoints (`endpoints_compatible` en los tags) y con el pipeline `text-generation` de HuggingFace.
- Capacidades multimodales: no disponibles (el modelo es solo texto).
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking) o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: al ser un modelo abliterado con su contrapartida alineada disponible, permite estudiar de forma comparada como cambia el comportamiento y que capacidades se preservan o degradan tras neutralizar la direccion de rechazo.
- Red teaming y evaluacion de seguridad: puede emplearse como generador local de contenido adversario para probar clasificadores, filtros de moderacion o guardrails propios, sin coste de API y sin enviar prompts a terceros.
- Escritura creativa y ficcion sin filtros: narrativa, dialogos o guiones donde el autor necesita un modelo que no se niegue a tratar temas oscuros o controvertidos, ejecutable en un portatil con la cuantizacion Q4_K_M.
- Asistente conversacional local en edge: con Q3_K_M o Q2_K cabe en 4 GB de RAM y puede embeberse en un `llama-server` para aplicaciones de escritorio o dispositivos sin GPU.
- Generacion de datos sinteticos para fine-tuning: se puede usar para producir grandes volumenes de texto etiquetado o pares instruccion-respuesta en ingles a coste cero, aprovechando las cuantizaciones F16 o Q8_0 cuando se busque maxima fidelidad.
- Prototipado rapido de aplicaciones de chat: con Q4_K_M (~2,0 GB) y `llama-cpp-python` se puede levantar un backend conversacional completo en minutos, util para validar producto antes de invertir en modelos mayores.
- Extraccion y transformacion de texto en pipelines offline: tareas de resumen, reescritura o clasificacion simple en lotes donde la confidencialidad impide usar servicios en la nube.
- Pruebas de cuantizacion y benchmarking de `llama.cpp`: el repositorio ofrece once niveles de cuantizacion del mismo modelo, lo que facilita medir el compromiso entre tamano, latencia y calidad percibida en un hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda aportan cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones comparativas frente a la version alineada. Tampoco se documentan metricas de latencia o throughput (tokens por segundo) para ninguna de las cuantizaciones.

## Requisitos de hardware

La model card del autor proporciona la siguiente tabla de consumo y compatibilidad por cuantizacion:

| Cuantizacion | RAM necesaria | Encaja en |
|---|---|---|
| F16 | ~7 GB | GPU de 8 GB / 16 GB de RAM |
| Q8_0 | ~4 GB | GPU de 6 GB / 8 GB de RAM |
| Q6_K | ~3 GB | GPU de 4 GB / 8 GB de RAM |
| Q5_K_M | ~2,5 GB | GPU de 4 GB / 8 GB de RAM |
| Q4_K_M | ~2,2 GB | GPU de 4 GB / 6 GB de RAM |
| Q3_K_M | ~1,8 GB | CPU / 4 GB de RAM |
| Q2_K | ~1,5 GB | CPU / 4 GB de RAM |

- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas de VRAM puede ejecutar Q4_K_M, Q5_K_M o Q6_K; una RTX 3060, RTX 4060, RTX 4090 o similar ejecuta sin problemas la version F16.
- CPU: las variantes Q3 y Q2 estan pensadas para ejecucion en CPU con 4 GB de RAM.
- GPU de datacenter: no se documenta ningun caso de uso con A100 o H100; dado el tamano del modelo, no tiene sentido desplegarlo en ese hardware salvo por agregacion de muchas instancias.
- Opciones de despliegue documentadas: `llama.cpp` en modo CLI (`llama-cli`) y servidor (`llama-server`), `llama-cpp-python`, Ollama (`ollama run hf.co/tinyopsec/...:Q4_K_M`) y LM Studio.
- Otros runners no documentados: vLLM, TGI o TensorRT-LLM no aparecen en la informacion proporcionada; su compatibilidad con GGUF requeriria verificacion aparte.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna cuantizacion ni hardware.
- Recomendacion del autor: Q4_K_M como mejor equilibrio calidad/tamano; Q5_K_M o Q8_0 si hay RAM o VRAM de sobra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `tinyopsec/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored-GGUF` | ~3,2B | 128.000 (ejemplos a 4.096) | GGUF (11 cuantizaciones) | Llama 3.2 Community License | Objeto de esta ficha; abliterado via Heretic; 0 descargas |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3,2B | 128.000 | safetensors (BF16 y cuantizados oficiales) | Llama 3.2 Community License | Modelo original de Meta, con alineacion intacta; referencia para comparar degradacion |
| `mradermacher/Llama-3.2-3B-Instruct-uncensored-GGUF` | no disponible en la informacion recogida | no disponible | GGUF | no disponible | Cuantizacion de una variante "uncensored" de Llama 3.2 3B; alternativa directa en el mismo nicho |
| `richardyoung/llama-3.2-3b-instruct-abliterated` | ~3B | no disponible | distribuido via Ollama | no disponible | Build abliterado de Llama 3.2 3B Instruct usando Heretic; misma tecnica, distinto publicador |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y procedencia.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: la abliteracion elimina deliberadamente el comportamiento de rechazo, de modo que el modelo puede generar contenido danino, ilegal, ofensivo o inseguro sin ninguna salvaguarda. No es apto para despliegue publico sin moderacion externa.
- Riesgo de alucinacion elevado: con solo 3,2B parametros, la tasa de invencion de hechos, citas y datos es alta; no debe usarse como fuente de verdad sin verificacion.
- Idioma: los metadatos declaran unicamente ingles. Aunque el Llama 3.2 original es multilingue, no hay garantia de calidad en castellano ni en otros idiomas para este derivado.
- Contexto real limitado en la practica: aunque se declaran 128.000 tokens, los ejemplos de uso configuran 4.096, y el coste de KV cache en un modelo de 3B con contexto largo puede superar la VRAM de GPU de consumo.
- Licencia: Llama 3.2 Community License no es una licencia de codigo abierto aprobada por la OSI. Incluye condiciones de atribucion ("Built with Llama"), clausulas de uso aceptable y un limite de 700 millones de usuarios mensuales antes de requerir licencia comercial de Meta. El uso comercial esta permitido con condiciones, pero la clausula de uso aceptable puede entrar en conflicto con el proposito de un modelo sin filtros.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes sobre la calidad de las cuantizaciones ni sobre posibles artefactos introducidos por la abliteracion.
- Sin benchmarks: no hay evidencia publicada de cuanto degrade la abliteracion las capacidades del modelo original (razonamiento, codigo, matematicas).
- Trazabilidad: la cuantizacion la realiza un tercero distinto del autor del modelo base, de modo que cualquier problema en el proceso de cuantizacion recae fuera del flujo oficial de Meta.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo de este derivado; los sesgos del Llama 3.2 3B Instruct original se heredan y, al eliminar los rechazos, pueden aflorar con mas facilidad en las respuestas.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/tinyopsec/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored-GGUF
- Modelo base del que se cuantiza: https://huggingface.co/DavidAU/Llama-3.2-3B-Instruct-heretic-ablitered-uncensored
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Perfil del autor de la cuantizacion: https://huggingface.co/tinyopsec
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Repositorio de `llama.cpp`: https://github.com/ggerganov/llama.cpp
- Alternativa GGUF "uncensored": https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-uncensored-GGUF
- Alternativa abliterada distribuida via Ollama: https://ollama.com/richardyoung/llama-3.2-3b-instruct-abliterated
- Tarjetas de modelo y formatos de prompt de Llama 3.2 (Meta): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Reempaquetado en GitHub de Llama 3.2 3B Instruct: https://github.com/Gusiion/meta-llama-Llama-3.2-3B-Instruct
