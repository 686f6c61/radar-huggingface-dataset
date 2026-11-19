# tuevuong/Qwen3.5-0.8B-Qwen3.8-27B-Draft-NVFP4

## Resumen

`tuevuong/Qwen3.5-0.8B-Qwen3.8-27B-Draft-NVFP4` es una cuantizacion NVFP4 (W4A4) del modelo borrador `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft`, un modelo de 752 millones de parametros disenado especificamente para decodificacion especulativa contra el modelo objetivo Qwen3.8-27B. Lo publica el usuario `tuevuong` utilizando `llm-compressor` 0.15.0 y el formato `compressed-tensors`, con el objetivo de servir el borrador en vLLM sobre GPUs Blackwell con tensor cores FP4.

El modelo no es un asistente conversacional autonomo: es una cabeza de coincidencia de distribucion de tokens entrenada para anticipar las salidas de Qwen3.8-27B. Su utilidad es acelerar la inferencia del modelo grande mediante decodificacion especulativa, aceptando multiples tokens por paso de verificacion. La cuantizacion reduce el checkpoint de 1.5 GB en BF16 a 1.1 GB, manteniendo en BF16 las proyecciones `linear_attn` (GatedDeltaNet) y los pesos `embed_tokens`/`lm_head`.

La relevancia actual radica en que permite desplegar el borrador en GPUs de consumo con soporte FP4 (serie RTX 50), coexistendo con otras cargas en la misma tarjeta. El autor reporta unas 380 tok/s de decodificacion en una RTX 5070 Ti con Ollama cargado en paralelo, con un footprint de aproximadamente 5.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`qwen3_5_text`, `Qwen3_5ForCausalLM`) con proyecciones `linear_attn` (GatedDeltaNet) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (`--max-model-len 131072` en la configuracion de servicio) |
| Tipos de cuantizacion | NVFP4 W4A4: pesos FP4 (E2M1, bloque de 16, escalas FP8-e4m3), activaciones FP4 con escalas estaticas globales/locales; `embed_tokens`/`lm_head` y proyecciones `linear_attn` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelos base Qwen3.5-0.8B y Qwen3.8-27B bajo Apache 2.0) |
| Formato de pesos | safetensors en formato `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.5 de 752M de parametros que incorpora proyecciones de atencion lineal del tipo GatedDeltaNet (`linear_attn`), las cuales se mantienen en BF16 tras la cuantizacion para preservar su estabilidad numerica. El checkpoint cuantizado se genero con la receta `QuantizationModifier` de llm-compressor aplicando el esquema NVFP4 sobre todas las capas `Linear`, excluyendo `lm_head`, `embed_tokens`, `linear_attn` y el bloque `mtp.*`.

La calibracion se realizo con el dataset `perfectblend` (128 secuencias de 2048 tokens). El bloque MTP (multi-token prediction) no esta incluido porque la carga se hace con `Qwen3_5ForCausalLM`, que no lo transporta; para decodificacion especulativa basada en MTP seria necesario cuantizar el modelo base con `load_context(load_mtp=True)`. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo original ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto como modelo borrador para decodificacion especulativa contra Qwen3.8-27B.
- Coincidencia de la distribucion de tokens del modelo objetivo para maximizar la tasa de aceptacion.
- Soporte de contexto largo: hasta 131.072 tokens configurados en vLLM.
- Tool calling segun el formato XML de Qwen3-Coder (parser `qwen3_coder`), aunque el propio autor advierte que la tasa de invocacion de herramientas sera baja.
- Razonamiento en bloques `...` con parser `qwen3` para separar el campo `reasoning`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-27B: el borrador genera candidatos que el modelo objetivo verifica en un solo paso, reduciendo el numero de pasos de decodificacion necesarios y aumentando el throughput efectivo del modelo grande.
- Despliegue en GPUs de consumo Blackwell: con un footprint de ~5.4 GB a `--gpu-memory-utilization 0.35`, cabe en una RTX 5070 Ti de 16 GB junto con otras cargas (por ejemplo, una instancia de Ollama de ~4.6 GB), lo que permite montar un endpoint de decodificacion especulativa en hardware asequible.
- Servicio de endpoints de chat de baja latencia: combinado con el modelo objetivo en vLLM, reduce el tiempo por token en aplicaciones interactivas que requieren respuestas largas.
- Experimentacion con decodificacion especulativa: sirve como banco de pruebas para medir tasas de aceptacion y ajustar parametros de verificacion en pipelines de investigacion.
- Coexistencia multi-modelo en una sola GPU: el autor documenta la convivencia con el borrador de 4B (`tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4`) limitando el contexto a 16k y la utilizacion a ~0.38.
- Evaluacion de cuantizacion NVFP4: util como referencia para comparar el impacto de W4A4 frente a BF16 en modelos pequenos con atencion lineal hibrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de servicio en una RTX 5070 Ti (SM120, coexistiendo con Ollama):

| Metrica | Valor medido |
|---|---|
| Throughput de decodificacion | ~380 tok/s |
| Footprint de vLLM | ~5.4 GB |
| Pesos (incl. partes BF16) | ~1.4 GB |
| Activaciones | ~0.8 GB |
| KV cache | ~2.7-3.2 GB (228.961 tokens) |
| Uso total de GPU con Ollama | ~9.7 GB de 16.3 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: ~5.4 GB con `--gpu-memory-utilization 0.35` (pesos 1.4 GB + activaciones 0.8 GB + KV cache 2.7-3.2 GB).
- GPUs recomendadas: NVIDIA Blackwell con tensor cores FP4 (probado en RTX 5070 Ti, SM120). Otras arquitecturas no estan documentadas en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 5070 Ti de 16 GB, con margen para coexistir con otras cargas.
- Opciones de despliegue: vLLM 0.34.0 con kernels FlashInfer NVFP4 (`vllm/vllm-openai:latest`), formato `compressed-tensors` autodetectado. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~380 tok/s de decodificacion medidos en RTX 5070 Ti con Ollama cargado en paralelo; se recomienda `-cc {"cudagraph_mode":"PIECEWISE"}` cuando otros procesos corren durante la captura de grafos para evitar bloqueos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| tuevuong/Qwen3.5-0.8B-Qwen3.8-27B-Draft-NVFP4 | 752M | 131.072 | NVFP4 W4A4 | NVIDIA Open Model Agreement | Objeto de esta ficha; borrador para Qwen3.8-27B |
| nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft | 752M | no disponible | BF16 | NVIDIA Open Model Agreement | Modelo base sin cuantizar; 1.5 GB |
| tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4 | no disponible (4B nominal) | 16k en configuracion documentada | NVFP4 | NVIDIA Open Model Agreement | Borrador mayor del mismo autor; coexiste con el de 0.8B |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad conversacional autonoma debil: es una cabeza de coincidencia de distribucion, no un asistente ajustado por instrucciones. No debe usarse como endpoint de chat independiente.
- Tasa baja de tool calling: el modelo replica la distribucion del objetivo en lugar de un comportamiento agentico entrenado con SFT.
- Bloque MTP ausente: el checkpoint no incluye `mtp.*`, por lo que no sirve para decodificacion especulativa basada en MTP sin recuantizar el base con `load_context(load_mtp=True)`.
- Dependencia de hardware Blackwell: los kernels NVFP4 requieren tensor cores FP4; el rendimiento en otras arquitecturas no esta documentado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un borrador, los errores se filtran a traves de la verificacion del modelo objetivo.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia: NVIDIA Open Model Agreement, con terminos adicionales respecto a los modelos base Apache 2.0; revisar condiciones para uso comercial.
- Coexistencia en GPU: la captura de grafos con otros procesos activos puede bloquearse si se usa `FULL` en lugar de `PIECEWISE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuevuong/Qwen3.5-0.8B-Qwen3.8-27B-Draft-NVFP4
- Modelo base: https://huggingface.co/nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft
- Borrador de 4B del mismo autor: https://huggingface.co/tuevuong/Qwen3.5-4B-Qwen3.8-27B-Draft-NVFP4
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
