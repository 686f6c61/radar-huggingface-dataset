# Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts

## Resumen

Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts es una cuantizacion del modelo openai/gpt-oss-20b de OpenAI, optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura Mixture-of-Experts (MoE) del original, con aproximadamente 20.900 millones de parametros totales, pero reduce el peso empaquetado de 41,83 GB en bf16 a 13,218 GB mediante cuantizacion de punto flotante por bloques (block floating point, BFP).

La cuantizacion aplica `bfloat4_b` (BFP4) a las proyecciones de los expertos enrutados, `bfloat8_b` (BFP8) a las proyecciones de atencion y al LM head, y mantiene el router, los embeddings y las normas en bf16. Para los expertos se emplea GPTQ con busqueda de exponente por bloque, mientras que el resto de tensores BFP8 se cuantiza con redondeo al mas cercano.

El interes de esta ficha radica en que es una de las primeras publicaciones que empaqueta un modelo open weight de OpenAI directamente en los formatos nativos de Tenstorrent, con verificacion de precision frente a la cuantizacion MXFP4 que distribuye llama.cpp. La perdida de calidad medida (KL medio a bf16 de 0,0636 frente a 0,0678 de MXFP4) es comparable, aunque el modelo esta pensado para ejecutarse en hardware Tensix, no en GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (base: openai/gpt-oss-20b) |
| Parametros totales | 20.914.757.184 (~20,9 mil millones) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en expertos enrutados; BFP8 (`bfloat8_b`) en atencion y LM head; bf16 en router, embeddings y normas |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 (con USAGE_POLICY del modelo base) |
| Formato de pesos | safetensors (empaquetado Tensix; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del openai/gpt-oss-20b: un transformer con capas de mezcla de expertos (MoE) en las que solo un subconjunto de expertos se activa por token. La cuantizacion de Xylolabs se aplica capa a capa: las 24 capas tienen sus proyecciones de atencion q, k, v y o en `bfloat8_b`; las proyecciones gate, up y down de los expertos enrutados en `bfloat4_b` con bloques de 16 a lo largo de las entradas; el router de las 24 capas permanece en bf16; el LM head en `bfloat8_b`; y embeddings, normas y demas tensores en bf16.

El proceso de cuantizacion combina GPTQ (con busqueda de exponente por bloque) para los expertos enrutados y redondeo al mas cercano para los tensores BFP8. Los expertos que recibieron pocos tokens de calibracion se cuantizaron tambien con redondeo al mas cercano. El fichero `quant4.json` documenta el formato de cada proyeccion. No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO; esos datos corresponden a la model card de openai/gpt-oss-20b, no a esta cuantizacion.

La innovacion tecnica principal es el empaquetado nativo para Tensix: los tensores se almacenan en los formatos `ttnn.bfloat4_b` y `ttnn.bfloat8_b`, con verificacion de ida y vuelta contra torch (`pack_tensix.py`) y comprobacion de la rejilla (`verify_grid.py`). El modelo se ha validado con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base.
- Razonamiento y respuesta a instrucciones en formato chat (se usa `apply_chat_template`).
- Capacidades de codigo y matematicas del modelo base (no verificadas de forma independiente en esta cuantizacion).
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base.
- Soporte multilingue segun el modelo base; la evaluacion de esta cuantizacion incluye texto en ingles y coreano.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante kernels y runner propios.
- Compatibilidad con `transformers` en bf16 para inspeccion y validacion.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado en formatos nativos `bfloat4_b` y `bfloat8_b`, por lo que se puede cargar directamente en NPU Wormhole o Blackhole sin conversion adicional, reduciendo el peso de 41,83 GB a 13,218 GB.
- Validacion de precision de cuantizacion: util para equipos que necesitan comparar la perdida de calidad de BFP4 frente a MXFP4 con metricas de KL y top-1 sobre un conjunto fijo de posiciones (WikiText-2 y Wikipedia en coreano).
- Investigacion en formatos block floating point: sirve como referencia reproducible para estudiar el impacto de BFP4 en expertos enrutados frente a BFP8 en atencion.
- Prototipado en simulador: al haberse validado con ttsim, permite desarrollar y depurar pipelines de inferencia Tensix sin disponer de hardware fisico.
- Inferencia conversacional de bajo coste en entornos con NPU: el modelo mantiene el formato chat del original y puede usarse para asistentes y generacion de texto con un footprint de memoria reducido.
- Integracion en pipelines de transformers: el modelo se puede cargar con `AutoModelForCausalLM` en bf16 para verificacion, evaluacion o generacion de referencia antes de desplegarlo en Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (openai/gpt-oss-20b) | 41,83 | 0 | 100 |
| Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts | 13,218 | 0,0636 | 81,90 |
| MXFP4 (llama.cpp, ggml-org/gpt-oss-20b-GGUF) | 12,110 | 0,0678 | 82,65 |

Las metricas de KL y top-1 se calculan sobre 8.188 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), como texto plano. La comparacion con MXFP4 usa el GGUF de ggml-org leido con llama.cpp v0.9.0. El BF16 propio de llama.cpp esta a 0,0435 en KL medio respecto al de este modelo, por lo que cada lado se mide contra su propio BF16.

## Requisitos de hardware

- VRAM estimada: el modelo empaquetado ocupa 13,218 GB; en bf16 para transformers ocupa aproximadamente 41,83 GB.
- GPU recomendadas: no se documentan GPU especificas; el destino principal es hardware Tenstorrent Tensix (Wormhole, Blackhole).
- Cabe en GPU consumer: en bf16 requiere al menos 42 GB, fuera del alcance de la mayoria de GPU consumer; el empaquetado Tensix de 13,218 GB no esta pensado para GPU convencional.
- Opciones de despliegue: `transformers` (bf16, `device_map="auto"`), ttnn 0.81.1 sobre Tensix (simulador ttsim o hardware), y las herramientas `tensix-kernels` y `tensix-runner` v0.1.0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano empaquetado | Licencia | Destino |
|---|---|---|---|---|---|
| Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts | ~20,9 mil millones | no disponible | 13,218 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| openai/gpt-oss-20b (BF16) | ~20,9 mil millones | no disponible | 41,83 GB | Apache 2.0 | GPU / CPU |
| ggml-org/gpt-oss-20b-GGUF (MXFP4) | ~20,9 mil millones | no disponible | 12,110 GB | Apache 2.0 | llama.cpp |

La comparativa se limita al modelo base y a la cuantizacion MXFP4 de referencia, que son las unicas alternativas documentadas en la informacion disponible. No se dispone de datos de contexto ni de parametros activos para ninguna de ellas en esta ficha.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad: KL medio de 0,0636 frente a bf16 y top-1 del 81,90 %, inferior al 100 % del modelo en bf16.
- El modelo esta disenado y validado para hardware Tenstorrent Tensix; su uso en GPU convencional no esta optimizado ni documentado.
- La evaluacion cubre solo 8.188 posiciones de texto en ingles y coreano; no hay datos de otros idiomas ni de tareas de codigo o matematicas.
- No se documentan sesgos especificos de esta cuantizacion; los sesgos del modelo base no se detallan en la informacion disponible.
- Riesgo de alucinacion inherente al modelo base; no cuantificado en esta ficha.
- La licencia es Apache 2.0, pero se hereda la USAGE_POLICY del modelo base, que puede imponer restricciones adicionales al uso comercial.
- Los expertos con pocos tokens de calibracion se cuantizaron con redondeo al mas cercano, lo que puede degradar su precision de forma desigual.
- El modelo se ha validado con ttnn 0.81.1 sobre simulador; no se documenta su comportamiento en hardware fisico a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- GGUF de referencia MXFP4: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper referenciado: https://arxiv.org/abs/2508.10925
