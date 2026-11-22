# tw-ilson/Inkling-2-Mini-OBLITERATUS-GGUF

## Resumen

Inkling-2-Mini-OBLITERATUS-GGUF es una version modificada del modelo thinkingmachines/Inkling-2-Mini, un modelo de arquitectura Mixture of Experts (MoE) desarrollado por Thinking Machines. Esta variante, publicada por el usuario tw-ilson, aplica la tecnica OBLITERATUS para reducir el comportamiento de rechazo (refusal) del modelo original, un proceso conocido como "abliteration". El resultado se distribuye exclusivamente en formato GGUF para su uso con llama.cpp.

La modificacion afecta unicamente al backbone de texto: los tensores de vision y de MTP (multi-token prediction) no estan incluidos en estos ficheros. Se han alterado 40 tensores mas los expertos en las capas 4, 5, 10, 11, 18, 19, 22 y 23, aplicando el metodo `advanced` con 4 direcciones de rechazo y 32 prompts de extraccion daninos mas 32 inofensivos, sin regularizacion.

El modelo es relevante para desarrolladores que necesitan ejecutar localmente un MoE de gran contexto (hasta 1M tokens segun el autor) sin las restricciones de rechazo del modelo base, pero con la advertencia explicita de que la calidad de la modificacion no ha sido medida con perplexity ni benchmarks. La licencia Apache 2.0 permite uso comercial, aunque el autor declina responsabilidad sobre el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; solo backbone de texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (por defecto en el modelo base; el autor recomienda usar muy por debajo, p. ej. `-c 65536`) |
| Tipos de cuantizacion | bf16, Q8_0, MXFP4-Q8 (expertos enrutados de capas 0-19 en MXFP4, resto Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts, segun indica la etiqueta `moe` del repositorio. El checkpoint original se distribuye en NVFP4/MXFP8 y fue dequantizado a bf16 en carga mediante transformers PR #51050. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion principal de esta variante es el proceso de abliteration mediante OBLITERATUS (metodo `advanced`): se identifican direcciones de rechazo en el espacio de activaciones y se proyectan fuera los pesos correspondientes. El autor necesito modificaciones locales para esta arquitectura: soporte en el loader, bypass del dequantizador y proyeccion de los pesos de atencion envueltos (`*_proj.linear`). Se alteraron 40 tensores mas los expertos en ocho capas concretas. Posteriormente los tensores editados se parchearon en el layout del checkpoint original y se convirtieron con el conversor estandar de llama.cpp y `llama-quantize`.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Inkling-2-Mini, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de contexto largo: el modelo base admite hasta 1M tokens, si bien el autor recomienda reducir la ventana en la practica.
- Capacidades MoE: enrutamiento por expertos, con los expertos de las capas 0-19 cuantizados en MXFP4 en la variante MXFP4-Q8.
- Reduccion de rechazo: el comportamiento de refusal se ha debilitado deliberadamente, lo que permite respuestas a prompts que el modelo original rechazaria.
- Vision: no incluida en estos ficheros GGUF (los tensores de vision no estan presentes).
- Multi-token prediction (MTP): no incluida en estos ficheros.
- Tool calling, agentes y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo, comparando respuestas con el modelo base en un entorno controlado.
- Despliegue local en hardware de consumo: la variante MXFP4-Q8 (17 GB) permite ejecutar un MoE de gran contexto en equipos con VRAM moderada mediante llama.cpp, con velocidades de decodificacion de hasta ~25 t/s en un Strix Halo.
- Generacion de texto creativo sin filtros: escritores e investigadores pueden usar el modelo para explorar narrativas o dialogos que el modelo original rechazaria por contenido sensible.
- Procesamiento de documentos largos: con una ventana configurable (p. ej. 65536 tokens) se pueden resumir o analizar contratos, articulos o codebases extensas en local.
- Experimentacion con cuantizaciones MoE: la variante MXFP4-Q8 sirve como caso de estudio de cuantizacion mixta de expertos enrutados, comparando calidad y velocidad frente a Q8_0 y bf16.
- Evaluacion de pipelines de abliteration: desarrolladores de herramientas de edicion de modelos pueden reproducir el proceso OBLITERATUS sobre esta arquitectura y validar los cambios necesarios en el loader.
- Prototipado de asistentes sin restricciones en entornos de investigacion cerrados: util para probar respuestas del modelo ante prompts adversariales antes de decidir sobre su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha medido la perplexity ni comparado contra el modelo original. Como unica referencia cualitativa, una prueba greedy con el prompt "The capital of France is" produjo "Paris." seguido de texto repetido, comportamiento que el GGUF original no mostro en la misma prueba (prompt crudo, sin plantilla de chat, ejecucion unica).

Datos de velocidad de decodificacion en Strix Halo (gfx1151, ROCm):

| Variante | Tamano | Velocidad de decodificacion |
|---|---|---|
| bf16 | 52 GB | 11,7 t/s |
| Q8_0 | 28 GB | 20,3 t/s |
| MXFP4-Q8 | 17 GB | ~25 t/s |

## Requisitos de hardware

- VRAM estimada: 52 GB para bf16, 28 GB para Q8_0 y 17 GB para MXFP4-Q8 (tamanos de fichero; la VRAM real puede ser algo superior por overhead de contexto y KV cache).
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090 (24 GB) o similar para MXFP4-Q8; Q8_0 requiere 32 GB o mas, por lo que queda fuera de GPUs de consumo de 24 GB.
- Cabe en GPU de consumo: si, la variante MXFP4-Q8 (17 GB) en GPUs con 24 GB de VRAM como la RTX 4090, siempre con contexto reducido.
- Opciones de despliegue: llama.cpp con soporte para Inkling 2 Mini (`model : Inkling 2 Mini`, PR #32694 o posterior; probado en el commit `46eb1742d`). No se documenta soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: medidos en Strix Halo (ROCm): 11,7 t/s en bf16, 20,3 t/s en Q8_0 y ~25 t/s en MXFP4-Q8. No hay datos para otras GPUs.
- Nota: se debe usar un tamano de contexto muy inferior al 1M por defecto, por ejemplo `-c 65536`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-OBLITERATUS-GGUF | no disponible (MoE) | 1M (recomendado menor) | GGUF | Apache 2.0 | Abliterated, solo texto, calidad no medida |
| thinkingmachines/Inkling-2-Mini | no disponible (MoE) | 1M | no disponible | no disponible | Modelo base original, con vision y MTP |
| Alternativas abliterated de otros MoE | no disponible | no disponible | GGUF | variable | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria; los datos de parametros y rendimiento del modelo base no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Calidad no medida: no se ha calculado perplexity ni ejecutado benchmarks contra el modelo original; la degradacion introducida por la abliteration es desconocida.
- Degradacion observada: en una prueba greedy el modelo entro en bucle de repeticion tras generar "Paris.", algo que el GGUF original no hizo en la misma prueba.
- Validacion de refusal limitada: la reduccion de rechazo se comprobo en un punado de prompts en transformers antes de la conversion, no con un benchmark, y algunos prompts de prueba se solapaban con el conjunto de extraccion.
- Cuantizaciones no evaluadas individualmente: los ficheros Q8_0 y MXFP4-Q8 no se han evaluado por separado.
- Sin vision ni MTP: los tensores de vision y multi-token prediction no estan incluidos, por lo que el modelo no puede procesar imagenes ni aprovechar la decodificacion especulativa nativa.
- Contexto: aunque el modelo base admite 1M tokens, el autor recomienda usar ventanas muy inferiores (p. ej. 65536); no se documenta el rendimiento en contextos largos.
- Seguridad reducida: el modelo tiene comportamiento de rechazo debilitado; el autor declara que el usuario es responsable de su uso.
- Idiomas: no se especifican los idiomas soportados.
- Dependencia de version: requiere una build de llama.cpp con soporte especifico para Inkling 2 Mini (PR #32694 o posterior); versiones anteriores no cargaran el modelo.
- Licencia: Apache 2.0 permite uso comercial, pero la modificacion abliterated puede tener implicaciones legales o de cumplimiento en determinados contextos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tw-ilson/Inkling-2-Mini-OBLITERATUS-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- PR de transformers para dequantizacion: https://github.com/huggingface/transformers/pull/51050
- PR de llama.cpp con soporte Inkling 2 Mini: https://github.com/ggml-org/llama.cpp/pull/32694
