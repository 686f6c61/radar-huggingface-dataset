# SynthCode-Project/OLMo2-7B-all-milestones

## Resumen

SynthCode-Project/OLMo2-7B-all-milestones es una coleccion de 66 checkpoints de ajuste continuado (continued pretraining) derivados del modelo base allenai/OLMo-2-1124-7B, desarrollada por el proyecto SynthCode para un envio a ICLR 2027. El objetivo es estudiar como distintas estrategias de sintesis de datos de edicion de codigo afectan al rendimiento del modelo. Cada checkpoint corresponde a un brazo experimental (una estrategia concreta) en uno de tres hitos de entrenamiento (250M, 500M y 1000M de tokens).

El modelo es un transformer decoder-only de 7B parametros con la arquitectura y tokenizador de OLMo 2, entrenado con LLaMA-Factory sobre secuencias empaquetadas de 8192 tokens, learning rate 2e-5 y un schedule warmup-stable-decay. Los brazos se dividen en 11 estrategias (raw, clean, notebook, blog, old+CM, old+terseCM, plan+old, plan+CM+old, plan, old+review, old+formatCM) y dos variantes: weak (con 9,8% de tokens de instruction-replay) y strong (con un 6,5% adicional de instrucciones de edicion).

Es relevante porque publica de forma abierta todo el arbol de ablaciones (22 brazos x 3 hitos) con logs de entrenamiento, lo que permite reproducir y comparar el efecto de cada estrategia de datos sinteticos sobre un modelo base completamente abierto. No obstante, se trata de un artefacto de investigacion, no de un modelo listo para produccion: la model card no documenta evaluaciones de rendimiento ni condiciones de licencia propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2) |
| Parametros totales | 7B (heredados de allenai/OLMo-2-1124-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud de secuencia de entrenamiento empaquetada); contexto nativo del base no documentado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Cada checkpoint parte de allenai/OLMo-2-1124-7B y se somete a continued pretraining con LLaMA-Factory sobre una estrategia concreta de datos sinteticos de edicion de codigo (SynthCode round-5). El entrenamiento usa secuencias empaquetadas de 8192 tokens, learning rate 2e-5 y un total de 10.176 pasos, equivalentes a 1000M de tokens por brazo. El schedule es warmup-stable-decay: en cada hito (250M, 500M y 1000M de tokens) se ramifica una copia y se le aplica un anneal sobre el 10% siguiente de tokens con un ratio minimo de learning rate de 0,005; esa rama anelada es la que se publica.

Los 22 brazos combinan 11 estrategias de construccion de datos (codigo crudo, limpieza, notebooks, posts de blog, distintas combinaciones de codigo antiguo, comentarios, planes y revisiones) con dos niveles de mezcla: los brazos weak incorporan un 9,8% de tokens de instruction-replay (evol-codealpaca y Magicoder-OSS) y los brazos strong (`__edit`) anaden un 6,5% de tokens de instrucciones de edicion. El formato de prompt usado tanto en instrucciones como en evaluacion es `<|user|>\n{prompt}\n<|assistant|>\n`. Cada carpeta conserva los logs del entrenador (`trainer_log.jsonl`, `trainer_state.json`, `training_loss.png`).

## Capacidades

- Generacion de texto y codigo sobre la base de OLMo 2, con especializacion inducida hacia tareas de edicion de codigo.
- Edicion de codigo guiada por instrucciones en los brazos strong (`__edit`), que incorporan instrucciones de edicion en la mezcla.
- Razonamiento multi-paso sobre codigo en las estrategias basadas en planes (plan+old, plan+CM+old, plan).
- Comprension de codigo con comentarios y revisiones en las estrategias old+CM, old+review y old+formatCM.
- Seguimiento del formato de chat `<|user|>` / `<|assistant|>`.
- Capacidades del modelo base OLMo 2 (generacion general, matematicas basicas) presumiblemente conservadas, aunque no se documentan evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso

- Investigacion sobre sintesis de datos: comparar los 66 checkpoints para medir el efecto de cada estrategia de datos sinteticos sobre la perdida y el comportamiento del modelo, usando los logs incluidos en cada carpeta.
- Edicion de codigo asistida: desplegar un checkpoint strong (`__edit`) del hito 1000M como modelo de edicion de fragmentos de codigo a partir de instrucciones en lenguaje natural.
- Reproduccion de ablaciones: reentrenar o extender brazos concretos partiendo de los hitos intermedios (250M, 500M) para estudiar schedules de decay alternativos.
- Generacion de parches en pipelines internos: integrar un checkpoint anelado en un flujo de propuesta de cambios sobre repositorios, con validacion posterior por tests.
- Estudio de mezclas de instruction-replay: usar los brazos weak frente a strong para cuantificar el impacto del 9,8% de replay y del 6,5% de instrucciones de edicion.
- Base para fine-tuning posterior: emplear cualquiera de los checkpoints como punto de partida de un SFT especifico, dado que el formato de prompt ya esta fijado.
- Analisis de formato de datos: evaluar como afectan los formatos de comentarios (CM, terseCM, formatCM) a la calidad del codigo generado en tareas de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB de pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (carga por subcarpeta con `AutoModelForCausalLM.from_pretrained`), vLLM o TGI para servir; llama.cpp/Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynthCode-Project/OLMo2-7B-all-milestones | 7B | 8192 (entrenamiento) | Edicion de codigo (ablaciones) | no disponible | Hugging Face, 66 subcarpetas |
| allenai/OLMo-2-1124-7B | 7B | no disponible en esta ficha | Base general | licencia abierta de OLMo (consultar) | Hugging Face |
| Modelos de codigo de ~7B de la familia Qwen o DeepSeek | ~7B | no disponible en esta ficha | Codigo | variable | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible porque el autor no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora frente al modelo base en ninguna tarea.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que remitirse a la licencia del modelo base OLMo 2 y contactar con el autor.
- Artefacto de investigacion: 66 checkpoints sin pipeline definido ni version recomendada; el usuario debe elegir brazo e hito.
- Riesgo de alucinacion y sesgos heredados del modelo base y de los datos sinteticos, no evaluados por el autor.
- Idiomas soportados no documentados; la mezcla de datos parece centrada en codigo en ingles.
- Contexto de entrenamiento limitado a 8192 tokens; no se documenta extension de contexto.
- Formato de prompt obligatorio (`<|user|>` / `<|assistant|>`); un uso fuera de ese formato puede degradar la calidad.
- Fechas de creacion en el repositorio (2026) y referencia a ICLR 2027: verificar la vigencia y el estado del envio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SynthCode-Project/OLMo2-7B-all-milestones
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- LLaMA-Factory (framework de entrenamiento citado): https://github.com/hiyouga/LLaMA-Factory
- Paper de OLMo 2: no disponible en la informacion proporcionada
- Repositorio del proyecto SynthCode: no disponible en la informacion proporcionada
- Demo: no disponible
