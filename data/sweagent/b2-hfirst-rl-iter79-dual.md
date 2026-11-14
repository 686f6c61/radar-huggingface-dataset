# sweagent/b2-hfirst-rl-iter79-dual

## Resumen

`sweagent/b2-hfirst-rl-iter79-dual` es un fine-tuning del modelo base Qwen3.5-35B-A3B-Base, publicado por el usuario `sweagent` en Hugging Face. Se trata de un checkpoint intermedio de un proceso de aprendizaje por refuerzo (RL), identificado por el sufijo `iter79` (iteracion 79) y `dual`, presumiblemente parte de una campana de entrenamiento orientada a tareas de agente de software (SWE, por las siglas del autor). El modelo conserva la arquitectura y el pipeline multimodal del original: es un modelo causal con codificador de vision, etiquetado como `image-text-to-text`.

El modelo base Qwen3.5-35B-A3B es un transformer hibrido con atencion lineal (Gated DeltaNet) y capas de atencion completa con RoPE, combinado con una capa de mezcla de expertos (MoE) dispersa de 256 expertos. Segun la model card del autor, el modelo tiene 35B parametros totales y 3B activos, con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. El checkpoint publicado ocupa 136,3 GB en safetensors, con 68.164.077.424 parametros registrados en el repositorio (cifra que incluye pesos en precision de entrenamiento y posiblemente el codificador de vision).

La relevancia de esta ficha es doble: por un lado, documenta un fine-tuning de RL sobre un modelo multimodal de ultima generacion; por otro, advierte de que se trata de un checkpoint de investigacion sin datos publicados de evaluacion, sin descargas ni likes, y con informacion muy limitada mas alla de la heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (atencion lineal) y Gated Attention, con capas MoE dispersas; incluye codificador de vision |
| Parametros totales | 35B (modelo base); 68.164.077.424 en pesos safetensors del repositorio |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base; no se detalla la cobertura efectiva tras el fine-tuning |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-35B-A3B: 40 capas organizadas en 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La dimension oculta es 2048, el embedding de tokens es de 248.320 entradas (con padding) y la salida del LM tiene el mismo tamano. Gated DeltaNet usa 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Gated Attention usa 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La capa MoE tiene 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido, con dimension intermedia de 512 por experto. El modelo se entreno con multi-token prediction (MTP) en varios pasos.

El proceso de entrenamiento del checkpoint publicado no esta documentado en la informacion disponible. El nombre `b2-hfirst-rl-iter79-dual` sugiere una fase de RL (posiblemente con preferencias o con recompensas verificables) sobre el modelo base, en su iteracion 79, con alguna variante "dual" no especificada. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como DPO, PPO o GRPO. La model card incluida en el repositorio es la del modelo base Qwen3.5-35B-A3B, no la del fine-tuning, por lo que las innovaciones tecnicas descritas (fusion temprana multimodal, RL a escala de millones de agentes, cobertura de 201 idiomas) corresponden al modelo original y no necesariamente al checkpoint derivado.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline `image-text-to-text` indica soporte de entradas de imagen y texto.
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base Qwen3.5-35B-A3B, segun su model card.
- Soporte de tool calling y function calling: no confirmado de forma explicita para este checkpoint; el modelo base esta disenado para integracion con herramientas en despliegues tipo Qwen3.5-Flash.
- Soporte de agentes y razonamiento multi-paso: el autor `sweagent` y el sufijo `rl` sugieren un entrenamiento orientado a tareas de agente, aunque no hay documentacion que lo confirme.
- Capacidades multilingues: el modelo base declara 201 idiomas y dialectos; la cobertura efectiva tras el fine-tuning no esta verificada.
- Capacidades especiales: modo thinking, vision o audio no confirmadas para este checkpoint concreto; el modelo base incluye codificador de vision.

## Casos de uso

- Investigacion en RL para agentes de software: el checkpoint permite reproducir o continuar experimentos de aprendizaje por refuerzo sobre tareas de reparacion de codigo, dado que el autor se identifica como `sweagent` y el nombre incluye `rl-iter79`.
- Evaluacion comparativa de checkpoints intermedios: util para estudiar como evoluciona el rendimiento a lo largo de las iteraciones de RL frente al modelo base Qwen3.5-35B-A3B.
- Generacion de codigo asistida: el modelo puede emplearse en pipelines de autocompletado o generacion de parches, aunque sin benchmarks publicados no hay garantia de calidad en produccion.
- Prototipado de asistentes multimodales: al conservar el pipeline `image-text-to-text`, permite experimentar con consultas sobre imagenes y texto en entornos de investigacion.
- Fine-tuning posterior y destilacion: sirve como punto de partida para experimentos de ajuste con datos propios, gracias a su licencia Apache 2.0 y formato safetensors compatible con transformers, vLLM y SGLang.
- Analisis de sesgos y robustez en modelos post-entrenados con RL: el checkpoint permite estudiar efectos secundarios del RL (por ejemplo, sobreajuste a recompensas o degradacion en tareas fuera de distribucion).
- Despliegue interno de bajo coste por token: con solo 3B parametros activos, la inferencia es mas barata que la de un modelo denso de 35B, lo que facilita pruebas en infraestructura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card del modelo base incluye resultados de Qwen3.5-35B-A3B en MMLU-Pro (86,1), pero no se puede asumir que el fine-tuning los conserve ni que los mejore.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos, mas memoria para el codificador de vision y el KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 35-40 GB; en 4 bits, alrededor de 18-22 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para contexto largo; en consumer, RTX 4090 (24 GB) solo con cuantizacion agresiva y contexto reducido, o configuraciones multi-GPU.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card del modelo base; llama.cpp y Ollama no estan confirmados para esta arquitectura hibrida.
- Latencia y throughput: no disponibles. El modelo base declara inferencia de alto rendimiento gracias a la arquitectura hibrida y a la activacion de solo 3B parametros, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `sweagent/b2-hfirst-rl-iter79-dual` | 35B / 3B (base); 68,2B en safetensors | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Checkpoint de investigacion, 0 descargas |
| Qwen3.5-35B-A3B (base) | 35B / 3B | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Modelo oficial con benchmarks publicados |
| Qwen3.5-27B | 27B (denso, segun la model card) | no disponible | Apache 2.0 (presumible) | Modelo oficial |
| Qwen3-235B-A22B | 235B / 22B | no disponible | Apache 2.0 (presumible) | Generacion anterior |

No se dispone de datos de rendimiento del checkpoint fine-tuneado, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, descargas ni likes; no se puede recomendar para produccion sin una evaluacion propia.
- Model card no especifica del fine-tuning: el README corresponde al modelo base, por lo que no se documentan los datos, hiperparametros ni objetivos del RL aplicado.
- Riesgo de sobreajuste al reward: al ser un checkpoint de RL en iteracion 79, puede haber degradado capacidades generales o desarrollado comportamientos colusivos con la funcion de recompensa.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos especificos para este checkpoint.
- Sesgos: no documentados para el fine-tuning; el modelo base declara cobertura de 201 idiomas, pero la calidad por idioma no esta verificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base Qwen3.5-35B-A3B.
- Compatibilidad: la arquitectura hibrida con Gated DeltaNet puede no estar soportada por todas las herramientas de inferencia; verificar vLLM, SGLang y KTransformers antes de desplegar.
- Contexto largo: aunque se declaran hasta 1.010.000 tokens, el rendimiento real mas alla de 262.144 tokens no esta verificado para este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sweagent/b2-hfirst-rl-iter79-dual
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio (servicio gestionado): https://modelstudio.alibabacloud.com/
- Guia de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
