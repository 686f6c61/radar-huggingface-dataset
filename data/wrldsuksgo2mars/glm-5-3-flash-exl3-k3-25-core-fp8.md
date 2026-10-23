# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8

## Resumen

GLM-5.3-Flash-EXL3-K3.25-Core-FP8 es un checkpoint derivado publicado por el usuario wrldsuksgo2mars, no un modelo entrenado desde cero. Se trata de un "stitch" (empalme) byte a byte de dos checkpoints existentes: por un lado, los expertos enrutados en cuantizacion EXL3 K3/K4 del repositorio wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1; por otro, las proyecciones del nucleo denso (q_a, kv_a, q_b y proyecciones de salida del mecanismo MLA), los MLP densos y los expertos compartidos, tomados en E4M3 (FP8) con escalas de bloque FP32 de 128x128 del modelo oficial zai-org/GLM-5.3-Flash. El resto de tensores (embeddings, cabeza de vocabulario, routers, normas, KDA en BF16 y la torre de vision incluida) se mantiene sin cambios respecto al origen EXL3.

El resultado es un unico artefacto de 73.089.112.926 parametros (73,09 mil millones) que sustituye al checkpoint EXL3 v1 en la receta de servicio "GLM Flash EXL3" del motor CuteAFD, evitando tener que cargar un segundo checkpoint en tiempo de ejecucion. El payload son 143.562.358.776 bytes de tensores (133,703 GiB) repartidos en 18 shards de safetensors, con una media efectiva de aproximadamente 15,7 bits por parametro.

Su relevancia es acotada y muy especifica: no aporta mejoras de calidad ni de velocidad declaradas, sino que resuelve un problema de empaquetado y procedencia de pesos para despliegue con mezcla de precisiones (expertos a 3 bits, nucleo en FP8). Es util para quien ya opere la receta de CuteAFD con GLM-5.3-Flash y quiera un unico checkpoint auditable; para el resto de casos, el modelo oficial zai-org/GLM-5.3-Flash o una cuantizacion estandar son opciones mas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atencion MLA (q_a, kv_a, q_b, output), expertos MTP, KDA en BF16 y torre de vision incluida |
| Parametros totales | 73.089.112.926 (73,09 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados (incluidos los MTP) en EXL3 K3/K4 (3 bits); nucleo denso en FP8 E4M3 con escalas de bloque FP32 128x128; BF16 en KDA, embeddings, cabeza de vocabulario, routers y normas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (18 shards, 143.562.358.776 bytes de tensores / 133,703 GiB); index y headers estandar, sin overlay |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-5.3-Flash oficial de zai-org: un transformer con mezcla de expertos que combina atencion multi-head latente (MLA) con proyecciones q_a, kv_a, q_b y de salida, expertos enrutados mas expertos compartidos, expertos adicionales para decodificacion multi-token (MTP), un modulo KDA y una torre de vision empaquetada en el mismo checkpoint. No hay informacion disponible sobre el numero de parametros activos por token, el numero de expertos, la longitud de contexto nativa ni la composicion del corpus de entrenamiento.

Este repositorio concreto no entrena ni calibra nada: es un empalme determinista de bytes. Los expertos enrutados y los expertos MTP conservan los bytes EXL3 K3/K4 del checkpoint wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1 en la revision 0490d2f708b12145f6516555ab066aaeb401cd21. Las proyecciones MLA, los MLP densos y los expertos compartidos usan los pesos E4M3 oficiales y las escalas de bloque FP32 de 128x128 de zai-org/GLM-5.3-Flash en la revision eb9eb208eb0d988989d07a6a12d0fdeb5f52574a. Todo lo demas (KDA en BF16, cabeza de vocabulario, embeddings, routers, normas y torre de vision) queda intacto respecto al origen EXL3. El fichero stitch-provenance.json registra ambas revisiones inmutables, el origen y el SHA256 de cada tensor y el resultado de la verificacion byte a byte; es evidencia de auditoria, no una entrada del loader. Los metadatos de cuantizacion originales se mantienen salvo la declaracion explicita de nucleo nativo FP8.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del checkpoint GLM-5.3-Flash subyacente; no hay evaluacion publicada en este repositorio.
- Codigo y matematicas: capacidades esperables del modelo base, no verificadas ni documentadas en la model card de este stitch.
- Vision: el checkpoint incluye la torre de vision del modelo original, por lo que el soporte de entrada de imagen depende del motor de inferencia que lo cargue (CuteAFD en la receta declarada); no se documentan resoluciones, formato de prompt ni tareas evaluadas.
- Tool calling y function calling: no documentado en este repositorio; depende del modelo base y del motor.
- Razonamiento multi-paso y agentes: no documentado; los expertos MTP del checkpoint apuntan a decodificacion especulativa o multi-token, pero el autor no publica cifras de aceleracion.
- Multilingue: no disponible; la model card no lista idiomas.
- Capacidad especial: checkpoint mixto EXL3 + FP8 pensado para una unica carga en el motor CuteAFD, con procedencia verificable por tensor.

## Casos de uso

- Servicio de asistente conversacional autoalojado: al empaquetar nucleo FP8 y expertos a 3 bits en un solo checkpoint, se simplifica el arranque y la gestion de versiones en un despliegue con CuteAFD, evitando cargar dos artefactos en memoria.
- Auditoria de cadena de suministro de pesos: stitch-provenance.json permite verificar SHA256 y revision de origen de cada tensor, util en entornos con requisitos de trazabilidad de artefactos de IA.
- Evaluacion comparativa de cuantizaciones: sirve como variante controlada (expertos EXL3 K3/K4 con nucleo FP8) frente al checkpoint EXL3 v1 y al modelo oficial, manteniendo el resto de tensores identico.
- Procesamiento de documentos con entrada visual: si el motor expone la torre de vision incluida, se puede usar para extraccion de texto y estructuracion de PDF o imagenes en pipelines internos, con validacion previa de calidad.
- Generacion de codigo en herramientas internas: integrable como backend de autocompletado o revision en un IDE o pipeline de CI, sujeto a verificar el soporte real de tool calling en el motor.
- Experimentacion en investigacion de MoE cuantizados: permite medir el impacto de mantener el nucleo denso en FP8 mientras los expertos permanecen a 3 bits, con un unico checkpoint de referencia.
- Despliegue en clústeres multi-GPU con memoria limitada: al reducir el peso a ~134 GiB, cabe en nodos de 2x H100 80 GB o 4x A100 80 GB, lo que facilita servir el modelo sin infraestructura de 8 GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se hacen nuevas afirmaciones de calidad ni de velocidad y que la cualificacion local del motor se reporta por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: los tensores suman 133,703 GiB; anadiendo cache KV, buffers de activacion y overhead del motor, conviene reservar al menos 145-155 GB de memoria de dispositivo para una carga completa en GPU. Cifras estimadas a partir del payload, no publicadas por el autor.
- GPU recomendadas: 2x H100 80 GB (160 GB) como configuracion minima realista; 4x A100 80 GB o 4x H100 80 GB para margen de contexto y concurrencia; 8x RTX 6000 Ada 48 GB (384 GB) como alternativa.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090; requeriria offload de expertos a RAM del sistema y el motor declarado (CuteAFD) no documenta ese modo en la informacion disponible.
- Opciones de despliegue: el autor declara la receta de servicio "GLM Flash EXL3" del motor CuteAFD, con libreria cuteafd en los metadatos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato EXL3 K3/K4 sugiere herramientas del ecosistema ExLlama, pero no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K3.25-Core-FP8 (este) | 73,09 B | Expertos EXL3 3 bits + nucleo FP8 E4M3 | no disponible | MIT | Publico en HuggingFace, 0 descargas, 0 likes |
| zai-org/GLM-5.3-Flash (oficial) | 73,09 B (derivado del base) | E4M3 FP8 con escalas de bloque FP32 128x128 | no disponible | no disponible en la informacion | Oficial de zai-org |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1 | 73,09 B (derivado del base) | Expertos EXL3 K3/K4, resto segun origen | no disponible | no disponible en la informacion | Publico en HuggingFace |

La comparacion con modelos de otros linajes (por ejemplo, familias MoE de tamano similar) no esta disponible en la informacion proporcionada; no se aportan numeros de rendimiento para ninguna de las tres variantes.

## Limitaciones y advertencias

- No es un modelo nuevo ni reentrenado: solo cambia la procedencia de almacenamiento de los tensores. Cualquier limitacion del GLM-5.3-Flash original se hereda integra.
- Ausencia total de evaluacion: sin benchmarks, sin cifras de perplexity ni de tasas de acierto; el autor declara explicitamente que no formula afirmaciones de calidad o velocidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es el comportamiento esperado de un modelo de lenguaje sin datos de evaluacion publicados.
- Idiomas y longitud de contexto no documentados, lo que impide planificar despliegues multilingues o de contexto largo sin pruebas propias.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 22 de octubre de 2026 en un margen de un minuto: no hay evidencia de uso en produccion ni de validacion por terceros.
- Dependencia de un motor concreto (libreria cuteafd): la carga de KDA y de la cabeza de vocabulario queda, segun el autor, bajo responsabilidad del motor; otros runtimes pueden no interpretar el checkpoint.
- La licencia MIT se declara en este repositorio derivado, pero la licencia y las condiciones del modelo base zai-org/GLM-5.3-Flash no constan en la informacion disponible; conviene verificar los terminos del origen antes de un uso comercial.
- Mezcla de precisiones poco convencional (expertos a 3 bits con nucleo FP8): puede producir divergencias numericas respecto al modelo oficial no medidas; se recomienda una bateria de evaluacion propia antes de produccion.
- El formato EXL3 K3/K4 tiene perdida de precision frente a BF16/FP16; el impacto real en tareas de codigo, matematicas o vision no esta cuantificado.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8
- Modelo base oficial: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint EXL3 de origen: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1
