# timlikesai/Qwen3.6-35B-A3B-MXFP4

## Resumen

Qwen3.6-35B-A3B-MXFP4 es una cuantizacion GGUF en formato MXFP4 (4,25 bits con escalas de bloque e8m0) del modelo ggml-org/Qwen3.6-35B-A3B, publicada por el usuario timlikesai. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion de pesos orientada a reducir el espacio en disco y la VRAM necesaria para inferencia local, manteniendo la estructura MoE del modelo original. El repositorio incluye el fichero de pesos `35b-mxfp4-imx.gguf` y el fichero imatrix `35b.imatrix` generado con datos de entrenamiento tipo wiki.

La particularidad tecnica de esta publicacion es el uso de imatrix (importance matrix) durante la busqueda de escalas, combinado con el algoritmo de busqueda de escalas OCP con objetivo 4.0. Ademas, la ruta de cache KV en MXFP4 emplea escalamiento UOS con MXAttention por defecto, una variante implementada por el propio autor en un PR sobre llama.cpp. El resultado es una cuantizacion de 4,25 bits por peso que aspira a conservar mas calidad que una cuantizacion uniforme del mismo tamano.

El modelo base tiene 34.660.610.688 parametros totales (aproximadamente 34,66 mil millones) y, segun la nomenclatura A3B del nombre, seria una arquitectura de mezcla de expertos con del orden de 3.000 millones de parametros activos por token, aunque este extremo no se confirma en la informacion disponible. El repositorio ocupa 19,2 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun la nomenclatura del nombre; detalles no disponibles |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3 B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4,25 bits, escalas de bloque e8m0); cache KV en MXFP4 con escalamiento UOS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`35b-mxfp4-imx.gguf`) |
| Ficheros auxiliares | `35b.imatrix` (importance matrix, datos wiki) |
| Tamano del repositorio | 19,2 GB |
| Modelo base | ggml-org/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

Se trata de una cuantizacion post-entrenamiento, no de un modelo entrenado por el autor del repositorio. El punto de partida es ggml-org/Qwen3.6-35B-A3B, un modelo de arquitectura transformer con capas de mezcla de expertos (MoE), tal y como indica la nomenclatura A3B del nombre. El proceso aplicado es el siguiente: primero se genera una importance matrix con `llama-imatrix` sobre un fichero de texto de entrenamiento (`train.txt`), y despues se ejecuta `llama-quantize --imatrix 35b.imatrix base.gguf 35b-mxfp4-imx.gguf mx`, empleando el tipo de cuantizacion `mx` de llama.cpp.

La innovacion destacable esta en la busqueda de escalas. Los pesos usan la busqueda de escalas OCP con objetivo 4.0, ponderada por la importance matrix, de modo que los bloques con mayor impacto en la salida reciben un tratamiento mas cuidadoso. La ruta de cache KV en MXFP4 usa escalamiento UOS, con la formula `e = ceil(log2(amax/7.25))+127` y el mecanismo denominado MXAttention, configurado como opcion por defecto. Esta variante esta vinculada al PR abierto por el autor en su fork de llama.cpp (PR 14), lo que implica que la reproduccion del comportamiento exacto puede depender de ese codigo y no solo de una version estandar del runtime.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base paso por fases de RLHF o DPO. Tampoco se documenta si hubo decodificacion especulativa, atencion lineal u otras tecnicas en el modelo original.

## Capacidades

- Generacion de texto conversacional: la model card etiqueta el modelo como `conversational`, por lo que esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de APIs compatibles con el estandar de HuggingFace / OpenAI.
- Razonamiento y codigo: no disponible (no se documentan capacidades especificas del modelo base en la informacion proporcionada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia local en llama.cpp: soportada por construccion, al ser un fichero GGUF generado con `llama-quantize`.

## Casos de uso

- Despliegue local en estaciones de trabajo con una sola GPU de 24 GB: al ocupar los pesos aproximadamente 18,4 GB en MXFP4 de 4,25 bits, el modelo cabe en una RTX 4090 o RTX 3090 siempre que se ajuste el contexto para no desbordar la VRAM con la cache KV.
- Servicio conversacional autoalojado: con la etiqueta `endpoints_compatible`, el GGUF puede exponerse detras de un servidor compatible con la API de OpenAI (por ejemplo, `llama-server`) y sustituir a un servicio en la nube en entornos con requisitos de soberania de datos.
- Prototipado y evaluacion de cuantizaciones: el repositorio incluye el fichero imatrix y la receta exacta de cuantizacion, lo que lo convierte en un caso de referencia para quien quiera reproducir o comparar el efecto del imatrix en la calidad final.
- Experimentacion en investigacion sobre formatos MXFP4: la combinacion de escalas e8m0 con escalamiento UOS en la cache KV es un objeto de estudio util para medir el impacto de estos formatos en tareas de generacion larga.
- Inferencia en hardware limitado mediante offload parcial a CPU: los ficheros GGUF permiten repartir capas entre GPU y CPU en llama.cpp, de modo que el modelo puede ejecutarse en equipos sin GPU de gama alta a costa de menor velocidad.
- Integracion en pipelines de generacion de texto por lotes: procesamiento de resumenes, clasificacion o extraccion de informacion sobre corpus grandes en entornos desconectados, donde el coste por token de una API externa no es viable.
- Base para ajuste fino posterior sobre GGUF: aunque el formato no es ideal para entrenamiento, puede servir como referencia de calidad para comparar contra versiones sin cuantizar antes de decidir el formato definitivo de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones cuantitativas frente al modelo base sin cuantizar o frente a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para los pesos: alrededor de 18,4 GB con el formato MXFP4 de 4,25 bits sobre 34,66 B de parametros. Cifra derivada aritmeticamente del tamano de parametros, no publicada por el autor.
- VRAM estimada con cache KV: depende de la longitud de contexto y del numero de capas, datos no disponibles. La cache KV tambien usa MXFP4 en esta configuracion, lo que reduce su huella frente a una cache en FP16.
- GPU consumer compatibles: RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 (32 GB) con margen para contexto moderado; en GPUs de 16 GB seria necesario offload parcial a CPU.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten ejecutar el modelo completo con contextos amplios y mayor concurrencia.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio y koboldcpp son las rutas naturales para GGUF. vLLM y TGI no soportan GGUF de forma nativa general, por lo que no son opciones directas para este fichero.
- Nota importante sobre el runtime: el escalamiento UOS de la cache KV MXFP4 procede del fork del autor (PR 14 en `timlikesai/llama.cpp`), por lo que el comportamiento por defecto puede diferir en builds estandar de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timlikesai/Qwen3.6-35B-A3B-MXFP4 | 34,66 B | GGUF MXFP4 4,25 bits | no disponible | no disponible | HuggingFace, sin descargas registradas |
| ggml-org/Qwen3.6-35B-A3B (base) | 34,66 B | GGUF sin cuantizar / otras variantes | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones del mismo modelo base | 34,66 B | GGUF (Q4_K_M, Q5_K_M, etc.) | no disponible | no disponible | no disponible en la informacion recibida |

No se dispone de datos de rendimiento que permitan comparar la calidad del MXFP4 con imatrix frente a otras cuantizaciones del mismo modelo ni frente a modelos de tamano similar de otros desarrolladores.

## Limitaciones y advertencias

- Al ser una cuantizacion de 4,25 bits, es previsible cierta perdida de calidad respecto al modelo base sin cuantizar; no se han publicado mediciones que cuantifiquen esa degradacion.
- Riesgo de alucinacion: no disponible, no evaluado en la informacion proporcionada.
- Sesgos conocidos: no disponibles; dependen del dataset de entrenamiento del modelo base, que no se documenta aqui.
- Limitaciones de contexto e idioma: no disponibles, ya que no se declara ventana de contexto ni lista de idiomas.
- Licencia: no declarada en el repositorio. Esto es un bloqueo relevante para uso comercial, ya que no puede asumirse permiso de uso sin verificar la licencia del modelo base ggml-org/Qwen3.6-35B-A3B y del modelo original del que este derive.
- Dependencia de codigo no estandar: el escalamiento UOS de la cache KV MXFP4 y el mecanismo MXAttention provienen de un fork de llama.cpp, lo que puede provocar diferencias de salida entre runtimes y complicar la reproducibilidad.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de pruebas independientes.
- Fechas de creacion y actualizacion registradas en 2026, posteriores a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la trazabilidad del repositorio antes de usarlo en produccion.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo (corresponden a paginas de ayuda de YouTube y foros no relacionados), por lo que no aportan datos verificables adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/timlikesai/Qwen3.6-35B-A3B-MXFP4
- Modelo base en HuggingFace: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B
- Pull request del autor en llama.cpp (escalamiento UOS / MXAttention): https://github.com/timlikesai/llama.cpp/pull/14
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web relevantes: ninguno (los enlaces devueltos no guardan relacion con el modelo)
