# steadyworks-hq/Qwen3.5-GGUF

## Resumen

`steadyworks-hq/Qwen3.5-GGUF` es un repositorio de conversiones a GGUF de la familia Qwen3.5 del equipo Qwen (Alibaba Cloud), publicado por Steadyworks, el desarrollador de la aplicación de escritorio Hanavy. No es un modelo nuevo: contiene tres ficheros cuantizados en Q4_K_M de Qwen3.5-2B, Qwen3.5-4B y Qwen3.5-9B, generados con llama.cpp a partir de los pesos oficiales en safetensors. El objetivo es que estos modelos de chat puedan ejecutarse en un ordenador convencional, con CPU o con GPU de consumo, mediante llama.cpp.

El interés práctico del repositorio es que el equipo Qwen no publica GGUF oficiales de Qwen3.5, de modo que esta es una de las pocas vías disponibles para usar la familia en local. La conversión no introduce fine-tuning ni modificaciones de pesos: solo cambia el formato y aplica la cuantización Q4_K_M. Los ficheros contienen únicamente el modelo de texto; el codificador de visión de Qwen3.5 no está incluido, pese a que la familia se presenta como nativa multimodal.

Conviene tratarlo como un artefacto de despliegue, no como un modelo con identidad propia: la licencia, las capacidades y las limitaciones son las de los pesos originales de Qwen (Apache 2.0). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y Steadyworks declara explícitamente no estar afiliado al equipo Qwen ni a Alibaba Cloud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles de capas y atención no disponibles en la información proporcionada |
| Parámetros totales | 1.942.653.248 en la variante 2B (dato real de safetensors); 4B y 9B: tamaño nominal según nombre de fichero, recuento exacto no disponible |
| Parámetros activos | No aplica / no disponible: la información no indica que Qwen3.5 sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (único tipo publicado en el repositorio) |
| Idiomas soportados | No disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por modelo); origen en safetensors convertido a f16 y después a Q4_K_M |
| Modelos base | Qwen/Qwen3.5-2B, Qwen/Qwen3.5-4B, Qwen/Qwen3.5-9B |
| Herramienta de conversión | llama.cpp release b11804 (commit `c7fc5094179bf8a9c73c18593db714f8da41a402`) |
| Modalidad incluida | Solo texto (sin codificador de visión) |
| Tamaño del repositorio | 9,9 GB |
| Descargas / likes | 0 / 0 |

Ficheros publicados:

| Fichero | Tamaño (bytes) | SHA-256 |
|---|---|---|
| Qwen3.5-2B-Q4_K_M.gguf | 1.312.164.832 | `87254f08f2827c1a245f702660365e43985f53dce1dd5c63f3d9ae63a941f5f2` |
| Qwen3.5-4B-Q4_K_M.gguf | 2.783.446.912 | `970db58975c6abf928f8a206663e225a21105323927b5911b4fb257a30a6fd80` |
| Qwen3.5-9B-Q4_K_M.gguf | 5.780.090.816 | `270051419cee3454b508d9e2b171134b801a20330a4549fe82b4451270e16aa2` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, presentada por el equipo Qwen en el anuncio titulado "Qwen3.5: Towards Native Multimodal Agents" (febrero de 2026). La información disponible no detalla el número de capas, el mecanismo de atención, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en las model cards oficiales de Qwen/Qwen3.5-2B, 4B y 9B. Lo que sí se deduce del material publicado es que la familia es multimodal nativa y que estos GGUF conservan solo la parte de texto.

El proceso de conversión está documentado paso a paso por el autor: conversión de safetensors a GGUF en f16 con `convert_hf_to_gguf.py` y `gguf-py` del tag b11804, cuantización posterior con `llama-quantize` a Q4_K_M, y verificación de carga ejecutando cada fichero con `llama-completion` de la misma release antes de subirlo. No se aplicó fine-tuning, calibración con importance matrix ni ninguna otra transformación sobre los pesos. El autor conserva la revisión exacta del repositorio de origen para cada tamaño (`15852e8c…`, `851bf6e8…`, `c2022362…`), lo que permite reproducir la conversión.

## Capacidades

- Generación de texto conversacional en formato chat: el repositorio está etiquetado como `conversational` y `text-generation`.
- Inferencia local en CPU y GPU mediante llama.cpp, sin dependencias de servicios en la nube.
- Tres escalas de capacidad disponibles (2B, 4B y 9B) para ajustar el equilibrio entre calidad y recursos.
- Integración en aplicaciones de escritorio: es el caso de uso declarado por el autor, la app Hanavy, que descarga el fichero y verifica su SHA-256 antes de usarlo.
- Capacidades multilingües: no disponibles como dato verificado; la model card no enumera idiomas.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada; el título del anuncio de Qwen3.5 menciona agentes, pero no hay especificación técnica asociada a estos ficheros.
- Visión: no incluida. El codificador de imagen de Qwen3.5 no forma parte de estos GGUF.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local integrado en una aplicación de escritorio: el escenario para el que se crearon estos ficheros. La app descarga un GGUF, comprueba el hash y lo sirve con llama.cpp embebido, de modo que el usuario obtiene chat sin conexión y sin enviar datos a terceros.
- RAG sobre documentación interna en equipos sin GPU dedicada: la variante 2B en Q4_K_M ocupa 1,22 GiB y puede ejecutarse en CPU, lo que permite montar un pipeline de recuperación y generación completamente on-premise para políticas internas o manuales técnicos.
- Resumen y reescritura de correos y actas: la variante 4B ofrece un compromiso razonable entre calidad de redacción y huella de memoria (2,59 GiB de pesos), adecuada para tareas de transformación de texto de un solo turno con plantilla fija.
- Extracción de campos estructurados de texto libre (facturas, partes de incidencias, formularios): con prompt y esquema bien definidos, un modelo de 4B o 9B cuantizado puede normalizar entradas en un proceso batch nocturno sin coste por token.
- Asistencia a la programación en local: explicación de fragmentos de código, generación de tests unitarios sencillos o redacción de mensajes de commit en un editor con integración llama.cpp, manteniendo el código dentro de la máquina del desarrollador.
- Traducción y adaptación de borradores con revisión humana: útil para pretraducir documentación antes de pasar por un traductor; requiere validación porque no hay datos publicados de calidad por idioma.
- Pruebas de regresión de pipelines de cuantización: al estar los tres tamaños homogéneamente cuantizados con la misma release de llama.cpp, el repositorio sirve como referencia para comparar salidas entre 2B, 4B y 9B con el mismo prompt y los mismos parámetros de muestreo.
- Docencia y experimentación con modelos pequeños: el tamaño reducido permite ejecutar demostraciones en portátiles de aula sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con modelos alternativos. Tampoco se han publicado mediciones de latencia o throughput. Cualquier cifra de rendimiento para estos ficheros debería obtenerse midiendo directamente sobre el hardware objetivo, teniendo en cuenta que la cuantización Q4_K_M introduce una pérdida de calidad respecto a los pesos en f16 que no está cuantificada en la documentación.

## Requisitos de hardware

Estimaciones derivadas del tamaño de los ficheros; el consumo real depende de la longitud de contexto configurada (no publicada) y del backend:

- Qwen3.5-2B Q4_K_M (1,22 GiB de pesos): viable en CPU con 8 GB de RAM; con GPU, aproximadamente 2,5-3,5 GB de VRAM incluyendo caché KV y overhead.
- Qwen3.5-4B Q4_K_M (2,59 GiB): CPU con 12-16 GB de RAM; GPU con 4-5,5 GB de VRAM.
- Qwen3.5-9B Q4_K_M (5,38 GiB): CPU con 16 GB de RAM o más; GPU con 7-9 GB de VRAM según contexto.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090. La variante 2B cabe incluso en GPUs de 4-6 GB y en iGPU con memoria unificada.
- Apple Silicon: los tres tamaños son ejecutables con Metal aprovechando la memoria unificada; el 9B requiere un equipo con 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-completion`), llama-cpp-python para integración en Python, LM Studio y Ollama mediante importación con Modelfile. vLLM ofrece soporte GGUF experimental; TGI no carga GGUF de forma nativa, por lo que para servir con TGI habría que partir de los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, en CPU el 2B es el único que ofrece respuestas interactivas con comodidad; el 9B en CPU sin GPU es apto para procesos batch, no para chat en tiempo real.

## Comparativa con modelos similares

Comparación interna entre las tres variantes del repositorio y los pesos oficiales de origen:

| Modelo | Parámetros | Formato | Tamaño en disco | Contexto | Licencia | Uso típico |
|---|---|---|---|---|---|---|
| Qwen3.5-2B Q4_K_M | ~1,94 B | GGUF | 1,22 GiB | No disponible | Apache 2.0 | CPU, portátiles, apps de escritorio |
| Qwen3.5-4B Q4_K_M | ~4 B (nominal) | GGUF | 2,59 GiB | No disponible | Apache 2.0 | GPU de gama media, RAG local |
| Qwen3.5-9B Q4_K_M | ~9 B (nominal) | GGUF | 5,38 GiB | No disponible | Apache 2.0 | GPU de 8-12 GB, mayor calidad |
| Qwen3.5-2B/4B/9B oficiales | Idem | safetensors (f16/bf16) | No disponible | No disponible | Apache 2.0 | Servir con vLLM/TGI, fine-tuning |

Alternativas de la misma categoría (modelos pequeños cuantizados para inferencia local): las familias Qwen2.5, Llama 3.2 (1B y 3B) y Gemma 3 (4B) cuentan con GGUF de terceros y, en algunos casos, oficiales. No se dispone en la información proporcionada de datos de benchmarks que permitan una comparación cuantitativa con Qwen3.5, ni de sus especificaciones de contexto verificadas, por lo que la comparación numérica se marca como no disponible. A favor de este repositorio frente a esos ecosistemas: es de los pocos accesos en GGUF a la generación Qwen3.5 y publica hashes SHA-256 verificables. En contra: no hay conversiones Q5_K_M, Q8_0 ni f16 en el mismo repo, y no existe validación comunitaria (0 descargas).

## Limitaciones y advertencias

- Repositorio no oficial: la conversión la realiza un tercero sin afiliación con el equipo Qwen; la calidad del GGUF depende del script de conversión de llama.cpp b11804 y no está auditada por el autor original.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública sobre posibles defectos de conversión.
- Solo una cuantización disponible (Q4_K_M): no hay opción de mayor precisión dentro del repositorio para comparar degradación, ni versiones Q2/Q3 para hardware muy limitado.
- Pérdida de calidad por cuantización no cuantificada: no se han publicado evaluaciones que midan la degradación de Q4_K_M frente a f16 en estos modelos concretos.
- Sin visión: aunque Qwen3.5 se presenta como multimodal nativo, estos ficheros solo contienen el modelo de texto; no deben usarse en pipelines de imagen.
- Longitud de contexto desconocida: al no publicarse, existe riesgo de configurar `n_ctx` por encima de la ventana real de entrenamiento y obtener degradación silenciosa o salidas incoherentes.
- Idiomas no verificados: sin listado oficial en la model card, la calidad en castellano u otras lenguas debe validarse empíricamente antes de usarla en producción.
- Riesgo de alucinación propio de modelos de 2-9B, especialmente en la variante 2B y en dominios especializados; no se recomienda su uso sin verificación humana en contextos legales, médicos o financieros.
- Sesgos: no documentados en la información disponible; deben asumirse los sesgos heredados de los datos de entrenamiento de Qwen3.5.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribución; el fichero LICENSE del repositorio se copia del repositorio oficial de Qwen.
- Fecha de creación del repositorio: 25 de octubre de 2026. Verificar que los pesos base citados siguen publicados y que la revisión indicada coincide antes de reproducir la conversión.
- Verificación obligatoria de integridad: usar siempre el SHA-256 publicado; un GGUF corrupto o manipulado puede cargarse sin errores evidentes y producir salidas anómalas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/steadyworks-hq/Qwen3.5-GGUF
- Licencia en el repositorio: https://huggingface.co/steadyworks-hq/Qwen3.5-GGUF/blob/main/LICENSE
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Anuncio de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Release de llama.cpp utilizada, b11804: https://github.com/ggml-org/llama.cpp/releases/tag/b11804
- Paper o informe técnico de Qwen3.5: no disponible en la información proporcionada (solo se cita el anuncio y la entrada BibTeX "Qwen3.5: Towards Native Multimodal Agents", febrero de 2026)
- Demo o espacio asociado: no disponible
