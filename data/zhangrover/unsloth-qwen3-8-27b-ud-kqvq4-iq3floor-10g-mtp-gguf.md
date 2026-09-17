# zhangrover/Unsloth-Qwen3.8-27B-UD-KQVQ4-IQ3Floor-10G-MTP-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF de precision mixta del modelo Qwen3.8-27B, publicada por el usuario zhangrover a partir de los pesos base de unsloth (`unsloth/Qwen3.8-27B-GGUF`). Se trata de un modelo denso de 27 000 millones de parametros con atencion hibrida (bloques de atencion completa mas rutas de estado secuencial tipo SSM) y un cabezal MTP (multi-token prediction) integrado. El objetivo declarado por el autor es conseguir un archivo de ~10 GiB que quepa en una GPU de 16 GB manteniendo mas de 130 000 tokens de contexto gracias a una cache KV cuantizada a Q4.

La innovacion principal no es el modelo base sino la estrategia de cuantizacion: 866 tensores a una media de 3,18 BPW, donde los anclajes K/Q/V de los 16 bloques de atencion completa se mantienen en Q4_K, todas las normalizaciones en F32, la FFN baja hasta el suelo IQ3_XXS (2,06 BPW) y las rutas de estado secuencial quedan en IQ3_S. El cabezal MTP completo (15 tensores, bloque `blk.64`) va incluido en el mismo archivo, lo que habilita decodificacion especulativa con `--spec-type draft-mtp` y una aceleracion declarada de 2 a 3 veces en salidas de longitud conversacional.

Es relevante ahora porque ataca el cuello de botella practico del despliegue local: el BF16 del modelo base exige unos 54 GB de VRAM y las cuantizaciones uniformes pequenas degradan demasiado la calidad. Este build propone un compromiso entre tamano, contexto y fidelidad de los tensores criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (16 bloques de atencion completa + rutas de estado secuencial SSM) y cabezal MTP |
| Parametros totales | 27 000 millones (segun denominacion del modelo base) |
| Longitud de contexto | 131 072 tokens documentados en la configuracion de ejemplo del autor; el autor afirma que caben "130k+" en 16 GB con cache KV Q4 |
| Tipos de cuantizacion | Mixta: Q4_K (49 tensores), Q6_K (1), IQ3_S (130), IQ3_XXS (326), F32 (360); media de 3,18 BPW |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 10 875 161 600 bytes, 10,13 GiB) |
| SHA256 | `33442d8a1f49b3ee243034a01826747eed774162c7ffd1811552d23d38377699` |
| Numero de tensores | 866 (851 principales + 15 del cabezal MTP) |
| Metadatos MTP | `block_count=65`, `nextn_predict_layers=1` |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base: no se indican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Toda la informacion tecnica disponible se refiere al proceso de cuantizacion, no al entrenamiento. El modelo base se describe con las etiquetas `dense` y `hybrid-attention`, y la propia cuantizacion revela su estructura: 16 bloques de atencion completa identificados como anclajes (`blk.3, blk.7, ..., blk.63`), rutas de estado secuencial con parametros `ssm_a`, `ssm_conv1d`, `ssm_dt.bias` y alfas/betas por bloque, y una FFN por bloque. El bloque 64 es el cabezal MTP, compuesto por 11 tensores de atencion/FFN mas 4 tensores `nextn`, con `nextn_predict_layers=1`.

La innovacion tecnica del build reside en la asignacion escalonada de precision. Los 48 tensores K/Q/V de los 16 anclajes de atencion completa quedan en Q4_K, garantizando un minimo de Q4_K en esos puntos; todas las normalizaciones y los parametros `ssm_a` / `ssm_conv1d` / `ssm_dt.bias` se mantienen en F32 por su bajo coste en tamano; los 326 tensores de FFN, salidas de atencion de los anclajes y proyecciones de atencion lineal bajan al suelo IQ3_XXS de 2,06 BPW; y los 130 tensores de rutas de estado (alfas/betas, `ssm_out` desde el bloque 30, pesos del cabezal MTP, embeddings y capa de salida) se colocan en IQ3_S, un escalon por encima del suelo. Los tensores de nivel IQ3 se cuantizaron con matriz de importancia, mientras que los del cabezal MTP sin entradas en dicha matriz usan cuantizacion estandar. Dentro del cabezal MTP, el tensor `blk.64.attn_v` esta en Q6_K, la precision mas alta del archivo, decision que el autor justifica por la tasa de aceptacion de la decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y modo de razonamiento explicito: la configuracion recomendada usa `--reasoning on --reasoning-format deepseek`.
- Razonamiento de multiples pasos y resolucion de problemas, segun las etiquetas `thinking` y `reasoning` del repositorio.
- Generacion de codigo, segun la etiqueta `coding`.
- Decodificacion especulativa integrada mediante el cabezal MTP completo (15 tensores), activable con `--spec-type draft-mtp`, con una ganancia declarada de 2 a 3 veces en salidas de longitud de chat.
- Capacidad multimodal opcional: el autor indica que se puede emparejar con el proyector de vision `Qwen3.8-27B` mediante `--mmproj`, ejecutandose dicho proyector en CPU con impacto minimo en la velocidad.
- Multilinguee limitado a chino e ingles.
- Soporte de plantilla de chat Jinja en `llama-server` mediante `--jinja`, requisito habitual para function calling, aunque el soporte explicito de tool calling no se detalla en la model card.
- Contexto largo de hasta 131 072 tokens en configuracion de un solo slot (`-np 1`).

## Casos de uso

- Asistencia de programacion en estacion de trabajo local: con 10,13 GiB de pesos y cache KV Q4, el modelo cabe en una GPU de 16 GB y permite mantener repositorios o modulos extensos en el contexto de 131 072 tokens, con el modo de razonamiento activado para tareas de depuracion.
- Analisis de documentacion tecnica extensa: la ventana de 131 072 tokens permite procesar manuales, normativas o expedientes completos sin fragmentacion agresiva, algo inviable en cuantizaciones con cache KV en f16 sobre el mismo hardware.
- Despliegue on-premise para atencion al cliente: la licencia Apache 2.0 y la ejecucion totalmente local evitan costes por token y problemas de soberania de datos; la decodificacion especulativa MTP mantiene latencias bajas en conversaciones multi-turno.
- Procesamiento de imagenes y documentos escaneados: mediante `--mmproj` el modelo puede describir o interpretar imagenes con el proyector ejecutandose en CPU, sin sacrificar el presupuesto de VRAM destinado al contexto.
- Experimentacion con decodificacion especulativa: el cabezal MTP integrado y los parametros `--spec-draft-n-max` y `--spec-draft-p-min` permiten evaluar tecnicas de draft-and-verify sin necesidad de un modelo borrador separado.
- Servidores de inferencia de un solo usuario o baja concurrencia: la configuracion recomendada fija `-np 1`, adecuada para asistentes personales o herramientas internas donde prima el contexto largo sobre el throughput agregado.
- Evaluacion comparativa de estrategias de cuantizacion: el histograma verificado por tensor y la receta KQV-Q4 + suelo IQ3 sirven como referencia reproducible para estudiar el impacto de la precision mixta en modelos hibridos con SSM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y los resultados de busqueda web devueltos no contienen informacion relacionada con el modelo. El unico dato de rendimiento declarado es la aceleracion de 2 a 3 veces en salidas de longitud de chat al activar `--spec-type draft-mtp`, sin cifras absolutas de tokens por segundo.

## Requisitos de hardware

- Tamano de pesos: 10,13 GiB en un unico archivo GGUF; el BF16 del modelo base requiere aproximadamente 54 GB, segun la propia model card.
- VRAM estimada: con cache KV en q4_0 (`--cache-type-k q4_0 --cache-type-v q4_0`) y contexto de 131 072 tokens, el autor confirma que funciona en una GPU de 16 GB. Por debajo de 16 GB no hay datos publicados y el margen seria muy ajustado.
- GPU recomendadas: RTX 4080, RTX 4090, RTX 5080 o cualquier tarjeta con 16 GB o mas; A100 y H100 son sobradamente suficientes, aunque desaprovechan el objetivo de eficiencia del build. Cabe en GPU de consumo de gama alta con 16 GB.
- Uso de CPU: el proyector de vision (`--mmproj`) se ejecuta en CPU segun el autor, con impacto minimo en la velocidad.
- Opciones de despliegue: `llama.cpp` (probado en la build b10728 con `llama-server`) y LM Studio, importando el GGUF directamente y activando la decodificacion especulativa MTP en la configuracion del servidor. El soporte en Ollama, vLLM o TGI no esta documentado.
- Parametros de ejecucion de referencia: `-c 131072 -ngl 99 -t 8 --kv-unified --jinja --reasoning on --reasoning-format deepseek --spec-type draft-mtp -np 1 --spec-draft-n-max 2 --spec-draft-p-min 0 --cache-type-k q4_0 --cache-type-v q4_0 -fa on --top-k 20 --top-p 0.95 --repeat-penalty 1.1 --min-p 0`.
- Latencia y throughput: no disponibles en valores absolutos; solo la mejora relativa de 2 a 3 veces atribuida al cabezal MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto practico en 16 GB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build (zhangrover, KQV-Q4 + IQ3 Floor) | 27B denso | Mixta a 3,18 BPW con anclajes Q4_K y suelos IQ3 | 10,13 GiB | 131 072 tokens con KV Q4 | Apache 2.0 | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| `unsloth/Qwen3.8-27B-GGUF` (pesos base) | 27B denso | No disponible | No disponible | No disponible | Apache 2.0 | Referenciado en la model card |
| Modelo base Qwen3.8-27B en BF16 | 27B denso | BF16 | ~54 GB | No cabe | Apache 2.0 | Referenciado en la model card |
| Cuantizaciones uniformes de ~10 GB | 27B denso | No disponible | ~10 GB | No disponible; el autor afirma que son menos precisas | No disponible | Mencionadas por el autor sin identificar |
| Builds de ~10 GB sin cabezal MTP | 27B denso | No disponible | ~10 GB | No disponible | No disponible | Mencionadas por el autor sin identificar |

No se dispone de datos de rendimiento de las alternativas que permitan una comparacion cuantitativa; las diferencias descritas proceden unicamente de las afirmaciones del autor del repositorio.

## Limitaciones y advertencias

- No se han publicado benchmarks independientes ni cifras de evaluacion estandar; todas las ventajas declaradas proceden del propio autor del build.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es nula.
- El autor reconoce explicitamente que su build "puede que ya no sea el mejor del mercado" y que no ha probado otras cuantizaciones pequenas.
- El suelo de cuantizacion en IQ3_XXS (2,06 BPW) sobre la FFN implica una perdida de precision frente a cuantizaciones uniformes tipo Q4_K_M; es esperable degradacion en tareas sensibles a la precision numerica como matematicas o generacion de codigo compleja.
- La cache KV en q4_0, necesaria para alcanzar 131 072 tokens en 16 GB, reduce la fidelidad del contexto largo en comparacion con una cache en f16.
- La decodificacion especulativa MTP se recomienda con `-np 1` (un unico slot), lo que limita la concurrencia y el throughput agregado en escenarios multiusuario.
- Idiomas soportados unicamente chino e ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad publicadas para este build.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo del modelo base ni de la cuantizacion.
- Requiere builds recientes de `llama.cpp` (probado en b10728) para el soporte de `--spec-type draft-mtp`, `--kv-unified` y el formato de razonamiento deepseek.
- La nomenclatura del repositorio es confusa (`qwen3.8`, etiqueta `qwen35`), lo que dificulta verificar la procedencia exacta de los pesos base.
- Licencia Apache 2.0, lo que permite uso comercial, pero conviene verificar que los terminos del modelo base de Qwen no impongan condiciones adicionales.
- La cuantizacion con matriz de importancia solo se aplico a los tensores de nivel IQ3; los tensores del cabezal MTP sin entradas en dicha matriz usan cuantizacion estandar, lo que puede afectar a la tasa de aceptacion en dominios alejados de los datos de calibracion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zhangrover/Unsloth-Qwen3.8-27B-UD-KQVQ4-IQ3Floor-10G-MTP-GGUF
- Pesos base de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre el modelo; los unicos resultados devueltos correspondian a paginas de Gmail y no guardan relacion con la consulta.
