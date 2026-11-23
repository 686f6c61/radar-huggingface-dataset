# unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr2e-7_col4096_hf

## Resumen

reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr2e-7_col4096_hf es un ajuste fino (SFT) del modelo Qwen3-1.7B, desarrollado por el usuario unamed12 y publicado en Hugging Face. Se trata de un experimento de entrenamiento supervisado orientado a mejorar el razonamiento sobre un dataset especifico de instrucciones y generacion de codigo con pistas (blueprint hints) y modo thinking, construido a partir de trazas de razonamiento tipo DAPO. El modelo conserva la arquitectura transformer decoder-only del Qwen3-1.7B original, con aproximadamente 1.720 millones de parametros.

El modelo se entrena con Llama Factory en modo full fine-tuning (no LoRA), sobre 2 GPUs, con un learning rate muy bajo (2e-7) y una sola epoca sobre un conjunto de datos de tamano reducido (el nombre sugiere unos 1.000 ejemplos, "cs1k"). El resultado es un checkpoint de investigacion cuyo objetivo es reproducir y estudiar el efecto de la pista de razonamiento en tareas de codigo y matematicas, mas que un modelo listo para produccion.

Su relevancia es acotada: no tiene descargas ni likes, la model card es autogenerada y carece de documentacion sobre datos, evaluacion o limitaciones. Debe tratarse como un artefacto de investigacion reproducible, no como un modelo de proposito general validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta contexto nativo de 32.768 tokens, ampliable; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (compatible con cuantizacion estandar de transformers: fp16, bf16, int8, int4 via bitsandbytes/GGUF, no verificado) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repo | 3,5 GB |
| Framework de entrenamiento | Llama Factory (full fine-tuning) |
| Libreria de inferencia | transformers, text-generation-inference |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso con mecanismos de atencion estandar y soporte de modo thinking (razonamiento explicito antes de la respuesta). El ajuste se realiza en modo full fine-tuning, es decir, actualizando todos los pesos del modelo base, mediante Llama Factory.

Los hiperparametros declarados son: learning rate 2e-7, batch total de 16 (batch 4 x 2 GPUs x 2 pasos de acumulacion), scheduler coseno con warmup del 10 %, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-8), una sola epoca, seed 42 y entrenamiento distribuido en 2 dispositivos. El dataset de entrenamiento se denomina `dapo_r2ks42_dmmc_code_blueprint_hint_qwen31p7_thinking_correct_max4096_eval_correct_1017`, lo que sugiere trazas de razonamiento generadas con DAPO sobre Qwen3-1.7B, con pistas de codigo (blueprint hint), longitud maxima de 4096 y filtrado por correccion de evaluacion. No se documenta el numero de tokens ni la composicion exacta del dataset. El entrenamiento usa Transformers 4.57.0, PyTorch 2.8.0+cu128, Datasets 2.20.0 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline text-generation).
- Razonamiento en modo thinking, heredado del modelo base Qwen3 y reforzado por el dataset de trazas de razonamiento.
- Generacion de codigo, con enfasis en tareas guiadas por pistas (blueprint hints) segun el dataset de entrenamiento.
- Razonamiento matematico y resolucion de problemas paso a paso (capacidad del modelo base, no validada especificamente en este checkpoint).
- Soporte multilingue heredado de Qwen3 (no documentado para este ajuste).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada; el modelo base Qwen3 lo soporta, pero este ajuste no lo declara.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente.

## Casos de uso

- Investigacion sobre SFT y razonamiento: reproducir el efecto de un ajuste supervisado con pistas de codigo sobre un modelo pequeno, comparando con el Qwen3-1.7B original para medir la mejora en tareas de razonamiento.
- Generacion de codigo asistida por pistas: usar el modelo en escenarios donde se proporciona un esbozo o blueprint y el modelo completa la implementacion paso a paso, aprovechando el formato de entrenamiento.
- Experimentos de destilacion de trazas: emplear el checkpoint como referencia de como se comporta un modelo de 1.7B entrenado sobre trazas DAPO, para estudiar la calidad y coherencia de los razonamientos generados.
- Prototipado de asistentes de codigo en local: con 1.7B parametros, el modelo cabe en GPUs de consumo y permite prototipar pipelines de generacion de codigo sin infraestructura grande.
- Evaluacion comparativa de checkpoints: servir como punto de comparacion frente a otros ajustes de Qwen3-1.7B en pipelines de evaluacion interna.
- Docencia y formacion: ejemplo practico de full fine-tuning con Llama Factory sobre un dataset de razonamiento, util para talleres sobre entrenamiento de LLM.
- Generacion de explicaciones paso a paso: usar el modo thinking para producir razonamientos intermedios en tareas de matematicas o logica, siempre con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor contiene una entrada sin resultados (`results: []`), y la model card no incluye ninguna metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 5-6 GB.
- VRAM estimada en cuantizacion int8: aproximadamente 2 GB para pesos; en int4, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), vLLM, llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; a modo orientativo, un modelo denso de 1.7B en una RTX 4090 ofrece decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reasoning-sft_cbhint_cs1k (este modelo) | 1.720 M | no disponible | other | Hugging Face, 0 descargas | Ajuste SFT de investigacion sobre Qwen3-1.7B |
| Qwen/Qwen3-1.7B | 1.720 M | 32.768 tokens (nativo) | Apache 2.0 (segun modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, documentado y evaluado |
| Qwen3-0.6B | ~600 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa mas ligera de la misma familia |
| Llama 3.2 1B | ~1.200 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto mayor |

La comparativa con el modelo base es la mas relevante: este checkpoint hereda todas las capacidades de Qwen3-1.7B y anade el ajuste sobre trazas de razonamiento, pero carece de la documentacion y validacion del modelo oficial.

## Limitaciones y advertencias

- Model card autogenerada y sin documentacion: no hay informacion sobre composicion del dataset, evaluacion ni limitaciones declaradas por el autor.
- Riesgo elevado de sobreajuste: learning rate de 2e-7 con una sola epoca sobre un dataset de ~1.000 ejemplos sugiere un ajuste muy conservador, pero el efecto real no esta medido.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 1.7B, la tasa de alucinacion en tareas abiertas puede ser significativa.
- Idiomas no declarados: no se confirma el soporte multilingue de este checkpoint concreto.
- Licencia "other": no se especifican los terminos exactos; es imprescindible revisar las condiciones del modelo base (Qwen3-1.7B) antes de cualquier uso comercial.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el entrenamiento se realizo con longitud maxima de 4096, lo que puede degradar el rendimiento en contextos mas largos.
- No apto para produccion sin evaluacion previa: es un artefacto de investigacion, no un modelo validado para uso comercial o critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr2e-7_col4096_hf
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper DAPO (referencia del dataset): https://arxiv.org/abs/2503.14476
