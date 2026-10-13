# YTan2000/MiniCPM-V-4.7-35B-A3B-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de tipo vision-language desarrollado por OpenBMB, presentado como la primera variante MoE de la familia MiniCPM-V. Combina un codificador visual SigLIP con un *merger* de atencion por ventanas y un backbone de lenguaje Qwen3.5, y soporta modos de submuestreo visual de 4x y 16x. El checkpoint base cuenta con 34.659.889.792 parametros totales y 3B parametros activos por token, repartidos en 256 expertos enrutados de los que se activan 8 por token.

Esta ficha corresponde a una reproduccion de cuantizaciones GGUF publicada por el usuario YTan2000, no al release oficial. El repositorio distribuye tres variantes de cuantizacion (IQ3_S, Q3_K_L y TQ3_4S) derivadas del GGUF F16 oficial de OpenBMB, junto con el proyector visual `mmproj-model-f16.gguf` necesario para entrada de imagen. El objetivo es facilitar la ejecucion en `llama.cpp` y en hardware de consumo, reduciendo el peso de 64,61 GiB del F16 a entre 14,22 y 16,88 GiB segun la variante.

La relevancia actual radica en que permite desplegar un modelo multimodal MoE de 35B en equipos consumer, con la advertencia importante de que la variante TQ3_4S usa un tipo de tensor (id 46) que solo es compatible con el fork `llama.cpp-tq3`, no con `llama.cpp` de linea principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-language), backbone de lenguaje Qwen3.5 (`qwen35moe`) con atencion hibrida lineal/completa; codificador visual SigLIP con merger de atencion por ventanas |
| Parametros totales | 34.659.889.792 (aprox. 35,21B segun fuentes externas) |
| Parametros activos | 3B por token (arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (256K) declarados en config; limite arquitectonico, no verificado en produccion |
| Tipos de cuantizacion | IQ3_S (3,52 bpw), Q3_K_L (4,18 bpw), TQ3_4S (4,07 bpw); proyector visual en F16 |
| Idiomas soportados | en (segun metadatos; el repositorio base declara ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (v3, 733 tensores); modelo base en safetensors BF16 (16 shards) |

Detalles de configuracion verificados en los archivos GGUF: `general.architecture = qwen35moe`, `block_count = 40` (blk.0–blk.39), `nextn_predict_layers = 0`, `expert_count = 256`, `expert_used_count = 8`, `embedding_length = 2048`.

## Arquitectura y entrenamiento

El modelo sigue un diseno multimodal en el que un codificador visual SigLIP, dotado de un *merger* de atencion por ventanas, se combina con un backbone de lenguaje Qwen3.5 de tipo Mixture-of-Experts. La capa de lenguaje emplea una configuracion de atencion hibrida lineal/completa, con 40 bloques y una dimension de embedding de 2048, y enruta cada token a 8 de los 256 expertos disponibles. La variante soporta dos modos de submuestreo visual (4x y 16x), lo que permite ajustar el coste de procesamiento de imagenes de alta resolucion. El nombre "35B-A3B" indica 35B parametros totales y 3B activos por token.

No se dispone de informacion detallada en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El modelo base se publico en BF16 en 16 shards (aproximadamente 35,21B parametros). Las cuantizaciones de este repositorio se generaron con `llama-quantize` a partir del GGUF F16 oficial, verificado como identico byte a byte al release de upstream, sin uso de *importance matrix* (lo que motivo no ofrecer IQ3_XS, que la requiere obligatoriamente).

## Capacidades

- Comprension de imagen individual, multiples imagenes y video, segun la descripcion de la familia MiniCPM-V.
- Generacion de texto conversacional sobre entradas image-text (pipeline `image-text-to-text`).
- Razonamiento multimodal con submuestreo visual configurable (4x y 16x).
- Inferencia *on-device*, orientada a ejecucion local mediante `llama.cpp`.
- Modo texto-only si no se carga el proyector visual (`mmproj`).
- Soporte de plantilla de chat con `--jinja` en `llama-server`.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible (el modelo es vision-language).

## Casos de uso

- Inferencia multimodal local en equipos de consumo: un usuario puede ejecutar el modelo en `llama.cpp` con una cuantizacion IQ3_S o Q3_K_L de 14–17 GiB, obteniendo comprension de imagen sin depender de servicios en la nube.
- Analisis de imagenes en escritorio: con `llama-server --mmproj mmproj-model-f16.gguf`, es posible montar un endpoint HTTP local que reciba imagenes y preguntas para tareas de descripcion, extraccion o clasificacion visual.
- Procesamiento de capturas o documentos escaneados: el submuestreo de 16x reduce el coste de tokens visuales en documentos densos, adecuado para OCR asistido o resumen de capturas.
- Comprension de video en entornos con recursos limitados: la familia soporta video, y las cuantizaciones de 3–4 bpw permiten mantener varios fotogramas en memoria.
- Prototipado de asistentes visuales sin GPU de datacenter: con una GPU de 16 GB se midio servicio en torno a 128K de contexto con KV cache cuantizada y aproximadamente 100 tok/s de decodificacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece tres variantes de bpw similar (3,52 / 4,07 / 4,18) para estudiar el impacto de la cuantizacion en calidad y velocidad.
- Despliegue en movil: existen reportes de ejecucion a mas de 13 tok/s en iPhone 17 Pro Max, lo que abre escenarios de asistencia visual embebida (dato de terceros, no verificado en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las cifras de calidad para estas tres variantes estan "pending" y que no se reclama ningun resultado. Los unicos datos verificados son estructurales (tipos de tensor, bpw medido, recuento de parametros, consistencia de metadatos y linaje). El unico dato de rendimiento disponible es un reporte externo de mas de 13 tok/s en iPhone 17 Pro Max, que no forma parte de la documentacion oficial del repositorio.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin KV cache): IQ3_S ~14,22 GiB; Q3_K_L ~16,88 GiB; TQ3_4S ~16,42 GiB; anadir ~1,04 GiB del proyector visual F16.
- El modelo F16 completo ocupa 64,61 GiB, inviable en GPUs de consumo.
- GPU recomendadas: en el rango de 16 GB, una tarjeta consumer de gama alta permite servir IQ3_S o Q3_K_L con KV cache cuantizada. Para contexto completo de 256K hacen falta GPUs con mucha mas memoria (A100, H100 u similares) o cuantizacion agresiva de KV.
- Cabe en GPU consumer: si, con las cuantizaciones de 3–4 bpw en tarjetas de 16 GB o mas, siempre que se cuantice la KV cache.
- Opciones de despliegue: `llama.cpp` de linea principal para IQ3_S y Q3_K_L; `llama.cpp-tq3` (fork `turbo-tan/llama.cpp-tq3`) obligatorio para TQ3_4S. Compatible con `llama-cli` y `llama-server`.
- Latencia y throughput: en una GPU de 16 GB se midio esta familia sirviendo en torno a 128K de contexto con KV cuantizada y aproximadamente 100 tok/s de decodificacion; por encima de ese contexto la decodificacion cae bruscamente. Reporte externo de mas de 13 tok/s en iPhone 17 Pro Max.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificados de modelos comparables de la misma categoria (MoE multimodal de ~35B con 3B activos). La unica referencia interna es el propio modelo base `openbmb/MiniCPM-V-4.7-35B-A3B` y las cuantizaciones oficiales (Q4_0, Q4_1, Q4_K_M, Q4_K_S, Q5_0, Q5_1, Q5_K_M, Q5_K_S, Q6_K, Q8_0 y `mix_q3gud_im`), frente a las cuales este repositorio anade IQ3_S, Q3_K_L y TQ3_4S, no publicadas upstream.

## Limitaciones y advertencias

- La variante TQ3_4S usa el tipo de tensor TQ3_4S (id 46), fuera de la tabla de tipos de `llama.cpp` de linea principal; no cargara sin el fork `llama.cpp-tq3`.
- El contexto declarado de 256K es un limite arquitectonico, no un techo probado; en hardware de consumo el contexto practico es muy inferior y requiere KV cache cuantizada.
- No se han medido resultados de calidad para estas cuantizaciones; el degradado frente al F16 es desconocido.
- IQ3_S y Q3_K_L (3,52 y 4,18 bpw) implican perdida de calidad potencialmente notable en tareas sensibles.
- El unico idioma declarado en metadatos es ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible para este modelo.
- Licencia Apache-2.0, permisiva para uso comercial, pero el repositorio upstream no incluye archivo LICENSE pese a declarar la licencia; los pesos siguen siendo propiedad de sus autores y este repositorio solo distribuye cuantizaciones.
- Al recuantizar desde GGUF se pierden las claves de procedencia originales, por lo que el linaje se establece por coincidencia de tamano en bytes con el F16 oficial, no por metadatos propios de los archivos.
- Sin *importance matrix* calibrada, por lo que no se ofrecen variantes que la requieran (por ejemplo IQ3_XS).

## Enlaces

- Repositorio GGUF: https://huggingface.co/YTan2000/MiniCPM-V-4.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- GGUF oficial de OpenBMB: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-gguf
- Documentacion de Transformers: https://huggingface.co/docs/transformers/main/model_doc/minicpmv4_7
- Fork `llama.cpp-tq3`: https://github.com/turbo-tan/llama.cpp-tq3
- Ficha en LLM Database: https://llmdb.com/models/minicpm-v-4-7
- Especificaciones y VRAM (apxml): https://apxml.com/models/minicpm-v-4-7-35b-a3b
- Analisis on-device (explainx): https://www.explainx.ai/blog/minicpm-v-4-7-35b-a3b-on-device-moe-iphone-lookahead-expert-scheduling-2026
