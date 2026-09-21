# Stage-org/4b-diversity-HL-300-nyshot-27b-z-epoch3

## Resumen

Stage-org/4b-diversity-HL-300-nyshot-27b-z-epoch3 es un ajuste por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por la organizacion Stage-org. Se trata de un checkpoint de investigacion (epoch 3) generado con un pipeline interno denominado jh-workflow, cuyo objetivo declarado es el entrenamiento de un "learner" sobre una tarea nueva mediante RL con juez externo. No es un modelo de proposito general publicado con documentacion de producto: es el artefacto de salida de un experimento de entrenamiento concreto.

El repositorio contiene unicamente pesos en formato safetensors, con 4.539.265.536 parametros reales (aproximadamente 4,54 mil millones) y un tamano total de 9,1 GB, lo que corresponde a pesos en precision de 16 bits. La etiqueta qwen3_5 y la configuracion de entrenamiento confirman que parte del modelo Qwen3.5-4B, y el propio identificador del repositorio sugiere un entrenamiento con secuencias de hasta 300.000 tokens ("HL-300") y evaluacion mediante juez con multiples muestras ("nyshot").

Su relevancia ahora es limitada y de caracter experimental: el modelo acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no incluye model card mas alla de la procedencia del entrenamiento. Es util como referencia para quienes investigan pipelines de RL sobre modelos de 4B con recompensas generadas por un juez LLM, pero no presenta evidencia publica de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen/Qwen3.5-4B (etiqueta qwen3_5); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible como valor nativo. Configuracion de entrenamiento RL: seq_len = 300.000 tokens. Configuracion de inferencia vLLM: max_model_len = 65.536 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repositorio: 9,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5 mil millones de parametros, segun se deduce de la etiqueta qwen3_5 y del campo learner.model de la configuracion. No se dispone de informacion sobre numero de capas, dimension del modelo, tipo de atencion ni vocabulario. La atencion se ejecuta con flash_attention_2 durante el entrenamiento, y la inferencia declarada usa vLLM con language_model_only = true, reasoning_parser = "qwen3" y tool_call_parser = "qwen3_coder".

El entrenamiento es un RL a partir de un modelo ya existente, no un preentrenamiento. Los hiperparametros declarados son: metodo rl, 10.000 pasos de learner, 3 epocas, batch_size 128, longitud de secuencia 300.000, optimizador AdamW con lr = 1e-06, weight_decay = 0.0, max_norm = 1.0 y betas (0,9; 0,99). La funcion de perdida es de tipo "default" con parametros dppo_mask_low = 0.2, dppo_mask_high = 0.28, adv_tau = 1.0 y kl_tau = 0.001, lo que apunta a una variante de optimizacion por politica con enmascaramiento tipo DPPO/GRPO. El group_size es 8 y la generacion usa temperature 0.9, top_p 1.0, max_tokens 4096 y enable_thinking = true.

La senal de recompensa proviene de un juez externo (open_ended_judge) servido por un endpoint cuyo modelo declarado es gpt-5.6-luna, con temperature 1.0, top_p 1.0, max_tokens 4096, reasoning_effort "medium", max_retries 3 y max_in_flight 32. El bucle de entrenamiento usa semilla 7, dos GPUs por nodo (una de inferencia y una de entrenamiento), difusion de pesos por sistema de ficheros, hasta 256 rollouts en vuelo y un maximo de 8 pasos off-policy. Los checkpoints se guardan solo con pesos (weights_only = true) cada 1000 (unidad: epoch) conservando unicamente el ultimo.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-4B.
- Modo de razonamiento explicito: la configuracion de generacion usa enable_thinking = true y el parser de razonamiento declarado es "qwen3".
- Tool calling y function calling: la configuracion de inferencia declara tool_call_parser = "qwen3_coder", lo que implica soporte previsto para llamadas a herramientas en formato de codigo.
- Razonamiento multi-paso y cadenas de pensamiento: coherente con el modo thinking y con el entrenamiento RL sobre respuestas abiertas evaluadas por un juez.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles (la inferencia se declara explicitamente como language_model_only).
- Capacidad de ajuste a una "tarea nueva" definida por el pipeline de entrenamiento (campo dataset.type = "new_task"), cuyo contenido no se especifica.

## Casos de uso

- Investigacion en RL con recompensa de juez LLM: el modelo sirve como referencia reproducible de un pipeline que combina generacion con vLLM, evaluacion con un juez externo y optimizacion tipo DPPO/GRPO sobre una tarea abierta.
- Experimentos de contexto largo en entrenamiento: el campo seq_len = 300.000 permite estudiar como se comporta un modelo de 4B cuando se le entrena con secuencias muy largas, aunque la inferencia declarada se limita a 65.536 tokens.
- Evaluacion de estabilidad de checkpoints: al conservarse solo el ultimo checkpoint de la epoca 3, es util para analizar la deriva de politica respecto al modelo base Qwen3.5-4B.
- Prototipado de agentes con tool calling: la configuracion declara tool_call_parser = "qwen3_coder", de modo que puede integrarse en prototipos de agentes que emitan llamadas a funciones en formato de codigo, siempre que se valide el comportamiento real del checkpoint.
- Generacion de codigo asistida en entornos de desarrollo internos: con 4,54 mil millones de parametros cabe en GPUs de consumo y puede desplegarse tras vLLM para autocompletado o generacion de fragmentos en un IDE, sujeto a verificacion manual del resultado.
- Despliegue local para tareas de procesamiento de texto en lote: al ocupar 9,1 GB en safetensors, es viable ejecutarlo en una unica GPU de 24 GB para resumir, clasificar o reescribir documentos en flujos offline.
- Comparacion de tecnicas de RL sobre modelos pequenos: sirve como punto de partida para medir el impacto de kl_tau = 0.001 o del enmascaramiento dppo_mask_low/high frente a otros ajustes.
- Analisis forense de artefactos de investigacion: util para estudiar como se estructuran los repositorios de checkpoints parciales (solo pesos, sin tokenizer ni configuracion de generacion documentada) y que riesgos conlleva para su reutilizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor se limita a la procedencia del entrenamiento (comando, configuracion TOML y dataset), sin tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Pesos en precision de 16 bits: 9,1 GB en disco y en memoria, segun el tamano real del repositorio.
- VRAM estimada para inferencia en bf16/fp16: en torno a 10-12 GB para pesos mas cache KV con contextos moderados; el propio pipeline declara gpu_memory_utilization = 0.9 para una sola GPU de inferencia.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 5-6 GB (no se publican pesos cuantizados; requeriria cuantizar el usuario).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 3-4 GB (no se publican pesos cuantizados tipo GGUF, AWQ o GPTQ).
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB, e incluso en GPUs de 12-16 GB si se cuantiza. En contextos de 65.536 tokens la cache KV crece de forma notable y exige mas memoria.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son suficientes con holgura para una instancia.
- Opciones de despliegue: vLLM esta confirmado por la configuracion de entrenamiento (servidor en el puerto 7000, max_model_len 65536, gpu_memory_utilization 0.9, parsers de razonamiento y tool calling de Qwen). El soporte en llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada. La unica comparacion sostenible es contra el modelo del que deriva.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|
| Stage-org/4b-diversity-HL-300-nyshot-27b-z-epoch3 | 4.539.265.536 | Entrenamiento RL: 300.000; inferencia declarada: 65.536 | No disponible | safetensors | No publicados |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponibles |
| Alternativas de la misma categoria (Qwen3-4B, Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponibles |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede presumirse uso comercial permitido. Debe contactarse con el autor antes de cualquier despliegue en produccion.
- Model card minima: solo documenta la procedencia del entrenamiento. No hay informacion sobre tokenizer, plantilla de chat, configuracion de generacion recomendada ni datos de evaluacion.
- Ausencia de validacion externa: 0 descargas y 0 likes implican que no existe evidencia de terceros sobre su comportamiento real.
- Riesgo de alucinacion: es un modelo de 4,54B ajustado por RL sobre una tarea no especificada; no se han publicado tasas de error ni evaluaciones de fidelidad.
- Sesgo inducido por el juez: la recompensa proviene de un juez externo (gpt-5.6-luna) con reasoning_effort "medium". El modelo puede haber aprendido a satisfacer el estilo y los sesgos de ese juez, no la correccion factual.
- Deriva respecto al modelo base: al ser un ajuste por RL con kl_tau = 0.001 (coeficiente de KL muy bajo), el checkpoint puede haberse alejado del comportamiento original de Qwen3.5-4B, incluyendo perdida de capacidades generales.
- Desajuste de contexto: el entrenamiento se configura con seq_len = 300.000 pero la inferencia declarada limita max_model_len a 65.536. No hay garantia de que el modelo generalice a la ventana con la que fue entrenado.
- Checkpoint unico: se conserva solo el ultimo checkpoint de la epoca 3, sin posibilidad de comparar con estados intermedios.
- Idiomas no declarados: no puede asumirse un rendimiento multilingue sin evaluacion previa.
- Resultados de la busqueda web no relevantes: las consultas devolvieron portales de ofertas de practicas, sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-HL-300-nyshot-27b-z-epoch3
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-diversity-HL-300-nyshot-27b-z
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
