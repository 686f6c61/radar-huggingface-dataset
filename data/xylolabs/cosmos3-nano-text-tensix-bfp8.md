# Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8

## Resumen

Cosmos3-Nano-Text-Tensix-BFP8 es una cuantizacion del modelo de texto de nvidia/Cosmos3-Nano, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva unicamente la torre de comprension de texto del Cosmos3-Nano original (embedding, 36 capas transformer y LM head), descartando el encoder de vision, el VAE de video y el tokenizador de audio. Los tensores se renombran a la nomenclatura de Qwen3 para que el checkpoint cargue directamente como `Qwen3ForCausalLM` mediante la libreria transformers.

La particularidad tecnica es el formato de pesos: las capas lineales de atencion (q, k, v, o) y de MLP (gate, up, down) en las 36 capas se redondean a la rejilla `ttnn.bfloat8_b` (block floating point de 8 bits con exponente compartido por bloque) usando GPTQ, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (LM head, embeddings, normas) permanecen en bf16. El resultado son 9,64 bits por peso de media y 9,87 GB empaquetados, con 8.190.735.360 parametros totales.

Es relevante porque demuestra un flujo de cuantizacion especifico para aceleradores Tenstorrent, un ecosistema emergente frente a GPU convencionales, y porque permite ejecutar un modelo de ~8.200 millones de parametros en hardware Tensix sin re-redondeo en el momento del empaquetado. La licencia es OpenMDW-1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en capas lineales; bf16 en LM head, embeddings y normas |
| Idiomas soportados | no disponible (tokenizador de NVIDIA; calibracion en ingles y coreano) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8), `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 36 capas, derivado de la torre de texto de nvidia/Cosmos3-Nano. Los tensores se han renombrado a la nomenclatura de Qwen3 para que el checkpoint sea compatible con `Qwen3ForCausalLM` de transformers. No se ha reentrenado el modelo: la unica transformacion es la cuantizacion post-entrenamiento de las proyecciones lineales mediante GPTQ sobre la rejilla `bfloat8_b` de TT-NN, con el exponente compartido por bloque fijado por el propio empaquetador de Tenstorrent. La calibracion uso 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovacion principal es el formato: los ficheros se almacenan en bf16, pero cada valor ya esta situado en la rejilla BFP8, de modo que TT-NN los empaqueta sin volver a redondear. El repositorio incluye utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) y un fichero `quant4.json` que documenta el formato de cada proyeccion. La evaluacion reportada indica que en bf16 el modelo coincide exactamente con el codigo de NVIDIA en texto, y que con las optimizaciones de tt-transformers las dos primeras capas empaquetan de forma exacta con PCC 0.9990 en un prefill de 2 capas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en formato chat (plantilla de chat incluida).
- Razonamiento y respuesta a preguntas en ingles y coreano (idiomas de calibracion); otros idiomas no estan documentados.
- Carga directa como `Qwen3ForCausalLM` en transformers con `dtype="bfloat16"` y `device_map="auto"`.
- Ejecucion en NPU Tenstorrent Tensix mediante tt-metal (tt-transformers) y, teoricamente, tt-forge/tt-xla.
- Compatibilidad con text-generation-inference segun los tags del repositorio.
- No incluye vision, video ni audio: es exclusivamente la torre de texto.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito.

## Casos de uso

- Despliegue en hardware Tenstorrent: ejecutar un modelo de ~8.200 millones de parametros en NPU Wormhole o Blackhole usando tt-metal y el formato BFP8, sin GPU convencional.
- Investigacion en cuantizacion block floating point: servir como referencia reproducible para estudiar el impacto de la rejilla bfloat8_b frente a bf16 en calidad de generacion.
- Inferencia de texto en entornos con restricciones de memoria: los 9,87 GB empaquetados permiten cargar el modelo en aceleradores con DRAM limitada frente a los ~16,4 GB del checkpoint en bf16.
- Evaluacion de pipelines TT-NN: usar `pack_tensix.py` y `verify_grid.py` para validar que el empaquetado de pesos no altera valores antes de integrar en produccion.
- Chatbot de proposito general en ingles o coreano: la plantilla de chat y el tokenizador de NVIDIA permiten montar un asistente conversacional basico sobre `Qwen3ForCausalLM`.
- Benchmarking de portabilidad: comparar la salida del modelo en transformers (bf16) frente a tt-transformers (BFP8) para medir divergencia mediante PCC y KL, como hace la propia model card.
- Prototipado en simulador: probar el flujo completo sobre ttsim (simulador de Blackhole) antes de disponer de hardware fisico.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparando el checkpoint BFP8 con BF16, aunque el contenido citado aparece truncado. Los datos disponibles son:

| Metrica | BFP8 (este checkpoint) | BF16 (nvidia/Cosmos3-Nano) |
|---|---|---|
| Bits por peso | 9,64 (media) | 16 |
| Tamano empaquetado | 9,87 GB | no disponible en el extracto |
| KL media frente a BF16 | no disponible en el extracto | referencia |
| Top-1 (%) | no disponible en el extracto | referencia |
| Respuestas correctas | no disponible en el extracto | referencia |

Ademas se reporta PCC 0.9990 en un prefill de 2 capas frente a transformers, y coincidencia exacta con el codigo de NVIDIA en bf16 sobre texto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,87 GB empaquetados en BFP8; el checkpoint en disco ocupa 16,4 GB (bf16).
- Aceleradores objetivo: NPU Tenstorrent Tensix Wormhole y Blackhole.
- Simulador: ttsim (simulador de Blackhole), probado con ttnn 0.81.1.
- GPU convencionales: no se documenta soporte especifico; al cargar como `Qwen3ForCausalLM` en transformers podria ejecutarse en GPU con suficiente memoria (estimacion no oficial: ~16-17 GB en bf16, ~10 GB en cuantizacion de 8 bits), pero no es el objetivo del checkpoint.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers (`simple_text_demo.py`), tt-forge/tt-xla (no probado con este checkpoint), transformers con `AutoModelForCausalLM`, text-generation-inference segun tags.
- Latencia y throughput: no disponibles; no se han publicado mediciones en hardware fisico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8 | 8.190.735.360 | no disponible | safetensors BFP8/bf16 | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Nano (base) | no disponible en el extracto | no disponible | safetensors | OpenMDW-1.1 | Hugging Face |
| Qwen3 (8B, familia) | ~8.000 millones | no disponible en el extracto | safetensors, GGUF | no disponible en el extracto | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo texto: no incluye vision, video ni audio del Cosmos3-Nano original.
- No probado en hardware Tensix fisico; la validacion se realizo en el simulador ttsim con ttnn 0.81.1.
- tt-forge/tt-xla no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores y romperian la equivalencia exacta.
- En tt-transformers es obligatorio pasar `--use_hf_rope`; sin ello el QKV fusionado se re-redondea.
- El LM head permanece en bf16, por lo que no es exacto frente al demo de tt-metal que empaqueta la cabeza en bfloat8_b.
- La cuantizacion BFP8 introduce divergencia respecto a bf16; la magnitud (KL media, Top-1) no esta disponible en el extracto consultado.
- Idiomas soportados no documentados; la calibracion solo cubre ingles y coreano.
- Longitud de contexto no especificada en la informacion disponible.
- Licencia OpenMDW-1.1: revisar los terminos antes de uso comercial, ya que hereda las condiciones del modelo base de NVIDIA.
- Riesgo de alucinacion y sesgos inherentes al modelo base, no evaluados en esta cuantizacion.
- Sin descargas ni likes en el momento de la consulta; ecosistema de validacion muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- tt-metal: https://github.com/tenstorrent/tt-metal
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tensix-BFP8/blob/main/LICENSE
