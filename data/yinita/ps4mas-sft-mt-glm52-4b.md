# yinita/ps4mas-sft-mt-glm52-4b

## Resumen

ps4mas-sft-mt-glm52-4b es un adaptador LoRA de afinamiento supervisado (SFT) desarrollado por el usuario yinita, construido sobre el modelo base Qwen/Qwen3.5-4B. El adaptador se entrena con el metodo PS4MAS (masked SFT) sobre datos multitrack derivados de GLM52, concretamente las particiones `sft2_acquire` y `sft3_final_balanced`, con una máscara estricta de pérdida sobre los mensajes (`message_loss_mask`). El objetivo es ajustar el comportamiento del modelo base para tareas de diálogo multiturno en chino, aprovechando datos de alta calidad filtrados y balanceados.

La relevancia de este adaptador radica en su enfoque metodologico: el uso de máscaras de pérdida a nivel de mensaje permite que el modelo optimice únicamente sobre las respuestas del asistente, ignorando los turnos del usuario durante el entrenamiento. Esto reduce el ruido y mejora la calidad del afinamiento en escenarios de conversación multiturno. El adaptador es ligero (0.1 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en proyectos comerciales y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen3.5-4B) |
| Parametros totales | 4 000 millones (modelo base) + ~16 millones (adaptador LoRA) |
| Parametros activos | 4 000 millones (modelo base) + adaptador LoRA |
| Longitud de contexto | 4096 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | No especificados (depende del despliegue del modelo base) |
| Idiomas soportados | Chino (datos de entrenamiento GLM52), otros idiomas del modelo base no verificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Qwen/Qwen3.5-4B, un modelo de lenguaje de 4 000 millones de parametros. El entrenamiento utiliza LoRA con rango r=16 y alpha=32, aplicado sobre las capas atencionales y de proyeccion del modelo base. El dataset de entrenamiento consta de 6 083 filas de datos multitrack GLM52, divididos en dos particiones: `sft2_acquire` y `sft3_final_balanced`. El metodo PS4MAS aplica una máscara de pérdida estricta sobre los mensajes, de modo que la funcion de pérdida solo se calcula sobre los turnos del asistente, ignorando los turnos del usuario. Esto evita que el modelo aprenda a predecir el texto del usuario y se centra exclusivamente en generar respuestas adecuadas.

El entrenamiento se realizo durante 3 epocas con una tasa de aprendizaje de 1e-4 y una longitud de secuencia de 4 096 tokens. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. El adaptador se distribuye en formato PEFT, lo que permite cargarlo directamente sobre el modelo base mediante la libreria `peft` de HuggingFace.

## Capacidades

- Generacion de texto en chino para dialogos multiturno, optimizada mediante mascara de perdida sobre mensajes del asistente.
- Afinamiento especifico sobre datos GLM52, lo que mejora la coherencia y relevancia de las respuestas en contextos conversacionales.
- Soporte de tool calling y function calling heredado del modelo base Qwen3.5-4B, si el modelo base lo implementa.
- Capacidades de razonamiento y generacion de codigo heredadas del modelo base, aunque no verificadas en este adaptador.
- Integracion sencilla mediante la API de PEFT, permitiendo cargar el adaptador sobre el modelo base en pocas lineas de codigo.
- No se especifican capacidades multimodales (vision, audio) ni modos de pensamiento extendido.

## Casos de uso

- Atencion al cliente automatizada en chino: el adaptador puede gestionar conversaciones de soporte multiturno, aprovechando la mascara de perdida para generar respuestas coherentes y contextualizadas. Su tamano reducido permite desplegarlo en entornos con recursos limitados.
- Sistemas de recomendacion conversacional: integrado en un pipeline de chatbot, puede mantener el hilo de la conversacion y ofrecer recomendaciones personalizadas basadas en el historial de la interaccion.
- Asistentes virtuales para plataformas de comercio electronico: el modelo puede responder preguntas frecuentes, gestionar quejas y guiar al usuario a traves de procesos de compra, gracias a su entrenamiento en dialogos multiturno.
- Generacion de respuestas en foros y comunidades online: el adaptador puede utilizarse para autocompletar o sugerir respuestas en plataformas como Zhihu, mejorando la calidad de las contribuciones de los usuarios.
- Fine-tuning adicional para tareas especificas: al ser un adaptador LoRA ligero, puede servir como punto de partida para afinamientos posteriores con datasets propios, reduciendo el coste computacional respecto a entrenar desde cero.
- Evaluacion de tecnicas de masked SFT: investigadores pueden utilizar este adaptador como referencia para comparar el rendimiento de PS4MAS frente a otros metodos de afinamiento en tareas de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se indican resultados de evaluacion en tareas de dialogo o generacion de texto en chino.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 4 000 millones de parametros, se requiere la VRAM del modelo base mas el adaptador. En FP16, el modelo base ocupa aproximadamente 8 GB, por lo que se recomienda al menos 10 GB de VRAM para inferencia con el adaptador cargado.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 10 GB de VRAM. En cuantizacion INT8 o INT4, el modelo base puede caber en GPUs con 6-8 GB de VRAM, como la RTX 3060 o RTX 4060.
- Consumer GPU: si, es viable en GPUs de consumo como la RTX 3090 o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI o mediante la API de PEFT con Transformers. El adaptador puede fusionarse con el modelo base para su despliegue como un unico modelo.
- Latencia y throughput: no se han publicado estimaciones. En una RTX 4090, un modelo de 4B en FP16 suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de la secuencia y el batch size.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables que utilicen el metodo PS4MAS sobre Qwen3.5-4B. Como referencia, se puede comparar el modelo base Qwen3.5-4B con otras alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B | 4B | 4096+ | Apache 2.0 | HuggingFace |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | HuggingFace |
| Gemma 2 2B | 2B | 8k | Gemma License | HuggingFace |
| Phi-3.5-mini | 3.8B | 128k | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas de dialogo en chino.

## Limitaciones y advertencias

- El adaptador se entrena exclusivamente con datos en chino, por lo que su rendimiento en otros idiomas puede ser limitado o degradado respecto al modelo base.
- El dataset de entrenamiento es reducido (6 083 filas), lo que puede provocar sobreajuste a los patrones especificos de los datos GLM52 y limitar la generalizacion a otros dominios.
- No se han realizado evaluaciones de sesgos, toxicidad o seguridad sobre el adaptador. El modelo base puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos donde no dispone de informacion suficiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener restricciones adicionales que deben verificarse en su documentacion oficial.
- No se proporcionan garantias de rendimiento en produccion. Se recomienda realizar una evaluacion exhaustiva en el dominio de aplicacion antes de desplegarlo.
- El adaptador no incluye el modelo base completo; es necesario descargar Qwen/Qwen3.5-4B por separado, lo que incrementa los requisitos de almacenamiento y transferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinita/ps4mas-sft-mt-glm52-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria PEFT: https://github.com/huggingface/peft
