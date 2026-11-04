# wkhaifor/Qwen3.5-2B-GPTQ-W4A16-G128-LLMCompressor

## Resumen
Qwen3.5-2B-GPTQ-W4A16-G128-LLMCompressor es una cuantizacion GPTQ del modelo base Qwen/Qwen3.5-2B, publicada por el usuario wkhaifor. Se trata de una compresion de pesos a INT4 con activaciones en FP16 (esquema W4A16), generada con llm-compressor 0.14.0 y almacenada en el formato compressed-tensors 0.19.0. El modelo conserva la licencia Apache-2.0 del modelo base y esta pensado para inferencia en vLLM con soporte de compressed-tensors.

El modelo base Qwen3.5-2B es un modelo multimodal de la familia Qwen 3.5, con 2.213.241.664 parametros totales (aproximadamente 2,2 mil millones). La cuantizacion reduce el peso del repositorio a unos 3,1 GB, lo que facilita su despliegue en GPUs de consumo. La model card indica que la tarea declarada es image-text-to-text, aunque la validacion publicada se centra en inferencia de texto.

La relevancia de esta ficha radica en que documenta una receta de cuantizacion reproducible (GPTQ, grupo de 128, actorder estatico, calibracion con GSM8K) y ofrece datos de validacion comparativos frente al modelo en FP16 en una RTX 4090 D, lo que permite evaluar la perdida de calidad y el coste en throughput antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de inferencia usa max_model_len=4096 |
| Tipos de cuantizacion | GPTQ W4A16, INT4 con grupo de 128, simetrica, actorder estatico, activaciones FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors 0.19.0 |

## Arquitectura y entrenamiento
El modelo es una cuantizacion post-entrenamiento (PTQ) del base Qwen3.5-2B, no un modelo entrenado desde cero. La receta aplica GPTQ sobre 96 capas lineales del bloque de lenguaje, cuantizando los pesos a INT4 con tamano de grupo 128, cuantizacion simetrica y actorder estatico, manteniendo las activaciones en FP16. Las capas `visual`, `linear_attn`, `lm_head` y el resto de capas no objetivo se conservan en precision flotante, y la KV cache queda con la configuracion por defecto del motor de inferencia.

La calibracion se realizo con 256 preguntas del conjunto de entrenamiento de GSM8K, semilla 42 y longitud maxima de secuencia de 512 tokens. La herramienta empleada fue llm-compressor 0.14.0 y el formato de salida compressed-tensors 0.19.0. La model card indica que el commit upstream utilizado no quedo registrado, lo que limita la trazabilidad exacta de la receta. No se dispone de informacion sobre la composicion del dataset de entrenamiento original del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Generacion de texto conversacional y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Razonamiento aritmetico basico y resolucion de problemas tipo GSM8K, segun la validacion publicada.
- Capacidad multimodal declarada por la tarea image-text-to-text del modelo base; la model card solo valida inferencia de texto y el ejemplo de vLLM desactiva imagenes y video (`limit_mm_per_prompt={"image": 0, "video": 0}`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card esta redactada en chino pero no documenta idiomas soportados.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue de un asistente conversacional ligero en una unica GPU de consumo: con unos 3,1 GB de pesos en INT4, el modelo cabe holgadamente en GPUs de 12-16 GB y permite servir conversaciones multi-turno con plantilla de chat.
- Razonamiento aritmetico en entornos con recursos limitados: la validacion en GSM8K (71,0 % de precision, identica al FP16) lo hace adecuado para tareas de resolucion de problemas matematicos basicos donde no se dispone de GPUs de datacenter.
- Prototipado rapido de pipelines de generacion de texto con vLLM: el formato compressed-tensors permite cargar el modelo directamente en vLLM 0.32.0 con kernel Marlin W4A16, sin pasos de conversion adicionales.
- Evaluacion de recetas de cuantizacion: sirve como referencia reproducible (comando `run.py quantize --tool llmcompressor --method gptq --stage full --samples 256 --max-seq-length 512`) para comparar el impacto de GPTQ W4A16 frente al modelo en FP16.
- Inferencia de bajo throughput en estaciones de trabajo: con 50,4 tokens/s en generacion serial sobre RTX 4090 D, es viable para tareas batch o interactivas de baja concurrencia.
- Experimentacion multimodal exploratoria: aunque la model card no valida vision, la tarea image-text-to-text del base permite probar entradas imagen-texto si se habilita `limit_mm_per_prompt` en vLLM, siempre con validacion propia.

## Benchmarks y rendimiento
La model card publica una validacion sobre las primeras 100 preguntas del test de GSM8K, generacion greedy, maximo 1024 tokens nuevos por pregunta y ejecucion secuencial de una sola peticion en una RTX 4090 D con vLLM 0.32.0 (kernel Marlin W4A16).

| Metrica | FP16 (control) | Modelo cuantizado |
|---|---:|---:|
| Precision en GSM8K (100 preguntas) | 71,0 % | 71,0 % |
| Tasa de respuesta final parseable | 92,0 % | 94,0 % |
| Tasa de alcance del limite de generacion | 7,0 % | 6,0 % |
| Throughput en generacion serial (tokens/s) | 55,823 | 50,380 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible. Los datos anteriores corresponden exclusivamente a la validacion del autor y a un subconjunto de 100 preguntas, por lo que deben interpretarse con cautela.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3,1 GB solo de pesos en INT4; con overhead de activaciones, KV cache y runtime de vLLM, el ejemplo oficial reserva `gpu_memory_utilization=0.75` sobre una RTX 4090 D (24 GB), aunque el modelo cabe en GPUs de 8-12 GB en configuraciones ajustadas.
- GPU recomendadas: RTX 4090 / 4090 D (validada por el autor), A100, H100 para mayor concurrencia; tambien viable en RTX 3090, RTX 4080 y GPUs de 12 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o superiores, dependiendo de la longitud de contexto y del numero de secuencias simultaneas.
- Opciones de despliegue: vLLM 0.32.0 con soporte de compressed-tensors (unica via documentada y validada); no se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50,380 tokens/s en generacion serial con `max_num_seqs=1`, `enforce_eager=True` y `enable_prefix_caching=False` en RTX 4090 D; el FP16 alcanza 55,823 tokens/s en las mismas condiciones, lo que supone una reduccion de throughput de aproximadamente el 9,8 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-GPTQ-W4A16-G128 (este) | 2,21 mil millones | no disponible | GPTQ W4A16 INT4, grupo 128 | Apache-2.0 | HuggingFace y ModelScope |
| Qwen/Qwen3.5-2B (base) | 2,21 mil millones | no disponible | FP16/BF16 | Apache-2.0 | HuggingFace |
| Alternativas de ~2B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otras familias, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias
- La validacion se limita a 100 preguntas de GSM8K; no hay evidencia publicada sobre MMLU, HumanEval, tareas multimodales ni otros dominios.
- La cuantizacion INT4 puede degradar tareas distintas de la aritmetica evaluada; el autor solo demuestra paridad en GSM8K, no en el resto de capacidades.
- El commit upstream del modelo base no quedo registrado, lo que dificulta la reproducibilidad exacta de la receta.
- La model card no documenta sesgos conocidos, idiomas soportados ni riesgos de alucinacion especificos.
- La capacidad multimodal (image-text-to-text) esta declarada pero no validada en la model card; el ejemplo oficial desactiva imagenes y video.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La unica via de despliegue documentada es vLLM 0.32.0 con compressed-tensors; no se garantiza compatibilidad con otros motores.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y citar adecuadamente la autoria original de Qwen.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/wkhaifor/Qwen3.5-2B-GPTQ-W4A16-G128-LLMCompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio espejo en ModelScope: https://www.modelscope.cn/models/kfcVme50/Qwen3.5-2B-GPTQ-W4A16-G128-LLMCompressor
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Herramienta de cuantizacion llm-compressor: no disponible en la informacion proporcionada
- Formato compressed-tensors: no disponible en la informacion proporcionada
