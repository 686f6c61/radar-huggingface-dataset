# turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-W8A8 es una cuantización W8A8 (FP8 en pesos y activaciones) del modelo NVIDIA Nemotron-3.5-Bolt-E4B-BF16, publicada por TurinTech bajo su pipeline Artemis. El modelo base es un modelo conversacional de NVIDIA orientado a generación de texto con capacidades multimodales (image-text-to-text), construido sobre la familia Gemma 4 según los tags del repositorio. Esta versión cuantizada mantiene los pesos del checkpoint original en atención y núcleo, y solo cuantiza las capas MLP del modelo de lenguaje a FP8, reduciendo el peso de 15,99 GB a 12,69 GB.

La relevancia de esta publicación es práctica: ofrece un checkpoint listo para vLLM con kernels W8A8, pensado para GPUs con multiplicaciones matriciales FP8 rápidas. TurinTech reporta 171 tokens/s en generación de una sola petición (frente a 139 tokens/s del BF16 original) en una RTX 5090, con un rendimiento en GSM8K (231/250) y en tool calls (374/400) prácticamente idéntico al original. Es, por tanto, una opción de despliegue eficiente para quien ya trabaja con el modelo de NVIDIA y quiere reducir huella de memoria sin perder calidad apreciable.

El modelo tiene 7.996.156.490 parámetros totales según safetensors y un repositorio de 12,8 GB. La licencia es OpenMDW 1.1, heredada del modelo base. La información pública disponible no detalla la longitud de contexto nativa, los idiomas soportados ni la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4 según tags; cuantización selectiva de MLP a FP8 (W8A8) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado hasta 4.096 tokens en vLLM; no se testearon contextos mayores) |
| Tipos de cuantizacion | W8A8 (FP8 en pesos y activaciones de las capas MLP); resto de tensores en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de NVIDIA de la familia Nemotron 3.5 Bolt E4B, con pipeline image-text-to-text y capacidad de generación de texto conversacional. Esta versión de TurinTech no reentrena el modelo: parte del checkpoint BF16 de NVIDIA y aplica una cuantización W8A8 únicamente sobre las capas MLP del modelo de lenguaje. Los tensores de atención (`attn.safetensors`, 1,17 GB), núcleo (`core.safetensors`, 8,10 GB) y KV compartida (`model-frozen-shared-kv.safetensors`, 110 MB) se redistribuyen sin cambios desde el checkpoint original; solo `mlp.safetensors` (3,31 GB) contiene los pesos cuantizados.

La innovación técnica de esta publicación es la cuantización selectiva: al limitar el W8A8 a las MLP, se preserva la fidelidad del resto de la red y se aprovechan kernels FP8 en las operaciones matriciales más costosas. TurinTech reporta una divergencia KL de 0,019 frente al BF16 original (el checkpoint FP8 propio de TurinTech logra 0,010). El modelo se probó con vLLM 0.32.0rc1, una build de desarrollo, con thinking desactivado y contextos de hasta 4.096 tokens. No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text); para imágenes hay que omitir `--language-model-only` en vLLM.
- Soporte de audio en vLLM instalando `vllm[audio]` y omitiendo `--language-model-only`.
- Tool calling / function calling: compatible con `--enable-auto-tool-choice` y `--tool-call-parser gemma4`; las llamadas se devuelven en `choices[0].message.tool_calls`.
- Modo thinking configurable mediante `chat_template_kwargs.enable_thinking`; los resultados publicados se midieron con thinking desactivado.
- Razonamiento matemático a nivel GSM8K (231/250 en la evaluación de TurinTech).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de chat conversacional en GPUs de 16 GB: con pesos de 12,69 GB y las opciones `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`, TurinTech indica que debería caber en una GPU de 16 GB (esperado, no probado en esa clase de tarjeta).
- Asistentes con tool calling en producción: el parser `gemma4` y `--enable-auto-tool-choice` permiten integrar el modelo en agentes que invocan APIs externas, con 374 de 400 tool calls correctas en la evaluación del autor.
- Servicio de inferencia de baja latencia en vLLM: 171 tokens/s en una sola petición en RTX 5090 lo hace adecuado para aplicaciones interactivas donde el tiempo hasta el primer token y el throughput importan.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede usarse para tareas que combinan capturas, figuras o formularios con instrucciones en lenguaje natural.
- Transcripción y comprensión de audio en pipelines vLLM: con `vllm[audio]` instalado, el modelo puede atender entradas de audio junto a texto.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de W8A8 selectivo frente a FP8 y BF16 en tareas de chat, tool calling y matemáticas.
- Prototipado de agentes multi-paso: el soporte de thinking mode y tool calling permite construir flujos de razonamiento encadenado, aunque los benchmarks publicados se midieron con thinking desactivado.

## Benchmarks y rendimiento

Resultados publicados por TurinTech, medidos en una NVIDIA RTX 5090 con vLLM 0.32.0rc1, thinking desactivado y contextos de hasta 4.096 tokens:

| Modelo | Tamano | KL chat (menor es mejor) | Tool calls (de 400) | GSM8K (de 250) | Generacion, una peticion (tok/s) |
|---|---|---|---|---|---|
| TurinTech W8A8 | 12,69 GB | 0,019 | 374 | 231 | 171 |
| TurinTech FP8 | 12,69 GB | 0,010 | 371 | 230 | 183 |
| BF16 original | 15,99 GB | referencia | 371 | 229 | 139 |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Pesos en vLLM: 11,07 GiB de memoria para pesos según la model card (12,69 GB en disco).
- VRAM estimada para inferencia: no disponible de forma explícita; con 11,07 GiB de pesos más caché KV y overhead, TurinTech sugiere que cabe en una GPU de 16 GB con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048` (esperado, no probado en una tarjeta de 16 GB).
- GPU recomendadas: GPUs con multiplicaciones matriciales FP8 rápidas. TurinTech señala que en Hopper y Ada el W8A8 debería ayudar más, pero no se probaron. En RTX 5090 y similares, el checkpoint FP8 propio de TurinTech es más fiel y entre un 4 % y un 7 % más rápido.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas de 16 GB o más; la única medición publicada es en RTX 5090.
- Opciones de despliegue: vLLM (probado con 0.32.0rc1); compatible con `transformers` y `compressed-tensors`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 171 tokens/s en generación de una sola petición en RTX 5090, thinking desactivado. No se publican datos de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Artemis-W8A8 (este) | 7.996.156.490 | no disponible | W8A8 selectivo (MLP) | OpenMDW 1.1 | Hugging Face, vLLM |
| TurinTech Nemotron-3.5-Bolt-E4B FP8 | mismo base | no disponible | FP8 | OpenMDW 1.1 | Hugging Face |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 | mismo base | no disponible | BF16 | OpenMDW 1.1 | Hugging Face |

La comparativa se limita a las tres variantes del mismo modelo base que aparecen en la model card. No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base de NVIDIA.
- Riesgo de alucinación: no cuantificado en la model card; aplicable el riesgo habitual de los modelos generativos.
- Limitaciones de contexto: solo se probaron contextos de hasta 4.096 tokens; no se validó el comportamiento en ventanas mayores.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Licencia: OpenMDW 1.1; conviene revisar sus términos para uso comercial, ya que la licencia se etiqueta como "other" en Hugging Face.
- La cuantización W8A8 no es la opción óptima en todas las GPUs: en RTX 5090 el checkpoint FP8 de TurinTech es más fiel (KL 0,010 frente a 0,019) y entre un 4 % y un 7 % más rápido.
- Los resultados se midieron con thinking desactivado; el rendimiento con thinking activado no está documentado.
- vLLM 0.32.0rc1 es una build de desarrollo; la compatibilidad con versiones estables no está garantizada.
- El soporte de imagen y audio requiere omitir `--language-model-only`; el audio necesita además `pip install "vllm[audio]"`.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados completos y método: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8/blob/main/RESULTS.md
