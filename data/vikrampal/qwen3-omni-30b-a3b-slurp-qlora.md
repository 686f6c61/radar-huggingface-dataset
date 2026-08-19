# VikramPal/Qwen3-Omni-30B-A3B-SLURP-QLoRA

## Resumen

El repositorio `VikramPal/Qwen3-Omni-30B-A3B-SLURP-QLoRA` contiene un adaptador QLoRA de 107 MiB entrenado sobre el componente **Thinker** del modelo multimodal `Qwen/Qwen3-Omni-30B-A3B-Instruct`, con el objetivo de mejorar la clasificación de intenciones en habla (spoken language understanding) sobre el dataset SLURP. El adaptador se publica como artefacto independiente, pero el autor recomienda usar directamente los checkpoints fusionados (bf16 o cuantizados) si el objetivo es ejecutar el modelo sin reconstruirlo.

El modelo base, Qwen3-Omni-30B-A3B, es un modelo omni de extremo a extremo desarrollado por Alibaba (Qwen), con arquitectura MoE de 30 mil millones de parámetros totales y 3 mil millones activos, capaz de procesar texto, audio, imagen y vídeo. Este adaptador, sin embargo, solo modifica el Thinker (que gestiona el razonamiento y la generación de texto) y elimina por completo el Talker y el stack code2wav, por lo que el resultado acepta entradas multimodales pero **solo genera texto**, sin síntesis de voz. La relevancia actual reside en que demuestra una mejora estadísticamente significativa en SLURP (+7,40 puntos de accuracy) con un coste de descarga mínimo, aunque el coste de memoria del modelo base subyacente es considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen3-Omni-30B-A3B-Instruct (Thinker) |
| Parametros totales | 35 259 818 545 (modelo completo base); adaptador 112 207 855 bytes (~107 MiB) |
| Parametros activos | 3 000 000 000 aprox. (Thinker activo, MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en el repo) |
| Tipos de cuantizacion | NF4 (para uso con bitsandbytes), bf16 (base), DynQuant 4-bit y 3-bit en repos hermanos |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (según tags; el README indica "other" con license_name apache-2.0) |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena exclusivamente sobre el **Thinker** del modelo base Qwen3-Omni-30B-A3B-Instruct. El Thinker es la parte del modelo que procesa las entradas multimodales (audio, imagen, vídeo, texto) y genera el texto de salida; el Talker y el stack code2wav, responsables de la síntesis de voz, se anularon antes del entrenamiento y no forman parte de ningún artefacto publicado. El adaptador usa QLoRA (cuantización NF4 con doble cuantización y `llm_int8_skip_modules=["lm_head"]`) y se entrena sobre el dataset SLURP (`marcel-gohsen/slurp`) para clasificación de intenciones habladas. El entrenamiento se realizó con transformers 5.15.0, torch 2.11+cu128 y peft 0.20.0. El adaptador solo modifica módulos internos del Thinker; los 96 bancos de expertos MoE (28 991 029 248 parámetros, el 91,4 % del Thinker) permanecen sin cambios en el base, y la fusión del adaptador con los pesos base produce una mejora de accuracy de 79,40 % a 86,80 % en 500 elementos de prueba de SLURP (McNemar, p = 7,51e-07).

## Capacidades

- Clasificación de intenciones habladas (SLURP): el adaptador mejora la precisión del modelo base en esta tarea concreta.
- Entrada multimodal: al heredar el Thinker del base, acepta audio, imagen, vídeo y texto como entrada.
- Salida exclusivamente textual: no hay síntesis de voz; el Talker y code2wav están excluidos.
- Razonamiento y generación de texto: el Thinker mantiene las capacidades de razonamiento y generación del modelo base (aunque no se han evaluado en este adaptador).
- Sin tool calling ni funciones de agente específicas documentadas en el adaptador (dependen del modelo base, no se han verificado aquí).

## Casos de uso

- Asistentes de voz con comprensión de intenciones: el adaptador puede integrarse en un pipeline que transcriba audio y clasifique la intención del usuario (p. ej., reservar, preguntar, cancelar) con mayor precisión que el modelo base, gracias a la ganancia de +7,40 puntos en SLURP.
- Sistemas de atención al cliente automatizada: dado que el Thinker acepta audio directamente, se puede construir un sistema que reciba llamadas y clasifique la intención del cliente en tiempo real, sin necesidad de un ASR separado.
- Análisis de interacciones grabadas: procesar grabaciones de centros de contacto para extraer la intención de cada turno, con aplicación en minería de procesos y mejora de guiones.
- Investigación en SLU: el adaptador sirve como punto de partida para experimentos de fine-tuning eficiente (QLoRA) sobre modelos omni, permitiendo comparar estrategias de adaptación con bajo coste de descarga.
- Reconstrucción de checkpoints: el adaptador es el artefacto mínimo para regenerar los checkpoints fusionados (bf16, 4-bit, 3-bit) publicados en repos hermanos, útil para reproducibilidad.
- Despliegue en entornos con memoria limitada: si se usa sobre una base NF4, el adaptador añade solo 107 MiB, permitiendo servir el modelo con menor huella que el checkpoint bf16, aunque el rendimiento en esa configuración no está medido.

## Benchmarks y rendimiento

Se evaluó el adaptador fusionado con el Thinker base sobre 500 elementos de prueba de SLURP (subset held-out). Los resultados son los siguientes:

| Configuracion | Accuracy (%) | Notas |
|---|---|---|
| Base sin adaptador | 79,40 | Referencia |
| Adaptador QLoRA + base bf16 | 86,80 | Ganancia +7,40 (McNemar p = 7,51e-07) |
| Checkpoint DynQuant 4-bit | 86,20 | Estadísticamente equivalente al bf16 |
| Checkpoint DynQuant 3-bit | no disponible | Se menciona su existencia, pero no se reporta accuracy |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) para este adaptador concreto.

## Requisitos de hardware

- Adaptador sobre base bf16: ~70 GB de VRAM pico (59,08 GiB del Thinker + ~11 GiB del Talker/code2wav durante la carga, antes de liberarlos). Requiere una GPU de 80 GB (p. ej., A100/H100) o `device_map="auto"` en dos GPUs.
- Adaptador sobre base NF4: memoria mucho menor, pero no medida; requiere bitsandbytes y configuración específica (`load_in_4bit`, `bnb_4bit_quant_type="nf4"`, `bnb_4bit_use_double_quant=True`).
- Fusión del adaptador a bf16: se recomienda hacerla en CPU con ~70 GB de RAM (48,1 s); en GPU `save_pretrained` produce OOM.
- Checkpoint DynQuant 4-bit (14,77 GiB): cabe en una GPU de 24 GB (15,89 GB residentes medidos, batch 1).
- Checkpoint DynQuant 3-bit (11,08 GiB): 11,93 GB residentes, cabe en 24 GB, pero su precisión no se reporta.
- Opciones de despliegue: transformers >= 5.0 (5.15.0 verificado), peft, accelerate, bitsandbytes para NF4, dynquant para los checkpoints cuantizados. No se mencionan vLLM, llama.cpp ni Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SLURP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales, 3B activos | no disponible | 79,40 % | Apache 2.0 | HuggingFace |
| Este adaptador QLoRA (sobre base) | 30B totales + 107 MiB | no disponible | 86,80 % | Apache 2.0 | HuggingFace |
| Checkpoint DynQuant 4-bit (repo hermano) | 30B totales | no disponible | 86,20 % | Apache 2.0 | HuggingFace |

No se dispone de comparación con otros modelos de SLU (p. ej., Whisper + clasificador, o modelos específicos de intent) porque el repo no proporciona esos datos.

## Limitaciones y advertencias

- El adaptador solo afecta al Thinker; el Talker y code2wav están anulados, por lo que **no hay salida de voz** (no es speech-to-speech).
- La salida es exclusivamente texto; cualquier uso que requiera síntesis de voz debe combinarse con un TTS externo.
- El `adapter_config.json` publicado contiene un defecto: `base_model_name_or_path` está vacío (`""`) y `task_type` es `null`. El autor lo documenta, pero el segundo defecto persiste en el archivo descargable, lo que puede causar problemas al cargar el adaptador con ciertas versiones de peft.
- Para cargar el adaptador sobre el modelo base, se requiere usar la clase `Qwen3OmniMoeForConditionalGeneration` (no `AutoModelForCausalLM` ni `AutoModel`), y tomar el submódulo `.thinker`. Esto exige transformers >= 5.0.
- El rendimiento se ha medido solo en SLURP (500 elementos); no hay evidencia de que la mejora se generalice a otras tareas de SLU o a otros dominios.
- El uso sobre base NF4 no está evaluado; el autor advierte que esa configuración no se ha medido.
- La licencia es Apache 2.0, pero el dataset SLURP tiene sus propios términos; verificar la licencia del dataset antes de usar el modelo en producción.
- El modelo base tiene un contexto largo (no especificado aquí), pero el adaptador no modifica esa característica; el contexto efectivo depende del base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-SLURP-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repo hermano bf16: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16
- Repo hermano DynQuant 4-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit
- Repo hermano DynQuant 3-bit: https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-3bit (referenciado en el README, no verificado en la búsqueda)
- GitHub de Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni
- Informe técnico (arXiv): https://arxiv.org/abs/2509.17765
- Dataset SLURP: https://huggingface.co/datasets/marcel-gohsen/slurp
