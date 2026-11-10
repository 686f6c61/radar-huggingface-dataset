# voxor-ai/gemma-4-26b-a4b-it-gguf

## Resumen

`voxor-ai/gemma-4-26b-a4b-it-gguf` es una conversión a formato GGUF del modelo `google/gemma-4-26B-A4B-it`, publicado por el usuario voxor-ai en Hugging Face. Se trata, por tanto, de un artefacto de distribución y no de un modelo entrenado desde cero: el trabajo del autor consiste en empaquetar los pesos originales de Google en un fichero GGUF cuantizado en Q8_0, comprimido con zstd, para facilitar su uso en entornos de inferencia local.

El modelo subyacente, Gemma 4 26B-A4B-it, pertenece a la familia Gemma de Google y sigue un esquema de mezcla de expertos (MoE), a juzgar por la nomenclatura "A4B": 26 000 millones de parámetros totales con aproximadamente 4000 millones activos por token. Es un modelo ajustado para instrucciones (sufijo `-it`) y, según la model card del autor, incluye soporte de decodificación especulativa mediante MTP (multi-token prediction), reflejado en el nombre del fichero `gemma-4-26B-A4B-it-Q8_0-MTP.gguf`.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 26B con coste computacional de un 4B activo en hardware de consumo o servidores modestos, siempre que se disponga de suficiente memoria para cargar los pesos cuantizados. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun nomenclatura A4B; detalles no disponibles |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | aproximadamente 4000 millones (4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `gemma-4-26B-A4B-it-Q8_0-MTP.gguf`, comprimido con zstd como `.zst`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-4-26B-A4B-it`. La nomenclatura "26B-A4B" indica un modelo de mezcla de expertos con 26 000 millones de parametros totales y aproximadamente 4000 millones activos por token, patron habitual en la familia Gemma 4 de Google para reducir el coste de inferencia manteniendo capacidad. El sufijo `-it` indica ajuste por instrucciones, y el sufijo `MTP` del fichero GGUF sugiere soporte de multi-token prediction, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y validarlos en paralelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales (atencion lineal, ventanas deslizantes, etc.). El repositorio de voxor-ai no incluye model card tecnica propia: solo documenta el proceso de conversion a GGUF y la compresion zstd de los ficheros superiores a 1 MB.

## Capacidades

- Generacion de texto y respuesta a instrucciones, por el ajuste `-it` del modelo base.
- Razonamiento multi-paso y conversacion multi-turno, segun el proposito declarado del modelo base.
- Soporte de decodificacion especulativa mediante MTP, que acelera la generacion en motores compatibles.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: el fichero GGUF Q8_0 permite cargar el modelo en llama.cpp u Ollama sin necesidad de infraestructura de servidores GPU dedicada, aprovechando que solo se activan unos 4B de parametros por token.
- Prototipado de asistentes conversacionales: el ajuste `-it` y la naturaleza MoE permiten mantener conversaciones multi-turno con un coste de computo por token reducido, adecuado para entornos de desarrollo y pruebas.
- Generacion de texto en pipelines offline: al ser un artefacto autocontenido en GGUF, se puede integrar en procesos batch de procesamiento de documentos sin dependencias de API externas.
- Evaluacion comparativa de cuantizaciones: el fichero Q8_0 sirve como referencia de alta fidelidad frente a cuantizaciones menores (Q4_K_M, Q5_K_M), util para medir la degradacion de calidad en tareas de razonamiento.
- Investigacion sobre decodificacion especulativa: el sufijo MTP permite experimentar con multi-token prediction en motores que lo soporten, comparando throughput frente a decodificacion autoregresiva clasica.
- Inferencia en entornos con memoria limitada: al ser MoE con 4B activos, el modelo puede ejecutarse en GPUs de consumo con suficiente VRAM para los pesos cuantizados, aunque el requisito de memoria total sigue siendo elevado por los 26B almacenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 26-28 GB solo para los pesos, mas overhead de contexto y cache KV. No cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) sin offloading a RAM.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o configuraciones multi-GPU. En consumer, posible con offloading parcial en RTX 4090 o RTX 5090.
- Cabe en consumer GPU: solo con offloading parcial o cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier motor compatible con GGUF. vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles. El uso de MTP podria mejorar el throughput en motores que lo soporten, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it (este GGUF) | 26B | ~4B | no disponible | Apache 2.0 | GGUF Q8_0 |
| google/gemma-4-26B-A4B-it | 26B | ~4B | no disponible | Apache 2.0 | safetensors (original) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- El tamano del repo es de 0.4 GB, muy inferior a lo esperable para un Q8_0 de 26B (que rondaria los 26-28 GB). Esto sugiere que el fichero puede estar incompleto, ser un puntero, o que la compresion zstd reduce drasticamente el tamano; conviene verificar la integridad antes de usarlo.
- Los ficheros superiores a 1 MB estan comprimidos con zstd (`.zst`) y deben descomprimirse antes de su uso.
- No hay model card tecnica del modelo base en este repositorio; la informacion sobre contexto, idiomas y capacidades es inexistente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas para este artefacto.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar `LICENSE` y `NOTICE` incluidos en el repositorio, asi como la licencia del modelo base de Google.
- Para produccion, se recomienda usar los pesos originales en safetensors con vLLM o TGI en lugar de esta conversion GGUF no validada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voxor-ai/gemma-4-26b-a4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
