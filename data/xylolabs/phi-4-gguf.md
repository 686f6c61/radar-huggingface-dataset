# Xylolabs/phi-4-GGUF

## Resumen

Xylolabs/phi-4-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo microsoft/phi-4, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. No se trata de un modelo nuevo, sino de una distribucion optimizada del phi-4 original de Microsoft, un transformer denso de aproximadamente 14.660 millones de parametros orientado a generacion de texto y razonamiento. El repositorio incluye cuatro archivos cuantizados: Q5_K_M, Q4_K_M, IQ4_XS e IQ4_XS-imat.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 15.000 millones de parametros en hardware de consumo, algo inviable con los pesos en BF16 (unos 29 GB). Con la cuantizacion Q4_K_M (9,059 GB) o IQ4_XS (8,259 GB) el modelo cabe en GPUs de 12-16 GB de VRAM, y con Q5_K_M (10,5 GB) en GPUs de 24 GB como la RTX 4090 o la RTX 3090 con contexto de hasta 16K segun las recomendaciones del autor.

El modelo esta publicado bajo licencia MIT, soporta ingles y coreano segun los metadatos del repositorio, y esta pensado para inferencia local mediante llama-cli o llama-server. La model card incluye una tabla de precision frente a BF16 con metricas de divergencia KL y acuerdo top-1, lo que permite elegir el nivel de cuantizacion con criterio tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base microsoft/phi-4) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K recomendado por el autor en la tabla de hardware; contexto nativo del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Esta publicacion no introduce arquitectura nueva: es una conversion a GGUF y cuantizacion de microsoft/phi-4, un transformer denso de 14.660 millones de parametros. La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentacion del modelo base de Microsoft y no se reproducen aqui.

La innovacion tecnica de este repositorio esta en el proceso de cuantizacion y en su evaluacion. El autor publica una tabla de precision frente a BF16 con divergencia KL sobre WikiText-2 y sobre un conjunto held-out, ademas del acuerdo top-1, comparando sus propios archivos con los de Unsloth y con las cuantizaciones nativas de llama.cpp. Destaca la variante IQ4_XS-imat, generada con importance matrix, que con 8,187 GB obtiene mejor KL (0,017889 en WikiText-2) que el IQ4_XS sin imatrix (0,018695) pese a ocupar menos espacio. Las conversiones se validaron con el commit cd959bae99ff4bed22bef2604f45241c09bbb8c8 de llama.cpp.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con soporte de plantilla de chat via `--jinja` en llama.cpp.
- Razonamiento y resolucion de problemas de tipo matematico y logico, heredados del modelo base phi-4.
- Generacion de codigo y explicaciones tecnicas.
- Soporte multilingue limitado a ingles y coreano segun los metadatos del repositorio.
- Inferencia en CPU, CUDA y Metal gracias al backend GGUF de llama.cpp.
- Compatibilidad con `llama-server` para exponer el modelo como API HTTP compatible con endpoints.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento extendido.

## Casos de uso

- Asistente de codigo en local: con Q4_K_M (9,059 GB) el modelo cabe en una GPU de 12 GB y permite autocompletado y explicacion de fragmentos sin enviar codigo a servicios externos, util en entornos con requisitos de confidencialidad.
- Chatbot de atencion al cliente en ingles o coreano: desplegado con `llama-server` sobre una RTX 4090 con Q5_K_M y contexto de 16K, puede gestionar conversaciones multi-turno con historial amplio.
- Procesamiento por lotes de documentos: la variante IQ4_XS-imat (8,187 GB) permite ejecutar el modelo en una sola GPU de 16 GB y procesar resumenes o extraccion de informacion sobre corpus en ingles.
- Prototipado en estaciones de trabajo Apple Silicon: con Metal y 128 GB de memoria unificada (Mac Studio) se puede ejecutar Q5_K_M con contexto de 16K segun la tabla del autor.
- Educacion e investigacion: al ser MIT y ejecutable en CPU, sirve para experimentos de evaluacion de cuantizaciones comparando KL y top-1 entre archivos.
- Sustitucion de APIs en entornos air-gapped: al no requerir conectividad, se puede integrar en pipelines internos que necesiten generacion de texto sin dependencia de la nube.
- Evaluacion comparativa de cuantizaciones: los datos de KL y top-1 publicados permiten seleccionar el archivo con el mejor compromiso tamano/precision para un hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| Q5_K_M | 10,500 GB | 0,005030 | 96,270% | 0,003265 | 97,118% |
| Q4_K_M | 9,059 GB | 0,016550 | 94,039% | 0,012006 | 94,725% |
| IQ4_XS | 8,259 GB | 0,018695 | 93,539% | 0,013586 | 94,412% |
| IQ4_XS-imat | 8,187 GB | 0,017889 | 93,598% | 0,012414 | 94,471% |

Como referencia, el autor incluye tambien Q8_0 (0,000465 KL, 98,706% top-1), Q6_K (0,002103 KL, 97,583% top-1) y Q3_K_M (0,051110 KL, 89,721% top-1) de otros publicadores.

## Requisitos de hardware

- VRAM estimada: Q5_K_M 10,5 GB, Q4_K_M 9,059 GB, IQ4_XS 8,259 GB, IQ4_XS-imat 8,187 GB (solo pesos; hay que sumar la cache KV para el contexto).
- GPU recomendadas por el autor: RTX 4090 o RTX 3090 (24 GB) con Q5_K_M y contexto 16K; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); DGX Spark (128 GB unificada); Mac Studio M5 Max (128 GB); H200 (141 GB); B200 (192 GB); Mac Studio M5 Ultra (256 GB y 512 GB); B300 (288 GB).
- Cabe en GPU de consumo: si. Q4_K_M e IQ4_XS caben en GPUs de 12 GB; Q5_K_M requiere 16-24 GB para contexto amplio.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con CUDA, Metal o CPU. No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/phi-4-GGUF | 14,66 B | 16K recomendado | MIT | GGUF | Cuantizaciones Q5_K_M, Q4_K_M, IQ4_XS, IQ4_XS-imat con tabla de KL publicada |
| microsoft/phi-4 | 14,66 B | no disponible en la informacion | MIT | safetensors | Modelo base en BF16; requiere ~29 GB de VRAM |
| Unsloth phi-4 (cuantizaciones) | 14,66 B | no disponible | MIT | GGUF | Referenciado en la tabla de precision del autor con Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |

## Limitaciones y advertencias

- Al ser una cuantizacion, introduce perdida de precision respecto a BF16: Q4_K_M baja al 94,039% de acuerdo top-1 en WikiText-2 y Q3_K_M al 89,721%, por lo que no se recomienda Q3 o inferior para tareas sensibles.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones adicionales en esta publicacion.
- Sesgos conocidos del modelo base no documentados en la informacion disponible.
- Idiomas soportados limitados a ingles y coreano segun los metadatos; el rendimiento en castellano no esta garantizado ni evaluado.
- La licencia MIT permite uso comercial, pero el autor recomienda citar la release original de Microsoft Phi-4.
- El contexto de 16K es una recomendacion practica del autor para el hardware listado, no necesariamente el limite nativo del modelo base.
- La model card no documenta soporte de tool calling ni de agentes multi-paso; conviene validarlo antes de usarlo en produccion.
- Requiere una version concreta de llama.cpp (commit cd959bae) para reproducir los resultados; versiones distintas pueden dar metricas diferentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- Licencia: https://huggingface.co/Xylolabs/phi-4-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
