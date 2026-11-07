# turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-W4A16 es una cuantización de 4 bits (W4A16) del modelo NVIDIA Nemotron-3.5-Bolt-E4B desarrollada por TurinTech mediante su pipeline Artemis. El modelo base es un modelo conversacional de NVIDIA, post-entrenado a partir de Gemma 4 E4B de Google, capaz de procesar texto, imágenes y audio. Esta versión cuantizada reduce el peso de los pesos de 15,99 GB (BF16 original) a 11,24 GB, manteniendo los tensores de atención y el núcleo en precisión original y cuantizando únicamente las capas MLP del modelo de lenguaje.

La relevancia de este checkpoint radica en su equilibrio entre tamaño y rendimiento: en las pruebas publicadas por el autor, logra 205 tokens por segundo en una sola petición sobre una RTX 5090, frente a los 139 tok/s del original BF16, con una calidad en GSM8K (92,0 % en las primeras 250 preguntas) y en tool calling (92,5 % en casos no calibrados) prácticamente idéntica a la del modelo sin cuantizar. Está diseñado específicamente para servirse con vLLM y emplea el formato compressed-tensors.

El modelo conserva las capacidades multimodales del original (texto, imagen y audio) y el soporte de tool calling, aunque el autor advierte que las pruebas se realizaron con el modo thinking desactivado y contextos de hasta 4.096 tokens. La licencia es OpenMDW-1.1, la misma del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la arquitectura de Gemma 4 E4B, post-entrenada por NVIDIA); pesos MLP cuantizados con compressed-tensors |
| Parametros totales | 7.996.156.490 (aproximadamente 8,0 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens probados por el autor; la longitud máxima nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | W4A16 (pesos MLP en enteros de 4 bits, activaciones en 16 bits); tensores de atención y núcleo sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM); existe una variante GGUF del mismo autor |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3.5-Bolt-E4B, es un modelo conversacional multimodal post-entrenado por NVIDIA a partir de Gemma 4 E4B de Google, con capacidad para procesar texto, imágenes y audio. La arquitectura subyacente es la de Gemma 4 E4B, un transformer con mecanismos de atención compartida de KV (el repositorio incluye un fichero `model-frozen-shared-kv.safetensors` de 110 MB redistribuido sin cambios desde el checkpoint de NVIDIA). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas por NVIDIA.

La contribución de TurinTech es exclusivamente de cuantización: los tensores de atención (`attn.safetensors`, 1,17 GB) y del núcleo (`core.safetensors`, 8,10 GB) se redistribuyen sin cambios desde el checkpoint de NVIDIA, mientras que los pesos MLP del modelo de lenguaje (`mlp.safetensors`, 1,86 GB) se cuantizan a 4 bits mediante el pipeline Artemis. El resultado son 11,24 GB de pesos que ocupan 9,70 GiB en memoria de vLLM. El autor indica que el proceso de calibración se aplicó a un conjunto de casos de tool calling, y que los resultados reportados excluyen esos casos de calibración.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes (image-text-to-text): el pipeline declarado es text-generation, pero las etiquetas y la model card confirman capacidades de visión.
- Procesamiento de audio: requiere `pip install "vllm[audio]"` y eliminar la opción `--language-model-only`.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice --tool-call-parser gemma4` en vLLM; las llamadas se devuelven en `choices[0].message.tool_calls`.
- Modo thinking configurable mediante `chat_template_kwargs: {"enable_thinking": false}`; todos los resultados publicados se midieron con thinking desactivado.
- Razonamiento matemático a nivel de GSM8K (92,0 % en las primeras 250 preguntas).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat conversacional en producción con vLLM: el checkpoint ocupa 11,24 GB de pesos y 9,70 GiB en memoria de vLLM, lo que permite desplegarlo en una GPU de 16 GB con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`, según las indicaciones del autor.
- Asistentes con tool calling: el modelo alcanza un 92,5 % en casos de tool calling no calibrados, por lo que es adecuado para agentes que invocan APIs externas mediante el parser `gemma4` de vLLM.
- Atención al cliente automatizada: con 4.096 tokens de contexto probados y generación a 205 tok/s en una sola petición, puede gestionar conversaciones multi-turno con latencia baja en una RTX 5090.
- Procesamiento de documentos con imágenes: al conservar las capacidades de visión del modelo base (eliminando `--language-model-only`), puede emplearse para tareas de image-text-to-text como descripción o extracción de información de imágenes.
- Transcripción y análisis de audio: con el extra `vllm[audio]` instalado, el modelo puede procesar entradas de audio en pipelines de análisis.
- Razonamiento matemático asistido: con un 92,0 % en GSM8K, es adecuado para resolución de problemas aritméticos de nivel escolar en aplicaciones educativas o de validación.
- Despliegue en estaciones de trabajo con GPU de consumo: el tamaño reducido (11,24 GB) permite ejecutarlo en una RTX 5090 de 32 GB con amplio margen para caché KV (235.490 tokens de KV cache según el autor) o, con ajustes, en GPUs de 16 GB.

## Benchmarks y rendimiento

Resultados publicados por TurinTech, medidos en una NVIDIA RTX 5090 con vLLM 0.32.0rc1 y thinking desactivado:

| Modelo | Tamano | KL chat (menor es mejor) | Tool calls, casos no calibrados | GSM8K, primeras 250 | Generacion, una peticion (tok/s) |
|---|---|---|---|---|---|
| TurinTech W4A16 | 11,24 GB | 0,080 | 92,5 % | 92,0 % | 205 |
| TurinTech FP8 | 12,69 GB | 0,010 | 92,2 % | 92,0 % | 183 |
| BF16 original | 15,99 GB | referencia | 92,2 % | 91,6 % | 139 |

El autor señala que el KL del checkpoint W4A16 es entre 6,0 y 7,8 veces mayor que el del checkpoint FP8 de TurinTech, lo que indica una mayor divergencia respecto al original BF16 a pesar de mantener el rendimiento en las tareas evaluadas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,24 GB de pesos (9,70 GiB en memoria de vLLM); en una GPU de 16 GB el autor recomienda añadir `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048` y reducir el primer valor si la GPU también gestiona pantalla (no probado en tarjeta de 16 GB).
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) para las mediciones publicadas, con 235.490 tokens de KV cache disponibles; GPUs de 16 GB como opción esperada aunque no verificada.
- Cabe en GPU de consumo: sí, en RTX 5090 de forma verificada y en GPUs de 16 GB de forma esperada según el autor.
- Opciones de despliegue: vLLM (versión probada 0.32.0rc1, build de desarrollo) con `--dtype bfloat16 --max-model-len 4096 --language-model-only --enable-auto-tool-choice --tool-call-parser gemma4`; existe una variante GGUF del mismo autor para llama.cpp/LM Studio.
- Latencia y throughput: 205 tok/s en una sola petición (frente a 139 tok/s del BF16 original y 183 tok/s del FP8 de TurinTech); no se publican datos de throughput con batching.
- Decodificación especulativa: NVIDIA publica un drafter DFlash (`Nemotron-3.5-Bolt-E4B-DFlash-BF16.gguf`, 737 MB) en `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` (revisión 0949a2e, OpenMDW-1.1), que no está incluido en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto probado | GSM8K (250) | Tool calls | Licencia | Formato |
|---|---|---|---|---|---|---|
| TurinTech W4A16 (este) | 8,0 B | 4.096 tokens | 92,0 % | 92,5 % | OpenMDW-1.1 | safetensors (compressed-tensors) |
| TurinTech FP8 | 8,0 B | 4.096 tokens | 92,0 % | 92,2 % | OpenMDW-1.1 | safetensors |
| NVIDIA Nemotron-3.5-Bolt-E4B BF16 | 8,0 B | 4.096 tokens | 91,6 % | 92,2 % | OpenMDW-1.1 | safetensors |
| TurinTech Artemis GGUF | 8,0 B | no disponible | no disponible | no disponible | OpenMDW-1.1 | GGUF |

Las alternativas comparables directas son las otras variantes del mismo modelo base publicadas por TurinTech y por NVIDIA. No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Divergencia respecto al original: el KL de chat del checkpoint W4A16 (0,080) es entre 6,0 y 7,8 veces superior al del FP8 de TurinTech (0,010); si la fidelidad al modelo original es crítica, el autor recomienda elegir otro fichero.
- Contexto limitado en las pruebas: solo se verificaron contextos de hasta 4.096 tokens; no se probaron contextos más largos.
- Tool calling multi-turno no probado: los resultados de tool calling corresponden a casos de un solo turno y excluyen los casos usados en calibración.
- Multimodalidad solo comprobada superficialmente: imágenes y audio fueron únicamente "spot-checked" según el autor, no evaluados en profundidad.
- Thinking desactivado: todos los resultados se midieron con thinking off; el rendimiento con thinking activado no está documentado.
- Idiomas soportados no disponibles: no se especifica la cobertura lingüística del modelo.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben asumirse los del modelo base de NVIDIA.
- Licencia OpenMDW-1.1: es una licencia "other" que debe revisarse en https://openmdw.ai/license/1-1/ antes de uso comercial; no se detallan aquí sus restricciones.
- Versión de vLLM: probado con una build de desarrollo (0.32.0rc1), no con una versión estable; puede requerir ajustes en versiones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Variante GGUF del mismo autor: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Drafter DFlash de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Resultados completos y método: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16/blob/main/RESULTS.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Web de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
