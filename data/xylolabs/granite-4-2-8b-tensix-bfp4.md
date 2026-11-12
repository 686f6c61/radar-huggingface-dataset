# Xylolabs/granite-4.2-8b-Tensix-BFP4

## Resumen

Granite-4.2-8b-Tensix-BFP4 es una cuantizacion del modelo ibm-granite/granite-4.2-8b, desarrollada por Xylolabs, orientada especificamente a la inferencia en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura y el comportamiento del Granite 4.2 de IBM, pero sustituye las capas lineales de atencion y MLP por pesos cuantizados a `ttnn.bfloat4_b` (block floating point de 4 bits con exponente compartido por bloque), generados mediante GPTQ con busqueda de exponente por bloque.

El objetivo es reducir el peso del checkpoint de 17,58 GB en BF16 a 6,13 GB empaquetados (5,58 bits por peso de media), manteniendo una fidelidad alta respecto al modelo original: una divergencia KL media de 0,13995 frente a BF16 sobre 16.216 posiciones de texto en ingles y coreano, y un 86,08 % de top-1 coincidente. El modelo esta pensado para ejecutarse en hardware Tenstorrent mediante TT-NN; la model card indica que fue probado en el simulador ttsim (Blackhole) y no en hardware real.

La relevancia actual radica en la combinacion de un modelo base de 8.791.592.960 parametros, licencia Apache 2.0 y soporte multilingue en doce idiomas con un formato de pesos de 4 bits disenado para un acelerador no-GPU, lo que ofrece una alternativa de despliegue en NPUs de Tenstorrent para cargas de generacion de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de ibm-granite/granite-4.2-8b); capas lineales cuantizadas a BFP4 |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en atencion q/k/v/o y MLP gate/up/down de 40 capas; resto en bf16; media de 5,58 bits/peso; 6,13 GB empaquetados |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4); `quant4.json` describe el formato por proyeccion |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del Granite 4.2 de 8B de IBM. Se aplica GPTQ con busqueda de exponente por bloque sobre las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) de las 40 capas, mientras que el LM head, los embeddings, las normalizaciones y el resto de tensores se conservan en bf16. La calibracion se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los pesos resultantes se almacenan en safetensors en bf16, pero con cada valor ya situado en la rejilla BFP4, de modo que TT-NN los empaqueta sin transformacion adicional.

La model card senala dos limitaciones tecnicas relevantes para el despliegue. Por un lado, tt-transformers (tt-metal v0.81.1) no es utilizable con este checkpoint: carga el modelo como tipo Llama e ignora el multiplicador de atencion propio de Granite (1/128 frente a 1/sqrt(128) de Llama); en la version BFP8, un prefill de 2 capas no coincidio con transformers (PCC 0,95). Por otro, tt-forge (tt-xla) aun no se ha probado con este checkpoint; compila el codigo de transformers, que aplica los multiplicadores correctos, y por defecto mantiene los pesos en bf16, con una opcion `bfp_bf4` que recuantiza en el layout [out, in] de PyTorch.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Granite 4.2 8B.
- Razonamiento y respuesta a instrucciones en formato chat mediante `apply_chat_template`.
- Soporte multilingue en doce idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Capacidad de tool calling y function calling: no confirmada de forma explicita en la informacion proporcionada; debe verificarse contra la model card del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el pipeline declarado es exclusivamente text-generation).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el formato BFP4 esta disenado para que TT-NN empaquete los pesos directamente en Wormhole o Blackhole, lo que permite servir el modelo en NPUs de Tenstorrent sin conversion adicional y con un checkpoint de 6,13 GB.
- Asistentes conversacionales multilingues: con soporte para doce idiomas y plantilla de chat, el modelo puede atender conversaciones en espanol, aleman, frances, japones o coreano desde un unico checkpoint, reduciendo la necesidad de mantener variantes por idioma.
- Generacion de texto en entornos con memoria limitada: al ocupar 6,13 GB empaquetados frente a 17,58 GB en BF16, permite cargar el modelo en dispositivos con DRAM mas ajustada, siempre que el runtime soporte BFP4.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para comparar GPTQ con exponente por bloque frente a Q4_K_M de llama.cpp, ya que la model card publica metricas de KL y top-1 frente a BF16.
- Prototipado en simulador: la model card documenta el uso con ttsim (simulador Blackhole de Tenstorrent) mediante `pack_tensix.py` y `verify_grid.py`, util para validar pipelines antes de disponer de hardware.
- Investigacion sobre fidelidad de cuantizacion: los scripts `verify_grid.py` (comprobacion con torch) y `pack_tensix.py` (comprobacion con TT-NN, incluido round-trip por DRAM) permiten auditar que ningun valor cambia al empaquetar, lo que facilita estudios de degradacion.

## Benchmarks y rendimiento

La model card publica metricas de fidelidad respecto a BF16, no de calidad de tarea:

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-8b) | 16 | 17,58 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4) | 5,58 | 6,127 | 0,13995 | 86,08 | 29 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,86 | 5,348 | 0,14751 | 85,64 | 28 de 33 | 3 |

Las metricas de KL y top-1 cubren 16.216 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la version cuantizada. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado mediciones de velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,13 GB empaquetados en BFP4; el checkpoint completo en disco ocupa 17,6 GB (repo en safetensors bf16).
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole, Blackhole). La model card indica pruebas en ttsim (simulador Blackhole) con ttnn 0.81.1, no en hardware real.
- GPU consumer: no es el objetivo del modelo; la carga en GPU requeriria soporte de BFP4 en el runtime, no documentado en la informacion proporcionada.
- Opciones de despliegue: TT-NN (ttnn) para empaquetado BFP4; transformers para carga en bf16 (`device_map="auto"`); tt-forge (tt-xla) aun no probado con este checkpoint; tt-transformers no es compatible (sin soporte de Granite y multiplicador de atencion incorrecto).
- Latencia y throughput: no disponibles; la model card no incluye mediciones de velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/granite-4.2-8b-Tensix-BFP4 | 8,79 B | no disponible | BFP4 (5,58 bits/peso) | Apache 2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-4.2-8b (BF16) | 8,79 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M derivado del mismo checkpoint (llama.cpp) | 8,79 B | no disponible | 4,86 bits/peso | Apache 2.0 | generado localmente con llama.cpp |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de modelos alternativos de otros autores. El BFP4 supera a Q4_K_M en fidelidad (KL 0,13995 frente a 0,14751; 0 respuestas perdidas frente a 3) con un tamano ligeramente mayor (6,127 GB frente a 5,348 GB).

## Limitaciones y advertencias

- No se ha ejecutado en hardware Tensix real: las pruebas se hicieron en el simulador ttsim (Blackhole) con ttnn 0.81.1, por lo que el rendimiento en dispositivo es desconocido.
- tt-transformers no es compatible con este checkpoint: ignora el multiplicador de atencion de Granite y produce divergencias (PCC 0,95 en un prefill de 2 capas con la version BFP8).
- tt-forge (tt-xla) no se ha probado con este checkpoint; su opcion `bfp_bf4` recuantiza en PyTorch y puede alterar los valores respecto al empaquetado nativo.
- La cuantizacion BFP4 introduce degradacion medible: KL media de 0,13995 y top-1 del 86,08 % respecto a BF16, con perdida de precision en las proyecciones cuantizadas.
- La calibracion se limito a 65.536 tokens de WikiText-2 y Wikipedia en coreano; el comportamiento en otros dominios o idiomas no esta evaluado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben heredarse del modelo base Granite 4.2 8B.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue practico depende de la disponibilidad de hardware Tenstorrent y de un runtime con soporte BFP4.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-8b-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
- Licencia: https://huggingface.co/Xylolabs/granite-4.2-8b-Tensix-BFP4/blob/main/LICENSE
