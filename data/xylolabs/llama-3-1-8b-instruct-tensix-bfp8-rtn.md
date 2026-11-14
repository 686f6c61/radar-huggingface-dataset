# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8-RTN

## Resumen

Llama-3.1-8B-Instruct-Tensix-BFP8-RTN es una cuantizacion del modelo meta-llama/Llama-3.1-8B-Instruct preparada por Xylolabs para su ejecucion sobre aceleradores Tenstorrent Tensix mediante la pila de software tt-metal y TT-NN. El modelo conserva la arquitectura original de Llama 3.1 (transformer decoder-only denso de 8.030.261.248 parametros) y modifica unicamente el formato de almacenamiento de las proyecciones lineales de atencion y MLP, que se redondean al grid block-floating-point BFP8 nativo de Tensix (bfloat8_b).

La relevancia de esta ficha es acotada pero tecnica: no se trata de un modelo nuevo ni de un ajuste fino, sino de un artefacto de despliegue orientado a hardware especifico. El checkpoint empaqueta 224 matrices lineales en bfloat8_b (8,5 bits por peso) mientras mantiene el embedding de entrada, el LM head y el resto de tensores en BF16, con un promedio global de 9,482 bits por peso y un peso total de aproximadamente 9,52 GB en memoria de dispositivo.

El autor declara verificaciones de representacion (grid y empaquetado nativo TT-NN) y una evaluacion de divergencia KL frente al BF16 original y frente a una cuantizacion Q4_K_M emparejada, con un resultado de KL medio de 0,001002159. No se han publicado datos de velocidad ni de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K), por lo que la evaluacion disponible es exclusivamente de fidelidad de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), con proyecciones lineales en block-floating-point BFP8 (bfloat8_b) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | BFP8 RTN (bfloat8_b, 8,5 bits por peso) en 224 matrices de atencion y MLP; BF16 en embedding de entrada, LM head y 67 tensores restantes; promedio global 9,482 bits por peso |
| Idiomas soportados | en, ko (segun metadatos del repositorio) |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (BF16 con valores ya redondeados al grid BFP8), mas metadatos de empaquetado en quant4.json |

## Arquitectura y entrenamiento

El modelo no introduce cambios arquitectonicos respecto al base: es un transformer decoder-only denso de 8.030 millones de parametros de la familia Llama 3.1, con atencion causal estandar y capas MLP con activacion SwiGLU. La intervencion de Xylolabs consiste en un redondeo round-to-nearest (RTN) de las 224 matrices lineales de atencion y MLP al grid block-floating-point BFP8 de Tensix, el mismo formato que usa el empaquetado nativo de TT-NN. El embedding de entrada (no atado), el LM head y otros 67 tensores permanecen en BF16. El campo `rounding` de `quant4.json` identifica RTN, aunque la etiqueta legada `variant` conserva la cadena `gptq` por compatibilidad de herramientas.

No hay informacion sobre datos de entrenamiento adicionales, RLHF, DPO ni ajustes posteriores: el autor remite al release original de Llama 3.1. La innovacion tecnica del artefacto es de despliegue, no de modelado: los pesos se empaquetan directamente en el formato de bloque que consume el hardware Tensix, evitando una conversion en tiempo de carga, y se proporcionan scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que cada matriz declarada supera las comprobaciones de grid y de empaquetado nativo TT-NN. El autor indica que tt-transformers y tt-forge no se validaron con este checkpoint.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas de Llama 3.1 8B Instruct.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de contexto del modelo base.
- Generacion de codigo y matematicas a nivel del modelo base (no hay evaluacion especifica publicada para este checkpoint).
- Soporte de plantilla de chat mediante `apply_chat_template` y decodificacion determinista con `do_sample=False`.
- Capacidades multilingues limitadas segun metadatos a ingles y coreano; el resto de idiomas del base no se declaran.
- Ejecucion nativa en aceleradores Tenstorrent Tensix mediante TT-NN con dtype `bfloat8_b` y layout TILE.
- No se declaran capacidades de vision, audio, tool calling ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint esta empaquetado para cargarse directamente como `ttnn.bfloat8_b` en DRAM del dispositivo, lo que evita conversion en caliente y reduce el peso en memoria a unos 9,52 GB para los pesos del modelo de lenguaje.
- Servicio de chat en ingles o coreano: al conservar el comportamiento del base Instruct, puede usarse para asistentes conversacionales en esos dos idiomas con la plantilla de chat estandar de Llama 3.1.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que un checkpoint dado respeta el grid BFP8 y el empaquetado nativo, util en CI de compiladores o toolchains de hardware.
- Investigacion sobre fidelidad de cuantizacion: la evaluacion KL publicada (0,001002159 frente a BF16) sirve como referencia para estudiar el impacto del redondeo RTN a 8,5 bits en proyecciones de atencion y MLP.
- Prototipado en simulador Blackhole: el autor valida el ejemplo de carga con TT-NN 0.81.1 sobre el simulador, lo que permite desarrollar integraciones sin hardware fisico.
- Generacion de codigo asistida en entornos con aceleradores Tensix: el modelo puede integrarse en flujos de autocompletado o generacion de parches siempre que el backend sea TT-NN y el idioma de trabajo sea ingles.
- Baseline de comparacion Q4_K_M: la tabla de evaluacion incluye un Q4_K_M emparejado, util para comparar estrategias de cuantizacion (BFP8 RTN frente a cuantizacion de 4 bits) en terminos de divergencia KL.

## Benchmarks y rendimiento

| Perfil | KL medio | Aciertos normales / 33 | Aciertos thinking / 7 | Perdidas contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 0 | — |
| Esta exportacion (BFP8 RTN) | 0,001002159 | 28 | 0 | 0 |
| Q4_K_M emparejado | 0,032352000 | 30 | 0 | 0 |

La evaluacion KL cubre 16.056 posiciones puntuadas sobre textos en ingles y coreano (raw y chat), en cuatro fragmentos de 1.024 tokens por texto. El suelo BF16 de llama.cpp se situa en 0,000309000. La exportacion obtiene un KL de 0,030977 veces el de Q4_K_M, dentro del limite de 1,5 veces de la regla-7 relativa, y no anade perdidas de respuesta contadas. El autor indica que el BF16 original no acierta ningun item de thinking, por lo que esos siete items no aportan evidencia de regresion. No se publican resultados de MMLU, HumanEval, GSM8K ni metricas de velocidad o throughput.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 9,52 GB solo para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers, segun el autor.
- Hardware objetivo: aceleradores Tenstorrent Tensix (validado en simulador Blackhole con TT-NN 0.81.1); no se declara compatibilidad con GPU NVIDIA o AMD para la ruta nativa.
- GPU consumer: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU consumer; el checkpoint esta pensado para Tensix y para carga en Transformers 5.23.0 con PyTorch en BF16.
- Despliegue: Transformers 5.23.0 con `AutoModelForCausalLM` y `device_map="auto"`; ruta nativa con TT-NN (`ttnn.as_tensor` con dtype `bfloat8_b`, layout TILE, DRAM_MEMORY_CONFIG); scripts `pack_tensix.py` y `verify_grid.py`.
- vLLM, llama.cpp, Ollama y TGI: no se declaran soportados en la informacion disponible; el tag `text-generation-inference` aparece en los metadatos del repositorio, pero el autor no documenta una ruta TGI verificada.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8-RTN | 8.030.261.248 | no disponible | BFP8 RTN + BF16 (safetensors) | llama3.1 | Hugging Face, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.030.261.248 | no disponible | BF16 (safetensors) | llama3.1 | Hugging Face, ampliamente distribuido |
| Q4_K_M emparejado (referencia del autor) | no disponible | no disponible | 4 bits (Q4_K_M) | no disponible | no disponible |
| Llama 3.1 8B Instruct en llama.cpp (suelo BF16) | 8.030.261.248 | no disponible | BF16 | llama3.1 | llama.cpp |

La comparativa se limita a las referencias que el propio autor incluye en su evaluacion. No se dispone de datos de benchmarks de tareas que permitan comparar calidad con otros modelos de 8B (Qwen, Mistral, Gemma) de forma rigurosa.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda todos los sesgos, riesgos de alucinacion y limitaciones del base Llama 3.1 8B Instruct.
- Idiomas declarados: solo ingles y coreano; el rendimiento en castellano no esta evaluado ni declarado.
- La evaluacion publicada es de fidelidad de pesos (KL y aciertos en 33 + 7 items), no de calidad en tareas estandar; no hay MMLU, HumanEval ni GSM8K.
- Los siete items de thinking no aportan evidencia porque el BF16 original tampoco los acierta; la comparacion en ese eje es nula.
- No se han validado tt-transformers ni tt-forge con este checkpoint; la integracion con esas pilas queda fuera del alcance declarado.
- El formato BFP8 RTN esta atado al hardware Tensix; en GPU la ruta es cargar los tensores BF16 ya redondeados, con la perdida de precision que ello implica frente al base.
- La etiqueta `variant` de `quant4.json` contiene `gptq` por compatibilidad, aunque el metodo real es RTN; conviene no confundir ambos en pipelines automatizados.
- Licencia Llama 3.1 Community: restricciones de uso comercial y politica de uso aceptable aplicables; el codigo auxiliar de Xylolabs se distribuye bajo Apache 2.0 (`CODE_LICENSE`).
- El modelo se proporciona "as is", sin garantia.
- No se reportan latencia ni throughput; no es posible estimar coste de inferencia a partir de la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8-RTN
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP8-RTN/blob/main/LICENSE
- Release original de Llama 3.1 (cita recomendada por el autor): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
