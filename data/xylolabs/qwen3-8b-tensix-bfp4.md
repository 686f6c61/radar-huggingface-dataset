# Xylolabs/Qwen3-8B-Tensix-BFP4

## Resumen

Qwen3-8B-Tensix-BFP4 es una cuantizacion del modelo Qwen3-8B de Alibaba Qwen, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura original de Qwen3-8B (transformer denso de 8.190.735.360 parametros) pero redondea las capas lineales de atencion y MLP al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4) mediante GPTQ, de modo que TT-NN pueda empaquetar los pesos sin volver a redondearlos. Es, por tanto, un artefacto de despliegue para hardware Tenstorrent mas que un modelo nuevo.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de cuantizacion de 4,5 bits por peso con preservacion exacta de la rejilla BFP4, y por otro advierte de que el modelo fue validado unicamente en `ttsim`, el simulador de Blackhole de Tenstorrent, y no en silicio real. El repositorio ocupa 16,4 GB porque los tensores se almacenan en bf16 aunque sus valores ya esten en la rejilla BFP4; el peso empaquetado real es de 6,40 GB (6,25 bits por peso de media).

El modelo hereda las capacidades del Qwen3-8B original (generacion de texto, razonamiento, codigo, modo thinking, tool calling y cobertura multilingue amplia), pero con el objetivo declarado de ejecutarse en aceleradores Tensix. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas lineales cuantizadas a BFP4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en atencion q/k/v/o y MLP gate/up/down de 36 capas; bf16 en LM head, embeddings, normas y resto de tensores; 6,25 bits por peso de media |
| Idiomas soportados | no disponible (el calibrado GPTQ uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, con valores ya situados en la rejilla BFP4); indice `model.safetensors.index.json` y mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del Qwen3-8B original. No se reentrena: se aplica GPTQ sobre las proyecciones lineales de atencion (q, k, v, o) y de la MLP (gate, up, down) de las 36 capas, con una busqueda de exponente por bloque para ajustar cada valor a la rejilla `bfloat4_b`. El calibrado utilizo 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resto de tensores (LM head, embeddings, normas y demas) permanece en bf16 tal como en el modelo base.

La innovacion tecnica clave es la preservacion exacta de la rejilla: los pesos se guardan en bf16 pero cada valor ya esta alineado a BFP4, de forma que TT-NN los empaqueta sin un segundo redondeo. El autor proporciona scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera ningun valor. Se documenta tambien que los mismos valores empaquetan de forma exacta en `ttnn.bfloat8_b`. La integracion con tt-transformers (tt-metal v0.81.1) requiere `--use_hf_rope` para evitar el re-redondeo del QKV fusionado; con tt-forge (tt-xla) los pesos se ejecutan en bf16 por defecto y su opcion `bfp_bf4` re-redondea con otro diseno de bloque, por lo que no es adecuada para los 4,5 bits.

## Capacidades

- Generacion de texto conversacional y de un solo turno, heredada del Qwen3-8B base.
- Razonamiento y modo thinking (Qwen3 incorpora modos de pensamiento explicito en el modelo base).
- Generacion de codigo y resolucion de problemas matematicos.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Capacidades multilingues amplias (heredadas del base; el autor no documenta el conjunto exacto).
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado exacto de pesos BFP4.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.
- No se documentan capacidades de vision ni audio en esta cuantizacion.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta pensado para ejecutarse en NPU Wormhole y Blackhole usando TT-NN con pesos BFP4, reduciendo el peso empaquetado a 6,40 GB frente a los ~16 GB en bf16.
- Inferencia de bajo coste en hardware no-GPU: util para entornos que ya disponen de tarjetas Tenstorrent y quieren servir un modelo de 8B sin depender de CUDA.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el empaquetado BFP4 no altera ningun valor, util como referencia para otros modelos cuantizados a Tensix.
- Experimentacion con GPTQ y formatos de bloque: sirve como caso de estudio de cuantizacion a 4,5 bits con busqueda de exponente por bloque y calibrado multilingue.
- Chat y asistencia conversacional en entornos con NPU: el modelo conserva el chat template de Qwen3 y puede usarse con `apply_chat_template` para conversaciones multi-turno.
- Generacion de codigo en pipelines internos: al mantener las capacidades del Qwen3-8B base, puede integrarse en tareas de autocompletado y generacion de codigo, siempre que el hardware destino sea Tensix o se use la version bf16.
- Pruebas de compatibilidad con tt-transformers y tt-forge: util para equipos que evaluan la madurez del stack de software de Tenstorrent antes de invertir en hardware.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion parcial (la informacion proporcionada se corta en la fila de BF16). Los datos disponibles son:

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | no disponible | referencia | no disponible | no disponible | no disponible |
| Qwen3-8B-Tensix-BFP4 | 4,5 (6,25 media) | 6,40 empaquetado | no disponible en el extracto | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados completos de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion. El autor solo reporta metricas de fidelidad respecto a BF16 (KL medio, Top-1 y respuestas correctas), cuyos valores no aparecen en el extracto proporcionado.

## Requisitos de hardware

- VRAM/peso empaquetado: 6,40 GB en BFP4 (6,25 bits por peso de media); el repositorio en disco ocupa 16,4 GB por almacenarse en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Validacion: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ha ejecutado en hardware real segun la model card.
- GPU consumer: no es el objetivo del artefacto; en GPU se usaria el Qwen3-8B base en bf16 o una cuantizacion GGUF/AWQ estandar, no este repositorio.
- Despliegue en Tensix: tt-transformers (tt-metal v0.81.1) con `--use_hf_rope` y configuracion de precision `ff1_3: bfp4, ff2: bfp4, wqkv: bfp4, wo: bfp4, kv_cache: bfp8, activation: mixed`.
- Despliegue alternativo: tt-forge (tt-xla, `pjrt-plugin-tt==1.4.0`), que ejecuta los pesos en bf16 por defecto; no se ha probado de extremo a extremo.
- Carga en transformers: `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Tensix-BFP4 | 8,19 B | no disponible | BFP4 (4,5 bits/peso) | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | bf16 | Apache 2.0 | GPU/CPU generico |
| Cuantizaciones GGUF/AWQ de Qwen3-8B | 8,19 B | no disponible | 4-8 bits | Apache 2.0 (heredada) | GPU consumer, CPU |

La comparativa se limita al modelo base y a cuantizaciones genericas, ya que no se dispone de datos de rendimiento de esta version BFP4 ni de alternativas equivalentes para Tensix en la informacion proporcionada.

## Limitaciones y advertencias

- No validado en hardware real: las pruebas se hicieron en `ttsim`, el simulador de Blackhole; el comportamiento en silicio Wormhole o Blackhole no esta confirmado.
- El repositorio almacena los pesos en bf16 (16,4 GB) aunque el peso empaquetado sea de 6,40 GB; el ahorro de disco solo se materializa tras el empaquetado con TT-NN.
- Con tt-forge los pesos se ejecutan en bf16 por defecto; su opcion `bfp_bf4` re-redondea con otro diseno de bloque y no es equivalente a esta cuantizacion.
- Con tt-transformers es obligatorio `--use_hf_rope`; sin ello el QKV fusionado se re-redondea y se pierde la exactitud de la rejilla.
- El demo de tt-transformers empaqueta el LM head en bfloat8_b, por lo que el head no es exacto en ese flujo.
- El calibrado GPTQ uso WikiText-2 y Wikipedia en coreano; no se documenta el impacto en otros idiomas ni en dominios especializados.
- No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el riesgo de degradacion por cuantizacion a 4,5 bits no esta cuantificado en el extracto.
- Riesgo de alucinacion y sesgos: heredados del Qwen3-8B base, no reevaluados para esta cuantizacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion sobre Tensix.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Tensix-BFP4/blob/main/LICENSE
