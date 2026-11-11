# Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP

## Resumen

Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP es una cuantizacion del modelo de lenguaje Ministral 3 14B Instruct (version 2512) de Mistral AI, preparada por Xylolabs para su despliegue en aceleradores NPU de Tenstorrent (arquitecturas Tensix como Wormhole y Blackhole). El checkpoint conserva unicamente la torre de texto del modelo original (se elimina el tower de vision y su proyector) y reescribe las capas lineales en formatos de bloque de coma flotante nativos de la libreria TT-NN: `bfloat4_b` (BFP4) para las proyecciones MLP y `bfloat8_b` (BFP8) para las proyecciones de atencion. Los tensores se almacenan en bf16, pero cada valor ya esta ajustado a la rejilla BFP correspondiente, de modo que el hardware Tensix los empaqueta sin re-redondeo adicional.

El modelo base tiene 13.506.073.600 parametros (aproximadamente 13,5 mil millones) y esta disenado para generacion de texto conversacional multilingue en once idiomas (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe). La cuantizacion resultante ocupa 10,58 GB empaquetados, con una media de 6,26 bits por peso, lo que reduce a aproximadamente la mitad el espacio frente a los 27 GB del repositorio original en BF16.

La relevancia de esta ficha reside en que se trata de un artefacto de despliegue especializado: no es un modelo nuevo ni un fine-tune, sino una conversion de precision orientada a inferencia en silicio Tenstorrent. Xylolabs documenta que la validacion se realizo con ttnn 0.81.1 sobre el simulador Blackhole (`ttsim`), no sobre hardware fisico, y que la integracion con tt-transformers se probo en una unica Blackhole P150. Es, por tanto, un checkpoint util para quien trabaje con el stack tt-metal/ttnn y quiera evaluar Ministral 3 14B en NPUs Tensix con requisitos de memoria reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral 3, `Ministral3ForCausalLM`, solo torre de texto) |
| Parametros totales | 13.506.073.600 (~13,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el model card menciona escalado de query de Ministral 3 por encima de 16.384 tokens) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/k/v/o; bf16 en LM head, embeddings y normalizaciones; media de 6,26 bits por peso |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (almacenados en bf16, valores ya en rejilla BFP4/BFP8), mas `quant4.json` e `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint deriva directamente de `mistralai/Ministral-3-14B-Instruct-2512-BF16`, un transformer decoder-only de Mistral AI con 40 capas (segun el desglose de tensores del model card: "attention q, k, v, o (40 layers)" y "MLP gate, up, down (40 layers)"). Xylolabs no entrena ni ajusta el modelo: aplica cuantizacion post-entrenamiento. Las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) se redondean a `ttnn.bfloat4_b` mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) se redondean a `ttnn.bfloat8_b` por redondeo al vecino mas cercano. El resto de tensores (LM head, embeddings, normas) permanece en bf16 como en el modelo base.

La innovacion tecnica principal es el formato de bloque de coma flotante (block floating point, BFP): TT-NN interpreta los pesos como matrices `[in, out]` y los empaqueta directamente en la rejilla BFP4/BFP8 sin aplicar un segundo redondeo, lo que evita deriva numerica acumulada. El model card indica que los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`. Se documentan scripts de verificacion (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que ningun valor cambia tras el empaquetado, opcionalmente con ida y vuelta por DRAM del dispositivo. No se proporcionan datos sobre el proceso de entrenamiento original de Mistral (numero de tokens, composicion del dataset, RLHF/DPO), por lo que esos detalles quedan como no disponibles en esta informacion.

## Capacidades

- Generacion de texto conversacional multilingue en once idiomas (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Razonamiento e instruccion conversacional heredados del modelo Instruct 2512 de Mistral AI (capacidades especificas del base no detalladas en la informacion disponible).
- Inferencia en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con soporte de los formatos BFP4/BFP8 nativos del hardware.
- Integracion con tt-transformers (tt-metal v0.81.1) para demo de texto en una Blackhole P150, con opcion `--use_hf_rope`.
- Compatibilidad con `transformers` y `AutoModelForCausalLM` en GPU/CPU convencionales para inspeccion y validacion numerica.
- Solo texto: la torre de vision y su proyector han sido eliminados del checkpoint.
- Tool calling, function calling, modo thinking, audio y otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent: cargar el checkpoint en Wormhole o Blackhole mediante TT-NN para servir generacion de texto con huella de memoria de 10,58 GB empaquetados, aproximadamente la mitad del modelo BF16 original. Adecuado para entornos que ya operan el stack tt-metal y buscan reducir presion de DRAM.
- Validacion numerica de pipelines de cuantizacion: usar `pack_tensix.py` y `verify_grid.py` para comprobar, matriz a matriz, que el empaquetado BFP4/BFP8 no altera ningun valor antes de desplegar en produccion.
- Investigacion en formatos de bloque de coma flotante: comparar el impacto de GPTQ con busqueda de exponente por bloque frente al redondeo al vecino mas cercano en BFP8, usando el mismo modelo base como referencia.
- Prototipado en simulador: ejecutar el checkpoint con ttnn 0.81.1 sobre `ttsim` (simulador Blackhole) para desarrollar kernels o rutinas de inferencia sin disponer de hardware fisico.
- Asistente conversacional multilingue en entornos con restricciones de memoria: al conservar los once idiomas del base y ocupar 10,58 GB, encaja en despliegues donde el BF16 de 27 GB no cabe en la memoria disponible del acelerador.
- Benchmarking de precision mixta: medir la degradacion de calidad al pasar MLP a BFP4 manteniendo atencion en BFP8, con el checkpoint BF16 de Mistral como linea base.
- Integracion en tt-forge (tt-xla): el model card indica que aun no se ha ejecutado con este checkpoint, por lo que serviria como caso de prueba pendiente para el equipo que trabaje con esa ruta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card incluye una tabla de evaluacion truncada (columnas "Bits a weight" y "Size (GB)" sin filas de resultados), por lo que no hay cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- Huella de pesos empaquetados: 10,58 GB (media de 6,26 bits por peso); el repositorio ocupa 27,0 GB porque los tensores se almacenan en bf16.
- NPUs objetivo: Tenstorrent Tensix, arquitecturas Wormhole y Blackhole (el model card cita explicitamente Blackhole P150 para tt-transformers).
- Validacion realizada con ttnn 0.81.1 sobre `ttsim` (simulador Blackhole), no sobre hardware fisico.
- Inferencia en GPU convencional: posible mediante `transformers` con `dtype="bfloat16"` y `device_map="auto"`; la VRAM necesaria no se detalla en la informacion disponible, pero el repositorio completo pesa 27,0 GB.
- Opciones de despliegue documentadas: TT-NN (ttnn), tt-transformers (tt-metal v0.81.1) y, pendiente de prueba, tt-forge (tt-xla). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El model card referencia un demo de rendimiento con `batch-1` y una configuracion de precision concreta (`ff1_3: bfp4, ff2: bfp4, wqkv: bfp8, wo: bfp8, kv_cache: bfp8, activation: mixed`), pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP | 13,5 B | No disponible | BFP4 MLP + BFP8 atencion, 6,26 bits/peso, 10,58 GB | Apache-2.0 | Hugging Face, solo texto, orientado a Tensix |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5 B | No disponible | BF16 | Apache-2.0 | Hugging Face, modelo base con torre de vision |
| Otros modelos de ~14 B de Mistral AI | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar calidad entre el checkpoint cuantizado y el base, ni de alternativas de terceros con especificaciones verificables.

## Limitaciones y advertencias

- Solo texto: la torre de vision y su proyector han sido eliminados, por lo que el checkpoint no puede procesar imagenes.
- La validacion se hizo en simulador (`ttsim`), no en hardware Tensix fisico; el comportamiento real en Wormhole o Blackhole no esta confirmado por el autor.
- tt-transformers requiere `--use_hf_rope`; sin el, el QKV fusionado se re-redondea y los resultados divergen.
- El demo de tt-transformers empaqueta la LM head en bfloat8_b, por lo que la cabeza no es exacta en esa ruta.
- tt-transformers no aplica el escalado de query de Ministral 3 por encima de 16.384 tokens, de modo que las salidas largas difieren de la referencia.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- Riesgo de alucinacion y sesgos: inherentes al modelo base; no se documentan evaluaciones de sesgo ni de factualidad en esta informacion.
- La cuantizacion BFP4 en MLP puede degradar calidad respecto al BF16 original; el autor no publica mediciones de esa perdida.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de Mistral AI y de las dependencias de Tenstorrent.
- El repositorio ocupa 27,0 GB frente a 10,58 GB empaquetados; planificar el almacenamiento segun el formato de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP/blob/main/LICENSE
