# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1200

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1200 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y corresponde al paso 1200 de optimizador (iteracion Megatron 1199) de un entrenamiento que sigue en curso: es una instantanea, no un modelo final. El modelo conserva la arquitectura multimodal del base (torre de vision y cabeza MTP intactas) y solo ha sido entrenado el modelo de lenguaje.

El problema que aborda es la alineacion de seguridad en escenarios de texto, codigo y uso de herramientas (tool calling). Para ello emplea GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B, sobre un conjunto de prompts denominado "mixture-8" que combina datos de seguridad, jailbreaks benignos, codigo y trayectorias agénticas con herramientas sinteticas. El entrenamiento se ejecuto con Slime (rollouts SGLang colocados) y Megatron-LM en bf16 sobre una NVIDIA B200.

Es relevante ahora porque documenta de forma transparente una receta de RL de seguridad sobre un modelo de 4B con modo thinking y function calling, incluyendo las curvas de recompensa por dataset durante el entrenamiento. Con 4.659.865.088 parametros y licencia Apache 2.0, resulta util como referencia de investigacion reciente, aunque su caracter de checkpoint intermedio limita su uso directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP heredadas del base; solo se entreno el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto de muestreo); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de vision y cabeza MTP (multi-token prediction). En este checkpoint solo se actualizaron los pesos del modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos originales sin tocar, de modo que el checkpoint se carga exactamente igual que el modelo base mediante `Qwen3_5ForConditionalGeneration`. La exportacion desde Megatron torch_dist (`iter_0001199`) re-fusiono las proyecciones GDN, aplico el mapeo de nombres de Slime para Qwen3.5, copio los pesos de vision y MTP del base y ajusto los dtypes al indice original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0.2 y TIS activado. Por cada actualizacion se muestrean 15 prompts con 8 rollouts cada uno (120 secuencias). Hiperparametros: learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y una perdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se emplea la plantilla de chat de Qwen con `enable_thinking=true` y, en los rollouts con herramientas, function calling estilo `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas.

El conjunto "mixture-8" suma 11.794 prompts unicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign incorporan definiciones de herramientas sinteticas y se despliegan como trayectorias multi-turno contra un simulador de herramientas, con las salidas de herramienta enmascaradas en la perdida. El horario previsto es una epoca con padding sobre los 11.794 prompts (1574 actualizaciones), con checkpoints cada 40; este snapshot corresponde a la epoca 2 del run lr1e-6, reanudado en la actualizacion 787 desde su checkpoint final con nuevo barajado de prompts (semilla 43).

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo thinking activable (`enable_thinking=true`).
- Razonamiento multi-paso en el contexto de seguridad y consejo dificil (datasets difficult_advice y star1_gp3).
- Generacion de codigo, con entrenamiento especifico sobre codesafetybench y magicoder.
- Tool calling / function calling con el formato `qwen3_coder`, incluyendo trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento agéntico: los datos AgentAlign (harmful y benign) entrenan respuestas seguras a lo largo de trayectorias completas de uso de herramientas.
- Capacidad multimodal heredada del base (image-text-to-text), aunque la torre de vision no fue entrenada en este proceso.
- Resistencia a jailbreaks benignos (wildjailbreak_benign) y a prompts de seguridad tipo star (star1_gp3, star_benign_v2).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en RL de seguridad: sirve como checkpoint de referencia para reproducir o comparar recetas GRPO con recompensa binaria de juez, dado que la model card publica las curvas de recompensa por dataset a lo largo de las actualizaciones.
- Evaluacion de robustez frente a jailbreaks: el entrenamiento con wildjailbreak_benign y star_benign_v2 permite medir la tasa de rechazo y la utilidad en prompts benignos que imitan ataques.
- Filtrado y moderacion de codigo: el ajuste sobre codesafetybench y magicoder lo hace adecuado para experimentar con clasificacion de peticiones de codigo potencialmente peligrosas frente a generacion de codigo legitimo.
- Agentes con herramientas en entornos simulados: los 4000 prompts de AgentAlign con definiciones sinteticas permiten probar politicas de uso seguro de herramientas en trayectorias multi-turno.
- Asistencia en consejo sensible: el dataset difficult_advice entrena respuestas cautas ante consultas delicadas, util para prototipar asistentes de orientacion con salvaguardas.
- Base para ablaciones de hiperparametros: al ser un checkpoint intermedio con configuracion documentada (lr 1e-6, KL 0.001, 15x8 rollouts), es util para estudiar el efecto del coeficiente KL y del tamano de grupo en la alineacion.
- Prototipado de pipelines de generacion con thinking mode: permite validar plantillas de chat y decodificacion con hasta 32.768 tokens generados antes de pasar a un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta la recompensa media binaria del juez durante el entrenamiento (antes de normalizacion por grupo), con 1200 rollouts juzgados por ventana de 10 actualizaciones:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0,808 | 1200 |
| 830-840 | 0,815 | 1200 |
| 870-880 | 0,855 | 1200 |
| 910-920 | 0,877 | 1200 |
| 950-960 | 0,853 | 1200 |
| 990-1000 | 0,808 | 1200 |
| 1030-1040 | 0,828 | 1200 |
| 1070-1080 | 0,812 | 1200 |
| 1110-1120 | 0,820 | 1200 |
| 1150-1160 | 0,853 | 1200 |
| 1190-1200 | 0,841 | 1200 |

Desglose por dataset en la ultima ventana (1190-1200): agentalign_benign 0,67; agentalign_harmful 0,90; codesafetybench 0,97; difficult_advice 0,83; magicoder 0,75; star1_gp3 0,99; star_benign_v2 0,93; wildjailbreak_benign 0,85. Destaca la alta volatilidad de magicoder a lo largo del entrenamiento (0,26 en la ventana 830-840 frente a 0,87 en 910-920) y la mejora sostenida de codesafetybench hasta 0,99 en 1150-1160.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y KV cache; en la practica se recomienda entre 12 y 16 GB en bf16 para contexto moderado.
- Cuantizacion: la model card no publica versiones GGUF ni AWQ/GPTQ; seria necesario generarlas a partir de los safetensors bf16. En 8 bits cabria en GPUs de 8-10 GB y en 4 bits en torno a 4-6 GB, aunque estos valores son estimaciones a partir del tamano de pesos, no datos publicados.
- GPU recomendadas: el entrenamiento se hizo en 1x NVIDIA B200 con el juez en 2x A100 (SGLang TP2). Para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren el modelo en bf16 con holgura; una A100 o H100 permiten mayor contexto y throughput.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB en bf16 y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (ruta oficial documentada con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`), vLLM y TGI para servir en produccion, llama.cpp/Ollama solo tras conversion a GGUF (no publicada). El entrenamiento uso SGLang para rollouts, por lo que SGLang es una opcion natural para servir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning Qwen3.5-4B GRPO) | 4,66 B | 40.960 en entrenamiento | RL de seguridad (GRPO, recompensa binaria de juez) sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks ni de otros checkpoints de seguridad comparables del mismo tamano, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 1200 de 1574 previstos), no un modelo final; el autor indica explicitamente que el entrenamiento sigue en curso.
- La recompensa del juez es un proxy binario generado por otro modelo (Qwen3.8-27B); puede heredar sesgos del juez y no garantiza seguridad real fuera de la distribucion de prompts de entrenamiento.
- Alta volatilidad observada en algunos datasets (magicoder cae a 0,26 en una ventana y agentalign_benign oscila entre 0,61 y 0,73), lo que sugiere inestabilidad del comportamiento agéntico.
- Riesgo de alucinacion inherente al modelo base; el ajuste RL de seguridad no lo mitiga.
- Idiomas soportados no documentados; no hay garantia de comportamiento seguro fuera del ingles.
- La torre de vision y la cabeza MTP no fueron entrenadas: las capacidades multimodales son las del base sin ajuste de seguridad especifico.
- Aunque la licencia es Apache 2.0, el uso comercial de un checkpoint de investigacion intermedio no esta validado por evaluaciones independientes; conviene auditar antes de desplegar.
- No se publican versiones cuantizadas ni artefactos GGUF; el despliegue en hardware limitado requiere conversion propia.
- El contexto de 40.960 tokens corresponde a la configuracion de muestreo del entrenamiento, no necesariamente al maximo soportado por el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1200
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
