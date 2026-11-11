# Xylolabs/gemma-4-E2B-it-Tensix-BFP8

## Resumen
Gemma-4-E2B-it-Tensix-BFP8 es una cuantizacion del modelo multimodal google/gemma-4-E2B-it realizada por Xylolabs, orientada especificamente al hardware de inferencia de Tenstorrent (NPUs Tensix como Wormhole y Blackhole). El modelo conserva la arquitectura y capacidades del original (pipeline any-to-any, con torres de vision y audio) pero redondea las capas lineales de atencion y MLP al formato block-floating-point BFP8 (ttnn.bfloat8_b) mediante GPTQ, de modo que TT-NN puede empaquetar los pesos directamente sin re-cuantizar en tiempo de carga.

Los pesos se distribuyen en bf16 pero cada valor ya esta alineado a la rejilla BFP8, lo que simplifica el flujo de despliegue en tt-metal y tt-forge. El repositorio ocupa 11,1 GB, contiene 5.525.831.235 parametros totales y declara licencia Apache-2.0. La evaluacion publicada por el autor cubre solo el submodelo de lenguaje, con una perdida de calidad muy contenida frente al BF16 original.

Es relevante ahora porque permite ejecutar Gemma 4 E2B en aceleradores Tensix con una huella de 7,56 GB empaquetada y 13,01 bits por peso de media, manteniendo un 98,29 % de top-1 respecto al modelo sin cuantizar segun los datos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de vision y audio; capas lineales de atencion y MLP cuantizadas a BFP8 |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (ttnn.bfloat8_b) en q, k, v, o y gate, up, down de 35 capas; bf16 en LM head, embeddings, norms, audio_tower, embed_audio, embed_vision y vision_tower; media de 13,01 bits por peso |
| Idiomas soportados | no disponible (calibracion GPTQ sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a la rejilla BFP8); incluye quant4.json y model.safetensors.index.json |

## Arquitectura y entrenamiento
El modelo base google/gemma-4-E2B-it es un transformer multimodal con pipeline any-to-any, que incluye torres de vision y audio junto al submodelo de lenguaje. Xylolabs no reentrena el modelo: aplica GPTQ para redondear las proyecciones lineales de atencion (q, k, v, o) y de MLP (gate, up, down) de las 35 capas del submodelo de lenguaje a la rejilla bfloat8_b, usando como exponente compartido de cada bloque el que emplea el empaquetador de TT-NN. La calibracion se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

El resto de tensores (embeddings, LM head atado al embedding, normas y todas las torres de vision y audio) permanece en bf16 sin cambios. El autor indica que solo el submodelo de lenguaje fue redondeado y evaluado. Los pesos se guardan en bf16 pero cada valor ya esta en la rejilla BFP8, por lo que TT-NN los empaqueta sin redondear de nuevo. El repositorio incluye utilidades de verificacion (pack_tensix.py y verify_grid.py) que comprueban que ningun valor cambia tras el empaquetado. Las pruebas se hicieron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, no sobre hardware fisico.

## Capacidades
- Generacion de texto y conversacion multi-turno mediante plantilla de chat (apply_chat_template).
- Entrada y salida multimodal (image-text-to-text, any-to-any) gracias a las torres de vision y audio conservadas en bf16.
- Razonamiento con modo thinking, evaluado por el autor en 7 prompts especificos activando el modo de pensamiento.
- Capacidades multilingues heredadas del modelo base (ingles y coreano presentes en el conjunto de calibracion; lista completa de idiomas no disponible).
- Ejecucion en NPUs Tensix mediante tt-metal y tt-forge, con soporte de empaquetado directo BFP8.
- Compatibilidad con transformers (AutoModelForCausalLM, AutoTokenizer) en CPU/GPU para verificacion e inferencia de referencia.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso
- Despliegue en NPUs Tenstorrent: usar tt-metal (demo Gemma 4 v0.81.1) para servir E2B en una Blackhole P150 con pesos ya empaquetados en BFP8, evitando re-cuantizacion en carga y aprovechando el formato nativo del hardware.
- Verificacion de fidelidad de cuantizacion: emplear pack_tensix.py y verify_grid.py en pipelines de CI para comprobar que cada matriz empaquetada coincide bit a bit con los pesos publicados antes de desplegar.
- Prototipado multimodal en laboratorio: cargar el modelo con transformers en bf16 para validar respuestas de vision y audio antes de trasladar la inferencia a Tensix, dado que las torres no han sido cuantizadas.
- Evaluacion comparativa de tecnicas de cuantizacion: usar la tabla de KL y top-1 del autor (frente a BF16 y Q4_K_M de llama.cpp) como referencia para medir el impacto de BFP8 en tareas de razonamiento y conocimiento.
- Investigacion sobre block-floating-point: servir como ejemplo reproducible de GPTQ sobre la rejilla bfloat8_b con exponentes compartidos por bloque, util para estudiar compromisos entre bits por peso y calidad.
- Integracion en tt-forge (tt-xla): mantener los pesos en bf16 por defecto (exacto) o experimentar con las opciones bfp_bf8 y bfp_bf4, teniendo en cuenta que estas re-redondean los valores y pueden degradar la fidelidad.
- Asistencia conversacional en ingles y coreano: aprovechar la calibracion bilingue del autor para escenarios de chat en esos idiomas, con verificacion previa de calidad en el dominio de destino.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E2B-it) | 16 | 9,29 | 0 | 100 | 37 de 40 | - |
| Este modelo (BFP8) | 13,01 | 7,556 | 0,00239 | 98,29 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,29329 | 80,25 | 37 de 40 | 0 |

Las metricas de KL y top-1 cubren 7.968 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano) con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 prompts de razonamiento repetidos con thinking activado (40 en total). Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 7,56 GB empaquetado en BFP8; el repositorio completo ocupa 11,1 GB en disco; en bf16 de referencia el autor reporta 9,29 GB.
- GPU recomendadas: no disponibles; el destino principal son NPUs Tensix de Tenstorrent (Wormhole y Blackhole).
- Consumer GPU: no se documenta; con 5.525 millones de parametros totales y pesos bf16 de 11,1 GB, cabria en GPUs con 12-16 GB de VRAM para inferencia de referencia con transformers, aunque no se aportan medidas.
- Despliegue: tt-metal (demo Gemma 4 v0.81.1, probado en simulador ttsim con ttnn 0.81.1), tt-forge (tt-xla, aun no probado con Gemma 4) y transformers con device_map="auto".
- Latencia y throughput: no disponibles; las pruebas se hicieron en simulador, no en hardware fisico.
- Nota: tt-transformers no soporta Gemma 4; el demo de tt-metal ejecuta E2B, E4B y 12B en una Blackhole P150.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 5.525.831.235 | no disponible | safetensors BFP8 | Apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (BF16) | no disponible en la informacion | no disponible | safetensors bf16 | no disponible en la informacion | Modelo base en Hugging Face |
| Q4_K_M (llama.cpp, mismo checkpoint) | no disponible | no disponible | GGUF 4 bits | no disponible | Generado por el autor, hash publicado |

El modelo BFP8 pierde 1,71 puntos de top-1 frente al BF16 (98,29 % vs 100 %) y 0 respuestas correctas, mientras que Q4_K_M cae a 80,25 % de top-1 con 5,87 bits por peso. La comparativa con alternativas de la misma categoria en hardware Tensix no esta disponible.

## Limitaciones y advertencias
- Solo el submodelo de lenguaje fue cuantizado y evaluado; las torres de vision y audio permanecen en bf16 y no se han validado en este formato.
- Las pruebas de empaquetado se hicieron con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware Tensix real; el rendimiento en produccion no esta verificado.
- tt-transformers no soporta Gemma 4; la integracion depende del demo de tt-metal o de tt-forge, que aun no se ha probado con este modelo.
- En tt-forge, las opciones bfp_bf8 y bfp_bf4 re-redondean los pesos ya cuantizados y pueden degradar la fidelidad; la configuracion por defecto (bf16) es la exacta.
- La evaluacion se limita a 40 prompts cortos y a texto en ingles y coreano; no hay datos de MMLU, HumanEval, GSM8K ni de otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; heredados del modelo base Gemma 4.
- Longitud de contexto: no disponible; conviene verificar el limite del modelo base antes de disenar conversaciones largas.
- Licencia Apache-2.0 para este repositorio, pero las condiciones del modelo base google/gemma-4-E2B-it deben comprobarse por separado antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 de tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP8/blob/main/LICENSE
