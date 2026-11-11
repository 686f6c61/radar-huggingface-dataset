# Xylolabs/phi-4-Tensix-BFP8

## Resumen

phi-4-Tensix-BFP8 es una cuantizacion del modelo microsoft/phi-4 (14.659.507.200 parametros, arquitectura transformer densa) realizada por Xylolabs para su ejecucion en las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo mantiene los pesos en bf16 en disco, pero cada valor ya esta redondeado sobre la retícula de punto flotante por bloques bfloat8_b (BFP8) mediante GPTQ, de modo que TT-NN puede empaquetarlos sin volver a redondear y sin perdida adicional de precision.

La propuesta resuelve un problema concreto de despliegue: llevar un modelo de lenguaje de 14.700 millones de parametros a aceleradores Tensix con un formato nativo de 8,5 bits por peso en las capas lineales, reduciendo el peso empaquetado a 16,54 GB (9,03 bits por peso de media) frente a los 29,32 GB del checkpoint BF16 original. La evaluacion reportada por el autor muestra una divergencia KL media de 0,00071 frente a BF16 y un top-1 del 98,76 %, con 28 de 33 respuestas correctas frente a 29 del modelo base.

Es relevante ahora porque los formatos de bloque como bfloat8_b son la via practica para ejecutar LLM de tamano medio en hardware no-GPU, y esta publicacion documenta el proceso completo (GPTQ sobre retícula BFP8, calibracion con 65.536 tokens de WikiText-2 y Wikipedia en coreano, verificacion bit a bit del empaquetado). Conviene senalar que el autor indica que las pruebas se hicieron con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM en el checkpoint; base Phi-4) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (bfloat8_b, 8,5 bits por peso) en capas lineales; bf16 en el resto |
| Idiomas soportados | en (ingles; calibracion adicional con Wikipedia en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16 en disco, valores sobre retícula BFP8); empaquetado BFP8 de 16,54 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento de microsoft/phi-4, no un modelo entrenado desde cero. Las 40 capas del transformer mantienen su estructura original, pero las proyecciones de atencion (q, k, v, o) y del MLP (gate, up, down) se redondean a bfloat8_b, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. El resultado son 9,03 bits por peso de media y 16,54 GB empaquetados; el fichero `quant4.json` documenta el formato de cada proyeccion.

La innovacion tecnica esta en el metodo de cuantizacion: GPTQ aplicado directamente sobre la retícula de bfloat8_b, con el exponente compartido de cada bloque fijado por el empaquetador (no renegociado), calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El checkpoint se distribuye en el layout de Llama (`LlamaForCausalLM`): las matrices fusionadas q, k, v y gate-up de Phi-4 se han separado conservando los mismos valores. El autor incluye utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado en TT-NN no altera ningun valor; con `--use_hf_rope` en tt-transformers, las proyecciones de las dos primeras capas empaquetaron de forma exacta y un prefill de 2 capas coincidio con transformers con PCC 0,9996.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de microsoft/phi-4.
- Razonamiento y matematicas de nivel medio-alto propios del modelo base Phi-4 (33 preguntas cortas en la evaluacion del autor).
- Capacidad de codigo del modelo base (no re-evaluada en esta cuantizacion).
- Ejecucion en NPU Tensix de Tenstorrent mediante TT-NN y tt-transformers (tt-metal v0.81.1).
- Compatibilidad con el pipeline `text-generation` de transformers y con endpoints compatibles (`endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni modo thinking especificas de esta cuantizacion.

## Casos de uso

- Despliegue en aceleradores Tensix: el caso principal; el checkpoint esta disenado para empaquetarse en Wormhole o Blackhole con `ttnn.as_tensor` en `bfloat8_b`, evitando el redondeo adicional que sufriria un checkpoint BF16 generico.
- Inferencia de texto en transformers: carga directa con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` para servir el modelo en GPU convencional con un checkpoint mas ligero (16,54 GB empaquetados frente a 29,32 GB).
- Evaluacion de calidad de cuantizacion: util como referencia para medir divergencia KL y top-1 frente a BF16 en pipelines de compresion, dado que el autor publica la metodologia y las herramientas de verificacion.
- Prototipado en simulador: con ttsim (simulador de Blackhole) se puede validar el empaquetado y el grafo antes de disponer de hardware, gracias a los scripts incluidos.
- Servicio conversacional en ingles: al conservar el 98,76 % de top-1 frente a BF16, es adecuado para chatbots y asistentes de texto donde el ahorro de memoria importa mas que la fidelidad absoluta.
- Investigacion en formatos de bloque: el repositorio y el codigo `tensix-bfp-gptq` sirven de base para aplicar el mismo procedimiento GPTQ-sobre-BFP8 a otros modelos de la familia Llama.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | 29 de 33 | - |
| phi-4-Tensix-BFP8 (este) | 9,03 | 16,539 | 0,00071 | 98,76 | 28 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,0180 | 93,65 | 29 de 33 | 0 |

Las metricas KL y top-1 cubren 16.280 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en transformers: el checkpoint ocupa 16,54 GB empaquetados y se carga en bf16, por lo que se necesita al menos ~30 GB de memoria para el modelo completo en precision de carga; con `device_map="auto"` puede repartirse entre varias GPU.
- GPU recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU en consumer (por ejemplo, dos RTX 4090 de 24 GB) mediante reparto de capas.
- Cabe en consumer GPU: una RTX 4090 de 24 GB no aloja el modelo completo en bf16 sin offload; si cabe en configuraciones multi-GPU o con cuantizacion adicional no documentada.
- Despliegue: transformers (soporte declarado), TT-NN/tt-metal v0.81.1 con tt-transformers para Tensix, y tt-forge (tt-xla), aunque este ultimo no se ha probado con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; las pruebas se realizaron en el simulador ttsim, no en hardware fisico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| phi-4-Tensix-BFP8 | 14,66 B | no disponible | 9,03 | 16,54 GB | MIT | Hugging Face |
| microsoft/phi-4 (BF16) | 14,66 B | no disponible | 16 | 29,32 GB | MIT | Hugging Face |
| phi-4 Q4_K_M (llama.cpp) | 14,66 B | no disponible | 4,94 | 9,06 GB | MIT | Hugging Face / llama.cpp |

Frente a la cuantizacion Q4_K_M, este checkpoint sacrifica compresion (16,54 GB frente a 9,06 GB) a cambio de mucha mayor fidelidad (KL 0,00071 frente a 0,0180; top-1 98,76 % frente a 93,65 %) y de un formato nativo para Tensix. Frente al BF16 original, reduce el tamano un 43,6 % con una perdida de calidad medida muy baja.

## Limitaciones y advertencias

- Solo se ha validado en el simulador ttsim de Tenstorrent; el autor indica explicitamente que no se ha probado en hardware fisico.
- El modelo esta orientado a ingles; la calibracion incluye coreano, pero no se declaran capacidades multilingues adicionales.
- Riesgo de alucinacion inherente al modelo base Phi-4; la cuantizacion anade una divergencia KL pequena pero no nula (0,00071).
- El LM head se mantiene en bf16, mientras que el demo de tt-transformers empaqueta la cabeza en bfloat8_b, por lo que ese componente no es exacto en dicho demo.
- En tt-forge (tt-xla) no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` vuelven a redondear los valores.
- Sin `--use_hf_rope` en tt-transformers, el demo permuta las filas de q y k y re-redondea el QKV fusionado, alterando el resultado.
- Licencia MIT: permite uso comercial, pero se heredan las condiciones y limitaciones del modelo base microsoft/phi-4.
- Sin datos publicados de benchmarks estandar ni de latencia/throughput en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP8
- Modelo base: https://huggingface.co/microsoft/phi-4
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP8/blob/main/LICENSE
