# thinkspread/gemma-4-12b-it-Q4_K_S-GGUF

## Resumen

`thinkspread/gemma-4-12b-it-Q4_K_S-GGUF` es una conversión a GGUF del modelo `google/gemma-4-12b-it`, publicada por el usuario Think Spread. El repositorio incluye dos ficheros: el modelo cuantizado en Q4_K_S (7,17 GB) y el proyector multimodal `mmproj-f16.gguf` (0,12 GB), ambos generados con las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). El objetivo es ofrecer una versión ejecutable en hardware de consumo del Gemma 4 de 12B en su variante instruct, manteniendo la licencia Apache 2.0 del modelo original.

El modelo base cuenta con 11.907.350.576 parámetros (~11,9 B) y, según fuentes externas no oficiales, soporta entrada multimodal (texto, imagen, audio y vídeo) con una ventana de contexto de 256K, lo que lo situaría como una opción intermedia dentro de la familia Gemma 4, por debajo de la variante 26B A4B. La model card del repositorio no detalla arquitectura interna, composición del dataset ni resultados de evaluación; se limita a documentar el proceso de conversión, los tamaños y los hashes SHA-256 de cada fichero.

La relevancia de esta publicación es práctica: proporciona un artefacto GGUF concreto (no un quant "genérico") que, según el autor, es el que se usó como referencia en la matriz de soporte de tempo9 y en las pruebas del port de Gemma 4. Para un desarrollador que quiera reproducir ese entorno, disponer del binario exacto con hash verificable es útil; para cualquiera que busque el mejor quant posible, conviene comparar con las alternativas de unsloth y bartowski, que ofrecen variantes con imatrix y embeddings en Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalle de capas y atencion no disponible |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K segun gemmai4.com; no confirmado en la model card del repositorio |
| Tipos de cuantizacion | Q4_K_S (este repo); sin imatrix. Otras variantes en bartowski/gemma-4-12B-it-GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-12b-it-Q4_K_S.gguf` y `mmproj-f16.gguf`) |
| Tamano del repo | 7,3 GB |
| Tamano del fichero principal | 7,17 GB |
| SHA-256 del fichero principal | `a9311cd87e19413f8c7edf05fb498b6092a250d73e6d796217171d7c1efe32b8` |
| SHA-256 del proyector | `563192209f002b0a13af16a4992fdb9dd61187a36919eaf65f408bb47af3d272` |
| Modelo base | google/gemma-4-12b-it |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la pertenencia a la familia Gemma 4 se trata de un transformer decoder-only, pero la model card del repositorio no especifica numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida), uso de MoE ni estrategia de positional encoding. Tampoco se indica si el modelo emplea modos de razonamiento explicito o decodificacion especulativa.

Respecto al entrenamiento, la informacion disponible no incluye el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones mas alla de la denominacion `-it` del modelo base. Lo unico documentado en el repositorio es el postprocesado: conversion desde los safetensors de Google con `convert_hf_to_gguf.py`, cuantizacion a Q4_K_S con `llama-quantize` sin calibrar con imatrix, y conversion independiente del proyector multimodal (`mmproj`) en F16 para habilitar la entrada de imagen. El autor senala explicitamente que su Q4_K_S ocupa 7,17 GB frente a los 6,76 GB del Q4_K_S de unsloth, lo que sugiere diferencias en la mezcla de tipos por tensor y probablemente una calidad/velocidad distinta a igualdad de nombre de quant.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas, segun el tag `conversational` del repositorio.
- Razonamiento y summarization, citados en la documentacion oficial de Gemma 4 como tareas propias de la familia.
- Entrada multimodal de imagen a traves del proyector `mmproj-f16.gguf` incluido en el repositorio.
- Entrada de audio y video: mencionada por fuentes externas (gemmai4.com) para Gemma 4 12B; no verificable desde la model card del repositorio ni desde documentacion oficial enlazada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio no lista idiomas.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de 16 GB de RAM/VRAM (afirmacion de gemmai4.com para el 12B), lo que permite mantener conversaciones multi-turno sin enviar datos a la nube.
- Procesamiento de documentos con imagenes: gracias al proyector multimodal incluido, se puede enviar una captura o un escaneo junto al texto y pedir extraccion de datos, resumenes o respuestas sobre el contenido visual.
- Reproduccion de entornos de prueba: al estar identificado como el par de ficheros usado en la matriz de soporte de tempo9 y en las pruebas del port de Gemma 4, sirve como artefacto de referencia para validar una implementacion o un backend concreto con hashes verificables.
- Prototipado de pipelines RAG: el contexto declarado de 256K (no confirmado) permitiria inyectar varios documentos largos en una sola llamada; en la practica, el KV cache a esa longitud excede la VRAM de GPUs de consumo, por lo que se usaria con contextos de 4K-16K.
- Evaluacion comparativa de cuantizaciones: util para medir la diferencia de calidad y velocidad entre este Q4_K_S sin imatrix y los Q4_K_S de unsloth o los Q4_K_L de bartowski sobre el mismo prompt set.
- Generacion de codigo asistida en local: el modelo puede integrarse en editores mediante un servidor compatible con la API de OpenAI (`endpoints_compatible` en los tags), siempre que se validen sus capacidades reales de codigo, no documentadas en el repositorio.
- Filtrado y clasificacion de contenido en lote: al ser un modelo de 12B en Q4, puede ejecutarse en CPU o en GPU modesta para tareas de etiquetado, moderacion o extraccion de entidades sobre volumenes moderados de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los resultados de busqueda proporcionados incluyen valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion para este GGUF o para el modelo base `google/gemma-4-12b-it`.

## Requisitos de hardware

- Pesos en disco: 7,17 GB para el modelo Q4_K_S y 0,12 GB adicionales para el proyector multimodal F16 (7,3 GB de repositorio).
- VRAM estimada para inferencia en GPU: aproximadamente 8,5-10 GB con contextos de 4K-8K, sumando pesos, overhead de llama.cpp y KV cache (estimacion propia, no publicada por el autor).
- VRAM a contextos largos: el KV cache crece de forma lineal con la longitud; a 128K-256K el requisito puede superar con holgura los 24 GB y obliga a descarga parcial a CPU o a tecnicas de cache cuantizado.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 16 GB y RTX 4090 24 GB; en 12 GB conviene limitar el contexto o usar `--n-gpu-layers` parcial.
- Portatiles: la fuente gemmai4.com afirma que el 12B "cabe en un portatil de 16 GB"; no se especifica si se refiere a RAM unificada, VRAM o uso mixto.
- GPUs profesionales: A100 40 GB, A100 80 GB y H100 permiten contextos largos y mayor throughput, aunque el beneficio frente a una 4090 depende del ancho de banda de memoria y del batch.
- CPU: viable con llama.cpp en CPU (modelo de ~7 GB), con latencias notablemente superiores; no se han publicado mediciones.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`). vLLM puede cargar GGUF, pero el soporte de cuantizaciones K-quant es mas limitado que en llama.cpp. TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles; no se han publicado tokens/s para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thinkspread/gemma-4-12b-it-Q4_K_S-GGUF | 11,9 B | 256K (no confirmado) | Q4_K_S sin imatrix, 7,17 GB + mmproj F16 | Apache 2.0 | Repositorio con 0 descargas y 0 likes |
| unsloth Q4_K_S de Gemma 4 12B (referenciado en la card) | 11,9 B | no disponible | Q4_K_S, 6,76 GB | Apache 2.0 | Disponible en el ecosistema unsloth; no enlazado en la informacion |
| bartowski/gemma-4-12B-it-GGUF | 11,9 B | no disponible | Multiples quants (Q3_K_XL, Q4_K_L, etc.) con embeddings y output en Q8_0 | Apache 2.0 | Repositorio ampliamente distribuido en HuggingFace |
| google/gemma-4-12b-it (original) | 11,9 B | 256K (no confirmado) | safetensors sin cuantizar (BF16/F16 segun el repo) | Apache 2.0 | Repositorio oficial de Google |

Diferencias clave: este repositorio no usa imatrix, lo que suele traducirse en una perdida de calidad algo mayor a igualdad de bits que los quants calibrados; a cambio, su Q4_K_S ocupa 0,41 GB mas que el de unsloth, probablemente por conservar mas tensores en precision alta. Frente a bartowski, la oferta de variantes es mucho menor (solo Q4_K_S), pero incluye el proyector multimodal en el mismo repo. No hay datos de rendimiento que permitan comparar calidad entre las tres opciones.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y publicacion sin discusion ni issues asociados; no hay evidencia independiente de que la conversion sea correcta mas alla de los hashes publicados.
- Cuantizacion sin imatrix: el propio autor indica que no uso calibracion imatrix, lo que puede degradar la calidad respecto a quants calibrados del mismo tamano, especialmente en tareas de razonamiento y codigo.
- Model card incompleta: no documenta arquitectura, idiomas, contexto real, datos de entrenamiento ni evaluaciones; cualquier dato de contexto o multimodalidad proviene de fuentes externas no oficiales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que permitan cuantificarlo.
- Limitacion de contexto efectivo: aunque el modelo base anuncie 256K, el KV cache a esa longitud no cabe en GPUs de consumo, por lo que en la practica el contexto util sera mucho menor.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano sin evaluacion previa; la documentacion de Gemma no detalla la cobertura por idioma en la informacion disponible.
- Licencia: Apache 2.0 segun el autor y segun Google para Gemma 4; conviene verificar los terminos vigentes del modelo base en su repositorio oficial antes de un uso comercial, ya que las condiciones de la familia Gemma han cambiado entre versiones.
- Dependencia del proyector externo: las capacidades multimodales requieren cargar `mmproj-f16.gguf` ademas del modelo principal; no todos los clientes (Ollama, LM Studio) gestionan igual este par de ficheros.
- Fecha de publicacion muy reciente: no ha habido tiempo material para que la comunidad detecte posibles defectos de conversion (tokens especiales, chat template, embeddings).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thinkspread/gemma-4-12b-it-Q4_K_S-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Documentacion oficial de Gemma 4: https://gemma.ai/models/gemma-4/
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Quant alternativo de bartowski: https://huggingface.co/bartowski/gemma-4-12B-it-GGUF
- Referencia externa sobre Gemma 4 12B (no oficial): https://gemmai4.com/gemma4-12b/
