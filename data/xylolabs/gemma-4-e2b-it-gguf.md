# Xylolabs/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B IT es un modelo de lenguaje de Google DeepMind publicado en 2026 dentro de la familia Gemma 4. Esta ficha describe la version cuantizada en GGUF publicada por Xylolabs, que conserva unicamente el decodificador de texto del modelo original (se omiten el codificador de vision y el proyector) y lo empaqueta en un unico fichero de 3,304 GB con cuantizacion mixta IQ4_XS con importance matrix. El resultado es un artefacto de inferencia para llama.cpp orientado a despliegue en hardware modesto.

El modelo base cuenta con 4.647.450.147 parametros totales segun los pesos en safetensors del repositorio original. La cuantizacion conserva 601 tensores distribuidos en las 35 capas del decodificador de texto, mas embeddings, estructuras de salida, tokenizer y plantilla de chat original. El autor declara que no se realizo entrenamiento, calibracion ni cuantizacion nueva para esta publicacion: se reutiliza una importance matrix existente y los metadatos originales.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantizacion de referencia con metricas de fidelidad publicadas (KL medio y acuerdo top-1 frente a BF16 y frente a Q4_K_M). Por otro, advierte de que se trata de un derivado solo-texto de un modelo multimodal, con implicaciones practicas para quien espere capacidades de vision. La licencia es Apache 2.0 segun la declaracion del autor, heredada de la publicacion original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Gemma 4), 35 capas |
| Parametros totales | 4.647.450.147 (modelo base en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso limita `-c 2048` y la evaluacion usa 8.192 tokens |
| Tipos de cuantizacion | IQ4_XS con importance matrix (mixta: BF16 x1, F32 x283, IQ4_XS x280, Q5_K x35, Q6_K x2); 5,660 bits/peso de media |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico fichero: `gemma-4-E2B-it-IQ4_XS-imat.gguf`) |

Datos adicionales: tamano del repositorio 3,3 GB; descarga del fichero 3,304 GB; memoria de dispositivo estimada para los pesos del decodificador de texto 3,29 GB, sin contar KV cache ni buffers.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4, con 35 capas en el decodificador de texto segun los tensores presentes en el GGUF. La publicacion original de Google es multimodal (incluye codificador de vision y proyector), pero esta exportacion elimina ambas partes y conserva exclusivamente la ruta de texto. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineacion; la model card remite al informe tecnico de Gemma 4 (arXiv 2607.02770) para esos datos.

La innovacion tecnica relevante de esta publicacion es el proceso de cuantizacion. Se emplea IQ4_XS con importance matrix, una tecnica que pondera el error de cuantizacion por la importancia de cada peso estimada a partir de activaciones de calibracion. El autor conserva el resultado de importance matrix existente y los metadatos originales de cuantizacion, y declara explicitamente que no se ejecuto un forward nuevo del modelo BF16: el profesor BF16 utilizado es bit-exacto respecto a las 32 porciones PT originales almacenadas. La mezcla de tipos (Q6_K en las tablas de embedding de tokens y de entrada por capa) eleva la media global a 5,660 bits/peso, por encima de la precision nominal del tensor IQ4_XS.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con plantilla de chat original incluida en el GGUF.
- Modo de razonamiento (thinking) activable mediante `--chat-template-kwargs '{"enable_thinking":true}'`; la evaluacion del autor incluye 7 comprobaciones con thinking activado.
- Ejecucion en llama.cpp (`llama-cli`, y por extension `llama-server`) con soporte de plantilla Jinja.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No incluye vision: el codificador de vision y el proyector fueron omitidos deliberadamente.
- No se documentan en la informacion disponible capacidades de tool calling, function calling ni agentes multi-paso.
- Capacidades multilingues limitadas a los idiomas declarados (en, ko); no se documentan otros idiomas.

## Casos de uso

- Inferencia local en equipos con GPU de consumo: el fichero de 3,304 GB permite cargar el modelo completo en GPUs con 8 GB o mas de VRAM dejando margen para KV cache y buffers, lo que facilita prototipado sin infraestructura dedicada.
- Evaluacion de fidelidad de cuantizaciones: las metricas publicadas (KL medio, acuerdo top-1, comparacion relativa frente a Q4_K_M) sirven como referencia para equipos que quieran validar sus propias cuantizaciones contra un artefacto con umbrales definidos.
- Despliegue de asistentes conversacionales en ingles o coreano: la plantilla de chat original y el soporte de `llama-server` permiten montar un endpoint de generacion de texto con contexto de hasta 8.192 tokens segun la configuracion de evaluacion.
- Tareas de generacion de texto de un solo turno: el ejemplo verificado del autor (pregunta directa con respuesta corta, temperatura 0) demuestra un caso de uso estable para extraccion de respuestas factuales simples.
- Sustitucion de un modelo mayor en pipelines con restricciones de memoria: al tratarse de un derivado solo-texto de 4,65 mil millones de parametros, encaja en entornos donde no cabe un modelo multimodal completo pero se necesita la calidad del decodificador de texto de Gemma 4.
- Pruebas de regresion de pipelines llama.cpp: el autor verifica el fichero con una version concreta de llama.cpp (v0.9.0) y comandos reproducibles, lo que lo hace util como caso de prueba en integracion continua de herramientas basadas en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad de la cuantizacion frente al modelo BF16 y frente a una referencia Q4_K_M:

| Opcion | KL medio | Acuerdo top-1 con BF16 | KL / Q4_K_M | Respuestas correctas |
|---|---:|---:|---:|---|
| Referencia Q4_K_M | 0,321702 | 79,30% | 1,000x | 30/33 + 7/7 |
| IQ4_XS-imat | 0,162229 | 84,64% | 0,504x | 30/33 + 7/7 |

Metodologia declarada: 32 secuencias emparejadas de 512 tokens, 16.144 posiciones puntuadas, grupos de texto plano y chat en ingles y coreano, contexto de 8.192 tokens. El umbral de aceptacion relativo es 1,5x frente a Q4_K_M y el margen de respuestas permite como maximo una perdida contada adicional. El autor indica que no se reporta velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada: 3,29 GB solo para los pesos del decodificador de texto, mas KV cache y buffers de trabajo (no cuantificados en la informacion disponible).
- GPU recomendadas: no especificadas por el autor; por el tamano del fichero, cualquier GPU con 8 GB o mas de VRAM deberia poder alojar los pesos con margen para cache.
- GPU de consumo: si, cabe en tarjetas consumer de 8 GB en adelante; no se documentan pruebas en modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: llama.cpp (verificado con v0.9.0), `llama-cli` y, por compatibilidad de formato, `llama-server`; no se documenta soporte de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E2B-it-GGUF (esta ficha) | 4,65 B (base) | no disponible | GGUF IQ4_XS | Apache 2.0 | Solo texto; 3,304 GB; KL 0,162229 |
| Referencia Q4_K_M del mismo modelo base | 4,65 B (base) | no disponible | GGUF Q4_K_M | Apache 2.0 | Solo texto; KL 0,321702; 79,30% top-1 |
| google/gemma-4-E2B-it (original) | 4,65 B | no disponible | safetensors (BF16) | Apache 2.0 | Multimodal (texto + vision); referencia de fidelidad |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El artefacto es solo texto: se han eliminado el codificador de vision y el proyector, por lo que no puede procesar imagenes aunque el modelo base sea multimodal.
- Idiomas limitados a ingles y coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse en produccion sin evaluacion propia.
- La longitud de contexto real no se explicita en la informacion disponible; el ejemplo de uso limita a 2.048 tokens y la evaluacion usa 8.192, pero los metadatos originales de contexto "permanecen sin cambios" segun el autor.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.
- La evaluacion del autor es una comprobacion de fidelidad de cuantizacion (32 secuencias, 33+7 prompts), no una evaluacion de tareas; un despliegue real necesita su propia bateria de pruebas.
- El autor no reporta latencia ni throughput, por lo que el rendimiento en produccion debe medirse en el entorno objetivo.
- La licencia Apache 2.0 se declara heredada de la publicacion original de Google; el propio autor recomienda consultar los terminos completos en `LICENSE` y `NOTICE` del repositorio.
- El modelo se proporciona "as is", sin garantia ni aval del autor original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia en el repositorio: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF/blob/main/LICENSE
- Pagina oficial de licencia de Gemma: https://ai.google.dev/gemma/apache_2
- Documentacion de llama.cpp para GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf-llamacpp
- Codigo de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
