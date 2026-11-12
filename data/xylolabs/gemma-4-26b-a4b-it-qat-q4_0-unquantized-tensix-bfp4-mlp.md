# Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una versión cuantizada del modelo `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en aplicar GPTQ sobre las capas lineales del modelo base para llevarlas a los formatos de bloque flotante nativos de TT-NN: `bfloat4_b` (BFP4) para las proyecciones del MLP y de los expertos enrutados, y `bfloat8_b` (BFP8) para la atención. El modelo base es un Gemma 4 de 26.544 millones de parámetros totales con arquitectura MoE (la designación A4B indica aproximadamente 4.000 millones de parámetros activos por token) y capacidad multimodal image-text-to-text.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de cuantización orientada a hardware no-GPU, donde el formato destino no es GGUF ni AWQ sino el grid de bloque flotante que el compilador de Tenstorrent espera. Por otro, el autor publica una evaluación comparativa frente al modelo en BF16 y frente a una cuantización Q4_0 de llama.cpp, con métricas de divergencia KL y top-1 sobre posiciones de texto en inglés y coreano.

Conviene subrayar desde el principio que las pruebas se realizaron sobre `ttsim`, el simulador de Blackhole de Tenstorrent, y no sobre silicio real. El propio autor indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), base Gemma 4 26B-A4B |
| Parametros totales | 26.544.133.710 |
| Parametros activos | A4B segun denominacion del modelo base (cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) en MLP y expertos enrutados; BFP8 (`ttnn.bfloat8_b`) en atencion; bf16 en router, embeddings, LM head, normas y torre de vision. Media de 5,02 bits por peso |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (53,1 GB de repositorio; 15,83 GB empaquetados en el checkpoint cuantizado) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 con mezcla de expertos: 26.544 millones de parametros totales y una designacion A4B que sugiere del orden de 4.000 millones de parametros activos por token. Incluye torre de vision (`vision_tower`, `embed_vision`) y una cabeza de lenguaje con embeddings atados, lo que habilita la pipeline image-text-to-text. El checkpoint base ya partia de una cuantizacion QAT q4_0 sin empaquetar, sobre la que Xylolabs aplica una segunda etapa de cuantizacion dirigida al hardware Tensix.

La innovacion tecnica esta en el esquema de cuantizacion. Las matrices BFP4 se obtuvieron con GPTQ y una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los expertos enrutados comparten una unica matriz de Hessian por capa para las proyecciones gate y up, mientras que la proyeccion down de cada experto usa su propio Hessian o recurre a redondeo al mas cercano cuando vio pocos tokens de calibracion. Las matrices BFP8 se generaron con redondeo al mas cercano. Los valores cuantizados se almacenan como bf16 sobre el grid BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterarlos; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningun valor cambia tras el empaquetado. Solo se cuantizo y evaluo el modelo de lenguaje; la parte de vision permanece en bf16 sin cambios.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de turnos multi-turno.
- Procesamiento image-text-to-text heredado del modelo base Gemma 4 multimodal, con torre de vision intacta en bf16.
- Razonamiento y respuesta a preguntas de cultura general, segun la bateria de 33 prompts cortos con comprobacion automatica del autor.
- Capacidad multilingue parcial: la evaluacion cubre texto en ingles y coreano, aunque no se publica la lista oficial de idiomas.
- Ejecucion sobre aceleradores Tenstorrent Tensix mediante TT-NN, con empaquetado directo de los tensores en DRAM del dispositivo.
- Compatibilidad declarada con `transformers` y con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en cuantizacion para hardware no-GPU: sirve como referencia reproducible para estudiar como se comporta GPTQ con grid de bloque flotante en un MoE de 26B, comparando la divergencia KL frente al BF16 con las 8.048 posiciones publicadas.
- Validacion de toolchains de Tenstorrent: el par de scripts `pack_tensix.py` y `verify_grid.py` permite comprobar en CI que el empaquetado BFP4/BFP8 no altera valores antes de desplegar en Wormhole o Blackhole.
- Despliegue en aceleradores Tensix con memoria limitada: los 15,83 GB empaquetados frente a los 50,47 GB en BF16 reducen aproximadamente un 69 % el espacio de pesos, lo que facilita encajar el modelo en DRAM de dispositivo.
- Prototipado de asistentes conversacionales multilingues (ingles/coreano): el modelo mantiene 33 de 33 respuestas correctas en la bateria del autor, lo que lo hace util para demos de chat sin requisitos estrictos de fidelidad numerica.
- Experimentos de vision-lenguaje: al conservar `vision_tower` y `embed_vision` en bf16, puede emplearse en tareas image-text-to-text siempre que se acepte que esa rama no fue evaluada por el autor.
- Benchmarking comparativo de formatos: util para contrastar BFP4 GPTQ (5,02 bits/peso, KL 0,06233) frente a Q4_0 de llama.cpp (4,57 bits/peso, KL 0,05293) sobre el mismo checkpoint base.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP4/BFP8) | 5,02 | 15,826 | 0,06233 | 90,87 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,57 | 14,439 | 0,05293 | 91,55 | 33 de 33 | 0 |

Las metricas de KL y top-1 cubren 8.048 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano) con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 15,83 GB para los pesos empaquetados en BFP4/BFP8; el repositorio completo ocupa 53,1 GB en disco, y la version BF16 de referencia requiere 50,47 GB.
- Hardware objetivo: aceleradores Tenstorrent Tensix Wormhole y Blackhole. No esta pensado para GPU convencionales en su formato actual.
- Pruebas realizadas unicamente sobre `ttsim` (simulador de Blackhole) con ttnn 0.81.1; el autor no reporta ejecucion en silicio.
- Despliegue en GPU: la model card incluye un ejemplo con `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`), pero no se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4 MLP) | 26,54B totales (A4B) | no disponible | apache-2.0 | safetensors BFP4/BFP8 para Tensix | KL 0,06233; top-1 90,87 % |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (BF16) | 26,54B totales (A4B) | no disponible | apache-2.0 | safetensors bf16 | Referencia: KL 0; top-1 100 % |
| Q4_0 derivado del mismo checkpoint (llama.cpp) | 26,54B totales (A4B) | no disponible | apache-2.0 | GGUF Q4_0, 4,57 bits/peso | KL 0,05293; top-1 91,55 % |

## Limitaciones y advertencias

- No verificado en hardware real: todas las pruebas se hicieron sobre el simulador `ttsim` de Blackhole; el comportamiento en Wormhole o Blackhole fisicos no esta documentado.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint, por lo que la integracion con esos frameworks queda sin validar.
- Solo se cuantizo y evaluo el modelo de lenguaje; la rama de vision permanece en bf16 y sin evaluacion publicada, lo que impide garantizar su calidad en tareas image-text-to-text.
- La evaluacion se limita a 8.048 posiciones de texto en ingles y coreano y a 33 prompts cortos; no hay datos de MMLU, HumanEval, GSM8K ni de tareas de razonamiento largo.
- El top-1 (90,87 %) es inferior al de la cuantizacion Q4_0 de llama.cpp (91,55 %) pese a usar mas bits por peso, aunque la KL es ligeramente peor en este modelo (0,06233 frente a 0,05293).
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni lista oficial de idiomas soportados.
- Aunque la licencia es apache-2.0, conviene revisar las condiciones del modelo base de Google antes de un uso comercial, ya que este checkpoint deriva de el.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026: ecosistema praticamente inexistente, sin issues ni validacion de terceros.
- El proceso de calibracion uso Wikipedia en coreano, lo que puede introducir un sesgo de dominio hacia ese tipo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
