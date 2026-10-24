# WaveCut/Flint-UD-Q4_K_XL-NInfer-v3

## Resumen

Flint-UD-Q4_K_XL-NInfer-v3 es un artefacto de inferencia empaquetado por WaveCut a partir de Flint, un modelo de mezcla de expertos (MoE) de 39,8 mil millones de parámetros desarrollado por RecursiveSI, pensado para agentes de programación, con unos 2,5 mil millones de parámetros activos por token. No se trata de un modelo nuevo ni de un reentrenamiento: es la conversión del GGUF `flint-UD-Q4_K_XL` de Unsloth al formato propietario `.ninfer` v3, consumible únicamente por el motor NInfer (rama `master` de `iamwavecut/ninfer-all`). Cada matriz conserva los bloques ggml del GGUF byte a byte, de modo que no hay recuantización: el motor multiplica los bloques en su sitio.

El interés del artefacto es de ingeniería de despliegue, no de modelado. El archivo único de 23,4 GiB integra tokenizador, plantilla de chat y configuración de generación tomados de `RecursiveSI/flint` en la revisión `2a247be0`, y el motor añade reutilización de prefijo de prompt, canal de razonamiento separado, llamadas a herramientas en formato OpenAI (a partir del marcado GLM-4.7 del modelo), salida estructurada, decodificación especulativa por búsqueda en contexto y residentización configurable de los expertos (GPU, memoria de host fijada o lectura desde disco). Para quien evalúe modelos, la ficha sirve sobre todo para decidir si el binario cabe en su hardware y si el motor encaja en su stack; las capacidades reales del modelo subyacente hay que juzgarlas en la ficha del modelo base.

Un dato relevante: el autor no ejecutó ninguna batería de benchmarks de tareas sobre este artefacto. La única validación publicada es numérica, una comparación de log-verosimilitud negativa (NLL) contra una pasada de referencia en FP64, con una desviación del +0,36 % en los primeros 640 tokens de WikiText. Además, el repositorio tiene cero descargas y cero «likes» en el momento de la consulta, y la model card está truncada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE: 49 bloques, 35 de atención de ventana deslizante (513 posiciones, RoPE) y 14 de atención completa (sin codificación posicional); bloques 0 y 1 con MLP denso SwiGLU de 6144 |
| Parámetros totales | 39,8 mil millones |
| Parámetros activos | ~2,5 mil millones por token (6 de 256 expertos enrutados por token, con puntuaciones sigmoideas renormalizadas, más un experto compartido de 1024 por bloque MoE) |
| Longitud de contexto | 65.536 tokens como máximo configurado en el motor (`--max-context 65536`, 4 peticiones concurrentes en el ejemplo); contexto nativo del modelo base: no disponible |
| Tipos de cuantización | Mezcla por bloques: Q8_0, Q5_K, IQ4_XS, Q4_K, Q6_K, IQ3_S; router, normas, normas QK por cabeza y *attention sinks* en FP32; caché KV en F16 (no hay `--kv-dtype` cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (archivo único de 25.109.604.096 bytes, 23,4 GiB; SHA-256 `601165e7…`), derivado del GGUF `flint-UD-Q4_K_XL` de Unsloth; sin recuantización de bloques ggml |
| Vocabulario / cabeza de salida | 150.144 tokens, cabeza no ligada (*untied head*), Q8_0 |
| Distribución de objetos en el archivo | 589 objetos: 293 FP32, 159 Q8_0, 85 Q5_K, 43 IQ4_XS, 3 Q4_K, 1 Q6_K, 1 IQ3_S |
| Motor compatible | NInfer-all (rama `master` de `iamwavecut/ninfer-all`), receta Flint desde el commit `25fda583`; las compilaciones estándar de NInfer rechazan el archivo |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de atención con mezcla de expertos. De los 49 bloques, 35 usan atención de ventana deslizante de 513 posiciones con RoPE y 14 usan atención completa sin codificación posicional, apoyada en *attention sinks* por cabeza. Los dos primeros bloques son densos (MLP SwiGLU de dimensión 6144) y los 47 restantes son bloques MoE con 256 expertos enrutados, de los que se activan 6 por token, más un experto compartido de dimensión 1024. El enrutador opera en FP32 en este artefacto (las filas BF16 originales se ensancharon de forma exacta), con puntuaciones sigmoideas que se renormalizan tras la selección.

Sobre el entrenamiento no hay información en la documentación proporcionada: no se detalla el número de tokens, la composición del corpus, ni si hubo RLHF, DPO u otras fases de alineación. Lo que sí documenta esta conversión es la política de cuantización, decidida bloque a bloque por el GGUF de origen: bancos `[gate; up]` de cada experto en IQ4_XS, Q5_K, Q4_K o IQ3_S, y bancos `down` en Q5_K, IQ4_XS, Q6_K o Q8_0; el experto compartido y los bloques densos en Q8_0, Q5_K o IQ4_XS, con las filas de gate y up compartiendo padre. La innovación técnica del artefacto no está en el modelo, sino en el motor: decodificación especulativa por búsqueda de n-gramas en el contexto (`--lookup-ngram`), residentización de expertos en GPU, memoria de host fijada o lectura bajo demanda desde el propio archivo.

## Capacidades

- Generación de texto y razonamiento: el modelo abre por sí mismo `<think>` cuando decide razonar y el contenido se entrega en el campo `reasoning_content`; con `chat_template_kwargs: {"enable_thinking": false}` o `reasoning_effort: "none"` cierra un bloque de razonamiento vacío y responde directamente.
- Programación y tareas de agente: el modelo base está descrito por el autor como un MoE «para agentes de programación».
- Llamadas a herramientas: el marcado GLM-4.7 que emite Flint se devuelve como llamadas a herramientas en formato OpenAI, con cada argumento leído según su tipo declarado; un `tool_choice` forzado inicia la llamada.
- Salida estructurada y «decisiones tipadas» (*typed decisions*) según la documentación del motor.
- Servicio compatible con las API de OpenAI y de Anthropic, con 1 a 8 peticiones concurrentes y reutilización de prefijo de prompt.
- Decodificación especulativa por búsqueda en contexto (`--lookup-ngram 4`), sin modelo borrador: Recursive no publica ninguno.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Sin visión: las imágenes no están soportadas en este artefacto. Tampoco hay MTP, DFlash, escalado por rotación ni etapas de pipeline.

## Casos de uso

- Agente de programación en local: el modelo está etiquetado como `coding` y `agent`, y el motor devuelve llamadas a herramientas en formato OpenAI, de modo que puede conectarse a un bucle de agente que edite ficheros, ejecute tests y consulte repositorios sin adaptador intermedio.
- Asistente de terminal o IDE con presupuesto de VRAM ajustado: con `--expert-residency host` el artefacto funciona en tarjetas de 16 o 24 GB dejando 21,5 GiB de expertos en memoria de host fijada, lo que permite desplegarlo en una estación de trabajo monousuario.
- Sustitución directa de la API de OpenAI o Anthropic en herramientas existentes: el servidor `ninfer-serve` expone interfaces compatibles con ambas, así que clientes que ya hablan esos protocolos pueden apuntar al endpoint local sin reescribir la capa de integración.
- Razonamiento con separación de trazas: al emitir el razonamiento en `reasoning_content`, encaja en pipelines que auditan o filtran la cadena de pensamiento antes de mostrar la respuesta final, o que la desactivan por completo con `enable_thinking: false` para reducir latencia.
- Procesamiento por lotes sobre documentos largos: con 65.536 tokens de contexto configurados y reutilización de prefijo, es adecuado para tareas de extracción o resumen sobre repositorios de código y expedientes extensos donde el prefijo (instrucciones, esquema de salida) se repite entre peticiones.
- Servicio interno con concurrencia moderada: el motor admite de 1 a 8 peticiones concurrentes; para un equipo pequeño, cuatro peticiones simultáneas sobre contextos de 64K puede ser suficiente sin recurrir a infraestructura de servido multi-nodo.
- Despliegue con almacenamiento por debajo de la RAM disponible: el modo `disk` lee los expertos desde el propio archivo a través de la caché de páginas del sistema y solo fija 137 MiB, útil en entornos donde la memoria es el recurso escaso y la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que «no task benchmarks were run on this artifact». La única validación publicada es numérica, contra una pasada de referencia en FP64 sobre los bloques decodificados del GGUF:

| Prueba | Referencia FP64 | NInfer v3 | Desviación |
|---|---|---|---|
| NLL total sobre los primeros 640 tokens de WikiText (más allá de la ventana de 513 posiciones) | 1.931,84 | 1.938,86 | +0,36 % |

El autor señala que el resultado es el mismo con los expertos en GPU y en memoria de host; la model card disponible se interrumpe en ese punto, por lo que no se pueden citar las comprobaciones restantes. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- Con todos los expertos en GPU: 23,4 GiB de pesos más 0,7 GiB de espacio de trabajo; por secuencia, 28 KiB de claves y valores F16 por token (los 14 bloques de atención completa) más 53 MiB de anillos de ventana deslizante. Para una secuencia de 32K tokens, unos 25,5 GiB: tarjeta de 32 o 48 GB.
- Con `--expert-residency host`: 1,9 GiB de pesos en GPU, dos bancos de capa de 624 MiB y una caché de los expertos más enrutados en GPU; fija 21,5 GiB de memoria de host. Indicado para tarjetas de 16 o 24 GB.
- Con `--expert-residency disk`: los expertos se leen del archivo `.ninfer` a través de la caché de páginas del sistema operativo; solo fija 137 MiB.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación; las recomendaciones se expresan únicamente por capacidad de memoria (16/24 GB, 32/48 GB). El autor ofrece guías de compilación para Linux y Windows, lo que sugiere soporte de GPUs de consumo, sin detallar cuáles.
- Caché KV: exclusivamente F16; no hay formatos `--kv-dtype` cuantizados en este artefacto, lo que encarece la memoria por token en contextos largos.
- Opciones de despliegue: únicamente `ninfer-serve` de NInfer-all. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.ninfer`; las compilaciones estándar de NInfer rechazan este archivo.
- Conversión: el conversor tarda unos 35 segundos en un contenedor de 64 CPU (`python3 -m tools.convert --model hf --recipe flint_gguf --source gguf=… --device cpu`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks ni de modelos alternativos en la información proporcionada, por lo que no es posible comparar rendimiento con otras soluciones de la misma categoría. La comparación documentada es entre el artefacto y sus fuentes:

| Elemento | Parámetros | Formato | Tamaño | Motor | Licencia |
|---|---|---|---|---|---|
| Este artefacto (`WaveCut/Flint-UD-Q4_K_XL-NInfer-v3`) | 39,8B totales / ~2,5B activos | `.ninfer` v3 | 23,4 GiB | NInfer-all (rama `master`, desde `25fda583`) | Apache 2.0 |
| GGUF de origen (`unsloth/flint-GGUF`, `flint-UD-Q4_K_XL.gguf`, rev. `20468edf`) | 39,8B totales / ~2,5B activos | GGUF (Q4_K_XL dinámico) | no disponible | llama.cpp y afines | Apache 2.0 (según el modelo base) |
| Modelo base (`RecursiveSI/flint`, rev. `2a247be0`) | 39,8B totales / ~2,5B activos | safetensors (presumiblemente; no confirmado en la documentación) | no disponible | transformers y otros | Apache 2.0 |

Modelos de la competencia con parámetros, contexto y rendimiento comparables: no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks de tareas: no hay evidencia publicada de calidad en código, razonamiento o matemáticas para este artefacto; la única métrica es una NLL sobre 640 tokens de WikiText con desviación del +0,36 %.
- Acoplamiento al motor: el archivo solo lo abre NInfer-all desde el commit `25fda583`; las compilaciones estándar de NInfer lo rechazan y no existe ruta a llama.cpp, Ollama, vLLM o TGI. Es un callejón sin salida si el stack no es NInfer.
- El artefacto fue escrito por una revisión anterior de la misma receta de conversión; el autor afirma que la revisión actual produce los mismos bytes salvo el identificador aleatorio de cabecera, pero esa equivalencia no es verificable con los datos aportados.
- Caché KV solo en F16: sin cuantización de KV, el coste por token en contextos largos es de 28 KiB más los anillos de ventana deslizante, lo que limita la concurrencia real en tarjetas pequeñas.
- Capacidades ausentes por diseño en este artefacto: sin visión, sin MTP, sin DFlash, sin escalado por rotación y sin etapas de pipeline.
- Idiomas soportados no documentados: no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación propia.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez. Riesgo de alucinación: inherente a un modelo de lenguaje sin benchmarks publicados; el modo de razonamiento puede aumentar la latencia y no garantiza corrección factual.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución, conservación del aviso de licencia y del archivo `NOTICE` incluido en el repositorio, y sin garantías. Conviene revisar también las condiciones del modelo base `RecursiveSI/flint` y del GGUF de Unsloth, aunque el modelo base se declara Apache 2.0.
- Madurez: cero descargas y cero «likes» en el momento de la consulta; publicación y actualización separadas por cuatro minutos; model card truncada. No hay validación por parte de la comunidad.
- El repositorio ocupa 25,1 GB y el archivo pesa 23,4 GiB: la descarga y el almacenamiento no son triviales, y conviene verificar el SHA-256 (`601165e76d16a6e9abe46a0cbec007215b47936cc8085a463a872d9fc37d8d97`) y el archivo `SHA256SUMS`.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/WaveCut/Flint-UD-Q4_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/RecursiveSI/flint
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/flint-GGUF
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
- Rama del motor compatible: https://github.com/iamwavecut/ninfer-all
- Guía de compilación en Linux: https://github.com/iamwavecut/ninfer-all/blob/master/docs/build-linux.md
- Guía de compilación en Windows: https://github.com/iamwavecut/ninfer-all/blob/master/docs/build-windows.md

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas genéricas del motor de búsqueda), por lo que no se añaden papers, blogs ni demos adicionales.
