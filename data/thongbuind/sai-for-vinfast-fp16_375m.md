# thongbuind/SAI-for-VinFast-FP16_375M

## Resumen

SAI-for-VinFast-FP16_375M es un checkpoint de generación de texto de 375.194.624 parámetros publicado por el usuario thongbuind en HuggingFace, orientado a tareas de asistente virtual a bordo de vehículos VinFast. El modelo se distribuye exclusivamente en formato GGUF con pesos en FP16 (las capas de normalización se mantienen en F32) y su idioma declarado es únicamente el vietnamita (vi). La model card lo describe como un modelo conversacional ("trợ lí ảo trên xe VinFast"), con una configuración de 24 capas, dimensión de modelo d_model=1024, 16 cabezas de consulta y 4 cabezas de clave/valor.

El interés de esta ficha es doble. Por un lado, es un ejemplo de modelo ultracompacto (menos de 400 millones de parámetros, ~716 MiB de pesos) pensado para ejecución en el propio vehículo o en hardware de gama baja, no en servidores con GPU de datacenter. Por otro, incorpora un tokenizer propio (etiquetado como "SAI") que requiere un parche específico de llama.cpp (`llama-ugm-byte-fallback.patch`) sobre la revisión `cb7934c52ca8710994b2ecc19775ebefcfdb8d01` para preservar correctamente el byte fallback; ni llama.cpp stock ni Ollama están verificados por el autor.

La relevancia actual del checkpoint es limitada pero concreta: se trata de un artefacto muy reciente (creado el 8 de octubre de 2026), con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia de pesos especificada y sin evaluación de calidad publicada sobre datos held-out de VinFast. El autor solo aporta una verificación numérica de equivalencia FP16 frente a FP32, no una evaluación funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion de consultas agrupadas (GQA); inferida de la configuracion declarada (24 capas, d_model=1024, 16 cabezas de consulta, 4 cabezas KV) |
| Parametros totales | 375.194.624 (~375 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible como limite de entrenamiento; la verificacion del autor cubre prefill y decode con KV cache hasta 1024 tokens |
| Tipos de cuantizacion | FP16 (norm en F32) en GGUF. No se publican variantes Q8_0, Q4_K_M ni similares |
| Idiomas soportados | Vietnamita (vi) exclusivamente |
| Licencia | No disponible; el propietario no ha designado licencia para los pesos |
| Formato de pesos | GGUF (archivo `SAI-for-VinFast-FP16_375M.gguf`, 715,95 MiB), con config y tokenizer embebidos |
| Tamano del repositorio | 0,8 GB |
| Version de runtime requerida | llama.cpp en revision `cb7934c52ca8710994b2ecc19775ebefcfdb8d01` + `llama-ugm-byte-fallback.patch` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de forma explicita, pero si publica los hiperparametros de configuracion: 24 capas, d_model=1024, 16 cabezas de consulta y 4 cabezas de clave/valor. Esa relacion 4:1 entre cabezas de consulta y cabezas KV corresponde a un esquema de atencion de consultas agrupadas (GQA), habitual en modelos compactos para reducir el tamano de la cache KV durante la decodificacion. Con 24 capas y 4 cabezas KV de 64 dimensiones (1024/16), la cache KV ocupa aproximadamente 24 KB por token en FP16, lo que a 1024 tokens supone unos 24 MB.

El checkpoint distribuido es una conversion a FP16 con la excepcion de las capas de normalizacion, que se mantienen en F32. La configuracion y el tokenizer viajan dentro del propio archivo GGUF, de modo que no requieren descarga separada. El tokenizer es propio (familia "SAI") y su byte fallback no funciona correctamente en compilaciones estandar de llama.cpp, de ahi el parche exigido por el autor. La plantilla de chat tambien va embebida en el GGUF y aplica lowercase al contenido en vietnamita.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otra fase de alineamiento, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM, etc.). El autor indica explicitamente que la verificacion publicada es tecnica y que no se ha evaluado la calidad de las respuestas sobre un conjunto held-out de VinFast.

## Capacidades

- Generacion de texto conversacional en vietnamita, con plantilla de chat integrada en el archivo GGUF.
- Respuestas de asistente virtual orientadas al dominio de vehiculos VinFast, segun la descripcion del autor; no se detalla la cobertura funcional real.
- Ejecucion en llama.cpp mediante carga directa del GGUF, con soporte de prefill y decodificacion con cache KV verificados hasta 1024 tokens.
- Etiquetas declaradas por el autor: `conversational`, `endpoints_compatible`, `text-generation`, `sai`, `vinfast`, `gguf`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documentan capacidades de codigo ni de matematicas; con 375 M de parametros y sin datos de evaluacion, no hay base para asumirlas.
- Multilingue: solo vietnamita; no se declara competencia en ingles ni en ninguna otra lengua.

## Casos de uso

- Asistente de voz embebido en el sistema de infoentretenimiento de un vehiculo VinFast: el modelo cabe en menos de 1 GB de memoria y puede ejecutarse en la propia unidad de a bordo (SoC automotriz o modulo tipo Jetson) sin depender de conectividad a la nube, lo que reduce latencia y evita enviar audio del habitaculo a servidores externos.
- Respuestas a preguntas frecuentes del propietario sobre el vehiculo (funcionamiento, mantenimiento, avisos del cuadro de instrumentos) en vietnamita, integradas en la app movil de la marca o en el panel del coche mediante una API de inferencia local.
- Control conversacional de funciones basicas por voz o chat: el modelo puede producir la respuesta textual en lenguaje natural, aunque la traduccion a comandos ejecutables (clima, ventanillas, navegacion) requeriria un componente externo de extraccion de intenciones, ya que no se documenta tool calling.
- Despliegue en hardware de recursos muy limitados: con pesos FP16 de ~716 MiB y una cache KV de ~24 KB por token, es viable en CPU moderna, en GPU integradas y en placas embebidas de 4-8 GB, un escenario donde modelos de 7 B o mas no son opcion.
- Investigacion y auditoria de la familia de tokenizers "SAI": el repositorio permite reproducir la prueba de byte fallback y verificar la equivalencia FP16/FP32 replicando el parche `llama-ugm-byte-fallback.patch` sobre la revision fijada de llama.cpp.
- Base para ajuste fino especifico de dominio (por ejemplo, terminologia de una gama concreta de vehiculos) partiendo de un backbone de 375 M entrenado en vietnamita, siempre que se resuelva antes la ambiguedad de licencia.
- Generacion de mensajes breves y notificaciones personalizadas en vietnamita dentro de un flujo de postventa o mantenimiento programado, con supervision humana y validacion de la salida.
- Prototipado rapido de un pipeline de dialogo de bajo coste para demostraciones internas, aprovechando que el modelo y su tokenizer se distribuyen en un unico archivo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y advierte de forma explicita que la validacion realizada es tecnica y no una evaluacion de respuestas sobre datos held-out de VinFast. Los unicos datos numericos disponibles son de verificacion de conversion:

| Metrica de verificacion | Valor declarado |
|---|---|
| Pesos | 715,95 MiB |
| Coincidencia de tokenizer | 13/13 casos |
| Puntos con logits finitos (prefill y decode con KV cache hasta contexto 1024) | 45 |
| Max relative RMSE (FP16 frente a FP32) | 0,003061 |
| Max KL | 0,000024 |
| Coincidencia top-1 frente a FP32 | 45/45 |

Las tablas comparativas de rendimiento con modelos similares no estan disponibles.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 0,7 GiB solo para pesos, mas 0,1-0,3 GiB de overhead del runtime; con cache KV de ~24 KB por token, una ventana de 1024 tokens anade unos 24 MB. En la practica, 1,0-1,3 GiB son suficientes (estimacion derivada del recuento de parametros y de la configuracion declarada, no medida por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM sirve, incluidas GTX 1050 Ti, GTX 1650, RTX 3050/3060, RTX 4090, A100 o H100 (estas ultimas muy sobredimensionadas para este tamano). Tambien es viable en CPU, GPU integradas y aceleradores embebidos tipo Jetson Orin Nano.
- Cabe holgadamente en GPU de consumo: es el escenario natural del modelo, orientado a ejecucion local en el vehiculo.
- Opciones de despliegue: llama.cpp es la unica ruta verificada por el autor, y exige la revision `cb7934c52ca8710994b2ecc19775ebefcfdb8d01` con el parche `llama-ugm-byte-fallback.patch` aplicado antes de compilar. llama.cpp stock y Ollama no estan verificados. No hay informacion sobre vLLM, TGI, SGLang ni otros servidores; dada la dependencia de un tokenizer parcheado y de GGUF, su uso requeriria trabajo adicional.
- Latencia y throughput estimados: no disponibles.
- Requisito practico a tener en cuenta: sin el parche de byte fallback, el tokenizer SAI puede producir una tokenizacion incorrecta y degradar las respuestas, por lo que un despliegue "estandar" no es equivalente al validado.

## Comparativa con modelos similares

No existe una alternativa directamente equivalente en el nicho de asistente de vehiculo en vietnamita con datos publicos. La comparacion siguiente se establece con modelos compactos de proposito general de tamano similar; los datos de las alternativas provienen de sus model cards publicas y no de esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAI-for-VinFast-FP16_375M | 375 M | No disponible (verificado hasta 1024 tokens) | Vietnamita | No disponible | GGUF FP16 en HuggingFace; requiere llama.cpp parcheado |
| SmolLM2-360M-Instruct | ~362 M | 8.192 tokens | Ingles principalmente | Apache-2.0 | Pesos safetensors y GGUF; ampliamente integrado en ecosistema |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | Multilingue (incluye chino e ingles) | Apache-2.0 | safetensors, GGUF y soporte en vLLM, TGI, Ollama |

La diferencia clave no es el rendimiento, que no esta medido en el caso de SAI-for-VinFast, sino la madurez: las alternativas tienen licencia explicita, tokenizers estandar, soporte en multiples runtimes y evaluaciones publicadas, mientras que este checkpoint depende de una revision concreta de llama.cpp y de un parche de tokenizer, y no aclara las condiciones de uso comercial.

## Limitaciones y advertencias

- Licencia no designada: el propietario de los pesos no ha especificado licencia, por lo que no puede asumirse uso comercial ni redistribucion. Es un bloqueo potencial para cualquier integracion en producto.
- El tokenizer requiere un parche especifico de llama.cpp. Sin `llama-ugm-byte-fallback.patch` sobre la revision indicada, el byte fallback puede comportarse de forma distinta a la validada; llama.cpp stock y Ollama no estan verificados.
- La plantilla de chat aplica lowercase al contenido en vietnamita. Esto puede degradar el tratamiento de nombres propios, siglas, matricula o cualquier texto sensible a mayusculas.
- Contexto: no se publica la ventana de entrenamiento; la unica verificacion disponible llega a 1024 tokens. No hay garantia de comportamiento correcto mas alla de esa longitud.
- Ausencia total de evaluacion de calidad: no hay benchmarks ni validacion sobre held-out de VinFast. Solo se acredita que la conversion FP16 reproduce los logits FP32, no que las respuestas sean utiles o correctas.
- Riesgo de alucinacion elevado por tamano: con 375 M de parametros, la precision factual en dominios abiertos es limitada y no hay mecanismo de grounding documentado; no debe usarse sin supervision en tareas con consecuencias (diagnostico del vehiculo, seguridad, garantias).
- Sesgos: no evaluados ni documentados por el autor.
- Idioma: soporte exclusivo de vietnamita. No se declara capacidad en ingles, castellano ni otras lenguas, y el rendimiento fuera del vietnamita es impredecible.
- Escasa validacion externa: 0 descargas y 0 likes en el momento de esta ficha, lo que implica que no existe retroalimentacion de la comunidad sobre su comportamiento real.
- Capacidades ausentes: no se documenta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido, lo que limita su uso en flujos que requieran ejecutar acciones.
- Fechas de publicacion muy recientes (8 de octubre de 2026) y sin historial de versiones: cualquier despliegue en produccion asume un riesgo de mantenimiento no evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thongbuind/SAI-for-VinFast-FP16_375M
- Archivo de pesos: `SAI-for-VinFast-FP16_375M.gguf` (incluido en el repositorio de HuggingFace)
- Manifiesto con hashes de origen, tokenizer, parche y pesos: `manifest.json` (incluido en el repositorio de HuggingFace)
- Parche requerido: `llama-ugm-byte-fallback.patch` (incluido en el repositorio de HuggingFace)
- Repositorio de llama.cpp, revision fijada `cb7934c52ca8710994b2ecc19775ebefcfdb8d01`: https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a contenido no relacionado (paginas de la plataforma Roblox) y se descartan. No se han localizado papers, blogs tecnicos, repositorios adicionales ni demos asociados al checkpoint.
