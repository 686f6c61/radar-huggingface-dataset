# xbill9/gemma-4-E2B-it-qat-w8a8-int8

## Resumen

Gemma 4 E2B-it QAT W8A8 int8 es una reconstruccion no oficial del modelo Gemma 4 E2B-it en su version entrenada con cuantizacion (QAT), publicada por el usuario xbill9 a partir de `google/gemma-4-E2B-it-qat-q4_0-unquantized`. El checkpoint redistribuye los pesos de Google DeepMind en el esquema compressed-tensors int8 W8A8 (pesos y activaciones en int8), cargable como `Gemma4ForCausalLM` y limitado a texto: las torres de vision y audio han sido eliminadas.

El objetivo del autor es ofrecer una build servible en vLLM sobre TPU (y potencialmente CUDA) que aproveche la cuantizacion int8 nativa en las unidades matriciales de un chip v5e, obteniendo aproximadamente 1,5x de throughput frente a bf16 sin perdida de precision. El repo pesa 7,4 GB y contiene 4.628.569.379 parametros en safetensors (6,88 GiB de pesos cuantizados).

Es relevante porque demuestra que un QAT ya asentado en la rejilla Q4_0 puede redondearse a int8 por canal con un error relativo medio de ~0,8% y mejorar ligeramente la puntuacion de una suite publica respecto al modelo en bf16, además de ser una de las primeras builds W8A8 int8 verificadas sobre TPU v5e en vLLM. La licencia declarada es Apache 2.0, si bien el enlace de licencia apunta a los terminos especificos de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma4ForCausalLM`), segun el build del autor; detalles de atencion/FFN no disponibles |
| Parametros totales | 4.628.569.379 (~4,63 B) segun safetensors |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 4 admite contexto largo segun fuentes externas, sin cifra concreta) |
| Tipos de cuantizacion | int8 W8A8 (esquema compressed-tensors); pesos int8 con una escala bf16 por canal de salida y activaciones int8 por token |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (el enlace de licencia apunta a los terminos de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors, int-quantized) |

## Arquitectura y entrenamiento

El modelo base es el Gemma 4 E2B-it sometido a entrenamiento consciente de cuantizacion (QAT). Sus pesos ya residen en la rejilla Q4_0, y esta build los redondea a int8 por canal, con un error relativo respecto a los valores QAT de entre 0,6% y 1,7% (media alrededor del 0,8%). Se cuantizan todas las lineales de atencion y MLP del modelo de lenguaje, asi como las proyecciones de embedding por capa (`per_layer_input_gate`, `per_layer_projection`, `per_layer_model_projection`); se mantienen en bf16 el embedding de tokens (ligado a la cabeza LM), la tabla de embeddings por capa y las normas.

La conversion se realizo con el script `w8a8_from_qat.py` y produce un esquema equivalente a una exportacion W8A8 de llm-compressor: pesos int8 con escala `weight_scale` de forma `[out, 1]` y activaciones cuantizadas a int8 en tiempo de ejecucion (`format: int-quantized`). Las torres de vision y audio se descartan, por lo que esta build es exclusivamente de texto. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni etapas posteriores (RLHF/DPO) especificas de este recorte, mas alla de las heredadas del checkpoint QAT de Google.

## Capacidades

- Generacion de texto conversacional (`text-generation`, `conversational`), heredada del modelo instruct de Google.
- Razonamiento y prompting con system prompts, segun la familia Gemma 4 (fuente externa: LM Studio).
- Uso nativo de herramientas (native tool use) a nivel de la familia Gemma 4.
- Contexto largo, segun la descripcion de la familia (sin cifra concreta disponible).
- Capacidades multilingues: no confirmadas en la informacion proporcionada para este build concreto.
- Sin capacidades de vision ni audio: las torres correspondientes fueron eliminadas.

## Casos de uso

- Inferencia de texto a alta concurrencia sobre Cloud TPU: servir multiples peticiones simultaneas con vLLM TPU aprovechando el rendimiento int8 x int8 en las unidades matriciales; el autor reporta ~2.872 tok/s de salida con 16 peticiones por chip v5e.
- Asistentes conversacionales de baja latencia: con 10,4 ms de latencia al primer token en v5e, es adecuado para chat interactivo donde el tiempo hasta la primera respuesta es critico.
- Pipelines de generacion de texto en produccion sobre infraestructura TPU existente: al integrarse en vLLM con servidor compatible con OpenAI, puede desplegarse como backend de texto en servicios ya estandarizados en esa API.
- Procesamiento por lotes de corpus de texto: la combinacion de int8 y bajo footprint (6,88 GiB) permite ejecutar tareas de resumen, clasificacion o extraccion a gran escala sobre un unico chip.
- Evaluacion comparativa de estrategias de cuantizacion: sirve como referencia reproducible para medir el impacto de W8A8 desde QAT frente a W4A16 o a int8 redondeado desde bf16, ya que el autor publica logs por registro.
- Experimentacion con agentes y tool calling en el lado de texto: al conservar las capacidades instruct y de uso de herramientas del base, puede emplearse en flujos multi-paso que no requieran entrada multimodal.
- Pruebas de despliegue en CUDA: aunque no verificado, la ruta CUDA de vLLM soporta este esquema compressed-tensors W8A8, por lo que es candidato para validar en GPU NVIDIA.

## Benchmarks y rendimiento

Resultados medidos por el autor en un chip TPU v5e (`v5litepod-1`), con vLLM TPU y los parches indicados, sobre una suite publica de 3.880 registros leida por probabilidad de etiqueta, comparando registro a registro:

| Build (E2B, un chip v5e) | Suite | tok/s salida a 1 / 4 / 16 peticiones | Latencia primer token |
|---|---:|---|---:|
| `google/gemma-4-E2B-it` (bf16) | 68,3% | 144 / 560 / 2.008 | 12,6 ms |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized`, reempaquetado como W4A16 | 67,8% | 136 / 532 / 1.906 | 16,2 ms |
| `glenic/gemma-4-E2B-it-W8A8-INT8` (W8A8 redondeado desde bf16) | 67,0% | 220 / 842 / 2.876 | 10,7 ms |
| Este checkpoint | 68,6% | 220 / 841 / 2.872 | 10,4 ms |

Frente a bf16, la mejora es de +0,3 puntos (rango 95%: −0,7 a +1,3); frente a la build W8A8 redondeada desde bf16, de +1,5 (+0,5 a +2,6). El autor atribuye el 1,5x de throughput a que en v5e la operacion int8 x int8 se ejecuta de forma nativa en las unidades matriciales al doble de la tasa de bf16. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio: pesos cuantizados de 6,88 GiB (repo de 7,4 GB); en TPU se midio con `--max-model-len 2048`, `--gpu-memory-utilization 0.80` y `--max-num-batched-tokens 512`.
- TPU recomendada: un unico chip Cloud TPU v5e (`v5litepod-1`), ejecutando vLLM TPU con los parches del autor; el backend JAX de vLLM no soporta W8A8 int8 de forma nativa y requiere dichos parches.
- GPU: la ruta CUDA de vLLM soporta el esquema compressed-tensors W8A8, pero el autor indica que NVIDIA no ha sido probado. No se dispone de cifras de VRAM ni de modelos de GPU concretos.
- Consumer GPU: no confirmado; el footprint de ~7 GiB de pesos dejaria margen en GPUs de 12-16 GB, pero no hay medicion publicada en la informacion disponible.
- Opciones de despliegue: vLLM (TPU con parches; CUDA soportado teoricamente sin verificar). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en v5e, 10,4 ms al primer token y 220 / 841 / 2.872 tok/s de salida con 1 / 4 / 16 peticiones, respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Suite | tok/s (16 peticiones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (W8A8 int8 desde QAT) | ~4,63 B | int8 W8A8 | 68,6% | 2.872 | apache-2.0 | HuggingFace |
| `google/gemma-4-E2B-it` (bf16) | ~4,63 B | bf16 | 68,3% | 2.008 | Gemma 4 / apache-2.0 | HuggingFace |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` (repack W4A16) | ~4,63 B | W4A16 | 67,8% | 1.906 | Gemma 4 / apache-2.0 | HuggingFace |
| `glenic/gemma-4-E2B-it-W8A8-INT8` (redondeado desde bf16) | ~4,63 B | int8 W8A8 | 67,0% | 2.876 | no disponible | HuggingFace |

Los cuatro modelos comparten tamano de parametros y arquitectura base; las diferencias se centran en el esquema de cuantizacion y el origen de los pesos (QAT frente a redondeo desde bf16). Datos de contexto y de rendimiento en otras suites: no disponibles.

## Limitaciones y advertencias

- Solo texto: no admite entradas de imagen ni audio, ya que las torres multimodales fueron eliminadas.
- Build no oficial: no esta afiliada ni respaldada por Google; los problemas deben reportarse al autor, no a Google.
- Mediciones realizadas unicamente sobre TPU v5e; el rendimiento en GPU NVIDIA u otro hardware no esta verificado.
- Dependencia de parches: el despliegue en vLLM TPU requiere los parches del autor, ya que el backend JAX no soporta W8A8 int8 de forma nativa.
- Riesgo de alucinacion y sesgos: inherente al modelo base Gemma 4 E2B-it; no se aportan evaluaciones especificas de sesgo en la informacion disponible.
- Idiomas y contexto: no disponibles en la informacion proporcionada; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Licencia: se declara apache-2.0, pero el enlace de licencia remite a los terminos especificos de Gemma 4; conviene revisar las condiciones reales de uso comercial antes de desplegarlo.
- Reduccion de calidad por redondeo: aunque el error relativo medio es ~0,8%, existe una perdida de precision inherente a la cuantizacion respecto a los pesos QAT originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-int8
- Modelo base (QAT unquantized): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Gemma 4 E2B (Google): https://huggingface.co/google/gemma-4-E2B
- Gemma 4 E2B-it-qat-mobile-transformers: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Pagina oficial Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 E2B QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b-qat
- Script de conversion `w8a8_from_qat.py`: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/w8a8_from_qat.py
- Parches vLLM TPU para esta build: https://github.com/xbill9/gemma4-dev/tree/main/tpu-vllm-v5e1-2b-w8a8
- Logs y salidas por registro (v5e): https://github.com/xbill9/gemma4-dev/tree/main/jev-tpu-v5e1
- Inferencia JAX en un solo TPU: https://github.com/xbill9/tpu-jax-v5e1-2b
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
