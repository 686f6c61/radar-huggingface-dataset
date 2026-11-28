# Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo Ministral-3-14B-Instruct-2512-BF16 de Mistral AI, adaptada por Xylolabs para su ejecucion en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva el comportamiento del modelo base de 13.506.073.600 parametros, pero redistribuye la precision de sus pesos para aprovechar los formatos de coma flotante por bloques (block floating point) nativos del hardware Tensix, en concreto `bfloat4_b` y `bfloat8_b`.

La innovacion principal reside en el esquema de cuantizacion selectiva: las capas MLP se almacenan en BFP4, las proyecciones de atencion en BFP8 y el resto de tensores permanecen en BF16. Segun la model card, esta configuracion alcanza una divergencia media de KL de 0,01849 frente al modelo BF16, evaluada sobre 12.104 posiciones de texto en ingles y coreano, un valor cercano al de una cuantizacion Q4_K_M de llama.cpp (0,01473) pero con un tamano empaquetado de 10,576 GB frente a los 27,01 GB del BF16.

Es relevante ahora porque permite desplegar un modelo instructivo de 14B en hardware de inferencia no-GPU con un coste de memoria reducido y una degradacion de calidad controlada. El modelo base soporta once idiomas y esta publicado bajo licencia Apache 2.0, lo que facilita su adopcion en entornos de produccion. La torre de vision y su proyector han sido eliminados en esta exportacion, por lo que el modelo resultante es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral); pesos reempaquetados para Tensix |
| Parametros totales | 13.506.073.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (MLP), BFP8 (atencion y MLP en la variante bfp8), BF16 (resto); tambien disponible Q4_K_M de referencia en llama.cpp |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos de cuantizacion en `quant4.json`), empaquetado adicional para ttnn |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del Ministral-3-14B-Instruct-2512-BF16 de Mistral AI, que a su vez es un transformer decoder-only de 14B parametros. Xylolabs no ha reentrenado el modelo: ha aplicado un esquema de cuantizacion por bloques orientado al hardware Tensix, donde cada matriz se representa en `bfloat4_b` o `bfloat8_b` segun su funcion. En la variante `text-bfp4`, las capas MLP usan BFP4, las proyecciones de atencion usan BFP8 y el resto de tensores (embeddings, normalizaciones, cabezas) permanecen en BF16. En `text-bfp8`, tanto atencion como MLP usan BFP8.

La validacion de calidad se realiza mediante divergencia KL frente al modelo BF16 sobre 12.104 posiciones de WikiText-2 (ingles) y Wikipedia en coreano, tanto en texto plano como con la plantilla de chat. El umbral de aceptacion se fija en 1,5 veces la KL de la referencia Q4_K_M de llama.cpp. Los artefactos incluyen scripts `pack_tensix.py` y `verify_grid.py` para empaquetar y verificar la ida y vuelta de los pesos en ttnn. La ejecucion en Tensix requiere tt-metal v0.81.1 y el flag `--use_hf_rope` en tt-transformers. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre las fases de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto instructivo en once idiomas (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Razonamiento y respuesta a instrucciones en formato chat mediante plantilla de conversacion.
- Capacidades de codigo y matematicas heredadas del modelo base Ministral-3-14B-Instruct.
- Soporte de tool calling y function calling segun las capacidades del modelo base (no verificado de forma independiente en esta cuantizacion).
- Ejecucion en aceleradores Tensix (Wormhole, Blackhole) mediante ttnn y tt-transformers.
- Compatibilidad con transformers para inferencia en GPU/CPU usando los pesos cuantizados.
- No incluye vision: la torre de vision y su proyector han sido eliminados en esta exportacion.
- No se dispone de informacion sobre modo thinking explicito ni capacidades de audio en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado especificamente para Wormhole y Blackhole, por lo que encaja en entornos de inferencia donde no se dispone de GPU NVIDIA y se quiere aprovechar la NPU Tensix con 10,576 GB de pesos empaquetados.
- Servicio de chat multilingue: al soportar once idiomas y usar plantilla de chat, puede atender conversaciones multi-turno en ingles, castellano, frances, aleman, chino, japones, coreano o arabe, entre otros.
- Asistente de codigo en pipelines de CI/CD: hereda las capacidades de generacion de codigo del modelo base y puede integrarse como paso de revision o generacion de parches en herramientas de desarrollo.
- Generacion aumentada por recuperacion (RAG): el modelo puede consumir contexto documental y responder preguntas; la longitud de contexto debe confirmarse contra la ficha del modelo base, ya que no se detalla en esta informacion.
- Prototipado en hardware de bajo consumo: la variante BFP4 reduce el peso a 10,576 GB, lo que permite experimentar con un modelo de 14B en plataformas Tensix con memoria limitada.
- Evaluacion comparativa de cuantizaciones: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la fidelidad de los pesos empaquetados, util para equipos que investigan tecnicas de cuantizacion por bloques.
- Educacion e investigacion: al ser Apache 2.0 y estar disponible en safetensors, sirve para estudiar el efecto de BFP4/BFP8 en la calidad de un modelo instructivo de 14B.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento disponible es la divergencia KL frente al modelo BF16:

| Variante | Formato | Tamano empaquetado (GB) | KL media vs BF16 |
|---|---|---|---|
| text-bfp4 | MLP bfloat4_b; atencion bfloat8_b; resto bf16 | 10,576 | 0,01849 |
| text-bfp8 | Atencion y MLP bfloat8_b; resto bf16 | 15,609 | 0,00046 |
| BF16 (base) | - | 27,01 | 0 |
| Q4_K_M (llama.cpp) | - | 8,239 | 0,01473 |

La KL se calcula sobre 12.104 posiciones de WikiText-2 y Wikipedia en coreano, en texto plano y con plantilla de chat. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria para inferencia: 10,576 GB para la variante BFP4 empaquetada y 15,609 GB para BFP8, segun los tamanos de la model card.
- GPU recomendadas: no se especifican en la informacion; al ser pesos en safetensors es posible cargarlos en GPU con transformers, pero el destino principal es la NPU Tensix.
- Aceleradores soportados: Tenstorrent Wormhole y Blackhole (Tensix), con tt-metal v0.81.1 y tt-transformers con `--use_hf_rope`.
- Cabe en GPU de consumo: no confirmado; el tamano empaquetado de 10,576 GB sugiere que podria caber en GPUs con 12-16 GB de VRAM, pero no hay datos oficiales de compatibilidad ni rendimiento en ese escenario.
- Opciones de despliegue: ttnn/tt-transformers (principal), transformers con `AutoModelForCausalLM`, y llama.cpp mediante la referencia Q4_K_M (no es el formato de este repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP (este) | 13,5B | no disponible | BFP4/BFP8 safetensors para Tensix | Apache 2.0 | 10,576 GB empaquetado; KL 0,01849 |
| Ministral-3-14B-Instruct-2512-BF16 (base) | 13,5B | no disponible | BF16 safetensors | Apache 2.0 | 27,01 GB; referencia de calidad |
| Ministral-3-14B-Instruct-2512 Q4_K_M (llama.cpp) | 13,5B | no disponible | GGUF | Apache 2.0 | 8,239 GB; KL 0,01473 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La torre de vision y su proyector han sido eliminados: el modelo no procesa imagenes.
- La cuantizacion BFP4 introduce una divergencia de KL de 0,01849 frente a BF16, superior a la de Q4_K_M (0,01473); en tareas sensibles a la precision puede degradarse la calidad.
- La evaluacion de KL se limita a ingles y coreano; no hay validacion publicada para el resto de idiomas soportados.
- No se han publicado resultados de benchmarks de tareas, por lo que el rendimiento real en codigo, matematicas o razonamiento no esta verificado en esta variante.
- La licencia Apache 2.0 se aplica segun la model card del modelo base; el repositorio no incluye un archivo LICENSE original, por lo que se usa el texto estandar. La model card del base anade la restriccion de no usar el modelo de forma que infrinja derechos de terceros, incluida propiedad intelectual.
- El despliegue en Tensix requiere versiones concretas de tt-metal (v0.81.1) y el flag `--use_hf_rope`; la incompatibilidad de versiones puede impedir la ejecucion.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion.
- No se dispone de informacion sobre sesgos especificos ni sobre el comportamiento en contextos largos para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia Apache 2.0 en el repo: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix/blob/main/LICENSE
