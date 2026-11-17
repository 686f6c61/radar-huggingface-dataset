# zephel01/GLM-5.3-Flash-DGX-Spark-GGUF

## Resumen

GLM-5.3-Flash-DGX-Spark-GGUF es una cuantizacion GGUF del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01 y orientada especificamente a ejecutarse en una unica NVIDIA DGX Spark (GB10 con 128 GB de memoria unificada). El modelo base es un transformer de tipo Mixture of Experts (MoE) con 320.759.404.382 parametros totales, publicado bajo licencia MIT. Esta version emplea una mezcla de tipos de cuantizacion (IQ2_XXS, IQ2_S, IQ3_XXS, Q2_K y Q3_K) que promedia 2,26 bits por peso, con un tamano de descarga de 94,1 GB repartido en cuatro shards.

La relevancia de esta publicacion radica en que conserva todos los expertos del modelo original (sin poda) y consigue un ajuste completo en la memoria unificada de un DGX Spark, dejando margen para contexto largo. El autor reporta una velocidad de 27,4 tok/s con decodificacion especulativa (bloque NextN del propio modelo) y 21,4 tok/s sin ella, sobre un prompt de 4K y una ventana medida de 3 x 512 tokens en un DGX Spark alquilado.

La ficha se centra en esta cuantizacion concreta: un artefacto de inferencia local en formato GGUF, pensado para el motor Abyss del mismo autor, con soporte declarado de ingles y japones, y con llama.cpp aun no verificado para estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), con bloque NextN para decodificacion especulativa |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del autor; maxima del modelo base no disponible |
| Tipos de cuantizacion | Mezcla por expertos: IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% (por bytes); 2,26 bits por peso de media |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB; fichero de entrada `-00001-of-00004.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de 320.759 millones de parametros totales. La model card de esta cuantizacion no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base zai-org/GLM-5.3-Flash y no se reproducen aqui.

La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion: se conservan todos los expertos de cada capa (sin poda) y se asignan tipos de cuantizacion distintos por experto segun su sensibilidad, usando calibracion con imatrix y el formato LDLQ. El autor reporta que el fichero lee aproximadamente un 8% menos de bytes por token que la referencia UD-IQ2_XXS de unsloth, con una divergencia KL ligeramente mejor (0,2534 frente a 0,2643 en 14 secuencias). Ademas, el motor Abyss aprovecha el bloque NextN del propio modelo para generar borradores especulativos que se verifican en una ventana por lotes, manteniendo los mismos tokens que sin drafting.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y japones.
- Razonamiento y respuesta a preguntas (la model card muestra ejemplos de aritmetica simple via API compatible con OpenAI).
- Inferencia local en hardware unico de memoria unificada, con todos los expertos presentes.
- Decodificacion especulativa mediante el bloque NextN del modelo, activada por defecto en Abyss sobre DGX Spark.
- Servicio via API compatible con el endpoint `/v1/chat/completions` de OpenAI a traves del servidor de Abyss.
- Soporte de contexto configurable (32.768 tokens en la configuracion de referencia).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni agentes multi-paso para esta cuantizacion.

## Casos de uso

- Inferencia local en un unico DGX Spark: el fichero completo cabe en los 128 GB de memoria unificada del GB10, lo que permite ejecutar un MoE de 320B sin cluster ni reparto entre nodos.
- Despliegue de un asistente conversacional en ingles y japones: el modelo declara soporte de ambos idiomas y puede servirse mediante una API compatible con OpenAI, integrable en aplicaciones existentes sin cambiar el cliente.
- Procesamiento de documentos con contexto medio: la configuracion de referencia admite 32.768 tokens, suficiente para resumir o extraer informacion de documentos tecnicos o contractuales de varias decenas de paginas.
- Laboratorio de evaluacion de cuantizaciones: el autor publica metricas de KL, tipos por tensor y scripts de verificacion, lo que permite reproducir y comparar variantes de cuantizacion sobre el mismo modelo base.
- Prototipado de pipelines RAG en local: al ejecutarse enteramente en una maquina, evita el envio de datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Experimentacion con decodificacion especulativa: el bloque NextN y la ventana de verificacion por lotes de Abyss sirven como banco de pruebas para medir el impacto del drafting en velocidad y calidad.
- Generacion de codigo y texto tecnico en ingles: el conjunto de calibracion incluye una secuencia de codigo y el modelo base es de proposito general, aunque no se publican benchmarks especificos de codigo para esta cuantizacion.

## Benchmarks y rendimiento

Calidad, medida como divergencia KL contra UD-Q4_K_XL de unsloth (top-k log-probs, 14 secuencias x 1.024 tokens: 8 en ingles, 1 de codigo, 5 en japones), motor Abyss, re-medida el 2026-11-08:

| Modelo | Descarga | Expertos | KL (14 seqs) | KL japones (5) | Mismo token top |
|---|---:|---:|---:|---:|---:|
| S1 (este repo) | 94,1 GB | todos | 0,2534 | 0,251 | 77,3% |
| unsloth UD-IQ2_XXS (referencia) | 101,8 GB | todos | 0,2643 | 0,257 | 76,6% |

Velocidad en un DGX Spark alquilado (GB10, 128 GB de memoria unificada), presupuesto de memoria por defecto, prompt de 4K, mediana de 3 x 512 tokens:

| Modelo | Con drafter NextN (v1.3.119) | Sin drafting | v1.3.118 con drafter |
|---|---:|---:|---:|
| S1 (este repo) | 27,4 tok/s | 21,4 tok/s | 24,3 tok/s |
| unsloth UD-IQ2_XXS | 24,2 tok/s | 19,8 tok/s | 22,9 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el fichero ocupa 94,1 GB y esta pensado para los 128 GB de memoria unificada de un DGX Spark (GB10), dejando unos 8 GB adicionales de margen para contexto largo frente a la referencia UD-IQ2_XXS.
- GPU objetivo: NVIDIA DGX Spark (GB10, arquitectura aarch64, sm_121). El autor ha medido la velocidad en este hardware concreto.
- GPU de consumo: no se documenta su ejecucion en GPUs de consumo como RTX 4090; el autor menciona que la comprobacion `--check` de Abyss pasa 12 de 12 en una RTX 5090, pero no se aportan cifras de velocidad en esa GPU.
- Opciones de despliegue: motor Abyss (backend CUDA, binario `strata`, servidor con API compatible con OpenAI). La carga con llama.cpp no esta verificada para estos ficheros segun la model card.
- Throughput: 27,4 tok/s con drafter NextN y 21,4 tok/s sin drafting en un DGX Spark, con prompt de 4K y ventana de 512 tokens. El rendimiento esta limitado por los 273 GB/s de ancho de banda de memoria del GB10, por lo que la velocidad depende de los bytes leidos por token.
- Contexto: 32.768 tokens en la configuracion de ejemplo; el autor indica que el ajuste deja unos 8 GB mas de memoria disponible para contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL) | Velocidad (DGX Spark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| S1 (este repo) | 320,8B totales (MoE) | 32.768 en config. de ejemplo | 0,2534 | 27,4 tok/s con drafter | MIT | GGUF, 94,1 GB |
| unsloth UD-IQ2_XXS | mismo modelo base | no disponible | 0,2643 | 24,2 tok/s con drafter | MIT (modelo base) | GGUF, 101,8 GB |
| GLM-5.3-Flash-IQ3_XXS-32G128G (mismo autor) | mismo modelo base | no disponible | no disponible | no disponible | MIT | GGUF, 127,9 GB, mayor calidad declarada |

## Limitaciones y advertencias

- Estado BETA: las mediciones se realizaron el 2026-11-07 en un DGX Spark alquilado y el autor advierte que el fichero puede sustituirse por una compilacion mejor, cambiando el nombre de la carpeta.
- La cuantizacion es agresiva (2,26 bits por peso de media, con expertos en IQ2_XXS e IQ2_S), lo que introduce degradacion respecto al modelo original; la KL de 0,2534 frente al Q4_K_XL es una medida de esa perdida.
- La carga con llama.cpp no esta verificada; el soporte esta validado unicamente en el motor Abyss del autor.
- Idiomas declarados limitados a ingles y japones; no se documenta calidad en castellano ni en otros idiomas.
- No se publican datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad para esta cuantizacion.
- El rendimiento medido corresponde a un unico hardware (DGX Spark); no debe extrapolarse a otras GPUs sin medicion.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial en produccion.
- El uso requiere descargar 94,1 GB en cuatro shards y verificar su integridad con `SHA256SUMS`; el proceso de empaquetado con `iq_pack.py` anade un paso adicional antes de servir el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Version 32G96G (mismos ficheros): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Version IQ3_XXS 32G128G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Guia DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+DGX-Spark+S1+on+GB10
